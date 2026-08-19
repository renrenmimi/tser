"use client";

// Chapter 03 · Unions and narrowing —
// unions → the funnel → the checks that narrow → where narrowing is lost →
// discriminated unions → never and exhaustiveness → predicates and assertions →
// ?. / ?? / !.

import "./chapter.css";

import {
  Hero,
  Section,
  Callout,
  KeyPoints,
  ChapterFooter,
} from "@/lib/kit";
import { CodeBlock, CodePair } from "@/lib/code";
import { LabSet } from "@/lib/labs";
import { Quiz } from "@/lib/quiz";
import { LABS, QUIZ } from "@/lib/narrowing-data";
import { T, type Loc } from "@/lib/i18n";
import {
  HeroGate,
  TypeFunnel,
  GuardsExplorer,
  OrderSwitchDemo,
} from "./viz";

/* ---------- §01 unions ---------- */

const S1_UNION: Loc<string> = {
  en: `type Size = "small" | "medium" | "large"; // literal union: one of three
let id: string | number;                  // either a string or a number

id = "A-042"; // ✓
id = 42;      // ✓
id = true;    // ✕ Type 'boolean' is not assignable to type 'string | number'.`,
  zh: `type Size = "small" | "medium" | "large"; // 字面量联合:三选一
let id: string | number;                  // 或字符串,或数字,两种都合法

id = "A-042"; // ✓
id = 42;      // ✓
id = true;    // ✕ Type 'boolean' is not assignable to type 'string | number'.`,
};

const S1_COMMON: Loc<string> = {
  en: `function printId(id: string | number) {
  id.toString();    // ✓ string has it, number has it too
  id.toUpperCase(); // ✕ Property 'toUpperCase' does not exist
                    //   on type 'string | number'.
                    //     Property 'toUpperCase' does not exist
                    //     on type 'number'.
}`,
  zh: `function printId(id: string | number) {
  id.toString();    // ✓ 共有成员:string 有,number 也有
  id.toUpperCase(); // ✕ Property 'toUpperCase' does not exist
                    //   on type 'string | number'.
                    //     Property 'toUpperCase' does not exist
                    //     on type 'number'.
}`,
};

const S1_FIXED: Loc<string> = {
  en: `function printId(id: string | number) {
  if (typeof id === "string") {
    return id.toUpperCase(); // inside this branch id is string
  }
  return id.toFixed(0);      // only number can reach this line
}`,
  zh: `function printId(id: string | number) {
  if (typeof id === "string") {
    return id.toUpperCase(); // 这个分支里 id 是 string
  }
  return id.toFixed(0);      // 能走到这一行的,只可能是 number
}`,
};

/* ---------- §04 where narrowing is lost ---------- */

const S4_CALLBACK: Loc<string> = {
  en: `declare function later(fn: () => void): void;

function schedule(x: string | number) {
  let value = x;

  if (typeof value === "string") {
    value.toUpperCase();   // ✓ here value is string

    later(() => {
      value.toUpperCase();
      // ✕ Property 'toUpperCase' does not exist on type 'string | number'.
      //     Property 'toUpperCase' does not exist on type 'number'.
    });
  }

  value = 42; // this assignment is why the callback cannot trust the check
}`,
  zh: `declare function later(fn: () => void): void;

function schedule(x: string | number) {
  let value = x;

  if (typeof value === "string") {
    value.toUpperCase();   // ✓ 这里 value 是 string

    later(() => {
      value.toUpperCase();
      // ✕ Property 'toUpperCase' does not exist on type 'string | number'.
      //     Property 'toUpperCase' does not exist on type 'number'.
    });
  }

  value = 42; // 正是这行赋值,让回调里不能再相信那次检查
}`,
};

const S4_PROP: Loc<string> = {
  en: `type Draft = { note?: string };

function save(d: Draft) {
  if (d.note) {
    d.note.trim();   // ✓ here d.note is string

    later(() => {
      d.note.trim(); // ✕ 'd.note' is possibly 'undefined'.
    });
  }
}`,
  zh: `type Draft = { note?: string };

function save(d: Draft) {
  if (d.note) {
    d.note.trim();   // ✓ 这里 d.note 是 string

    later(() => {
      d.note.trim(); // ✕ 'd.note' is possibly 'undefined'.
    });
  }
}`,
};

const S4_FIX: Loc<string> = {
  en: `function save(d: Draft) {
  const note = d.note;   // copy the value into a const
  if (note) {
    later(() => {
      note.trim();       // ✓ a const cannot change, so the check still holds
    });
  }
}`,
  zh: `function save(d: Draft) {
  const note = d.note;   // 先把值复制到一个 const 里
  if (note) {
    later(() => {
      note.trim();       // ✓ const 不会变,所以那次检查依然成立
    });
  }
}`,
};

/* ---------- §05 discriminated unions ---------- */

const S5_LOOSE: Loc<string> = {
  en: `// One wide type with optional fields. You have to remember the rules.
interface LooseOrder {
  status: string;     // any string; a typo still compiles
  paidAt?: Date;      // when is it present? the type does not say
  deliveredAt?: Date; // same problem
}

function report(o: LooseOrder) {
  if (o.status === "paid") {
    // paidAt is still Date | undefined here — the compiler
    // does not know that "paid" implies paidAt.
    return o.paidAt!.toLocaleTimeString(); // ! is the only way through
  }
}`,
  zh: `// 一个大类型 + 一堆可选属性,规则只存在于你的脑子里。
interface LooseOrder {
  status: string;     // 任意字符串,拼错也照样通过编译
  paidAt?: Date;      // 什么时候有?类型没说
  deliveredAt?: Date; // 同上
}

function report(o: LooseOrder) {
  if (o.status === "paid") {
    // 这里 paidAt 依然是 Date | undefined ——
    // 编译器不知道 "paid" 就意味着 paidAt 存在。
    return o.paidAt!.toLocaleTimeString(); // 只能靠 ! 硬闯
  }
}`,
};

