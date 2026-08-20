"use client";

// 10 · tsconfig 与严格模式 —— 动手任务 LABS + 通关测验 QUIZ 数据(双语)。
//
// 双语约定:正文用 <T en zh />,组件 props 用 { en, zh };
// 教学代码给 code 传 Loc<string>,两份只差注释,可执行行逐字节相同;
// 编译器报错原文一律不翻译。
//
// 本文件所有编译选项行为、报错码与报错文案,均在 TypeScript 5.9.3 下实测:
//  - tsc --init 生成的模板里,strict 在 "Recommended Options",
//    noUncheckedIndexedAccess / exactOptionalPropertyTypes 在
//    "Stricter Typechecking Options" —— 模板自己就说明了后两者不属于 strict。
//  - 只加 // @ts-check 而不补 JSDoc 类型,示例里的两个拼写错误抓不到
//    (参数推成 any,any 上取任何属性都合法)。补上 @param 才报
//    TS2551 / TS2339。
//  - @ts-expect-error 在下一行不再报错时,自身报 TS2578。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { T, type Loc } from "@/lib/i18n";
import { CodeBlock } from "@/lib/code";

/* ---------- LAB 01 ---------- */

const L1_TERMINAL: Loc<string> = {
  en: `mkdir tsconfig-lab && cd tsconfig-lab
npx tsc --init

# Save the demo code as order.ts, then:
npx tsc --noEmit
# 5 errors, one per switch on the panel in section 02.

# Now edit tsconfig.json:
#   "strict": false
#   "noUncheckedIndexedAccess": false
#   "exactOptionalPropertyTypes": false
npx tsc --noEmit
# 0 errors. The five bugs are still there.
# Nobody is looking for them any more.`,
  zh: `mkdir tsconfig-lab && cd tsconfig-lab
npx tsc --init

# 把演示代码存成 order.ts,然后:
npx tsc --noEmit
# 5 个错,对应 §02 调节台上的 5 个开关。

# 再改 tsconfig.json:
#   "strict": false
#   "noUncheckedIndexedAccess": false
#   "exactOptionalPropertyTypes": false
npx tsc --noEmit
# 0 个错。那 5 个 bug 一个都没走,
# 只是没人再去找它们了。`,
};

/* ---------- LAB 02 ---------- */

const L2_BEFORE = `const menu = [
  { name: "Four Seasons tea", price: 12 },
  { name: "Matcha latte", price: 15 },
];

function cheapest(list) {
  let low = list[0];
  for (const it of list) {
    if (it.pirce < low.price) low = it;
  }
  return low;
}

console.log(cheapest(menu).nmae);`;

const L2_AFTER = `// @ts-check
const menu = [
  { name: "Four Seasons tea", price: 12 },
  { name: "Matcha latte", price: 15 },
];

/** @param {{ name: string, price: number }[]} list */
function cheapest(list) {
  let low = list[0];
  for (const it of list) {
    // TS2551: Property 'pirce' does not exist on type
    // '{ name: string; price: number; }'. Did you mean 'price'?
    if (it.pirce < low.price) low = it;
  }
  return low;
}

// TS2339: Property 'nmae' does not exist on type
// '{ name: string; price: number; }'.
console.log(cheapest(menu).nmae);`;

/* ---------- LAB 03 ---------- */

const L3_SRC = `const label = (n: number, unit = "cup") => \`\${n} \${unit}\`;

const [first, ...rest] = ["boba", "jelly", "pudding"];

const ready: Promise<number> = Promise.resolve(1);

const last = [1, 2, 3].at(-1);`;

const L3_ES5: Loc<string> = {
  en: `// target: "es5", lib not set -> lib defaults to es5.
// TS2585: 'Promise' only refers to a type, but is being
// used as a value here. Do you need to change your target
// library? Try changing the 'lib' compiler option to
// es2015 or later.
// TS2550: Property 'at' does not exist on type 'number[]'.

// Add "lib": ["es2022"] and both errors disappear.
// The emitted JavaScript does not change:
var label = function (n, unit) {
    if (unit === void 0) { unit = "cup"; }
    return "".concat(n, " ").concat(unit);
};
var _a = ["boba", "jelly", "pudding"], first = _a[0], rest = _a.slice(1);`,
  zh: `// target: "es5",没写 lib -> lib 默认取 es5。
// TS2585: 'Promise' only refers to a type, but is being
// used as a value here. Do you need to change your target
// library? Try changing the 'lib' compiler option to
// es2015 or later.
// TS2550: Property 'at' does not exist on type 'number[]'.

// 补一行 "lib": ["es2022"],两个错都消失。
// 而产出的 JavaScript 一个字都没变:
var label = function (n, unit) {
    if (unit === void 0) { unit = "cup"; }
    return "".concat(n, " ").concat(unit);
};
var _a = ["boba", "jelly", "pudding"], first = _a[0], rest = _a.slice(1);`,
};

/* ---------- LAB 04 ---------- */

const L4_STEPS: Loc<string> = {
  en: `npx tsc --init
# 1. allowJs: true, checkJs off, strict: false
npx tsc --noEmit   # 0 errors: the .js files are
                   # included but not checked.

# 2. checkJs: true
npx tsc --noEmit   # some errors appear. They were
                   # always there; today they get named.

# 3. Rename one file at a time: order.js -> order.ts.
#    Fix its errors before you touch the next file.
#    Park what you cannot fix with @ts-expect-error.

# 4. noImplicitAny: true    -> fix
#    strictNullChecks: true -> fix

# 5. strict: true + noUncheckedIndexedAccess: true
npx tsc --noEmit   # 0 errors, and this time it means
                   # "checked, and there is nothing".`,
  zh: `npx tsc --init
# ① allowJs: true,checkJs 关,strict: false
npx tsc --noEmit   # 0 errors:.js 文件进来了,
                   # 但还没有被检查。

# ② checkJs: true
npx tsc --noEmit   # 冒出一批错。它们一直都在,
                   # 今天才被点名。

# ③ 一次改一个文件:order.js -> order.ts。
#    修完它的错再动下一个。
#    一时修不动的,用 @ts-expect-error 记账。

# ④ noImplicitAny: true    -> 修
#    strictNullChecks: true -> 修

# ⑤ strict: true + noUncheckedIndexedAccess: true
npx tsc --noEmit   # 0 errors,而这一次的 0 是
                   # 「查过了,真没有」。`,
};

