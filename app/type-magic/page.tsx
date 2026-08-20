"use client";

// 第 07 章 · 类型运算(双语:正文用 <T en zh />,组件 props 用 { en, zh })——
// 值世界 vs 类型世界 → keyof / typeof → 索引访问 →
// 条件类型与分发(招牌 viz)→ infer → 映射类型与键重映射 →
// 亲手重写 06 章的五个工具类型 → 动手任务 → 测验 → 要点。
// 与 06 章成对:上一章会用,这一章拆开看怎么造。
//
// 代码示例:可执行行在两种语言里逐字节相同,只有注释分 en / zh;
// 因此 hl 行号在两种语言下一致。编译器报错原文一律不翻译,
// 教学代码里的字符串字面量两种语言都用英文。
// 所有报错文案、报错码与推断结果均在 TypeScript 5.9 + strict 下实测过。

import "./chapter.css";

import { Hero, Section, Callout, KeyPoints, ChapterFooter } from "@/lib/kit";
import { CodeBlock, CodePair } from "@/lib/code";
import { LabSet } from "@/lib/labs";
import { Quiz } from "@/lib/quiz";
import { T, type Loc } from "@/lib/i18n";
import { LABS, QUIZ } from "@/lib/type-magic-data";
import { TmHeroParts, TmDistribute, TmMappedFactory } from "./viz";

/* ---------- §02 keyof / typeof ---------- */

// 全是类型输出与编译器报错原文,两种语言一致。
const S2_KEYOF = `type Size = "small" | "medium" | "large";
type Sugar = 0 | 30 | 50 | 70 | 100;

interface Order {
  id: string;
  drink: string;
  size: Size;
  sugar: Sugar;
  toppings: string[];
  internalNote: string;
}

type OrderKey = keyof Order;
// "id" | "drink" | "size" | "sugar" | "toppings" | "internalNote"

const k: OrderKey = "size";
const bad: OrderKey = "cup";
// Type '"cup"' is not assignable to type 'keyof Order'.`;

const S2_TYPEOF: Loc<string> = {
  en: `const menu = {
  jasmineMilkTea: 12,
  grapeSago: 18,
  berryCheese: 20,
};

type Menu = typeof menu;
// { jasmineMilkTea: number; grapeSago: number; berryCheese: number }

type DrinkName = keyof typeof menu;
// "jasmineMilkTea" | "grapeSago" | "berryCheese"

function priceOf(name: DrinkName) {
  return menu[name]; // name is always a key of menu, so no check is needed
}`,
  zh: `const menu = {
  jasmineMilkTea: 12,
  grapeSago: 18,
  berryCheese: 20,
};

type Menu = typeof menu;
// { jasmineMilkTea: number; grapeSago: number; berryCheese: number }

type DrinkName = keyof typeof menu;
// "jasmineMilkTea" | "grapeSago" | "berryCheese"

function priceOf(name: DrinkName) {
  return menu[name]; // name 一定是 menu 的键,不需要判空
}`,
};

/* ---------- §03 索引访问 ---------- */

const S3_INDEX: Loc<string> = {
  en: `type OrderSize = Order["size"];
// Size -- square brackets, not a dot: Order.size is not a type

type IdOrDrink = Order["id" | "drink"];
// string -- the key may be a union, reading several properties at once

type OrderValue = Order[keyof Order];
// string | 0 | 30 | 50 | 70 | 100 | string[]
// Size is gone: its members are strings, and string is already in the union.

const toppings = ["boba", "coconut jelly", "taro balls"] as const;
type Topping = (typeof toppings)[number];
// "boba" | "coconut jelly" | "taro balls"`,
  zh: `type OrderSize = Order["size"];
// Size —— 用方括号,不是点:Order.size 不是类型

type IdOrDrink = Order["id" | "drink"];
// string —— 键可以是联合,一次读出多个属性的类型

type OrderValue = Order[keyof Order];
// string | 0 | 30 | 50 | 70 | 100 | string[]
// Size 不见了:它的成员都是字符串,而联合里已经有 string 了。

const toppings = ["boba", "coconut jelly", "taro balls"] as const;
type Topping = (typeof toppings)[number];
// "boba" | "coconut jelly" | "taro balls"`,
};

/* ---------- §04 条件类型与分发 ---------- */

const S4_COND: Loc<string> = {
  en: `type IsSize<T> = T extends Size ? "a cup size" : "not a cup size";

type A = IsSize<"large">; // "a cup size" -- "large" is a member of Size
type B = IsSize<number>;  // "not a cup size"`,
  zh: `type IsSize<T> = T extends Size ? "a cup size" : "not a cup size";

type A = IsSize<"large">; // "a cup size" —— "large" 是 Size 的成员
type B = IsSize<number>;  // "not a cup size"`,
};

const S4_EXCLUDE: Loc<string> = {
  en: `type OrderStatus = "queued" | "making" | "ready" | "cancelled";

type MyExclude<T, U> = T extends U ? never : T;

type Active = MyExclude<OrderStatus, "cancelled">;
// T is a naked type parameter, so the union is not checked as a whole.
// Each member is checked on its own:
//   "queued"    extends "cancelled" ? -> false -> keep "queued"
//   "making"    extends "cancelled" ? -> false -> keep "making"
//   "ready"     extends "cancelled" ? -> false -> keep "ready"
//   "cancelled" extends "cancelled" ? -> true  -> never
// Joined:  "queued" | "making" | "ready" | never
//        = "queued" | "making" | "ready"
// never is the empty union, so it leaves no trace in a union.`,
  zh: `type OrderStatus = "queued" | "making" | "ready" | "cancelled";

type MyExclude<T, U> = T extends U ? never : T;

type Active = MyExclude<OrderStatus, "cancelled">;
// T 是裸类型参数,所以这个联合不会被当成整体判断。
// 每个成员各判一次:
//   "queued"    extends "cancelled" ? -> 否 -> 保留 "queued"
//   "making"    extends "cancelled" ? -> 否 -> 保留 "making"
//   "ready"     extends "cancelled" ? -> 否 -> 保留 "ready"
//   "cancelled" extends "cancelled" ? -> 是 -> never
// 合并: "queued" | "making" | "ready" | never
//     = "queued" | "making" | "ready"
// never 是空联合,在联合里不留任何痕迹。`,
};