const S5_TAGGED: Loc<string> = {
  en: `// One member per state. The status field is the tag.
type Order =
  | { status: "pending"; createdAt: Date }
  | { status: "paid"; createdAt: Date; paidAt: Date }
  | { status: "delivered"; createdAt: Date;
      paidAt: Date; deliveredAt: Date };

function report(order: Order) {
  if (order.status === "paid") {
    return order.paidAt.toLocaleTimeString(); // ✓ no !, paidAt is always there
  }
}`,
  zh: `// 每种状态一个成员,status 字段就是那张标签。
type Order =
  | { status: "pending"; createdAt: Date }
  | { status: "paid"; createdAt: Date; paidAt: Date }
  | { status: "delivered"; createdAt: Date;
      paidAt: Date; deliveredAt: Date };

function report(order: Order) {
  if (order.status === "paid") {
    return order.paidAt.toLocaleTimeString(); // ✓ 不用 !,paidAt 一定存在
  }
}`,
};

const S5_SWITCH: Loc<string> = {
  en: `function report(order: Order): string {
  switch (order.status) {
    case "pending":
      return "Preparing your order";
    case "paid":
      return "Paid at " + order.paidAt.toLocaleTimeString();
      //                        ^ in this branch the compiler knows paidAt exists
    case "delivered":
      return "Delivered at " + order.deliveredAt.toLocaleTimeString();
      //                             ^ here paidAt and deliveredAt both exist
  }
}`,
  zh: `function report(order: Order): string {
  switch (order.status) {
    case "pending":
      return "Preparing your order";
    case "paid":
      return "Paid at " + order.paidAt.toLocaleTimeString();
      //                        ^ 这个分支里,编译器知道 paidAt 存在
    case "delivered":
      return "Delivered at " + order.deliveredAt.toLocaleTimeString();
      //                             ^ 这里 paidAt 和 deliveredAt 都在
  }
}`,
};

/* ---------- §06 never and exhaustiveness ---------- */

const S6_EXHAUSTIVE: Loc<string> = {
  en: `function report(order: Order): string {
  switch (order.status) {
    case "pending":   return "Preparing";
    case "paid":      return "Paid";
    case "delivered": return "Delivered";
    default: {
      // All three states were handled above, so the type that is
      // left over here is the empty union: never.
      const _exhaustive: never = order;
      return _exhaustive;
    }
  }
}`,
  zh: `function report(order: Order): string {
  switch (order.status) {
    case "pending":   return "Preparing";
    case "paid":      return "Paid";
    case "delivered": return "Delivered";
    default: {
      // 三种状态都在上面处理掉了,所以走到这里
      // 剩下的类型是空联合,也就是 never。
      const _exhaustive: never = order;
      return _exhaustive;
    }
  }
}`,
};

const S6_NEW_STATUS: Loc<string> = {
  en: `type Order =
  | { status: "pending"; createdAt: Date }
  | { status: "paid"; createdAt: Date; paidAt: Date }
  | { status: "delivered"; createdAt: Date;
      paidAt: Date; deliveredAt: Date }
  | { status: "refunded"; refundedAt: Date }; // ← the new state

// The moment you save the file, the default branch of report reports:
// Type '{ status: "refunded"; refundedAt: Date; }' is
//   not assignable to type 'never'.
// In plain words: one state is not handled yet. Add the missing case.`,
  zh: `type Order =
  | { status: "pending"; createdAt: Date }
  | { status: "paid"; createdAt: Date; paidAt: Date }
  | { status: "delivered"; createdAt: Date;
      paidAt: Date; deliveredAt: Date }
  | { status: "refunded"; refundedAt: Date }; // ← 新增的状态

// 保存文件的一瞬间,report 的 default 分支就报错:
// Type '{ status: "refunded"; refundedAt: Date; }' is
//   not assignable to type 'never'.
// 说人话:还有一个状态没处理,去补上那个 case。`,
};

/* ---------- §07 predicates and assertions ---------- */

const S7_PREDICATE: Loc<string> = {
  en: `type Paid = { status: "paid"; createdAt: Date; paidAt: Date };

// The return type is not boolean but \`o is Paid\`. It means:
// "if I return true, the caller may treat o as Paid".
function isPaid(o: Order): o is Paid {
  return o.status === "paid";
}

declare const orders: Order[];
const paidOrders = orders.filter(isPaid);
// paidOrders: Paid[] — the element type follows the filter.
// With a plain \`boolean\` return type the result would stay Order[].`,
  zh: `type Paid = { status: "paid"; createdAt: Date; paidAt: Date };

// 返回类型不写 boolean,写 \`o is Paid\`,意思是:
// 「只要我返回 true,调用方就可以把 o 当作 Paid」。
function isPaid(o: Order): o is Paid {
  return o.status === "paid";
}

declare const orders: Order[];
const paidOrders = orders.filter(isPaid);
// paidOrders: Paid[] —— 元素类型跟着过滤走了。
// 如果返回类型只写 \`boolean\`,结果还是 Order[]。`,
};

const S7_ASSERT: Loc<string> = {
  en: `// An assertion function throws when the check fails.
// Everything after the call is narrowed.
function assertPaid(o: Order): asserts o is Paid {
  if (o.status !== "paid") throw new Error("order is not paid");
}

function receipt(o: Order) {
  assertPaid(o);
  return o.paidAt.toLocaleTimeString(); // o is Paid from here on
}

// If you store it in a variable, the variable needs a type annotation:
const check: (o: Order) => asserts o is Paid = assertPaid;
// Without that annotation the call site reports:
// ✕ Assertions require every name in the call target to be
//   declared with an explicit type annotation.`,
  zh: `// 断言函数在检查不通过时抛出异常。
// 调用之后的每一行,类型都已经收窄。
function assertPaid(o: Order): asserts o is Paid {
  if (o.status !== "paid") throw new Error("order is not paid");
}

function receipt(o: Order) {
  assertPaid(o);
  return o.paidAt.toLocaleTimeString(); // 从这一行起,o 是 Paid
}

// 如果把它存进变量,这个变量必须写出类型标注:
const check: (o: Order) => asserts o is Paid = assertPaid;
// 少了这句标注,调用处就会报:
// ✕ Assertions require every name in the call target to be
//   declared with an explicit type annotation.`,
};

