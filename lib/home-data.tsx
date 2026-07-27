"use client";

// 序章 · 动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

/* ================= LABS ================= */

export const LABS: Lab[] = [
  {
    id: "play-first",
    title: "Playground 初体验:JS 原样贴进去",
    d: "easy",
    tags: ["Playground", "推断"],
    task: (
      <>
        <p>
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
        </p>
        <CodeBlock
          lang="js"
          title="贴这段进去"
          code={`const shopName = "喜杯奶茶";
const price = 22;
const menu = [
  { name: "杨枝甘露", price: 22 },
  { name: "四季春", price: 12 },
];`}
        />
      </>
    ),
    hint: (
      <>
        鼠标停在变量名上半秒,提示框就出来了。注意 menu 的类型 ——
        TS 连数组里对象的形状都看出来了。
      </>
    ),
    solution: (
      <p>
        悬停结果:shopName 是 <code>string</code>,price 是{" "}
        <code>number</code>,menu 是{" "}
        <code>{"{ name: string; price: number; }[]"}</code>。你一个冒号都没写,
        TS 全推出来了 —— 这就是<b>推断(inference)</b>,01
        章整章讲它。所以「用 TS 要写一堆注解」这个印象,从今天起可以扔掉了。
      </p>
    ),
  },
  {
    id: "typo-read",
    title: "亲手拼错一次,把报错读成人话",
    d: "easy",
    tags: ["Playground", "报错"],
    task: (
      <p>
        接着上一个任务的代码,在下面加一行{" "}
        <code>const bill = menu[0].prise * 2;</code>(故意把 price 拼成
        prise)。红线出现后,鼠标悬停到红线上,<b>逐句读完整段报错</b>
        ,然后试着用自己的话翻译:它说了什么?它建议你怎么改?
      </p>
    ),
    hint: (
      <>
        TS 的报错有个贴心传统:结尾经常带一句 Did you mean ...? ——
        先找这句,再回头读前半段。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="报错原文"
          code={`// Property 'prise' does not exist on type
// '{ name: string; price: number; }'.
// Did you mean 'price'?`}
        />
        <p>
          人话版:「这个对象的形状是 {"{ name: string; price: number }"}
          ,里面没有 prise 这一栏 —— 你是不是想写 price?」三段式:
          <b>哪里错了 → 依据是什么(类型)→ 建议怎么改</b>。以后每条 TS
          报错都是这个句式,读三条就不怕了。
        </p>
      </>
    ),
  },
  {
    id: "erase-tab",
    title: "在 Playground 里围观类型擦除",
    d: "easy",
    tags: ["Playground", "类型擦除"],
    task: (
      <>
        <p>
          把下面这段贴进 Playground,然后看<b>右侧面板的 .JS 标签</b>
          (默认就开着)—— 那就是编译产物。对照找一找:type 那行去哪了?
          两个冒号注解去哪了?
        </p>
        <CodeBlock
          lang="ts"
          title="贴这段进去"
          code={`type Size = "small" | "medium" | "large";

const size: Size = "large";

function priceOf(base: number, size: Size): number {
  return size === "large" ? base + 3 : base;
}`}
        />
      </>
    ),
    hint: (
      <>右侧产物里搜不到 Size 这个词 —— 连名字都没留下,才叫「擦除」。</>
    ),
    solution: (
      <>
        <CodeBlock
          lang="js"
          title="右侧 .JS 标签里的产物"
          code={`"use strict";
const size = "large";
function priceOf(base, size) {
    return size === "large" ? base + 3 : base;
}`}
        />
        <p>
          type 声明整行蒸发,注解全部消失,逻辑一字未动 ——
          产物就是普通 JS。这也顺便证明了两件事:TS 不会拖慢运行速度;
          TS 也不会在运行时替你校验数据。
        </p>
      </>
    ),
  },
  {
    id: "local-tsc",
    title: "本地跑一次 tsc,diff 看擦除",
    d: "medium",
    tags: ["tsc", "terminal"],
    task: (
      <p>
        这次不在浏览器里玩了:在自己电脑上装 TypeScript,新建一个
        order.ts(内容随意,带上一个 type 和几个注解),用{" "}
        <code>npx tsc</code> 编译出 order.js,再用 <code>diff</code>{" "}
        (或肉眼)对比两个文件,确认类型都被擦掉了。需要 Node 18+。
      </p>
    ),
    hint: (
      <>
        三步:<code>npm i -D typescript</code> →{" "}
        <code>npx tsc --init</code> → <code>npx tsc</code>。
        编译产物默认生成在源文件旁边。
      </>
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
          diff 会列出所有差异:type 行没了、两个注解没了,其余原样。
          再跑 <code>node order.js</code>,输出 <code>large 22</code> ——
          和写 JS 没有任何区别。顺手把 size 改成{" "}
          <code>&quot;mega&quot;</code> 再 <code>npx tsc</code>
          ,感受一下编译器把关的样子:报错、拒绝放行。
        </p>
      </>
    ),
  },
];

