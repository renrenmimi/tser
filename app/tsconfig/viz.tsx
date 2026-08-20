"use client";

// 10 · tsconfig 与严格模式 专属可视化(双语:文案用 <T en zh />,
// 代码、选项名与编译器报错原文保持不变):
//  - HeroDifficulty:hero 里的「四档严格度」进场动画(纯 CSS)。
//  - StrictPanel:严格度调节台 —— 一段固定的问题代码,五个开关,
//    开一个,对应行亮红、错误浮出。同时演示两条真实依赖:
//    strictPropertyInitialization 不开 strictNullChecks 会被 tsc 拒绝(TS5052),
//    noUncheckedIndexedAccess 不开 strictNullChecks 则完全没有效果。
//  - TargetSwitch:同一份 TS,target 拨到 es5 / es2022,产物对照。
//  - MigrateStepper:一套 JavaScript 点单系统渐进迁移逐帧记。
//
// 所有报错码、报错文案与 es5 产物,均在 TypeScript 5.9.3 下实测。

import { useState, type ReactNode } from "react";
import { CodeLines, CodeBlock, CodePair } from "@/lib/code";
import { useStepper, StepControls } from "@/lib/stepper";
import { T as Tx, useL, type Loc } from "@/lib/i18n";

/* ================= HeroDifficulty ================= */

const DIFFS: { ico: string; name: Loc<string>; sub: Loc<string>; lit: boolean }[] =
  [
    {
      ico: "🎈",
      name: { en: "No checks", zh: "不检查" },
      sub: { en: "plain JavaScript", zh: "纯 JavaScript" },
      lit: false,
    },
    {
      ico: "🕹️",
      name: { en: "Some checks", zh: "查一部分" },
      sub: { en: "TypeScript, strict off", zh: "TypeScript,strict 关" },
      lit: false,
    },
    {
      ico: "🛡️",
      name: { en: "The family", zh: "一整族" },
      sub: { en: "strict: true · 9 checks", zh: "strict: true · 九项检查" },
      lit: false,
    },
    {
      ico: "⚔️",
      name: { en: "Family plus", zh: "再加两项" },
      sub: {
        en: "+ noUncheckedIndexedAccess",
        zh: "+ noUncheckedIndexedAccess",
      },
      lit: true,
    },
  ];

export function HeroDifficulty() {
  const L = useL();
  return (
    <div className="tc-diffs" aria-hidden>
      {DIFFS.map((d, i) => (
        <div
          key={i}
          className={`tc-diff${d.lit ? " lit" : ""}`}
          style={{ animationDelay: `${140 + i * 130}ms` }}
        >
          <span className="ico">{d.ico}</span>
          <span>
            {L(d.name)}
            <small>{L(d.sub)}</small>
          </span>
        </div>
      ))}
    </div>
  );
}

/* ================= StrictPanel ================= */

// 行号约定(两种语言逐字节对齐,只有注释不同):
//   2 → noImplicitAny        9 → strictNullChecks
//  12 → noUncheckedIndexedAccess
//  15 → strictPropertyInitialization
//  21 → useUnknownInCatchVariables
const DEMO_CODE: Loc<string> = {
  en: `// Legacy ordering code. "It works, do not touch it."
function total(items) {
  let sum = 0;
  for (const it of items) sum += it.price;
  return sum;
}

const order = findOrder("A-101"); // declared: Order | null
console.log(order.total);

const sizes = ["small", "medium", "large"];
console.log(sizes[3].toUpperCase());

class Barista {
  name: string; // "I will assign it later"
}

try {
  submit(order);
} catch (e) {
  console.log(e.message);
}`,
  zh: `// 祖传点单代码。「能跑,别动。」
function total(items) {
  let sum = 0;
  for (const it of items) sum += it.price;
  return sum;
}

const order = findOrder("A-101"); // 声明的返回类型:Order | null
console.log(order.total);

const sizes = ["small", "medium", "large"];
console.log(sizes[3].toUpperCase());

class Barista {
  name: string; // 想着「回头再赋值」
}

try {
  submit(order);
} catch (e) {
  console.log(e.message);
}`,
};

interface StrictSwitch {
  id: string;
  name: string;
  /** 是否属于 strict: true 一次打开的家族 */
  family: boolean;
  /** 一句话:它管什么 */
  blurb: Loc<string>;
  line: number;
  code: string;
  msg: string;
  /**
   * 关着 strictNullChecks 时会怎样:
   *  - "reject":tsc 直接拒绝这份配置(TS5052)
   *  - "inert" :选项合法但完全没有效果
   *  - 不填    :照样报错,但报错码可能不同(见 altCode / altMsg)
   */
  needsSnc?: "reject" | "inert";
  altCode?: string;
  altMsg?: string;
}

