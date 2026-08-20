"use client";

// 第 10 章 · tsconfig 与严格模式(双语:正文用 <T en zh />,组件 props 用
// { en, zh })——
// 规则书 → strict 家族九项 → 家族之外的两项 → 产物侧(target / lib /
// module) → 祖传 JS 渐进迁移 → 常见误区 → 动手任务 → 测验 → 要点。
//
// 代码示例:可执行行在两种语言里逐字节相同,只有注释分 en / zh;
// 因此 hl 行号在两种语言下一致。编译器报错原文一律不翻译。
//
// 本章所有报错码、报错文案、产物代码与选项行为均在 TypeScript 5.9.3 下实测。
// 关键事实(与旧版内容的差异):
//  - strict 家族是 9 项,不是 8 项 —— TS 5.6 加入了 strictBuiltinIteratorReturn。
//  - noImplicitOverride 不在 strict 里(tsc --init 把它列在 "Style Options")。
//  - TS 5.9 的 tsc --init 模板默认已开 noUncheckedIndexedAccess 和
//    exactOptionalPropertyTypes,并把它们单列在 "Stricter Typechecking Options"。
//  - strictPropertyInitialization / exactOptionalPropertyTypes 不开
//    strictNullChecks 会被 tsc 拒绝(TS5052);noUncheckedIndexedAccess
//    则是合法但完全无效。
//  - es5 产物用 "".concat(...) 拼字符串,不是 + 号。

import "./chapter.css";

import { Hero, Section, Callout, KeyPoints, ChapterFooter } from "@/lib/kit";
import { CodeBlock, CodePair } from "@/lib/code";
import { LabSet } from "@/lib/labs";
import { Quiz } from "@/lib/quiz";
import { T, type Loc } from "@/lib/i18n";
import { LABS, QUIZ } from "@/lib/tsconfig-data";
import {
  HeroDifficulty,
  StrictPanel,
  TargetSwitch,
  MigrateStepper,
} from "./viz";

/* ---------- §01 规则书 ---------- */

// 两种语言完全相同的代码,直接写成普通字符串。
const S1_INIT = `npx tsc --init
# Created a new tsconfig.json
#
# You can learn more at https://aka.ms/tsconfig`;

// 真实的 TS 5.9 tsc --init 模板(略去 File Layout / Other Outputs 两段)。
// 用 lang="ts" 是为了让 // 注释正确高亮 —— tsconfig 是 JSONC。
const S1_TEMPLATE: Loc<string> = {
  en: `{
  "compilerOptions": {
    // Environment Settings
    "module": "nodenext",
    "target": "esnext",
    "types": [],

    // Stricter Typechecking Options
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,

    // Style Options
    // "noImplicitReturns": true,
    // "noImplicitOverride": true,
    // "noUnusedLocals": true,

    // Recommended Options
    "strict": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": true,
  }
}`,
  zh: `{
  "compilerOptions": {
    // 环境设置
    "module": "nodenext",
    "target": "esnext",
    "types": [],

    // 更严的检查(注意:它们不属于 strict)
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,

    // 风格类检查(模板默认注释掉)
    // "noImplicitReturns": true,
    // "noImplicitOverride": true,
    // "noUnusedLocals": true,

    // 推荐选项
    "strict": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": true,
  }
}`,
};

const S1_NOEMIT: Loc<string> = {
  en: `# tsc checks, and writes one .js file per input .ts file.
tsc                # src/order.ts -> dist/order.js
                   # src/menu.ts  -> dist/menu.js

# A type error does not stop the JavaScript from being written.
tsc                # error TS2322: ... and dist/order.js exists anyway
tsc --noEmitOnError # now nothing is written while errors remain

# Check only, write nothing. This is how most projects use tsc.
tsc --noEmit

# tsc is not a bundler. It never merges files into one.
tsc --outFile all.js
# error TS6082: Only 'amd' and 'system' modules are
# supported alongside --outFile.`,
  zh: `# tsc 会检查,并为每一个输入的 .ts 写出一个 .js。
tsc                # src/order.ts -> dist/order.js
                   # src/menu.ts  -> dist/menu.js

# 类型报错不会阻止 JavaScript 被写出来。
tsc                # error TS2322: ... 而 dist/order.js 照样存在
tsc --noEmitOnError # 加了它,有错期间就什么都不写

# 只检查、不写文件。大多数项目就是这么用 tsc 的。
tsc --noEmit

# tsc 不是打包器,它从不把多个文件合成一个。
tsc --outFile all.js
# error TS6082: Only 'amd' and 'system' modules are
# supported alongside --outFile.`,
};

/* ---------- §02 strict 家族 ---------- */

const S2_NIA_OFF: Loc<string> = {
  en: `function total(items) {
  // items is treated as any,
  // so nothing inside is checked
  let sum = 0;
  for (const it of items) sum += it.pirce;
  return sum; // "pirce" is a typo. No error.
}

total(order.items); // NaN, discovered in production`,
  zh: `function total(items) {
  // items 被当成 any,
  // 所以函数体里什么都不检查
  let sum = 0;
  for (const it of items) sum += it.pirce;
  return sum; // 「pirce」拼错了,不报错。
}

total(order.items); // NaN,上线后才发现`,
};

const S2_NIA_ON: Loc<string> = {
  en: `function total(items) {
// TS7006: Parameter 'items'
// implicitly has an 'any' type.

// So you write the type down:
function total2(items: OrderItem[]) {
  let sum = 0;
  for (const it of items) sum += it.pirce;
  // TS2551: Property 'pirce' does not exist
  // on type 'OrderItem'. Did you mean 'price'?
  return sum;
}`,
  zh: `function total(items) {
// TS7006: Parameter 'items'
// implicitly has an 'any' type.

// 于是你只好把类型写出来:
function total2(items: OrderItem[]) {
  let sum = 0;
  for (const it of items) sum += it.pirce;
  // TS2551: Property 'pirce' does not exist
  // on type 'OrderItem'. Did you mean 'price'?
  return sum;
}`,
};

const S2_SNC_OFF: Loc<string> = {
  en: `// findOrder returns Order | null
const order = findOrder("A-101");

console.log(order.total);
// Compiles with no error.
// Then, one night in production:
// TypeError: Cannot read
// properties of null`,
  zh: `// findOrder 的返回类型是 Order | null
const order = findOrder("A-101");

console.log(order.total);
// 编译不报错。
// 然后某个凌晨,线上:
// TypeError: Cannot read
// properties of null`,
};

const S2_SNC_ON: Loc<string> = {
  en: `const order = findOrder("A-101");

console.log(order.total);
// TS18047: 'order' is possibly 'null'.

if (order !== null) {
  console.log(order.total); // allowed
}
// This is narrowing, from chapter 03.`,
  zh: `const order = findOrder("A-101");

console.log(order.total);
// TS18047: 'order' is possibly 'null'.

if (order !== null) {
  console.log(order.total); // 通过
}
// 这就是第 03 章的收窄。`,
};

/* ---------- §03 家族之外 ---------- */

const S3_NUIA_OFF: Loc<string> = {
  en: `const sizes =
  ["small", "medium", "large"];

sizes[3].toUpperCase();
// The type of sizes[3] is string.
// Compiles with no error, even
// with the whole strict family on.
// At runtime: TypeError.`,
  zh: `const sizes =
  ["small", "medium", "large"];

sizes[3].toUpperCase();
// sizes[3] 的类型是 string。
// 即便 strict 家族全开,
// 这里也不报错。
// 运行时:TypeError。`,
};

const S3_NUIA_ON: Loc<string> = {
  en: `const size: string = sizes[3];
// TS2322: Type 'string | undefined'
// is not assignable to type 'string'.

sizes[3].toUpperCase();
// TS2532: Object is possibly 'undefined'.

sizes[3]?.toUpperCase(); // allowed`,
  zh: `const size: string = sizes[3];
// TS2322: Type 'string | undefined'
// is not assignable to type 'string'.

sizes[3].toUpperCase();
// TS2532: Object is possibly 'undefined'.

sizes[3]?.toUpperCase(); // 通过`,
};

const S3_EOPT: Loc<string> = {
  en: `interface Order {
  topping?: string; // optional: the key may be absent
}

// Off: this is allowed. undefined slips in as a value.
const o: Order = { topping: undefined };
// On: TS2375: Type '{ topping: undefined; }' is not
// assignable to type 'Order' with
// 'exactOptionalPropertyTypes: true'.

// The payoff is that a runtime check now agrees
// with the type:
if ("topping" in o) {
  const t: string = o.topping;
  // Off: TS2322 — the type is still string | undefined.
  // On: allowed. If the key is present, so is the value.
}`,
  zh: `interface Order {
  topping?: string; // 可选:这个键可以不存在
}

// 关:下面这行合法,undefined 作为值混了进来。
const o: Order = { topping: undefined };
// 开:TS2375: Type '{ topping: undefined; }' is not
// assignable to type 'Order' with
// 'exactOptionalPropertyTypes: true'.

// 好处在于,运行时的判断从此
// 和类型对得上:
if ("topping" in o) {
  const t: string = o.topping;
  // 关:TS2322 —— 类型仍然是 string | undefined。
  // 开:通过。键在,值就一定在。
}`,
};