export const LABS: Lab[] = [
  {
    id: "init-and-count",
    title: {
      en: "Run tsc --init, then count what the rules catch",
      zh: "跑一次 tsc --init,数数规则替你抓到几个",
    },
    d: "easy",
    tags: {
      en: ["tsc --init", "strict", "terminal"],
      zh: ["tsc --init", "strict", "本机终端"],
    },
    task: (
      <>
        <p>
          <T
            en={
              <>
                Make an empty directory and run <code>npx tsc --init</code>.
                Open the generated <code>tsconfig.json</code> and read it. Note
                which options are already <code>true</code>, and note the
                section names the template uses.
              </>
            }
            zh={
              <>
                新建一个空目录,跑 <code>npx tsc --init</code>。
                打开生成的 <code>tsconfig.json</code> 读一遍,
                记下哪些选项已经是 <code>true</code>,
                以及模板给它们分的段落名。
              </>
            }
          />
        </p>
        <p>
          <T
            en={
              <>
                Then save the demo code from the panel in section 02 as{" "}
                <code>order.ts</code>. Add these two lines at the top so the
                names resolve:
              </>
            }
            zh={
              <>
                然后把 §02 调节台里那段演示代码存成 <code>order.ts</code>。
                文件顶部补两行,免得报「找不到名字」:
              </>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title="order.ts"
          code={`declare function findOrder(id: string): { total: number } | null;
declare function submit(x: unknown): void;`}
        />
        <p>
          <T
            en={
              <>
                Run <code>npx tsc --noEmit</code> and count the errors. Then set{" "}
                <code>strict</code>, <code>noUncheckedIndexedAccess</code>, and{" "}
                <code>exactOptionalPropertyTypes</code> to <code>false</code>{" "}
                and run it again. The difference between the two counts is what
                this configuration is doing for you.
              </>
            }
            zh={
              <>
                跑 <code>npx tsc --noEmit</code>,数一数报错。然后把{" "}
                <code>strict</code>、<code>noUncheckedIndexedAccess</code>、
                <code>exactOptionalPropertyTypes</code> 都改成{" "}
                <code>false</code> 再跑一次。两个数字的差,
                就是这份配置替你做的事。
              </>
            }
          />
        </p>
      </>
    ),
    hint: {
      en: (
        <>
          <code>--noEmit</code> means check only, write no files. The template
          puts <code>strict</code> under &quot;Recommended Options&quot; and the
          other two under &quot;Stricter Typechecking Options&quot; — that split
          is the answer to &quot;is noUncheckedIndexedAccess part of
          strict?&quot;.
        </>
      ),
      zh: (
        <>
          <code>--noEmit</code> 的意思是只检查、不写文件。模板把{" "}
          <code>strict</code> 放在「Recommended Options」,
          另外两个放在「Stricter Typechecking Options」——
          这个分段本身就回答了「noUncheckedIndexedAccess 属于 strict 吗」。
        </>
      ),
    },
    solution: (
      <>
        <CodeBlock
          lang="bash"
          title={{ en: "Terminal", zh: "终端" }}
          code={L1_TERMINAL}
        />
        <p>
          <T
            en={
              <>
                Now turn <code>strict</code> back on but leave the other two
                off: you get <b>4</b> errors, not 5. The one that disappears is
                the <code>sizes[3]</code> line. That single experiment proves{" "}
                <code>noUncheckedIndexedAccess</code> is not part of{" "}
                <code>strict</code>.
              </>
            }
            zh={
              <>
                再把 <code>strict</code> 单独开回来,另外两个仍然关着:
                报错是 <b>4</b> 个,不是 5 个。少掉的那个正是{" "}
                <code>sizes[3]</code> 那一行。一次实验就够了 ——{" "}
                <code>noUncheckedIndexedAccess</code> 不属于{" "}
                <code>strict</code>。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "ts-check-rescue",
    title: {
      en: "@ts-check on JavaScript, and why one comment is not enough",
      zh: "给 JavaScript 加 @ts-check:为什么一行注释还不够",
    },
    d: "medium",
    tags: {
      en: ["@ts-check", "JSDoc", "migration"],
      zh: ["@ts-check", "JSDoc", "迁移"],
    },
    task: (
      <>
        <p>
          <T
            en={
              <>
                Save the file below as <code>boss.js</code> and open it in an
                editor with TypeScript support. It contains two misspelled
                property names: <code>pirce</code> and <code>nmae</code>. Add{" "}
                <code>{"// @ts-check"}</code> as the first line and see how many
                the editor reports.
              </>
            }
            zh={
              <>
                把下面这段存成 <code>boss.js</code>,
                用带 TypeScript 支持的编辑器打开。
                里面有两个写错的属性名:<code>pirce</code> 和{" "}
                <code>nmae</code>。在第一行加上{" "}
                <code>{"// @ts-check"}</code>,看编辑器报出几个。
              </>
            }
          />
        </p>
        <CodeBlock lang="js" title="boss.js" code={L2_BEFORE} />
        <p>
          <T
            en={
              <>
                The answer is <b>zero</b>. Work out why before you read the
                hint, then make the editor report both.
              </>
            }
            zh={
              <>
                答案是 <b>0 个</b>。先自己想清楚为什么,
                再想办法让编辑器把两个都报出来。
              </>
            }
          />
        </p>
      </>
    ),
    hint: {
      en: (
        <>
          <code>cheapest</code> has no type for its parameter, so{" "}
          <code>list</code> is <code>any</code>. Reading any property off an{" "}
          <code>any</code> value is allowed, so <code>it.pirce</code> is not an
          error yet. Give the parameter a type with a JSDoc comment:{" "}
          <code>
            {"/** @param {{ name: string, price: number }[]} list */"}
          </code>
          .
        </>
      ),
      zh: (
        <>
          <code>cheapest</code> 的参数没有类型,所以 <code>list</code> 是{" "}
          <code>any</code>。在 <code>any</code> 上取任何属性都是合法的,
          所以此刻 <code>it.pirce</code> 还不算错。用 JSDoc 给参数补一个类型:
          <code>
            {"/** @param {{ name: string, price: number }[]} list */"}
          </code>
          。
        </>
      ),
    },
    solution: (
      <>
        <CodeBlock
          lang="js"
          title={{
            en: "boss.js · both typos reported",
            zh: "boss.js · 两个错误都报出来了",
          }}
          hl={[1, 7]}
          code={L2_AFTER}
          note={
            <T
              en={
                <>
                  Two lessons in one file. <code>@ts-check</code> turns the
                  checker on for a single <code>.js</code> file and costs one
                  line. But a check needs types to compare against — with no
                  types, there is nothing to contradict.{" "}
                  <code>checkJs: true</code> does the same thing for every{" "}
                  <code>.js</code> file at once, and it has the same limit.
                </>
              }
              zh={
                <>
                  一个文件,两个教训。<code>@ts-check</code> 只用一行,
                  就为单个 <code>.js</code> 文件打开了检查。
                  但检查需要有类型可对照 —— 没有类型,就没有可矛盾的东西。
                  <code>checkJs: true</code> 做的是同一件事,
                  只不过一次覆盖所有 <code>.js</code> 文件,
                  也有同样的局限。
                </>
              }
            />
          }
        />
      </>
    ),
  },
  {
    id: "target-vs-lib",
    title: {
      en: "target and lib are two separate promises",
      zh: "target 和 lib 是两个不同的承诺",
    },
    d: "medium",
    tags: {
      en: ["target", "lib", "Playground"],
      zh: ["target", "lib", "Playground"],
    },
    task: (
      <>
        <p>
          <T
            en={
              <>
                Open typescriptlang.org/play. In the <b>TS Config</b> panel set{" "}
                <code>target</code> to <code>ES5</code> and leave{" "}
                <code>lib</code> unset. Paste this:
              </>
            }
            zh={
              <>
                打开 typescriptlang.org/play。在 <b>TS Config</b> 面板里把{" "}
                <code>target</code> 设成 <code>ES5</code>,<code>lib</code>{" "}
                不要设。粘贴这段:
              </>
            }
          />
        </p>
        <CodeBlock lang="ts" code={L3_SRC} />
        <p>
          <T
            en={
              <>
                Two errors appear. Read them: both suggest changing{" "}
                <code>lib</code>, not <code>target</code>. Now set{" "}
                <code>lib</code> to <code>ES2022</code> and keep{" "}
                <code>target</code> at <code>ES5</code>. The errors go away.
                Then open the <b>.JS</b> tab and check whether the emitted code
                changed.
              </>
            }
            zh={
              <>
                会出现两个错。读一读:两个都建议你改 <code>lib</code>,
                不是 <code>target</code>。现在把 <code>lib</code> 设成{" "}
                <code>ES2022</code>,<code>target</code> 仍然留在{" "}
                <code>ES5</code>,报错就消失了。然后切到 <b>.JS</b> 标签,
                看看产出的代码有没有变。
              </>
            }
          />
        </p>
      </>
    ),
    hint: {
      en: (
        <>
          <code>target</code> decides which syntax the compiler writes out.{" "}
          <code>lib</code> decides which type declarations exist while it
          checks. Setting <code>target</code> also picks a default{" "}
          <code>lib</code> — which is why the two feel like one option until you
          set them apart.
        </>
      ),
      zh: (
        <>
          <code>target</code> 决定编译器写出哪一代语法。<code>lib</code>{" "}
          决定检查时有哪些类型声明可用。设了 <code>target</code>{" "}
          就顺带定了一个默认 <code>lib</code> ——
          所以在你把它们分开设之前,这两个选项感觉像是一个。
        </>
      ),
    },
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title={{
            en: "What each of the two settings did",
            zh: "两个选项各做了什么",
          }}
          code={L3_ES5}
          note={
            <T
              en={
                <>
                  The emitted JavaScript is identical before and after, because{" "}
                  <code>lib</code> has no effect on emit. That is the risk worth
                  remembering: <code>lib</code> is a <b>claim</b> about what the
                  runtime provides, and the compiler believes you. Claim{" "}
                  <code>es2022</code>, then run the code on an engine with no{" "}
                  <code>Promise</code>, and it fails at runtime with no
                  compile-time warning. <code>lib</code> does not add a
                  polyfill.
                </>
              }
              zh={
                <>
                  改 <code>lib</code> 前后,产出的 JavaScript 一字不差 —— 因为{" "}
                  <code>lib</code> 不参与产物生成。这里的风险值得记住:
                  <code>lib</code> 是你对运行环境的<b>声明</b>,
                  而编译器会信你。声明了 <code>es2022</code>,
                  却把代码跑在没有 <code>Promise</code> 的引擎上,
                  就是运行时失败,而编译期一声不响。<code>lib</code>{" "}
                  不会替你加 polyfill。
                </>
              }
            />
          }
        />
      </>
    ),
  },
  {
    id: "gradual-migration",
    title: {
      en: "Migrate three JavaScript files, one step at a time",
      zh: "把三个 JavaScript 文件一步一步迁过来",
    },
    d: "hard",
    tags: {
      en: ["allowJs", "checkJs", "@ts-expect-error"],
      zh: ["allowJs", "checkJs", "@ts-expect-error"],
    },
    task: (
      <>
        <p>
          <T
            en={
              <>
                Build a small project of three <code>.js</code> files that
                import from each other. Plant two misspelled property names, and
                one function that can return <code>null</code> where the caller
                never checks. Then walk the route from section 05, recording the
                output of <code>npx tsc --noEmit</code> after every step.
              </>
            }
            zh={
              <>
                建一个小项目:三个互相 import 的 <code>.js</code> 文件。
                故意埋两个写错的属性名,再埋一个「可能返回 null
                而调用处没判」的函数。然后照 §05 的路线走一遍,
                每一步都记下 <code>npx tsc --noEmit</code> 的输出。
              </>
            }
          />
        </p>
        <p>
          <T
            en={
              <>
                The point is not the final number. The point is that the system
                keeps running at every step, and every step is stricter than the
                one before it.
              </>
            }
            zh={
              <>
                重点不是最后那个数字。重点是每一步系统都在跑,
                而且每一步都比上一步严。
              </>
            }
          />
        </p>
      </>
    ),
    hint: {
      en: (
        <>
          The step worth watching is the last one. If you have already fixed the
          error that a <code>@ts-expect-error</code> was covering,{" "}
          <code>tsc</code> reports the comment itself:{" "}
          <code>TS2578: Unused &apos;@ts-expect-error&apos; directive.</code>{" "}
          <code>@ts-ignore</code> never tells you that.
        </>
      ),
      zh: (
        <>
          值得留意的是最后一步。如果某个 <code>@ts-expect-error</code>{" "}
          压着的错误已经被你顺手修掉,<code>tsc</code> 会反过来报这行注释:
          <code>TS2578: Unused &apos;@ts-expect-error&apos; directive.</code>{" "}
          <code>@ts-ignore</code> 永远不会告诉你这件事。
        </>
      ),
    },
    solution: (
      <>
        <CodeBlock
          lang="bash"
          title={{ en: "The rhythm of each step", zh: "每一步的节奏" }}
          code={L4_STEPS}
          note={
            <T
              en={
                <>
                  A real project takes months to do this, but the rhythm is the
                  same. One thing to know before you start: a type error does
                  not stop <code>tsc</code> from writing the JavaScript. The
                  build keeps producing output while errors remain, unless you
                  also set <code>noEmitOnError</code>.
                </>
              }
              zh={
                <>
                  真实项目做完这件事要几个月,但节奏是一样的。
                  开工前先知道一件事:类型报错并不会阻止 <code>tsc</code>{" "}
                  把 JavaScript 写出来。除非你同时开{" "}
                  <code>noEmitOnError</code>,否则报错期间构建照样出产物。
                </>
              }
            />
          }
        />
      </>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: (
        <>
          With <code>{`"strict": true`}</code>, which check is <b>not</b> turned
          on?
        </>
      ),
      zh: (
        <>
          写上 <code>{`"strict": true`}</code> 之后,下面哪个检查<b>没有</b>
          被打开?
        </>
      ),
    },
    opts: [
      <>strictNullChecks</>,
      <>noImplicitAny</>,
      <>noUncheckedIndexedAccess</>,
      <>useUnknownInCatchVariables</>,
    ],
    correct: 2,
    wrong: [
      {
        en: (
          <>
            strictNullChecks is in the family, and it is the member that changes
            the most code. <code>strict: true</code> turns it on.
          </>
        ),
        zh: (
          <>
            strictNullChecks 在家族里,而且是改动最大的一员。
            <code>strict: true</code> 会打开它。
          </>
        ),
      },
      {
        en: (
          <>
            noImplicitAny is in the family. It is the check that refuses to
            treat a value as <code>any</code> just because no type could be
            inferred for it.
          </>
        ),
        zh: (
          <>
            noImplicitAny 在家族里。它的作用是:不许因为「推不出类型」
            就悄悄按 <code>any</code> 处理。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            useUnknownInCatchVariables is in the family. Under{" "}
            <code>strict</code>, the variable bound by <code>catch</code> has
            type <code>unknown</code>, not <code>any</code>.
          </>
        ),
        zh: (
          <>
            useUnknownInCatchVariables 在家族里。开了 <code>strict</code>,
            <code>catch</code> 绑定的变量类型是 <code>unknown</code>,不是{" "}
            <code>any</code>。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>noUncheckedIndexedAccess</code> and{" "}
          <code>exactOptionalPropertyTypes</code> are <b>outside</b>{" "}
          <code>strict</code> and have to be enabled separately. The template
          from <code>tsc --init</code> shows this directly: it lists both under
          &quot;Stricter Typechecking Options&quot;, in their own section, apart
          from <code>strict</code>.
        </>
      ),
      zh: (
        <>
          <code>noUncheckedIndexedAccess</code> 和{" "}
          <code>exactOptionalPropertyTypes</code> 都在 <code>strict</code>
          <b>之外</b>,要单独开。<code>tsc --init</code>{" "}
          生成的模板直接说明了这一点:它们被单列在「Stricter Typechecking
          Options」一段,和 <code>strict</code> 分开。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          <code>findOrder</code> is declared to return{" "}
          <code>Order | null</code>, and you write{" "}
          <code>findOrder(id).total</code>. What happens with{" "}
          <code>strictNullChecks</code> off?
        </>
      ),
      zh: (
        <>
          <code>findOrder</code> 声明的返回类型是 <code>Order | null</code>,
          你直接写 <code>findOrder(id).total</code>。关着{" "}
          <code>strictNullChecks</code> 时会发生什么?
        </>
      ),
    },
    opts: [
      {
        en: <>It is a compile error, the same as when the flag is on</>,
        zh: <>编译报错,和开着的时候一样</>,
      },
      {
        en: (
          <>
            It compiles with no error; if the call really returns{" "}
            <code>null</code>, you get a <code>TypeError</code> at runtime
          </>
        ),
        zh: (
          <>
            编译不报错;哪天真的返回 <code>null</code>,运行时抛{" "}
            <code>TypeError</code>
          </>
        ),
      },
      {
        en: <>The compiler inserts a null check into the emitted JavaScript</>,
        zh: <>编译器会在产物里替你插入判空代码</>,
      },
      {
        en: (
          <>
            <code>null</code> is converted to an empty object, so nothing fails
          </>
        ),
        zh: (
          <>
            <code>null</code> 会被自动转成空对象,所以不会出错
          </>
        ),
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            No. With the flag off, <code>null</code> and <code>undefined</code>{" "}
            are assignable to every type, so as far as the compiler is
            concerned, <code>Order | null</code> and <code>Order</code> are
            interchangeable.
          </>
        ),
        zh: (
          <>
            不会。关着时 <code>null</code> 和 <code>undefined</code>{" "}
            可以赋给任何类型,所以在编译器看来 <code>Order | null</code> 和{" "}
            <code>Order</code> 可以互相替换。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            The compiler never adds runtime behaviour of that kind. It removes
            types and reports errors. The null check is always yours to write.
          </>
        ),
        zh: (
          <>
            编译器从不添加这类运行时行为。它只做两件事:擦掉类型、报告错误。
            判空代码永远得你自己写。
          </>
        ),
      },
      {
        en: (
          <>
            JavaScript does no such conversion. <code>null.total</code> throws a{" "}
            <code>TypeError</code>, and TypeScript does not change that.
          </>
        ),
        zh: (
          <>
            JavaScript 没有这种转换。<code>null.total</code> 就是抛{" "}
            <code>TypeError</code>,TypeScript 也改不了它。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          With <code>strictNullChecks</code> off, <code>null</code> and{" "}
          <code>undefined</code> are assignable to every type. &quot;This value
          may be missing&quot; disappears from the type, so there is nothing
          left to check. With the flag on, the same line reports{" "}
          <code>TS18047: &apos;order&apos; is possibly &apos;null&apos;.</code>{" "}
          If you only ever enable one member of the family, enable this one.
        </>
      ),
      zh: (
        <>
          关掉 <code>strictNullChecks</code>,<code>null</code> 和{" "}
          <code>undefined</code> 可以赋给任何类型。「这个值可能没有」
          从类型里消失了,也就没什么可检查的。开着时,同一行会报{" "}
          <code>TS18047: &apos;order&apos; is possibly &apos;null&apos;.</code>{" "}
          如果这一族里只能开一个,就开它。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          What does the <code>target</code> option in tsconfig control?
        </>
      ),
      zh: (
        <>
          tsconfig 里的 <code>target</code> 选项管的是哪件事?
        </>
      ),
    },
    opts: [
      { en: <>How strict the type checking is</>, zh: <>类型检查有多严格</> },
      {
        en: (
          <>
            Which level of JavaScript syntax is emitted — an older{" "}
            <code>target</code> rewrites newer syntax into older forms
          </>
        ),
        zh: (
          <>
            产出的 JavaScript 用哪一代语法 —— <code>target</code>{" "}
            定得低,新语法会被改写成老写法
          </>
        ),
      },
      {
        en: <>How import paths are resolved</>,
        zh: <>import 路径按什么规则解析</>,
      },
      {
        en: <>Which version of the TypeScript compiler is used</>,
        zh: <>用哪个版本的 TypeScript 编译器</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            Strictness is the <code>strict</code> family. You can set{" "}
            <code>target</code> to <code>es5</code> and still run the strictest
            checks; the two groups do not affect each other.
          </>
        ),
        zh: (
          <>
            严不严是 <code>strict</code> 家族的事。<code>target</code> 拨到{" "}
            <code>es5</code>,检查照样可以最严;两组选项互不影响。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            That is <code>module</code> and <code>moduleResolution</code>.{" "}
            <code>target</code> says nothing about how modules are found.
          </>
        ),
        zh: (
          <>
            那是 <code>module</code> 和 <code>moduleResolution</code> 的事。
            <code>target</code> 不管模块怎么找。
          </>
        ),
      },
      {
        en: (
          <>
            The compiler version comes from the <code>typescript</code>{" "}
            dependency in <code>package.json</code>. tsconfig cannot change it.
          </>
        ),
        zh: (
          <>
            编译器版本由 <code>package.json</code> 里的 <code>typescript</code>{" "}
            依赖决定,tsconfig 管不了它。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>target</code> sets the syntax level of the emitted JavaScript:{" "}
          <code>es5</code> rewrites arrow functions, default parameters, and
          destructuring into their pre-2015 equivalents, while{" "}
          <code>es2022</code> keeps them and only removes the types. It also
          picks a default <code>lib</code>, which is a separate job:{" "}
          <code>lib</code> decides which type declarations exist. And note: if a
          bundler, <code>swc</code>, or <code>esbuild</code> produces your
          JavaScript, the <code>target</code> in tsconfig does not decide what
          ships — that tool&apos;s own target does.
        </>
      ),
      zh: (
        <>
          <code>target</code> 决定产出 JavaScript 的语法代次:<code>es5</code>{" "}
          会把箭头函数、默认参数、解构改写成 2015 年之前的等价写法,
          <code>es2022</code> 则原样保留、只擦掉类型。它还会顺带定一个默认{" "}
          <code>lib</code>,而那是另一件事:<code>lib</code>{" "}
          决定有哪些类型声明可用。另外注意:如果你的 JavaScript
          是打包器、<code>swc</code> 或 <code>esbuild</code> 产出的,
          那么上线的语法代次由那个工具的 target 决定,tsconfig 里的{" "}
          <code>target</code> 说了不算。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          You need to silence one error line during a migration. Why prefer{" "}
          <code>@ts-expect-error</code> over <code>@ts-ignore</code>?
        </>
      ),
      zh: (
        <>
          迁移期要临时压住一行报错。为什么该用 <code>@ts-expect-error</code>{" "}
          而不是 <code>@ts-ignore</code>?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            <code>@ts-expect-error</code> can silence more kinds of error
          </>
        ),
        zh: (
          <>
            <code>@ts-expect-error</code> 能压住更多种类的错误
          </>
        ),
      },
      {
        en: (
          <>
            <code>@ts-ignore</code> has been removed from the language
          </>
        ),
        zh: (
          <>
            <code>@ts-ignore</code> 已经被移除了
          </>
        ),
      },
      {
        en: (
          <>
            When the error on the next line goes away,{" "}
            <code>@ts-expect-error</code> reports itself, so you know to delete
            it
          </>
        ),
        zh: (
          <>
            下一行的错误消失时,<code>@ts-expect-error</code>{" "}
            自己会报错,提醒你把它删掉
          </>
        ),
      },
      {
        en: (
          <>
            <code>@ts-expect-error</code> only applies in development, not in
            the production build
          </>
        ),
        zh: (
          <>
            <code>@ts-expect-error</code> 只在开发环境生效,不影响生产构建
          </>
        ),
      },
    ],
    correct: 2,
    wrong: [
      {
        en: (
          <>
            They suppress the same set of errors, both on the following line.
            The difference is what happens after the error is gone.
          </>
        ),
        zh: (
          <>
            两者能压住的错误是同一批,都作用于下一行。
            差别在于错误消失之后会发生什么。
          </>
        ),
      },
      {
        en: (
          <>
            <code>@ts-ignore</code> is still valid TypeScript. The problem is
            that it stays silent forever, including after the debt is paid.
          </>
        ),
        zh: (
          <>
            <code>@ts-ignore</code> 仍然是合法的 TypeScript。
            问题在于它永远沉默 —— 债还清了也不吭声。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Both are compile-time directives with no notion of environment. The
            compiler acts on them wherever it reads them.
          </>
        ),
        zh: (
          <>
            两者都是编译期指令,和环境无关。编译器读到就生效,
            不区分开发和生产。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>@ts-expect-error</code> states &quot;I expect an error
          here&quot;. Once the next line stops producing one, the comment itself
          becomes an error:{" "}
          <code>TS2578: Unused &apos;@ts-expect-error&apos; directive.</code>{" "}
          That is the difference between debt you can find again later and debt
          you cannot.
        </>
      ),
      zh: (
        <>
          <code>@ts-expect-error</code> 的意思是「我预期这里有错」。
          一旦下一行不再报错,这行注释自己就变成了错误:
          <code>TS2578: Unused &apos;@ts-expect-error&apos; directive.</code>{" "}
          这就是「以后找得回来的债」和「找不回来的债」的区别。
        </>
      ),
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          One compiler option changes the type of an array index read from{" "}
          <code>T</code> to <code>T | undefined</code>, so an out-of-range read
          becomes a compile error. It is <b>not</b> part of <code>strict</code>.
          Its name is ____.
        </>
      ),
      zh: (
        <>
          有个编译选项,开了之后数组下标取值的类型会从 <code>T</code> 变成{" "}
          <code>T | undefined</code>,越界访问从此在编译期就被拦下。它
          <b>不在 strict 里</b>,名字是____。
        </>
      ),
    },
    placeholder: { en: "option name", zh: "选项名(英文)" },
    answers: ["noUncheckedIndexedAccess", "nouncheckedindexedaccess"],
    hint: {
      en: (
        <>
          Read the name as a sentence: do not leave an indexed access unchecked.
          no + Unchecked + Indexed + Access.
        </>
      ),
      zh: (
        <>
          把名字当句子读:不放过未经检查的下标访问。no + Unchecked + Indexed +
          Access。
        </>
      ),
    },
    why: {
      en: (
        <>
          <code>noUncheckedIndexedAccess</code> gives <code>sizes[3]</code> the
          type <code>string | undefined</code>, so you have to narrow it before
          use. It needs <code>strictNullChecks</code> to have any effect, since
          without that flag <code>string | undefined</code> collapses back to{" "}
          <code>string</code>. It is not in <code>strict</code> because it
          reports on every index read, which is a large amount of work to add to
          an existing codebase. <code>tsc --init</code> does turn it on for a
          new project.
        </>
      ),
      zh: (
        <>
          <code>noUncheckedIndexedAccess</code> 让 <code>sizes[3]</code>{" "}
          的类型变成 <code>string | undefined</code>,想用先收窄。它要靠{" "}
          <code>strictNullChecks</code> 才有效果 —— 后者关着时,
          <code>string | undefined</code> 会退回成 <code>string</code>。它不在{" "}
          <code>strict</code> 里,因为它会对每一次下标读取发话,
          存量项目一开工作量很大。而 <code>tsc --init</code>{" "}
          给新项目是默认开的。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          You are starting a backend project whose compiled output runs directly
          on Node. How should <code>module</code> be set?
        </>
      ),
      zh: (
        <>
          新起一个后端项目,产物直接跑在 Node 上。<code>module</code> 该怎么配?
        </>
      ),
    },
    opts: [
      <>
        <code>{`"module": "nodenext"`}</code>
      </>,
      <>
        <code>{`"module": "esnext"`}</code> +{" "}
        <code>{`"moduleResolution": "bundler"`}</code>
      </>,
      {
        en: (
          <>
            <code>{`"module": "commonjs"`}</code>, because the older setting is
            safer
          </>
        ),
        zh: (
          <>
            <code>{`"module": "commonjs"`}</code>,老配置更稳
          </>
        ),
      },
      <>
        <code>{`"module": "amd"`}</code>
      </>,
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: (
          <>
            <code>bundler</code> describes how a bundler such as Vite or esbuild
            resolves imports. If the output runs on Node with no bundler, use
            Node&apos;s own rules: <code>nodenext</code>.
          </>
        ),
        zh: (
          <>
            <code>bundler</code> 描述的是 Vite / esbuild
            这类打包器的解析方式。产物不经打包直接给 Node 跑,
            就该按 Node 自己的规矩来:<code>nodenext</code>。
          </>
        ),
      },
      {
        en: (
          <>
            <code>commonjs</code> works, but it ignores the{" "}
            <code>exports</code> field in <code>package.json</code> and does not
            follow Node&apos;s ESM rules. Keeping it in an existing project is
            reasonable; choosing it for a new one is not.
          </>
        ),
        zh: (
          <>
            <code>commonjs</code> 能跑,但它不理会 <code>package.json</code> 的{" "}
            <code>exports</code> 字段,也不按 Node 的 ESM
            规则走。存量项目维持现状合理,新项目选它就没必要了。
          </>
        ),
      },
      {
        en: (
          <>
            <code>amd</code> is a browser module format from the RequireJS era.
            It has nothing to do with a Node backend.
          </>
        ),
        zh: (
          <>
            <code>amd</code> 是 RequireJS 时代的浏览器模块格式,
            和 Node 后端没有关系。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Two routes, decided by who consumes the output. Output that Node runs
          directly: <code>module: nodenext</code>, which also fixes{" "}
          <code>moduleResolution</code> to <code>nodenext</code> — set it to
          anything else and the compiler reports{" "}
          <code>
            TS5109: Option &apos;moduleResolution&apos; must be set to
            &apos;NodeNext&apos;
          </code>
          . Output that a bundler consumes:{" "}
          <code>module: esnext + moduleResolution: bundler</code>, which hands
          module resolution to the bundler. Keep the two settings apart in your
          head: <code>module</code> is the format the compiler writes,{" "}
          <code>moduleResolution</code> is how it finds what you import.
        </>
      ),
      zh: (
        <>
          两条路,按「谁消费产物」来分。产物直接给 Node 跑:
          <code>module: nodenext</code> —— 它同时把{" "}
          <code>moduleResolution</code> 钉在 <code>nodenext</code>,
          你写成别的,编译器会报{" "}
          <code>
            TS5109: Option &apos;moduleResolution&apos; must be set to
            &apos;NodeNext&apos;
          </code>
          。产物交给打包器:
          <code>module: esnext + moduleResolution: bundler</code>,
          把模块解析整个交给打包器。这两个选项别混:<code>module</code>{" "}
          是编译器写出的模块格式,<code>moduleResolution</code> 是它怎么找到你
          import 的东西。
        </>
      ),
    },
  },
  {
    type: "multi",
    q: {
      en: <>Which of these statements about tsconfig are true? (multiple)</>,
      zh: <>关于 tsconfig,下面哪些说法是对的?(多选)</>,
    },
    opts: [
      {
        en: (
          <>
            tsconfig governs both <code>tsc</code> and the editor&apos;s type
            service, so the editor and CI report the same errors
          </>
        ),
        zh: (
          <>
            tsconfig 同时约束 <code>tsc</code>{" "}
            和编辑器的类型服务,所以编辑器和 CI 报的是同一批错误
          </>
        ),
      },
      {
        en: (
          <>
            <code>skipLibCheck: true</code> skips type checking inside{" "}
            <code>.d.ts</code> files — all of them, including your own — and
            still checks your <code>.ts</code> code
          </>
        ),
        zh: (
          <>
            <code>skipLibCheck: true</code> 跳过的是 <code>.d.ts</code>{" "}
            文件内部的检查(全部 <code>.d.ts</code>,包括你自己写的),你的{" "}
            <code>.ts</code> 代码照查
          </>
        ),
      },
      {
        en: (
          <>
            A new project should leave <code>strict</code> off until the
            features are finished
          </>
        ),
        zh: (
          <>
            新项目应该先关掉 <code>strict</code>,等功能写完再统一开
          </>
        ),
      },
      {
        en: (
          <>
            Under <code>strict</code>, the variable bound by <code>catch</code>{" "}
            has type <code>unknown</code>
          </>
        ),
        zh: (
          <>
            开了 <code>strict</code>,<code>catch</code> 绑定的变量类型是{" "}
            <code>unknown</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>tsc</code> resolves your imports and bundles the project into
            a single JavaScript file
          </>
        ),
        zh: (
          <>
            <code>tsc</code> 会解析 import 并把整个项目打包成一个 JavaScript
            文件
          </>
        ),
      },
    ],
    correct: [0, 1, 3],
    missHint: {
      en: (
        <>
          One is missing. Think about the member of the family that governs the{" "}
          <code>catch</code> variable — what type does it give <code>e</code>?
        </>
      ),
      zh: (
        <>
          漏了一条。想想家族里管 <code>catch</code> 变量的那位成员 —— 它把{" "}
          <code>e</code> 定成什么类型?
        </>
      ),
    },
    extraHint: {
      en: (
        <>
          One selection is wrong. Either you applied &quot;enable{" "}
          <code>strict</code> gradually&quot; — a strategy for existing code —
          to a new project, or you credited <code>tsc</code> with a job it does
          not do.
        </>
      ),
      zh: (
        <>
          有一项选多了。要么是把「渐进开 <code>strict</code>」
          这个存量项目的策略错套在了新项目上,要么是把一件 <code>tsc</code>{" "}
          不做的事算在了它头上。
        </>
      ),
    },
    why: {
      en: (
        <>
          A: one config, two readers, so the red underline and the CI failure
          agree. B: a library&apos;s declaration errors are not yours to fix,
          and two libraries with clashing global declarations can otherwise
          break your build. D: <code>useUnknownInCatchVariables</code> is a
          member of the family. C is backwards — enabling <code>strict</code> on
          day one costs nothing, and the cost grows with the amount of code. E
          is wrong: <code>tsc</code> writes one <code>.js</code> file per input
          file and never bundles. <code>outFile</code> can concatenate, but only
          for the <code>amd</code> and <code>system</code> formats — otherwise
          you get{" "}
          <code>
            TS6082: Only &apos;amd&apos; and &apos;system&apos; modules are
            supported alongside --outFile.
          </code>
        </>
      ),
      zh: (
        <>
          A:一份配置两个读者,所以编辑器的红线和 CI 的失败是一致的。B:
          库的声明文件有错不归你修,而两个库的全局声明打架还会拖垮你的构建。D:
          <code>useUnknownInCatchVariables</code> 是家族成员。C 说反了 ——
          第一天开 <code>strict</code> 成本为零,成本随代码量增长。E 不对:
          <code>tsc</code> 是每个输入文件产出一个 <code>.js</code>,从不打包。
          <code>outFile</code> 能做拼接,但只支持 <code>amd</code> 和{" "}
          <code>system</code> 两种格式,否则会报{" "}
          <code>
            TS6082: Only &apos;amd&apos; and &apos;system&apos; modules are
            supported alongside --outFile.
          </code>
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          You inherit a 900-line JavaScript ordering system, and the owner says
          it cannot go offline for a day. What is the first step?
        </>
      ),
      zh: (
        <>
          你接手一套九百行的 JavaScript 点单系统,负责人要求「一天都不能停」。
          第一步该做什么?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            Rename every file to <code>.ts</code> tonight, turn{" "}
            <code>strict</code> all the way up, and fix errors until morning
          </>
        ),
        zh: (
          <>
            今晚把所有文件改成 <code>.ts</code>,<code>strict</code>{" "}
            开满,报错修到天亮
          </>
        ),
      },
      {
        en: (
          <>
            Turn on <code>allowJs</code>, then <code>checkJs</code> (or{" "}
            <code>@ts-check</code> file by file), so the compiler starts
            checking while the system keeps running
          </>
        ),
        zh: (
          <>
            先开 <code>allowJs</code>,再开 <code>checkJs</code>(或逐文件加{" "}
            <code>@ts-check</code>),让编译器先开始检查,系统照常跑
          </>
        ),
      },
      {
        en: (
          <>
            Put <code>@ts-ignore</code> at the top of every file so the build
            passes
          </>
        ),
        zh: (
          <>
            每个文件头上加 <code>@ts-ignore</code>,先让构建过了再说
          </>
        ),
      },
      {
        en: (
          <>
            Change every <code>.js</code> extension to <code>.ts</code>; the
            contents already are TypeScript
          </>
        ),
        zh: (
          <>
            把 <code>.js</code> 后缀全改成 <code>.ts</code>,
            内容不用动就已经是 TypeScript 了
          </>
        ),
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            That produces hundreds of errors at once, with no way to ship a
            partial fix, so the change gets reverted. Incremental steps keep the
            system running.
          </>
        ),
        zh: (
          <>
            这样会一次冒出几百个错,又没法只上线一部分修复,最后只能回滚。
            渐进的做法能让系统一直跑着。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            <code>@ts-ignore</code> turns the check off; it does not fix
            anything. Applied to whole files, you get no benefit from installing
            TypeScript at all.
          </>
        ),
        zh: (
          <>
            <code>@ts-ignore</code> 是把检查关掉,不是把问题修好。
            整个文件都压住,等于装了 TypeScript 却什么都没得到。
          </>
        ),
      },
      {
        en: (
          <>
            Renaming changes nothing about the code. The implicit{" "}
            <code>any</code> parameters and unchecked <code>null</code> returns
            are all still there, and now they all report at once and block
            everyone. Start with <code>allowJs</code> instead, then migrate file
            by file.
          </>
        ),
        zh: (
          <>
            改后缀不改变代码本身。隐式 <code>any</code> 的参数、没判的{" "}
            <code>null</code> 一个都没少,而且现在会一起报出来、
            把所有人挡住。应该先用 <code>allowJs</code>{" "}
            把文件收进来,再一个个迁移。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          The route: <code>allowJs</code> brings the <code>.js</code> files into
          the compilation, <code>checkJs</code> or <code>@ts-check</code> starts
          checking them, then you rename one file at a time to <code>.ts</code>,
          then you enable the <code>strict</code> members one by one. The system
          runs at every step, and every step is stricter than the one before it.
        </>
      ),
      zh: (
        <>
          路线是:<code>allowJs</code> 把 <code>.js</code> 文件收进编译,
          <code>checkJs</code> 或 <code>@ts-check</code> 开始检查它们,
          然后一次改一个文件成 <code>.ts</code>,再把 <code>strict</code>{" "}
          的成员一项一项开。每一步系统都在跑,每一步都比上一步严。
        </>
      ),
    },
  },
];
