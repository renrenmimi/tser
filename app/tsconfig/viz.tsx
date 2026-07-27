"use client";

// 10 · tsconfig 与严格模式 专属可视化:
//  - HeroDifficulty:hero 里的「游戏难度选择」进场动画(纯 CSS)。
//  - StrictPanel:严格度调节台 —— 一段固定的问题代码,五个开关,
//    开一个,对应行亮红、错误浮出;全开 = 满防护。
//  - TargetSwitch:同一份 TS,target 拨到 es5 / es2022,产物对照。
//  - MigrateStepper:奶茶店祖传 JS 点单系统渐进迁移逐帧记。

import { useState, type ReactNode } from "react";
import { CodeLines, CodeBlock, CodePair } from "@/lib/code";
import { useStepper, StepControls } from "@/lib/stepper";

/* ================= HeroDifficulty ================= */

const DIFFS = [
  { ico: "🎈", name: "休闲", sub: "纯 JS · 炸了算玩家的", lit: false },
  { ico: "🕹️", name: "普通", sub: "TS 但没开 strict", lit: false },
  { ico: "🛡️", name: "严格", sub: "strict: true · 八条军规", lit: false },
  { ico: "⚔️", name: "军规+", sub: "strict + 漏网之鱼全签", lit: true },
];

export function HeroDifficulty() {
  return (
    <div className="tc-diffs" aria-hidden>
      {DIFFS.map((d, i) => (
        <div
          key={d.name}
          className={`tc-diff${d.lit ? " lit" : ""}`}
          style={{ animationDelay: `${140 + i * 130}ms` }}
        >
          <span className="ico">{d.ico}</span>
          <span>
            {d.name}
            <small>{d.sub}</small>
          </span>
        </div>
      ))}
    </div>
  );
}

/* ================= StrictPanel ================= */

const DEMO_CODE = `// 祖传点单代码 —— 老板说:能跑,别动
function total(items) {
  return items.reduce((sum, it) => sum + it.price, 0);
}

const order = findOrder("A-101"); // 返回 Order | null
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
}`;

interface StrictSwitch {
  id: string;
  name: string;
  /** 是否属于 strict: true 一键打开的家族 */
  family: boolean;
  /** 一句话:它管什么 */
  blurb: string;
  lines: number[];
  errors: { line: number; code: string; msg: string }[];
}

const SWITCHES: StrictSwitch[] = [
  {
    id: "noImplicitAny",
    name: "noImplicitAny",
    family: true,
    blurb: "推不出类型时,禁止悄悄按 any 处理",
    lines: [2],
    errors: [
      {
        line: 2,
        code: "TS7006",
        msg: "Parameter 'items' implicitly has an 'any' type.",
      },
    ],
  },
  {
    id: "strictNullChecks",
    name: "strictNullChecks",
    family: true,
    blurb: "null / undefined 不再能冒充任何类型",
    lines: [7],
    errors: [
      { line: 7, code: "TS18047", msg: "'order' is possibly 'null'." },
    ],
  },
  {
    id: "strictPropertyInitialization",
    name: "strictPropertyInitialization",
    family: true,
    blurb: "class 属性声明了就得赋值,别赖账",
    lines: [13],
    errors: [
      {
        line: 13,
        code: "TS2564",
        msg: "Property 'name' has no initializer and is not definitely assigned in the constructor.",
      },
    ],
  },
  {
    id: "useUnknownInCatchVariables",
    name: "useUnknownInCatchVariables",
    family: true,
    blurb: "catch 到的东西是 unknown —— 谁说 throw 的一定是 Error?",
    lines: [19],
    errors: [
      { line: 19, code: "TS18046", msg: "'e' is of type 'unknown'." },
    ],
  },
  {
    id: "noUncheckedIndexedAccess",
    name: "noUncheckedIndexedAccess",
    family: false,
    blurb: "数组下标取值变 T | undefined —— 第 4 杯奶茶不存在",
    lines: [10],
    errors: [
      { line: 10, code: "TS2532", msg: "Object is possibly 'undefined'." },
    ],
  },
];