const S7_AUTO: Loc<string> = {
  en: `const names = ["jasmine", undefined, "oolong"]
  .filter((n) => n !== undefined);

// Up to TS 5.4: names is (string | undefined)[] — the filter did not help.
// From TS 5.5:  names is string[].
//   For a short filter callback the compiler infers the predicate for you.`,
  zh: `const names = ["jasmine", undefined, "oolong"]
  .filter((n) => n !== undefined);

// TS 5.4 及以前:names 是 (string | undefined)[] —— filter 白过滤了。
// TS 5.5 起:  names 是 string[]。
//   对于简短的过滤回调,编译器会自己推断出类型谓词。`,
};

/* ---------- §08 ?. ?? ! ---------- */

const S8_TRIO: Loc<string> = {
  en: `interface Member {
  nickname?: string;
}

function greet(m: Member | null) {
  m.nickname;  // ✕ 'm' is possibly 'null'.

  const n1 = m?.nickname;
  // ?. stops as soon as m is null or undefined, and the whole
  //    expression becomes undefined.  n1: string | undefined

  const n2 = m?.nickname ?? "Guest";
  // ?? uses the right side only when the left side is null or
  //    undefined.  n2: string

  const n3 = m!.nickname;
  // !  claims "m is not null". Nothing is checked at runtime;
  //    the compiler just stops reporting.  n3: string | undefined
}`,
  zh: `interface Member {
  nickname?: string;
}

function greet(m: Member | null) {
  m.nickname;  // ✕ 'm' is possibly 'null'.

  const n1 = m?.nickname;
  // ?. 一旦 m 是 null 或 undefined 就停下,
  //    整个表达式的值变成 undefined。  n1: string | undefined

  const n2 = m?.nickname ?? "Guest";
  // ?? 只有左边是 null 或 undefined 时才用右边的值。
  //    n2: string

  const n3 = m!.nickname;
  // !  声明「m 不是 null」。运行时什么都不检查,
  //    只是让编译器不再报错。  n3: string | undefined
}`,
};

const S8_NULLISH: Loc<string> = {
  en: `declare const order: { sugar?: number };

const a = order.sugar ?? 50; // falls back only for null or undefined
const b = order.sugar || 50; // falls back for 0 and "" as well

// The customer asked for 0% sugar, so order.sugar is 0:
// a === 0   the customer's choice is kept
// b === 50  0 was treated as "not filled in"`,
  zh: `declare const order: { sugar?: number };

const a = order.sugar ?? 50; // 只有 null 或 undefined 才走兜底
const b = order.sugar || 50; // 0 和 "" 也会被兜底换掉

// 顾客点的是 0% 糖,也就是 order.sugar 为 0:
// a === 0   顾客的选择被保留
// b === 50  0 被当成了「没填」`,
};

