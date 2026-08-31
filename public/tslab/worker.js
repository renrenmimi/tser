/* TSer 实验室的编译器 worker —— 在后台线程里跑真正的 TypeScript。
 *
 * 为什么是 worker:tsc 检查一次要几十到几百毫秒,放主线程会卡住输入和动画。
 * 为什么是 importScripts 而不是 import:编译器 8.7 MB,不进页面 bundle,
 * 按需从 /tslab/<版本>/typescript.js 加载,浏览器永久缓存。
 *
 * 用的是 LanguageService(不是一次性的 createProgram):它跨请求复用已解析的
 * lib.d.ts,所以第一次慢(要解析 2.4 MB 声明文件),之后每次改代码都很快。
 *
 * 协议(主线程 lib/tslab-client.tsx):
 *   → { id, kind: "init", compiler, libs }
 *   → { id, kind: "check"     , code, options }
 *   → { id, kind: "quickinfo" , code, options, pos }
 *   → { id, kind: "emit"      , code, options }
 *   ← { id, ok: true, ... } / { id, ok: false, error }
 *   ← { kind: "progress", phase }              无 id,加载进度广播
 */

"use strict";

/** 主文件名 —— 报错前缀就是它,和 tsc 的 `main.ts(3,7): error TS…` 对齐。 */
var MAIN = "/main.ts";

var libFiles = null; // { "/lib.es5.d.ts": "…" }
var service = null;
var current = { text: "", version: 0 };
var options = null;
var tsVersion = "";

/* ---------------- 编译选项 ---------------- */

var TARGETS = {
  es5: "ES5",
  es2015: "ES2015",
  es2020: "ES2020",
  es2022: "ES2022",
  esnext: "ESNext",
};

/** target 对应的默认 lib —— 和 tsc 的选择保持一致。 */
function defaultLibName(opts) {
  switch (opts.target) {
    case ts.ScriptTarget.ESNext:
      return "/lib.esnext.full.d.ts";
    case ts.ScriptTarget.ES2015:
      return "/lib.es2015.full.d.ts";
    case ts.ScriptTarget.ES5:
      return "/lib.d.ts";
    case ts.ScriptTarget.ES2016:
    case ts.ScriptTarget.ES2017:
    case ts.ScriptTarget.ES2018:
    case ts.ScriptTarget.ES2019:
    case ts.ScriptTarget.ES2020:
      return "/lib.es2020.full.d.ts";
    default:
      return "/lib.es2022.full.d.ts";
  }
}

/** 把界面传来的朴素开关翻译成真的 CompilerOptions。 */
function buildOptions(flags) {
  var f = flags || {};
  var targetName = TARGETS[String(f.target || "es2022").toLowerCase()] || "ES2022";
  var opts = {
    target: ts.ScriptTarget[targetName],
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    // 实验室里只有一个文件,不做真实模块解析;isolatedModules 让语义更接近打包器
    isolatedModules: true,
    strict: f.strict !== false,
    noEmit: false,
    skipLibCheck: true,
    allowJs: false,
    declaration: true,
    // 单文件环境下这条会误报,关掉
    noUnusedLocals: false,
    noUnusedParameters: false,
  };

  // strict 家族的单项覆盖:只有显式给了 true/false 才写进去,
  // 不给就跟着 strict 走 —— 和 tsconfig 的真实行为一致。
  var members = [
    "noImplicitAny",
    "strictNullChecks",
    "strictFunctionTypes",
    "strictBindCallApply",
    "strictPropertyInitialization",
    "noImplicitThis",
    "useUnknownInCatchVariables",
    "alwaysStrict",
    // strict 之外、需要单独开的两项
    "noUncheckedIndexedAccess",
    "exactOptionalPropertyTypes",
    // 其他常用项
    "noImplicitReturns",
    "noFallthroughCasesInSwitch",
    "erasableSyntaxOnly",
    "experimentalDecorators",
    "verbatimModuleSyntax",
  ];
  for (var i = 0; i < members.length; i++) {
    var k = members[i];
    if (typeof f[k] === "boolean") opts[k] = f[k];
  }
  return opts;
}

/* ---------------- 语言服务 ---------------- */

function createService() {
  var host = {
    getScriptFileNames: function () {
      return [MAIN];
    },
    // 只有 main.ts 会变;lib 文件版本恒定 → SourceFile 跨请求复用
    getScriptVersion: function (f) {
      return f === MAIN ? String(current.version) : "1";
    },
    getScriptSnapshot: function (f) {
      var text = f === MAIN ? current.text : libFiles[f];
      return text === undefined ? undefined : ts.ScriptSnapshot.fromString(text);
    },
    getCurrentDirectory: function () {
      return "/";
    },
    getCompilationSettings: function () {
      return options;
    },
    getDefaultLibFileName: function (opts) {
      return defaultLibName(opts);
    },
    fileExists: function (f) {
      return f === MAIN || Object.prototype.hasOwnProperty.call(libFiles, f);
    },
    readFile: function (f) {
      return f === MAIN ? current.text : libFiles[f];
    },
    directoryExists: function (d) {
      return d === "/" || d === "";
    },
    getDirectories: function () {
      return [];
    },
    readDirectory: function () {
      return [];
    },
  };
  return ts.createLanguageService(host, ts.createDocumentRegistry());
}

/** 更新源码 + 选项;返回是否需要重建程序。 */
function setInput(code, flags) {
  if (typeof code === "string" && code !== current.text) {
    current.text = code;
    current.version += 1;
  }
  options = buildOptions(flags);
}

/* ---------------- 诊断 ---------------- */

function positionOf(file, pos) {
  var lc = file.getLineAndCharacterOfPosition(pos);
  return { line: lc.line + 1, col: lc.character + 1 };
}

