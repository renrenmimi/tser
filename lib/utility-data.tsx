"use client";

// 第 06 章 · 内置工具类型 —— 动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "checkout-dto",
    title: "用组合改锥造「结账页 DTO」",
    d: "medium",
    tags: ["Playground", "组合", "Pick", "Omit"],
    task: (
      <p>
        打开 TypeScript Playground(typescriptlang.org/play),贴入本章开头的{" "}
        <code>Order</code> 定义,然后<b>只用内置工具类型</b>造出三个变体:
        ① <code>DraftOrder</code>(全部字段可选);②{" "}
        <code>PublicOrder</code>(没有 <code>internalNote</code>,且全部只读);
        ③ <code>CheckoutPatch</code>(只有 <code>size</code> 和{" "}
        <code>toppings</code>,且都可选)。最后各造一个变量验证:给{" "}
        <code>PublicOrder</code> 的变量写 <code>internalNote</code>{" "}
        字段,必须报错。
      </p>
    ),
    hint: (
      <>
        ②和③都要套两把改锥 —— 从里往外想:先决定「有哪些字段」(Pick/Omit),
        再决定「什么待遇」(Partial/Readonly)。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="checkout.ts · 参考答案"
          code={`type Size = "small" | "medium" | "large";
type Sugar = 0 | 30 | 50 | 70 | 100;

interface Order {
  id: string;
  drink: string;
  size: Size;
  sugar: Sugar;
  toppings: string[];
  internalNote: string;
}

type DraftOrder = Partial<Order>;
type PublicOrder = Readonly<Omit<Order, "internalNote">>;
type CheckoutPatch = Partial<Pick<Order, "size" | "toppings">>;

const patch: CheckoutPatch = { size: "large" }; // ✓ 另一项不填也行

const pub: PublicOrder = {
  id: "A-1", drink: "茉莉奶绿", size: "small",
  sugar: 50, toppings: [],
  internalNote: "少冰", // ❌ 对象字面量只能指定已知属性
};

// pub.size = "large";  // ❌ 只读属性,赋值被拦`}
          hl={[13, 14, 15]}
        />
        <p>
          三行高亮就是全部答案 —— 六个字段一遍没抄。以后 Order 加字段,
          这三个变体<b>自动跟着变</b>,这才是工具类型省下的真正成本。
        </p>
      </>
    ),
  },
  {
    id: "omit-typo",
    title: "亲手吃一次 Omit 的哑巴亏",
    d: "easy",
    tags: ["Omit", "Pick", "排错"],
    task: (
      <p>
        还是 Playground 里的 <code>Order</code>。故意把键拼错:先写{" "}
        <code>Omit&lt;Order, &quot;internalNotes&quot;&gt;</code>
        (多一个 s),再写 <code>Pick&lt;Order, &quot;internalNotes&quot;&gt;</code>。
        观察两者谁报错、谁装聋;然后把鼠标悬停在 Omit
        那个类型别名上,看看它到底「删」掉了什么。
      </p>
    ),
    hint: (
      <>
        悬停是 Playground 最好用的功能:类型别名展开后一个字段一个字段数,
        少了谁、没少谁,一目了然。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="typo.ts · 现场对比"
          code={`type Oops = Omit<Order, "internalNotes">;
// 不报错!悬停看展开:六个字段一个不少 —— 拼错 = 没删

type Safe = Pick<Order, "internalNotes">;
// ❌ 类型 '"internalNotes"' 不满足约束 keyof Order
//    Pick 的键被约束在 Order 的真实键名单里,拼错当场抓`}
          hl={[1, 4]}
        />
        <p>
          结论背下来:<b>Pick 严格,Omit 宽松</b>。对外抹敏感字段这种
          「漏了会出事」的场合,要么用 Pick 白名单,要么下一章自己造严格版
          Omit —— 你很快就有这个能力了。
        </p>
      </>
    ),
  },
  {
    id: "record-stock",
    title: "给每个杯型记库存",
    d: "easy",
    tags: ["Record", "索引签名"],
    task: (
      <p>
        用 <code>Record&lt;Size, number&gt;</code> 给三个杯型建一张库存表,
        然后故意删掉 <code>large</code> 这一项,看报错;再声明一个{" "}
        <code>{"{ [k: string]: number }"}</code> 索引签名版本,同样只写两项,
        对比它为什么不报错。
      </p>
    ),
    hint: (
      <>
        两者的差别就在「键是不是有限名单」:Size 是三个成员的联合,Record
        会点名;string 是无限集合,没法点名。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="stock.ts · 参考答案"
          code={`type Size = "small" | "medium" | "large";
type CupStock = Record<Size, number>;

const stock: CupStock = { small: 40, medium: 25 };
// ❌ 类型缺少属性 "large" —— Record 按名单点名,缺谁报谁

const loose: { [k: string]: number } = { small: 40 };
// ✓ 不报错 —— string 键是无限集合,索引签名不数数`}
          hl={[4, 7]}
        />
        <p>
          经验法则:<b>键是有限的几个名字,用 Record + 字面量联合</b>;
          键真的不确定(用户输入、动态字典),再退回索引签名或{" "}
          <code>Record&lt;string, V&gt;</code>。
        </p>
      </>
    ),
  },
  {
    id: "awaited-peel",
    title: "Awaited 剥洋葱",
    d: "medium",
    tags: ["Awaited", "ReturnType", "Promise"],
    task: (
      <p>
        在 Playground 里:① 造一个三层洋葱{" "}
        <code>Promise&lt;Promise&lt;Promise&lt;string&gt;&gt;&gt;</code>,用{" "}
        <code>Awaited</code> 拆,悬停验证结果;② 用 <code>declare</code>{" "}
        声明一个返回 <code>Promise&lt;Order&gt;</code> 的{" "}
        <code>fetchOrder</code> 函数,组合 <code>Awaited</code> 和{" "}
        <code>ReturnType</code> 拿到 <code>Order</code>。
      </p>
    ),
    hint: (
      <>
        第②步要套三层:最里面 <code>typeof</code> 取函数类型,中间{" "}
        <code>ReturnType</code> 取返回值,最外面 <code>Awaited</code> 拆壳。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="awaited.ts · 参考答案"
          code={`type Onion = Promise<Promise<Promise<string>>>;
type Core = Awaited<Onion>;
// string —— 悬停确认:三层壳一次剥完,和 await 行为一致

declare function fetchOrder(id: string): Promise<Order>;

type Fetched = Awaited<ReturnType<typeof fetchOrder>>;
// Order —— 从里往外:typeof 取类型 → ReturnType 取返回值 → Awaited 拆壳`}
          hl={[2, 7]}
        />
        <p>
          第 7 行这个三连套,真实项目里出镜率极高 ——
          很多库只导出函数不导出类型,这一行就是你「偷」类型的标准姿势。
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
        <code>type DraftOrder = Partial&lt;Order&gt;</code> 这一行,
        到底干了什么?
      </>
    ),
    opts: [
      <>
        造一个新类型:Order 的每个字段拧上 <code>?</code> 变可选;Order
        本身原封不动
      </>,
      <>把 Order 改成可选 —— 之后所有用到 Order 的地方都跟着变</>,
      <>删掉 Order 里的必填字段,只留下可选的</>,
      <>生成运行时代码,少填字段时自动补默认值</>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        工具类型是纯函数:<b>产新,不改旧</b>。Order 一根毫毛都不会变,
        变的是新造出来的 DraftOrder。
      </>,
      <>
        Partial 不删任何字段 —— 六个字段全都在,只是每个都多了个{" "}
        <code>?</code>。「按名单删字段」是 Pick / Omit 的活。
      </>,
      <>
        类型在编译后全部擦除(序章讲过),不可能生成任何运行时行为 ——
        默认值还得你自己写。
      </>,
    ],
    why: (
      <>
        <code>Partial</code> = 给每个字段拧上 <code>?</code>{" "}
        的改锥,输入输出都是类型,原类型不动 —— 记住「产新不改旧」。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>Omit&lt;Order, &quot;internalNotes&quot;&gt;</code>
        (注意,键名拼错了,多了个 s)会发生什么?
      </>
    ),
    opts: [
      <>编译报错,提示 Order 上没有这个键</>,
      <>
        不报错 —— 新类型和 Order 一模一样,拼错等于什么都没删
      </>,
      <>
        不报错,但新类型是 <code>never</code>
      </>,
      <>报一条警告,但编译能通过</>,
    ],
    correct: 1,
    wrong: [
      <>
        那是 <code>Pick</code> 的待遇:它的键被约束成{" "}
        <code>K extends keyof T</code>。Omit 的键约束宽得多,拼错照单全收。
      </>,
      undefined,
      <>
        Omit 作用在对象上,不会把整个类型变 never ——
        它只是按名单删字段,名单上没人对得上号,就一个都不删。
      </>,
      <>
        TypeScript 没有「警告」这一档:要么报错,要么放行 ——
        这里是干干净净的放行,危险恰恰在于此。
      </>,
    ],
    why: (
      <>
        Omit 的键只要求「长得像个键」,不要求真的在 T 上 ——
        拼错不报错,字段照漏不误。对外抹敏感字段,优先 Pick 白名单。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>const o: Readonly&lt;Order&gt; = …</code> 之后,
        下面哪一行会被编译器拦下?
      </>
    ),
    opts: [
      <>
        <code>o.toppings.push(&quot;珍珠&quot;)</code>
      </>,
      <>
        <code>o.size = &quot;large&quot;</code>
      </>,
      <>
        <code>console.log(o.size)</code>
      </>,
      <>以上三行全都会被拦</>,
    ],
    correct: 1,
    wrong: [
      <>
        不拦 —— Readonly 是<b>浅</b>的:锁拧在「字段赋值」上,数组自己的
        push 不归它管。想连数组都锁,得用 <code>readonly string[]</code>{" "}
        或下一章自己造 DeepReadonly。
      </>,
      undefined,
      <>
        读永远合法 —— readonly 只管「写」,不管「读」。
      </>,
      <>
        只有给字段重新赋值那行会被拦:读不受限,数组内部方法也不受限
        (浅只读)。
      </>,
    ],
    why: (
      <>
        <code>readonly</code> 拦的是「给字段重新赋值」。
        <code>o.size = …</code> 正中枪口;push 改的是数组内部,锁没拧到那一层。
      </>
    ),
  },
  {
    type: "multi",
    q: <>下面哪些工具类型,作用对象是联合类型(union)的成员?(多选)</>,
    opts: [
      <>Partial</>,
      <>Exclude</>,
      <>Pick</>,
      <>Extract</>,
      <>NonNullable</>,
      <>Readonly</>,
    ],
    correct: [1, 3, 4],
    missHint: (
      <>
        还有漏网的 —— 想想 <code>null | undefined</code>{" "}
        也是联合的成员,清走它们的那把改锥也算。
      </>
    ),
    extraHint: (
      <>
        有对象改锥混进来了:Partial / Pick / Readonly 拧的是<b>对象字段</b>,
        不是联合成员 —— 问自己:这个类型是「一张表」还是「一份名单」?
      </>
    ),
    why: (
      <>
        联合三把:<code>Exclude</code> 剔除、<code>Extract</code> 挑出、
        <code>NonNullable</code> 清 null/undefined ——
        它们逐个处理名单上的成员,下一章会看到这个「逐个」是怎么实现的。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>Record&lt;Size, number&gt;</code> 和{" "}
        <code>{"{ [k: string]: number }"}</code> 最大的区别是?
      </>
    ),
    opts: [
      <>没有本质区别,只是写法不同</>,
      <>
        Record 会检查键的完整性:small / medium / large 一个都不能少;
        索引签名不数数
      </>,
      <>Record 的值可以是任意类型,索引签名的值只能是原始类型</>,
      <>Record 是运行时的数据结构,索引签名是编译期的类型</>,
    ],
    correct: 1,
    wrong: [
      <>
        区别大了:少写一个杯型,Record 版当场报错,索引签名版一声不吭 ——
        亲手试过这个 Lab 的话你已经见过两种结局。
      </>,
      undefined,
      <>
        两者的值类型都随便写,对象、数组、函数都行 —— 差别在<b>键</b>:
        一边是有限名单,一边是无限集合。
      </>,
      <>
        两个都是纯类型,编译后全部擦除 —— 运行时的数据结构是那个对象字面量
        本身,跟用哪种类型写法无关。
      </>,
    ],
    why: (
      <>
        键是有限名单(字面量联合)时,<code>Record</code>{" "}
        会逐个点名,缺谁报谁 —— 这正是它比索引签名可靠的地方。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>ReturnType&lt;typeof makeOrder&gt;</code> 里的{" "}
        <code>typeof</code> 是在干什么?
      </>
    ),
    opts: [
      <>
        和 JS 运行时的 typeof 一样,返回 <code>&quot;function&quot;</code>{" "}
        这个字符串
      </>,
      <>
        把值 makeOrder 的类型「拍」进类型世界 —— 因为 ReturnType
        只吃类型,不吃值
      </>,
      <>检查 makeOrder 是不是函数,不是就报错</>,
      <>偷偷调用一次 makeOrder,看它实际返回了什么</>,
    ],
    correct: 1,
    wrong: [
      <>
        同名不同物:那是<b>运行时</b>的 typeof。这里的 typeof
        出现在类型位置,编译后直接蒸发,根本活不到运行时。
      </>,
      undefined,
      <>
        它不做检查,只做「取类型」这一件事 —— 类型对不对得上,
        是外面 ReturnType 的约束在管。
      </>,
      <>
        类型世界碰不到运行时:代码一行都不会执行。类型是算出来的,
        不是跑出来的。
      </>,
    ],
    why: (
      <>
        <code>makeOrder</code> 是值,<code>ReturnType</code>{" "}
        的参数得是类型 —— <code>typeof</code>{" "}
        就是从值取类型的桥。它和运行时 typeof 同名不同物,下一章细拆。
      </>
    ),
  },
  {
    type: "fill",
    q: (
      <>
        <code>Awaited&lt;Promise&lt;Promise&lt;number&gt;&gt;&gt;</code>{" "}
        的结果类型是____。
      </>
    ),
    placeholder: "输入一个类型名…",
    answers: ["number"],
    hint: (
      <>
        Awaited 是剥洋葱的:一层不够就再剥一层,直到没有 Promise 壳为止 ——
        和 <code>await</code> 的行为一致。
      </>
    ),
    why: (
      <>
        <code>Awaited</code> 递归拆壳,两层 Promise 全部剥掉,剩下{" "}
        <code>number</code>。「递归」这个词,下一章讲 infer 时再见。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>type T = Partial&lt;{"{ meta: { note: string } }"}&gt;</code>{" "}
        之后,哪个说法是对的?
      </>
    ),
    opts: [
      <>
        <code>meta</code> 和 <code>meta.note</code> 都变成了可选
      </>,
      <>
        只有最外层的 <code>meta</code> 变可选;里面的 <code>note</code>{" "}
        原样必填
      </>,
      <>
        只有 <code>note</code> 变可选,<code>meta</code> 不变
      </>,
      <>报错:Partial 不能用在嵌套对象上</>,
    ],
    correct: 1,
    wrong: [
      <>
        这是「深 Partial」的行为 —— 官方那把是<b>浅</b>的,
        锁匠只在一楼干活,二楼的字段它碰都不碰。
      </>,
      undefined,
      <>
        方向反了:Partial 拧的恰恰是最外层的键(meta),
        里层的 note 它够不着。
      </>,
      <>
        不报错 —— 嵌套对象完全合法,只是改造只发生在第一层。
      </>,
    ],
    why: (
      <>
        <code>Partial</code> 是浅的:只给第一层字段拧 <code>?</code>。
        想要深版本,下一章学完映射类型和条件类型,自己就能造。
      </>
    ),
  },
];
