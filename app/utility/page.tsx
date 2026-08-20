"use client";

// 第 06 章 · 内置工具类型(双语:正文用 <T en zh />,组件 props 用 { en, zh })——
// 为什么需要(一个 Order,五种变体)→ 类型加工流水线(招牌 viz)→
// 改形状(Partial/Required/Readonly)→ 挑属性(Pick/Omit/Record)→
// 筛联合(Exclude/Extract/NonNullable)→ 拆函数与 Promise →
// 组合 → 动手任务 → 测验 → 要点。
//
// 与 07 章成对:这一章先会用,下一章拆开看怎么造。映射类型、条件类型与 infer
// 属于 07 章,这里只引用,不重复讲。
//
// 代码示例:可执行行在两种语言里逐字节相同,只有注释分 en / zh;
// 因此 hl 行号在两种语言下一致。编译器报错原文一律不翻译。
// 所有报错文案、报错码与推断结果均在 TypeScript 5.9 + strict 下实测过。

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
import { T, type Loc } from "@/lib/i18n";
import { LABS, QUIZ } from "@/lib/utility-data";
import { UtHeroToolbox, UtPipeline, UtUnionSieve } from "./viz";

/* ---------- §01 为什么需要 ---------- */

const S1_ORDER: Loc<string> = {
  en: `type Size = "small" | "medium" | "large";
type Sugar = 0 | 30 | 50 | 70 | 100;

interface Order {
  id: string;           // order number
  drink: string;        // what was ordered
  size: Size;           // cup size
  sugar: Sugar;         // sugar level, as a percentage
  toppings: string[];   // extras
  internalNote: string; // note for staff only
}`,
  zh: `type Size = "small" | "medium" | "large";
type Sugar = 0 | 30 | 50 | 70 | 100;

interface Order {
  id: string;           // 订单号
  drink: string;        // 点的是什么
  size: Size;           // 杯型
  sugar: Sugar;         // 糖度,百分比
  toppings: string[];   // 加料
  internalNote: string; // 内部备注,只给店员看
}`,
};

/* ---------- §03 改形状 ---------- */

const S3_PARTIAL: Loc<string> = {
  en: `type DraftOrder = Partial<Order>;
// The same as writing this by hand:
// {
//   id?: string;
//   drink?: string;
//   size?: Size;
//   sugar?: Sugar;
//   toppings?: string[];
//   internalNote?: string;
// }

const draft: DraftOrder = { drink: "Jasmine Milk Green" }; // ok
const blank: DraftOrder = {};                              // also ok

draft.drink;
// string | undefined, because the property may be absent`,
  zh: `type DraftOrder = Partial<Order>;
// 等同于手写下面这一份:
// {
//   id?: string;
//   drink?: string;
//   size?: Size;
//   sugar?: Sugar;
//   toppings?: string[];
//   internalNote?: string;
// }

const draft: DraftOrder = { drink: "Jasmine Milk Green" }; // 合法
const blank: DraftOrder = {};                              // 也合法

draft.drink;
// string | undefined,因为这个属性可能不存在`,
};

const S3_REQUIRED: Loc<string> = {
  en: `type ConfirmedOrder = Required<DraftOrder>;
// Every ? is removed, so the shape is Order again.

const confirmed: ConfirmedOrder = { drink: "Grape Tea" };
// Type '{ drink: string; }' is missing the following properties from
// type 'Required<Partial<Order>>': id, size, sugar, toppings, internalNote

// Required removes more than the question mark. It is written with -?,
// and removing ? also removes undefined from the property type.
type A = { note?: string };
type B = Required<A>;
// { note: string } — not { note: string | undefined }

// This applies only to properties written with ?. A required property
// whose type already includes undefined is left as it is.
type C = { note: string | undefined };
type D = Required<C>;
// { note: string | undefined }`,
  zh: `type ConfirmedOrder = Required<DraftOrder>;
// 所有 ? 都被去掉,形状又回到 Order。

const confirmed: ConfirmedOrder = { drink: "Grape Tea" };
// Type '{ drink: string; }' is missing the following properties from
// type 'Required<Partial<Order>>': id, size, sugar, toppings, internalNote

// Required 去掉的不只是问号。它是用 -? 定义的,
// 去掉 ? 的同时,也从属性类型里去掉了 undefined。
type A = { note?: string };
type B = Required<A>;
// { note: string } —— 而不是 { note: string | undefined }

// 这只适用于本来写了 ? 的属性。必填属性的类型里如果已经
// 显式包含 undefined,那个 undefined 会保留。
type C = { note: string | undefined };
type D = Required<C>;
// { note: string | undefined }`,
};

const S3_READONLY: Loc<string> = {
  en: `type LockedOrder = Readonly<Order>;

const locked: LockedOrder = {
  id: "A-102", drink: "Grape Tea", size: "large",
  sugar: 50, toppings: ["boba"], internalNote: "less ice",
};

locked.size = "small";
// Cannot assign to 'size' because it is a read-only property.

locked.toppings.push("coconut jelly");
// No error. The assignment to locked.toppings is blocked,
// but the array that locked.toppings points at is not.`,
  zh: `type LockedOrder = Readonly<Order>;

const locked: LockedOrder = {
  id: "A-102", drink: "Grape Tea", size: "large",
  sugar: 50, toppings: ["boba"], internalNote: "less ice",
};

locked.size = "small";
// Cannot assign to 'size' because it is a read-only property.

locked.toppings.push("coconut jelly");
// 不报错。被拦住的是「给 locked.toppings 赋值」,
// locked.toppings 指向的那个数组本身没有被保护。`,
};

/* ---------- §04 挑属性 ---------- */

const S4_PICK: Loc<string> = {
  en: `// A list row shows three properties
type OrderListItem = Pick<
  Order,
  "id" | "drink" | "size"
>;
// {
//   id: string;
//   drink: string;
//   size: Size;
// }`,
  zh: `// 列表页一行只显示三个属性
type OrderListItem = Pick<
  Order,
  "id" | "drink" | "size"
>;
// {
//   id: string;
//   drink: string;
//   size: Size;
// }`,
};

const S4_OMIT: Loc<string> = {
  en: `// A public API must not leak the note
type PublicOrder = Omit<
  Order,
  "internalNote"
>;
// Every property of Order,
// except internalNote`,
  zh: `// 对外接口不能泄漏内部备注
type PublicOrder = Omit<
  Order,
  "internalNote"
>;
// Order 的每个属性,
// 唯独没有 internalNote`,
};

const S4_TYPO: Loc<string> = {
  en: `type Oops = Omit<Order, "internalNotes">;
// One extra s, and no error at all.
// Oops still has internalNote: a misspelled key removes nothing.

type Safe = Pick<Order, "internalNotes">;
// Type '"internalNotes"' does not satisfy the constraint 'keyof Order'.`,
  zh: `type Oops = Omit<Order, "internalNotes">;
// 多打了一个 s,却完全不报错。
// Oops 里 internalNote 还在:键名拼错,等于什么都没删。

type Safe = Pick<Order, "internalNotes">;
// Type '"internalNotes"' does not satisfy the constraint 'keyof Order'.`,
};