const S4_NAKED: Loc<string> = {
  en: `type NakedCheck<T>   = T extends string ? "all strings" : "something else";
type WrappedCheck<T> = [T] extends [string] ? "all strings" : "something else";

type C = NakedCheck<"a" | 1>;
// "all strings" | "something else"
// Checked member by member, so the result is a union too.

type D = WrappedCheck<"a" | 1>;
// "something else"
// [T] is a tuple, so T is not naked. The union is checked as one type.`,
  zh: `type NakedCheck<T>   = T extends string ? "all strings" : "something else";
type WrappedCheck<T> = [T] extends [string] ? "all strings" : "something else";

type C = NakedCheck<"a" | 1>;
// "all strings" | "something else"
// 逐个成员判断,所以结果也是一个联合。

type D = WrappedCheck<"a" | 1>;
// "something else"
// [T] 是元组,T 不再是裸类型参数,整个联合被当成一个类型判断。`,
};

const S4_EDGE: Loc<string> = {
  en: `type E1 = MyExclude<never, string>;
// never -- never is the empty union. There is nothing to check,
//          so the conditional type produces nothing.

type E2 = MyExclude<boolean, true>;
// false -- boolean is exactly true | false, so the check runs twice:
//          true becomes never, false is kept.

type E3 = NakedCheck<never>;
// never -- same reason as E1: no members, so no results.

type E4 = WrappedCheck<never>;
// "all strings" -- [never] is checked as one type, and never is
//                  assignable to string, so the check is true.`,
  zh: `type E1 = MyExclude<never, string>;
// never —— never 就是空联合。没有成员可判,
//          条件类型也就什么都产不出来。

type E2 = MyExclude<boolean, true>;
// false —— boolean 就是 true | false,所以判断跑了两次:
//          true 变成 never,false 保留。

type E3 = NakedCheck<never>;
// never —— 和 E1 同理:没有成员,就没有结果。

type E4 = WrappedCheck<never>;
// "all strings" —— [never] 被当成一个类型判断,而 never
//                  可以赋给 string,所以判断成立。`,
};

/* ---------- §05 infer ---------- */

const S5_UNBOX: Loc<string> = {
  en: `type Unbox<T> = T extends Promise<infer U> ? U : T;

type A = Unbox<Promise<Order>>; // Order -- it is a Promise, take the inside
type B = Unbox<string>;         // string -- not a Promise, returned unchanged`,
  zh: `type Unbox<T> = T extends Promise<infer U> ? U : T;

type A = Unbox<Promise<Order>>; // Order —— 是 Promise,取出里面那个类型
type B = Unbox<string>;         // string —— 不是 Promise,原样返回`,
};

const S5_POSITIONS: Loc<string> = {
  en: `// Capture the element type of an array
type ElementOf<T> = T extends (infer E)[] ? E : never;
type T1 = ElementOf<string[]>; // string
type T2 = ElementOf<Order[]>;  // Order

// Capture the return type of a function -- does this look familiar?
type MyReturnType<T> = T extends (...args: any) => infer R ? R : never;
type T3 = MyReturnType<() => Size>;          // Size
type T4 = MyReturnType<typeof Math.random>;  // number`,
  zh: `// 抓出数组的元素类型
type ElementOf<T> = T extends (infer E)[] ? E : never;
type T1 = ElementOf<string[]>; // string
type T2 = ElementOf<Order[]>;  // Order

// 抓出函数的返回值类型 —— 眼熟吗?
type MyReturnType<T> = T extends (...args: any) => infer R ? R : never;
type T3 = MyReturnType<() => Size>;          // Size
type T4 = MyReturnType<typeof Math.random>;  // number`,
};

/* ---------- §06 映射类型 ---------- */

const S6_PARTIAL = `type MyPartial<T> = { [K in keyof T]?: T[K] };`;

const S6_MODIFIERS: Loc<string> = {
  en: `type Mutable<T>  = { -readonly [K in keyof T]: T[K] };
type Concrete<T> = { [K in keyof T]-?: T[K] };

// -readonly removes readonly. -? removes the optional marker, which is
// how Required is defined. A plus sign adds a modifier, but +? means the
// same as ?, so the plus is normally left out. The minus is the new part.`,
  zh: `type Mutable<T>  = { -readonly [K in keyof T]: T[K] };
type Concrete<T> = { [K in keyof T]-?: T[K] };

// -readonly 去掉 readonly。-? 去掉可选标记,Required 就是这样定义的。
// 加号是加上修饰符,但 +? 和 ? 意思相同,所以加号一般省略不写。
// 真正的新知识是减号。`,
};

const S6_HOMO: Loc<string> = {
  en: `interface Draft {
  readonly id: string;
  note?: string;
}

type P = MyPartial<Draft>;
// { readonly id?: string | undefined; note?: string | undefined }
// readonly came from Draft. The mapped type only changed ?, and copied
// every modifier it did not change -- which is why -? and -readonly exist.

type M = Mutable<Draft>;
// { id: string; note?: string | undefined }

type A = MyPartial<string[]>;
// (string | undefined)[] -- an array is still an array

type B = MyPartial<[string, number]>;
// [(string | undefined)?, (number | undefined)?] -- a tuple is still a tuple`,
  zh: `interface Draft {
  readonly id: string;
  note?: string;
}

type P = MyPartial<Draft>;
// { readonly id?: string | undefined; note?: string | undefined }
// readonly 是从 Draft 抄来的。这个映射类型只动了 ?,
// 没动的修饰符全部照抄 —— 这正是 -? 和 -readonly 存在的原因。

type M = Mutable<Draft>;
// { id: string; note?: string | undefined }

type A = MyPartial<string[]>;
// (string | undefined)[] —— 数组进去,还是数组

type B = MyPartial<[string, number]>;
// [(string | undefined)?, (number | undefined)?] —— 元组进去,还是元组`,
};

const S6_WATCHERS = `type Watchers<T> = {
  [K in keyof T as \`on\${Capitalize<string & K>}Change\`]: (next: T[K]) => void;
};

type OrderWatchers = Watchers<Pick<Order, "size" | "sugar">>;
// {
//   onSizeChange:  (next: Size)  => void;
//   onSugarChange: (next: Sugar) => void;
// }`;

/* ---------- §07 五个工具类型:官方原文 vs 手写版 ---------- */

const LIB_TITLE: Loc<string> = {
  en: "lib.es5.d.ts · the library definition",
  zh: "lib.es5.d.ts · 标准库原文",
};
const MINE_TITLE: Loc<string> = {
  en: "Your version",
  zh: "你的手写版",
};