/* ================= QUIZ ================= */

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: <>TypeScript 和 JavaScript 的关系,哪个说法是对的?</>,
    opts: [
      <>TS 是一门全新语言,已有的 JS 代码要重写才能用</>,
      <>TS 是 JS 的超集:JS 全部保留,再往上加一层类型</>,
      <>TS 是浏览器内置的 JS 替代品</>,
      <>TS 是 JS 的一个框架,和 React 差不多</>,
    ],
    correct: 1,
    wrong: [
      <>
        恰恰相反 —— 超集(superset)意味着任何合法的 JS 都是合法的 TS
        起点,把 .js 改成 .ts 就能开始,一行都不用重写。
      </>,
      undefined,
      <>
        浏览器根本不认识 TS,它只跑 JS。TS 必须先编译(擦掉类型)
        才能进浏览器 —— 这也是「三条路」都绕不开的一步。
      </>,
      <>
        React 是运行时的库,TS 是语言层的扩展 + 编译期工具 ——
        两者不在一个维度上,还经常搭伙用(React + TS)。
      </>,
    ],
    why: (
      <>
        超集意味着你会的 JS 一行都没白学。TS 加的那层「类型」是描述,
        不是逻辑 —— 描述你的数据长什么样,好让编译器替你把关。
      </>
    ),
  },
  {
    type: "choice",
    q: <>TypeScript 的类型检查发生在什么时候?</>,
    opts: [
      <>代码运行时,每执行一行检查一行</>,
      <>编译期 —— 你保存/构建的时候,代码还没跑就查完了</>,
      <>部署到服务器的时候</>,
      <>用户打开网页的时候</>,
    ],
    correct: 1,
    wrong: [
      <>
        运行时已经太晚了 —— 而且类型在编译后全部擦除,运行时根本没有
        「类型」这个东西可查。
      </>,
      undefined,
      <>
        部署只是把编译产物搬过去。检查早在你编辑器里保存那一刻
        (以及 CI 里跑 tsc 时)就完成了。
      </>,
      <>
        用户拿到的是纯 JS,里面一个类型都没有 ——
        检查的成本全部留在开发阶段,一点不带给用户。
      </>,
    ],
    why: (
      <>
        这就是主比喻:安检口设在登机前,不设在天上。JS
        的错误在半夜的线上炸,TS 的错误在你保存文件时炸。
      </>
    ),
  },
  {
    type: "choice",
    q: <>「类型擦除(type erasure)」指的是什么?</>,
    opts: [
      <>编译后类型信息全部消失,产物是普通 JS,运行时行为不变</>,
      <>TS 会把类型转成运行时校验代码,自动帮你验数据</>,
      <>只有报错的类型会被擦掉,没报错的会保留</>,
      <>擦掉的是注释,类型会编译进产物</>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        这是最危险的误解 —— TS 不生成任何校验代码。接口来的 JSON
        长歪了照样进来,运行时校验得自己写(终章讲怎么写)。
      </>,
      <>
        擦除和报错无关:不管这次编译报不报错,产物里都不会剩下任何类型 ——
        擦除是无条件的。
      </>,
      <>
        反了 —— 被保证擦干净的恰恰是类型;注释保不保留倒要看编译配置。
        类型从不进产物。
      </>,
    ],
    why: (
      <>
        类型是「编译期的安检」,下了飞机(运行时)就不存在了。想通这一点,
        你就同时想通了两件事:TS 不拖慢程序,TS 也不在运行时保护你。
      </>
    ),
  },
  {
    type: "multi",
    q: <>下面哪些方式,能让一段 TypeScript 代码真正跑起来?(多选)</>,
    opts: [
      <>用 tsc 编译成 .js,再跑编译产物</>,
      <>用 Vite / esbuild 这类构建工具在打包时转译</>,
      <>用新版 Node(22.18+)、Deno 或 Bun 直接运行 .ts 文件</>,
      <>让浏览器直接加载 .ts 文件执行</>,
    ],
    correct: [0, 1, 2],
    missHint: (
      <>
        三条正路你漏了至少一条 —— 提示:一条靠「编译」,一条靠「转译」,
        还有一条是运行时「边擦边跑」。
      </>
    ),
    extraHint: (
      <>
        有一项到今天也办不到:浏览器只认 JS,你给它 .ts,
        它只会当成语法错误的脚本。
      </>
    ),
    why: (
      <>
        三条路:① tsc 检查 + 翻译;② bundler 只擦类型不检查(检查交给编辑器和
        CI);③ Node 22.18+ 原生类型擦除直接跑(仅限可擦除语法),Deno、Bun
        天生支持。唯独浏览器,永远只吃 JS。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        纯 JavaScript 里,读 <code>order.totle</code>(实际属性叫
        total)会发生什么?
      </>
    ),
    opts: [
      <>立刻抛出错误,程序停止</>,
      <>
        安静地返回 undefined,程序继续跑;一旦参与运算,还可能变成 NaN
        传给下游
      </>,
      <>JS 引擎会自动纠正成 total</>,
      <>返回 null</>,
    ],
    correct: 1,
    wrong: [
      <>
        这是很多人「以为」的行为,也是 JS 最坑的一点 ——
        读不存在的属性不报错,静静给你 undefined,错误当场隐身。
      </>,
      undefined,
      <>
        引擎不做拼写检查。「你是不是想写 total?」这句贴心话,是 TS
        编译器说的,JS 引擎从不多嘴。
      </>,
      <>
        读不存在的属性得到的是 undefined,不是 null —— null
        得有人亲手赋值才会出现,这两位 01 章还会细分。
      </>,
    ],
    why: (
      <>
        undefined 不吭声,乘个数变 NaN,NaN 再一路传染 ——
        等它在页面上露面,案发现场早离出错那行十万八千里了。
        这正是「编译期安检」要拦的头号危险品。
      </>
    ),
  },
  {
    type: "fill",
    q: (
      <>
        TypeScript 官方编译器的命令行工具,名字是____(三个字母,平时用
        npx 调它)。
      </>
    ),
    answers: ["tsc", "npx tsc"],
    hint: <>TypeScript Compiler 的缩写 —— 首字母连起来。</>,
    why: (
      <>
        tsc 干两件事:<b>检查</b>(对照类型说明书报错)+ <b>翻译</b>
        (把 .ts 擦成 .js)。<code>npx tsc --init</code> 生成配置,
        <code>npx tsc --noEmit</code> 只检查不出产物 —— 这几个命令后面章节
        会一直用。
      </>
    ),
  },
  {
    type: "choice",
    q: <>「用了 TypeScript,代码会跑得比 JavaScript 快」—— 这句话?</>,
    opts: [
      <>对,类型信息能让引擎提前优化</>,
      <>不对 —— 编译产物就是普通 JS,运行速度和手写 JS 没有区别</>,
      <>对,因为 TS 跳过了解释执行的步骤</>,
      <>不对,TS 产物反而明显更慢</>,
    ],
    correct: 1,
    wrong: [
      <>
        听着合理,但类型在产物里根本不存在 ——
        引擎压根见不到它们,谈不上拿来优化。
      </>,
      undefined,
      <>
        不存在这回事:产物就是 JS,引擎该怎么执行还怎么执行,
        一步都没省。
      </>,
      <>
        也不慢 —— 擦除几乎不改动代码本身,产物性能和手写 JS 相同。
        「快慢」这个维度上,TS 是中性的。
      </>,
    ],
    why: (
      <>
        TS 提速的不是程序,是你:重构敢下手、补全真的准、半夜不用爬起来查
        NaN —— 快在开发,不在运行。
      </>
    ),
  },
];
