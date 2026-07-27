"use client";

// 第 03 章 · 联合类型与收窄 —— 动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "common-members",
    title: "亲手撞一次「共有成员」规则",
    d: "easy",
    tags: ["Playground", "union", "typeof"],
    task: (
      <p>
        打开 TypeScript Playground(typescriptlang.org/play),写一个函数{" "}
        <code>{"function shout(id: string | number)"}</code>,函数体里直接{" "}
        <code>return id.toUpperCase()</code> —— 读一读报错,注意它说了
        <b>两层</b>原因。然后用 typeof 把它修好,修好后把光标分别悬停在
        if 里和 if 外的 id 上,看类型有什么不同。
      </p>
    ),
    hint: (
      <>
        报错第二行会点名到底是谁没有 toUpperCase。修的时候记住口诀:
        想用独门成员,先过安检。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="playground"
          code={`function shout(id: string | number) {
  // return id.toUpperCase();
  // ✕ Property 'toUpperCase' does not exist on type 'string | number'.
  //     Property 'toUpperCase' does not exist on type 'number'.
  //   两层意思:联合类型上没有它,因为其中的 number 没有它。

  if (typeof id === "string") {
    return id.toUpperCase(); // 悬停:id: string
  }
  return String(id).toUpperCase(); // 悬停:id: number
}`}
        />
        <p>
          悬停的变化就是收窄本身:同一个 id,if 里是 string、if 外(else
          语义)是 number —— 编译器逐行记账,这个「账本」你以后天天要看。
        </p>
      </>
    ),
  },
  {
    id: "tagged-order",
    title: "给奶茶店订单写一个可辨识联合",
    d: "medium",
    tags: ["Playground", "可辨识联合", "switch"],
    task: (
      <p>
        在 Playground 里定义三状态的 <code>Order</code>:pending(只有
        createdAt)、paid(多一个 paidAt)、delivered(再多一个
        deliveredAt),status 用<b>字面量类型</b>。然后写{" "}
        <code>{"function report(order: Order): string"}</code>,用 switch
        对 status 分支。写完在每个 case 里悬停 order,确认编译器在不同分支
        「看到」的形状不一样;再故意在 pending 分支访问{" "}
        <code>order.paidAt</code>,读报错。
      </p>
    ),
    hint: (
      <>
        status 必须写成 <code>&quot;pending&quot;</code> 这样的字面量,
        写成 string 整个魔法就失效了 —— 不信可以试试,顺便理解为什么。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="playground"
          code={`type Order =
  | { status: "pending"; createdAt: Date }
  | { status: "paid"; createdAt: Date; paidAt: Date }
  | { status: "delivered"; createdAt: Date; paidAt: Date; deliveredAt: Date };

function report(order: Order): string {
  switch (order.status) {
    case "pending":
      // order.paidAt ← ✕ Property 'paidAt' does not exist on
      //   type '{ status: "pending"; createdAt: Date; }'.
      return "制作中";
    case "paid":
      return "已付款:" + order.paidAt.toLocaleTimeString(); // ✓
    case "delivered":
      return "已送达:" + order.deliveredAt.toLocaleTimeString(); // ✓
  }
}`}
        />
        <p>
          把 status 的类型改成 string 再看:所有 case 里 order
          都不再收窄,paidAt 全部报错 —— 因为宽泛的 string
          没法区分成员,「申报单」必须是字面量。这就是三要素里第 ②
          条的意义。
        </p>
      </>
    ),
  },
  {
    id: "exhaustive-refund",
    title: "穷尽检查:上新状态,让编译器点名",
    d: "hard",
    tags: ["Playground", "never", "穷尽检查"],
    task: (
      <p>
        接着上一题:给 report 的 switch 补一个 default 分支,里面写{" "}
        <code>const _exhaustive: never = order;</code> —— 确认没有报错。
        然后给 Order 加第四个成员{" "}
        <code>{'{ status: "refunded"; refundedAt: Date }'}</code>,
        <b>不要动 report</b>,看编译器把错报在哪一行、说了什么。
        最后补上 case 让报错消失。
      </p>
    ),
    hint: (
      <>
        关键观察:报错不在你新加类型的那一行,而在 default 里 ——
        编译器是在说「有个漏网状态流到了不该有人的地方」。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="playground"
          code={`type Order =
  | { status: "pending"; createdAt: Date }
  | { status: "paid"; createdAt: Date; paidAt: Date }
  | { status: "delivered"; createdAt: Date; paidAt: Date; deliveredAt: Date }
  | { status: "refunded"; refundedAt: Date }; // ← 新状态

function report(order: Order): string {
  switch (order.status) {
    case "pending":   return "制作中";
    case "paid":      return "已付款";
    case "delivered": return "已送达";
    // 补上这行,报错消失:
    case "refunded":  return "已退款";
    default: {
      const _exhaustive: never = order;
      // 没补 case 时这里报:
      // Type '{ status: "refunded"; refundedAt: Date; }' is
      //   not assignable to type 'never'.
      return _exhaustive;
    }
  }
}`}
        />
        <p>
          体会一下这个工作流:改类型 → 编译器列出所有没跟上的 switch →
          逐个补齐 → 绿灯。真实项目里状态可能被二十处代码消费,
          这一招把「全局搜索 + 人肉排查」变成了照着报错清单干活。
        </p>
      </>
    ),
  },
  {
    id: "predicate-filter",
    title: "类型谓词 + TS 5.5 自动推断",
    d: "medium",
    tags: ["Playground", "is", "filter"],
    task: (
      <p>
        还是那个三状态 Order:① 先写{" "}
        <code>{"const paid = orders.filter((o) => o.status === \"paid\")"}</code>
        ,悬停 paid 看类型;② 写一个谓词函数{" "}
        <code>{"function isPaid(o: Order): o is Paid"}</code> 再 filter
        一次,对比结果;③ 把 Playground 右上角的 TS 版本切到 5.5
        以上,再看第 ① 步的类型有没有变化。
      </p>
    ),
    hint: (
      <>
        Playground 左上角 TS 版本可以随便切 —— 这道题的答案<b>随版本变</b>,
        亲眼看到差异是重点。Paid 类型可以单独抽出来再组进联合。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="playground"
          code={`type Pending = { status: "pending"; createdAt: Date };
type Paid = { status: "paid"; createdAt: Date; paidAt: Date };
type Order = Pending | Paid;

declare const orders: Order[];

// ① 内联箭头函数:
const a = orders.filter((o) => o.status === "paid");
// TS 5.4 及以前:a: Order[] —— filter 白干
// TS 5.5+     :a: Paid[]  —— 谓词被自动推断出来了

// ② 手写谓词,任何版本都收窄:
function isPaid(o: Order): o is Paid {
  return o.status === "paid";
}
const b = orders.filter(isPaid); // b: Paid[]`}
        />
        <p>
          结论:TS 5.5 起,「简单、单参数、逻辑直白」的过滤函数会自动获得谓词;
          复杂逻辑(多条件、跨变量)仍然要手写 <code>is</code>。
          手写就意味着担保 —— 谓词逻辑写反,编译器照信不误,这个责任在你。
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
        <code>{"function f(id: string | number) { id.toUpperCase(); }"}</code>{" "}
        报错的根本原因是?
      </>
    ),
    opts: [
      <>TS 不支持在函数里调用字符串方法</>,
      <>编译器按最坏情况想:id 可能是 number,而 number 没有 toUpperCase</>,
      <>联合类型上不能调用任何方法</>,
      <>toUpperCase 需要先 import 才能用</>,
    ],
    correct: 1,
    wrong: [
      <>
        支持得很 —— id 确定是 string 时随便调。问题不在方法本身,
        在「id 现在还不确定是 string」。
      </>,
      undefined,
      <>
        没那么惨:<b>共有成员</b>可以直接用,比如 toString(string 和
        number 都有)。禁的只是「有人没有」的成员。
      </>,
      <>
        字符串方法是语言内置的,和模块系统无关 ——
        报错里写的是 Property does not exist,不是找不到模块。
      </>,
    ],
    why: (
      <>
        联合类型 = 几种可能同时存在,编译器只敢用<b>所有成员共有</b>的部分。
        想用 string 的独门方法,先用 typeof 过一道安检,让「number
        的可能」被排除掉。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>typeof null</code> 的值是?
      </>
    ),
    opts: [
      <><code>&quot;null&quot;</code></>,
      <><code>&quot;object&quot;</code></>,
      <><code>&quot;undefined&quot;</code></>,
      <>直接抛出异常</>,
    ],
    correct: 1,
    wrong: [
      <>
        直觉如此,现实不是 —— JS 的 typeof 从来没有 &quot;null&quot;
        这个返回值,这正是它坑人的地方。
      </>,
      undefined,
      <>
        那是 <code>typeof undefined</code> 的结果 —— null 和 undefined
        是两个不同的值,typeof 的答复也不同。
      </>,
      <>
        typeof 是 JS 里最温顺的操作符,对任何东西都不抛错 ——
        连没声明的变量都能查。
      </>,
    ],
    why: (
      <>
        <code>typeof null === &quot;object&quot;</code>,1995
        年第一版 JS 的实现漏洞,为了兼容性永远不修了。
        所以「判断是不是对象」的完整姿势是:
        <code>x !== null &amp;&amp; typeof x === &quot;object&quot;</code>。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>count: number | undefined</code>,代码写{" "}
        <code>{"if (count) { A } else { B }"}</code>。当 count 是{" "}
        <b>0</b> 时,走哪个分支?
      </>
    ),
    opts: [
      <>A 分支 —— 0 是合法的 number</>,
      <>B 分支 —— 0 是 falsy,被真值检查连坐了</>,
      <>编译报错,不允许对 number 做真值检查</>,
      <>运行时抛出异常</>,
    ],
    correct: 1,
    wrong: [
      <>
        0 确实是合法的 number,但真值检查看的不是类型,是<b>真假</b> ——
        0 在 JS 里从来都是 falsy。
      </>,
      undefined,
      <>
        真值检查对任何类型都合法(这正是它危险的地方)——
        编译器不报错,坑就这么安静地埋下了。
      </>,
      <>
        <code>if (0)</code> 在运行时风平浪静地得到 false ——
        没有异常,只有走错的分支。
      </>,
    ],
    why: (
      <>
        真值检查一竿子排除所有 falsy:undefined、null、0、&quot;&quot;、NaN。
        「0 件」是数据,不是没填 —— 只想排除 undefined,写{" "}
        <code>count !== undefined</code>,别用 if (count) 偷懒。
      </>
    ),
  },
  {
    type: "choice",
    q: <>可辨识联合(discriminated union)的「申报单」字段,必须满足什么条件?</>,
    opts: [
      <>字段名必须叫 status</>,
      <>每个成员都有这个字段、类型是字面量、且各成员互不相同</>,
      <>字段类型必须是 string</>,
      <>必须写在每个成员的第一个位置</>,
    ],
    correct: 1,
    wrong: [
      <>
        叫 kind、type、tag 都行 —— 编译器认的是结构特征,
        不是字段的名字。
      </>,
      undefined,
      <>
        差一个字:是<b>字面量</b>,不是 string。宽泛的 string
        没法区分成员;而且数字字面量、布尔字面量也可以当申报单。
      </>,
      <>
        属性顺序在类型系统里完全无所谓 ——
        TS 看形状,不看排版。
      </>,
    ],
    why: (
      <>
        三要素:<b>公共字段</b> + <b>字面量类型</b> + <b>互不相同</b>。
        三样齐了,switch(order.status) 一比对,编译器就能把整个对象
        收窄到对应成员 —— 缺一样,魔法失效。
      </>
    ),
  },
  {
    type: "multi",
    q: (
      <>
        下面哪些写法是<b>真正的收窄</b> ——
        运行时有真实检查、编译器据此缩小类型?(多选)
      </>
    ),
    opts: [
      <><code>typeof x === &quot;string&quot;</code></>,
      <><code>&quot;steep&quot; in drink</code></>,
      <><code>x as string</code></>,
      <><code>order.status === &quot;paid&quot;</code></>,
      <><code>x!</code></>,
    ],
    correct: [0, 1, 3],
    missHint: (
      <>
        还漏了 —— 有一个选项是可辨识联合的日常写法,
        比对字面量也是真实发生的运行时检查。
      </>
    ),
    extraHint: (
      <>
        勾多了 —— 有的选项编译后<b>消失得无影无踪</b>,运行时什么都不查,
        那不是收窄,是让编译器闭嘴。
      </>
    ),
    why: (
      <>
        typeof、in、字面量比对:编译成 JS 后<b>真的会执行</b>,
        检查是真的,收窄才是安全的。<code>as</code> 断言和 <code>!</code>{" "}
        编译后蒸发,零运行时行为 —— 类型错了照样炸,而且没了编译器提醒。
      </>
    ),
  },
  {
    type: "fill",
    q: (
      <>
        穷尽检查:switch 的 default 里写{" "}
        <code>const _x: ____ = order;</code>,让「漏了分支」变成编译错误 ——
        空格里填哪个类型?
      </>
    ),
    placeholder: "一个类型关键字",
    answers: ["never"],
    hint: (
      <>
        它表示「空集」—— 所有可能都被前面的 case 拦走后,
        剩下的类型就是它。类型漏斗的最后一帧。
      </>
    ),
    why: (
      <>
        <code>never</code> 是空集:只有「不剩任何可能」的值才能赋给它。
        所有状态都被 case 处理掉时赋值成立;一旦上新状态,新成员流进
        default,赋值立刻报错 —— 编译器替你记住了所有 TODO。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>{"function isPaid(o: Order): o is Paid"}</code> ——
        这个 <code>o is Paid</code> 让编译器做什么?
      </>
    ),
    opts: [
      <>调用处返回 true 的分支里,把传入的实参收窄成 Paid</>,
      <>运行时把 o 转换成 Paid 对象</>,
      <>检查函数体逻辑是否真的验证了 Paid,不对就报错</>,
      <>只在函数内部生效,调用方看不到任何变化</>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        类型全部擦除,运行时什么转换都不会发生 ——
        谓词只影响编译器的「账本」,不碰值本身。
      </>,
      <>
        恰恰<b>不检查</b> —— 这是谓词最危险的一面:逻辑写错,
        编译器照信不误。担保责任在你。
      </>,
      <>
        方向反了:谓词就是写给<b>调用方</b>用的 ——
        if (isPaid(order)) 的分支里、filter 的结果里,收窄都发生在外面。
      </>,
    ],
    why: (
      <>
        <code>o is Paid</code> = 「我返回 true,就意味着 o 是
        Paid」。调用处 <code>if (isPaid(order))</code> 里 order
        自动变 Paid,<code>orders.filter(isPaid)</code> 直接得到{" "}
        <code>Paid[]</code> —— 把安检逻辑打包复用的标准姿势。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>m!.nickname</code> 里的 <code>!</code>(non-null 断言)
        实际做了什么?
      </>
    ),
    opts: [
      <>运行时检查 m 非空,是空就提前抛出友好错误</>,
      <>什么都不做 —— 只让编译器停止报警,运行时该炸还炸</>,
      <>m 是 null 时自动换成默认值</>,
      <>和 <code>m?.nickname</code> 完全等价</>,
    ],
    correct: 1,
    wrong: [
      <>
        那是某些别的语言的行为 —— TS 的 <code>!</code>{" "}
        编译后直接消失,一行检查代码都不会生成。
      </>,
      undefined,
      <>
        换默认值是 <code>??</code> 的活 —— <code>!</code>{" "}
        对值本身分毫不动,动的只是编译器的判断。
      </>,
      <>
        差远了:<code>?.</code> 编译成真实的运行时判空,是安全带;
        <code>!</code> 是把安全带拆了还捂住警报器。
      </>,
    ],
    why: (
      <>
        <code>!</code> 是纯编译期的「我拍胸脯」:让报错消失,不加任何保护。
        胸脯拍错了,运行时照样 TypeError —— 而且连编译器的提醒都没了。
        规矩:能用 <code>?.</code> 和 <code>??</code> 就不用它。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>const sugar = order.sugar || 50;</code> ——
        顾客点了 0% 糖(order.sugar 是 0),sugar 的值是?
      </>
    ),
    opts: [
      <>0 —— 顾客要多少是多少</>,
      <>50 —— 0 被 || 当成「没填」换掉了</>,
      <>undefined</>,
      <>编译报错,|| 不能用在 number 上</>,
    ],
    correct: 1,
    wrong: [
      <>
        美好的愿望 —— 但 <code>||</code> 看的是真值,0 是
        falsy,直接被替换。想要这个效果得用 <code>??</code>。
      </>,
      undefined,
      <>
        <code>||</code> 一定会给出两边之一 —— 左边 falsy 就给右边,
        所以结果是 50,不会是 undefined。
      </>,
      <>
        编译器不拦真值运算(这是合法 JS)——
        它拦不了的逻辑坑,才轮到你自己长记性。
      </>,
    ],
    why: (
      <>
        <code>||</code> 的判据是真值,0、&quot;&quot; 都会被误杀;
        <code>??</code> 只认 null/undefined。「无糖变半糖」这种事故,
        一个字符的差别 —— 兜底默认值,一律 <code>??</code>。
      </>
    ),
  },
];