export function StrictPanel() {
  const [on, setOn] = useState<Record<string, boolean>>({});

  const active = SWITCHES.filter((s) => on[s.id]);
  const hlLines = active.flatMap((s) => s.lines);
  const errors = active.flatMap((s) =>
    s.errors.map((e) => ({ ...e, sw: s.name })),
  );
  const caught = active.length;
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
        严格度调节台 —— 同一段代码,军规签几条,编译器就看见几个 bug
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
                    {s.family ? "strict 家族" : "strict 之外"}
                  </i>
                </span>
                <small>{s.blurb}</small>
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
              ✍️ strict: true 一键签军规
            </button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={reset}>
              ↻ 全部撤签
            </button>
          </div>
        </div>

        <div className="tc-strict-code">
          <div className="tc-code-bar">
            <span className="mono">order.ts</span>
            <span className={`tc-shield${caught === SWITCHES.length ? " full" : ""}`}>
              防护 {caught} / {SWITCHES.length}
            </span>
          </div>
          <CodeLines code={DEMO_CODE} lang="ts" hl={hlLines} />
        </div>
      </div>

      <div className="tc-errs" aria-live="polite">
        {errors.length === 0 ? (
          <div className="tc-err-zero">
            ✓ 0 errors —— 编译器没意见。注意:它没意见 ≠ 没 bug,
            只是现在的军规一条都管不到。
          </div>
        ) : (
          errors.map((e) => (
            <div key={e.code + e.line} className="tc-err">
              <span className="tc-err-loc">order.ts:{e.line}</span>
              <span className="tc-err-code">{e.code}</span>
              <span className="tc-err-msg">{e.msg}</span>
              <span className="tc-err-by">← {e.sw}</span>
            </div>
          ))
        )}
        {hidden > 0 && caught > 0 && (
          <div className="tc-err-rest">
            …另有 {hidden} 个 bug 潜伏在没签的军规之外,编译器看不见它们。
          </div>
        )}
        {caught === SWITCHES.length && (
          <div className="tc-err-full">
            🏆 满防护 —— 这段代码里埋的 5 个 bug,一个不漏,全部死在编译期。
            注意最后一条 noUncheckedIndexedAccess:strict: true{" "}
            <b>并不包含它</b>,要单独签。
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= TargetSwitch ================= */

const TARGET_SRC = `// order-utils.ts
const price = (n: number, unit = "元") =>
  \`\${n} \${unit}\`;

const [first, ...rest] =
  ["珍珠", "椰果", "布丁"];`;

const OUT_ES2022 = `// target: "es2022" —— 语法原样保留
const price = (n, unit = "元") =>
  \`\${n} \${unit}\`;

const [first, ...rest] =
  ["珍珠", "椰果", "布丁"];`;

const OUT_ES5 = `// target: "es5" —— 新语法全部降级
var price = function (n, unit) {
  if (unit === void 0) { unit = "元"; }
  return n + " " + unit;
};
var _a = ["珍珠", "椰果", "布丁"],
  first = _a[0],
  rest = _a.slice(1);`;

export function TargetSwitch() {
  const [mode, setMode] = useState<"es2022" | "es5">("es2022");
  return (
    <div className="viz tc-target">
      <div className="viz-title">
        同一份 TS,target 拨到哪个年代,产物就长成哪个年代
        <span className="seg" role="group" aria-label="选择 target">
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
        left={<CodeBlock lang="ts" title="你写的 · order-utils.ts" code={TARGET_SRC} />}
        right={
          <CodeBlock
            lang="js"
            title={`tsc 产物 · target: ${mode}`}
            code={mode === "es2022" ? OUT_ES2022 : OUT_ES5}
          />
        }
      />
      <div className="viz-msg">
        {mode === "es2022" ? (
          <>
            es2022:箭头函数、默认参数、解构都是这个年代的原生语法,
            <b>tsc 只擦类型,其他一个字不动</b> —— 产物小、跑得快、还好读。
          </>
        ) : (
          <>
            es5:为了伺候古董运行环境,tsc 把每样新语法都翻译成 2009
            年的老写法 —— 体积膨胀、可读性下降。<b>除非真要兼容老浏览器,
            别把 target 定这么低。</b>
          </>
        )}
      </div>
    </div>
  );
}

/* ================= MigrateStepper ================= */

type FileSt = "js" | "check" | "ts" | "ok";

interface MigFrame {
  label: string;
  files: { name: string; st: FileSt }[];
  cfg: string[];
  errs: number;
  tone: "dim" | "warn" | "ok";
  msg: ReactNode;
}

const MIG_FRAMES: MigFrame[] = [
  {
    label: "第 0 天 · 现状",
    files: [
      { name: "order.js", st: "js" },
      { name: "menu.js", st: "js" },
      { name: "boss.js", st: "js" },
    ],
    cfg: ["(还没有 tsconfig.json)"],
    errs: 0,
    tone: "dim",
    msg: (
      <>
        奶茶店的祖传点单系统:三个文件,九百行,注释只有一句「别动」。
        报错 0 —— <b>不是没 bug,是没人查</b>。
      </>
    ),
  },
  {
    label: "第 1 天 · TS 进场",
    files: [
      { name: "order.js", st: "js" },
      { name: "menu.js", st: "js" },
      { name: "boss.js", st: "js" },
    ],
    cfg: ['"allowJs": true'],
    errs: 0,
    tone: "dim",
    msg: (
      <>
        <code>npx tsc --init</code> 生成规则书,先只签一条{" "}
        <code>allowJs</code>:让 .js 文件进 TS 的编译世界,但<b>只收留,
        不检查</b>。系统照常跑,谁也没被打扰。
      </>
    ),
  },
  {
    label: "第 2 天 · 开灯",
    files: [
      { name: "order.js", st: "check" },
      { name: "menu.js", st: "check" },
      { name: "boss.js", st: "check" },
    ],
    cfg: ['"allowJs": true', '"checkJs": true'],
    errs: 23,
    tone: "warn",
    msg: (
      <>
        再签 <code>checkJs</code>(或在单个文件头加{" "}
        <code>{"// @ts-check"}</code>)—— 编译器开始读祖传代码,一口气冒出
        23 个错。别慌:<b>这些 bug 一直都在,只是今天才有人点名</b>。
      </>
    ),
  },
  {
    label: "第 2 周 · 逐个改名",
    files: [
      { name: "order.ts", st: "ts" },
      { name: "menu.ts", st: "ts" },
      { name: "boss.js", st: "check" },
    ],
    cfg: ['"allowJs": true', '"checkJs": true'],
    errs: 9,
    tone: "warn",
    msg: (
      <>
        一次改一个文件:<code>order.js → order.ts</code>,修完它的报错再动
        下一个。一时修不动的,用 <code>@ts-expect-error</code>{" "}
        记一笔账 —— 它是<b>有帐可查的债</b>,不是地毯下的灰。
      </>
    ),
  },
  {
    label: "第 1 个月 · 分项加严",
    files: [
      { name: "order.ts", st: "ts" },
      { name: "menu.ts", st: "ts" },
      { name: "boss.ts", st: "ts" },
    ],
    cfg: ['"noImplicitAny": true', '"strictNullChecks": true'],
    errs: 4,
    tone: "warn",
    msg: (
      <>
        全员 .ts 之后,strict 家族<b>一项一项签</b>:先 noImplicitAny
        清掉隐式 any,再 strictNullChecks 追杀漏网的 null——
        每开一项,修一批,小步快走。
      </>
    ),
  },
  {
    label: "第 2 个月 · 满防护",
    files: [
      { name: "order.ts", st: "ok" },
      { name: "menu.ts", st: "ok" },
      { name: "boss.ts", st: "ok" },
    ],
    cfg: ['"strict": true', '"noUncheckedIndexedAccess": true'],
    errs: 0,
    tone: "ok",
    msg: (
      <>
        <code>strict: true</code> 全签,连军规之外的
        noUncheckedIndexedAccess 也补上,报错归零 ——{" "}
        <b>这次的 0 是「查过了,真没有」</b>。老板还是那句「能跑就行」,
        但现在,是真的能跑。
      </>
    ),
  },
];

const FILE_ST_LABEL: Record<FileSt, string> = {
  js: "不检查",
  check: "检查中",
  ts: "已迁移",
  ok: "通过",
};

export function MigrateStepper() {
  const stepper = useStepper(MIG_FRAMES.length, 2200);
  const f = MIG_FRAMES[stepper.step];

  return (
    <div className="viz tc-mig">
      <div className="viz-title">祖传 JS 点单系统迁移记(逐帧)</div>
      <div className="viz-stage">
        <div className="viz-scroll">
          <div className="tc-mig-stage">
            <div className="tc-mig-top">
              <span className="tc-mig-label">{f.label}</span>
              <span className="tc-mig-errs" data-tone={f.tone}>
                {f.errs === 0 ? "✓ 0 errors" : `✕ ${f.errs} errors`}
              </span>
            </div>
            <div className="tc-mig-files">
              {f.files.map((file) => (
                <div key={file.name} className="tc-mig-file" data-st={file.st}>
                  <span className="tc-mig-fname">{file.name}</span>
                  <small>{FILE_ST_LABEL[file.st]}</small>
                </div>
              ))}
            </div>
            <div className="tc-mig-cfg">
              <span className="tc-mig-cfg-name">tsconfig.json</span>
              {f.cfg.map((line) => (
                <code key={line}>{line}</code>
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