export default function NarrowingPage() {
  return (
    <main className="page" data-ch="narrowing">
      <Hero
        ch="narrowing"
        title={{
          en: (
            <>
              Check it <span className="grad">first</span>, then use it
            </>
          ),
          zh: (
            <>
              先过<span className="grad">安检</span>,再拆包裹
            </>
          ),
        }}
        essence={{
          en: (
            <>
              A value that might be a string or a number is not the problem.
              Using it as a string without checking is. Every check you write
              removes one possibility, and the compiler follows along line by
              line.
            </>
          ),
          zh: (
            <>
              「可能是 A,也可能是 B」的值本身不可怕,不检查就当 A
              用才可怕。每写一道检查,可能性就少一种,编译器逐行跟着记账。
            </>
          ),
        }}
        chips={[
          { id: "union", n: "01", label: { en: "Unions", zh: "联合类型" } },
          {
            id: "funnel",
            n: "02",
            label: { en: "The funnel", zh: "类型漏斗" },
          },
          {
            id: "guards",
            n: "03",
            label: { en: "Checks that narrow", zh: "能收窄的检查" },
          },
          {
            id: "lost",
            n: "04",
            label: { en: "When it is lost", zh: "收窄会失效" },
          },
          {
            id: "du",
            n: "05",
            label: { en: "Discriminated unions", zh: "可辨识联合" },
          },
          {
            id: "never",
            n: "06",
            label: { en: "never and exhaustiveness", zh: "never 穷尽检查" },
          },
          {
            id: "predicate",
            n: "07",
            label: { en: "Predicates", zh: "类型谓词" },
          },
          { id: "nullish", n: "08", label: "?. ?? !" },
          { id: "labs", n: "09", label: { en: "Practice", zh: "动手" } },
          { id: "quiz", n: "10", label: { en: "Quiz", zh: "测验" } },
        ]}
      >
        <HeroGate />
      </Hero>

      {/* ================= §01 unions ================= */}
      <Section
        id="union"
        index="01"
        title={{
          en: "Unions: this value could be one of several types",
          zh: "联合类型:这个值,可能是几种类型之一",
        }}
        desc={{
          en: 'The vertical bar reads as "or". A value of type string | number is either a string or a number. First see how it is written, then see the problem it creates.',
          zh: "竖线 | 读作「或」:string | number 表示这个值或是字符串,或是数字。先看它怎么写,再看它带来的新问题。",
        }}
      >
        <CodeBlock lang="ts" title="union.ts" code={S1_UNION} />

        <p className="sec-desc">
          <T
            en={
              <>
                A union says what the value <i>might</i> be. It does not say
                what the value <i>is</i>. So the compiler has to assume the
                worst case, and it only allows the members that{" "}
                <b>every type in the union has</b>.
              </>
            }
            zh={
              <>
                联合类型说的是这个值<i>可能</i>是什么,不是它<i>就是</i>
                什么。所以编译器只能按最坏情况处理,只允许你使用
                <b>联合里每种类型都有</b>的成员。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title={{ en: "Only shared members", zh: "只能用共有成员" }}
          code={S1_COMMON}
          hl={[3]}
          note={
            <T
              en={
                <>
                  Read the error from the bottom up. The second line names the
                  member that is missing: <code>number</code> has no{" "}
                  <code>toUpperCase</code>. Because one member of the union
                  lacks it, the union as a whole lacks it. <code>toString</code>{" "}
                  is fine, because both types have it.
                </>
              }
              zh={
                <>
                  报错要从下往上读。第二行点名了到底是谁缺这个成员:
                  <code>number</code> 没有 <code>toUpperCase</code>
                  。只要联合里有一个成员没有它,整个联合就没有它。
                  <code>toString</code> 则可以用,因为两种类型都有。
                </>
              }
            />
          }
        />
        <p className="sec-desc">
          <T
            en={
              <>
                To use a member that only one type has, write a check first.
                The check tells the compiler which type you are on.
              </>
            }
            zh={
              <>
                想用某一种类型独有的成员,先写一道检查。
                这道检查会告诉编译器:这条路上只可能是它。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title={{ en: "After the check", zh: "过检之后" }}
          code={S1_FIXED}
          hl={[2]}
        />

        <Callout
          tone="idea"
          title={{
            en: '| means "or", not "and"',
            zh: "| 是「或」,不是「和」",
          }}
        >
          <p>
            <T
              en={
                <>
                  <code>string | number</code> means the value is a string{" "}
                  <b>or</b> a number, one of the two. It does not mean the value
                  has the abilities of both. That would be an intersection type,{" "}
                  <code>&amp;</code>, which chapter 02 covered. So adding more
                  members to a union makes it <i>less</i> usable without a
                  check: more members means fewer shared members.
                </>
              }
              zh={
                <>
                  <code>string | number</code> 表示这个值是 string{" "}
                  <b>或</b>是 number,二者取一,而不是「同时具备两者的能力」
                  —— 那是交叉类型 <code>&amp;</code>,02 章已经讲过。
                  所以联合的成员越多,不检查时能做的事<i>越少</i>:
                  成员越多,共有成员越少。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §02 the funnel ================= */}
      <Section
        id="funnel"
        index="02"
        title={{
          en: "Inside a branch, the type gets more specific",
          zh: "在分支里,类型会变得更具体",
        }}
        desc={{
          en: "When you write a condition, the compiler reads it and gives the variable a more specific type inside that branch than the type it was declared with. This animation plays the whole process once. Watch the list of possibilities shrink.",
          zh: "你写下一个条件,编译器会读懂它,并在那个分支里给变量一个比声明时更具体的类型。这段动画把整个过程放一遍,注意看可能性的清单是怎么一步步变短的。",
        }}
      >
        <TypeFunnel />
        <Callout
          tone="deep"
          title={{
            en: "This process has a name: narrowing",
            zh: "这个过程有个名字:收窄",
          }}
        >
          <p>
            <T
              en={
                <>
                  Making a type more specific inside a branch is called{" "}
                  <b>narrowing</b>. The compiler does it by walking through your
                  code in execution order and remembering, at each line, which
                  possibilities are still open. That walk is called{" "}
                  <b>control flow analysis</b>. The same variable can have a
                  different type on line 3 and on line 5. In your editor, hover
                  over the same variable on different lines and you will see the
                  type change.
                </>
              }
              zh={
                <>
                  在分支里把类型变得更具体,这件事叫<b>收窄(narrowing)</b>
                  。编译器的做法是:按执行顺序走一遍你的代码,
                  在每一行记住此刻还剩哪些可能。这趟遍历叫
                  <b>控制流分析(control flow analysis)</b>。
                  同一个变量,第 3 行和第 5
                  行的类型可以不一样。在编辑器里把光标悬停在不同行的同一个变量上,
                  就能看到类型在变。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 the checks that narrow ================= */}
      <Section
        id="guards"
        index="03"
        title={{
          en: "The checks that narrow",
          zh: "能收窄的几种检查",
        }}
        desc={{
          en: "Only some expressions narrow, and each one fits a different kind of union. Click through them to see the code, what the compiler concludes, and the mistake that goes with it.",
          zh: "只有一部分表达式能收窄,而且各自擅长不同形状的联合。逐个点开,看代码、看编译器得出的结论,以及各自对应的常见错误。",
        }}
      >
        <GuardsExplorer />

        <Callout
          tone="warn"
          title={{
            en: "Two mistakes worth memorising",
            zh: "两个值得背下来的错误",
          }}
        >
          <p>
            <T
              en={
                <>
                  <b>1. A truthiness check also removes 0 and the empty string.</b>{" "}
                  <code>if (count)</code> looks like it removes only{" "}
                  <code>undefined</code>, but <code>0</code> is falsy too, so it
                  goes to the else branch. Zero toppings is real data, not a
                  missing value. Write <code>count !== undefined</code> when
                  that is what you mean.
                </>
              }
              zh={
                <>
                  <b>1. 真值检查会连 0 和空字符串一起排除。</b>
                  <code>if (count)</code> 看起来只排除了{" "}
                  <code>undefined</code>,但 <code>0</code> 同样是 falsy,
                  也会走进 else 分支。「0 份配料」是真实数据,不是没填。
                  真正想表达的意思,就写 <code>count !== undefined</code>。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>2. typeof does not catch null.</b>{" "}
                  <code>typeof null</code> returns{" "}
                  <code>&quot;object&quot;</code>. So{" "}
                  <code>typeof x === &quot;object&quot;</code> is true for{" "}
                  <code>null</code> as well. Check <code>x !== null</code>{" "}
                  first.
                </>
              }
              zh={
                <>
                  <b>2. typeof 挡不住 null。</b>
                  <code>typeof null</code> 的结果是{" "}
                  <code>&quot;object&quot;</code>,所以{" "}
                  <code>typeof x === &quot;object&quot;</code> 对{" "}
                  <code>null</code> 也成立。判断对象之前,先写一句{" "}
                  <code>x !== null</code>。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §04 where narrowing is lost ================= */}
      <Section
        id="lost"
        index="04"
        title={{
          en: "Where narrowing is lost",
          zh: "收窄会在哪里失效",
        }}
        desc={{
          en: "Narrowing is not permanent. It holds along one path through the code, and there are places where the compiler has to give it up. These are the errors that confuse people the most, so it is worth seeing them now.",
          zh: "收窄不是永久的。它只在代码的一条路径上成立,而且有几个地方编译器不得不放弃它。这几种报错最容易让人困惑,值得现在就看清楚。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                A callback is the common case. The compiler cannot know{" "}
                <b>when</b> the callback will run. It may run after the variable
                has changed, so the check you wrote earlier no longer proves
                anything.
              </>
            }
            zh={
              <>
                最常见的是回调函数。编译器无法知道这个回调<b>什么时候</b>
                执行 —— 它可能在变量被改动之后才跑起来,
                那么你先前写的那道检查就不再能说明任何事。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title={{
            en: "A callback does not inherit the narrowing",
            zh: "回调里不会继承收窄结果",
          }}
          code={S4_CALLBACK}
          hl={[10, 16]}
          note={
            <T
              en={
                <>
                  Remove the last line and the error disappears: if{" "}
                  <code>value</code> is never reassigned anywhere in the
                  function, the compiler treats it as fixed and keeps the
                  narrowing inside the callback. The rule is about{" "}
                  <b>whether the variable can change</b>, not about callbacks as
                  such.
                </>
              }
              zh={
                <>
                  把最后一行删掉,报错就消失了:只要 <code>value</code>{" "}
                  在整个函数里从未被重新赋值,编译器就把它当作固定不变的,
                  回调里的收窄依然有效。这条规则真正看的是
                  <b>这个变量还会不会变</b>,而不是「是不是回调」。
                </>
              }
            />
          }
        />

        <p className="sec-desc">
          <T
            en={
              <>
                A narrowed <b>property</b> behaves the same way, and it is
                stricter: an object property can always be reassigned from
                elsewhere, so the compiler never carries property narrowing into
                a callback.
              </>
            }
            zh={
              <>
                被收窄的<b>属性</b>也一样,而且更严格:
                对象属性随时可能被别处改掉,所以编译器从不把属性的收窄结果带进回调。
              </>
            }
          />
        </p>
        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title={{
                en: "✕ Property narrowing does not cross into the callback",
                zh: "✕ 属性的收窄进不了回调",
              }}
              code={S4_PROP}
              hl={[8]}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title={{
                en: "✓ Copy the value into a const first",
                zh: "✓ 先把值复制到 const 里",
              }}
              code={S4_FIX}
              hl={[2, 5]}
              note={
                <T
                  en={
                    <>
                      This is the standard fix, and it is honest: you are
                      capturing the value you checked, instead of hoping the
                      property still holds it later.
                    </>
                  }
                  zh={
                    <>
                      这是标准做法,而且它是诚实的:
                      你捕获的就是当时检查过的那个值,
                      而不是期望那个属性稍后还装着同一个值。
                    </>
                  }
                />
              }
            />
          }
        />

        <Callout
          tone="warn"
          title={{
            en: "One place where the compiler trusts you too much",
            zh: "有一处,编译器信得过了头",
          }}
        >
          <p>
            <T
              en={
                <>
                  Inside the same function, a narrowed property survives an
                  ordinary function call. If you write{" "}
                  <code>if (d.note) &#123; clear(d); d.note.trim(); &#125;</code>
                  , the compiler reports nothing, even though{" "}
                  <code>clear</code> may have set <code>d.note</code> to{" "}
                  <code>undefined</code>. TypeScript accepts this gap on
                  purpose: tracking every possible mutation would reject far too
                  much correct code. It is one of the few places where a clean
                  compile does not mean the value is still there.
                </>
              }
              zh={
                <>
                  在同一个函数里,被收窄的属性能挺过一次普通的函数调用。
                  写成{" "}
                  <code>if (d.note) &#123; clear(d); d.note.trim(); &#125;</code>
                  ,编译器一声不吭 —— 哪怕 <code>clear</code> 可能已经把{" "}
                  <code>d.note</code> 改成了 <code>undefined</code>。
                  TypeScript 是有意留下这个缺口的:
                  如果要追踪每一次可能的修改,会有大量正确代码被误判。
                  这是少数几个「编译通过 ≠ 值还在」的地方。
                </>
              }
            />
          </p>
        </Callout>

        <Callout
          tone="idea"
          title={{
            en: "Three rules to remember",
            zh: "记住三条规则",
          }}
        >
          <p>
            <T
              en={
                <>
                  Assigning to a <code>let</code> resets its narrowing from that
                  line on. A callback keeps the narrowing of a variable only if
                  that variable is never reassigned. A narrowed property is
                  never kept inside a callback. When you hit any of the three,
                  the fix is almost always the same: copy the checked value into
                  a <code>const</code>.
                </>
              }
              zh={
                <>
                  给 <code>let</code> 赋值,会从那一行起清掉它的收窄结果。
                  回调里能否保留收窄,取决于那个变量有没有被重新赋值过。
                  属性的收窄则永远不会带进回调。
                  这三种情况的解法几乎都一样:把检查过的值复制进一个{" "}
                  <code>const</code>。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §05 discriminated unions ================= */}
      <Section
        id="du"
        index="05"
        title={{
          en: "Discriminated unions: one field decides the whole shape",
          zh: "可辨识联合:一个字段决定整个形状",
        }}
        desc={{
          en: "An order has three states, and each state carries different fields. How do you make the compiler know, inside each branch, which fields are present?",
          zh: "一张订单有三种状态,每种状态带的字段都不一样。怎么让编译器在每个分支里都知道有哪些字段?",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                Start with the version that does not work well. All the fields
                are packed into one type, and the rule connecting a status to
                its fields exists only in your head.
              </>
            }
            zh={
              <>
                先看不好用的那种写法。所有字段挤在一个类型里,
                「哪个状态有哪些字段」这条规则只存在于你的脑子里。
              </>
            }
          />
        </p>
        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title={{
                en: "✕ One wide type with optional fields",
                zh: "✕ 大而全 + 可选属性",
              }}
              code={S5_LOOSE}
              hl={[12]}
              note={
                <T
                  en={
                    <>
                      That <code>!</code> is where the type system stopped
                      helping. And because <code>status</code> is a plain{" "}
                      <code>string</code>, a typo like{" "}
                      <code>&quot;pald&quot;</code> compiles without a word.
                    </>
                  }
                  zh={
                    <>
                      那个 <code>!</code> 就是类型系统帮不上忙的地方。
                      而且 <code>status</code> 的类型是宽泛的{" "}
                      <code>string</code>,把它拼成{" "}
                      <code>&quot;pald&quot;</code> 也能通过编译。
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
                en: "✓ Discriminated union",
                zh: "✓ 可辨识联合",
              }}
              code={S5_TAGGED}
              hl={[3, 4, 5, 6]}
              note={
                <T
                  en={
                    <>
                      One member per state, and the type of{" "}
                      <code>status</code> is a <b>literal type</b> — the word{" "}
                      <code>&quot;paid&quot;</code> itself, not{" "}
                      <code>string</code>. Comparing that one field fixes the
                      shape of the whole object.
                    </>
                  }
                  zh={
                    <>
                      每种状态一个成员,而且 <code>status</code> 的类型是
                      <b>字面量类型</b> —— 就是{" "}
                      <code>&quot;paid&quot;</code> 这个词本身,而不是{" "}
                      <code>string</code>。
                      只要比对这一个字段,整个对象的形状就确定了。
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
                With <code>switch</code>, the compiler knows the exact shape of{" "}
                <code>order</code> inside every case.
              </>
            }
            zh={
              <>
                配上 <code>switch</code>,编译器在每个 case 里都知道{" "}
                <code>order</code> 的确切形状。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title={{ en: "Sorting by status", zh: "按 status 分拣" }}
          code={S5_SWITCH}
          hl={[6, 9]}
        />

        <OrderSwitchDemo />

        <Callout
          tone="idea"
          title={{
            en: "What makes a union discriminated",
            zh: "可辨识联合的三个条件",
          }}
        >
          <p>
            <T
              en={
                <>
                  Three conditions. First, every member has the{" "}
                  <b>same field</b> — the name can be <code>status</code>,{" "}
                  <code>kind</code>, <code>type</code>, anything. Second, that
                  field has a <b>literal type</b>, such as{" "}
                  <code>&quot;paid&quot;</code> or <code>1</code> or{" "}
                  <code>true</code>, not a wide type like <code>string</code>.
                  Third, the literals are <b>different in every member</b>. Meet
                  all three and one comparison narrows the whole object. This is
                  the normal way to write a state machine in TypeScript.
                </>
              }
              zh={
                <>
                  三个条件。第一,每个成员都有<b>同一个字段</b> —— 名字叫{" "}
                  <code>status</code>、<code>kind</code>、<code>type</code>{" "}
                  都行。第二,这个字段是<b>字面量类型</b>,比如{" "}
                  <code>&quot;paid&quot;</code>、<code>1</code>、
                  <code>true</code>,而不是 <code>string</code>{" "}
                  这样的宽泛类型。第三,各成员的字面量<b>互不相同</b>。
                  三条都满足,比对一次就能收窄整个对象。
                  这是 TypeScript 里写状态机的常规做法。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 never and exhaustiveness ================= */}
      <Section
        id="never"
        index="06"
        title={{
          en: "never and exhaustiveness checking",
          zh: "never 与穷尽检查",
        }}
        desc={{
          en: "never is the type with no possible values — the empty union. That sounds useless, and it turns into one of the most useful techniques in the language.",
          zh: "never 是「没有任何可能取值」的类型,也就是空联合。听上去没什么用,它却是这门语言里最实用的技巧之一。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                Follow the narrowing to its end. Each <code>case</code> removes
                one member from the union. After the last member is removed,
                nothing is left. The type of that nothing is <code>never</code>.
                And <code>never</code> accepts no value at all, so an assignment
                to a <code>never</code> variable only compiles when the compiler
                agrees that the line is unreachable.
              </>
            }
            zh={
              <>
                把收窄推到尽头。每个 <code>case</code>{" "}
                从联合里去掉一个成员,最后一个成员被去掉之后,就什么都不剩了。
                「什么都不剩」这个类型就是 <code>never</code>。而{" "}
                <code>never</code> 不接受任何值,所以只有当编译器认同这一行
                永远不会被执行到时,这个赋值才能通过。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title={{
            en: "Exhaustiveness check",
            zh: "穷尽检查(exhaustiveness check)",
          }}
          code={S6_EXHAUSTIVE}
          hl={[9]}
          note={
            <T
              en={
                <>
                  Read the assignment as a claim: &quot;by the time we reach{" "}
                  <code>default</code>, <code>order</code> has no possibilities
                  left.&quot; Right now the claim is true, so the code compiles
                  and nothing happens.
                </>
              }
              zh={
                <>
                  把这行赋值读成一句断言:「走到 <code>default</code> 时,
                  <code>order</code> 已经没有任何可能了。」
                  现在这句断言成立,所以代码编译通过,一切平静。
                </>
              }
            />
          }
        />
        <p className="sec-desc">
          <T
            en={
              <>
                The value shows up later. Three months on, the product needs
                refunds, so you add a fourth state to the type — and you do not
                touch the function.
              </>
            }
            zh={
              <>
                它的价值在后面。三个月后产品要支持退款,
                你给类型加了第四个状态 —— 而那个函数你根本没动。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title={{
            en: "The moment a state is added",
            zh: "新增状态的那一刻",
          }}
          code={S6_NEW_STATUS}
          hl={[6]}
        />
        <Callout
          tone="win"
          title={{
            en: "The compiler keeps the list of places to update",
            zh: "编译器替你记住了所有待办",
          }}
        >
          <p>
            <T
              en={
                <>
                  If twenty functions switch on <code>order.status</code>,
                  adding one state makes all twenty report an error and name
                  themselves. You work down the error list and cannot miss one.
                  Without the check, the new state would fall silently into{" "}
                  <code>default</code>, or into no branch at all, and the
                  function would return <code>undefined</code>.
                </>
              }
              zh={
                <>
                  如果项目里有二十个函数在 switch <code>order.status</code>,
                  加一个状态就会让这二十处同时报错、逐个点名。
                  你顺着报错清单改下去,不会漏掉任何一处。
                  没有这道检查,新状态会安静地落进 <code>default</code>,
                  或者根本没有分支接住它,函数返回 <code>undefined</code>。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="warn"
          title={{
            en: "Without the check there is no protection",
            zh: "不写这道检查,就没有保护",
          }}
        >
          <p>
            <T
              en={
                <>
                  The protection comes from the <code>never</code> assignment,
                  not from having a <code>default</code> branch. A{" "}
                  <code>default</code> that just returns{" "}
                  <code>&quot;unknown status&quot;</code> tells the compiler you
                  handled it, and the new state passes without a word.
                </>
              }
              zh={
                <>
                  保护来自那行 <code>never</code> 赋值,而不是「有 default
                  分支」。如果 <code>default</code> 里只是{" "}
                  <code>return &quot;unknown status&quot;</code>,
                  就等于告诉编译器你已经处理过了,新状态会一声不响地通过。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §07 predicates and assertions ================= */}
      <Section
        id="predicate"
        index="07"
        title={{
          en: "Type predicates and assertion functions",
          zh: "类型谓词与断言函数",
        }}
        desc={{
          en: "You can move a check into its own function, but a function that returns plain boolean does not narrow anything at the call site. You have to say what the true result means.",
          zh: "你可以把一段检查抽成函数,但返回 boolean 的普通函数在调用处不会产生任何收窄。你得说明「返回 true」意味着什么。",
        }}
      >
        <CodeBlock
          lang="ts"
          title="type-predicate.ts"
          code={S7_PREDICATE}
          hl={[5]}
        />
        <Callout
          tone="warn"
          title={{
            en: "The compiler does not check a predicate",
            zh: "编译器不会检查谓词的正确性",
          }}
        >
          <p>
            <T
              en={
                <>
                  <code>o is Paid</code> is a promise you make to the compiler,
                  and the compiler takes it without reading the function body.
                  Write <code>return o.status === &quot;pending&quot;</code> by
                  mistake and it is believed. From then on the types no longer
                  describe the program. This is one of the few ways to make
                  TypeScript wrong on purpose, so keep predicate bodies short
                  and obvious.
                </>
              }
              zh={
                <>
                  <code>o is Paid</code> 是你对编译器的承诺,
                  编译器不看函数体就接受它。
                  哪怕你不小心写成{" "}
                  <code>return o.status === &quot;pending&quot;</code>,
                  它照样相信。从此类型就不再描述这个程序了。
                  这是少数几个能让 TypeScript 判断错误的地方,
                  所以谓词的函数体要写得短、写得一目了然。
                </>
              }
            />
          </p>
        </Callout>

        <p className="sec-desc">
          <T
            en={
              <>
                A predicate narrows inside an <code>if</code>. An{" "}
                <b>assertion function</b> narrows everything after the call
                instead: it throws when the check fails, so if execution
                continues, the check passed.
              </>
            }
            zh={
              <>
                谓词是在 <code>if</code> 分支里收窄。<b>断言函数</b>
                则是让调用之后的每一行都收窄:检查不通过就抛异常,
                所以只要代码还在往下走,就说明检查通过了。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title={{
            en: "assert.ts · narrowing after the call",
            zh: "assert.ts · 调用之后的收窄",
          }}
          code={S7_ASSERT}
          hl={[3, 8, 13]}
          note={
            <T
              en={
                <>
                  The annotation rule is easy to hit by accident. A{" "}
                  <code>function</code> declaration is fine as written. If the
                  assertion is held in a variable, that variable needs an
                  explicit type, otherwise the call does not narrow and the
                  compiler reports it.
                </>
              }
              zh={
                <>
                  这条标注规则很容易在不经意间撞上。用 <code>function</code>{" "}
                  声明写出来就没问题;
                  但如果把断言函数放进变量里,这个变量必须写出显式类型,
                  否则调用它不会产生收窄,编译器还会直接报错。
                </>
              }
            />
          }
        />

        <p className="sec-desc">
          <T
            en={
              <>
                Since TypeScript 5.5 you often do not need to write the
                predicate yourself.
              </>
            }
            zh={<>从 TypeScript 5.5 起,很多时候你不必自己写谓词了。</>}
          />
        </p>
        <CodeBlock
          lang="ts"
          title={{
            en: "TS 5.5: predicates inferred from the body",
            zh: "TS 5.5:从函数体推断谓词",
          }}
          code={S7_AUTO}
          note={
            <T
              en={
                <>
                  The compiler infers a predicate only for a short callback with
                  one parameter that immediately returns a narrowing expression.
                  Anything longer still needs an explicit <code>is</code>, and
                  writing it explicitly means the promise is yours again.
                </>
              }
              zh={
                <>
                  只有「单参数、直接返回一个收窄表达式」的简短回调,
                  编译器才会推断出谓词。更复杂的逻辑仍然要手写{" "}
                  <code>is</code> —— 而手写就意味着,那句承诺又归你负责了。
                </>
              }
            />
          }
        />
      </Section>

      {/* ================= §08 ?. ?? ! ================= */}
      <Section
        id="nullish"
        index="08"
        title={{
          en: "Working with null and undefined: ?., ?? and !",
          zh: "处理 null 与 undefined:?.、?? 与 !",
        }}
        desc={{
          en: "Under strict mode, null and undefined are separate possibilities that have to be narrowed away. These three operators deal with them in three different ways: skip, substitute, and override.",
          zh: "在 strict 模式下,null 和 undefined 是必须单独收窄掉的两种可能。这三个操作符对应三种处理方式:跳过、替换、强行覆盖。",
        }}
      >
        <CodeBlock
          lang="ts"
          title={{ en: "All three side by side", zh: "三者对照" }}
          code={S8_TRIO}
          hl={[8, 12, 16]}
        />

        <p className="sec-desc">
          <T
            en={
              <>
                <code>??</code> has an older relative that looks similar,{" "}
                <code>||</code>. The difference is exactly the truthiness
                problem from §03.
              </>
            }
            zh={
              <>
                <code>??</code> 有一个长得很像的前辈 <code>||</code>,
                两者的区别正是 §03 里那个真值检查的问题。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title="?? vs ||"
          code={S8_NULLISH}
          hl={[3, 4]}
          note={
            <T
              en={
                <>
                  <code>||</code> tests truthiness, so <code>0</code>,{" "}
                  <code>&quot;&quot;</code> and <code>NaN</code> are replaced
                  too. <code>??</code> tests only for <code>null</code> and{" "}
                  <code>undefined</code>. For default values, use{" "}
                  <code>??</code>.
                </>
              }
              zh={
                <>
                  <code>||</code> 判断的是真值,所以 <code>0</code>、
                  <code>&quot;&quot;</code>、<code>NaN</code> 也会被替换掉;
                  <code>??</code> 只认 <code>null</code> 和{" "}
                  <code>undefined</code>。写默认值,用 <code>??</code>。
                </>
              }
            />
          }
        />

        <Callout
          tone="warn"
          title={{
            en: "! is not a fourth kind of check",
            zh: "! 不是第四种检查",
          }}
        >
          <p>
            <T
              en={
                <>
                  <code>?.</code> and <code>??</code> are real JavaScript
                  operators. They compile to real runtime checks. <code>!</code>{" "}
                  is a TypeScript annotation and disappears when the code is
                  compiled. It performs no check at all; it only stops the
                  compiler from reporting. If the value really is{" "}
                  <code>null</code> at runtime, you get the same{" "}
                  <code>TypeError</code> you would have got in JavaScript, and
                  now without the warning. Rule: if <code>?.</code> or{" "}
                  <code>??</code> can express what you mean, use them instead.
                </>
              }
              zh={
                <>
                  <code>?.</code> 和 <code>??</code> 是 JavaScript
                  的正式操作符,编译后是真实的运行时检查。而 <code>!</code>{" "}
                  是 TypeScript 的标注,编译后会消失。
                  它不做任何检查,只是让编译器不再报错。
                  运行时那个值如果真的是 <code>null</code>,你照样会拿到和
                  JavaScript 里一样的 <code>TypeError</code>,
                  而且这次连编译器的提醒都没有了。规矩:能用 <code>?.</code>{" "}
                  和 <code>??</code> 表达的,就不要用 <code>!</code>。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §09 practice ================= */}
      <Section
        id="labs"
        index="09"
        title={{ en: "Practice", zh: "动手任务" }}
        desc={{
          en: "You learn narrowing by watching the hover tooltip change from one line to the next. Five tasks, all of them fit in the TypeScript Playground.",
          zh: "学收窄,得亲眼看着悬停提示里的类型一行行变窄。五个任务,在 TypeScript Playground 里就能全部完成。",
        }}
      >
        <LabSet ch="narrowing" items={LABS} />
      </Section>

      {/* ================= §10 quiz ================= */}
      <Section
        id="quiz"
        index="10"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Ten questions, from the shared-member rule to the real cost of !. Get them all right and the sidebar marker turns green.",
          zh: "十道题,从共有成员规则一直问到 ! 的真实代价。全部答对,侧栏的标记会变绿。",
        }}
      >
        <Quiz ch="narrowing" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <T
            key="kp1"
            en={
              <>
                A union only lets you use the members that <b>every</b> type in
                it has, because the compiler assumes the worst case. To use the
                rest, narrow first.
              </>
            }
            zh={
              <>
                联合类型只允许你使用<b>每一种</b>成员类型都有的成员,
                因为编译器按最坏情况处理。想用其余的,先收窄。
              </>
            }
          />,
          <T
            key="kp2"
            en={
              <>
                Narrowing is <b>control flow analysis</b>: the compiler walks
                your code in order and gives a variable a more specific type
                inside each branch. <code>typeof</code>, truthiness, equality,{" "}
                <code>in</code>, <code>instanceof</code>,{" "}
                <code>Array.isArray</code> and a literal comparison all narrow.
              </>
            }
            zh={
              <>
                收窄的本质是<b>控制流分析</b>:编译器按顺序走一遍代码,
                在每个分支里给变量一个更具体的类型。<code>typeof</code>
                、真值检查、相等比较、<code>in</code>、
                <code>instanceof</code>、<code>Array.isArray</code>{" "}
                和字面量比对,都能收窄。
              </>
            }
          />,
          <T
            key="kp3"
            en={
              <>
                Two mistakes to remember: <code>if (x)</code> also removes{" "}
                <code>0</code> and <code>&quot;&quot;</code>, and{" "}
                <code>typeof null === &quot;object&quot;</code>.
              </>
            }
            zh={
              <>
                两个要记住的错误:<code>if (x)</code> 会连 <code>0</code> 和{" "}
                <code>&quot;&quot;</code> 一起排除;
                <code>typeof null === &quot;object&quot;</code>。
              </>
            }
          />,
          <T
            key="kp4"
            en={
              <>
                Narrowing is lost when a <code>let</code> is reassigned, and
                inside a callback for any variable that can be reassigned or any
                object property. Copy the checked value into a{" "}
                <code>const</code>.
              </>
            }
            zh={
              <>
                收窄会在这些地方失效:<code>let</code> 被重新赋值之后;
                回调内部,只要那个变量可能被重新赋值,或者它是对象属性。
                解法是把检查过的值复制进一个 <code>const</code>。
              </>
            }
          />,
          <T
            key="kp5"
            en={
              <>
                A discriminated union needs a shared field, a literal type, and
                a different literal in every member. Then one comparison narrows
                the whole object.
              </>
            }
            zh={
              <>
                可辨识联合需要:一个公共字段、字面量类型、各成员的字面量互不相同。
                三条齐了,比对一次就能收窄整个对象。
              </>
            }
          />,
          <T
            key="kp6"
            en={
              <>
                <code>const _x: never = order</code> in the{" "}
                <code>default</code> branch is an exhaustiveness check. Once
                every case is handled, the remaining type is the empty union, so
                the assignment compiles — and it stops compiling the moment a
                new member appears.
              </>
            }
            zh={
              <>
                在 <code>default</code> 分支里写{" "}
                <code>const _x: never = order</code> 就是穷尽检查。
                所有 case 都处理完时,剩下的类型是空联合,赋值成立;
                一旦联合里多出一个成员,这行立刻编译失败。
              </>
            }
          />,
          <T
            key="kp7"
            en={
              <>
                <code>o is Paid</code> packages a check for reuse, and{" "}
                <code>asserts o is Paid</code> narrows after the call. The
                compiler never verifies either body — that promise is yours.
              </>
            }
            zh={
              <>
                <code>o is Paid</code> 把一段检查打包复用,
                <code>asserts o is Paid</code> 则让调用之后的代码收窄。
                两者的函数体编译器都不验证 —— 那句承诺由你负责。
              </>
            }
          />,
          <T
            key="kp8"
            en={
              <>
                <code>?.</code> and <code>??</code> compile to real runtime
                checks. <code>!</code> compiles to nothing and checks nothing.
                Never use <code>||</code> for a default value that could
                legitimately be <code>0</code> or <code>&quot;&quot;</code>.
              </>
            }
            zh={
              <>
                <code>?.</code> 和 <code>??</code> 会编译成真实的运行时检查;
                <code>!</code> 编译后什么都不剩,也什么都不检查。
                当默认值有可能合法地取 <code>0</code> 或{" "}
                <code>&quot;&quot;</code> 时,绝不要用 <code>||</code>。
              </>
            }
          />,
        ]}
      />

      <ChapterFooter ch="narrowing" />
    </main>
  );
}