/* ---------- §04 产物侧 ---------- */

const S4_LIB: Loc<string> = {
  en: `// tsconfig: { "target": "es5" }  — lib not set, so it
// defaults to es5.
const ready: Promise<number> = Promise.resolve(1);
// TS2585: 'Promise' only refers to a type, but is being
// used as a value here. Do you need to change your target
// library? Try changing the 'lib' compiler option to
// es2015 or later.

const last = [1, 2, 3].at(-1);
// TS2550: Property 'at' does not exist on type 'number[]'.

// tsconfig: { "target": "es5", "lib": ["es2022"] }
// Both errors disappear. The emitted JavaScript is
// byte for byte the same as before: lib does not
// affect emit, and it does not add a polyfill.`,
  zh: `// tsconfig: { "target": "es5" } —— 没写 lib,
// 于是 lib 默认取 es5。
const ready: Promise<number> = Promise.resolve(1);
// TS2585: 'Promise' only refers to a type, but is being
// used as a value here. Do you need to change your target
// library? Try changing the 'lib' compiler option to
// es2015 or later.

const last = [1, 2, 3].at(-1);
// TS2550: Property 'at' does not exist on type 'number[]'.

// tsconfig: { "target": "es5", "lib": ["es2022"] }
// 两个错都消失,而产出的 JavaScript 一字不差 ——
// lib 不参与产物生成,也不会替你加 polyfill。`,
};

const S4_NODE = `{
  "compilerOptions": {
    "module": "nodenext",
    "target": "es2022",
    "strict": true
  }
}`;

const S4_BUNDLER = `{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler",
    "target": "es2022",
    "strict": true,
    "noEmit": true
  }
}`;

/* ---------- §05 渐进迁移 ---------- */

const S5_TSCHECK = `// @ts-check
/** @type {{ name: string, price: number }[]} */
const menu = loadMenu();

menu.forEach((it) => {
  console.log(it.name, it.pirce);
  //                      ~~~~~
  // TS2551: Property 'pirce' does not exist on type
  // '{ name: string; price: number; }'.
  // Did you mean 'price'?
});`;

const S5_IGNORE: Loc<string> = {
  en: `// @ts-ignore
legacy.doSomething(order);

// If the error on the line below is
// fixed one day, @ts-ignore says
// nothing. It stays silent forever,
// and the note stays in the file.`,
  zh: `// @ts-ignore
legacy.doSomething(order);

// 哪天下面这行的错误被修好了,
// @ts-ignore 什么也不会说。
// 它永远沉默,而这行注释
// 就一直留在文件里。`,
};

const S5_EXPECT: Loc<string> = {
  en: `// @ts-expect-error legacy has no types yet
legacy.doSomething(order);

// When the line below stops reporting,
// this comment reports instead:
// TS2578: Unused '@ts-expect-error'
// directive.
// So you find out, and delete it.`,
  zh: `// @ts-expect-error legacy 还没有类型
legacy.doSomething(order);

// 等下面这行不再报错,
// 这行注释会代替它报错:
// TS2578: Unused '@ts-expect-error'
// directive.
// 于是你知道了,把它删掉。`,
};

