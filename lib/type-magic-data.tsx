"use client";

// 第 07 章 · 类型运算 —— 动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "no-distribute",
    title: "关掉分发开关",
    d: "easy",
    tags: ["条件类型", "分发", "Playground"],
    task: (
      <p>
        在 TypeScript Playground 里写两个条件类型:
        <code>Naked&lt;T&gt; = T extends string ? true : false</code> 和{" "}
        <code>Wrapped&lt;T&gt; = [T] extends [string] ? true : false</code>。
        都喂 <code>&quot;a&quot; | 1</code>,悬停看两个结果 ——
        解释清楚为什么一个是 <code>boolean</code>,一个是 <code>false</code>。
      </p>
    ),
    hint: (
      <>
        裸 T 会分发:两个成员各判一次,结果合并;包了 <code>[ ]</code>{" "}
        就整体判断。想想 <code>true | false</code> 合并之后显示成什么。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="distribute.ts · 参考答案"
          code={`type Naked<T>   = T extends string ? true : false;
type Wrapped<T> = [T] extends [string] ? true : false;

type A = Naked<"a" | 1>;
// boolean —— 分发:"a" → true,1 → false,合并 true | false = boolean

type B = Wrapped<"a" | 1>;
// false —— 元组包裹,整体判断:"a" | 1 塞不进 string,直接走假分支`}
          hl={[4, 7]}
        />
        <p>
          <code>A</code> 显示 <code>boolean</code> 是最容易懵的一步:
          不是 TS 偷懒,而是 <code>true | false</code>{" "}
          这个联合的规范名就叫 boolean。看到条件类型返回了「不该是联合」的联合,
          第一反应就该是:<b>哦,分发了</b>。
        </p>
      </>
    ),
  },
  {
    id: "getter-factory",
    title: "模板字面量造 Getter",
    d: "medium",
    tags: ["映射类型", "as", "模板字面量"],
    task: (
      <p>
        写一个 <code>Getters&lt;T&gt;</code>:把 T 的每个键 <code>K</code>{" "}
        变成方法 <code>get&#123;首字母大写的 K&#125;(): T[K]</code>。用{" "}
        <code>Pick&lt;Order, &quot;drink&quot; | &quot;size&quot;&gt;</code>{" "}
        验证,悬停应该看到 <code>getDrink: () =&gt; string</code> 和{" "}
        <code>getSize: () =&gt; Size</code>。
      </p>
    ),
    hint: (
      <>
        骨架照抄本章 Watchers:<code>[K in keyof T as …]</code>,
        新键名用模板字面量拼 <code>get</code> + <code>Capitalize</code>,
        值类型写成 <code>() =&gt; T[K]</code>。别忘了{" "}
        <code>string &amp; K</code> 那句保险话。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="getters.ts · 参考答案"
          code={`type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

type OrderGetters = Getters<Pick<Order, "drink" | "size">>;
// {
//   getDrink: () => string;
//   getSize:  () => Size;
// }`}
          hl={[2]}
        />
        <p>
          四个零件在一行里合体:映射循环、<code>as</code> 键重映射、
          模板字面量、<code>Capitalize</code>。Vue 的 <code>onXxx</code>、
          测试库的 <code>mockXxx</code>,类型层都是这个套路。
        </p>
      </>
    ),
  },
  {
    id: "promise-onion",
    title: "三层 Promise 剥到底",
    d: "medium",
    tags: ["infer", "递归"],
    task: (
      <p>
        本章的 <code>Unbox</code> 只能剥一层:喂它{" "}
        <code>Promise&lt;Promise&lt;Promise&lt;string&gt;&gt;&gt;</code>,
        出来的还裹着两层壳。请把它升级成 <code>DeepUnbox&lt;T&gt;</code>:
        不管几层,一路剥到 <code>string</code>。提示:类型别名可以引用自己。
      </p>
    ),
    hint: (
      <>
        拆一层之后,拿到的 U 可能还是 Promise —— 那就别急着交货,把 U
        再交给 <code>DeepUnbox</code> 自己处理:
        <code>? DeepUnbox&lt;U&gt; : T</code>。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="deep-unbox.ts · 参考答案"
          code={`type Unbox<T> = T extends Promise<infer U> ? U : T;
type DeepUnbox<T> = T extends Promise<infer U> ? DeepUnbox<U> : T;

type Onion = Promise<Promise<Promise<string>>>;

type One = Unbox<Onion>;      // Promise<Promise<string>> —— 才剥一层
type Deep = DeepUnbox<Onion>; // string —— 递归剥到底`}
          hl={[2]}
        />
        <p>
          第 2 行就是「类型世界的递归」:真分支里再调用自己,
          直到 T 不再是 Promise 为止。恭喜 —— 你刚刚手写了内置{" "}
          <code>Awaited</code> 的核心思路(官方版还处理了 thenable
          等边角,骨架一样)。
        </p>
      </>
    ),
  },
  {
    id: "my-omit",
    title: "造一把官方没给严格版的 Omit",
    d: "hard",
    tags: ["Pick", "Exclude", "组合", "映射类型"],
    task: (
      <p>
        终极任务,两步走:① 只用 <code>Pick</code> 和 <code>Exclude</code>{" "}
        拼出 <code>MyOmit&lt;T, K&gt;</code>,对 <code>Order</code>{" "}
        验证和官方 <code>Omit</code> 行为一致;② 把 K 的约束改成{" "}
        <code>K extends keyof T</code>,造出<b>严格版</b>{" "}
        <code>StrictOmit</code> —— 键拼错必须当场报错,补上 06
        章那个哑巴亏的漏洞。
      </p>
    ),
    hint: (
      <>
        换个角度想:「删掉 K」=「留下除 K 以外的键」——
        先用 <code>Exclude&lt;keyof T, K&gt;</code> 算出要留的钥匙串,
        再交给 Pick。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="my-omit.ts · 参考答案"
          code={`// ① 官方思路:Omit = Pick + Exclude
type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

type P1 = MyOmit<Order, "internalNote">; // 和官方 Omit 一模一样
type P2 = MyOmit<Order, "internalNotes">; // 拼错照样不报 —— 官方行为

// ② 严格版:把约束收紧到「必须是 T 真实的键」
type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type S1 = StrictOmit<Order, "internalNote">;  // ✓
type S2 = StrictOmit<Order, "internalNotes">;
// ❌ 类型 '"internalNotes"' 不满足约束 keyof Order —— 拼错当场抓`}
          hl={[2, 8]}
        />
        <p>
          第 2 行几乎就是 lib.es5.d.ts 里的原文(官方约束是{" "}
          <code>keyof any</code>,所以才宽松);第 8 行只改了约束,
          哑巴亏就变成了编译错误。<b>官方改锥不合手,磨一把自己的</b> ——
          这就是这两章要给你的能力。
        </p>
      </>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: (
      <>
        <code>keyof Order</code>(Order 有 id、drink、size 等六个字段)
        的结果是什么?
      </>
    ),
    opts: [
      <>
        字符串数组:<code>[&quot;id&quot;, &quot;drink&quot;, …]</code>
      </>,
      <>
        键名的字面量联合:
        <code>&quot;id&quot; | &quot;drink&quot; | &quot;size&quot; | …</code>
      </>,
      <>
        <code>string</code> —— 键反正都是字符串
      </>,
      <>所有字段值类型的联合</>,
    ],
    correct: 1,
    wrong: [
      <>
        数组是值世界的产物(<code>Object.keys</code> 给的才是数组)——
        keyof 活在类型世界,产出的是类型:字面量联合。
      </>,
      undefined,
      <>
        比 string 精确得多:六个具体的名字,一个都不多 ——
        所以 <code>const k: keyof Order = &quot;cup&quot;</code> 会被抓。
      </>,
      <>
        那是 <code>Order[keyof Order]</code>(先摘钥匙再开锁)——
        keyof 自己只管钥匙,不管锁里的东西。
      </>,
    ],
    why: (
      <>
        <code>keyof</code> 是类型世界的 Object.keys:把所有键名摘成一个
        <b>字面量联合</b>,每个成员都是一把真实存在的钥匙。
      </>
    ),
  },
  {
    type: "choice",
    q: <>下面四个 typeof,哪个是「类型世界」的?</>,
    opts: [
      <>
        <code>if (typeof x === &quot;string&quot;) {"{ … }"}</code>
      </>,
      <>
        <code>type M = typeof menu;</code>
      </>,
      <>
        <code>console.log(typeof menu);</code>
      </>,
      <>
        <code>const t = typeof menu;</code>
      </>,
    ],
    correct: 1,
    wrong: [
      <>
        这是 03 章的收窄守卫 —— 运行时执行、比较字符串,标准的值世界 typeof。
      </>,
      undefined,
      <>
        console.log 是运行时的事,这个 typeof 会真的执行,吐出{" "}
        <code>&quot;object&quot;</code>。
      </>,
      <>
        <code>const t =</code> 后面是表达式位置 —— 值世界。t 的值是字符串{" "}
        <code>&quot;object&quot;</code>,不是类型。
      </>,
    ],
    why: (
      <>
        判断口诀:看位置。<code>type</code> 等号右边、注解冒号后面是类型位置,
        那里的 typeof 是 TS 的(编译后蒸发);其余都是 JS 的运行时 typeof。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>const t = [&quot;珍珠&quot;, &quot;椰果&quot;] as const;</code>{" "}
        之后,<code>(typeof t)[number]</code> 是什么?
      </>
    ),
    opts: [
      <>
        <code>number</code>
      </>,
      <>
        <code>&quot;珍珠&quot; | &quot;椰果&quot;</code>
      </>,
      <>
        <code>string[]</code>
      </>,
      <>报错:数组不能用 number 索引</>,
    ],
    correct: 1,
    wrong: [
      <>
        number 是钥匙,不是开出来的货 —— <code>T[number]</code>{" "}
        问的是「用数字下标取出来的东西是什么类型」。
      </>,
      undefined,
      <>
        那是 typeof t 本身的近亲(不带 as const 时是 string[])——
        再用 [number] 取一次下标,拿到的是<b>元素</b>类型。
      </>,
      <>
        完全合法 —— 数组天生用 number 索引,<code>T[number]</code>{" "}
        正是取元素类型的标准姿势。
      </>,
    ],
    why: (
      <>
        <code>as const</code> 把数组冻成字面量元组,<code>T[number]</code>{" "}
        取出全部元素类型的联合:<code>&quot;珍珠&quot; | &quot;椰果&quot;</code>{" "}
        —— 一份数据,两个世界同步。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>Exclude&lt;&quot;a&quot; | &quot;b&quot; | &quot;c&quot;,
        &quot;b&quot;&gt;</code> 是怎么算出来的?
      </>
    ),
    opts: [
      <>
        整体判断:<code>&quot;a&quot; | &quot;b&quot; | &quot;c&quot;</code>{" "}
        塞不进 <code>&quot;b&quot;</code>,所以三个全保留
      </>,
      <>
        逐个分发:a、c 判否保留,b 判是变 never;合并时 never 消失,得{" "}
        <code>&quot;a&quot; | &quot;c&quot;</code>
      </>,
      <>
        返回 <code>&quot;b&quot;</code> —— 匹配上的那个
      </>,
      <>
        返回 <code>never</code> —— 有成员匹配就整体作废
      </>,
    ],
    correct: 1,
    wrong: [
      <>
        如果整体判断,Exclude 就永远删不掉任何东西了 —— 裸类型参数遇到联合
        <b>不做</b>整体判断,这正是分发存在的意义。
      </>,
      undefined,
      <>
        方向反了:匹配上的走 never(丢弃),留下的是<b>没</b>匹配上的 ——
        「挑出匹配的」是 Extract 的活。
      </>,
      <>
        never 只吃掉匹配的那一个成员,不连坐 ——
        它是空集,合并时安静消失,别人不受影响。
      </>,
    ],
    why: (
      <>
        分布式条件类型:拆开 → 逐个过闸 → 合并。<code>&quot;b&quot;</code>{" "}
        判成 never 进垃圾桶,剩下 <code>&quot;a&quot; | &quot;c&quot;</code>。
        §04 的分发机演的就是它。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>
          type W&lt;T&gt; = [T] extends [string] ? &quot;纯&quot; :
          &quot;杂&quot;;
        </code>{" "}
        那么 <code>W&lt;&quot;a&quot; | 1&gt;</code> 是?
      </>
    ),
    opts: [
      <>
        <code>&quot;纯&quot; | &quot;杂&quot;</code>
      </>,
      <>
        <code>&quot;杂&quot;</code>
      </>,
      <>
        <code>&quot;纯&quot;</code>
      </>,
      <>报错:元组不能放进 extends</>,
    ],
    correct: 1,
    wrong: [
      <>
        联合结果说明发生了分发 —— 但 T 被 <code>[ ]</code> 包住,
        不是裸类型参数,分发不会发生。
      </>,
      undefined,
      <>
        <code>&quot;a&quot; | 1</code> 里混了个数字,整体塞不进 string ——
        整体判断走的是假分支。
      </>,
      <>
        完全合法 —— 拿元组包一层再比,正是官方推荐的「关闭分发」写法。
      </>,
    ],
    why: (
      <>
        <code>[T]</code> 包一层,T 不再是裸类型参数 → 不分发 → 整体判断:
        <code>[&quot;a&quot; | 1]</code> 塞不进 <code>[string]</code>,得{" "}
        <code>&quot;杂&quot;</code>。这是特性,不是 bug。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>infer</code> 关键字的作用是?
      </>
    ),
    opts: [
      <>让 TypeScript 跳过这一段的类型检查</>,
      <>
        在 extends 的模式里挖一个「洞」,匹配成功时把洞里的类型起名拿出来用
      </>,
      <>推断变量在运行时的实际值</>,
      <>声明一个新的泛型参数,由调用方手动传入</>,
    ],
    correct: 1,
    wrong: [
      <>
        「跳过检查」是 any 的恶名 —— infer 恰恰相反,
        它是精确地从结构里<b>取</b>类型,一点不含糊。
      </>,
      undefined,
      <>
        类型世界够不到运行时 —— infer 挖的是类型结构里的一块,
        代码一行都不会执行。
      </>,
      <>
        泛型参数写在尖括号里、由调用方填;infer 只能出现在 extends
        的模式里,名字是 TypeScript <b>匹配时自动填</b>的,不用你传。
      </>,
    ],
    why: (
      <>
        <code>T extends Promise&lt;infer U&gt; ? U : T</code> 读作:
        「长得像 Promise?把里面那块记作 U,交出来」——
        类型世界的解构赋值。
      </>
    ),
  },
  {
    type: "fill",
    q: (
      <>
        映射类型里,把「可选」修饰符<b>拧下来</b>(让所有字段变必填)
        要在 <code>?</code> 前面写的符号是____。
      </>
    ),
    placeholder: "输入符号…",
    answers: ["-", "-?", "−", "−?"],
    hint: (
      <>
        修饰符能加也能减:加号(可省略)拧上,另一个符号拧下 ——
        手写版 Required 用的就是它。
      </>
    ),
    why: (
      <>
        <code>{"{ [K in keyof T]-?: T[K] }"}</code> —— 减号把 <code>?</code>{" "}
        拧下来,这就是 Required 的实现;同理 <code>-readonly</code> 拆锁。
      </>
    ),
  },
  {
    type: "multi",
    q: (
      <>
        手写版{" "}
        <code>
          MyPick&lt;T, K extends keyof T&gt; = {"{ [P in K]: T[P] }"}
        </code>{" "}
        用到了哪些零件?(多选)
      </>
    ),
    opts: [
      <>映射类型(逐键循环)</>,
      <>条件类型(extends ? :)</>,
      <>泛型约束(K extends keyof T)</>,
      <>索引访问(T[P])</>,
      <>infer</>,
      <>模板字面量类型</>,
    ],
    correct: [0, 2, 3],
    missHint: (
      <>
        还漏了 —— 把那行代码从左读到右,逐段对号:方括号循环是什么?
        尖括号里的 extends 是什么?冒号右边的 T[P] 又是什么?
      </>
    ),
    extraHint: (
      <>
        多勾了:这行里的 extends 出现在<b>尖括号里</b>,那是 05 章的泛型约束,
        不是「? :」三元 —— 条件类型、infer、模板字面量,Pick 一个都没用上。
      </>
    ),
    why: (
      <>
        三个零件:映射类型循环 K、泛型约束保证键真实存在(Pick
        严格的根源)、索引访问抄值类型 —— 没有条件类型,也没有 infer。
      </>
    ),
  },
];