export default function TypeMagicPage() {
  return (
    <main className="page" data-ch="type-magic">
      <Hero
        ch="type-magic"
        title={{
          en: (
            <>
              Type <span className="grad">operators</span>
            </>
          ),
          zh: (
            <>
              类型<span className="grad">运算</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              Every utility type from the last chapter is built from the same
              few parts: <code>keyof</code>, conditional types,{" "}
              <code>infer</code>, and mapped types. This chapter covers the
              parts one at a time. At the end you rebuild those five utility
              types yourself.
            </>
          ),
          zh: (
            <>
              上一章那些工具类型,拆开都是同一批零件:<code>keyof</code>、
              条件类型、<code>infer</code>、映射类型。 这一章把零件一个个认全 ——
              章末,你会亲手把那五个工具类型重新写一遍。
            </>
          ),
        }}
        chips={[
          {
            id: "worlds",
            n: "01",
            label: { en: "Two worlds", zh: "两个世界" },
          },
          {
            id: "keyof",
            n: "02",
            label: { en: "keyof and typeof", zh: "keyof 与 typeof" },
          },
          {
            id: "index",
            n: "03",
            label: { en: "Indexed access", zh: "索引访问" },
          },
          {
            id: "cond",
            n: "04",
            label: { en: "Distribution", zh: "条件与分发" },
          },
          { id: "infer", n: "05", label: "infer" },
          {
            id: "mapped",
            n: "06",
            label: { en: "Mapped types", zh: "映射类型" },
          },
          {
            id: "rebuild",
            n: "07",
            label: { en: "Rebuild them", zh: "亲手重写" },
          },
          { id: "labs", n: "08", label: { en: "Labs", zh: "动手" } },
          { id: "quiz", n: "09", label: { en: "Quiz", zh: "测验" } },
        ]}
      >
        <TmHeroParts />
      </Hero>

      {/* ================= §01 两个世界 ================= */}
      <Section
        id="worlds"
        index="01"
        title={{
          en: "Two worlds: types are a small language of their own",
          zh: "两个世界:类型自己也是一门小语言",
        }}
        desc={{
          en: "Before taking a utility type apart, set up one distinction. Every line of TypeScript you write lives in two places at once: the code that runs, and the types the compiler checks.",
          zh: "拆开工具类型之前,先立一个区分:你写的每一行 TypeScript 同时活在两处 —— 会运行的代码,和编译器检查的类型。",
        }}
      >
        <Callout
          tone="story"
          title={{
            en: "Opening one up",
            zh: "把工具类型拆开看看",
          }}
        >
          <p>
            <T
              en={
                <>
                  In the last chapter you used <code>Partial</code> and{" "}
                  <code>Pick</code> without asking how they work. Open one up
                  and there is nothing unusual inside: something that reads
                  keys, something that reads a type, something that makes a
                  decision, something that loops. Put those together and the
                  type system becomes a language you can program in.{" "}
                  <b>
                    It takes types as input, produces types as output, and runs
                    only while the code is being compiled
                  </b>
                  .
                </>
              }
              zh={
                <>
                  上一章你用 <code>Partial</code>、<code>Pick</code>{" "}
                  用得挺顺,没问过它们怎么工作。拆开看,里面没有特别的东西:
                  一个读键的、一个读类型的、一个做判断的、一个做循环的。
                  把它们拼起来,类型系统就成了一门可以编程的语言:
                  <b>输入是类型,输出也是类型,而且只在编译时运行</b>。
                </>
              }
            />
          </p>
        </Callout>

        <p className="sec-desc">
          <T
            en={
              <>
                Most JavaScript operations you already know have a counterpart
                that works on types. This table is the map of the chapter: each
                row is one section.
              </>
            }
            zh={
              <>
                你熟悉的 JavaScript 操作,大多在类型这一侧有个对应的写法。
                下面这张表就是本章的地图:每一行对应一节。
              </>
            }
          />
        </p>

        <div className="table-wrap">
          <table className="t-table tm-vs-table">
            <thead>
              <tr>
                <th>
                  <T
                    en="Values (at run time, works on data)"
                    zh="值(运行时,处理数据)"
                  />
                </th>
                <th>
                  <T
                    en="Types (at compile time, works on types)"
                    zh="类型(编译时,处理类型)"
                  />
                </th>
                <th>
                  <T en="Section" zh="在哪讲" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>Object.keys(order)</code>
                </td>
                <td>
                  <code>keyof Order</code>
                </td>
                <td>§02</td>
              </tr>
              <tr>
                <td>
                  <code>order[&quot;size&quot;]</code>
                </td>
                <td>
                  <code>Order[&quot;size&quot;]</code>
                </td>
                <td>§03</td>
              </tr>
              <tr>
                <td>
                  <code>cond ? a : b</code>
                </td>
                <td>
                  <code>T extends U ? X : Y</code>
                </td>
                <td>§04</td>
              </tr>
              <tr>
                <td>
                  <T en="Destructuring: " zh="解构:" />
                  <code>const {"{ x }"} = obj</code>
                </td>
                <td>
                  <code>infer</code>
                  <T en=" captures a part" zh=" 抓出其中一块" />
                </td>
                <td>§05</td>
              </tr>
              <tr>
                <td>
                  <code>arr.map(fn)</code>
                </td>
                <td>
                  <code>{"{ [K in keyof T]: … }"}</code>
                </td>
                <td>§06</td>
              </tr>
              <tr>
                <td>
                  <T en="Building a string: " zh="拼字符串:" />
                  <code>{"`on${name}`"}</code>
                </td>
                <td>
                  <T en="Template literal type: " zh="模板字面量类型:" />
                  <code>{"`on${K}`"}</code>
                </td>
                <td>§06</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout
          tone="idea"
          title={{
            en: "None of this exists at run time",
            zh: "这些东西在运行时都不存在",
          }}
        >
          <p>
            <T
              en={
                <>
                  Everything in this chapter happens while <code>tsc</code>{" "}
                  checks your code. When it finishes, all of it is removed. This
                  is type erasure, the same rule as in chapter 00. So a
                  complicated type costs you compile time and readability, but{" "}
                  <b>not one byte of the JavaScript you ship</b>.
                </>
              }
              zh={
                <>
                  这一章的所有东西都发生在 <code>tsc</code> 检查代码的时候。
                  检查完,它们全部被去掉。这就是类型擦除,和第 00
                  章讲的是同一条规则。所以复杂的类型只会花掉编译时间和可读性,
                  <b>打包出来的 JavaScript 一个字节都不会多</b>。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §02 keyof 与 typeof ================= */}
      <Section
        id="keyof"
        index="02"
        title={{
          en: "keyof and typeof: read the keys, read a value's type",
          zh: "keyof 与 typeof:读出键,读出值的类型",
        }}
        desc={{
          en: "The first two parts. One collects the keys of a type. The other takes the type of an existing value and brings it into the type world.",
          zh: "第一、第二个零件。一个把类型的键收集起来,一个把已有值的类型带进类型世界。",
        }}
      >
        <h3 className="tm-tool-h">
          <span className="mono">keyof T</span> ·{" "}
          <T en="collect the keys" zh="收集所有键" />
        </h3>
        <CodeBlock
          lang="ts"
          title={{
            en: "keyof: the keys of a type, as a type",
            zh: "keyof:把类型的键变成一个类型",
          }}
          code={S2_KEYOF}
          hl={[13, 14]}
          note={{
            en: (
              <>
                Compare the two: <code>Object.keys(order)</code> gives you an
                array of strings when the program runs. <code>keyof Order</code>{" "}
                gives you a <b>union of string literal types</b> while the
                program is compiled. Every member of that union is a key that
                really exists, which is why <code>&quot;cup&quot;</code> is
                rejected.
              </>
            ),
            zh: (
              <>
                对比着记:<code>Object.keys(order)</code>{" "}
                在程序运行时给你一个字符串数组;<code>keyof Order</code>{" "}
                在编译时给你一个<b>字符串字面量联合</b>。
                这个联合的每个成员都是真实存在的键 —— 所以{" "}
                <code>&quot;cup&quot;</code> 会被拒绝。
              </>
            ),
          }}
        />

        <h3 className="tm-tool-h">
          <span className="mono">typeof x</span> ·{" "}
          <T en="read the type of a value" zh="读出一个值的类型" />
        </h3>
        <CodeBlock
          lang="ts"
          title={{
            en: "typeof: from a value back to its type",
            zh: "typeof:从值反推出类型",
          }}
          code={S2_TYPEOF}
          hl={[7, 10]}
          note={{
            en: (
              <>
                Line 10 is the combination worth remembering:{" "}
                <b>
                  <code>typeof</code> first to get the type of the object, then{" "}
                  <code>keyof</code> to get its keys
                </b>
                . Add a drink to <code>menu</code> and <code>DrinkName</code>{" "}
                gains a member with no other edit. The <code>typeof</code>{" "}
                inside <code>ReturnType&lt;typeof makeOrder&gt;</code> in the
                last chapter is this same operator.
              </>
            ),
            zh: (
              <>
                第 10 行是值得记住的组合:
                <b>
                  先 <code>typeof</code> 拿到对象的类型,再 <code>keyof</code>{" "}
                  取它的键
                </b>
                。往 <code>menu</code> 里加一款饮品,<code>DrinkName</code>{" "}
                自动多一个成员,别处一行都不用改。上一章{" "}
                <code>ReturnType&lt;typeof makeOrder&gt;</code> 里的那个{" "}
                <code>typeof</code>,就是它。
              </>
            ),
          }}
        />

        <Callout
          tone="warn"
          title={{
            en: "Two different operators share the name typeof",
            zh: "两个不同的运算符共用 typeof 这个名字",
          }}
        >
          <p>
            <T
              en={
                <>
                  The JavaScript <code>typeof</code> runs at run time and
                  returns one of eight strings, such as{" "}
                  <code>&quot;string&quot;</code> or{" "}
                  <code>&quot;object&quot;</code> (chapter 03 used it for
                  narrowing). The TypeScript <code>typeof</code> appears only in
                  a <b>type position</b> — after the <code>=</code> of a{" "}
                  <code>type</code> declaration, or after the <code>:</code> of
                  an annotation — and it is removed when the code is compiled.
                </>
              }
              zh={
                <>
                  JavaScript 的 <code>typeof</code> 在运行时执行,
                  返回八种字符串之一,比如 <code>&quot;string&quot;</code>、
                  <code>&quot;object&quot;</code>(第 03
                  章拿它做过收窄)。TypeScript 的 <code>typeof</code> 只出现在
                  <b>类型位置</b> —— <code>type</code> 声明的等号右边、
                  注解的冒号后面 —— 编译时会被去掉。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Judge by position, not by the word:{" "}
                  <code>if (typeof x === &quot;string&quot;)</code> is the
                  JavaScript one, and <code>type M = typeof menu</code> is the
                  TypeScript one.
                </>
              }
              zh={
                <>
                  看位置,别看单词:
                  <code>if (typeof x === &quot;string&quot;)</code> 是
                  JavaScript 的那个,<code>type M = typeof menu</code> 是
                  TypeScript 的那个。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 索引访问 ================= */}
      <Section
        id="index"
        index="03"
        title={{
          en: "Indexed access: T[K] reads a property type",
          zh: "索引访问:T[K] 读出属性的类型",
        }}
        desc={{
          en: "The third part. You have the keys; now use one to read the type stored under it.",
          zh: "第三个零件。键已经拿到了,现在用键去读出它对应的类型。",
        }}
      >
        <CodeBlock
          lang="ts"
          title={{
            en: "Indexed access types",
            zh: "索引访问类型(indexed access types)",
          }}
          code={S3_INDEX}
          hl={[1, 7, 12]}
          note={{
            en: (
              <>
                Two things to take from this. First,{" "}
                <code>Order[keyof Order]</code> shows that a union of types
                collapses when one member already covers another:{" "}
                <code>Size</code> is a union of strings, and <code>string</code>{" "}
                is in the union too, so <code>Size</code> is absorbed. Second,{" "}
                <code>T[number]</code> is the standard way to read the element
                type of an array. Combined with <code>as const</code>, which
                turns the array into a readonly tuple of literal types, one list
                of data also becomes the list of allowed values: edit it in one
                place and both sides follow.
              </>
            ),
            zh: (
              <>
                这里有两件事值得带走。第一,<code>Order[keyof Order]</code>{" "}
                说明:联合里如果一个成员已经覆盖了另一个,后者就会被吸收 ——
                <code>Size</code> 是字符串组成的联合,而联合里本来就有{" "}
                <code>string</code>,所以 <code>Size</code> 消失了。第二,
                <code>T[number]</code> 是读取数组元素类型的标准写法。 配上{" "}
                <code>as const</code>
                (它把数组变成由字面量类型组成的只读元组),
                一份数据同时成了一份可选值名单:改一处,两边一起变。
              </>
            ),
          }}
        />
        <p className="sec-desc">
          <T
            en={
              <>
                Three parts are now in place: <code>keyof</code> reads keys,{" "}
                <code>typeof</code> reads the type of a value, and{" "}
                <code>T[K]</code> reads the type of a property. Everything later
                in the chapter is built on these.
              </>
            }
            zh={
              <>
                三个零件齐了:<code>keyof</code> 读键,<code>typeof</code>{" "}
                读值的类型,<code>T[K]</code> 读属性的类型。
                本章后面的东西都建在它们上面。
              </>
            }
          />
        </p>
      </Section>

      {/* ================= §04 条件与分发 ================= */}
      <Section
        id="cond"
        index="04"
        title={{
          en: "Conditional types and distribution",
          zh: "条件类型与分发",
        }}
        desc={{
          en: "The fourth part, and the most important one in this chapter. First the conditional type itself. Then what happens when the type being checked is a union.",
          zh: "第四个零件,也是本章最重要的一个。先看条件类型本身,再看被判断的类型是联合时会发生什么。",
        }}
      >
        <CodeBlock
          lang="ts"
          title={{
            en: "Conditional types: T extends U ? X : Y",
            zh: "条件类型(conditional types):T extends U ? X : Y",
          }}
          code={S4_COND}
          note={{
            en: (
              <>
                <code>extends</code> here means &quot;is assignable to&quot; —
                the same compatibility check as in chapter 04, now used as the
                condition of a ternary. If the check holds, the type is{" "}
                <code>X</code>; otherwise it is <code>Y</code>.
              </>
            ),
            zh: (
              <>
                这里的 <code>extends</code> 是「能不能赋给」的意思 —— 和第 04
                章的兼容判断是同一件事,现在被用作三元表达式的条件。 成立就取{" "}
                <code>X</code>,不成立就取 <code>Y</code>。
              </>
            ),
          }}
        />

        <p className="sec-desc">
          <T
            en={
              <>
                On its own that is not much. The important behavior appears
                when the checked type is a union. The last chapter said that{" "}
                <code>Exclude</code> is defined in a single line, and this is
                that line. But how can a ternary <b>remove</b> members from a
                union?
              </>
            }
            zh={
              <>
                单看没什么。重要的行为出现在被判断的类型是联合的时候。
                上一章说过 <code>Exclude</code> 的定义只有一行 ——
                就是下面这行。可是一个三元表达式,怎么能从联合里
                <b>删掉</b>成员?
              </>
            }
          />
        </p>

        <CodeBlock
          lang="ts"
          title={{
            en: "Exclude in one line, worked through by hand",
            zh: "一行的 Exclude,手工推一遍",
          }}
          code={S4_EXCLUDE}
          hl={[3, 5]}
        />

        <TmDistribute />

        <p className="sec-desc">
          <T
            en={
              <>
                This behavior is called a <b>distributive conditional type</b>,
                and it has one condition that you have to know: it happens{" "}
                <b>
                  only when the type on the left of <code>extends</code> is a
                  naked type parameter
                </b>{" "}
                — a bare <code>T</code>, with nothing wrapped around it. When it
                happens and <code>T</code> is <code>A | B</code>, the compiler
                rewrites the whole conditional type as{" "}
                <code>(A extends U ? X : Y) | (B extends U ? X : Y)</code>. That
                is the entire rule. Without it, no one can predict what a
                conditional type will return.
              </>
            }
            zh={
              <>
                这个行为叫<b>分布式条件类型</b>,它有一个你必须知道的前提:
                <b>
                  只有 <code>extends</code> 左边是裸类型参数时才会发生
                </b>{" "}
                —— 也就是光秃秃的 <code>T</code>,外面什么都没包。
                发生分发时,如果 <code>T</code> 是 <code>A | B</code>,
                编译器就把整个条件类型改写成{" "}
                <code>(A extends U ? X : Y) | (B extends U ? X : Y)</code>。
                规则就这么多。不知道这条,谁都没法预测条件类型会返回什么。
              </>
            }
          />
        </p>

        <Callout
          tone="warn"
          title={{
            en: "Distribution needs a naked T. Wrap it and it stops",
            zh: "分发只认裸 T:包一层就停",
          }}
        >
          <CodeBlock
            lang="ts"
            title={{
              en: "Naked and wrapped give different answers",
              zh: "裸的和包起来的,答案不同",
            }}
            code={S4_NAKED}
            hl={[4, 8]}
          />
          <p>
            <T
              en={
                <>
                  <b>This is the design, not a defect.</b> When you want each
                  member handled separately, as <code>Exclude</code> does, use a
                  naked <code>T</code>. When you want the union judged as a
                  single type, wrap <b>both sides</b> in a one-element tuple:{" "}
                  <code>[T] extends [U]</code>. Wrapping only one side changes
                  what you are comparing, so wrap both.
                </>
              }
              zh={
                <>
                  <b>这是设计,不是缺陷。</b>想让每个成员各自处理(
                  <code>Exclude</code> 那种),就用裸 <code>T</code>;
                  想把联合当成一个类型来判断,就把<b>两边</b>
                  都包进单元素元组:<code>[T] extends [U]</code>。
                  只包一边会改变比较的对象,所以两边都要包。
                </>
              }
            />
          </p>
        </Callout>

        <Callout
          tone="deep"
          title={{
            en: "Two results that surprise people, and the same rule explains both",
            zh: "两个让人意外的结果,其实是同一条规则",
          }}
        >
          <CodeBlock
            lang="ts"
            title={{
              en: "never and boolean under distribution",
              zh: "never 和 boolean 遇上分发",
            }}
            code={S4_EDGE}
          />
          <p>
            <T
              en={
                <>
                  <code>never</code> is the union with no members. Distributing
                  over it runs the check zero times, so the result is{" "}
                  <code>never</code>. It is not a special case in the compiler;
                  there is simply nothing to distribute over. And{" "}
                  <code>boolean</code> is not a single type: it is{" "}
                  <code>true | false</code>, so a distributive conditional type
                  runs twice over it. Remember these two and most confusing
                  conditional-type results stop being confusing.
                </>
              }
              zh={
                <>
                  <code>never</code> 是没有成员的联合。对它分发,
                  判断跑零次,所以结果是 <code>never</code>。
                  这不是编译器里的特例,只是根本没有东西可以分发。 而{" "}
                  <code>boolean</code> 也不是单个类型,它是{" "}
                  <code>true | false</code>,所以分布式条件类型会对它跑两次。
                  记住这两点,条件类型大部分「怪结果」就不怪了。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §05 infer ================= */}
      <Section
        id="infer"
        index="05"
        title={{
          en: "infer: capture a type while matching",
          zh: "infer:在匹配的同时抓出一个类型",
        }}
        desc={{
          en: "The fifth part. A conditional type answers whether a type has a certain shape. infer also hands you the piece inside that shape.",
          zh: "第五个零件。条件类型回答「是不是这个形状」,infer 还能把这个形状里面的那一块交给你。",
        }}
      >
        <CodeBlock
          lang="ts"
          title={{
            en: "Taking the value type out of a Promise",
            zh: "把 Promise 里面的类型取出来",
          }}
          code={S5_UNBOX}
          hl={[1]}
          note={{
            en: (
              <>
                Read it as: if <code>T</code> has the shape{" "}
                <code>Promise&lt;something&gt;</code>, call that something{" "}
                <code>U</code> and return <code>U</code>. <code>infer</code>{" "}
                declares a type variable inside the pattern after{" "}
                <code>extends</code>, and the compiler fills it in while
                matching. It is destructuring, done on types. The variable is
                available in the true branch only.
              </>
            ),
            zh: (
              <>
                读作:如果 <code>T</code> 长成{" "}
                <code>Promise&lt;某个类型&gt;</code> 的样子, 就把那个类型记作{" "}
                <code>U</code> 并返回 <code>U</code>。<code>infer</code> 在{" "}
                <code>extends</code>{" "}
                后面的模式里声明一个类型变量,由编译器在匹配时填上。
                相当于对类型做解构。这个变量只能在真分支里使用。
              </>
            ),
          }}
        />

        <CodeBlock
          lang="ts"
          title={{
            en: "The pattern can have the hole anywhere",
            zh: "洞可以开在模式的任何位置",
          }}
          code={S5_POSITIONS}
          hl={[7]}
          note={{
            en: (
              <>
                Line 7 is the core of <code>ReturnType</code> from the last
                chapter: if <code>T</code> is a function, capture its return
                type. TypeScript also allows a constraint on the variable (
                <code>infer U extends …</code>), which this chapter does not
                use.
              </>
            ),
            zh: (
              <>
                第 7 行就是上一章 <code>ReturnType</code> 的核心:如果{" "}
                <code>T</code> 是函数,就把返回值类型抓出来。TypeScript
                还允许给这个变量加约束(<code>infer U extends …</code>),
                本章不用它。
              </>
            ),
          }}
        />
      </Section>

      {/* ================= §06 映射类型 ================= */}
      <Section
        id="mapped"
        index="06"
        title={{
          en: "Mapped types: a loop over the keys",
          zh: "映射类型:在键上循环",
        }}
        desc={{
          en: "The last group of parts: the loop that rebuilds a type key by key, the modifiers you can add or remove, and the as clause that renames keys.",
          zh: "最后一批零件:逐键重建类型的循环、可以加也可以减的修饰符,以及给键改名的 as。",
        }}
      >
        <CodeBlock
          lang="ts"
          title={{
            en: "Mapped types: Partial in one line",
            zh: "映射类型(mapped types):一行写出 Partial",
          }}
          code={S6_PARTIAL}
          note={{
            en: (
              <>
                Three parts, all visible: <code>[K in keyof T]</code> loops over
                the keys from §02; <code>?</code> is a modifier that makes each
                property optional; <code>T[K]</code> is the indexed access from
                §03, which copies the original property type. That is the whole
                of <code>Partial</code>.
              </>
            ),
            zh: (
              <>
                三个零件都在这里:<code>[K in keyof T]</code> 在 §02 的键上循环;
                <code>?</code> 是修饰符,让每个属性变成可选;
                <code>T[K]</code> 是 §03 的索引访问,把原来的属性类型抄过来。
                <code>Partial</code> 就这么多。
              </>
            ),
          }}
        />

        <TmMappedFactory />

        <CodeBlock
          lang="ts"
          title={{
            en: "Modifiers: + adds one, - removes one",
            zh: "修饰符:+ 是加上,- 是去掉",
          }}
          code={S6_MODIFIERS}
          hl={[1, 2]}
        />

        <Callout
          tone="deep"
          title={{
            en: "A mapped type over keyof T copies the modifiers you did not change",
            zh: "在 keyof T 上循环的映射类型,会照抄你没改的修饰符",
          }}
        >
          <p>
            <T
              en={
                <>
                  Written in the form <code>{"{ [K in keyof T]: … }"}</code>, a
                  mapped type does more than build a new object type. It keeps
                  the <code>?</code> and <code>readonly</code> of the source
                  wherever it does not change them, and it passes an array
                  through as an array and a tuple through as a tuple. Such a
                  mapped type is called <b>homomorphic</b>. This is the reason{" "}
                  <code>-?</code> and <code>-readonly</code> have to exist: the
                  modifiers would otherwise be copied and there would be no way
                  to drop them.
                </>
              }
              zh={
                <>
                  写成 <code>{"{ [K in keyof T]: … }"}</code>{" "}
                  这个形式时,映射类型做的不只是造一个新对象类型。
                  它会保留源类型的 <code>?</code> 和 <code>readonly</code>
                  (只要你没去改它们),而且数组进去还是数组,元组进去还是元组。
                  这样的映射类型叫<b>同态(homomorphic)</b>映射类型。 这也正是{" "}
                  <code>-?</code> 和 <code>-readonly</code>{" "}
                  必须存在的原因:修饰符默认会被照抄,否则就没办法去掉它们。
                </>
              }
            />
          </p>
          <CodeBlock
            lang="ts"
            title={{
              en: "What is copied, and what passes through",
              zh: "哪些被照抄,哪些原样通过",
            }}
            code={S6_HOMO}
            hl={[7, 15, 18]}
          />
        </Callout>

        <h3 className="tm-tool-h">
          <span className="mono">as + template literal</span> ·{" "}
          <T en="rename the keys as well (TS 4.1)" zh="连键名也能改(TS 4.1)" />
        </h3>
        <CodeBlock
          lang="ts"
          title={{
            en: "Key remapping: an event handler type from an object type",
            zh: "键重映射(key remapping):从对象类型生成事件处理器类型",
          }}
          code={S6_WATCHERS}
          hl={[2]}
          note={{
            en: (
              <>
                The <code>as</code> clause gives the new key name. A{" "}
                <b>template literal type</b> builds that name from pieces, and{" "}
                <code>Capitalize</code> raises the first letter. The{" "}
                <code>string &amp; K</code> is required, not decoration:{" "}
                <code>keyof T</code> can also contain <code>number</code> and{" "}
                <code>symbol</code>, while <code>Capitalize&lt;S&gt;</code> only
                accepts <code>S extends string</code>. Leave it out and the
                compiler reports{" "}
                <code>
                  Type &apos;K&apos; does not satisfy the constraint
                  &apos;string&apos;.
                </code>{" "}
                Mapping a key to <code>never</code> instead removes it, which is
                how a mapped type can filter keys as well as rename them. Both{" "}
                <code>as</code> and template literal types arrived in TypeScript
                4.1.
              </>
            ),
            zh: (
              <>
                <code>as</code> 后面写新的键名。<b>模板字面量类型</b>
                负责把名字拼出来,<code>Capitalize</code> 把首字母变大写。
                <code>string &amp; K</code> 是必需的,不是装饰:
                <code>keyof T</code> 里还可能有 <code>number</code> 和{" "}
                <code>symbol</code>,而 <code>Capitalize&lt;S&gt;</code> 只接受{" "}
                <code>S extends string</code>。去掉它,编译器会报{" "}
                <code>
                  Type &apos;K&apos; does not satisfy the constraint
                  &apos;string&apos;.
                </code>{" "}
                另外,把某个键映射成 <code>never</code> 就等于删掉它 ——
                所以映射类型不只能改名,还能筛键。<code>as</code>{" "}
                和模板字面量类型都是 TypeScript 4.1 加入的。
              </>
            ),
          }}
        />
      </Section>

      {/* ================= §07 亲手重写 ================= */}
      <Section
        id="rebuild"
        index="07"
        title={{
          en: "Rebuild the five utility types yourself",
          zh: "亲手重写那五个工具类型",
        }}
        desc={{
          en: "All the parts are covered. On the left is the definition from lib.es5.d.ts; on the right is the version you would write. Each one uses only the parts from this chapter.",
          zh: "零件都认过了。左边是 lib.es5.d.ts 里的定义,右边是你会写的版本 —— 每一个都只用到本章的零件。",
        }}
        badge={{ en: "Chapter goal", zh: "本章重点" }}
      >
        <h3 className="tm-tool-h">
          <span className="mono">MyPartial</span> ·{" "}
          <T en="make every property optional" zh="每个属性都变可选" />
          <span className="tm-parts-used">
            <T
              en="Parts: mapped type + ? + T[K]"
              zh="零件:映射类型 + ? + T[K]"
            />
          </span>
        </h3>
        <CodePair
          left={
            <CodeBlock
              lang="dts"
              title={LIB_TITLE}
              code={`type Partial<T> = {
  [P in keyof T]?: T[P];
};`}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title={MINE_TITLE}
              code={`type MyPartial<T> = {
  [K in keyof T]?: T[K];
};`}
            />
          }
        />

        <h3 className="tm-tool-h">
          <span className="mono">MyReadonly</span> ·{" "}
          <T en="make every property readonly" zh="每个属性都变只读" />
          <span className="tm-parts-used">
            <T
              en="Parts: mapped type + readonly + T[K]"
              zh="零件:映射类型 + readonly + T[K]"
            />
          </span>
        </h3>
        <CodePair
          left={
            <CodeBlock
              lang="dts"
              title={LIB_TITLE}
              code={`type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};`}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title={MINE_TITLE}
              code={`type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};`}
            />
          }
        />

        <h3 className="tm-tool-h">
          <span className="mono">MyPick</span> ·{" "}
          <T en="keep only the listed keys" zh="只保留点到名的键" />
          <span className="tm-parts-used">
            <T
              en="Parts: mapped type + constraint + T[K]"
              zh="零件:映射类型 + 泛型约束 + T[K]"
            />
          </span>
        </h3>
        <CodePair
          left={
            <CodeBlock
              lang="dts"
              title={LIB_TITLE}
              code={`type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};`}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title={MINE_TITLE}
              code={`type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};`}
            />
          }
        />
        <p className="sec-desc">
          <T
            en={
              <>
                Notice what changed: the loop runs over <code>K</code>, the keys
                the caller asked for, not over <code>keyof T</code>. And{" "}
                <code>K extends keyof T</code> — a generic constraint from
                chapter 05 — makes sure every requested key really exists.{" "}
                <b>
                  That is why a misspelled key is reported by <code>Pick</code>{" "}
                  and not by <code>Omit</code>
                </b>
                : <code>Omit</code> constrains its keys to{" "}
                <code>keyof any</code> instead. The open question from the last
                chapter is answered.
              </>
            }
            zh={
              <>
                注意变化:循环跑在 <code>K</code>(调用方点名的键)上, 而不是{" "}
                <code>keyof T</code> 上。而 <code>K extends keyof T</code>
                (第 05 章的泛型约束)保证点到的键真实存在。
                <b>
                  这就是 <code>Pick</code> 拼错键会报错、<code>Omit</code>{" "}
                  不报的原因
                </b>
                :<code>Omit</code> 的键约束是 <code>keyof any</code>。
                上一章留下的问题,到这里有答案了。
              </>
            }
          />
        </p>

        <h3 className="tm-tool-h">
          <span className="mono">MyExclude</span> ·{" "}
          <T en="filter a union" zh="筛一个联合" />
          <span className="tm-parts-used">
            <T
              en="Parts: conditional type + distribution + never"
              zh="零件:条件类型 + 分发 + never"
            />
          </span>
        </h3>
        <CodePair
          left={
            <CodeBlock
              lang="dts"
              title={LIB_TITLE}
              code={`type Exclude<T, U> =
  T extends U ? never : T;`}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title={MINE_TITLE}
              code={`type MyExclude<T, U> =
  T extends U ? never : T;`}
            />
          }
        />

        <h3 className="tm-tool-h">
          <span className="mono">MyReturnType</span> ·{" "}
          <T en="capture a function's return type" zh="抓出函数的返回值类型" />
          <span className="tm-parts-used">
            <T
              en="Parts: conditional type + infer"
              zh="零件:条件类型 + infer"
            />
          </span>
        </h3>
        <CodePair
          left={
            <CodeBlock
              lang="dts"
              title={LIB_TITLE}
              code={`type ReturnType<
  T extends (...args: any) => any
> = T extends (...args: any) => infer R
  ? R
  : any;`}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title={MINE_TITLE}
              code={`type MyReturnType<
  T extends (...args: any) => any
> = T extends (...args: any) => infer R
  ? R
  : never;`}
            />
          }
        />
        <p className="sec-desc">
          <T
            en={
              <>
                The only difference is the fallback branch: the library uses{" "}
                <code>any</code>, and this version uses <code>never</code>. The
                constraint already guarantees that <code>T</code> is a function,
                so under normal use that branch is never taken. Both are
                correct; <code>never</code> is the stricter choice.
              </>
            }
            zh={
              <>
                唯一的差别在兜底分支:标准库用 <code>any</code>, 这一版用{" "}
                <code>never</code>。约束已经保证 <code>T</code>{" "}
                是函数,正常使用时这个分支走不到。两种都对,
                <code>never</code> 更严格一点。
              </>
            }
          />
        </p>

        <Callout
          tone="win"
          title={{
            en: "You can now read the library",
            zh: "现在你能读懂标准库了",
          }}
        >
          <p>
            <T
              en={
                <>
                  Five utility types, rewritten by hand, and your versions are
                  nearly word for word the same as the library&apos;s.{" "}
                  <b>There are only a few parts; the rest is combination.</b> In
                  VS Code, hold Cmd or Ctrl and click <code>Partial</code> to
                  jump into <code>lib.es5.d.ts</code>. The file that looked
                  unreadable one chapter ago now reads as plain code. And when
                  the built-in types are not enough — a deep{" "}
                  <code>Readonly</code>, a strict <code>Omit</code> — you can
                  write your own. One of the labs below is exactly that.
                </>
              }
              zh={
                <>
                  五个工具类型全部亲手写过,而且你的版本和标准库几乎一字不差。
                  <b>零件只有这么几个,剩下的是组合。</b>在 VS Code 里按住 Cmd 或
                  Ctrl 点一下 <code>Partial</code>,跳进{" "}
                  <code>lib.es5.d.ts</code>:上一章还读不下去的地方,
                  现在就是普通代码。内置类型不够用的时候(深层{" "}
                  <code>Readonly</code>、严格的 <code>Omit</code>),
                  你已经能自己写 —— 下面的动手任务里就有一个。
                </>
              }
            />
          </p>
        </Callout>

        <Callout
          tone="warn"
          title={{
            en: "Being able to write it is not a reason to",
            zh: "能写不等于该写",
          }}
        >
          <p>
            <T
              en={
                <>
                  Type-level code follows the same rule as ordinary code:{" "}
                  <b>
                    if a reader can understand it at a glance, do not write it
                    as three nested conditionals
                  </b>
                  . If an <code>interface</code> says it clearly, do not reach
                  for a conditional type. A type that takes a colleague ten
                  seconds of hovering to understand is a cost, not an
                  achievement. The final chapter, on how to think about types,
                  returns to where that line sits.
                </>
              }
              zh={
                <>
                  类型层面的代码和普通代码守同一条规矩:
                  <b>一眼能读懂的,别写成三层嵌套的条件类型</b>。 一个{" "}
                  <code>interface</code> 说得清的事,不用上条件类型。
                  同事悬停十秒还看不懂的类型是成本,不是成绩。
                  这条线画在哪,终章「类型思维」会再谈。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §08 动手任务 ================= */}
      <Section
        id="labs"
        index="08"
        title={{ en: "Hands-on tasks", zh: "动手任务" }}
        desc={{
          en: "Four tasks, getting harder: turn distribution off, build getters with a template literal type, unwrap nested Promises, and build a utility type the library does not ship.",
          zh: "四个任务,难度递进:关掉分发、用模板字面量类型造 getter、剥掉嵌套的 Promise,最后造一个标准库没有的工具类型。",
        }}
      >
        <LabSet ch="type-magic" items={LABS} />
      </Section>

      {/* ================= §09 通关测验 ================= */}
      <Section
        id="quiz"
        index="09"
        title={{ en: "Chapter quiz", zh: "通关测验" }}
        desc={{
          en: "Eight questions. Distribution and infer are where most mistakes happen; if you are unsure, replay the visualization in §04 one step at a time.",
          zh: "八道题。分发和 infer 是错得最多的地方 —— 拿不准就回 §04 把可视化一步一步再放一遍。",
        }}
      >
        <Quiz ch="type-magic" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                Types are a small language of their own: types in, types out,
                run only while the code is compiled, and removed afterwards.
                Most value-level operations have a type-level counterpart.
              </>
            ),
            zh: (
              <>
                类型自己是一门小语言:输入类型、输出类型,只在编译时运行,
                之后被去掉。值层面的操作大多在类型层面有个对应写法。
              </>
            ),
          },
          {
            en: (
              <>
                Three ways to read: <code>keyof T</code> gives the union of key
                names, <code>typeof x</code> gives the type of a value, and{" "}
                <code>T[K]</code> gives the type of a property (
                <code>T[number]</code> for the element type of an array).
              </>
            ),
            zh: (
              <>
                三个「读」:<code>keyof T</code> 读出键名的联合,
                <code>typeof x</code> 读出值的类型,<code>T[K]</code>{" "}
                读出属性的类型(数组用 <code>T[number]</code> 读元素类型)。
              </>
            ),
          },
          {
            en: (
              <>
                <code>T extends U ? X : Y</code> is the ternary of the type
                world. It{" "}
                <b>
                  distributes over a union only when the checked type is a naked
                  type parameter
                </b>
                : <code>A | B</code> becomes{" "}
                <code>(A extends U ? X : Y) | (B extends U ? X : Y)</code>. A
                member that becomes <code>never</code> disappears, because{" "}
                <code>never</code> is the empty union. That is all of{" "}
                <code>Exclude</code>.
              </>
            ),
            zh: (
              <>
                <code>T extends U ? X : Y</code> 是类型世界的三元表达式。
                <b>只有被判断的类型是裸类型参数时才会对联合分发</b>:
                <code>A | B</code> 会变成{" "}
                <code>(A extends U ? X : Y) | (B extends U ? X : Y)</code>。
                变成 <code>never</code> 的成员会消失,因为 <code>never</code>{" "}
                就是空联合。<code>Exclude</code> 全部内容就是这些。
              </>
            ),
          },
          {
            en: (
              <>
                Wrapping both sides — <code>[T] extends [U]</code> — turns
                distribution off. Two follow-on facts: <code>never</code>{" "}
                distributes over nothing and yields <code>never</code>, and{" "}
                <code>boolean</code> is <code>true | false</code>, so it
                distributes twice.
              </>
            ),
            zh: (
              <>
                两边都包起来 —— <code>[T] extends [U]</code> —— 就关掉分发。
                两个推论:对 <code>never</code> 分发没有成员可判,结果是{" "}
                <code>never</code>;<code>boolean</code> 是{" "}
                <code>true | false</code>,所以会分发两次。
              </>
            ),
          },
          {
            en: (
              <>
                <code>infer</code> captures a type out of a matched shape. A
                mapped type <code>{"{ [K in keyof T]: … }"}</code> rebuilds a
                type key by key, copies the modifiers it does not change, and
                accepts <code>?</code>, <code>-?</code>, <code>readonly</code>{" "}
                and <code>-readonly</code>. An <code>as</code> clause with a
                template literal type renames keys, and mapping a key to{" "}
                <code>never</code> removes it (TS 4.1).
              </>
            ),
            zh: (
              <>
                <code>infer</code> 从匹配到的形状里抓出类型。映射类型{" "}
                <code>{"{ [K in keyof T]: … }"}</code> 逐键重建类型,
                照抄它没改的修饰符,并支持 <code>?</code>、<code>-?</code>、
                <code>readonly</code>、<code>-readonly</code>
                。配合模板字面量类型 的 <code>
                  as
                </code> 可以给键改名,把键映射成 <code>never</code> 则是删掉它(TS
                4.1)。
              </>
            ),
          },
          {
            en: (
              <>
                You have rewritten all five utility types from the last chapter
                by hand. Keep the restraint that goes with it: readability comes
                before cleverness, and a recursive type still has a depth limit
                (<code>ts(2589)</code>).
              </>
            ),
            zh: (
              <>
                上一章那五个工具类型你已经全部亲手写过。
                随之而来的是克制:可读性优先于聪明, 而递归类型仍然有深度上限(
                <code>ts(2589)</code>)。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="type-magic" />
    </main>
  );
}