const SWITCHES: StrictSwitch[] = [
  {
    id: "noImplicitAny",
    name: "noImplicitAny",
    family: true,
    blurb: {
      en: "A value whose type cannot be inferred is an error, not any.",
      zh: "推不出类型时报错,不许悄悄按 any 处理。",
    },
    line: 2,
    code: "TS7006",
    msg: "Parameter 'items' implicitly has an 'any' type.",
  },
  {
    id: "strictNullChecks",
    name: "strictNullChecks",
    family: true,
    blurb: {
      en: "null and undefined stop being assignable to every type.",
      zh: "null 和 undefined 不再能赋给任何类型。",
    },
    line: 9,
    code: "TS18047",
    msg: "'order' is possibly 'null'.",
  },
  {
    id: "strictPropertyInitialization",
    name: "strictPropertyInitialization",
    family: true,
    blurb: {
      en: "A declared class property must be assigned. Needs strictNullChecks.",
      zh: "class 属性声明了就必须赋值。依赖 strictNullChecks。",
    },
    line: 15,
    code: "TS2564",
    msg: "Property 'name' has no initializer and is not definitely assigned in the constructor.",
    needsSnc: "reject",
  },
  {
    id: "useUnknownInCatchVariables",
    name: "useUnknownInCatchVariables",
    family: true,
    blurb: {
      en: "The catch variable is unknown — what was thrown need not be an Error.",
      zh: "catch 变量是 unknown —— throw 出来的未必是 Error。",
    },
    line: 21,
    code: "TS18046",
    msg: "'e' is of type 'unknown'.",
    altCode: "TS2339",
    altMsg: "Property 'message' does not exist on type 'unknown'.",
  },
  {
    id: "noUncheckedIndexedAccess",
    name: "noUncheckedIndexedAccess",
    family: false,
    blurb: {
      en: "An index read has type T | undefined. Needs strictNullChecks.",
      zh: "下标取值的类型变成 T | undefined。依赖 strictNullChecks。",
    },
    line: 12,
    code: "TS2532",
    msg: "Object is possibly 'undefined'.",
    needsSnc: "inert",
  },
];

