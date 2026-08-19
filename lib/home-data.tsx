"use client";

// 序章 · 动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";
import { T } from "@/lib/i18n";

/* ================= LABS ================= */

export const LABS: Lab[] = [
  {
    id: "play-first",
    title: {
      en: "First look at the Playground: paste plain JavaScript",
      zh: "Playground 初体验:JS 原样贴进去",
    },
    d: "easy",
    tags: { en: ["Playground", "inference"], zh: ["Playground", "推断"] },
    task: (
      <>
        <p>
          <T
            en={
              <>
                Open{" "}
                <a
                  href="https://www.typescriptlang.org/play"
                  target="_blank"
                  rel="noreferrer"
                >
                  typescriptlang.org/play
                </a>{" "}
                (no account needed), clear the editor on the left, and paste in
                the <b>plain JavaScript</b> below. Do not write a single type.
                Then hover over shopName, price, and menu one by one and read the
                type that appears.
              </>
            }
            zh={
              <>
                打开{" "}
                <a
                  href="https://www.typescriptlang.org/play"
                  target="_blank"
                  rel="noreferrer"
                >
                  typescriptlang.org/play
                </a>
                (免注册),清空左侧编辑器,把下面这段<b>纯 JS</b>
                贴进去 —— 一个类型都别写。然后把鼠标依次悬停在 shopName、price、
                menu 这几个变量名上,看弹出来的类型提示。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="js"
          title={{ en: "Paste this in", zh: "贴这段进去" }}
          code={{
            en: `const shopName = "Cup & Leaf";
const price = 22;
const menu = [
  { name: "Mango Pomelo Sago", price: 22 },
  { name: "Jasmine Green", price: 12 },
];`,
            zh: `const shopName = "喜杯奶茶";
const price = 22;
const menu = [
  { name: "杨枝甘露", price: 22 },
  { name: "四季春", price: 12 },
];`,
          }}
        />
      </>
    ),
    hint: (
      <T
        en={
          <>
            Rest the pointer on a variable name for half a second and the tooltip
            appears. Look closely at menu: TypeScript worked out the shape of the
            objects inside the array as well.
          </>
        }
        zh={
          <>
            鼠标停在变量名上半秒,提示框就出来了。注意 menu 的类型 ——
            TS 连数组里对象的形状都看出来了。
          </>
        }
      />
    ),
    solution: (
      <p>
        <T
          en={
            <>
              What you see: shopName is <code>string</code>, price is{" "}
              <code>number</code>, and menu is{" "}
              <code>{"{ name: string; price: number; }[]"}</code>. You did not
              write a single colon and TypeScript worked all of it out. This is{" "}
              <b>inference</b>, and chapter 01 covers it in full. So the idea that
              using TypeScript means writing annotations everywhere can go.
            </>
          }
          zh={
            <>
              悬停结果:shopName 是 <code>string</code>,price 是{" "}
              <code>number</code>,menu 是{" "}
              <code>{"{ name: string; price: number; }[]"}</code>。你一个冒号都没写,
              TS 全推出来了 —— 这就是<b>推断(inference)</b>,01
              章整章讲它。所以「用 TS 要写一堆注解」这个印象,从今天起可以扔掉了。
            </>
          }
        />
      </p>
    ),
  },
  {
    id: "typo-read",
    title: {
      en: "Make a typo on purpose, then read the error in your own words",
      zh: "亲手拼错一次,把报错读成人话",
    },
    d: "easy",
    tags: { en: ["Playground", "error messages"], zh: ["Playground", "报错"] },
    task: (
      <p>
        <T
          en={
            <>
              Keep the code from the previous task and add one line:{" "}
              <code>const bill = menu[0].prise * 2;</code> (price misspelled as
              prise). When the red line appears, hover over it and{" "}
              <b>read the whole message sentence by sentence</b>. Then say it in
              your own words: what is it reporting, and what does it suggest?
            </>
          }
          zh={
            <>
              接着上一个任务的代码,在下面加一行{" "}
              <code>const bill = menu[0].prise * 2;</code>(故意把 price 拼成
              prise)。红线出现后,鼠标悬停到红线上,<b>逐句读完整段报错</b>
              ,然后试着用自己的话翻译:它说了什么?它建议你怎么改?
            </>
          }
        />
      </p>
    ),
    hint: (
      <T
        en={
          <>
            TypeScript errors often end with &quot;Did you mean ...?&quot;. Find
            that sentence first, then go back and read the first half.
          </>
        }
        zh={
          <>
            TS 的报错有个贴心传统:结尾经常带一句 Did you mean ...? ——
            先找这句,再回头读前半段。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title={{ en: "The exact message", zh: "报错原文" }}
          code={`// Property 'prise' does not exist on type
// '{ name: string; price: number; }'.
// Did you mean 'price'?`}
        />
        <p>
          <T
            en={
              <>
                In plain words: this object has the shape{" "}
                {"{ name: string; price: number }"} and there is no prise in it,
                did you mean price? Every message has three parts:{" "}
                <b>
                  what is wrong, what it was compared against (the type), and what
                  to do
                </b>
                . Once you have read three of them, they stop being intimidating.
              </>
            }
            zh={
              <>
                人话版:「这个对象的形状是 {"{ name: string; price: number }"}
                ,里面没有 prise 这一栏 —— 你是不是想写 price?」三段式:
                <b>哪里错了 → 依据是什么(类型)→ 建议怎么改</b>。以后每条 TS
                报错都是这个句式,读三条就不怕了。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "erase-tab",
    title: {
      en: "Watch type erasure happen in the Playground",
      zh: "在 Playground 里围观类型擦除",
    },
    d: "easy",
    tags: { en: ["Playground", "type erasure"], zh: ["Playground", "类型擦除"] },
    task: (
      <>
        <p>
          <T
            en={
              <>
                Paste the code below into the Playground and look at the{" "}
                <b>.JS tab in the right-hand panel</b> (it is open by default).
                That is the compiler output. Compare the two: where did the type
                line go? Where did the two annotations go?
              </>
            }
            zh={
              <>
                把下面这段贴进 Playground,然后看<b>右侧面板的 .JS 标签</b>
                (默认就开着)—— 那就是编译产物。对照找一找:type 那行去哪了?
                两个冒号注解去哪了?
              </>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title={{ en: "Paste this in", zh: "贴这段进去" }}
          code={`type Size = "small" | "medium" | "large";

const size: Size = "large";

function priceOf(base: number, size: Size): number {
  return size === "large" ? base + 3 : base;
}`}
        />
      </>
    ),
    hint: (
      <T
        en={
          <>
            You cannot find the word Size anywhere in the output. Not even the
            name survives. That is what erasure means.
          </>
        }
        zh={<>右侧产物里搜不到 Size 这个词 —— 连名字都没留下,才叫「擦除」。</>}
      />
    ),
    solution: (
      <>
        <CodeBlock
          lang="js"
          title={{
            en: "The output in the .JS tab",
            zh: "右侧 .JS 标签里的产物",
          }}
          code={`"use strict";
const size = "large";
function priceOf(base, size) {
    return size === "large" ? base + 3 : base;
}`}
        />
        <p>
          <T
            en={
              <>
                The type declaration is gone entirely, the annotations are gone,
                and the logic is unchanged. The output is ordinary JavaScript.
                That also settles two questions at once: TypeScript does not slow
                the program down, and TypeScript does not validate data while the
                program runs.
              </>
            }
            zh={
              <>
                type 声明整行蒸发,注解全部消失,逻辑一字未动 ——
                产物就是普通 JS。这也顺便证明了两件事:TS 不会拖慢运行速度;
                TS 也不会在运行时替你校验数据。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "local-tsc",
    title: {
      en: "Run tsc locally and diff the two files",
      zh: "本地跑一次 tsc,diff 看擦除",
    },
    d: "medium",
    tags: { en: ["tsc", "terminal"], zh: ["tsc", "terminal"] },
    task: (
      <p>
        <T
          en={
            <>
              This one is not in the browser. Install TypeScript on your own
              machine, create an order.ts file (any content, as long as it has a
              type and a few annotations), compile it to order.js with{" "}
              <code>npx tsc</code>, and compare the two files with{" "}
              <code>diff</code> to confirm that the types are gone. Requires Node
              18 or later.
            </>
          }
          zh={
            <>
              这次不在浏览器里玩了:在自己电脑上装 TypeScript,新建一个
              order.ts(内容随意,带上一个 type 和几个注解),用{" "}
              <code>npx tsc</code> 编译出 order.js,再用 <code>diff</code>{" "}
              (或肉眼)对比两个文件,确认类型都被擦掉了。需要 Node 18+。
            </>
          }
        />
      </p>
    ),
    hint: (
      <T
        en={
          <>
            Three steps: <code>npm i -D typescript</code> →{" "}
            <code>npx tsc --init</code> → <code>npx tsc</code>. By default the
            output file is written next to the source file.
          </>
        }
        zh={
          <>
            三步:<code>npm i -D typescript</code> →{" "}
            <code>npx tsc --init</code> → <code>npx tsc</code>。
            编译产物默认生成在源文件旁边。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock
          lang="bash"
          title="terminal"
          code={`mkdir tea-shop && cd tea-shop
npm i -D typescript
npx tsc --init

cat > order.ts << 'EOF'
type Size = "small" | "medium" | "large";
const size: Size = "large";
const total: number = 22;
console.log(size, total);
EOF

npx tsc
diff order.ts order.js`}
        />
        <p>
          <T
            en={
              <>
                The diff lists every difference: the type line is gone, both
                annotations are gone, everything else is the same. Run{" "}
                <code>node order.js</code> and it prints <code>large 22</code>,
                exactly as plain JavaScript would. Then change size to{" "}
                <code>&quot;mega&quot;</code> and run <code>npx tsc</code> again
                to see the compiler refuse: it reports the error and writes no
                output for that file.
              </>
            }
            zh={
              <>
                diff 会列出所有差异:type 行没了、两个注解没了,其余原样。
                再跑 <code>node order.js</code>,输出 <code>large 22</code> ——
                和写 JS 没有任何区别。顺手把 size 改成{" "}
                <code>&quot;mega&quot;</code> 再 <code>npx tsc</code>
                ,感受一下编译器把关的样子:报错、拒绝放行。
              </>
            }
          />
        </p>
      </>
    ),
  },
];

/* ================= QUIZ ================= */

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: (
      <T
        en={
          <>
            Which statement about the relationship between TypeScript and
            JavaScript is correct?
          </>
        }
        zh={<>TypeScript 和 JavaScript 的关系,哪个说法是对的?</>}
      />
    ),
    opts: [
      <T
        key="a"
        en={
          <>
            TypeScript is a brand new language, and existing JavaScript has to be
            rewritten
          </>
        }
        zh={<>TS 是一门全新语言,已有的 JS 代码要重写才能用</>}
      />,
      <T
        key="b"
        en={
          <>
            TypeScript is a superset of JavaScript: all of JavaScript stays, with
            a layer of types added on top
          </>
        }
        zh={<>TS 是 JS 的超集:JS 全部保留,再往上加一层类型</>}
      />,
      <T
        key="c"
        en={<>TypeScript is a replacement for JavaScript built into browsers</>}
        zh={<>TS 是浏览器内置的 JS 替代品</>}
      />,
      <T
        key="d"
        en={<>TypeScript is a JavaScript framework, similar to React</>}
        zh={<>TS 是 JS 的一个框架,和 React 差不多</>}
      />,
    ],
    correct: 1,
    wrong: [
      <T
        key="a"
        en={
          <>
            The opposite is true. A superset means any valid JavaScript is a valid
            starting point. Rename .js to .ts and you have begun, without
            rewriting a line.
          </>
        }
        zh={
          <>
            恰恰相反 —— 超集(superset)意味着任何合法的 JS 都是合法的 TS
            起点,把 .js 改成 .ts 就能开始,一行都不用重写。
          </>
        }
      />,
      undefined,
      <T
        key="c"
        en={
          <>
            Browsers do not know TypeScript at all. They run JavaScript.
            TypeScript has to be compiled first, which removes the types. All
            three ways of running it include that step.
          </>
        }
        zh={
          <>
            浏览器根本不认识 TS,它只跑 JS。TS 必须先编译(擦掉类型)
            才能进浏览器 —— 这也是「三条路」都绕不开的一步。
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            React is a library that runs with your program. TypeScript is a
            language extension plus a compile-time tool. They are different kinds
            of thing, and they are often used together.
          </>
        }
        zh={
          <>
            React 是运行时的库,TS 是语言层的扩展 + 编译期工具 ——
            两者不在一个维度上,还经常搭伙用(React + TS)。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            A superset means none of the JavaScript you know is wasted. The layer
            TypeScript adds is description, not logic: it describes what your data
            looks like so the compiler can check your code against it.
          </>
        }
        zh={
          <>
            超集意味着你会的 JS 一行都没白学。TS 加的那层「类型」是描述,
            不是逻辑 —— 描述你的数据长什么样,好让编译器替你把关。
          </>
        }
      />
    ),
  },
  {
    type: "choice",
    q: (
      <T
        en={<>When does TypeScript check types?</>}
        zh={<>TypeScript 的类型检查发生在什么时候?</>}
      />
    ),
    opts: [
      <T
        key="a"
        en={<>While the code runs, checking each line as it executes</>}
        zh={<>代码运行时,每执行一行检查一行</>}
      />,
      <T
        key="b"
        en={
          <>
            At compile time: when you save or build, before the code has run at
            all
          </>
        }
        zh={<>编译期 —— 你保存/构建的时候,代码还没跑就查完了</>}
      />,
      <T
        key="c"
        en={<>When the code is deployed to a server</>}
        zh={<>部署到服务器的时候</>}
      />,
      <T
        key="d"
        en={<>When a user opens the page</>}
        zh={<>用户打开网页的时候</>}
      />,
    ],
    correct: 1,
    wrong: [
      <T
        key="a"
        en={
          <>
            Runtime is already too late, and there is nothing to check: the types
            are erased during compilation, so no type information exists while the
            program runs.
          </>
        }
        zh={
          <>
            运行时已经太晚了 —— 而且类型在编译后全部擦除,运行时根本没有
            「类型」这个东西可查。
          </>
        }
      />,
      undefined,
      <T
        key="c"
        en={
          <>
            Deployment only copies the compiled output. The check happened when
            you saved the file in your editor, and again when CI ran tsc.
          </>
        }
        zh={
          <>
            部署只是把编译产物搬过去。检查早在你编辑器里保存那一刻
            (以及 CI 里跑 tsc 时)就完成了。
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            What the user receives is plain JavaScript with no types in it. The
            cost of checking stays in development and is never passed to the user.
          </>
        }
        zh={
          <>
            用户拿到的是纯 JS,里面一个类型都没有 ——
            检查的成本全部留在开发阶段,一点不带给用户。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            This is the main comparison of the chapter: the check happens at the
            gate, not in the air. A JavaScript mistake shows up at night in
            production. A TypeScript mistake shows up when you save the file.
          </>
        }
        zh={
          <>
            这就是主比喻:安检口设在登机前,不设在天上。JS
            的错误在半夜的线上炸,TS 的错误在你保存文件时炸。
          </>
        }
      />
    ),
  },
  {
    type: "choice",
    q: (
      <T
        en={<>What does &quot;type erasure&quot; mean?</>}
        zh={<>「类型擦除(type erasure)」指的是什么?</>}
      />
    ),
    opts: [
      <T
        key="a"
        en={
          <>
            After compilation all type information is gone, the output is ordinary
            JavaScript, and runtime behavior is unchanged
          </>
        }
        zh={<>编译后类型信息全部消失,产物是普通 JS,运行时行为不变</>}
      />,
      <T
        key="b"
        en={
          <>
            TypeScript turns types into runtime validation code that checks your
            data automatically
          </>
        }
        zh={<>TS 会把类型转成运行时校验代码,自动帮你验数据</>}
      />,
      <T
        key="c"
        en={<>Only the types that caused errors are removed; the rest stay</>}
        zh={<>只有报错的类型会被擦掉,没报错的会保留</>}
      />,
      <T
        key="d"
        en={<>Comments are removed and the types are compiled into the output</>}
        zh={<>擦掉的是注释,类型会编译进产物</>}
      />,
    ],
    correct: 0,
    wrong: [
      undefined,
      <T
        key="b"
        en={
          <>
            This is the most dangerous misunderstanding. TypeScript generates no
            validation code. A JSON response with the wrong shape still gets
            through. Runtime validation is something you write yourself, and the
            finale shows how.
          </>
        }
        zh={
          <>
            这是最危险的误解 —— TS 不生成任何校验代码。接口来的 JSON
            长歪了照样进来,运行时校验得自己写(终章讲怎么写)。
          </>
        }
      />,
      <T
        key="c"
        en={
          <>
            Erasure has nothing to do with errors. Whether or not this compilation
            reports a problem, no type survives into the output. Erasure is
            unconditional.
          </>
        }
        zh={
          <>
            擦除和报错无关:不管这次编译报不报错,产物里都不会剩下任何类型 ——
            擦除是无条件的。
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            It is the other way around. Types are guaranteed to be removed.
            Whether comments are kept depends on a compiler option. Types never
            reach the output.
          </>
        }
        zh={
          <>
            反了 —— 被保证擦干净的恰恰是类型;注释保不保留倒要看编译配置。
            类型从不进产物。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            Types are a check performed before the code runs, and they do not
            exist afterwards. Understanding this settles two things at once:
            TypeScript does not slow your program down, and TypeScript does not
            protect it at runtime.
          </>
        }
        zh={
          <>
            类型是「编译期的安检」,下了飞机(运行时)就不存在了。想通这一点,
            你就同时想通了两件事:TS 不拖慢程序,TS 也不在运行时保护你。
          </>
        }
      />
    ),
  },
  {
    type: "multi",
    q: (
      <T
        en={
          <>
            Which of these actually run a piece of TypeScript code? (Select all
            that apply.)
          </>
        }
        zh={<>下面哪些方式,能让一段 TypeScript 代码真正跑起来?(多选)</>}
      />
    ),
    opts: [
      <T
        key="a"
        en={<>Compile it to .js with tsc, then run the output</>}
        zh={<>用 tsc 编译成 .js,再跑编译产物</>}
      />,
      <T
        key="b"
        en={<>Let a build tool such as Vite or esbuild transpile it at build time</>}
        zh={<>用 Vite / esbuild 这类构建工具在打包时转译</>}
      />,
      <T
        key="c"
        en={<>Run the .ts file directly with Node 22.18+, Deno, or Bun</>}
        zh={<>用新版 Node(22.18+)、Deno 或 Bun 直接运行 .ts 文件</>}
      />,
      <T
        key="d"
        en={<>Have the browser load and execute the .ts file directly</>}
        zh={<>让浏览器直接加载 .ts 文件执行</>}
      />,
    ],
    correct: [0, 1, 2],
    missHint: (
      <T
        en={
          <>
            You missed at least one of the three. A hint: one compiles, one
            transpiles, and one strips the types as it loads the file.
          </>
        }
        zh={
          <>
            三条正路你漏了至少一条 —— 提示:一条靠「编译」,一条靠「转译」,
            还有一条是运行时「边擦边跑」。
          </>
        }
      />
    ),
    extraHint: (
      <T
        en={
          <>
            One of them still does not work today: a browser only understands
            JavaScript. Give it a .ts file and it reports a syntax error.
          </>
        }
        zh={
          <>
            有一项到今天也办不到:浏览器只认 JS,你给它 .ts,
            它只会当成语法错误的脚本。
          </>
        }
      />
    ),
    why: (
      <T
        en={
          <>
            Three ways: tsc checks and translates; a bundler removes the types
            without checking them, leaving the check to your editor and CI; Node
            22.18+ strips the types as it loads the file (erasable syntax only),
            and Deno and Bun support this natively. The browser is the exception:
            it only ever runs JavaScript.
          </>
        }
        zh={
          <>
            三条路:① tsc 检查 + 翻译;② bundler 只擦类型不检查(检查交给编辑器和
            CI);③ Node 22.18+ 原生类型擦除直接跑(仅限可擦除语法),Deno、Bun
            天生支持。唯独浏览器,永远只吃 JS。
          </>
        }
      />
    ),
  },
  {
    type: "choice",
    q: (
      <T
        en={
          <>
            In plain JavaScript, what happens when you read{" "}
            <code>order.totle</code> and the real property is called total?
          </>
        }
        zh={
          <>
            纯 JavaScript 里,读 <code>order.totle</code>(实际属性叫
            total)会发生什么?
          </>
        }
      />
    ),
    opts: [
      <T
        key="a"
        en={<>An error is thrown immediately and the program stops</>}
        zh={<>立刻抛出错误,程序停止</>}
      />,
      <T
        key="b"
        en={
          <>
            It quietly returns undefined and the program keeps going. Used in
            arithmetic it becomes NaN, which is passed on
          </>
        }
        zh={
          <>
            安静地返回 undefined,程序继续跑;一旦参与运算,还可能变成 NaN
            传给下游
          </>
        }
      />,
      <T
        key="c"
        en={<>The JavaScript engine corrects it to total</>}
        zh={<>JS 引擎会自动纠正成 total</>}
      />,
      <T key="d" en={<>It returns null</>} zh={<>返回 null</>} />,
    ],
    correct: 1,
    wrong: [
      <T
        key="a"
        en={
          <>
            Many people expect this, and this is exactly where JavaScript is
            difficult. Reading a property that does not exist is not an error. You
            get undefined, and the mistake becomes invisible.
          </>
        }
        zh={
          <>
            这是很多人「以为」的行为,也是 JS 最坑的一点 ——
            读不存在的属性不报错,静静给你 undefined,错误当场隐身。
          </>
        }
      />,
      undefined,
      <T
        key="c"
        en={
          <>
            The engine does no spell checking. &quot;Did you mean total?&quot;
            comes from the TypeScript compiler. The JavaScript engine says
            nothing.
          </>
        }
        zh={
          <>
            引擎不做拼写检查。「你是不是想写 total?」这句贴心话,是 TS
            编译器说的,JS 引擎从不多嘴。
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            Reading a missing property gives undefined, not null. null only
            appears if someone assigns it. Chapter 01 separates the two.
          </>
        }
        zh={
          <>
            读不存在的属性得到的是 undefined,不是 null —— null
            得有人亲手赋值才会出现,这两位 01 章还会细分。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            undefined says nothing, multiplying it gives NaN, and NaN travels
            onward. By the time it appears on the page, you are far from the line
            that caused it. This is the main thing a compile-time check is there
            to stop.
          </>
        }
        zh={
          <>
            undefined 不吭声,乘个数变 NaN,NaN 再一路传染 ——
            等它在页面上露面,案发现场早离出错那行十万八千里了。
            这正是「编译期安检」要拦的头号危险品。
          </>
        }
      />
    ),
  },
  {
    type: "fill",
    q: (
      <T
        en={
          <>
            The command line tool for the official TypeScript compiler is called
            ____ (three letters; you usually run it through npx).
          </>
        }
        zh={
          <>
            TypeScript 官方编译器的命令行工具,名字是____(三个字母,平时用
            npx 调它)。
          </>
        }
      />
    ),
    answers: ["tsc", "npx tsc"],
    placeholder: { en: "Type your answer...", zh: "输入答案…" },
    hint: (
      <T
        en={<>Short for TypeScript Compiler. Take the initials.</>}
        zh={<>TypeScript Compiler 的缩写 —— 首字母连起来。</>}
      />
    ),
    why: (
      <T
        en={
          <>
            tsc does two things: it <b>checks</b> your code against the types and
            reports what does not match, and it <b>translates</b> .ts into .js by
            removing the types. <code>npx tsc --init</code> creates the config
            file, and <code>npx tsc --noEmit</code> checks without writing output.
            Both commands appear again in later chapters.
          </>
        }
        zh={
          <>
            tsc 干两件事:<b>检查</b>(对照类型说明书报错)+ <b>翻译</b>
            (把 .ts 擦成 .js)。<code>npx tsc --init</code> 生成配置,
            <code>npx tsc --noEmit</code> 只检查不出产物 —— 这几个命令后面章节
            会一直用。
          </>
        }
      />
    ),
  },
  {
    type: "choice",
    q: (
      <T
        en={<>&quot;TypeScript code runs faster than JavaScript.&quot; True?</>}
        zh={<>「用了 TypeScript,代码会跑得比 JavaScript 快」—— 这句话?</>}
      />
    ),
    opts: [
      <T
        key="a"
        en={<>True, the engine can use the type information to optimize ahead</>}
        zh={<>对,类型信息能让引擎提前优化</>}
      />,
      <T
        key="b"
        en={
          <>
            False. The output is ordinary JavaScript and runs exactly as fast as
            JavaScript you wrote by hand
          </>
        }
        zh={<>不对 —— 编译产物就是普通 JS,运行速度和手写 JS 没有区别</>}
      />,
      <T
        key="c"
        en={<>True, because TypeScript skips the interpretation step</>}
        zh={<>对,因为 TS 跳过了解释执行的步骤</>}
      />,
      <T
        key="d"
        en={<>False, TypeScript output is noticeably slower</>}
        zh={<>不对,TS 产物反而明显更慢</>}
      />,
    ],
    correct: 1,
    wrong: [
      <T
        key="a"
        en={
          <>
            It sounds reasonable, but the types are not in the output at all. The
            engine never sees them, so it cannot use them.
          </>
        }
        zh={
          <>
            听着合理,但类型在产物里根本不存在 ——
            引擎压根见不到它们,谈不上拿来优化。
          </>
        }
      />,
      undefined,
      <T
        key="c"
        en={
          <>
            No such step is skipped. The output is JavaScript, and the engine
            handles it exactly as it handles any other JavaScript.
          </>
        }
        zh={
          <>
            不存在这回事:产物就是 JS,引擎该怎么执行还怎么执行,
            一步都没省。
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            It is not slower either. Erasure barely changes the code, so the
            output performs the same as hand-written JavaScript. On speed,
            TypeScript is neutral.
          </>
        }
        zh={
          <>
            也不慢 —— 擦除几乎不改动代码本身,产物性能和手写 JS 相同。
            「快慢」这个维度上,TS 是中性的。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            What TypeScript speeds up is you, not the program: refactoring is
            safer, autocompletion is accurate, and you do not spend a night
            looking for a NaN. The gain is in development, not at runtime.
          </>
        }
        zh={
          <>
            TS 提速的不是程序,是你:重构敢下手、补全真的准、半夜不用爬起来查
            NaN —— 快在开发,不在运行。
          </>
        }
      />
    ),
  },
];