export default function TsconfigPage() {
  return (
    <main className="page" data-ch="tsconfig">
      <Hero
        ch="tsconfig"
        title={{
          en: (
            <>
              tsconfig and <span className="grad">strict mode</span>
            </>
          ),
          zh: (
            <>
              tsconfig 与<span className="grad">严格模式</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              The same file can pass in one project and fail in another. The
              code is identical; the rules are not. Those rules live in{" "}
              <code>tsconfig.json</code>, and <code>strict</code> is the part
              that decides how much the compiler will check.
            </>
          ),
          zh: (
            <>
              同一个文件,在一个项目里通过,在另一个项目里报错 ——
              代码一模一样,规则不一样。规则写在{" "}
              <code>tsconfig.json</code> 里,而 <code>strict</code>{" "}
              是其中决定「编译器查到多深」的那部分。
            </>
          ),
        }}
        chips={[
          {
            id: "rulebook",
            n: "01",
            label: { en: "The config file", zh: "规则书" },
          },
          {
            id: "strict",
            n: "02",
            label: { en: "The strict family", zh: "strict 家族" },
          },
          {
            id: "beyond",
            n: "03",
            label: { en: "Outside strict", zh: "家族之外" },
          },
          { id: "output", n: "04", label: { en: "Output", zh: "产物设置" } },
          {
            id: "migrate",
            n: "05",
            label: { en: "Migration", zh: "渐进迁移" },
          },
          {
            id: "pitfalls",
            n: "06",
            label: { en: "Common mistakes", zh: "误区" },
          },
          { id: "labs", n: "07", label: { en: "Labs", zh: "动手" } },
          { id: "quiz", n: "08", label: { en: "Quiz", zh: "测验" } },
        ]}
      >
        <HeroDifficulty />
      </Hero>

      {/* ================= §01 规则书 ================= */}
      <Section
        id="rulebook"
        index="01"
        title={{
          en: "tsconfig.json: the file tsc and your editor both read",
          zh: "tsconfig.json:tsc 和编辑器共读的那份规则",
        }}
        desc={{
          en: "Whether a piece of code is an error is decided partly by the code and partly by this file. It is worth reading yours.",
          zh: "「这段代码有没有问题」,一半由代码决定,一半由这个文件决定。你项目里的这一份,值得读一遍。",
        }}
      >
        <Callout
          tone="story"
          title={{ en: "One file, two readers", zh: "一份文件,两个读者" }}
        >
          <p>
            <T
              en={
                <>
                  <code>tsconfig.json</code> is read by two programs. One is{" "}
                  <code>tsc</code>, the command you run in a terminal or in CI.
                  The other is the <b>type service</b> — the background process
                  your editor uses to draw the red underlines as you type. Both
                  read the same file, which is why the underline in your editor
                  and the failure in CI say the same thing.
                </>
              }
              zh={
                <>
                  <code>tsconfig.json</code> 有两个读者。一个是{" "}
                  <code>tsc</code>,你在终端或 CI 里跑的那个命令;另一个是
                  <b>类型服务</b> —— 编辑器在后台跑的进程,
                  你打字时的红线就是它画的。两者读的是同一份文件,
                  所以编辑器里的红线和 CI 里的失败说的是同一句话。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  It also decides how strictly the code is checked, which is
                  close to a difficulty setting: the same code, different rules,
                  a different answer. Create the file with one command.
                </>
              }
              zh={
                <>
                  它还决定检查有多严 —— 这一点很像游戏里的难度设置:
                  同一份代码,规则不同,结论就不同。生成这个文件只要一句命令。
                </>
              }
            />
          </p>
        </Callout>

        <CodeBlock
          lang="bash"
          title={{ en: "Create the file", zh: "生成这个文件" }}
          code={S1_INIT}
        />

        <CodeBlock
          lang="ts"
          title={{
            en: "tsconfig.json · what tsc --init writes (abridged)",
            zh: "tsconfig.json · tsc --init 生成的内容(节选)",
          }}
          hl={[8, 9, 10, 18]}
          code={S1_TEMPLATE}
          note={
            <T
              en={
                <>
                  Two things to notice. First, the trailing comma and the
                  comments: <code>tsconfig.json</code> is JSONC, which is JSON
                  that allows comments, so you can record why an option is set.
                  Second, the section names. <code>strict</code> sits under
                  &quot;Recommended Options&quot;, while{" "}
                  <code>noUncheckedIndexedAccess</code> and{" "}
                  <code>exactOptionalPropertyTypes</code> sit in a separate
                  section of their own. That separation is a fact about the
                  language, and section 03 is about it.
                </>
              }
              zh={
                <>
                  有两点值得注意。一是那个多余的逗号和这些注释:
                  <code>tsconfig.json</code> 是 JSONC ——
                  允许写注释的 JSON,所以你可以在里面记下「为什么开这一项」。
                  二是段落名。<code>strict</code> 在「Recommended Options」里,
                  而 <code>noUncheckedIndexedAccess</code> 和{" "}
                  <code>exactOptionalPropertyTypes</code> 被单列成另一段。
                  这个分家是语言层面的事实,§03 就讲它。
                </>
              }
            />
          }
        />

        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">
              <T en="Group 1 · how much is checked" zh="第一类 · 检查多严" />
            </div>
            <div className="card-title">
              <T en="the strict family" zh="strict 家族" />
            </div>
            <p>
              <T
                en={
                  <>
                    <code>noImplicitAny</code>, <code>strictNullChecks</code>{" "}
                    and seven more decide how much the compiler refuses. This is
                    the main subject of the chapter; section 02 goes through
                    them.
                  </>
                }
                zh={
                  <>
                    <code>noImplicitAny</code>、<code>strictNullChecks</code>{" "}
                    以及另外七项,决定编译器拒绝多少东西。
                    这是本章的重点,§02 逐项讲。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Group 2 · what comes out" zh="第二类 · 产物长什么样" />
            </div>
            <div className="card-title">target / module</div>
            <p>
              <T
                en={
                  <>
                    Which generation of JavaScript syntax is emitted, in which
                    module format, into which directory. Section 04 covers these
                    — including when they do not matter at all.
                  </>
                }
                zh={
                  <>
                    产出的 JavaScript 用哪一代语法、哪种模块格式、
                    放进哪个目录。§04 讲这一组 ——
                    也讲它们在什么情况下完全不起作用。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Group 3 · which files" zh="第三类 · 管哪些文件" />
            </div>
            <div className="card-title">include / paths</div>
            <p>
              <T
                en={
                  <>
                    Which files TypeScript is responsible for (
                    <code>include</code>, <code>exclude</code>, <code>files</code>
                    ) and how import path aliases are resolved (
                    <code>paths</code>).
                  </>
                }
                zh={
                  <>
                    哪些文件归 TypeScript 管(<code>include</code>、
                    <code>exclude</code>、<code>files</code>),以及 import
                    的路径别名怎么解析(<code>paths</code>)。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <Callout
          tone="deep"
          title={{
            en: "What tsc does, and what it does not do",
            zh: "tsc 做什么,不做什么",
          }}
        >
          <p>
            <T
              en={
                <>
                  <code>tsc</code> does two separate jobs: it <b>checks</b> the
                  types, and it <b>writes</b> JavaScript — one output file per
                  input file. It is not a bundler, and it never merges your
                  modules into one file. Those two jobs are also independent:{" "}
                  <b>
                    a type error does not stop the JavaScript from being written
                  </b>
                  , unless you also set <code>noEmitOnError</code>.
                </>
              }
              zh={
                <>
                  <code>tsc</code> 做两件互相独立的事:<b>检查</b>类型,和
                  <b>写出</b> JavaScript —— 每个输入文件对应一个输出文件。
                  它不是打包器,从不把你的模块合成一个文件。
                  而这两件事确实是独立的:
                  <b>类型报错不会阻止 JavaScript 被写出来</b>,
                  除非你同时开 <code>noEmitOnError</code>。
                </>
              }
            />
          </p>
        </Callout>

        <CodeBlock
          lang="bash"
          title={{ en: "Two jobs, separable", zh: "两件事,可以分开" }}
          code={S1_NOEMIT}
          note={
            <T
              en={
                <>
                  Most projects today split the two jobs. A bundler, or{" "}
                  <code>swc</code> or <code>esbuild</code>, strips the types and
                  produces the JavaScript, and <code>tsc --noEmit</code> is used
                  purely as the type check. When a project is set up that way,{" "}
                  <b>
                    the emit options in tsconfig do not affect what ships
                  </b>{" "}
                  — the other tool&apos;s settings do. Worth checking which case
                  your project is in before you spend time tuning{" "}
                  <code>target</code>.
                </>
              }
              zh={
                <>
                  今天大多数项目会把这两件事分开:打包器,或者 <code>swc</code>{" "}
                  / <code>esbuild</code>,负责擦掉类型、产出 JavaScript,而{" "}
                  <code>tsc --noEmit</code> 只用来做类型检查。
                  这种配置下,<b>tsconfig 里的产物类选项不影响上线的东西</b>{" "}
                  —— 决定权在另一个工具的配置里。花时间调{" "}
                  <code>target</code> 之前,先确认你的项目属于哪一种。
                </>
              }
            />
          }
        />
      </Section>

      {/* ================= §02 strict 家族 ================= */}
      <Section
        id="strict"
        index="02"
        title={{
          en: "The strict family: one switch, nine checks",
          zh: "strict 家族:一个开关,九项检查",
        }}
        desc={{
          en: "strict: true is not one check. It is a name for a group of nine, turned on together. Use the panel to turn them on one at a time and watch what the compiler starts to see.",
          zh: "strict: true 不是一项检查,而是九项检查的统称,一次全部打开。先在调节台上一项一项拨,看编译器多看见了什么。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                In TypeScript 5.9, <code>{`"strict": true`}</code> turns on
                exactly these nine: <code>noImplicitAny</code>,{" "}
                <code>strictNullChecks</code>, <code>strictFunctionTypes</code>,{" "}
                <code>strictBindCallApply</code>,{" "}
                <code>strictPropertyInitialization</code>,{" "}
                <code>strictBuiltinIteratorReturn</code>,{" "}
                <code>noImplicitThis</code>,{" "}
                <code>useUnknownInCatchVariables</code>, and{" "}
                <code>alwaysStrict</code>. The list has grown over time —{" "}
                <code>strictBuiltinIteratorReturn</code> joined in TypeScript
                5.6 — so if you need the exact membership for a specific
                version, check that version&apos;s reference rather than a
                memorised list. Several options that sound like members are
                not: <code>noImplicitOverride</code>,{" "}
                <code>noUnusedLocals</code> and <code>noImplicitReturns</code>{" "}
                all sit in the template&apos;s separate &quot;Style
                Options&quot; section, switched off.
              </>
            }
            zh={
              <>
                在 TypeScript 5.9 里,<code>{`"strict": true`}</code>{" "}
                打开的正好是这九项:<code>noImplicitAny</code>、
                <code>strictNullChecks</code>、<code>strictFunctionTypes</code>、
                <code>strictBindCallApply</code>、
                <code>strictPropertyInitialization</code>、
                <code>strictBuiltinIteratorReturn</code>、
                <code>noImplicitThis</code>、
                <code>useUnknownInCatchVariables</code>、
                <code>alwaysStrict</code>。这个名单是会变长的 ——
                <code>strictBuiltinIteratorReturn</code> 是 TypeScript 5.6
                才加进来的 —— 所以要确认某个具体版本的成员,
                查那个版本的文档,别凭记忆。还有几个听起来像成员、
                其实不是的:<code>noImplicitOverride</code>、
                <code>noUnusedLocals</code>、<code>noImplicitReturns</code>{" "}
                都在模板另一段「Style Options」里,而且是关着的。
              </>
            }
          />
        </p>

        <StrictPanel />

        <p className="sec-desc">
          <T
            en={
              <>
                Two of the nine deserve a closer look. The first is{" "}
                <b>noImplicitAny</b>. When the compiler cannot work out a type
                on its own, this check makes that an error instead of quietly
                using <code>any</code>:
              </>
            }
            zh={
              <>
                九项里有两项值得细看。第一项是 <b>noImplicitAny</b>。
                当编译器自己推不出类型时,这项检查会让它报错,
                而不是悄悄按 <code>any</code> 处理:
              </>
            }
          />
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title={{ en: "Off · nothing is reported", zh: "关 · 什么都不报" }}
              hl={[1, 5]}
              code={S2_NIA_OFF}
              note={
                <T
                  en={
                    <>
                      No inferable type means <code>any</code>, and{" "}
                      <code>any</code> turns the checks off for everything
                      derived from it. Misspelled fields and wrong arguments all
                      pass. <b>Those lines are TypeScript in name only.</b>
                    </>
                  }
                  zh={
                    <>
                      推不出类型就当 <code>any</code>,而 <code>any</code>{" "}
                      会让由它派生出的一切都不受检查。
                      写错的字段、传错的参数,全都通过。
                      <b>那几行只是名义上的 TypeScript。</b>
                    </>
                  }
                />
              }
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title={{
                en: "On · you have to say what it is",
                zh: "开 · 你必须把类型说出来",
              }}
              hl={[1, 6]}
              code={S2_NIA_ON}
              note={
                <T
                  en={
                    <>
                      The rule is: if the compiler cannot infer a type, you have
                      to write one. Once the type is written down, the typo{" "}
                      <code>pirce</code> becomes an error on the line where it
                      is written.
                    </>
                  }
                  zh={
                    <>
                      规则就是:编译器推不出来,你就得自己写。
                      一旦类型写下来了,<code>pirce</code>{" "}
                      这个拼写错误就在它所在的那一行报错。
                    </>
                  }
                />
              }
            />
          }
        />

        <p className="sec-desc">
          <T
            en={
              <>
                The second is <b>strictNullChecks</b>, and it is the member that
                changes the most existing code. With it off,{" "}
                <code>null</code> and <code>undefined</code> are assignable to{" "}
                <b>every</b> type, so &quot;this value may be missing&quot;
                cannot be written down at all:
              </>
            }
            zh={
              <>
                第二项是 <b>strictNullChecks</b>,
                它是对存量代码影响最大的一员。它关着时,<code>null</code> 和{" "}
                <code>undefined</code> 可以赋给<b>任何</b>类型,
                于是「这个值可能没有」这句话根本没法写进类型:
              </>
            }
          />
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title={{
                en: "Off · null fits everywhere",
                zh: "关 · null 到处都放得下",
              }}
              hl={[4]}
              code={S2_SNC_OFF}
              note={
                <T
                  en={
                    <>
                      With the flag off, <code>Order | null</code> and{" "}
                      <code>Order</code> are interchangeable to the compiler. A{" "}
                      <code>null</code> sitting where an <code>Order</code> is
                      expected is not something it can see.
                    </>
                  }
                  zh={
                    <>
                      关着时,在编译器看来 <code>Order | null</code> 和{" "}
                      <code>Order</code> 可以互换。该放 <code>Order</code>{" "}
                      的位置上躺着一个 <code>null</code>,它看不见。
                    </>
                  }
                />
              }
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title={{
                en: "On · check before you use it",
                zh: "开 · 先检查再使用",
              }}
              hl={[3, 6]}
              code={S2_SNC_ON}
              note={
                <T
                  en={
                    <>
                      &quot;May be missing&quot; is now part of the type, so
                      reading a property requires a check first. The{" "}
                      <code>TypeError</code> at 2 a.m. becomes a red underline
                      this afternoon.
                    </>
                  }
                  zh={
                    <>
                      「可能没有」现在写进了类型,所以取属性之前必须先检查。
                      凌晨两点的 <code>TypeError</code>{" "}
                      变成了今天下午的一条红线。
                    </>
                  }
                />
              }
            />
          }
        />

        <Callout
          tone="deep"
          title={{ en: "The billion-dollar mistake", zh: "十亿美元的错误" }}
        >
          <p>
            <T
              en={
                <>
                  Tony Hoare introduced the null reference in 1965 and
                  apologised for it publicly in 2009, calling it his
                  &quot;billion-dollar mistake&quot;. The problem is not the
                  value itself; it is that in most languages every type silently
                  includes it, so the compiler cannot tell you where a check is
                  missing. <code>strictNullChecks</code> is TypeScript&apos;s
                  answer: <b>if a value may be missing, the type says so, and
                  you check it before use.</b> If you can only enable one member
                  of the family, enable this one.
                </>
              }
              zh={
                <>
                  null 引用是 Tony Hoare 在 1965 年引入的,他在 2009
                  年公开为此道歉,称之为自己的「十亿美元错误」。
                  问题不在这个值本身,而在于多数语言里每个类型都默默包含它,
                  于是编译器没法告诉你哪里漏了检查。
                  <code>strictNullChecks</code> 是 TypeScript 给出的回答:
                  <b>值可能没有,就写进类型;要用,先检查。</b>
                  如果这一族里只能开一项,就开它。
                </>
              }
            />
          </p>
        </Callout>

        <p className="sec-desc">
          <T
            en={
              <>
                The remaining seven, in one table. The column to read is the
                last one: what goes unnoticed while the check is off.
              </>
            }
            zh={
              <>
                剩下七项,一张表过。要读的是最后一列:
                这项检查关着时,什么会被漏掉。
              </>
            }
          />
        </p>

        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Check" zh="检查项" />
                </th>
                <th>
                  <T en="What it does" zh="它做什么" />
                </th>
                <th>
                  <T en="What is missed while it is off" zh="关着时漏掉什么" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>strictFunctionTypes</b>
                </td>
                <td>
                  <T
                    en="Compares function parameter types more strictly when one function type is assigned to another"
                    zh="把一个函数类型赋给另一个时,按更严的规则比对参数类型"
                  />
                </td>
                <td>
                  <T
                    en={
                      <>
                        A function that only handles <code>Cat</code> is
                        accepted where one handling any <code>Animal</code> is
                        expected. <code>TS2322</code>
                      </>
                    }
                    zh={
                      <>
                        只能处理 <code>Cat</code> 的函数,
                        被放到了要求处理任意 <code>Animal</code> 的位置。
                        <code>TS2322</code>
                      </>
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>strictBindCallApply</b>
                </td>
                <td>
                  <T
                    en={
                      <>
                        Checks the arguments of <code>bind</code>,{" "}
                        <code>call</code> and <code>apply</code> against the
                        original signature
                      </>
                    }
                    zh={
                      <>
                        把 <code>bind</code>、<code>call</code>、
                        <code>apply</code> 的参数拿去和原函数的签名比对
                      </>
                    }
                  />
                </td>
                <td>
                  <T
                    en={
                      <>
                        <code>greet.call(null, &quot;boba&quot;, &quot;3&quot;)</code>{" "}
                        passes although the second parameter is a number.{" "}
                        <code>TS2345</code>
                      </>
                    }
                    zh={
                      <>
                        第二个参数本该是数字,
                        <code>greet.call(null, &quot;boba&quot;, &quot;3&quot;)</code>{" "}
                        照样通过。<code>TS2345</code>
                      </>
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>strictPropertyInitialization</b>
                </td>
                <td>
                  <T
                    en="A declared class property must be assigned, in the declaration or in the constructor"
                    zh="声明了的 class 属性必须赋值 —— 在声明处或构造函数里"
                  />
                </td>
                <td>
                  <T
                    en={
                      <>
                        A property you meant to assign later stays{" "}
                        <code>undefined</code> until something reads it.{" "}
                        <code>TS2564</code>
                      </>
                    }
                    zh={
                      <>
                        打算「回头再赋值」的属性一直是 <code>undefined</code>,
                        直到有人去读它。<code>TS2564</code>
                      </>
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>strictBuiltinIteratorReturn</b>
                </td>
                <td>
                  <T
                    en={
                      <>
                        <code>next()</code> on a built-in iterator returns{" "}
                        <code>IteratorResult&lt;T, undefined&gt;</code> instead
                        of <code>&lt;T, any&gt;</code>
                      </>
                    }
                    zh={
                      <>
                        内置迭代器的 <code>next()</code> 返回{" "}
                        <code>IteratorResult&lt;T, undefined&gt;</code>,
                        而不是 <code>&lt;T, any&gt;</code>
                      </>
                    }
                  />
                </td>
                <td>
                  <T
                    en={
                      <>
                        After <code>r.done</code>, <code>r.value</code> is{" "}
                        <code>any</code>, so any call on it is allowed.{" "}
                        <code>TS18048</code>
                      </>
                    }
                    zh={
                      <>
                        <code>r.done</code> 之后 <code>r.value</code> 是{" "}
                        <code>any</code>,在它上面调什么都合法。
                        <code>TS18048</code>
                      </>
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>noImplicitThis</b>
                </td>
                <td>
                  <T
                    en={
                      <>
                        Reports <code>this</code> where its type cannot be
                        inferred
                      </>
                    }
                    zh={
                      <>
                        <code>this</code> 的类型推不出来时报错
                      </>
                    }
                  />
                </td>
                <td>
                  <T
                    en={
                      <>
                        <code>this</code> in a stray function is{" "}
                        <code>any</code>, so every property read off it is
                        unchecked. <code>TS2683</code>
                      </>
                    }
                    zh={
                      <>
                        游离函数里的 <code>this</code> 是 <code>any</code>,
                        从它上面读的每个属性都不受检查。<code>TS2683</code>
                      </>
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>alwaysStrict</b>
                </td>
                <td>
                  <T
                    en={
                      <>
                        Parses your files in strict mode and adds{" "}
                        <code>&quot;use strict&quot;</code> to non-module output
                      </>
                    }
                    zh={
                      <>
                        用严格模式解析你的文件,并给非模块产物加上{" "}
                        <code>&quot;use strict&quot;</code>
                      </>
                    }
                  />
                </td>
                <td>
                  <T
                    en="The loose-mode behaviors of older JavaScript, such as assigning to a variable that was never declared"
                    zh="旧 JavaScript 松散模式下的那些行为,比如给一个从未声明的变量赋值"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>useUnknownInCatchVariables</b>
                </td>
                <td>
                  <T
                    en={
                      <>
                        The variable bound by <code>catch</code> has type{" "}
                        <code>unknown</code>, not <code>any</code>
                      </>
                    }
                    zh={
                      <>
                        <code>catch</code> 绑定的变量类型是{" "}
                        <code>unknown</code>,不是 <code>any</code>
                      </>
                    }
                  />
                </td>
                <td>
                  <T
                    en={
                      <>
                        <code>e.message</code> is used directly, but what was
                        thrown need not be an <code>Error</code> — it can be a
                        string. <code>TS18046</code>
                      </>
                    }
                    zh={
                      <>
                        <code>e.message</code> 被直接使用,但 throw
                        出来的未必是 <code>Error</code> —— 也可以是个字符串。
                        <code>TS18046</code>
                      </>
                    }
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout
          tone="idea"
          title={{
            en: "Some of these depend on strictNullChecks",
            zh: "有几项要靠 strictNullChecks 才成立",
          }}
        >
          <p>
            <T
              en={
                <>
                  <code>strictPropertyInitialization</code> cannot work on its
                  own. &quot;Never assigned&quot; means &quot;the value is{" "}
                  <code>undefined</code>&quot;, and without{" "}
                  <code>strictNullChecks</code> that sentence has no meaning.
                  The compiler does not merely ignore the combination — it
                  refuses it:{" "}
                  <code>
                    TS5052: Option
                    &apos;strictPropertyInitialization&apos; cannot be specified
                    without specifying option &apos;strictNullChecks&apos;.
                  </code>
                </>
              }
              zh={
                <>
                  <code>strictPropertyInitialization</code> 没法单独成立。
                  「没赋值」的意思就是「值是 <code>undefined</code>」,
                  而 <code>strictNullChecks</code> 关着时这句话不成立。
                  编译器不是忽略这个组合,而是直接拒绝:
                  <code>
                    TS5052: Option
                    &apos;strictPropertyInitialization&apos; cannot be specified
                    without specifying option &apos;strictNullChecks&apos;.
                  </code>
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  This is one reason the recommendation is to write{" "}
                  <code>strict: true</code> rather than list the members
                  individually: they are designed to work together, and picking
                  a subset is how you end up with a flag that is on and doing
                  nothing.
                </>
              }
              zh={
                <>
                  这也是为什么推荐直接写 <code>strict: true</code>,
                  而不是把成员一条条列出来:它们本来是配套设计的,
                  自己挑一部分,很容易挑出一个「开着但什么也没做」的选项。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 家族之外 ================= */}
      <Section
        id="beyond"
        index="03"
        title={{
          en: "strict is not every check: the two that stay outside",
          zh: "strict 不等于全部检查:留在家族之外的两项",
        }}
        desc={{
          en: "Two checks worth having are not part of strict: true. You enable them yourself, and tsc --init now does it for you in a new project.",
          zh: "有两项很值钱的检查,不属于 strict: true,得你自己开 —— 而 tsc --init 现在会为新项目替你开好。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                The first is <b>noUncheckedIndexedAccess</b>. Reading{" "}
                <code>arr[0]</code> gives you the element type, and the compiler
                assumes the index is in range. With the whole{" "}
                <code>strict</code> family on, the code on the left still
                compiles:
              </>
            }
            zh={
              <>
                第一项是 <b>noUncheckedIndexedAccess</b>。读{" "}
                <code>arr[0]</code> 得到的是元素类型,
                编译器默认下标不会越界。即便 <code>strict</code> 家族全开,
                左边这段照样能编译:
              </>
            }
          />
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title={{
                en: "Off · the index is trusted",
                zh: "关 · 下标被无条件相信",
              }}
              hl={[4]}
              code={S3_NUIA_OFF}
              note={
                <T
                  en={
                    <>
                      The array has three elements, so <code>sizes[3]</code> is{" "}
                      <code>undefined</code> at runtime. The type says{" "}
                      <code>string</code>, and nothing contradicts it.
                    </>
                  }
                  zh={
                    <>
                      数组只有三个元素,所以运行时 <code>sizes[3]</code> 是{" "}
                      <code>undefined</code>。而类型说它是 <code>string</code>,
                      没有任何东西反驳这句话。
                    </>
                  }
                />
              }
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title={{
                en: "On · every index read may be missing",
                zh: "开 · 每次下标取值都可能没有",
              }}
              hl={[1, 5]}
              code={S3_NUIA_ON}
              note={
                <T
                  en={
                    <>
                      Every index read becomes <code>T | undefined</code>, so
                      you narrow it before use. Note the dependency: this flag
                      needs <code>strictNullChecks</code>. Without it,{" "}
                      <code>string | undefined</code> collapses back to{" "}
                      <code>string</code> and the flag has no effect at all.
                    </>
                  }
                  zh={
                    <>
                      每次下标取值都变成 <code>T | undefined</code>,
                      想用就得先收窄。注意它的依赖:这个选项需要{" "}
                      <code>strictNullChecks</code>。后者关着时,
                      <code>string | undefined</code> 会退回成{" "}
                      <code>string</code>,于是这个选项完全没有效果。
                    </>
                  }
                />
              }
            />
          }
        />

        <p className="sec-desc">
          <T
            en={
              <>
                The second is <b>exactOptionalPropertyTypes</b>. It separates
                two things that an optional property normally mixes together:
                the key being absent, and the key being present with the value{" "}
                <code>undefined</code>.
              </>
            }
            zh={
              <>
                第二项是 <b>exactOptionalPropertyTypes</b>。
                可选属性平时把两件事混在一起,它把它们分开:
                键不存在,和键存在但值是 <code>undefined</code>。
              </>
            }
          />
        </p>

        <CodeBlock
          lang="ts"
          title="exactOptionalPropertyTypes"
          hl={[6, 14]}
          code={S3_EOPT}
          note={
            <T
              en={
                <>
                  The distinction sounds academic until you write a runtime
                  check. <code>{`"topping" in o`}</code> and{" "}
                  <code>Object.keys(o)</code> ask whether the key is there. Only
                  under this flag does the answer line up with the type, so
                  narrowing on <code>in</code> gives you <code>string</code>{" "}
                  rather than <code>string | undefined</code>.
                </>
              }
              zh={
                <>
                  这个区分听着像抬杠,直到你写一个运行时判断。
                  <code>{`"topping" in o`}</code> 和{" "}
                  <code>Object.keys(o)</code> 问的是「键在不在」。
                  只有开了这个选项,答案才和类型对得上 —— 用 <code>in</code>{" "}
                  收窄之后拿到的是 <code>string</code>,而不是{" "}
                  <code>string | undefined</code>。
                </>
              }
            />
          }
        />

        <Callout
          tone="warn"
          title={{
            en: "Why they are not in strict",
            zh: "为什么它们不在 strict 里",
          }}
        >
          <p>
            <T
              en={
                <>
                  Both report on patterns that appear everywhere in existing
                  code. <code>noUncheckedIndexedAccess</code> has something to
                  say about <b>every</b> index read, so turning it on in a large
                  codebase can produce hundreds of errors that are individually
                  small and collectively a project. Keeping them out of{" "}
                  <code>strict</code> means an existing project can adopt{" "}
                  <code>strict</code> without also taking that on.
                </>
              }
              zh={
                <>
                  这两项针对的都是存量代码里到处都有的写法。
                  <code>noUncheckedIndexedAccess</code> 对<b>每一次</b>
                  下标读取都有话说,所以在一个大项目里打开它,
                  可能冒出几百个错 —— 单个都很小,加起来是一个项目。
                  把它们放在 <code>strict</code> 之外,
                  存量项目就可以先采用 <code>strict</code>,不必同时接下这件事。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  A new project has no such backlog, and{" "}
                  <code>tsc --init</code> reflects that: it writes both options
                  as <code>true</code>. Also note that{" "}
                  <code>exactOptionalPropertyTypes</code> has the same hard
                  dependency as <code>strictPropertyInitialization</code> — set
                  it without <code>strictNullChecks</code> and the compiler
                  reports <code>TS5052</code> and refuses to run.
                </>
              }
              zh={
                <>
                  新项目没有这个包袱,<code>tsc --init</code> 也体现了这一点:
                  它把两个选项都写成 <code>true</code>。另外注意,
                  <code>exactOptionalPropertyTypes</code> 和{" "}
                  <code>strictPropertyInitialization</code> 有同样的硬依赖 ——
                  不开 <code>strictNullChecks</code> 就设它,编译器会报{" "}
                  <code>TS5052</code> 并拒绝运行。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §04 产物设置 ================= */}
      <Section
        id="output"
        index="04"
        title={{
          en: "The output side: target, lib, module",
          zh: "产物侧:target、lib、module",
        }}
        desc={{
          en: "These options describe the environment your code will run in. They are easy to confuse with each other, and each one answers a different question.",
          zh: "这一组选项描述的是「代码要跑在什么环境里」。它们很容易被混作一谈,而每一个回答的其实是不同的问题。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                <b>target</b> decides which generation of JavaScript syntax the
                compiler writes. Anything newer than the target gets rewritten
                into an older equivalent. Switch it and compare:
              </>
            }
            zh={
              <>
                <b>target</b> 决定编译器写出哪一代 JavaScript 语法。
                比 target 更新的写法,都会被改写成较旧的等价形式。
                拨一下对比看看:
              </>
            }
          />
        </p>

        <TargetSwitch />

        <p className="sec-desc">
          <T
            en={
              <>
                <b>lib</b> is the option people mistake for <code>target</code>.{" "}
                <code>target</code> controls the syntax that comes out;{" "}
                <code>lib</code> controls which <b>type declarations exist</b>{" "}
                while the compiler checks — whether <code>Promise</code>,{" "}
                <code>Map</code>, <code>Array.prototype.at</code> and{" "}
                <code>document</code> are known names at all. Setting{" "}
                <code>target</code> also picks a default <code>lib</code>, which
                is why the two feel like one option until you need them apart:
              </>
            }
            zh={
              <>
                <b>lib</b> 是最常被当成 <code>target</code> 的那个选项。
                <code>target</code> 管的是产出的语法;<code>lib</code>{" "}
                管的是编译器检查时<b>有哪些类型声明存在</b> —— 也就是{" "}
                <code>Promise</code>、<code>Map</code>、
                <code>Array.prototype.at</code>、<code>document</code>{" "}
                这些名字到底认不认识。设了 <code>target</code>{" "}
                就顺带定了一个默认 <code>lib</code>,
                所以在你需要把它们分开之前,这两个选项感觉像是一个:
              </>
            }
          />
        </p>

        <CodeBlock
          lang="ts"
          title={{
            en: "target and lib answer different questions",
            zh: "target 和 lib 回答的是不同的问题",
          }}
          hl={[3, 9, 12]}
          code={S4_LIB}
          note={
            <T
              en={
                <>
                  This is the case that makes the split obvious: you want{" "}
                  <code>Promise</code> to have types while still emitting ES5
                  syntax, so you set the two separately. But be careful what you
                  are saying. <code>lib</code> is a <b>claim</b> about the
                  runtime, and the compiler takes your word for it. It does not
                  add a polyfill. Claim <code>es2022</code>, then run on an
                  engine with no <code>Promise</code>, and the failure happens
                  at runtime with nothing reported at compile time.
                </>
              }
              zh={
                <>
                  这就是让区别变明显的那种情况:你想让 <code>Promise</code>{" "}
                  有类型,同时仍然产出 ES5 语法,于是把两个选项分开设。
                  但要清楚你说出口的是什么。<code>lib</code>{" "}
                  是你对运行环境的<b>声明</b>,编译器会信你的话,
                  它不会加 polyfill。声明了 <code>es2022</code>,
                  却跑在没有 <code>Promise</code> 的引擎上,
                  就是运行时失败,而编译期一声不响。
                </>
              }
            />
          }
        />

        <p className="sec-desc">
          <T
            en={
              <>
                <b>module</b> and <b>moduleResolution</b> are also two settings,
                not one. <code>module</code> is the module format the compiler
                writes out. <code>moduleResolution</code> is the algorithm it
                uses to find the file behind{" "}
                <code>import &quot;./util&quot;</code>. In practice you pick a
                pair, and which pair depends on who consumes the output:
              </>
            }
            zh={
              <>
                <b>module</b> 和 <b>moduleResolution</b> 同样是两个选项,
                不是一个。<code>module</code> 是编译器写出的模块格式,
                <code>moduleResolution</code> 是它用来找到{" "}
                <code>import &quot;./util&quot;</code>{" "}
                背后那个文件的算法。实际配置时你是成对选的,
                而选哪一对取决于谁消费产物:
              </>
            }
          />
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="json"
              title={{
                en: "Output that Node runs directly",
                zh: "产物直接给 Node 跑",
              }}
              hl={[3]}
              code={S4_NODE}
              note={
                <T
                  en={
                    <>
                      <code>nodenext</code> follows Node&apos;s own rules,
                      including the <code>type</code> and <code>exports</code>{" "}
                      fields in <code>package.json</code>. It also fixes{" "}
                      <code>moduleResolution</code> for you — set that to
                      anything else and you get{" "}
                      <code>
                        TS5109: Option &apos;moduleResolution&apos; must be set
                        to &apos;NodeNext&apos;
                      </code>
                      , so leave it out.
                    </>
                  }
                  zh={
                    <>
                      <code>nodenext</code> 按 Node 自己的规则来,
                      包括 <code>package.json</code> 里的 <code>type</code> 和{" "}
                      <code>exports</code> 字段。它同时替你定下{" "}
                      <code>moduleResolution</code> —— 你写成别的会得到{" "}
                      <code>
                        TS5109: Option &apos;moduleResolution&apos; must be set
                        to &apos;NodeNext&apos;
                      </code>
                      ,所以干脆不写。
                    </>
                  }
                />
              }
            />
          }
          right={
            <CodeBlock
              lang="json"
              title={{
                en: "Output a bundler consumes",
                zh: "产物交给打包器",
              }}
              hl={[3, 4, 7]}
              code={S4_BUNDLER}
              note={
                <T
                  en={
                    <>
                      <code>bundler</code> matches how Vite and esbuild actually
                      resolve imports, so the compiler agrees with the tool that
                      will do the work. It requires <code>module</code> to be{" "}
                      <code>esnext</code>, <code>preserve</code>, or{" "}
                      <code>es2015</code> or later — otherwise{" "}
                      <code>TS5095</code>. And since the bundler produces the
                      JavaScript, <code>noEmit</code> is usually right here.
                    </>
                  }
                  zh={
                    <>
                      <code>bundler</code> 对齐的是 Vite 和 esbuild
                      实际的解析行为,这样编译器和真正干活的那个工具说的是一致的。
                      它要求 <code>module</code> 是 <code>esnext</code>、
                      <code>preserve</code>,或 <code>es2015</code> 及以上 ——
                      否则报 <code>TS5095</code>。而既然 JavaScript
                      由打包器产出,这里通常就该开 <code>noEmit</code>。
                    </>
                  }
                />
              }
            />
          }
        />

        <p className="sec-desc">
          <T
            en="The rest of the output group, one line each:"
            zh="产物这一组剩下的选项,一句话一个:"
          />
        </p>

        <div className="grid-2">
          <div className="card">
            <div className="card-title">outDir / rootDir</div>
            <p>
              <T
                en={
                  <>
                    Where the output goes (<code>dist</code>) and where the
                    sources are (<code>src</code>). Without{" "}
                    <code>outDir</code>, each <code>.js</code> lands next to its{" "}
                    <code>.ts</code>, which makes the source tree hard to read
                    and easy to commit by accident.
                  </>
                }
                zh={
                  <>
                    产物去哪(<code>dist</code>)、源码在哪(<code>src</code>)。
                    不设 <code>outDir</code>,每个 <code>.js</code>{" "}
                    就落在自己的 <code>.ts</code> 旁边 ——
                    源码树变得难读,也很容易误提交。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">sourceMap</div>
            <p>
              <T
                en={
                  <>
                    Writes a map from the output back to the source, so a
                    debugger and a stack trace can point at your{" "}
                    <code>.ts</code> line instead of the emitted line. Turn it
                    on.
                  </>
                }
                zh={
                  <>
                    写出一份从产物回到源码的映射,
                    于是调试器和堆栈信息可以指向你的 <code>.ts</code>{" "}
                    那一行,而不是产物那一行。开着。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">verbatimModuleSyntax</div>
            <p>
              <T
                en={
                  <>
                    An import used only as a type must be written{" "}
                    <code>import type</code>, or you get{" "}
                    <code>TS1484</code>. The compiler then never has to guess
                    whether an import can be deleted — it deletes exactly the{" "}
                    <code>type</code> ones. Chapter 09 covers this.
                  </>
                }
                zh={
                  <>
                    只当类型用的导入必须写成 <code>import type</code>,
                    否则报 <code>TS1484</code>。这样编译器就不必猜
                    「这个 import 能不能删」—— 它只删标了 <code>type</code>{" "}
                    的那些。第 09 章讲这件事。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">isolatedModules</div>
            <p>
              <T
                en={
                  <>
                    Rejects code that cannot be compiled one file at a time. For
                    example, re-exporting a type without <code>export type</code>{" "}
                    gives <code>TS1205</code>. Necessary when a single-file
                    transpiler such as Babel, <code>swc</code> or esbuild does
                    the emitting, because it never sees your other files.
                  </>
                }
                zh={
                  <>
                    拒绝那些无法「一个文件一个文件单独编译」的写法。
                    比如不写 <code>export type</code> 就转发一个类型,会报{" "}
                    <code>TS1205</code>。当产物由 Babel、<code>swc</code>{" "}
                    或 esbuild 这类单文件转译器生成时,这一项是必要的 ——
                    它们看不到你的其他文件。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">esModuleInterop</div>
            <p>
              <T
                en={
                  <>
                    Lets you write{" "}
                    <code>import legacy from &quot;legacy&quot;</code> for a
                    CommonJS module that uses <code>export =</code>. Without it:{" "}
                    <code>
                      TS1259: Module can only be default-imported using the
                      &apos;esModuleInterop&apos; flag
                    </code>
                    . It also changes the emitted interop code, so it is on by
                    default in modern setups.
                  </>
                }
                zh={
                  <>
                    让你可以对一个用 <code>export =</code> 的 CommonJS 模块写{" "}
                    <code>import legacy from &quot;legacy&quot;</code>。
                    不开会报{" "}
                    <code>
                      TS1259: Module can only be default-imported using the
                      &apos;esModuleInterop&apos; flag
                    </code>
                    。它同时会改变产物里的互操作代码,
                    所以现代配置里默认是开的。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">noEmit / noEmitOnError</div>
            <p>
              <T
                en={
                  <>
                    <code>noEmit</code>: check and write nothing — the right
                    setting when another tool produces the JavaScript.{" "}
                    <code>noEmitOnError</code>: write output only when there are
                    no errors. They are different questions, and the default for
                    both is off.
                  </>
                }
                zh={
                  <>
                    <code>noEmit</code>:只检查、不写文件 ——
                    JavaScript 由别的工具产出时,就该用它。
                    <code>noEmitOnError</code>:只在没有报错时才写产物。
                    这是两个不同的问题,而两者默认都是关的。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <Callout
          tone="deep"
          title={{
            en: "skipLibCheck, and why nearly everyone turns it on",
            zh: "skipLibCheck:为什么几乎所有人都开它",
          }}
        >
          <p>
            <T
              en={
                <>
                  <code>skipLibCheck: true</code> skips type checking{" "}
                  <b>
                    inside <code>.d.ts</code> files
                  </b>{" "}
                  — all of them, including any you wrote yourself. It does not
                  skip your <code>.ts</code> code, and it does not stop those
                  declarations from being used to check your code. What it skips
                  is checking the declaration files against themselves.
                </>
              }
              zh={
                <>
                  <code>skipLibCheck: true</code> 跳过的是
                  <b>
                    <code>.d.ts</code> 文件内部
                  </b>
                  的类型检查 —— 全部 <code>.d.ts</code>,
                  包括你自己写的那些。它不跳过你的 <code>.ts</code> 代码,
                  也不影响这些声明继续被用来检查你的代码。
                  它跳过的只是「声明文件自己有没有毛病」这一项。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Strictly this loses information: a library&apos;s declarations
                  really can be wrong. In practice those errors are not yours to
                  fix, and two libraries whose global declarations disagree can
                  otherwise fail your build for a reason that has nothing to do
                  with your code. The common choice is to turn it on and spend
                  the checking on your own files.
                </>
              }
              zh={
                <>
                  严格来说这会丢信息:库的声明文件确实可能有错。
                  但现实里那些错不归你修,而两个库的全局声明互相冲突时,
                  还会因为一个与你的代码无关的原因让构建失败。
                  常见的选择是打开它,把检查的力气花在自己的文件上。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  One related option worth knowing:{" "}
                  <code>erasableSyntaxOnly</code> (TypeScript 5.8 and later)
                  rejects any syntax that has a runtime effect and therefore
                  cannot be removed by simply stripping types —{" "}
                  <code>enum</code>, <code>namespace</code> with a body, and
                  constructor parameter properties. The error is{" "}
                  <code>
                    TS1294: This syntax is not allowed when
                    &apos;erasableSyntaxOnly&apos; is enabled.
                  </code>{" "}
                  It matters if you want your files to be runnable by a tool
                  that only strips types, such as recent versions of Node.
                </>
              }
              zh={
                <>
                  有个相关的选项值得知道:<code>erasableSyntaxOnly</code>
                  (TypeScript 5.8 起)会拒绝一切有运行时效果、
                  因此无法「只擦类型」就去掉的语法 —— <code>enum</code>、
                  带实现的 <code>namespace</code>、构造函数参数属性。报错是{" "}
                  <code>
                    TS1294: This syntax is not allowed when
                    &apos;erasableSyntaxOnly&apos; is enabled.
                  </code>{" "}
                  如果你希望自己的文件能被「只擦类型」的工具直接运行
                  (比如较新版本的 Node),这一项就有意义。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §05 渐进迁移 ================= */}
      <Section
        id="migrate"
        index="05"
        title={{
          en: "In practice: migrating a JavaScript project",
          zh: "实战:把一个 JavaScript 项目迁过来",
        }}
        desc={{
          en: "Three JavaScript files, 900 lines, nobody has changed them in years. The system cannot stop running while you work.",
          zh: "三个 JavaScript 文件,九百行,好几年没人敢改。而你干活的时候,系统不能停。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                The approach that fails is doing it all at once: rename every
                file, turn <code>strict</code> all the way up, and face four
                hundred errors with no way to ship a partial fix. The approach
                that works is <b>incremental</b>: the system runs at every step,
                and every step is stricter than the one before it. Step through
                it:
              </>
            }
            zh={
              <>
                失败的做法是一次做完:所有文件改名,<code>strict</code> 开满,
                然后面对四百个报错,又没法只上线一部分修复。
                有效的做法是<b>渐进</b>:每一步系统都在跑,
                每一步都比上一步严。一帧一帧走一遍:
              </>
            }
          />
        </p>

        <MigrateStepper />

        <p className="sec-desc">
          <T
            en={
              <>
                The day-2 step does not have to touch tsconfig at all. Two
                comments at the top of one <code>.js</code> file are enough: one
                to turn the checker on, one to give it a type to compare
                against.
              </>
            }
            zh={
              <>
                第 2 天那一步其实不必动 tsconfig。在某个 <code>.js</code>{" "}
                文件顶部写两行注释就够了:一行打开检查,
                一行给它一个可以对照的类型。
              </>
            }
          />
        </p>

        <CodeBlock
          lang="js"
          title={{
            en: "boss.js · two comments, no rename",
            zh: "boss.js · 两行注释,不改文件名",
          }}
          hl={[1, 2]}
          code={S5_TSCHECK}
          note={
            <T
              en={
                <>
                  Both lines matter. <code>{"// @ts-check"}</code> turns the
                  checker on for this file. The <code>@type</code> comment gives{" "}
                  <code>menu</code> a type — without it, <code>menu</code> is{" "}
                  <code>any</code>, and reading <code>it.pirce</code> off an{" "}
                  <code>any</code> is allowed, so the typo would go unreported.
                  JSDoc types are a bridge for the migration, not the
                  destination: when the file becomes <code>.ts</code>, they turn
                  into ordinary type annotations.
                </>
              }
              zh={
                <>
                  两行都重要。<code>{"// @ts-check"}</code>{" "}
                  为这个文件打开检查。<code>@type</code> 注释给{" "}
                  <code>menu</code> 一个类型 —— 没有它,<code>menu</code> 是{" "}
                  <code>any</code>,而在 <code>any</code> 上读{" "}
                  <code>it.pirce</code> 是合法的,拼写错误就不会被报出来。
                  JSDoc 类型是迁移期的桥,不是终点:等文件改成{" "}
                  <code>.ts</code>,它们就变成普通的类型标注。
                </>
              }
            />
          }
        />

        <p className="sec-desc">
          <T
            en={
              <>
                Every migration has errors you cannot fix today. There are two
                comments for silencing one line, and they behave very
                differently over time:
              </>
            }
            zh={
              <>
                每次迁移都会有今天修不了的错。
                压住一行有两种注释,而它们随时间的表现差得很远:
              </>
            }
          />
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title={{
                en: "@ts-ignore · silent forever",
                zh: "@ts-ignore · 永远沉默",
              }}
              hl={[1]}
              code={S5_IGNORE}
              note={
                <T
                  en="It hides the error, and it also hides the good news that the error is gone."
                  zh="它盖住错误,同时也盖住了「错误已经不存在」这个好消息。"
                />
              }
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title={{
                en: "@ts-expect-error · reports itself",
                zh: "@ts-expect-error · 会自己报错",
              }}
              hl={[1]}
              code={S5_EXPECT}
              note={
                <T
                  en={
                    <>
                      It states &quot;I expect an error here&quot;. When the
                      error goes, the claim becomes false and the comment
                      reports. <b>Use this one during a migration</b>, and write
                      the reason after it.
                    </>
                  }
                  zh={
                    <>
                      它说的是「我预期这里有错」。错误消失时,
                      这句话变成假的,于是注释自己报错。
                      <b>迁移期用它</b>,并在后面写上原因。
                    </>
                  }
                />
              }
            />
          }
        />
      </Section>

      {/* ================= §06 误区 ================= */}
      <Section
        id="pitfalls"
        index="06"
        title={{ en: "Four common mistakes", zh: "四个常见误区" }}
        desc={{
          en: "Most configuration problems are not about not knowing the options. They are about assuming something that is not true.",
          zh: "配置上的问题,多半不是「不知道有哪些选项」,而是「以为某件事是这样」。",
        }}
      >
        <Callout
          tone="warn"
          title={{
            en: "1 · \"New project — leave strict off for now, we will turn it on later\"",
            zh: "误区一 · 「新项目先别开 strict,以后再开」",
          }}
        >
          <p>
            <T
              en={
                <>
                  This has the order backwards. The cost of{" "}
                  <code>strict</code> grows with the amount of code. On day one
                  it is zero: each error is corrected in the minute you write
                  the line. Three months later it is several hundred errors
                  across code you no longer remember, plus the temptation to
                  leave it off permanently. Enabling <code>strict</code>{" "}
                  gradually is a sound strategy <b>for existing code</b>. For
                  new code it is just a postponed bill.
                </>
              }
              zh={
                <>
                  顺序反了。<code>strict</code> 的成本随代码量增长。
                  第一天它是零:每个错都在你写下那一行的那一分钟被纠正。
                  三个月后,它是散落在你已经记不清的代码里的几百个错,
                  外加一个「要不就这样吧」的念头。渐进地打开{" "}
                  <code>strict</code> 是<b>存量代码</b>的合理策略;
                  对新代码来说,它只是一张延后的账单。
                </>
              }
            />
          </p>
        </Callout>

        <Callout
          tone="warn"
          title={{
            en: "2 · Using @ts-ignore as a habit",
            zh: "误区二 · 把 @ts-ignore 当日常",
          }}
        >
          <p>
            <T
              en={
                <>
                  Each <code>@ts-ignore</code> is one line the checker no longer
                  reads. Occasionally that is a reasonable trade. As a habit it
                  removes the type system a line at a time, and nothing records
                  where: the project looks checked, and is full of exemptions
                  nobody can list. When you genuinely cannot fix something, use{" "}
                  <code>@ts-expect-error</code> with the reason written next to
                  it, so the note removes itself once the problem is gone.
                </>
              }
              zh={
                <>
                  每一个 <code>@ts-ignore</code> 都是检查器不再读的一行。
                  偶尔为之是合理的取舍;成为习惯,就是一行一行地拆掉类型系统,
                  而且没有任何地方记着拆在哪里:项目看起来是有检查的,
                  实际上到处是没人列得出来的豁免。真的修不了的时候,用{" "}
                  <code>@ts-expect-error</code> 并在旁边写上原因 ——
                  问题消失后,这条记录会自己要求被删掉。
                </>
              }
            />
          </p>
        </Callout>

        <Callout
          tone="warn"
          title={{
            en: "3 · \"target should always be the newest\"",
            zh: "误区三 · 「target 当然越新越好」",
          }}
        >
          <p>
            <T
              en={
                <>
                  <code>target</code> is not a version to compete on. It is a
                  statement about the environment your output will run in. If
                  that environment is a browser locked to an old version inside
                  a company network, setting <code>esnext</code> delivers a{" "}
                  <code>SyntaxError</code> to a real user. The compiler cannot
                  warn you, because <b>only you know where the output runs</b>.
                  Answer &quot;who runs this?&quot; first.
                </>
              }
              zh={
                <>
                  <code>target</code> 不是用来比新的版本号,
                  它是你对「产物要跑在什么环境里」的陈述。
                  如果那个环境是某个公司内网里锁定在旧版本的浏览器,
                  把它定成 <code>esnext</code>,就是把一个{" "}
                  <code>SyntaxError</code> 送到真实用户面前。
                  编译器没法提醒你,因为<b>只有你知道产物跑在哪</b>。
                  先回答「谁来跑」。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  The other half of this mistake is spending time on{" "}
                  <code>target</code> in a project where a bundler produces the
                  JavaScript. In that setup the bundler&apos;s own target
                  decides what ships, and tsconfig&apos;s <code>target</code>{" "}
                  only affects type checking and any files <code>tsc</code>{" "}
                  itself emits.
                </>
              }
              zh={
                <>
                  这个误区还有另一半:在一个由打包器产出 JavaScript
                  的项目里花时间调 <code>target</code>。那种配置下,
                  上线的语法由打包器自己的 target 决定,tsconfig 里的{" "}
                  <code>target</code> 只影响类型检查,以及 <code>tsc</code>{" "}
                  自己写出的那些文件。
                </>
              }
            />
          </p>
        </Callout>

        <Callout
          tone="warn"
          title={{
            en: "4 · Looking for the one correct tsconfig",
            zh: "误区四 · 找那份「正确的 tsconfig」",
          }}
        >
          <p>
            <T
              en={
                <>
                  There is no single correct configuration, and copying one from
                  another project usually brings settings that describe that
                  project&apos;s environment rather than yours. What is worth
                  copying is the reasoning. Two questions decide most of the
                  file: <b>who runs the output</b> — Node directly, or a bundler
                  — and <b>who produces it</b> — <code>tsc</code>, or another
                  tool with <code>tsc --noEmit</code> as the check.
                </>
              }
              zh={
                <>
                  不存在唯一正确的配置。
                  从别的项目抄一份过来,通常会一起抄来一些描述
                  「那个项目的环境」而不是你的环境的设置。
                  值得抄的是判断依据。两个问题就决定了这个文件的大半:
                  <b>谁运行产物</b> —— 直接是 Node,还是打包器;以及
                  <b>谁生成产物</b> —— <code>tsc</code>,
                  还是另一个工具加上 <code>tsc --noEmit</code> 做检查。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Two things are safe to say in general. Turn on{" "}
                  <code>strict</code> — for new code there is no argument
                  against it. And read the file you have, rather than inheriting
                  it: every option in it is a claim about your project, and some
                  of those claims may no longer be true.
                </>
              }
              zh={
                <>
                  有两件事可以一般性地说。开 <code>strict</code> ——
                  对新代码来说,没有反对的理由。以及,
                  把你手上这份文件读一遍,而不是继承它:
                  里面每一个选项都是关于你的项目的一句断言,
                  而其中有些可能已经不成立了。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §07 动手任务 ================= */}
      <Section
        id="labs"
        index="07"
        title={{ en: "Labs", zh: "动手任务" }}
        desc={{
          en: "A configuration file is not something you learn by reading. Run these in a terminal and in the Playground.",
          zh: "配置文件这种东西,读不出来。这几个任务在本机终端和 Playground 里跑一遍。",
        }}
      >
        <LabSet ch="tsconfig" items={LABS} />
      </Section>

      {/* ================= §08 通关测验 ================= */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Eight questions on what each option actually does.",
          zh: "八道题,考的是每个选项实际做了什么。",
        }}
      >
        <Quiz ch="tsconfig" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                <code>tsconfig.json</code> is read by both <code>tsc</code> and
                your editor&apos;s type service, so the same code gives the same
                answer in both. Its options fall into three groups: how much is
                checked, what the output looks like, and which files are
                included.
              </>
            ),
            zh: (
              <>
                <code>tsconfig.json</code> 由 <code>tsc</code>{" "}
                和编辑器的类型服务共同读取,所以同一份代码在两边得到同一个答案。
                它的选项分三类:检查多严、产物长什么样、管哪些文件。
              </>
            ),
          },
          {
            en: (
              <>
                <code>strict: true</code> turns on nine checks at once:{" "}
                <code>noImplicitAny</code>, <code>strictNullChecks</code>,{" "}
                <code>strictFunctionTypes</code>,{" "}
                <code>strictBindCallApply</code>,{" "}
                <code>strictPropertyInitialization</code>,{" "}
                <code>strictBuiltinIteratorReturn</code>,{" "}
                <code>noImplicitThis</code>,{" "}
                <code>useUnknownInCatchVariables</code>,{" "}
                <code>alwaysStrict</code>. Enable it on a new project&apos;s
                first day.
              </>
            ),
            zh: (
              <>
                <code>strict: true</code> 一次打开九项检查:
                <code>noImplicitAny</code>、<code>strictNullChecks</code>、
                <code>strictFunctionTypes</code>、
                <code>strictBindCallApply</code>、
                <code>strictPropertyInitialization</code>、
                <code>strictBuiltinIteratorReturn</code>、
                <code>noImplicitThis</code>、
                <code>useUnknownInCatchVariables</code>、
                <code>alwaysStrict</code>。新项目第一天就开。
              </>
            ),
          },
          {
            en: (
              <>
                <code>strict</code> is not every check.{" "}
                <code>noUncheckedIndexedAccess</code> (an index read becomes{" "}
                <code>T | undefined</code>) and{" "}
                <code>exactOptionalPropertyTypes</code> are outside it and must
                be enabled separately. Both need{" "}
                <code>strictNullChecks</code> to do anything.
              </>
            ),
            zh: (
              <>
                <code>strict</code> 不等于全部检查。
                <code>noUncheckedIndexedAccess</code>(下标取值变成{" "}
                <code>T | undefined</code>)和{" "}
                <code>exactOptionalPropertyTypes</code> 都在它之外,
                要单独开。两者都需要 <code>strictNullChecks</code> 才起作用。
              </>
            ),
          },
          {
            en: (
              <>
                <code>target</code> sets the emitted syntax level and a default{" "}
                <code>lib</code>; <code>lib</code> decides which type
                declarations exist and adds no polyfill. <code>module</code> is
                the format written out, <code>moduleResolution</code> is how
                imports are found. Node directly:{" "}
                <code>module: nodenext</code>. Behind a bundler:{" "}
                <code>esnext + moduleResolution: bundler</code>.
              </>
            ),
            zh: (
              <>
                <code>target</code> 定产出的语法代次,并顺带定一个默认{" "}
                <code>lib</code>;<code>lib</code> 决定有哪些类型声明存在,
                不会加 polyfill。<code>module</code> 是写出的模块格式,
                <code>moduleResolution</code> 是怎么找到 import 的东西。
                直接给 Node 跑:<code>module: nodenext</code>;
                交给打包器:
                <code>esnext + moduleResolution: bundler</code>。
              </>
            ),
          },
          {
            en: (
              <>
                <code>tsc</code> checks and writes one <code>.js</code> per
                input file; it does not bundle, and a type error does not stop
                it writing output unless <code>noEmitOnError</code> is set. If a
                bundler or <code>swc</code> produces your JavaScript and{" "}
                <code>tsc --noEmit</code> is only the check, the emit options do
                not affect what ships.
              </>
            ),
            zh: (
              <>
                <code>tsc</code> 会检查,并为每个输入文件写出一个{" "}
                <code>.js</code>;它不打包,而且除非设了{" "}
                <code>noEmitOnError</code>,类型报错也不会阻止它写产物。
                如果 JavaScript 是打包器或 <code>swc</code> 产出的、
                <code>tsc --noEmit</code> 只负责检查,
                那么产物类选项不影响上线的东西。
              </>
            ),
          },
          {
            en: (
              <>
                Migrate JavaScript incrementally: <code>allowJs</code>, then{" "}
                <code>checkJs</code> or <code>@ts-check</code> plus JSDoc types,
                then one file at a time to <code>.ts</code>, then the{" "}
                <code>strict</code> members one by one. Silence a line with{" "}
                <code>@ts-expect-error</code>, not <code>@ts-ignore</code>: it
                reports <code>TS2578</code> once the error is gone, so the note
                cannot be forgotten.
              </>
            ),
            zh: (
              <>
                迁移 JavaScript 走渐进路线:<code>allowJs</code> →
                <code>checkJs</code> 或 <code>@ts-check</code> 加 JSDoc 类型 →
                一次一个文件改成 <code>.ts</code> → <code>strict</code>{" "}
                的成员一项一项开。压住某一行用{" "}
                <code>@ts-expect-error</code>,不用 <code>@ts-ignore</code>:
                错误消失后它会报 <code>TS2578</code>,所以这笔账丢不了。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="tsconfig" />
    </main>
  );
}