const S4_RECORD: Loc<string> = {
  en: `// Stock per cup size. The keys are the three members of Size.
type CupStock = Record<Size, number>;

const stock: CupStock = { small: 40, medium: 25, large: 0 };
// Leave out large and you get:
// Property 'large' is missing in type '{ small: number; medium: number; }'
// but required in type 'CupStock'.

// When the keys are not known in advance, use string.
interface MenuItem { price: number; soldOut: boolean }
type Menu = Record<string, MenuItem>;

const menu: Menu = {
  "Jasmine Milk Green": { price: 12, soldOut: false },
  "Grape Tea": { price: 18, soldOut: true },
};

menu["Oolong Tea"];
// MenuItem, not MenuItem | undefined — even though this key is missing`,
  zh: `// 每个杯型的库存。键就是 Size 的三个成员。
type CupStock = Record<Size, number>;

const stock: CupStock = { small: 40, medium: 25, large: 0 };
// 少写一个 large,就会得到:
// Property 'large' is missing in type '{ small: number; medium: number; }'
// but required in type 'CupStock'.

// 键事先不确定时,用 string。
interface MenuItem { price: number; soldOut: boolean }
type Menu = Record<string, MenuItem>;

const menu: Menu = {
  "Jasmine Milk Green": { price: 12, soldOut: false },
  "Grape Tea": { price: 18, soldOut: true },
};

menu["Oolong Tea"];
// MenuItem,不是 MenuItem | undefined —— 尽管这个键并不存在`,
};

/* ---------- §05 筛联合 ---------- */

const S5_UNION: Loc<string> = {
  en: `type OrderStatus = "queued" | "making" | "ready" | "done" | "cancelled";

// The pickup screen only shows orders that are still in progress
type ActiveStatus = Exclude<OrderStatus, "done" | "cancelled">;
// "queued" | "making" | "ready"

// The archive table only stores orders that are finished
type ClosedStatus = Extract<OrderStatus, "done" | "cancelled">;
// "done" | "cancelled"

// A form may not have a sugar level yet. Clear the empty values first.
type SugarInput = Sugar | null | undefined;
type SugarValue = NonNullable<SugarInput>; // Sugar`,
  zh: `type OrderStatus = "queued" | "making" | "ready" | "done" | "cancelled";

// 取餐大屏只显示还在进行中的订单
type ActiveStatus = Exclude<OrderStatus, "done" | "cancelled">;
// "queued" | "making" | "ready"

// 归档表只存已经结束的订单
type ClosedStatus = Extract<OrderStatus, "done" | "cancelled">;
// "done" | "cancelled"

// 表单里糖度可能还没选。先把空值清掉。
type SugarInput = Sugar | null | undefined;
type SugarValue = NonNullable<SugarInput>; // Sugar`,
};

/* ---------- §06 拆函数 ---------- */

const S6_FN: Loc<string> = {
  en: `function makeOrder(drink: string, size: Size, sugar: Sugar): Order {
  return {
    id: crypto.randomUUID(), drink, size, sugar,
    toppings: [], internalNote: "",
  };
}

type MakeOrderArgs = Parameters<typeof makeOrder>;
// [drink: string, size: Size, sugar: Sugar]
// A tuple, with the parameter names kept as labels.

type MadeOrder = ReturnType<typeof makeOrder>;
// Order

type Wrong = ReturnType<makeOrder>;
// 'makeOrder' refers to a value, but is being used as a type here.
// Did you mean 'typeof makeOrder'?`,
  zh: `function makeOrder(drink: string, size: Size, sugar: Sugar): Order {
  return {
    id: crypto.randomUUID(), drink, size, sugar,
    toppings: [], internalNote: "",
  };
}

type MakeOrderArgs = Parameters<typeof makeOrder>;
// [drink: string, size: Size, sugar: Sugar]
// 一个元组,参数名作为标签保留了下来。

type MadeOrder = ReturnType<typeof makeOrder>;
// Order

type Wrong = ReturnType<makeOrder>;
// 'makeOrder' refers to a value, but is being used as a type here.
// Did you mean 'typeof makeOrder'?`,
};

const S6_AWAITED: Loc<string> = {
  en: `declare function fetchOrder(id: string): Promise<Order>;
// declare states the shape without writing an implementation.
// Chapter 09 covers it; in the Playground it works fine.

type FetchReturn = ReturnType<typeof fetchOrder>;
// Promise<Order> — still wrapped

type FetchedOrder = Awaited<FetchReturn>;
// Order — unwrapped

type Deep = Awaited<Promise<Promise<string>>>;
// string — every layer is removed, like a chain of awaits

type Plain = Awaited<string>;
// string — a type that is not a Promise passes through unchanged`,
  zh: `declare function fetchOrder(id: string): Promise<Order>;
// declare 只声明形状,不写实现。
// 第 09 章会细讲;在 Playground 里可以直接这么玩。

type FetchReturn = ReturnType<typeof fetchOrder>;
// Promise<Order> —— 还包着一层

type FetchedOrder = Awaited<FetchReturn>;
// Order —— 拆开了

type Deep = Awaited<Promise<Promise<string>>>;
// string —— 每一层都被拆掉,和连续 await 的结果一致

type Plain = Awaited<string>;
// string —— 不是 Promise 的类型原样通过`,
};

/* ---------- §07 组合 ---------- */

const S7_COMBO: Loc<string> = {
  en: `// Checkout page: only size and toppings may change, and both are optional
type CheckoutPatch = Partial<Pick<Order, "size" | "toppings">>;
// { size?: Size; toppings?: string[] }

// Public order: remove the internal note, then make the rest read-only
type PublicOrderView = Readonly<Omit<Order, "internalNote">>;

// Status board: a count for each in-progress status
type BoardStats = Record<Exclude<OrderStatus, "done" | "cancelled">, number>;
// { queued: number; making: number; ready: number }`,
  zh: `// 结账页:只允许改杯型和加料,而且两项都可以不改
type CheckoutPatch = Partial<Pick<Order, "size" | "toppings">>;
// { size?: Size; toppings?: string[] }

// 对外订单:先去掉内部备注,再把其余属性变成只读
type PublicOrderView = Readonly<Omit<Order, "internalNote">>;

// 状态大屏:每个进行中的状态各有多少单
type BoardStats = Record<Exclude<OrderStatus, "done" | "cancelled">, number>;
// { queued: number; making: number; ready: number }`,
};