export function StrictPanel() {
  const L = useL();
  const [on, setOn] = useState<Record<string, boolean>>({});

  const sncOn = !!on.strictNullChecks;
  const active = SWITCHES.filter((s) => on[s.id]);
  /** 真正生效的开关:依赖 strictNullChecks 的那两个,得等它先开 */
  const effective = active.filter((s) => sncOn || !s.needsSnc);
  const blocked = active.filter((s) => !sncOn && s.needsSnc);

  const hlLines = effective.map((s) => s.line);
  const errors = effective.map((s) => ({
    line: s.line,
    code: !sncOn && s.altCode ? s.altCode : s.code,
    msg: !sncOn && s.altMsg ? s.altMsg : s.msg,
    sw: s.name,
  }));
  const caught = errors.length;
  const hidden = SWITCHES.length - caught;
  const allFamilyOn = SWITCHES.filter((s) => s.family).every((s) => on[s.id]);

  const signStrict = () => {
    setOn((prev) => {
      const next = { ...prev };
      for (const s of SWITCHES) if (s.family) next[s.id] = true;
      return next;
    });
  };
  const reset = () => setOn({});

  return (
    <div className="viz tc-strict">
      <div className="viz-title">
        <Tx
          en="One piece of code. The compiler sees exactly as many bugs as the switches allow."
          zh="同一段代码。开关开到哪里,编译器就看见几个 bug。"
        />
      </div>

      <div className="tc-strict-grid">
        <div className="tc-sws">
          {SWITCHES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`tc-sw${on[s.id] ? " on" : ""}`}
              onClick={() => setOn((p) => ({ ...p, [s.id]: !p[s.id] }))}
              aria-pressed={!!on[s.id]}
            >
              <span className="tc-sw-track" aria-hidden>
                <span className="tc-sw-knob" />
              </span>
              <span className="tc-sw-text">
                <span className="tc-sw-name">
                  {s.name}
                  <i
                    className="tc-sw-badge"
                    data-family={s.family ? "yes" : "no"}
                  >
                    {s.family ? (
                      <Tx en="in strict" zh="strict 家族" />
                    ) : (
                      <Tx en="outside strict" zh="strict 之外" />
                    )}
                  </i>
                </span>
                <small>{L(s.blurb)}</small>
              </span>
            </button>
          ))}
          <div className="tc-sw-actions">
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={signStrict}
              disabled={allFamilyOn}
            >
              <Tx en="✍️ Turn on strict: true" zh="✍️ 一键开 strict: true" />
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={reset}
            >
              <Tx en="↻ Turn everything off" zh="↻ 全部关掉" />
            </button>
          </div>
        </div>

        <div className="tc-strict-code">
          <div className="tc-code-bar">
            <span className="mono">order.ts</span>
            <span
              className={`tc-shield${caught === SWITCHES.length ? " full" : ""}`}
            >
              <Tx en="found" zh="抓到" /> {caught} / {SWITCHES.length}
            </span>
          </div>
          <CodeLines code={L(DEMO_CODE)} lang="ts" hl={hlLines} />
        </div>
      </div>

      <div className="tc-errs" aria-live="polite">
        {errors.length === 0 && blocked.length === 0 && (
          <div className="tc-err-zero">
            <Tx
              en="✓ 0 errors — the compiler has nothing to say. Note what that does and does not mean: no error is not the same as no bug. None of the checks that are on can reach these lines."
              zh="✓ 0 errors —— 编译器没有意见。注意它的意思:没有报错不等于没有 bug,只是现在开着的检查一条都管不到这几行。"
            />
          </div>
        )}

        {errors.map((e) => (
          <div key={e.sw} className="tc-err">
            <span className="tc-err-loc">order.ts:{e.line}</span>
            <span className="tc-err-code">{e.code}</span>
            <span className="tc-err-msg">{e.msg}</span>
            <span className="tc-err-by">← {e.sw}</span>
          </div>
        ))}

        {blocked.map((s) => (
          <div key={s.id} className="tc-dep">
            <span className="tc-dep-name">{s.name}</span>
            {s.needsSnc === "reject" ? (
              <Tx
                en={
                  <>
                    is on, but the compiler refuses the configuration:{" "}
                    <b>
                      TS5052: Option
                      &apos;strictPropertyInitialization&apos; cannot be
                      specified without specifying option
                      &apos;strictNullChecks&apos;.
                    </b>{" "}
                    &quot;Never assigned&quot; means &quot;the value is
                    undefined&quot;, and without strictNullChecks that sentence
                    has no meaning.
                  </>
                }
                zh={
                  <>
                    开着,但编译器拒绝这份配置:
                    <b>
                      TS5052: Option
                      &apos;strictPropertyInitialization&apos; cannot be
                      specified without specifying option
                      &apos;strictNullChecks&apos;.
                    </b>
                    「没赋值」的意思就是「值是 undefined」,
                    而 strictNullChecks 关着时这句话根本不成立。
                  </>
                }
              />
            ) : (
              <Tx
                en={
                  <>
                    is on and changes nothing. Without strictNullChecks,{" "}
                    <code>string | undefined</code> collapses back to{" "}
                    <code>string</code>, so adding{" "}
                    <code>| undefined</code> to an index read has no effect.
                    Turn on strictNullChecks and this line starts reporting.
                  </>
                }
                zh={
                  <>
                    开着,但什么也没变。strictNullChecks 关着时,
                    <code>string | undefined</code> 会退回成{" "}
                    <code>string</code>,所以给下标取值加上{" "}
                    <code>| undefined</code> 没有任何作用。
                    把 strictNullChecks 打开,这一行才开始报错。
                  </>
                }
              />
            )}
          </div>
        ))}

        {hidden > 0 && caught > 0 && (
          <div className="tc-err-rest">
            <Tx
              en={<>… {hidden} more bug(s) are still here. Nothing is looking for them.</>}
              zh={<>…还有 {hidden} 个 bug 就在那儿,现在没人在找它们。</>}
            />
          </div>
        )}

        {caught === SWITCHES.length && (
          <div className="tc-err-full">
            <Tx
              en={
                <>
                  🏆 All five bugs are now compile errors. Look at the last
                  switch: <code>noUncheckedIndexedAccess</code> is{" "}
                  <b>not part of strict: true</b>. The button above turns on the
                  four family members and leaves that one alone — you have to
                  enable it yourself.
                </>
              }
              zh={
                <>
                  🏆 五个 bug 现在全是编译错误。看最后一个开关:
                  <code>noUncheckedIndexedAccess</code>{" "}
                  <b>不属于 strict: true</b>。上面那个按钮只打开四个家族成员,
                  这一个不动 —— 它得你自己开。
                </>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= TargetSwitch ================= */

const TARGET_SRC = `const label = (n: number, unit = "cup") => \`\${n} \${unit}\`;

const [first, ...rest] = ["boba", "jelly"];

class Cup {
  constructor(public size: string) {}
}`;

const OUT_ES2022: Loc<string> = {
  en: `// target: "es2022" — the syntax is kept as written.
// Only the types are removed.
const label = (n, unit = "cup") => \`\${n} \${unit}\`;
const [first, ...rest] = ["boba", "jelly"];
class Cup {
    size;
    constructor(size) {
        this.size = size;
    }
}`,
  zh: `// target: "es2022" —— 语法原样保留,
// 只擦掉类型。
const label = (n, unit = "cup") => \`\${n} \${unit}\`;
const [first, ...rest] = ["boba", "jelly"];
class Cup {
    size;
    constructor(size) {
        this.size = size;
    }
}`,
};

const OUT_ES5: Loc<string> = {
  en: `// target: "es5" — arrow functions, default
// parameters, destructuring and class all get
// rewritten into pre-2015 JavaScript.
var label = function (n, unit) {
    if (unit === void 0) { unit = "cup"; }
    return "".concat(n, " ").concat(unit);
};
var _a = ["boba", "jelly"], first = _a[0], rest = _a.slice(1);
var Cup = /** @class */ (function () {
    function Cup(size) {
        this.size = size;
    }
    return Cup;
}());`,
  zh: `// target: "es5" —— 箭头函数、默认参数、解构、class
// 全部被改写成 2015 年之前的 JavaScript
// 等价写法。
var label = function (n, unit) {
    if (unit === void 0) { unit = "cup"; }
    return "".concat(n, " ").concat(unit);
};
var _a = ["boba", "jelly"], first = _a[0], rest = _a.slice(1);
var Cup = /** @class */ (function () {
    function Cup(size) {
        this.size = size;
    }
    return Cup;
}());`,
};

export function TargetSwitch() {
  const [mode, setMode] = useState<"es2022" | "es5">("es2022");
  const L = useL();
  return (
    <div className="viz tc-target">
      <div className="viz-title">
        <Tx
          en="The same TypeScript. target decides which generation of JavaScript comes out."
          zh="同一份 TypeScript。target 决定产出的是哪一代 JavaScript。"
        />
        <span
          className="seg"
          role="group"
          aria-label={L({ en: "Choose a target", zh: "选择 target" })}
        >
          {(["es2022", "es5"] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={`seg-btn${mode === m ? " on" : ""}`}
              onClick={() => setMode(m)}
            >
              target: {m}
            </button>
          ))}
        </span>
      </div>
      <CodePair
        left={
          <CodeBlock
            lang="ts"
            title={{
              en: "What you write · order-utils.ts",
              zh: "你写的 · order-utils.ts",
            }}
            code={TARGET_SRC}
          />
        }
        right={
          <CodeBlock
            lang="js"
            title={{
              en: `What tsc writes · target: ${mode}`,
              zh: `tsc 产出 · target: ${mode}`,
            }}
            code={mode === "es2022" ? OUT_ES2022 : OUT_ES5}
          />
        }
      />
      <div className="viz-msg">
        {mode === "es2022" ? (
          <Tx
            en={
              <>
                Every form in the source already exists in ES2022, so{" "}
                <b>tsc removes the types and changes nothing else</b>. The
                output is small and stays readable next to the source.
              </>
            }
            zh={
              <>
                源码里用到的写法在 ES2022 里都已经存在,所以
                <b>tsc 只擦掉类型,其他一个字不动</b>。
                产物小,而且和源码对得上、还能读。
              </>
            }
          />
        ) : (
          <Tx
            en={
              <>
                To run on an engine that only understands ES5, tsc rewrites each
                newer form into an older equivalent. The output grows and gets
                harder to read. Set <code>target</code> this low only if you
                actually have such an engine — and remember that{" "}
                <code>target</code> does not add missing runtime APIs. That is
                what <code>lib</code> describes, and <code>lib</code> only
                changes what the checker believes.
              </>
            }
            zh={
              <>
                为了跑在只认 ES5 的引擎上,tsc 把每一种较新的写法都改写成
                旧的等价形式。产物变大,也更难读。只有真的存在这种引擎时
                才把 <code>target</code> 定这么低 —— 而且记住,
                <code>target</code> 不会替你补上缺失的运行时 API。
                那件事由 <code>lib</code> 描述,而 <code>lib</code>{" "}
                只改变检查器相信什么。
              </>
            }
          />
        )}
      </div>
    </div>
  );
}

/* ================= MigrateStepper ================= */

type FileSt = "js" | "check" | "ts" | "ok";

interface MigFrame {
  label: Loc<string>;
  files: { name: string; st: FileSt }[];
  cfg: Loc<string>[];
  errs: number;
  tone: "dim" | "warn" | "ok";
  msg: ReactNode;
}

const MIG_FRAMES: MigFrame[] = [
  {
    label: { en: "Day 0 · where you start", zh: "第 0 天 · 现状" },
    files: [
      { name: "order.js", st: "js" },
      { name: "menu.js", st: "js" },
      { name: "boss.js", st: "js" },
    ],
    cfg: [{ en: "(no tsconfig.json yet)", zh: "(还没有 tsconfig.json)" }],
    errs: 0,
    tone: "dim",
    msg: (
      <Tx
        en={
          <>
            Three JavaScript files, 900 lines, one comment: &quot;do not
            touch&quot;. Zero errors — <b>not because there are no bugs, but
            because nothing is checking</b>.
          </>
        }
        zh={
          <>
            三个 JavaScript 文件,九百行,注释只有一句「别动」。
            报错 0 —— <b>不是没有 bug,是没有人在查</b>。
          </>
        }
      />
    ),
  },
  {
    label: { en: "Day 1 · TypeScript arrives", zh: "第 1 天 · TypeScript 进场" },
    files: [
      { name: "order.js", st: "js" },
      { name: "menu.js", st: "js" },
      { name: "boss.js", st: "js" },
    ],
    cfg: ['"allowJs": true', '"strict": false'],
    errs: 0,
    tone: "dim",
    msg: (
      <Tx
        en={
          <>
            <code>npx tsc --init</code> creates the config. Enable one option:{" "}
            <code>allowJs</code>. The <code>.js</code> files are now part of the
            compilation, but they are <b>included, not checked</b>. Nobody is
            interrupted and the system runs as before.
          </>
        }
        zh={
          <>
            <code>npx tsc --init</code> 生成配置。先只开一个选项:
            <code>allowJs</code>。<code>.js</code> 文件从此进入编译,
            但只是<b>被收进来,还没有被检查</b>。谁也没被打扰,系统照常跑。
          </>
        }
      />
    ),
  },
  {
    label: { en: "Day 2 · the checker turns on", zh: "第 2 天 · 检查开灯" },
    files: [
      { name: "order.js", st: "check" },
      { name: "menu.js", st: "check" },
      { name: "boss.js", st: "check" },
    ],
    cfg: ['"allowJs": true', '"checkJs": true'],
    errs: 23,
    tone: "warn",
    msg: (
      <Tx
        en={
          <>
            Add <code>checkJs</code> (or put <code>{"// @ts-check"}</code> at the
            top of one file) and the compiler starts reading the legacy code. Say
            it reports 23 errors. <b>Those bugs were always there; today they
            get named.</b> Note that JavaScript with no type annotations hides
            most of them — JSDoc comments are how you give the checker something
            to compare against.
          </>
        }
        zh={
          <>
            加上 <code>checkJs</code>(或在某个文件顶部写{" "}
            <code>{"// @ts-check"}</code>),编译器开始读这些旧代码。
            假设它报了 23 个错。<b>这些 bug 一直都在,今天才被点名。</b>
            注意:完全没有类型标注的 JavaScript 会藏住大部分问题 ——
            JSDoc 注释就是你给检查器提供对照物的方式。
          </>
        }
      />
    ),
  },
  {
    label: { en: "Week 2 · rename, one at a time", zh: "第 2 周 · 逐个改名" },
    files: [
      { name: "order.ts", st: "ts" },
      { name: "menu.ts", st: "ts" },
      { name: "boss.js", st: "check" },
    ],
    cfg: ['"allowJs": true', '"checkJs": true'],
    errs: 9,
    tone: "warn",
    msg: (
      <Tx
        en={
          <>
            One file per change: <code>order.js → order.ts</code>. Fix its errors
            before you touch the next one. For anything you cannot fix now, write{" "}
            <code>@ts-expect-error</code> with a reason. That comment{" "}
            <b>reports itself once the error is gone</b>, so the note cannot be
            forgotten.
          </>
        }
        zh={
          <>
            一次只改一个文件:<code>order.js → order.ts</code>,
            修完它的报错再动下一个。一时修不了的,写上{" "}
            <code>@ts-expect-error</code> 并注明原因。
            这行注释<b>会在错误消失时自己报错</b>,所以这笔账丢不了。
          </>
        }
      />
    ),
  },
  {
    label: { en: "Month 1 · one flag at a time", zh: "第 1 个月 · 分项加严" },
    files: [
      { name: "order.ts", st: "ts" },
      { name: "menu.ts", st: "ts" },
      { name: "boss.ts", st: "ts" },
    ],
    cfg: ['"noImplicitAny": true', '"strictNullChecks": true'],
    errs: 4,
    tone: "warn",
    msg: (
      <Tx
        en={
          <>
            Every file is <code>.ts</code> now, so enable the family{" "}
            <b>one member at a time</b>: <code>noImplicitAny</code> first to
            clear the implicit <code>any</code> parameters, then{" "}
            <code>strictNullChecks</code> for the unchecked <code>null</code>{" "}
            values. Each flag gives you a batch of errors small enough to finish.
          </>
        }
        zh={
          <>
            所有文件都是 <code>.ts</code> 了,于是把这一族<b>一项一项</b>打开:
            先 <code>noImplicitAny</code> 清掉隐式 <code>any</code> 的参数,
            再 <code>strictNullChecks</code> 处理没判的 <code>null</code>。
            每开一项,报错都是一批做得完的量。
          </>
        }
      />
    ),
  },
  {
    label: { en: "Month 2 · everything on", zh: "第 2 个月 · 全开" },
    files: [
      { name: "order.ts", st: "ok" },
      { name: "menu.ts", st: "ok" },
      { name: "boss.ts", st: "ok" },
    ],
    cfg: ['"strict": true', '"noUncheckedIndexedAccess": true'],
    errs: 0,
    tone: "ok",
    msg: (
      <Tx
        en={
          <>
            <code>strict: true</code> covers the whole family, and{" "}
            <code>noUncheckedIndexedAccess</code> adds the check that{" "}
            <code>strict</code> leaves out. Errors are back to zero, and{" "}
            <b>this zero means &quot;checked, and there is nothing&quot;</b> —
            which is a different statement from the zero on day 0.
          </>
        }
        zh={
          <>
            <code>strict: true</code> 覆盖整族,再加上{" "}
            <code>noUncheckedIndexedAccess</code> 补上 <code>strict</code>{" "}
            没管的那项。报错回到 0,而
            <b>这个 0 的意思是「查过了,真没有」</b> ——
            和第 0 天那个 0 完全不是一句话。
          </>
        }
      />
    ),
  },
];

const FILE_ST_LABEL: Record<FileSt, Loc<string>> = {
  js: { en: "not checked", zh: "未检查" },
  check: { en: "checked", zh: "检查中" },
  ts: { en: "migrated", zh: "已迁移" },
  ok: { en: "passing", zh: "通过" },
};

export function MigrateStepper() {
  const L = useL();
  const stepper = useStepper(MIG_FRAMES.length, 2200);
  const f = MIG_FRAMES[stepper.step];

  return (
    <div className="viz tc-mig">
      <div className="viz-title">
        <Tx
          en="Migrating a JavaScript ordering system, one step per frame"
          zh="一套 JavaScript 点单系统的迁移记(逐帧)"
        />
      </div>
      <div className="viz-stage">
        <div className="viz-scroll">
          <div className="tc-mig-stage">
            <div className="tc-mig-top">
              <span className="tc-mig-label">{L(f.label)}</span>
              <span className="tc-mig-errs" data-tone={f.tone}>
                {f.errs === 0 ? "✓ 0 errors" : `✕ ${f.errs} errors`}
              </span>
            </div>
            <div className="tc-mig-files">
              {f.files.map((file) => (
                <div key={file.name} className="tc-mig-file" data-st={file.st}>
                  <span className="tc-mig-fname">{file.name}</span>
                  <small>{L(FILE_ST_LABEL[file.st])}</small>
                </div>
              ))}
            </div>
            <div className="tc-mig-cfg">
              <span className="tc-mig-cfg-name">tsconfig.json</span>
              {f.cfg.map((line, i) => (
                <code key={i}>{L(line)}</code>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls
        stepper={stepper}
        step={stepper.step}
        total={MIG_FRAMES.length}
      />
    </div>
  );
}
