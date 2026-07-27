"use client";

// 终章 · 类型思维 —— 动手任务 LABS + 总测验 QUIZ 数据。
// 总测验横跨全书 12 章;每个错误选项都有针对性纠错,并注明回看章节。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "trio-bench",
    title: "三兄弟同台:亲手把三盏灯点一遍",
    d: "easy",
    tags: ["satisfies", "as", "Playground"],
    task: (
      <>
        <p>
          打开 typescriptlang.org/play,把 §01 对比台上的{" "}
          <code>Config</code> 和配置对象粘进去,然后做三轮实验:
          ① 用 <code>: Config</code> 注解 ② 用 <code>as Config</code>{" "}
          ③ 用 <code>satisfies Config</code>。每一轮都干两件坏事:
          把 <code>theme</code> 拼成 <code>thema</code>、删掉{" "}
          <code>maxSugar</code>,记下谁报错谁放行;最后恢复正确写法,
          鼠标悬停 <code>config.theme</code>,记下三种写法各推断出什么。
        </p>
      </>
    ),
    hint: (
      <>
        九个格子的表(3 种写法 × 拼错/漏字段/推断),
        填完应该和 §01 的红绿灯完全一致 —— 有出入就再看一眼,
        别放过任何一格。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="实验结论(satisfies 版)"
          code={`interface Config {
  shop: string;
  theme: "light" | "dark";
  maxSugar: number;
}

const config = {
  shop: "茶言观色",
  theme: "dark",
  maxSugar: 7,
} satisfies Config;

// 拼成 thema     → 注解 ✕ 报错 / as ✓ 放行 / satisfies ✕ 报错
// 删掉 maxSugar  → 注解 ✕ 报错 / as ✓ 放行 / satisfies ✕ 报错
// config.theme   → 注解 "light" | "dark"
//                  as   "light" | "dark"
//                  satisfies "dark"  ← 只有它保住了字面量`}
          note={
            <>
              压轴实验:把最后一行改成{" "}
              <code>{"} as const satisfies Config;"}</code>,
              再悬停 —— 整个对象 readonly,字面量全部钉死,形状还被校验。
              这就是配置对象的满配写法。
            </>
          }
        />
      </>
    ),
  },
  {
    id: "order-guard",
    title: "手写 Order 校验器:把边界守起来",
    d: "medium",
    tags: ["unknown", "类型谓词", "边界"],
    task: (
      <>
        <p>
          在 Playground 里定义{" "}
          <code>
            {"interface Order { id: string; total: number; toppings: string[] }"}
          </code>
          ,然后手写 <code>isOrder(x: unknown): x is Order</code>,
          要求逐字段检查,<b>包括 toppings 是不是「字符串数组」</b>
          (提示:光 Array.isArray 不够,里面的元素也得查)。
        </p>
        <p>
          用两份数据自测:
          <code>{`JSON.parse('{"id":"A-1","total":30,"toppings":["珍珠"]}')`}</code>{" "}
          应该通过;
          <code>{`JSON.parse('{"id":"A-2","total":"30","toppings":[1]}')`}</code>{" "}
          应该被拦下。
        </p>
      </>
    ),
    hint: (
      <>
        数组检查的套路:<code>Array.isArray(o.toppings)</code> 先确认是数组,
        再 <code>{'o.toppings.every((t) => typeof t === "string")'}</code>{" "}
        查每个元素 —— every 配合类型谓词,TS 5.5 起还能自动收窄。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="isOrder · 完整版"
          hl={[7, 11]}
          code={`interface Order {
  id: string;
  total: number;
  toppings: string[];
}

function isOrder(x: unknown): x is Order {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.total === "number" &&
    Array.isArray(o.toppings) &&
    o.toppings.every((t) => typeof t === "string")
  );
}

const good: unknown =
  JSON.parse('{"id":"A-1","total":30,"toppings":["珍珠"]}');
const bad: unknown =
  JSON.parse('{"id":"A-2","total":"30","toppings":[1]}');

console.log(isOrder(good)); // true  → 收窄成 Order,放行
console.log(isOrder(bad));  // false → 拦在边界,total 是字符串`}
          note={
            <>
              第二份数据的 total 是 <code>{'"30"'}</code>(字符串)——
              这种「差一点点」的坏数据正是线上最常见的,
              as 会放它进来,校验器不会。
            </>
          }
        />
      </>
    ),
  },
  {
    id: "my-omit",
    title: "第一道体操:不看答案实现 MyOmit",
    d: "medium",
    tags: ["映射类型", "键重映射", "type-challenges"],
    task: (
      <>
        <p>
          在 Playground 里,<b>不用内置 Omit、不回看 §06</b>,自己实现{" "}
          <code>MyOmit&lt;T, K&gt;</code>。用这两行验收:
        </p>
        <CodeBlock
          lang="ts"
          code={`type Case1 = MyOmit<{ a: 1; b: 2; c: 3 }, "a">;
//   期望:{ b: 2; c: 3 }
type Case2 = MyOmit<Order, "toppings" | "total">;
//   期望:只剩 id`}
        />
        <p>卡住十分钟以上再看提示 —— 卡住的时间就是长本事的时间。</p>
      </>
    ),
    hint: (
      <>
        两条路:① 键重映射 <code>[P in keyof T as …]</code>,
        黑名单上的键映射成 never;② 先用 Exclude 把 keyof T
        过滤一遍再映射。两种都写出来,才算真懂。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="两种写法"
          code={`// 写法一:键重映射(TS 4.1,§06 讲的版本)
type MyOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

// 写法二:先过滤键,再映射(Exclude 是 07 章的条件类型)
type MyOmit2<T, K extends keyof T> = {
  [P in Exclude<keyof T, K>]: T[P];
};`}
          note={
            <>
              两种写法等价 —— 写法二暴露了 Omit 的官方真身:
              <code>{"Pick<T, Exclude<keyof T, K>>"}</code>。
              去 type-challenges 的第 3 题(Omit)提交你的版本,
              看看测试用例还能不能揪出边角。
            </>
          }
        />
      </>
    ),
  },
  {
    id: "deep-readonly",
    title: "第二道体操:DeepReadonly,然后上路",
    d: "hard",
    tags: ["递归", "条件类型", "type-challenges"],
    task: (
      <>
        <p>
          在 Playground 实现 <code>DeepReadonly&lt;T&gt;</code>:
          对象的每一层属性都变 readonly。验收:嵌套两层的配置对象,
          改最里层的字段要报错。做完这道,去{" "}
          <b>github.com/type-challenges/type-challenges</b> 的 easy
          区连做三道(推荐 Pick、Readonly、Tuple to Object)——
          那里每道题自带测试用例,当场判分。
        </p>
      </>
    ),
    hint: (
      <>
        骨架:映射类型加 readonly 前缀,值类型走条件类型 ——
        是对象就递归 <code>DeepReadonly&lt;T[K]&gt;</code>,不是就原样保留。
        小心函数:函数也是 object,想放过它可以再加一层{" "}
        <code>T[K] extends Function</code> 判断。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="DeepReadonly · 课程版"
          hl={[2, 3]}
          code={`type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends (...args: never[]) => unknown
      ? T[K]              // 函数放过,别往里递归
      : DeepReadonly<T[K]> // 对象继续锁
    : T[K];               // 原始值,锁到头了
};

declare const cfg: DeepReadonly<{
  shop: string;
  hours: { open: number; close: number };
}>;
cfg.hours.open = 8;
// ✕ Cannot assign to 'open' —— 里层也锁住了`}
          note={
            <>
              type-challenges 的官方判题对数组、元组还有更细的要求 ——
              提交后按测试用例迭代你的版本,那个过程比答案本身值钱。
              从今天起,每天一道,easy 刷完你就是团队里的类型担当。
            </>
          }
        />
      </>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: (
      <>
        <code>let a = "奶绿";</code> 和 <code>const b = "奶绿";</code>,
        TypeScript 分别推断出什么类型?
      </>
    ),
    opts: [
      <>
        a 和 b 都是 <code>string</code>
      </>,
      <>
        a 是 <code>string</code>,b 是字面量类型 <code>&quot;奶绿&quot;</code>
      </>,
      <>
        a 和 b 都是 <code>&quot;奶绿&quot;</code>
      </>,
      <>
        a 是 <code>&quot;奶绿&quot;</code>,b 是 <code>string</code>
      </>,
    ],
    correct: 1,
    wrong: [
      <>
        b 想想 —— const 变量永远不会被重新赋值,编译器没理由拓宽它:
        推断停在字面量 <code>&quot;奶绿&quot;</code>。
      </>,
      undefined,
      <>
        a 是 let,以后可能赋别的字符串 —— 编译器主动拓宽成{" "}
        <code>string</code>,不然你连改都不能改。
      </>,
      <>
        正好说反了:let 拓宽、const 收窄 ——
        「会不会变」决定「推多宽」。
      </>,
    ],
    why: (
      <>
        let 可以再赋值,推断拓宽成 string;const
        钉死了,推断保留字面量。这也是 as const 的名字来历:
        「像 const 一样推断」。—— 回看第 01 章。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        订单状态用可辨识联合建模,switch 的 default 分支里写了{" "}
        <code>const x: never = order;</code>。三个月后新增状态{" "}
        <code>&quot;refunded&quot;</code>,会发生什么?
      </>
    ),
    opts: [
      <>什么都不会发生,新状态自动走 default</>,
      <>
        编译报错:refunded 那个成员收窄不掉,赋不给 never ——
        编译器逼你补 case
      </>,
      <>运行时抛出 NeverError</>,
      <>switch 语句整个失效</>,
    ],
    correct: 1,
    wrong: [
      <>
        「自动走 default」正是没有穷尽检查时的世界 —— 新状态被静默吞掉,
        页面显示成一片空白没人知道为什么。never 哨兵就是为了打破这种沉默。
      </>,
      undefined,
      <>
        never 是纯编译期概念,运行时没有它的任何痕迹(类型擦除)——
        它的全部使命就是让错误发生在编译期,轮不到运行时。
      </>,
      <>
        switch 好端端的 —— 报错只发生在那行 never 赋值上,
        而这正是设计目的:一行哨兵,守住所有分支。
      </>,
    ],
    why: (
      <>
        穷尽检查(exhaustiveness check):处理完所有成员,
        联合被收窄成 never,哨兵赋值合法;漏了一个,那个成员还活着,
        赋给 never 立刻报错。新增状态的那一刻,所有没处理它的 switch
        集体亮红 —— 这是可辨识联合送你的免费保险。—— 回看第 03 章。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>{"order({ size: \"large\", ice: \"none\" })"}</code> 报错
        「ice 不存在」,但先 <code>const m = …</code>{" "}
        存变量再传就通过了。为什么?
      </>
    ),
    opts: [
      <>因为变量比字面量优先级高,检查被跳过了</>,
      <>
        对象字面量直接传参时是「新鲜」的,做多余属性检查;
        存进变量就按普通结构兼容算,多字段不追究
      </>,
      <>这是 TypeScript 的 bug,新版本已修复</>,
      <>因为 const 声明的对象不做任何类型检查</>,
    ],
    correct: 1,
    wrong: [
      <>
        没有「优先级」这回事 —— 差别在检查规则:字面量享受(或者说忍受)
        一套额外的新鲜度检查,变量走的是普通的结构兼容。
      </>,
      undefined,
      <>
        不是 bug,是刻意设计:字面量现写现传,多出来的字段
        99% 是拼错或误解,值得报;变量可能在别处另有用途,多字段合法。
      </>,
      <>
        const 变量的类型检查一点不少 —— 少的只是「多余属性检查」这一项,
        结构兼容的底线仍然守着:少字段照样报错。
      </>,
    ],
    why: (
      <>
        多余属性检查(excess property check)只对「新鲜」的对象字面量生效 ——
        直接赋值、直接传参时查;先存变量再传,按结构化兼容,
        形状够用就放行。新手第一大惑,就此拆除。—— 回看第 04 章。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>
          {"function longest<T extends { length: number }>(a: T, b: T): T"}
        </code>
        ,下面哪个调用会报错?
      </>
    ),
    opts: [
      <>
        <code>{'longest("四季春", "杨枝甘露")'}</code>
      </>,
      <>
        <code>longest([1, 2, 3], [4, 5])</code>
      </>,
      <>
        <code>longest(15, 12)</code>
      </>,
      <>
        <code>{'longest({ length: 3 }, { length: 7 })'}</code>
      </>,
    ],
    correct: 2,
    wrong: [
      <>
        字符串有 length 属性 —— 约束满足,T 推断成 string,合法。
      </>,
      <>
        数组当然有 length —— T 推断成 number[],合法。
      </>,
      undefined,
      <>
        形状里明晃晃写着 length: number —— 结构化类型看形状,
        谁提供了 length 谁就过关,合法。
      </>,
    ],
    why: (
      <>
        <code>extends {"{ length: number }"}</code> 是泛型的护栏:
        传进来的类型必须有 number 类型的 length。number
        没有 length 属性 —— 15 不知道自己「多长」——
        当场被约束拦下。—— 回看第 05 章。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        草稿单功能:用户没填完的 Order 也要能暂存,
        每个字段都允许先空着。哪个工具类型是为这件事生的?
      </>
    ),
    opts: [
      <>
        <code>Partial&lt;Order&gt;</code>
      </>,
      <>
        <code>Required&lt;Order&gt;</code>
      </>,
      <>
        <code>Readonly&lt;Order&gt;</code>
      </>,
      <>
        <code>{"Pick<Order, \"id\">"}</code>
      </>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        Required 方向反了 —— 它把所有可选字段变成必填,
        是「提交前最后校验」用的,不是「随便先存」用的。
      </>,
      <>
        Readonly 管的是「能不能改」,不是「能不能空」——
        草稿单恰恰是要反复改的。
      </>,
      <>
        Pick 是挑几个字段组新类型 —— 草稿单不是「只剩 id」,
        是「每个字段都可以先没有」。
      </>,
    ],
    why: (
      <>
        <code>Partial&lt;Order&gt;</code> 把每个字段都加上 <code>?</code> ——
        「所有字段皆可缺席」正是草稿的定义。它的实现只有一行映射类型:
        <code>{"{ [K in keyof T]?: T[K] }"}</code>。—— 回看第 06 章
        (想看它怎么造的,回看第 07 章)。
      </>
    ),
  },
  {
    type: "fill",
    q: (
      <>
        <code>{'const MENU = { 奶绿: 15, 四季春: 12 } as const;'}</code>
        <br />
        <code>type Name = keyof typeof MENU;</code> —— Name
        是什么类型?(用 | 连接)
      </>
    ),
    placeholder: '例如 "a" | "b"',
    answers: [
      '"奶绿" | "四季春"',
      '"四季春" | "奶绿"',
      "奶绿 | 四季春",
      "四季春 | 奶绿",
    ],
    hint: (
      <>
        两步走:<code>typeof MENU</code> 先从值拿到对象类型,
        <code>keyof</code> 再把它的键拆成联合 —— 键是两个中文名。
      </>
    ),
    why: (
      <>
        <code>typeof</code>(类型位)从值世界取类型,<code>keyof</code>{" "}
        取键的联合:<code>{'"奶绿" | "四季春"'}</code>。
        菜单只写一遍,名字的类型从菜单里自动长出来 ——
        值变类型跟着变,这是类型运算最常用的一手。—— 回看第 07 章。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        strict 模式下,<code>catch (e)</code> 里的 <code>e</code>{" "}
        是什么类型?为什么?
      </>
    ),
    opts: [
      <>
        <code>Error</code> —— catch 到的当然是错误对象
      </>,
      <>
        <code>any</code> —— 错误来源不明,只能放开
      </>,
      <>
        <code>unknown</code> —— throw 什么的都有,先收窄再用
      </>,
      <>
        <code>never</code> —— 正常流程不该走到 catch
      </>,
    ],
    correct: 2,
    wrong: [
      <>
        JS 允许 throw 任何东西 —— 字符串、数字、undefined 都行,
        catch 到的未必是 Error。想用 e.message?先{" "}
        <code>e instanceof Error</code> 收窄。
      </>,
      <>
        any 是老版本的行为 —— strict 里的 useUnknownInCatchVariables
        把它改成了 unknown,专治「e.message 直接用」的隐患。
      </>,
      undefined,
      <>
        never 是「不可能有值」—— catch 里明明抓到了一个值,
        只是不知道它长什么样,那是 unknown 的岗位。
      </>,
    ],
    why: (
      <>
        useUnknownInCatchVariables(strict 家族成员)让 catch 变量是
        unknown:类型安全的「不知道」,用前必须收窄 ——
        通常是 <code>e instanceof Error</code>。—— 回看第 10 章。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        写一个主题配置对象:既要编译器<b>校验它符合 Config</b>,
        又要 <code>config.theme</code> 保持字面量{" "}
        <code>&quot;dark&quot;</code> 以便后续做精确判断。用哪种写法?
      </>
    ),
    opts: [
      <>
        <code>const config: Config = {"{…}"}</code>
      </>,
      <>
        <code>const config = {"{…}"} as Config</code>
      </>,
      <>
        <code>const config = {"{…}"} satisfies Config</code>
      </>,
      <>
        <code>const config = {"{…}"}</code>,什么都不加
      </>,
    ],
    correct: 2,
    wrong: [
      <>
        注解校验没问题,但推断被改写成 Config —— theme 拓宽成{" "}
        <code>{'"light" | "dark"'}</code>,「具体是哪个」这条信息丢了。
      </>,
      <>
        as 两头空:漏字段照样放行(检查没了),theme 还是被拓宽
        (推断也没了)—— 三兄弟里最不该选的一个。
      </>,
      undefined,
      <>
        什么都不加,推断确实精确 —— 但没有任何校验:
        字段拼错、漏写,要等到使用处才炸,错误离案发现场十万八千里。
      </>,
    ],
    why: (
      <>
        satisfies(TS 4.9)= 校验形状 + 保留字面量推断,
        「既要又要」的唯一答案。口诀:注解检查但拓宽,as 不检查还拓宽,
        satisfies 又检查又保推断。—— 回看本章 §01。
      </>
    ),
  },
  {
    type: "multi",
    q: <>关于 any 和 unknown,下面哪些说法是对的?(多选)</>,
    opts: [
      <>unknown 的值不能直接调方法或取属性,必须先收窄</>,
      <>any 会传染:从 any 值上取出来的东西还是 any</>,
      <>unknown 和 any 效果一样,只是名字更体面</>,
      <>迁移期局部用 any 可以接受,但别让它泄漏进导出的函数签名</>,
      <>strict 模式下,fetch 回来的 JSON 会自动带上正确的类型</>,
    ],
    correct: [0, 1, 3],
    missHint: (
      <>
        还漏了一条 —— 想想 any 最阴险的性质:它是会顺着赋值和属性访问
        一路扩散的。另外「爆炸半径」那条也别忘了。
      </>
    ),
    extraHint: (
      <>
        有一项选多了 —— 要么把 unknown 和 any 划了等号(它们对「取用」
        的态度天差地别),要么高估了编译器对运行时数据的掌控
        (类型擦除了,它管不到网络那头)。
      </>
    ),
    why: (
      <>
        unknown 收下一切但用前必须收窄(类型安全的 any);any
        收下一切且放行一切,还会传染。纪律:先 unknown,不行再 any,
        any 关在局部别进导出签名。E 是幻觉 ——{" "}
        <code>res.json()</code> 返回的类型是 any/unknown,
        真实形状只有运行时校验知道。—— 回看本章 §03、§04。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        开着 <code>verbatimModuleSyntax</code>,要导入一个<b>只当类型用</b>的{" "}
        <code>Order</code>,正确写法是?
      </>
    ),
    opts: [
      <>
        <code>{'import { Order } from "./order"'}</code>
      </>,
      <>
        <code>{'import type { Order } from "./order"'}</code>
      </>,
      <>
        <code>{'const Order = require("./order")'}</code>
      </>,
      <>
        <code>{'import * as Order from "./order"'}</code>
      </>,
    ],
    correct: 1,
    wrong: [
      <>
        普通 import 在这条规则下会报错 —— 编译器不想猜「这个导入
        擦不擦得掉」,只当类型用就必须亮明身份。
      </>,
      undefined,
      <>
        require 是 CommonJS 的运行时函数,跟类型导入完全不是一回事 ——
        它导入的是值,擦不掉。
      </>,
      <>
        命名空间导入进来的是整个模块的值 —— 只要类型却抱走全部实现,
        正是 import type 要避免的浪费。
      </>,
    ],
    why: (
      <>
        <code>import type</code> 亮明「这行只有类型」——
        编译时整行擦除,产物里干干净净,打包器也不用猜。
        verbatimModuleSyntax(TS 5.0)把这个好习惯变成了硬规定。
        —— 回看第 09 章、第 10 章。
      </>
    ),
  },
  {
    type: "fill",
    q: (
      <>
        <code>{'const config = { theme: "dark" } as const;'}</code> ——
        此时 <code>config.theme</code> 的类型是什么?
      </>
    ),
    placeholder: "写出精确类型",
    answers: ['"dark"', "dark"],
    hint: (
      <>
        as const 的使命就是「一个字都不拓宽」——
        推断停在你写下的那个字面量上,还附赠 readonly。
      </>
    ),
    why: (
      <>
        as const 把推断钉死在字面量 <code>{'"dark"'}</code>{" "}
        并加上 readonly —— 没有它,对象属性会被拓宽成 string。
        搭配 satisfies 就是配置对象的满配写法。—— 回看本章 §01。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        毕业最后一题。编译后的线上代码里,能不能靠{" "}
        <code>{'if (order instanceof Order)'}</code>{" "}
        判断一个 interface 定义的 Order?
      </>
    ),
    opts: [
      <>能,TypeScript 会为每个 interface 生成运行时的类</>,
      <>
        不能 —— interface 编译后全部擦除,运行时判断得靠值层面的检查
        (类型谓词 / 校验函数)
      </>,
      <>能,但要先开 strict</>,
      <>不能,但把 interface 换成 type 就可以了</>,
    ],
    correct: 1,
    wrong: [
      <>
        恰恰相反 —— TypeScript 的承诺就是「不改变运行时行为」:
        interface 不生成任何 JS 代码,产物里找不到它的一个字节。
      </>,
      undefined,
      <>
        strict 管的是编译期检查多严,变不出运行时的类 ——
        类型擦除对所有配置一视同仁。
      </>,
      <>
        type 和 interface 在这件事上完全一样:都是纯编译期概念,
        擦除后一个都不剩。运行时想认人,只能查值的形状。
      </>,
    ],
    why: (
      <>
        类型擦除是全书的第一课也是最后一课:类型的世界在编译期结束,
        运行时的世界只有值。所以边界上要手写校验(本章 §03 的
        isOrder),所以可辨识联合靠的是 status 这个<b>真实存在的值字段</b>
        而不是类型名。想通这道题,类型思维就通了。—— 回看序章、本章 §03。
      </>
    ),
  },
];