const S7_ORDER: Loc<string> = {
  en: `// Partial and Pick can be swapped. Both produce { size?: Size; toppings?: string[] }
// because Pick copies the optional marker along with the property.
type P1 = Partial<Pick<Order, "size" | "toppings">>;
type P2 = Pick<Partial<Order>, "size" | "toppings">;

// Here the order does matter, because the two tools work on different levels.
type Board1 = Partial<Record<Size, MenuItem>>;
// { small?: MenuItem; medium?: MenuItem; large?: MenuItem }
// The keys are optional. Each value, if present, is a complete MenuItem.

type Board2 = Record<Size, Partial<MenuItem>>;
// { small: Partial<MenuItem>; medium: ...; large: ... }
// All three keys are required. Each value may be an empty object.

const b1: Board1 = { small: { price: 12, soldOut: false } }; // ok
const b2: Board2 = { small: { price: 12, soldOut: false } };
// Type '{ small: { price: number; soldOut: false; }; }' is missing the
// following properties from type 'Board2': medium, large`,
  zh: `// Partial 和 Pick 换顺序没有区别,两者都得到 { size?: Size; toppings?: string[] },
// 因为 Pick 会把可选标记连同属性一起复制过来。
type P1 = Partial<Pick<Order, "size" | "toppings">>;
type P2 = Pick<Partial<Order>, "size" | "toppings">;

// 这里顺序就有区别了,因为两个工具作用在不同的层级上。
type Board1 = Partial<Record<Size, MenuItem>>;
// { small?: MenuItem; medium?: MenuItem; large?: MenuItem }
// 键是可选的。某个键存在时,它的值是一个完整的 MenuItem。

type Board2 = Record<Size, Partial<MenuItem>>;
// { small: Partial<MenuItem>; medium: ...; large: ... }
// 三个键都必填。每个值可以是一个空对象。

const b1: Board1 = { small: { price: 12, soldOut: false } }; // 合法
const b2: Board2 = { small: { price: 12, soldOut: false } };
// Type '{ small: { price: number; soldOut: false; }; }' is missing the
// following properties from type 'Board2': medium, large`,
};

