"use client";

// 09 · 模块与声明文件 —— 动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "playground-dts",
    title: "在 Playground 亲眼看说明书出炉",
    d: "easy",
    tags: [".D.TS", "类型擦除", "Playground"],
    task: (
      <p>
        打开 TypeScript Playground(typescriptlang.org/play),写一个
        interface + 一个带返回值的函数并 export。然后依次点右侧的{" "}
        <b>.D.TS 标签页</b>(自动生成的说明书)和 <b>.JS 标签页</b>
        (编译产物)—— 对照看:interface 在两边各是什么下场?
      </p>
    ),
    hint: (
      <>
        .D.TS 里函数只剩签名、前面多了 declare;.JS 里 interface
        连影子都没有 —— 一句话概括这两个面板的分工试试?
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="playground.ts"
          code={`export interface MenuItem {
  name: string;
  price: number;
}

export function cheapest(items: MenuItem[]): MenuItem {
  return [...items].sort((a, b) => a.price - b.price)[0];
}`}
        />
        <p>
          .D.TS 面板:<code>export declare function cheapest(items:
          MenuItem[]): MenuItem;</code> —— 只有形状,函数体没了;interface
          原样保留。.JS 面板正相反:函数体健在,interface 蒸发。
          一句话:<b>.js 是商品,.d.ts 是说明书</b>,同一份源码,
          一刀切成两半。
        </p>
      </>
    ),
  },
  {
    id: "tsc-declaration",
    title: "本地用 tsc 生成一份 .d.ts",
    d: "medium",
    tags: ["tsc", "--declaration", "本地实操"],
    task: (
      <p>
        找个空目录,写一个 <code>order.ts</code>(export 一个函数 +
        一个 interface),然后跑{" "}
        <code>npx tsc order.ts --declaration</code>。
        打开生成的两个文件,对照源码看看各留下了什么。
      </p>
    ),
    hint: (
      <>
        产物应该有两个:order.js 和 order.d.ts。想只要说明书不要商品?
        再试试加 <code>--emitDeclarationOnly</code>。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="bash"
          title="terminal"
          code={`mkdir dts-lab && cd dts-lab
cat > order.ts << 'EOF'
export interface Order {
  id: string;
  total: number;
}
export function createOrder(total: number): Order {
  return { id: "MT-" + Date.now(), total };
}
EOF

npx tsc order.ts --declaration
ls          # order.ts  order.js  order.d.ts`}
        />
        <CodeBlock
          lang="dts"
          title="order.d.ts · 生成结果"
          code={`export interface Order {
  id: string;
  total: number;
}
export declare function createOrder(total: number): Order;`}
        />
        <p>
          发布 npm 包时,TS 库就是这么「出厂自带说明书」的:编译时开{" "}
          <code>declaration</code>,再在 package.json 里用 <code>types</code>{" "}
          字段指到这份 .d.ts —— 三来源里的第一来源,就这么点事。
        </p>
      </>
    ),
  },
  {
    id: "types-before-after",
    title: "装 @types 前后,一个报错的生与死",
    d: "medium",
    tags: ["@types", "ts(7016)", "本地实操"],
    task: (
      <p>
        新目录里 <code>npm init -y</code>,然后 <code>npm i lodash</code>
        (注意:<b>先不装</b> @types/lodash)。写一个 index.ts import{" "}
        debounce,跑 <code>npx tsc --noEmit --strict index.ts</code>{" "}
        看报错全文;再 <code>npm i -D @types/lodash</code>,重跑一次。
      </p>
    ),
    hint: (
      <>
        第一次会撞上本章的老朋友 ts(7016)——
        别急着翻回来看解法,报错原文里就写着。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="bash"
          title="terminal"
          code={`mkdir types-lab && cd types-lab
npm init -y
npm i lodash

echo 'import { debounce } from "lodash";
debounce(() => {}, 300);' > index.ts

npx tsc --noEmit --strict index.ts
# ❌ ts(7016): Could not find a declaration file for
#    module 'lodash'. Try \`npm i --save-dev @types/lodash\` …

npm i -D @types/lodash
npx tsc --noEmit --strict index.ts
# ✅ 无输出 = 通过`}
        />
        <p>
          装完 @types 的瞬间,编辑器里 debounce 的补全、参数提示同时上线
          —— 商品没变,变的是说明书到货了。顺手打开{" "}
          <code>node_modules/@types/lodash</code> 看一眼:
          全是 .d.ts,一行实现都没有。
        </p>
      </>
    ),
  },
  {
    id: "declare-module-promise",
    title: "手写 declare module,再验证「声明是承诺」",
    d: "hard",
    tags: ["declare module", ".d.ts", "本地实操"],
    task: (
      <p>
        在上一个实验目录里,给一个<b>并不存在的包</b> boba-sdk 写声明:建{" "}
        <code>types/boba-sdk.d.ts</code>,用 declare module 描出{" "}
        <code>fetchMenu</code> 的形状;写一个 shop.ts import 并调用它。
        然后:① 跑 tsc 类型检查;② 编译后用 node 跑跑看。
        两步的结果分别说明了什么?
      </p>
    ),
    hint: (
      <>
        tsc 直接编译单文件时记得把 .d.ts 一起传进去。类型检查会绿灯,
        node 会红灯 —— 想清楚为什么不矛盾。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="dts"
          title="types/boba-sdk.d.ts"
          code={`declare module "boba-sdk" {
  export function fetchMenu(shopId: string): Promise<string[]>;
}`}
        />
        <CodeBlock
          lang="bash"
          title="terminal"
          code={`echo 'import { fetchMenu } from "boba-sdk";
fetchMenu("hz-001").then(console.log);' > shop.ts

npx tsc --noEmit shop.ts types/boba-sdk.d.ts
# ✅ 类型检查通过 —— 编译器信了你的承诺

npx tsc shop.ts types/boba-sdk.d.ts && node shop.js
# ❌ Cannot find module 'boba-sdk'
#    —— 运行时去 node_modules 找商品,货架是空的`}
        />
        <p>
          这就是「声明是承诺,不是魔法」的完整体感:.d.ts 说服得了编译器,
          说服不了 Node —— 它只管按说明书检查,<b>商品有没有真到货,
          是运行时的事</b>。真实项目里 declare module
          面向的是「装了但没类型」的包,而不是没装的包。
        </p>
      </>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: <>一个 .d.ts 文件里,装的是什么?</>,
    opts: [
      <>只有类型声明(形状),没有任何实现代码</>,
      <>实现代码的压缩版本</>,
      <>类型声明 + 关键函数的实现</>,
      <>编译器的缓存数据</>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        压缩版实现是 .min.js 的事 —— .d.ts 里连一个函数体都没有,
        函数全都止步于签名加分号。
      </>,
      <>
        一行实现都不许有:哪怕你想写,<code>declare</code>{" "}
        的语义就是「实现不在这儿」—— 有实现的那份叫 .ts。
      </>,
      <>
        编译器缓存是 .tsbuildinfo 干的活;.d.ts 是给人和编译器读的
        「说明书」,是正经的源码级产物。
      </>,
    ],
    why: (
      <>
        .d.ts = 说明书:告诉编译器每个导出「长什么样」,
        商品本体(实现)在旁边的 .js 里。这也是为什么它能描述任何 JS 库
        —— 描述形状不需要动商品。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>import type {"{ Order }"} from &quot;./order&quot;</code> ——
        这一句编译成 JavaScript 后会变成什么?
      </>
    ),
    opts: [
      <>整句消失,产物里没有任何痕迹</>,
      <>
        变成 <code>import {"{ Order }"} from &quot;./order&quot;</code>
      </>,
      <>
        变成 <code>require(&quot;./order&quot;)</code>
      </>,
      <>保留原样,由浏览器决定要不要加载</>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        那就成值进口了 —— 运行时会真的去加载 ./order。type
        的意义恰恰是宣布「这句只为类型服务,编译时整句抹掉」。
      </>,
      <>
        require 是模块格式转换的事(esm → cjs),和 type 无关 ——
        而且纯类型进口连转换的资格都没有,直接蒸发。
      </>,
      <>
        浏览器压根不认识 TypeScript 的 type 关键字 ——
        这句必须在编译期处理掉,轮不到运行时做决定。
      </>,
    ],
    why: (
      <>
        类型编译后全部擦除,所以纯类型的 import 整句蒸发 ——
        不会产生运行时加载,也不会引起副作用。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        为什么 verbatimModuleSyntax 时代提倡<b>显式</b>写{" "}
        <code>import type</code>?
      </>
    ),
    opts: [
      <>
        esbuild / SWC 这类单文件转译器分不清一个名字是值还是类型,
        显式标注让它们不用猜
      </>,
      <>写 type 的 import 加载速度更快</>,
      <>不写 type 的话类型会漏进运行时</>,
      <>纯粹是代码风格,没有实际差别</>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        编译后它整句都没了,谈不上加载速度 ——
        受益的是编译工具的确定性,不是运行时性能。
      </>,
      <>
        类型永远进不了运行时(擦除是铁律)——
        风险方向恰恰相反:工具猜错把<b>值</b>的 import 删了,运行时才炸。
      </>,
      <>
        对只用 tsc 的项目差别确实小,但一接入单文件转译器就是
        实打实的正确性问题 —— 所以 TS 5.0 专门加了
        verbatimModuleSyntax 把规则钉死。
      </>,
    ],
    why: (
      <>
        tsc 看得到全项目,能猜;Vite/esbuild/SWC 一次只看一个文件,猜不了。
        显式 type = 「这句一定删」,不带 = 「一字不动」——
        谁来编译结果都一样。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        import lodash 时撞上 ts(7016)「Could not find a declaration file
        for module &apos;lodash&apos;」。最该先做的是?
      </>
    ),
    opts: [
      <>
        <code>npm i -D @types/lodash</code>
      </>,
      <>
        <code>npm i lodash</code> 重装一遍
      </>,
      <>
        给 import 的结果标上 <code>any</code>,继续干活
      </>,
      <>
        关掉 strict,让报错消失
      </>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        商品已经在货架上了(不然报错会是 Cannot find module)——
        缺的是说明书,重进一遍货解决不了。
      </>,
      <>
        能跑,但 lodash 的几百个函数从此全是 any ——
        用一次止痛药把整间药房的检查都关了,亏大了。
      </>,
      <>
        为一个库放弃全项目的 strict,是最贵的解法 ——
        而且报错原文里明明白白写着正确答案。
      </>,
    ],
    why: (
      <>
        三来源顺序:自带 → @types → 手写。lodash 这种老牌库,@types
        专柜必有 —— 一条命令,类型、补全、文档提示全部上线。
      </>
    ),
  },
  {
    type: "fill",
    q: (
      <>
        <code>@types/*</code> 这些包背后,那个由社区维护的类型声明大仓库
        叫什么名字?(英文)
      </>
    ),
    placeholder: "输入仓库名…",
    answers: ["DefinitelyTyped", "definitely typed"],
    hint: (
      <>
        两个英文单词连写,直译大概是「绝对有类型」——
        GitHub 上最大的仓库之一。
      </>
    ),
    why: (
      <>
        DefinitelyTyped 收录了几千个 JS 库的社区说明书,发布成 @types/*
        —— 你也可以给它提 PR,让下一个人少写一遍。
      </>
    ),
  },
  {
    type: "choice",
    q: <>@types/node 装了之后,你得到的是?</>,
    opts: [
      <>
        Node 内置模块(fs、path、process…)的类型声明
      </>,
      <>让 Node 能直接运行 .ts 文件的能力</>,
      <>浏览器 DOM API 的类型声明</>,
      <>npm 上所有包的类型合集</>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        @types 包只有类型,不改变任何运行时能力 —— Node 原生跑 TS
        靠的是 Node 22.18+ 自己的类型擦除,和这个包无关。
      </>,
      <>
        DOM 的类型在 TS 自带的 lib.dom.d.ts 里,由 tsconfig 的 lib
        选项控制 —— 和 @types/node 正好是两个世界。
      </>,
      <>
        一个库一本说明书,各装各的 —— @types/node 只管 Node
        自身的 API,lodash 的得另装 @types/lodash。
      </>,
    ],
    why: (
      <>
        fs、path、process 这些不是 JS 语言的一部分,是 Node 的私货 ——
        它们的说明书就是 @types/node。Node 项目的 tsconfig
        基线里它几乎必备。
      </>
    ),
  },
  {
    type: "multi",
    q: <>关于 declare 家族,哪些说法是对的?(多选)</>,
    opts: [
      <>declare 只描述类型,不产生任何运行时代码</>,
      <>
        在模块文件里给 window 加字段,要用 <code>declare global</code>{" "}
        包起来
      </>,
      <>declare 过的东西,运行时保证存在</>,
      <>
        <code>declare module</code> 只能用于 npm 包,不能用于其他模块名
      </>,
    ],
    correct: [0, 1],
    missHint: (
      <>
        有一条你漏了 —— 想想「打包票的三种姿势」里,
        给 window 加字段那份 .d.ts 的写法。
      </>
    ),
    extraHint: (
      <>
        有一项混进来了 —— 想想「声明是承诺不是魔法」:
        编译器信了你的承诺,可运行时的货架不会因此多出一件货。
      </>
    ),
    why: (
      <>
        declare = 向编译器打包票,零运行时产物;包票开错了(运行时其实
        没有),炸的是你。declare global 是模块里扩全局的正确姿势;
        declare module 的模块名随便写,npm 包、路径、
        甚至通配符(*.css)都行。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>&quot;skipLibCheck&quot;: true</code> 跳过的是什么检查?
      </>
    ),
    opts: [
      <>所有 .d.ts 文件内部的类型检查 —— 你自己代码对库的调用照查不误</>,
      <>你的代码里所有用到第三方库的地方</>,
      <>node_modules 里 JS 文件的编译</>,
      <>相当于把 strict 关掉</>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        方向反了 —— 你传错参数、拼错方法名照样报错。
        跳过的是「说明书自己的体检」,不是「你按说明书用得对不对」。
      </>,
      <>
        node_modules 里的 JS 本来就不参与类型检查(除非你开 allowJs
        还把它 include 进来)—— skipLibCheck 管的是 .d.ts。
      </>,
      <>
        strict 管你自己代码的严格程度,两者完全独立 ——
        strict: true + skipLibCheck: true 是最常见的组合。
      </>,
    ],
    why: (
      <>
        说明书之间也会打架(比如两份 @types 各声明了一个全局)——
        skipLibCheck 跳过这些内战,只查你的代码,编译还更快。
        务实默认:开。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        项目里只有 <code>helpers.d.ts</code>,没有对应的
        helpers.js。<code>import {"{ helper }"} from
        &quot;./helpers&quot;</code> 然后用 node 运行,结果是?
      </>
    ),
    opts: [
      <>类型检查通过,运行时报「找不到模块」</>,
      <>类型检查就会报错,拦在编译期</>,
      <>能正常运行 —— .d.ts 会被自动当作实现</>,
      <>
        运行时 helper 是 <code>undefined</code>,但不报错
      </>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        编译器恰恰不拦 —— 说明书在,形状对得上,它就放行。
        这正是这个坑阴险的地方:绿灯一路开到运行时才炸。
      </>,
      <>
        .d.ts 里没有一行代码,拿什么当实现?
        说明书写得再详细,也变不出商品。
      </>,
      <>
        连 undefined 都轮不到 —— 模块本身就不存在,
        import 那一步直接抛「Cannot find module」。
      </>,
    ],
    why: (
      <>
        编译器读说明书,运行时找商品 —— 两样得都在。「声明是承诺,
        不是魔法」:.d.ts 只负责让编译器点头,货没到,一跑就穿帮。
      </>
    ),
  },
];
