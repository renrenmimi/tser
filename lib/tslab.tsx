"use client";

// <TsLab> —— 浏览器里的真 TypeScript 实验室。
//
// 和 <CodeBlock> 的区别:CodeBlock 是给人看的死代码;TsLab 里的代码可以改,
// 每次改动都交给真正的 tsc(worker 里的 LanguageService)检查:
//   · 波浪线画在编译器给的精确字符范围上;
//   · 报错文案是 tsc 原样输出(含 TS 错误码和 main.ts(行,列) 前缀);
//   · 点任意标识符,显示编译器推断出的类型(getQuickInfoAtPosition);
//   · 「编译产物」页签是真的 emit 结果 —— 类型擦除不用讲,自己看;
//   · 开关 strict 家族,同一段代码的结论当场变。
//
// 编译器按需加载(首次传输约 2 MB,之后走浏览器缓存)。加载期间与加载失败时,
// 状态显示在编辑区上方的一条横幅里,不遮住代码:代码照常可读、可选中;失败时横幅给出
// 重试按钮和带着当前代码的官方 Playground 链接,课程内容不受影响。
//
// 键盘:编辑器里 Tab 缩进(有选区时整行缩进),Shift+Tab 反缩进;先按 Esc 再按 Tab
// 或 Shift+Tab,焦点离开编辑器。读屏软件只听到一句报错数量的摘要,而不是整张列表。

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { highlight, type Tok, type TokType } from "@/lib/highlight";
import { useL, useLang, type Loc } from "@/lib/i18n";
import {
  useTsLab,
  type TsDiagnostic,
  type TsFlags,
  type TsQuickInfo,
  type TsTarget,
} from "@/lib/tslab-client";

/* ---------------- 波浪线:把 token 按诊断范围切开 ---------------- */

interface Seg {
  t: TokType;
  s: string;
  bad: boolean;
}

interface Range {
  start: number;
  end: number;
}

/** 高亮结果 × 诊断范围 → 每行的片段序列(bad 的那段画波浪线)。 */
function segmentize(lines: Tok[][], ranges: Range[]): Seg[][] {
  let off = 0;
  const inRange = (pos: number) =>
    ranges.some((r) => pos >= r.start && pos < r.end);

  return lines.map((toks) => {
    const out: Seg[] = [];
    for (const tok of toks) {
      let buf = "";
      let bufBad = inRange(off);
      for (let i = 0; i < tok.s.length; i++) {
        const bad = inRange(off + i);
        if (bad !== bufBad && buf) {
          out.push({ t: tok.t, s: buf, bad: bufBad });
          buf = "";
        }
        bufBad = bad;
        buf += tok.s[i];
      }
      if (buf) out.push({ t: tok.t, s: buf, bad: bufBad });
      off += tok.s.length;
    }
    off += 1; // 行尾的 \n
    return out;
  });
}

/* ---------------- 文案 ---------------- */