export default function UtilityPage() {
  return (
    <main className="page" data-ch="utility">
      <Hero
        ch="utility"
        title={{
          en: (
            <>
              Built-in <span className="grad">utility types</span>
            </>
          ),
          zh: (
            <>
              内置<span className="grad">工具类型</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              A utility type takes a type you already have and returns a new,
              related type. TypeScript ships a standard set of them, so you do
              not write the new type by hand. This chapter is about using them.
              Chapter 07 shows how they are built.
            </>
          ),
          zh: (
            <>
              工具类型接受一个你已经有的类型,返回一个与它相关的新类型。
              TypeScript 自带一套标准工具,新类型不必手写。
              这一章讲怎么用它们,第 07 章讲它们是怎么造出来的。
            </>
          ),
        }}
        chips={[
          {
            id: "why",
            n: "01",
            label: { en: "Why they exist", zh: "为什么需要" },
          },
          {
            id: "pipeline",
            n: "02",
            label: { en: "The pipeline", zh: "加工流水线" },
          },
          {
            id: "shape",
            n: "03",
            label: { en: "Change the shape", zh: "改形状" },
          },
          {
            id: "fields",
            n: "04",
            label: { en: "Choose properties", zh: "挑属性" },
          },
          {
            id: "union",
            n: "05",
            label: { en: "Filter unions", zh: "筛联合" },
          },
          {
            id: "fn",
            n: "06",
            label: { en: "From functions", zh: "拆函数" },
          },
          { id: "combo", n: "07", label: { en: "Compose them", zh: "组合" } },
          { id: "labs", n: "08", label: { en: "Labs", zh: "动手" } },
          { id: "quiz", n: "09", label: { en: "Quiz", zh: "测验" } },
        ]}
      >
        <UtHeroToolbox />
      </Hero>

      {/* ================= §01 为什么需要 ================= */}
      <Section
        id="why"
        index="01"
        title={{
          en: "Why utility types exist: one Order, five variants",
          zh: "为什么需要工具类型:一个 Order,五种变体",
        }}
        desc={{
          en: "The same tea shop. Order is the central type of the system, and real code needs several types that are almost, but not quite, Order.",
          zh: "还是那家奶茶店。Order 是系统的核心类型,而真实代码需要好几个和它很像、又不完全一样的类型。",
        }}
      >
        <Callout
          tone="story"
          title={{ en: "Five receipts, five types", zh: "五张小票,五种类型" }}
        >
          <T
            en={
              <>
                <p>
                  A draft order: the customer is still choosing, so properties
                  may be missing. A locked order: the receipt is printed and
                  nothing may change. A list row: three properties are shown. A
                  public API response: the internal note must not leave the
                  building. A stock table: one number per cup size. Five
                  requirements, five types.
                </p>
                <p>
                  You could write out all five by hand from{" "}
                  <code>Order</code>. Six properties, copied five times. Then{" "}
                  <code>Order</code> gains a property, and five places have to
                  be edited. Miss one and the types quietly disagree with each
                  other.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  草稿单:顾客还在挑,属性可以缺。锁定单:小票已经打出来,
                  一个字都不许改。列表行:只显示三个属性。对外接口:
                  内部备注绝不能出去。库存表:每个杯型对一个数字。
                  五个需求,五种类型。
                </p>
                <p>
                  你当然可以照着 <code>Order</code> 把五个都手写一遍 ——
                  六个属性抄五遍。然后 <code>Order</code> 加了一个属性,
                  五个地方都得改。漏掉一处,这些类型之间就悄悄不一致了。
                </p>
              </>
            }
          />
        </Callout>

        <CodeBlock
          lang="ts"
          title={{
            en: "order.ts · used throughout this chapter",
            zh: "order.ts · 贯穿全章的类型",
          }}
          code={S1_ORDER}
          note={
            <T
              en={
                <>
                  This is the tea shop type from Chapter 01. §05 adds the order
                  status union from Chapter 03. Paste this definition into the
                  Playground and every later example in this chapter will
                  compile against it.
                </>
              }
              zh={
                <>
                  这就是第 01 章那个奶茶店类型;§05 会再把第 03
                  章的订单状态联合加进来。把这份定义贴进 Playground,
                  本章后面的例子都能接着它跑。
                </>
              }
            />
          }
        />

        <p className="sec-desc">
          <T
            en={
              <>
                TypeScript solves this with a set of{" "}
                <b>utility types</b> that ship with the language. Each one takes
                an existing type and produces a new one. The syntax looks like a
                function call, with angle brackets instead of parentheses:{" "}
                <code>Partial&lt;Order&gt;</code>. That is the same syntax as
                the generics in Chapter 05, and for the same reason: the type
                inside the brackets is an argument. One utility type covers each
                of the five requirements above.
              </>
            }
            zh={
              <>
                TypeScript 的解法是随语言自带一批<b>工具类型</b>(utility
                types)。每一个都接受一个已有的类型,产出一个新类型。
                写法看起来像函数调用,只是圆括号换成了尖括号:
                <code>Partial&lt;Order&gt;</code>。这和第 05
                章的泛型是同一套写法,原因也一样:尖括号里的类型是一个实参。
                上面五个需求,一个工具类型对应一个。
              </>
            }
          />
        </p>

        <div className="grid-2">
          <div className="card">
            <div className="card-kicker">Partial&lt;Order&gt;</div>
            <div className="card-title">
              <T
                en="Draft order: every property optional"
                zh="草稿单:每个属性都可选"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    The customer has not finished choosing, so any property may
                    be left out. Six <code>?</code> markers, added at once.
                  </>
                }
                zh={
                  <>
                    顾客还没挑完,任何属性都允许暂时不填。六个 <code>?</code>{" "}
                    一次加上。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">Readonly&lt;Order&gt;</div>
            <div className="card-title">
              <T
                en="Locked order: no property may be reassigned"
                zh="锁定单:任何属性都不能再赋值"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    After the receipt is printed, assigning to a property is a
                    compile error. Six <code>readonly</code> markers, added at
                    once.
                  </>
                }
                zh={
                  <>
                    小票打出来之后,给属性赋值就是一个编译错误。六个{" "}
                    <code>readonly</code> 一次加上。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">Pick&lt;Order, …&gt;</div>
            <div className="card-title">
              <T
                en="List row: keep only the properties you name"
                zh="列表行:只留下点到名的属性"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    A row shows the order number, the drink, and the cup size.
                    An allow-list: named properties stay, the rest are left out.
                  </>
                }
                zh={
                  <>
                    一行只显示订单号、饮品和杯型。这是白名单:
                    点到名的留下,其余不带走。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">Omit&lt;Order, …&gt;</div>
            <div className="card-title">
              <T
                en="Public API: remove the internal property"
                zh="对外接口:删掉内部属性"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    <code>internalNote</code> is for staff only. A block-list:
                    named properties are removed, the rest stay as they are.
                  </>
                }
                zh={
                  <>
                    <code>internalNote</code> 只给店员看。这是黑名单:
                    点到名的删掉,其余原样保留。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <Callout
          tone="idea"
          title={{
            en: "A utility type transforms; it never modifies",
            zh: "工具类型只做变换,从不修改",
          }}
        >
          <T
            en={
              <p>
                A utility type does not invent anything new. It reads an
                existing type and returns a new one. It also never changes its
                input: after <code>Partial&lt;Order&gt;</code> produces a draft
                type, <code>Order</code> still has the same six required
                properties. This holds for every utility type in the chapter,
                and the pipeline below shows it directly.
              </p>
            }
            zh={
              <p>
                工具类型不发明新东西:它读一个已有的类型,返回一个新类型。
                它也从不改动输入 —— <code>Partial&lt;Order&gt;</code>{" "}
                造出草稿类型之后,<code>Order</code> 依然是那六个必填属性。
                本章每一个工具类型都是这样,下面的流水线可以直接看到这一点。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §02 加工流水线 ================= */}
      <Section
        id="pipeline"
        index="02"
        title={{
          en: "Get the feel first: a type-processing line",
          zh: "先建立手感:类型加工流水线"
        }}
        desc={{
          en: "Before the API list, watch the six properties of Order go through four different tools. Every later section is then a reminder of something you have already seen.",
          zh: "先别急着看 API 列表。先看 Order 的六个属性分别过一遍四种工具 —— 手感有了,后面每一节都是回忆。",
        }}
      >
        <UtPipeline />
        <p className="sec-desc">
          <T
            en={
              <>
                Three things to notice. A type goes in and a type comes out;
                nothing runs. Switching the tool changes only the output, never
                the input. And a property that <code>Pick</code> or{" "}
                <code>Omit</code> leaves out is missing from the{" "}
                <b>new</b> type only. It is still in <code>Order</code>, and any
                code that uses <code>Order</code> is unaffected.
              </>
            }
            zh={
              <>
                注意三件事。进去的是类型,出来的也是类型,没有任何代码在运行。
                换工具只改变输出,从不改动输入。还有:被 <code>Pick</code> 或{" "}
                <code>Omit</code> 排除掉的属性,只是在<b>新</b>类型里没有。
                它在 <code>Order</code> 里还好好地待着,
                用到 <code>Order</code> 的代码不受任何影响。
              </>
            }
          />
        </p>
      </Section>

      {/* ================= §03 改形状 ================= */}
      <Section
        id="shape"
        index="03"
        title={{
          en: "Change the shape: Partial, Required, Readonly",
          zh: "改形状:Partial / Required / Readonly",
        }}
        desc={{
          en: "The first group adds and removes no properties. It changes how each existing property behaves: optional or required, writable or read-only.",
          zh: "第一组既不增也不删属性,只改变每个属性的行为:可选还是必填,可写还是只读。",
        }}
      >
        <h3 className="ut-tool-h">
          <span className="mono">Partial&lt;T&gt;</span> ·{" "}
          <T en="every property optional" zh="每个属性都变可选" />
        </h3>
        <CodeBlock
          lang="ts"
          title={{
            en: "A draft order can be saved half-filled",
            zh: "草稿订单可以只填一半就存下来",
          }}
          code={S3_PARTIAL}
          hl={[1]}
          note={
            <T
              en={
                <>
                  Chapter 02 added <code>?</code> to a property by hand.{" "}
                  <code>Partial</code> does that to every property at once. Read
                  the last line carefully: because the property may be absent,
                  reading it gives <code>string | undefined</code>, so you have
                  to narrow it before use. Chapter 03 covers narrowing.
                </>
              }
              zh={
                <>
                  第 02 章手动给属性加过 <code>?</code>,<code>Partial</code>{" "}
                  就是对每个属性都做一次。留意最后一行:
                  因为这个属性可能不存在,读它拿到的是{" "}
                  <code>string | undefined</code>,用之前要先收窄。
                  收窄是第 03 章的内容。
                </>
              }
            />
          }
        />

        <h3 className="ut-tool-h">
          <span className="mono">Required&lt;T&gt;</span> ·{" "}
          <T en="every property required" zh="每个属性都变必填" />
        </h3>
        <CodeBlock
          lang="ts"
          title={{
            en: "A confirmed order has to be complete",
            zh: "确认后的订单必须是完整的",
          }}
          code={S3_REQUIRED}
          hl={[1, 11, 17]}
          note={
            <T
              en={
                <>
                  <code>Partial</code> and <code>Required</code> are opposites
                  for the optional marker, but they are not exact inverses of
                  each other. <code>Partial</code> adds <code>?</code>, which
                  adds <code>undefined</code> to the property type;{" "}
                  <code>Required</code> removes both. That is why{" "}
                  <code>Required&lt;A&gt;</code> above is{" "}
                  <code>{"{ note: string }"}</code> and not{" "}
                  <code>{"{ note: string | undefined }"}</code>.
                </>
              }
              zh={
                <>
                  就可选标记而言,<code>Partial</code> 和 <code>Required</code>{" "}
                  是相反的一对,但它们并不是严格互逆的。<code>Partial</code>{" "}
                  加上 <code>?</code>,连带把 <code>undefined</code>{" "}
                  加进属性类型;<code>Required</code> 把两者一起去掉。
                  所以上面的 <code>Required&lt;A&gt;</code> 是{" "}
                  <code>{"{ note: string }"}</code>,而不是{" "}
                  <code>{"{ note: string | undefined }"}</code>。
                </>
              }
            />
          }
        />

        <h3 className="ut-tool-h">
          <span className="mono">Readonly&lt;T&gt;</span> ·{" "}
          <T en="every property read-only" zh="每个属性都变只读" />
        </h3>
        <CodeBlock
          lang="ts"
          title={{
            en: "A printed receipt must not change",
            zh: "打印出来的小票不能再改",
          }}
          code={S3_READONLY}
          hl={[8, 11]}
          note={
            <T
              en={
                <>
                  The last two lines are the point of this section.{" "}
                  <code>readonly</code> rejects assignment <b>to the property</b>
                  . It says nothing about the object or array the property
                  points at, so <code>push</code> is still allowed.
                </>
              }
              zh={
                <>
                  最后两行是本节的重点。<code>readonly</code> 拒绝的是
                  <b>给属性赋值</b>。它对属性指向的那个对象或数组不作任何限制,
                  所以 <code>push</code> 依然合法。
                </>
              }
            />
          }
        />

        <Callout
          tone="warn"
          title={{
            en: "This whole group is shallow",
            zh: "这一组工具全都是浅的",
          }}
        >
          <T
            en={
              <>
                <p>
                  <code>Partial</code>, <code>Required</code> and{" "}
                  <code>Readonly</code> only touch the properties of the
                  top-level object. They never look inside a property type. In{" "}
                  <code>Partial&lt;{"{ meta: { note: string } }"}&gt;</code>,{" "}
                  <code>meta</code> becomes optional and <code>meta.note</code>{" "}
                  stays required.
                </p>
                <p>
                  For <code>Readonly</code> this is worth stating twice, because
                  the name suggests more than it does. It prevents{" "}
                  <b>assignment to the property</b>. It does not freeze the
                  object the property points at, and nothing about it exists at
                  run time: <code>Object.freeze</code> is a separate, runtime
                  thing.
                </p>
                <p>
                  There is no built-in deep version of any of these. All the
                  parts you need are in Chapter 07, and{" "}
                  <code>DeepReadonly</code> is one of the things you will write
                  there.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  <code>Partial</code>、<code>Required</code>、
                  <code>Readonly</code> 只处理最外层对象的属性,
                  不会进到属性类型的内部。在{" "}
                  <code>Partial&lt;{"{ meta: { note: string } }"}&gt;</code> 里,
                  <code>meta</code> 变成了可选,<code>meta.note</code>{" "}
                  仍然必填。
                </p>
                <p>
                  <code>Readonly</code> 这一点值得再说一遍,因为它的名字听起来
                  比它做的事更强。它阻止的是<b>给属性赋值</b>,
                  并不会冻结属性指向的那个对象,而且它在运行时完全不存在 ——
                  <code>Object.freeze</code> 是另一件事,发生在运行时。
                </p>
                <p>
                  这三个都没有官方的「深」版本。需要的零件都在第 07 章,
                  <code>DeepReadonly</code> 就是你在那一章会亲手写出来的东西之一。
                </p>
              </>
            }
          />
        </Callout>
      </Section>

      {/* ================= §04 挑属性 ================= */}
      <Section
        id="fields"
        index="04"
        title={{
          en: "Choose properties: Pick, Omit, Record",
          zh: "挑属性:Pick / Omit / Record",
        }}
        desc={{
          en: "The second group decides which properties exist: an allow-list, a block-list, and Record, which builds an object type from a set of keys and one value type.",
          zh: "第二组决定「有哪些属性」:白名单、黑名单,还有 Record —— 用一组键和一个值类型现造一个对象类型。",
        }}
      >
        <h3 className="ut-tool-h">
          <span className="mono">Pick / Omit</span> ·{" "}
          <T en="allow-list and block-list" zh="白名单与黑名单" />
        </h3>
        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title={{ en: "Pick: keep these", zh: "Pick:留下这些" }}
              code={S4_PICK}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title={{ en: "Omit: remove these", zh: "Omit:删掉这些" }}
              code={S4_OMIT}
            />
          }
        />
        <p className="sec-desc">
          <T
            en={
              <>
                Which one to use? Whichever list is shorter. A list row needs
                three of six properties, so <code>Pick</code> is shorter. A
                public response removes one of six, so <code>Omit</code> is
                shorter. Both copy the optional and <code>readonly</code>{" "}
                markers of each property they keep.
              </>
            }
            zh={
              <>
                用哪一个?哪一份名单更短就用哪个。列表行要六个属性里的三个,
                <code>Pick</code> 更短;对外响应要去掉六个里的一个,
                <code>Omit</code> 更短。两者都会把保留下来的属性的可选标记和{" "}
                <code>readonly</code> 标记一起复制过去。
              </>
            }
          />
        </p>

        <Callout
          tone="warn"
          title={{
            en: "Pick checks its keys. Omit does not.",
            zh: "Pick 会检查键,Omit 不会",
          }}
        >
          <T en={<p>Start with code that looks fine:</p>} zh={<p>先看一段看起来没问题的代码:</p>} />
          <CodeBlock
            lang="ts"
            title={{
              en: "One misspelled key, two outcomes",
              zh: "同一个拼错的键,两种结局",
            }}
            code={S4_TYPO}
            hl={[1, 5]}
          />
          <T
            en={
              <>
                <p>
                  The reason is in the two definitions.{" "}
                  <code>Pick&lt;T, K&gt;</code> declares{" "}
                  <code>K extends keyof T</code>, so <code>K</code> has to be a
                  real key of <code>T</code>.{" "}
                  <code>Omit&lt;T, K&gt;</code> declares{" "}
                  <code>K extends keyof any</code>, which accepts any{" "}
                  <code>string</code>, <code>number</code> or{" "}
                  <code>symbol</code>. The wider constraint is deliberate: it
                  lets you write <code>Omit</code> for a key that may or may not
                  be present. The cost is that a typo is not an error.
                </p>
                <p>
                  This matters most in exactly the case where{" "}
                  <code>Omit</code> is most tempting. If you remove a property
                  because it must not be sent to a client, a misspelled key
                  compiles and the property is still there. Use a{" "}
                  <code>Pick</code> allow-list for that, so the compiler checks
                  the names, or write a strict <code>Omit</code> of your own
                  after Chapter 07.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  原因在两者的定义里。<code>Pick&lt;T, K&gt;</code> 声明的是{" "}
                  <code>K extends keyof T</code>,所以 <code>K</code> 必须是{" "}
                  <code>T</code> 上真实存在的键。<code>Omit&lt;T, K&gt;</code>{" "}
                  声明的是 <code>K extends keyof any</code>,任何{" "}
                  <code>string</code>、<code>number</code>、
                  <code>symbol</code> 都收。这个更宽的约束是官方故意的:
                  它让你可以对一个「可能存在也可能不存在」的键写{" "}
                  <code>Omit</code>。代价就是拼错不报错。
                </p>
                <p>
                  而这恰好在最想用 <code>Omit</code> 的场合最危险:
                  如果你删掉一个属性是因为它不能发给客户端,
                  那么一个拼错的键会顺利编译,属性照样在里面。
                  这种场合用 <code>Pick</code> 白名单,让编译器帮你核对名字;
                  或者学完第 07 章,自己写一个严格版的 <code>Omit</code>。
                </p>
              </>
            }
          />
        </Callout>

        <h3 className="ut-tool-h">
          <span className="mono">Record&lt;K, V&gt;</span> ·{" "}
          <T
            en="build an object type from keys and a value type"
            zh="用键和值类型现造一个对象类型"
          />
        </h3>
        <CodeBlock
          lang="ts"
          title={{
            en: "A stock table and a menu lookup",
            zh: "库存表与菜单字典",
          }}
          code={S4_RECORD}
          hl={[2, 4, 18]}
          note={
            <T
              en={
                <>
                  <code>Record&lt;Size, number&gt;</code> is stricter than{" "}
                  <code>{"{ [k: string]: number }"}</code> because{" "}
                  <code>Size</code> is a finite union, so the compiler knows
                  exactly which keys must exist. With <code>string</code> as the
                  key type, <code>Record</code> becomes an index signature and
                  there is nothing to check. Read the last line: an index
                  signature promises a value for every key, so reading a missing
                  one type-checks and returns <code>undefined</code> at run
                  time. Turn on <code>noUncheckedIndexedAccess</code> (Chapter
                  10) to make the compiler add <code>| undefined</code> there.
                </>
              }
              zh={
                <>
                  <code>Record&lt;Size, number&gt;</code> 比{" "}
                  <code>{"{ [k: string]: number }"}</code> 严格,
                  因为 <code>Size</code> 是有限的联合,
                  编译器清楚知道必须有哪几个键。键类型换成{" "}
                  <code>string</code> 之后,<code>Record</code>{" "}
                  就等于一个索引签名,没有名单可以核对。
                  注意最后一行:索引签名承诺每个键都有值,
                  所以读一个不存在的键能通过类型检查,运行时却拿到{" "}
                  <code>undefined</code>。想让编译器在这里补上{" "}
                  <code>| undefined</code>,要开{" "}
                  <code>noUncheckedIndexedAccess</code>(第 10 章)。
                </>
              }
            />
          }
        />
      </Section>

      {/* ================= §05 筛联合 ================= */}
      <Section
        id="union"
        index="05"
        title={{
          en: "Filter unions: Exclude, Extract, NonNullable",
          zh: "筛联合:Exclude / Extract / NonNullable",
        }}
        desc={{
          en: "The tools so far worked on object properties. This group works on the members of a union type, which brings back the order status from Chapter 03.",
          zh: "前面几个工具处理的是对象属性,这一组处理的是联合类型的成员 —— 第 03 章的订单状态该出场了。",
        }}
      >
        <CodeBlock
          lang="ts"
          title={{
            en: "Three cuts of the same status union",
            zh: "同一个状态联合,三种裁剪",
          }}
          code={S5_UNION}
          hl={[4, 8, 13]}
        />

        <UtUnionSieve />

        <Callout
          tone="idea"
          title={{
            en: "Properties or members? Ask before you reach for a tool",
            zh: "属性,还是成员?动手前先问一句",
          }}
        >
          <T
            en={
              <>
                <p>
                  <code>Partial</code>, <code>Pick</code> and{" "}
                  <code>Omit</code> take an <b>object type</b> and work on its
                  properties. <code>Exclude</code>, <code>Extract</code> and{" "}
                  <code>NonNullable</code> take a <b>union type</b> and work on
                  its members. When you are not sure which you need, ask: is
                  this type a record of properties, or a list of alternatives?
                </p>
                <p>
                  All three of this group are applied to each member of the
                  union separately, which is why{" "}
                  <code>Exclude&lt;A | B | C, B&gt;</code> gives{" "}
                  <code>A | C</code> instead of comparing the whole union at
                  once. Chapter 07 shows the one-line definition that produces
                  this behaviour.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  <code>Partial</code>、<code>Pick</code>、<code>Omit</code>{" "}
                  接受的是<b>对象类型</b>,处理它的属性;<code>Exclude</code>、
                  <code>Extract</code>、<code>NonNullable</code> 接受的是
                  <b>联合类型</b>,处理它的成员。不确定该用哪个时问自己:
                  我手上这个类型,是一组属性,还是一份候选名单?
                </p>
                <p>
                  这一组三个都是对联合的每个成员分别求值的,
                  所以 <code>Exclude&lt;A | B | C, B&gt;</code> 得到的是{" "}
                  <code>A | C</code>,而不是把整个联合当成一个整体去比较。
                  第 07 章会给出产生这种行为的那一行定义。
                </p>
              </>
            }
          />
        </Callout>
      </Section>

      {/* ================= §06 拆函数 ================= */}
      <Section
        id="fn"
        index="06"
        title={{
          en: "From functions and promises: Parameters, ReturnType, Awaited",
          zh: "拆函数与 Promise:Parameters / ReturnType / Awaited",
        }}
        desc={{
          en: "The third group reads a type out of a function type: what it takes, what it returns, and what an async result contains. This is most useful when you did not write the type yourself.",
          zh: "第三组从函数类型里读出类型:它收什么、返回什么、异步结果里装的是什么。类型不是你写的时候,这一组最有用。",
        }}
      >
        <CodeBlock
          lang="ts"
          title={{
            en: "Reading types out of a function",
            zh: "从函数身上读出类型",
          }}
          code={S6_FN}
          hl={[8, 12, 15]}
          note={
            <T
              en={
                <>
                  Look at <code>typeof makeOrder</code>. <code>makeOrder</code>{" "}
                  is a <b>value</b>, and <code>ReturnType</code> needs a{" "}
                  <b>type</b>. In a type position, <code>typeof</code> takes the
                  type of a value, which is the bridge between the two. Leaving
                  it out is the most common mistake here, and the last three
                  lines show the exact error. This <code>typeof</code> shares
                  its name with the JavaScript operator but does something
                  different; Chapter 07 covers it.
                </>
              }
              zh={
                <>
                  注意 <code>typeof makeOrder</code>。<code>makeOrder</code>{" "}
                  是一个<b>值</b>,而 <code>ReturnType</code> 需要一个
                  <b>类型</b>。出现在类型位置上的 <code>typeof</code>{" "}
                  会取出一个值的类型,这就是两者之间的桥。
                  忘了写它是这里最常见的错误,最后三行就是那条报错。
                  这个 <code>typeof</code> 和 JavaScript
                  的同名运算符做的不是一件事,第 07 章会讲。
                </>
              }
            />
          }
        />

        <p className="sec-desc">
          <T
            en={
              <>
                When is this useful? When a library exports a function but not
                the type of its result, and when you do not want to give an
                internal function&apos;s result a name of its own. Note that{" "}
                <code>Parameters&lt;T&gt;</code> returns a <b>tuple</b>, not a
                union or an object, so <code>MakeOrderArgs[1]</code> is{" "}
                <code>Size</code> and the tuple can be spread straight into a
                call.
              </>
            }
            zh={
              <>
                什么时候用得上?库导出了函数、却没导出结果类型的时候;
                以及你不想专门给一个内部函数的结果起名字的时候。注意{" "}
                <code>Parameters&lt;T&gt;</code> 返回的是一个<b>元组</b>,
                不是联合也不是对象,所以 <code>MakeOrderArgs[1]</code> 就是{" "}
                <code>Size</code>,这个元组也可以直接展开传进一次调用。
              </>
            }
          />
        </p>

        <CodeBlock
          lang="ts"
          title={{
            en: "Awaited: what an async result contains",
            zh: "Awaited:异步结果里装的是什么",
          }}
          code={S6_AWAITED}
          hl={[8, 11]}
          note={
            <T
              en={
                <>
                  <code>Awaited</code> removes every layer of{" "}
                  <code>Promise</code>, not just one, which matches what a chain
                  of <code>await</code> does at run time. Over a union it is
                  applied to each member, so{" "}
                  <code>Awaited&lt;Promise&lt;string&gt; | number&gt;</code> is{" "}
                  <code>string | number</code>.
                </>
              }
              zh={
                <>
                  <code>Awaited</code> 会拆掉 <code>Promise</code>{" "}
                  的每一层,不只是一层,这和运行时连续 <code>await</code>{" "}
                  的结果一致。作用在联合上时,它对每个成员分别求值,所以{" "}
                  <code>Awaited&lt;Promise&lt;string&gt; | number&gt;</code>{" "}
                  是 <code>string | number</code>。
                </>
              }
            />
          }
        />

        <Callout
          tone="deep"
          title={{
            en: "Also in the set: four string types, and one rare one",
            zh: "顺路认脸:字符串四件套,外加一个冷门的",
          }}
        >
          <T
            en={
              <>
                <p>
                  <code>Uppercase&lt;&quot;large&quot;&gt;</code> is{" "}
                  <code>&quot;LARGE&quot;</code> and{" "}
                  <code>Lowercase</code> goes the other way.{" "}
                  <code>Capitalize&lt;&quot;size&quot;&gt;</code> is{" "}
                  <code>&quot;Size&quot;</code> and{" "}
                  <code>Uncapitalize</code> goes the other way. All four work on
                  string literal types only, and they become genuinely useful
                  together with the template literal types in Chapter 07. For
                  now, just recognise the names.
                </p>
                <p>
                  There is also <code>NoInfer&lt;T&gt;</code>, added in
                  TypeScript 5.4. It marks one parameter position so the
                  compiler does not use it when inferring a type argument. It is
                  rare. Knowing it exists is enough.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  <code>Uppercase&lt;&quot;large&quot;&gt;</code> 得到{" "}
                  <code>&quot;LARGE&quot;</code>,<code>Lowercase</code>{" "}
                  方向相反;<code>Capitalize&lt;&quot;size&quot;&gt;</code>{" "}
                  得到 <code>&quot;Size&quot;</code>,<code>Uncapitalize</code>{" "}
                  方向相反。四个都只作用在字符串字面量类型上,
                  配上第 07 章的模板字面量类型才真正有用。现在先认个脸。
                </p>
                <p>
                  另外还有一个 <code>NoInfer&lt;T&gt;</code>,TypeScript 5.4
                  加进来的。它标记某个参数位置,让编译器在推断类型实参时不使用它。
                  很冷门,知道它存在就够了。
                </p>
              </>
            }
          />
        </Callout>
      </Section>

      {/* ================= §07 组合 ================= */}
      <Section
        id="combo"
        index="07"
        title={{
          en: "Compose them: a type out is a type in",
          zh: "组合:出来的类型可以再进下一个",
        }}
        desc={{
          en: "Every utility type takes a type and returns a type, so the result of one can be the argument of the next. Most real project types are built this way.",
          zh: "每个工具类型都是「进一个类型、出一个类型」,所以一个的结果可以当下一个的实参。真实项目里的类型大多是这样搭出来的。",
        }}
      >
        <CodeBlock
          lang="ts"
          title={{
            en: "Three real variants from the tea shop",
            zh: "奶茶店的三个真实变体",
          }}
          code={S7_COMBO}
          hl={[2, 6, 9]}
          note={
            <T
              en={
                <>
                  Read these from the inside out. Line 2 first picks two
                  properties, then makes both optional. Line 9 first removes two
                  members from the status union, then uses what is left as the
                  key set of a <code>Record</code>.
                </>
              }
              zh={
                <>
                  从里往外读。第 2 行先挑出两个属性,再把两者都变成可选。
                  第 9 行先从状态联合里去掉两个成员,
                  再把剩下的当成 <code>Record</code> 的键集合。
                </>
              }
            />
          }
        />

        <p className="sec-desc">
          <T
            en={
              <>
                Does the order matter? Sometimes. Two tools that work on the
                same level often commute, and two tools that work on different
                levels usually do not. Rather than memorising rules, check the
                result by hovering the alias:
              </>
            }
            zh={
              <>
                顺序有影响吗?有时有。作用在同一层级上的两个工具,
                换顺序往往结果相同;作用在不同层级上的两个,通常就不同。
                与其背规则,不如悬停在类型别名上直接看结果:
              </>
            }
          />
        </p>

        <CodeBlock
          lang="ts"
          title={{
            en: "When the order matters, and when it does not",
            zh: "什么时候顺序有影响,什么时候没有",
          }}
          code={S7_ORDER}
          hl={[7, 11]}
          note={
            <T
              en={
                <>
                  <code>Partial</code> and <code>Pick</code> both act on the
                  properties of the same object, so swapping them changes
                  nothing. <code>Partial&lt;Record&lt;…&gt;&gt;</code> makes the
                  keys optional, while{" "}
                  <code>Record&lt;…, Partial&lt;…&gt;&gt;</code> keeps all keys
                  required and makes each value incomplete. Those are two
                  different types, and the last error shows it.
                </>
              }
              zh={
                <>
                  <code>Partial</code> 和 <code>Pick</code>{" "}
                  作用在同一个对象的属性上,换顺序没有区别。
                  <code>Partial&lt;Record&lt;…&gt;&gt;</code> 让键变成可选,而{" "}
                  <code>Record&lt;…, Partial&lt;…&gt;&gt;</code>{" "}
                  保持所有键必填、让每个值可以不完整 ——
                  这是两个不同的类型,最后那条报错就是证据。
                </>
              }
            />
          }
        />

        <Callout
          tone="warn"
          title={{
            en: "Three common mistakes",
            zh: "三个高频误区",
          }}
        >
          <T
            en={
              <>
                <p>
                  <b>One: a utility type never changes its input.</b> However
                  deeply you nest them, <code>Order</code> is still{" "}
                  <code>Order</code>. Each step produces a new type.
                </p>
                <p>
                  <b>
                    Two: <code>Partial</code>, <code>Required</code> and{" "}
                    <code>Readonly</code> are shallow.
                  </b>{" "}
                  Nested property types are untouched, and{" "}
                  <code>Readonly</code> blocks assignment to the property rather
                  than mutation of the object it points at. §03 covers this.
                </p>
                <p>
                  <b>
                    Three: a misspelled key in <code>Omit</code> is not an
                    error.
                  </b>{" "}
                  When you are removing a property for safety, check the
                  spelling, or use a <code>Pick</code> allow-list so the
                  compiler checks it for you.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  <b>一,工具类型从不改动输入。</b>套多少层,<code>Order</code>{" "}
                  还是那个 <code>Order</code>,每一步都只是产出一个新类型。
                </p>
                <p>
                  <b>
                    二,<code>Partial</code>、<code>Required</code>、
                    <code>Readonly</code> 都是浅的。
                  </b>
                  嵌套的属性类型不受影响;<code>Readonly</code>{" "}
                  阻止的是给属性赋值,而不是修改属性指向的那个对象。§03 讲过。
                </p>
                <p>
                  <b>
                    三,<code>Omit</code> 的键拼错不报错。
                  </b>
                  为了安全去掉一个属性时,把拼写再核对一遍;
                  或者用 <code>Pick</code> 白名单,让编译器替你核对。
                </p>
              </>
            }
          />
        </Callout>

        <Callout
          tone="story"
          title={{
            en: "Next chapter: how these are built",
            zh: "预告:下一章,拆开看",
          }}
        >
          <T
            en={
              <p>
                These tools are useful, and none of them is special.{" "}
                <code>Partial</code> is defined in one line of TypeScript, and{" "}
                <code>Exclude</code> is shorter. Chapter 07 takes them apart:
                mapped types, conditional types, <code>keyof</code>,{" "}
                <code>infer</code>. There are only a few parts, and by the end
                you can write every tool from this chapter yourself.
              </p>
            }
            zh={
              <p>
                这套工具很好用,但它们一点都不特殊。<code>Partial</code>{" "}
                的定义只有一行 TypeScript,<code>Exclude</code> 更短。第 07
                章会把它们拆开:映射类型、条件类型、<code>keyof</code>、
                <code>infer</code>。零件就那么几个,拆完之后,
                这一章用过的每一个工具,你都能自己写出来。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §08 动手任务 ================= */}
      <Section
        id="labs"
        index="08"
        title={{ en: "Labs", zh: "动手任务" }}
        desc={{
          en: "Four tasks, all of which run in the TypeScript Playground: compose three Order variants, see Omit accept a misspelled key, compare Record with an index signature, and unwrap nested promises.",
          zh: "四个任务,全在 TypeScript Playground 就能做:组合出三个 Order 变体,看 Omit 接受一个拼错的键,把 Record 和索引签名比一比,再拆开嵌套的 Promise。",
        }}
      >
        <LabSet ch="utility" items={LABS} />
      </Section>

      {/* ================= §09 通关测验 ================= */}
      <Section
        id="quiz"
        index="09"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Nine questions. The two that are missed most often are about shallowness and about the misspelled key in Omit, and both were covered above.",
          zh: "九道题。错得最多的一直是「浅」和「Omit 键拼错」这两处,上面都讲过了。",
        }}
      >
        <Quiz ch="utility" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                A utility type takes a type and returns a new type. The syntax
                looks like a function call with angle brackets, and the input
                type is never modified.
              </>
            ),
            zh: (
              <>
                工具类型接受一个类型,返回一个新类型。写法像用尖括号的函数调用,
                输入的类型永远不会被改动。
              </>
            ),
          },
          {
            en: (
              <>
                Change the shape: <code>Partial</code> adds <code>?</code>,{" "}
                <code>Required</code> removes it along with{" "}
                <code>undefined</code>, and <code>Readonly</code> blocks
                assignment to each property. All three are{" "}
                <b>shallow</b> and only touch the top level.
              </>
            ),
            zh: (
              <>
                改形状:<code>Partial</code> 加上 <code>?</code>,
                <code>Required</code> 把 <code>?</code> 和{" "}
                <code>undefined</code> 一起去掉,<code>Readonly</code>{" "}
                阻止给每个属性赋值。三者都是<b>浅</b>的,只处理最外层。
              </>
            ),
          },
          {
            en: (
              <>
                Choose properties: <code>Pick</code> is an allow-list,{" "}
                <code>Omit</code> is a block-list, and{" "}
                <code>Record&lt;K, V&gt;</code> builds an object type and
                requires every key when <code>K</code> is a finite union. Only{" "}
                <code>Pick</code> checks its keys.
              </>
            ),
            zh: (
              <>
                挑属性:<code>Pick</code> 是白名单,<code>Omit</code> 是黑名单,
                <code>Record&lt;K, V&gt;</code> 现造一个对象类型 —— 当{" "}
                <code>K</code> 是有限联合时,它要求每个键都在。
                只有 <code>Pick</code> 会检查键。
              </>
            ),
          },
          {
            en: (
              <>
                Filter unions: <code>Exclude</code> removes matching members,{" "}
                <code>Extract</code> keeps them, and <code>NonNullable</code>{" "}
                removes <code>null</code> and <code>undefined</code>. These work
                on members, not on properties.
              </>
            ),
            zh: (
              <>
                筛联合:<code>Exclude</code> 去掉匹配的成员,
                <code>Extract</code> 只留下它们,<code>NonNullable</code> 清掉{" "}
                <code>null</code> 和 <code>undefined</code>。
                这一组作用在成员上,不是属性上。
              </>
            ),
          },
          {
            en: (
              <>
                From functions: <code>Parameters</code> gives a tuple and{" "}
                <code>ReturnType</code> gives the return type. Both need{" "}
                <code>typeof fn</code>, not <code>fn</code>.{" "}
                <code>Awaited</code> removes every layer of{" "}
                <code>Promise</code>.
              </>
            ),
            zh: (
              <>
                拆函数:<code>Parameters</code> 给出一个元组,
                <code>ReturnType</code> 给出返回值类型,两者都要写{" "}
                <code>typeof fn</code>,不能写 <code>fn</code>。
                <code>Awaited</code> 会拆掉 <code>Promise</code> 的每一层。
              </>
            ),
          },
          {
            en: (
              <>
                They compose, and you read the result from the inside out. What
                is missing here (a deep <code>Readonly</code>, a strict{" "}
                <code>Omit</code>) you build yourself in Chapter 07.
              </>
            ),
            zh: (
              <>
                它们可以组合,结果从里往外读。这里缺的东西(深{" "}
                <code>Readonly</code>、严格版 <code>Omit</code>),
                第 07 章你自己就能造出来。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="utility" />
    </main>
  );
}