function shapeDiagnostic(d, file) {
  var start = typeof d.start === "number" ? d.start : 0;
  var at = positionOf(file, start);
  var message = ts.flattenDiagnosticMessageText(d.messageText, "\n");
  var severity =
    d.category === ts.DiagnosticCategory.Error
      ? "error"
      : d.category === ts.DiagnosticCategory.Warning
        ? "warning"
        : "message";

  var related = [];
  if (d.relatedInformation) {
    for (var i = 0; i < d.relatedInformation.length; i++) {
      var r = d.relatedInformation[i];
      var rMessage = ts.flattenDiagnosticMessageText(r.messageText, "\n");
      var rAt =
        r.file && typeof r.start === "number"
          ? positionOf(r.file, r.start)
          : null;
      related.push({
        message: rMessage,
        // lib.d.ts 里的位置对学习者没意义,只标出自己文件里的
        line: r.file === file && rAt ? rAt.line : null,
        col: r.file === file && rAt ? rAt.col : null,
        inLib: !!(r.file && r.file.fileName !== MAIN),
      });
    }
  }

  return {
    code: d.code,
    severity: severity,
    message: message,
    start: start,
    length: typeof d.length === "number" ? d.length : 0,
    line: at.line,
    col: at.col,
    // tsc 命令行原样输出的一行
    cli:
      "main.ts(" +
      at.line +
      "," +
      at.col +
      "): " +
      severity +
      " TS" +
      d.code +
      ": " +
      message.split("\n")[0],
    related: related,
  };
}

function collectDiagnostics() {
  var program = service.getProgram();
  var file = program.getSourceFile(MAIN);
  if (!file) return [];

  // 语法错误优先:文件都没解析成,语义报错全是连带伤,先让学习者把语法修对
  var syntactic = service.getSyntacticDiagnostics(MAIN);
  var list = syntactic.length ? syntactic : service.getSemanticDiagnostics(MAIN);

  var out = [];
  for (var i = 0; i < list.length; i++) out.push(shapeDiagnostic(list[i], file));
  out.sort(function (a, b) {
    return a.start - b.start;
  });
  return out;
}

/* ---------------- 各类请求 ---------------- */

function handleCheck(msg) {
  setInput(msg.code, msg.options);
  var t0 = Date.now();
  var diagnostics = collectDiagnostics();
  return { diagnostics: diagnostics, ms: Date.now() - t0 };
}

function handleQuickInfo(msg) {
  setInput(msg.code, msg.options);
  var info = service.getQuickInfoAtPosition(MAIN, msg.pos);
  if (!info) return { info: null };
  return {
    info: {
      text: ts.displayPartsToString(info.displayParts),
      docs: ts.displayPartsToString(info.documentation),
      kind: info.kind,
      start: info.textSpan.start,
      length: info.textSpan.length,
    },
  };
}

function handleEmit(msg) {
  setInput(msg.code, msg.options);
  var t0 = Date.now();
  var out = service.getEmitOutput(MAIN);
  var js = null;
  var dts = null;
  for (var i = 0; i < out.outputFiles.length; i++) {
    var f = out.outputFiles[i];
    if (/\.js$/.test(f.name)) js = f.text;
    else if (/\.d\.ts$/.test(f.name)) dts = f.text;
  }
  return {
    js: js,
    dts: dts,
    emitSkipped: out.emitSkipped,
    diagnostics: collectDiagnostics(),
    ms: Date.now() - t0,
  };
}

/* ---------------- 初始化 ---------------- */

function handleInit(msg) {
  if (service) return { version: tsVersion, libCount: Object.keys(libFiles).length };

  // ① 编译器本体(同步加载,worker 里可以)
  importScripts(msg.compiler);
  tsVersion = ts.version;
  self.postMessage({ kind: "progress", phase: "compiler", version: tsVersion });

  // ② 声明文件闭包
  return fetch(msg.libs)
    .then(function (res) {
      if (!res.ok) throw new Error("lib files " + res.status);
      return res.json();
    })
    .then(function (libs) {
      libFiles = libs;
      self.postMessage({ kind: "progress", phase: "libs" });

      // ③ 预热:先空跑一次,把 2.4 MB 声明文件解析掉,
      //    别让用户的第一次按键等在这上面
      options = buildOptions({});
      current = { text: "export const warm = 1;\n", version: 1 };
      service = createService();
      collectDiagnostics();

      return { version: tsVersion, libCount: Object.keys(libFiles).length };
    });
}

/* ---------------- 消息循环 ---------------- */

var HANDLERS = {
  init: handleInit,
  check: handleCheck,
  quickinfo: handleQuickInfo,
  emit: handleEmit,
};

self.onmessage = function (e) {
  var msg = e.data || {};
  var id = msg.id;
  var handler = HANDLERS[msg.kind];

  if (!handler) {
    self.postMessage({ id: id, ok: false, error: "unknown request: " + msg.kind });
    return;
  }
  if (msg.kind !== "init" && !service) {
    self.postMessage({ id: id, ok: false, error: "compiler not ready" });
    return;
  }

  try {
    var result = handler(msg);
    if (result && typeof result.then === "function") {
      result.then(
        function (value) {
          self.postMessage(Object.assign({ id: id, ok: true }, value));
        },
        function (err) {
          self.postMessage({ id: id, ok: false, error: String(err && err.message ? err.message : err) });
        },
      );
    } else {
      self.postMessage(Object.assign({ id: id, ok: true }, result));
    }
  } catch (err) {
    self.postMessage({
      id: id,
      ok: false,
      error: String(err && err.message ? err.message : err),
    });
  }
};