const TXT = {
  loadingCompiler: {
    en: "Loading the real TypeScript compiler…",
    zh: "正在加载真正的 TypeScript 编译器…",
  },
  loadingLibs: {
    en: "Reading the declaration files (lib.d.ts)…",
    zh: "正在读取声明文件(lib.d.ts)…",
  },
  firstTimeHint: {
    en: "About 2 MB to download, once. Cached from then on.",
    zh: "首次下载约 2 MB,之后从缓存读取。",
  },
  start: { en: "Run the real compiler", zh: "运行真编译器" },
  startHint: {
    en: "TypeScript itself, in a background thread. About 2 MB to download, once.",
    zh: "TypeScript 本体,在后台线程运行。首次下载约 2 MB。",
  },
  failed: {
    en: "The compiler could not be loaded here.",
    zh: "这里没能加载编译器。",
  },
  failedHint: {
    en: "The code below is still correct. Run it in the official Playground.",
    zh: "下面的代码本身没有问题,可以在官方 Playground 中运行。",
  },
  notRunning: { en: "compiler not running", zh: "编译器未运行" },
  inspectOff: {
    en: "The compiler is not running, so no types can be shown.",
    zh: "编译器没有运行,无法显示推断出的类型。",
  },
  keyHint: {
    en: "Tab indents · Esc, then Tab, leaves the editor",
    zh: "Tab 缩进 · 先按 Esc 再按 Tab 离开编辑器",
  },
  verBadge: {
    en: "The compiler running in your browser",
    zh: "在你的浏览器中运行的编译器",
  },
  openPlayground: { en: "Open in Playground", zh: "在 Playground 打开" },
  retry: { en: "Try again", zh: "再试一次" },
  noErrors: { en: "No errors. tsc is happy.", zh: "没有报错,tsc 通过。" },
  errorCount: (n: number): Loc<string> => ({
    en: `${n} ${n === 1 ? "error" : "errors"}`,
    zh: `${n} 处报错`,
  }),
  checking: { en: "checking…", zh: "检查中…" },
  tabProblems: { en: "Problems", zh: "报错" },
  tabJs: { en: "Compiled JS", zh: "编译产物 JS" },
  tabDts: { en: "Declaration .d.ts", zh: "声明文件 .d.ts" },
  reset: { en: "Reset", zh: "还原" },
  inspectHint: {
    en: "Click any name in the code to see the type TypeScript inferred.",
    zh: "点代码里的任意名字,看 TypeScript 推断出的类型。",
  },
  inspectEmpty: {
    en: "No type information at the cursor.",
    zh: "光标处没有类型信息。",
  },
  emitSkipped: {
    en: "The compiler wrote no output for this code.",
    zh: "编译器没有为这段代码写出产物。",
  },
  erasureNote: {
    en: "Every type annotation is gone. This is what actually runs.",
    zh: "所有类型注解都被删除了。真正运行的是这一份。",
  },
  target: { en: "target", zh: "target" },
  // Shown instead of the lesson note once the learner has edited the sample.
  edited: { en: "edited", zh: "已编辑" },
  editedWith: (codes: string): Loc<string> => ({
    en: `edited \u00b7 ${codes}`,
    zh: `已编辑 \u00b7 ${codes}`,
  }),
} as const;

/** "TS2322" / "TS2322, TS2345" / "TS2322, TS2345 +2" — codes straight from tsc. */
function formatCodes(codes: number[]): string {
  const shown = codes.slice(0, 2).map((c) => `TS${c}`).join(", ");
  return codes.length > 2 ? `${shown} +${codes.length - 2}` : shown;
}

const TARGET_OPTIONS: TsTarget[] = ["es5", "es2015", "es2020", "es2022", "esnext"];

/** strict 打开时,这几项默认就是开的 —— 开关的显示要如实反映这一点。 */
const STRICT_FAMILY = new Set<string>([
  "noImplicitAny",
  "strictNullChecks",
  "strictFunctionTypes",
  "strictBindCallApply",
  "strictPropertyInitialization",
  "noImplicitThis",
  "useUnknownInCatchVariables",
  "alwaysStrict",
]);

/** 官方 Playground 的地址,带上当前代码(Playground 读取 #src= 后的 URL 编码源码)。 */
export function playgroundUrl(source: string): string {
  return `https://www.typescriptlang.org/play/#src=${encodeURIComponent(source)}`;
}

/** 把 [from, to) 换成 text,并保留浏览器自己的撤销记录(做不到时退回直接改值)。 */
function replaceRange(
  ta: HTMLTextAreaElement,
  from: number,
  to: number,
  text: string,
  fallback: (next: string) => void,
) {
  ta.setSelectionRange(from, to);
  const viaUndoStack =
    typeof document.execCommand === "function" &&
    document.execCommand("insertText", false, text);
  if (!viaUndoStack) fallback(ta.value.slice(0, from) + text + ta.value.slice(to));
}

/* ---------------- 组件 ---------------- */

export interface TsLabPreset {
  label: Loc<string>;
  /** 预设的代码;带注释的预设按语言给两份 */
  code: Loc<string>;
}

export function TsLab({
  code,
  // 编译器内部固定用 main.ts 报位置,窗口名跟着它,别让读者看到两个名字
  title = "main.ts",
  flags: initialFlags,
  toggles,
  targets = false,
  emit = false,
  inspect = true,
  note,
  presets,
}: {
  /** 初始源码 */
  code: Loc<string>;
  /** 代码窗标题,默认 main.ts —— 报错前缀也是这个名字 */
  title?: Loc<string>;
  /** 初始编译开关 */
  flags?: TsFlags;
  /** 要暴露成开关的编译选项(章节自选,如 ["strict","noUncheckedIndexedAccess"]) */
  toggles?: (keyof TsFlags)[];
  /** 是否显示 target 选择器 */
  targets?: boolean;
  /** 产物页签:js 看类型擦除,dts 看自动生成的声明文件 */
  emit?: false | "js" | "dts" | "both";
  /** 点代码看推断类型(默认开) */
  inspect?: boolean;
  note?: Loc<ReactNode>;
  /** 一键换稿:常用于「出错的写法 / 修好的写法」对照 */
  presets?: TsLabPreset[];
}) {
  const L = useL();
  const { lang } = useLang();
  const ts = useTsLab();

  const initialCode = L(code);
  const [source, setSource] = useState(initialCode);
  const [flags, setFlags] = useState<TsFlags>(initialFlags ?? {});
  const [diagnostics, setDiagnostics] = useState<TsDiagnostic[] | null>(null);
  // 诊断对应的那份源码:源码一变,旧诊断的字符偏移就不再可信
  const [diagFor, setDiagFor] = useState<string | null>(null);
  // 给读屏软件的一句摘要,只在检查完成且内容变化时更新
  const [liveSummary, setLiveSummary] = useState("");
  const [checking, setChecking] = useState(false);
  const [ms, setMs] = useState<number | null>(null);
  const [info, setInfo] = useState<TsQuickInfo | null>(null);
  const [infoAsked, setInfoAsked] = useState(false);
  const [tab, setTab] = useState<"problems" | "js" | "dts">("problems");
  const [output, setOutput] = useState<{ js: string | null; dts: string | null }>(
    { js: null, dts: null },
  );

  const rootRef = useRef<HTMLDivElement | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const runId = useRef(0);
  // 刚按过 Esc:下一次 Tab / Shift+Tab 交还给浏览器移动焦点
  const tabEscape = useRef(false);
  const uid = useId();

  // Whether the learner has moved away from the sample this lab shipped with.
  // Tracked against the sample text itself, never inferred from the diagnostics:
  // a different error count does not mean the learner typed anything, and an
  // identical error count does not mean they did not.
  const [dirty, setDirty] = useState(false);
  const originalRef = useRef(initialCode);

  /** The only place `source` is written, so `dirty` cannot drift away from it. */
  const applySource = useCallback((next: string) => {
    setSource(next);
    setDirty(next !== originalRef.current);
    setInfo(null);
  }, []);

  // 语言切换时,如果用户还没动过代码,就跟着换成该语言的示例
  useEffect(() => {
    const sample = L(code);
    originalRef.current = sample;
    if (!dirty) setSource(sample);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  /* 进入视口就预热编译器,别让用户点了才开始下载 */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      ts.warm();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          ts.warm();
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 源码或开关变了 → 防抖后交给真编译器 */
  useEffect(() => {
    if (ts.status !== "ready") return;
    const mine = ++runId.current;
    const checked = source;
    setChecking(true);
    const timer = window.setTimeout(() => {
      ts.check(checked, flags)
        .then((r) => {
          if (mine !== runId.current) return;
          setDiagnostics(r.diagnostics);
          setDiagFor(checked);
          setMs(r.ms);
          setChecking(false);
          const n = r.diagnostics.filter((d) => d.severity === "error").length;
          setLiveSummary(n > 0 ? L(TXT.errorCount(n)) : L(TXT.noErrors));
        })
        .catch(() => {
          if (mine !== runId.current) return;
          setChecking(false);
        });
    }, 220);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, flags, ts.status]);

  /* 产物页签打开时,取真实 emit 结果 */
  useEffect(() => {
    if (ts.status !== "ready" || tab === "problems") return;
    let live = true;
    const timer = window.setTimeout(() => {
      ts.emit(source, flags)
        .then((r) => {
          if (live) setOutput({ js: r.js, dts: r.dts });
        })
        .catch(() => {
          /* 保持上一次产物 */
        });
    }, 240);
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, flags, tab, ts.status]);

  /* 点代码 → 问编译器这里是什么类型 */
  const askInfo = useCallback(() => {
    if (!inspect || ts.status !== "ready") return;
    const ta = taRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    setInfoAsked(true);
    ts.quickInfo(source, pos, flags)
      .then(setInfo)
      .catch(() => setInfo(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspect, ts.status, source, flags]);

  const errors = diagnostics ?? [];
  const errorCount = errors.filter((d) => d.severity === "error").length;
  // 诊断是否针对屏幕上这份源码。输入之后、新结果到达之前不画波浪线,
  // 免得旧的字符范围落在新文本的无关位置上。
  const fresh = diagFor === source;

  const ranges = useMemo<Range[]>(
    () =>
      fresh
        ? errors.map((d) => ({
            start: d.start,
            // 零长度诊断也要看得见
            end: d.start + Math.max(1, d.length),
          }))
        : [],
    [errors, fresh],
  );

  const segLines = useMemo(
    () => segmentize(highlight(source, "ts"), ranges),
    [source, ranges],
  );

  const errorLines = useMemo(
    () => new Set(fresh ? errors.map((d) => d.line) : []),
    [errors, fresh],
  );

  /* The lesson note describes the sample this lab shipped with ("one error, and
     it is on the parameter"). The moment the learner edits the code that
     sentence can be false while the compiler reports something else entirely,
     so it is dropped and replaced by a neutral marker carrying the codes tsc
     actually returned. No prose is generated for a diagnostic: the message,
     code and location in the list above stay the authority. */
  const liveCodes = useMemo(() => {
    const seen: number[] = [];
    for (const d of errors) if (!seen.includes(d.code)) seen.push(d.code);
    return seen;
  }, [errors]);

  const statusNote: ReactNode = dirty
    ? diagnostics === null
      ? null
      : liveCodes.length > 0
        ? L(TXT.editedWith(formatCodes(liveCodes)))
        : L(TXT.edited)
    : note
      ? L(note)
      : null;

  /** 点诊断 → 在编辑器里选中出问题的那段 */
  const revealDiagnostic = useCallback((d: TsDiagnostic) => {
    const ta = taRef.current;
    if (!ta) return;
    ta.focus();
    ta.setSelectionRange(d.start, d.start + Math.max(1, d.length));
  }, []);

  /** Tab 缩进、Shift+Tab 反缩进;刚按过 Esc 时,Tab 交还给浏览器移动焦点(不做键盘陷阱)。 */
  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Escape") {
        tabEscape.current = true;
        return;
      }
      if (e.key !== "Tab") {
        tabEscape.current = false;
        return;
      }
      if (tabEscape.current) {
        tabEscape.current = false;
        return; // 不阻止默认行为:焦点移到下一个(或上一个)控件
      }
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      const ta = e.currentTarget;
      const { selectionStart: s, selectionEnd: end, value } = ta;
      const multiLine = value.slice(s, end).includes("\n");

      if (!e.shiftKey && !multiLine) {
        replaceRange(ta, s, end, "  ", applySource);
        requestAnimationFrame(() => ta.setSelectionRange(s + 2, s + 2));
        return;
      }

      // 选区涉及的每一整行一起缩进或反缩进
      const from = value.lastIndexOf("\n", s - 1) + 1;
      const last = end > s && value[end - 1] === "\n" ? end - 1 : end;
      const nl = value.indexOf("\n", last);
      const to = nl === -1 ? value.length : nl;
      const lines = value.slice(from, to).split("\n");
      const shifted = e.shiftKey
        ? lines.map((l) => l.replace(/^ {1,2}/, ""))
        : lines.map((l) => "  " + l);
      const block = shifted.join("\n");
      if (block === value.slice(from, to)) return; // 没有可以去掉的缩进
      replaceRange(ta, from, to, block, applySource);
      const removedOnFirst = lines[0].length - shifted[0].length;
      requestAnimationFrame(() =>
        multiLine
          ? ta.setSelectionRange(from, from + block.length)
          : ta.setSelectionRange(
              Math.max(from, s - removedOnFirst),
              Math.max(from, s - removedOnFirst),
            ),
      );
    },
    [applySource],
  );

  // idle 和 loading 要分开:idle 时给一个明确的启动按钮 —— 视口观察在
  // 后台标签页/隐藏容器里不会触发,不能让实验室永远停在「加载中」。
  const idle = ts.status === "idle";
  const loading = ts.status === "loading";
  const failed = ts.status === "error";

  // 页签:roving tabindex,左右方向键与 Home / End 切换(WAI-ARIA tabs 模式)
  const tabOrder: ("problems" | "js" | "dts")[] = [
    "problems",
    ...(emit === "js" || emit === "both" ? (["js"] as const) : []),
    ...(emit === "dts" || emit === "both" ? (["dts"] as const) : []),
  ];
  const tabId = (t: string) => `${uid}-tab-${t}`;
  const panelId = `${uid}-panel`;
  const hintId = `${uid}-keys`;
  const onTabKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const i = tabOrder.indexOf(tab);
    const next =
      e.key === "ArrowRight"
        ? tabOrder[(i + 1) % tabOrder.length]
        : e.key === "ArrowLeft"
          ? tabOrder[(i - 1 + tabOrder.length) % tabOrder.length]
          : e.key === "Home"
            ? tabOrder[0]
            : e.key === "End"
              ? tabOrder[tabOrder.length - 1]
              : null;
    if (!next) return;
    e.preventDefault();
    setTab(next);
    document.getElementById(tabId(next))?.focus();
  };

  return (
    <div
      className="tsl"
      ref={rootRef}
      data-tab={tab}
      data-dirty={dirty ? "1" : "0"}
    >
      {/* 顶栏:文件名 + 版本 + 页签 */}
      <div className="tsl-bar">
        <span className="tsl-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="tsl-name">{L(title)}</span>
        <span className="tsl-bar-tail">
          {ts.version && (
            <span className="tsl-ver" title={L(TXT.verBadge)}>
              tsc {ts.version}
            </span>
          )}
          {presets && presets.length > 0 && (
            <span className="tsl-presets">
              {presets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  className="tsl-chip"
                  onClick={() => applySource(L(p.code))}
                >
                  {L(p.label)}
                </button>
              ))}
            </span>
          )}
          {dirty && (
            <button
              type="button"
              className="tsl-chip"
              onClick={() => applySource(initialCode)}
            >
              {L(TXT.reset)}
            </button>
          )}
        </span>
      </div>

      {/* 编译开关 */}
      {(toggles?.length || targets) && (
        <div className="tsl-flags">
          {targets && (
            <label className="tsl-target">
              <span>{L(TXT.target)}</span>
              <select
                value={flags.target ?? "es2022"}
                onChange={(e) =>
                  setFlags((f) => ({ ...f, target: e.target.value as TsTarget }))
                }
              >
                {TARGET_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          )}
          {toggles?.map((key) => {
            // 没显式设置时:strict 本身默认开启(与 worker 一致),
            // strict 家族成员跟着 strict 走(和 tsconfig 一致)
            const on =
              typeof flags[key] === "boolean"
                ? flags[key] === true
                : key === "strict"
                  ? true
                  : STRICT_FAMILY.has(String(key)) && flags.strict !== false;
            return (
              <button
                key={String(key)}
                type="button"
                className={`tsl-flag${on ? " on" : ""}`}
                aria-pressed={on}
                onClick={() =>
                  setFlags((f) => ({ ...f, [key]: !on }) as TsFlags)
                }
              >
                <span className="tsl-flag-box" aria-hidden>
                  {on ? "✓" : ""}
                </span>
                {String(key)}
              </button>
            );
          })}
        </div>
      )}

      {/* 加载 / 失败横幅:放在编辑区上方,不遮住代码 */}
      {(idle || loading || failed) && (
        <div className="tsl-banner" data-state={ts.status}>
          {idle && (
            <>
              <button type="button" className="tsl-start" onClick={ts.warm}>
                ▶ {L(TXT.start)}
              </button>
              <small>{L(TXT.startHint)}</small>
            </>
          )}
          {loading && (
            <>
              <span className="tsl-spin" aria-hidden />
              <div>
                <b>
                  {L(ts.phase === "libs" ? TXT.loadingLibs : TXT.loadingCompiler)}
                </b>
                <small>{L(TXT.firstTimeHint)}</small>
              </div>
            </>
          )}
          {failed && (
            <>
              <div>
                <b>{L(TXT.failed)}</b>
                <small>{L(TXT.failedHint)}</small>
              </div>
              <span className="tsl-banner-actions">
                <button type="button" className="tsl-chip" onClick={ts.retry}>
                  {L(TXT.retry)}
                </button>
                <a
                  className="tsl-chip"
                  href={playgroundUrl(source)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {L(TXT.openPlayground)} ↗
                </a>
              </span>
            </>
          )}
        </div>
      )}

      {/* 编辑器:高亮层在下,透明 textarea 在上。
          行号用高亮层里的绝对定位伪元素画在左侧留白上 —— 这样折行时
          续行不会多出号码,而且和 textarea 的光标永远对齐。 */}
      <div className="tsl-editor">
        <div className="tsl-code">
          <pre className="tsl-hl" aria-hidden>
            {segLines.map((segs, i) => (
              <div
                key={i}
                className="tsl-line"
                data-n={i + 1}
                data-bad={errorLines.has(i + 1) ? "1" : undefined}
              >
                {segs.map((seg, j) => (
                  <span
                    key={j}
                    className={
                      (seg.t ? `tk-${seg.t}` : "") + (seg.bad ? " tsl-sq" : "")
                    }
                  >
                    {seg.s}
                  </span>
                ))}
                {segs.length === 0 && " "}
              </div>
            ))}
          </pre>
          <textarea
            ref={taRef}
            className="tsl-ta"
            value={source}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            wrap="off"
            aria-label={lang === "zh" ? "可编辑的 TypeScript 代码" : "editable TypeScript code"}
            aria-describedby={hintId}
            onChange={(e) => applySource(e.target.value)}
            onKeyDown={onKeyDown}
            // 动手就是最明确的意图信号 —— 视口观察没触发时,这里兜底
            onFocus={ts.warm}
            onClick={askInfo}
            onKeyUp={(e) => {
              if (e.key.startsWith("Arrow")) askInfo();
            }}
          />
          <span className="tsl-keyhint" id={hintId}>
            {L(TXT.keyHint)}
          </span>
        </div>

      </div>

      {/* 推断类型 */}
      {inspect && (
        <div className="tsl-inspect">
          {info ? (
            <>
              <span className="tsl-inspect-tag">{info.kind || "type"}</span>
              <code>{info.text}</code>
            </>
          ) : (
            <span className="tsl-inspect-idle">
              {L(
                failed
                  ? TXT.inspectOff
                  : infoAsked
                    ? TXT.inspectEmpty
                    : TXT.inspectHint,
              )}
            </span>
          )}
        </div>
      )}

      {/* 页签 */}
      {emit !== false && (
        <div className="tsl-tabs" role="tablist" onKeyDown={onTabKey}>
          <button
            type="button"
            role="tab"
            id={tabId("problems")}
            aria-selected={tab === "problems"}
            aria-controls={panelId}
            tabIndex={tab === "problems" ? 0 : -1}
            className={tab === "problems" ? "on" : ""}
            onClick={() => setTab("problems")}
          >
            {L(TXT.tabProblems)}
            {errorCount > 0 && <b className="tsl-badge">{errorCount}</b>}
          </button>
          {(emit === "js" || emit === "both") && (
            <button
              type="button"
              role="tab"
              id={tabId("js")}
              aria-selected={tab === "js"}
              aria-controls={panelId}
              tabIndex={tab === "js" ? 0 : -1}
              className={tab === "js" ? "on" : ""}
              onClick={() => setTab("js")}
            >
              {L(TXT.tabJs)}
            </button>
          )}
          {(emit === "dts" || emit === "both") && (
            <button
              type="button"
              role="tab"
              id={tabId("dts")}
              aria-selected={tab === "dts"}
              aria-controls={panelId}
              tabIndex={tab === "dts" ? 0 : -1}
              className={tab === "dts" ? "on" : ""}
              onClick={() => setTab("dts")}
            >
              {L(TXT.tabDts)}
            </button>
          )}
        </div>
      )}

      {/* 面板 */}
      <div
        className="tsl-panel"
        id={panelId}
        role={emit !== false ? "tabpanel" : undefined}
        aria-labelledby={emit !== false ? tabId(tab) : undefined}
        tabIndex={emit !== false && tab !== "problems" ? 0 : undefined}
      >
        {tab === "problems" ? (
          <div className="tsl-diags" data-stale={fresh ? undefined : "1"}>
            {!diagnostics && !loading && !failed && (
              <div className="tsl-diag-idle">{L(TXT.checking)}</div>
            )}
            {diagnostics && errors.length === 0 && (
              <div className="tsl-ok">
                <span aria-hidden>✓</span> {L(TXT.noErrors)}
              </div>
            )}
            {errors.map((d, i) => (
              <button
                type="button"
                key={i}
                className={`tsl-diag ${d.severity}`}
                // 悬停能看到 tsc 命令行会打印的原样一行
                title={d.cli}
                onClick={() => revealDiagnostic(d)}
              >
                <span className="tsl-diag-at">
                  {d.line}:{d.col}
                </span>
                <span className="tsl-diag-code">TS{d.code}</span>
                <span className="tsl-diag-msg">
                  {d.message}
                  {d.related.length > 0 && (
                    <span className="tsl-diag-rel">
                      {d.related.map((r, k) => (
                        <span key={k}>
                          {r.line ? `${r.line}:${r.col} · ` : ""}
                          {r.message}
                        </span>
                      ))}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <OutputView
            text={tab === "js" ? output.js : output.dts}
            lang={tab === "js" ? "js" : "dts"}
            pending={L(TXT.checking)}
            empty={L(TXT.emitSkipped)}
            hint={tab === "js" ? L(TXT.erasureNote) : undefined}
          />
        )}
      </div>

      {/* 状态条 */}
      <div className="tsl-status">
        <span className={errorCount > 0 ? "tsl-st-bad" : "tsl-st-ok"}>
          {failed
            ? L(TXT.notRunning)
            : checking
              ? L(TXT.checking)
              : diagnostics
                ? errorCount > 0
                  ? L(TXT.errorCount(errorCount))
                  : L(TXT.noErrors)
                : ""}
        </span>
        <span className="tsl-sr" role="status">
          {liveSummary}
        </span>
        {ms !== null && !checking && <span className="tsl-st-ms">{ms} ms</span>}
        {statusNote !== null && (
          <span
            className={`tsl-st-note${dirty ? " tsl-st-live" : ""}`}
            data-live={dirty ? "1" : undefined}
          >
            {statusNote}
          </span>
        )}
      </div>
    </div>
  );
}

/** 产物视图:真实 emit 出来的 JS / .d.ts。 */
function OutputView({
  text,
  lang,
  pending,
  empty,
  hint,
}: {
  /** null:结果还没回来;空字符串:编译器确实没有写出产物 */
  text: string | null;
  lang: "js" | "dts";
  pending: string;
  empty: string;
  hint?: string;
}) {
  const lines = useMemo(
    () => (text ? highlight(text.replace(/\n+$/, ""), lang) : []),
    [text, lang],
  );

  if (text === null) return <div className="tsl-diag-idle">{pending}</div>;
  if (!text) return <div className="tsl-diag-idle">{empty}</div>;

  return (
    <div className="tsl-out">
      {hint && <div className="tsl-out-hint">{hint}</div>}
      <pre className="tsl-out-code">
        {lines.map((toks, i) => (
          <div key={i} className="tsl-line">
            <span className="tsl-out-n" aria-hidden>
              {i + 1}
            </span>
            <span>
              {toks.map((tok, j) =>
                tok.t ? (
                  <span key={j} className={`tk-${tok.t}`}>
                    {tok.s}
                  </span>
                ) : (
                  <span key={j}>{tok.s}</span>
                ),
              )}
              {toks.length === 0 && " "}
            </span>
          </div>
        ))}
      </pre>
    </div>
  );
}
