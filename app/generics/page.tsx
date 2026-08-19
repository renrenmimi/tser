"use client";

// 第 05 章 · 泛型(双语:正文用 <T en zh />,组件 props 用 { en, zh })——
// 三份重复函数的痛 → 留一个洞(类型参数)→ 推断与显式 →
// 约束 extends(不是继承)→ 泛型接口 / 泛型类 / 默认类型参数 →
// 类型擦除与常见误区 → 动手任务 → 测验 → 要点。
//
// 代码示例:可执行行在两种语言里逐字节相同,只有注释分 en / zh;
// 因此 hl 行号在两种语言下一致。编译器报错原文一律不翻译。
// 所有报错文案、报错码与推断结果均在 TypeScript 5.9 + strict 下实测过。

import "./chapter.css";

import { Hero, Section, Callout, KeyPoints, ChapterFooter } from "@/lib/kit";
import { CodeBlock, CodePair } from "@/lib/code";
import { LabSet } from "@/lib/labs";
import { Quiz } from "@/lib/quiz";
import { T, type Loc } from "@/lib/i18n";
import { LABS, QUIZ } from "@/lib/generics-data";
import { HeroMold, HoleFiller, ConstraintGate } from "./viz";

/* ---------- §01 先痛一下 ---------- */

const S1_DUP: Loc<string> = {
  en: `function firstString(arr: string[]): string | undefined {
  return arr[0];
}
function firstNumber(arr: number[]): number | undefined {
  return arr[0];
}
function firstOrder(arr: Order[]): Order | undefined {
  return arr[0];
}
// The three bodies are identical, character for character.
// A fourth array type means a fourth copy.`,
  zh: `function firstString(arr: string[]): string | undefined {
  return arr[0];
}
function firstNumber(arr: number[]): number | undefined {
  return arr[0];
}
function firstOrder(arr: Order[]): Order | undefined {
  return arr[0];
}
// 三个函数体一模一样,一个字都不差。
// 再来一种数组类型,就得再抄一份。`,
};

const S1_ANY: Loc<string> = {
  en: `function first(arr: any[]): any {
  return arr[0];
}

const x = first(["boba", "coconut jelly"]);
// x is any. A string went in, but the type did not come out.
x.toFixed(2);
// Nothing is reported here. The call fails when the program runs.`,
  zh: `function first(arr: any[]): any {
  return arr[0];
}

const x = first(["boba", "coconut jelly"]);
// x 是 any。进去的是 string,类型却没跟着出来。
x.toFixed(2);
// 这里什么都不报。等程序跑起来,这次调用才失败。`,
};

const S1_GEN: Loc<string> = {
  en: `function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const x = first(["boba", "coconut jelly"]);
// x is string | undefined. The type came out with the value.
x.toFixed(2);
// 'x' is possibly 'undefined'.
// Property 'toFixed' does not exist on type 'string'. Did you mean 'fixed'?`,
  zh: `function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const x = first(["boba", "coconut jelly"]);
// x 是 string | undefined。类型跟着值一起出来了。
x.toFixed(2);
// 'x' is possibly 'undefined'.
// Property 'toFixed' does not exist on type 'string'. Did you mean 'fixed'?`,
};

/* ---------- §02 留一个洞 ---------- */

const S2_PAIR: Loc<string> = {
  en: `function pair<T>(a: T, b: T): T[] {
  return [a, b];
}

pair("small", "large"); // ok, T = string
pair("small", 42);
// Argument of type 'number' is not assignable
// to parameter of type 'string'.`,
  zh: `function pair<T>(a: T, b: T): T[] {
  return [a, b];
}

pair("small", "large"); // ✓ T = string
pair("small", 42);
// Argument of type 'number' is not assignable
// to parameter of type 'string'.`,
};

/* ---------- §03 推断与显式 ---------- */

const S3_CALLS: Loc<string> = {
  en: `// 1. Let the compiler infer. This is the normal case.
const a = first(["boba", "coconut jelly"]);
// T = string, so a is string | undefined.

// 2. Write the type argument yourself.
const b = first<string>(["boba", "coconut jelly"]);
// Same result. The angle brackets add nothing here.

// 3. The array is empty, so there is nothing to read a type from.
const c = first([]);         // T = never, so c is undefined
const d = first<string>([]); // T = string, so d is string | undefined`,
  zh: `// ① 交给编译器推断。这是常态。
const a = first(["boba", "coconut jelly"]);
// T = string,所以 a 是 string | undefined。

// ② 自己写出类型实参。
const b = first<string>(["boba", "coconut jelly"]);
// 结果一样。这里的尖括号没带来任何新信息。

// ③ 数组是空的,没有任何东西可以拿来推类型。
const c = first([]);         // T = never,所以 c 是 undefined
const d = first<string>([]); // T = string,所以 d 是 string | undefined`,
};

const S3_RETURN_ONLY: Loc<string> = {
  en: `// T appears only in the return type. No parameter mentions T,
// so a call gives the compiler nothing to infer from.
function parseJson<T>(text: string): T {
  return JSON.parse(text);
}

const o1 = parseJson('{"total": 25}');
// T falls back to unknown, so o1 is unknown.
o1.total;
// 'o1' is of type 'unknown'.

const o2 = parseJson<{ total: number }>('{"total": 25}');
// o2 is { total: number }. Here the type argument is required.`,
  zh: `// T 只出现在返回值类型里。没有任何参数提到 T,
// 所以调用时编译器没有可以拿来推断的原料。
function parseJson<T>(text: string): T {
  return JSON.parse(text);
}

const o1 = parseJson('{"total": 25}');
// T 回落成 unknown,于是 o1 是 unknown。
o1.total;
// 'o1' is of type 'unknown'.

const o2 = parseJson<{ total: number }>('{"total": 25}');
// o2 是 { total: number }。这里的类型实参非写不可。`,
};

/* ---------- §04 约束 ---------- */

const S4_LONGEST: Loc<string> = {
  en: `// The goal: return whichever value is longer.
// With no constraint, T could be any type at all, so .length is refused.
function longestBroken<T>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
  // Property 'length' does not exist on type 'T'.
}

function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b; // allowed: every T has length
}

longest("Boba milk tea", "Four Seasons tea"); // T = string
longest([1, 2, 3], [4, 5]);                   // T = number[]
longest({ length: 3 }, { length: 7 });        // T = { length: number }
longest(10, 100);
// Argument of type 'number' is not assignable
// to parameter of type '{ length: number; }'.`,
  zh: `// 目标:返回两个值里更长的那个。
// 不加约束,T 可以是任何类型,所以 .length 被拒绝。
function longestBroken<T>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
  // Property 'length' does not exist on type 'T'.
}

function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b; // 通过:每个 T 都有 length
}

longest("Boba milk tea", "Four Seasons tea"); // T = string
longest([1, 2, 3], [4, 5]);                   // T = number[]
longest({ length: 3 }, { length: 7 });        // T = { length: number }
longest(10, 100);
// Argument of type 'number' is not assignable
// to parameter of type '{ length: number; }'.`,
};

const S4_GETPROP: Loc<string> = {
  en: `function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const order = { item: "Boba milk tea", price: 18 };

getProp(order, "topping");
// Argument of type '"topping"' is not assignable
// to parameter of type '"item" | "price"'.

const p = getProp(order, "price"); // p is number
const i = getProp(order, "item");  // i is string`,
  zh: `function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const order = { item: "Boba milk tea", price: 18 };

getProp(order, "topping");
// Argument of type '"topping"' is not assignable
// to parameter of type '"item" | "price"'.

const p = getProp(order, "price"); // p 是 number
const i = getProp(order, "item");  // i 是 string`,
};

/* ---------- §05 泛型容器 ---------- */

const S5_CONTAINERS: Loc<string> = {
  en: `type Size = "small" | "medium" | "large";
type Order = { id: number; item: string; size: Size };
type MenuItem = { name: string; price: number };

// A response envelope: code and msg are fixed, data changes.
type ApiResponse<T> = { code: number; msg: string; data: T };

// A page of results: the caller decides what the list holds.
type Paginated<T> = {
  list: T[];
  page: number;
  total: number;
};

type OrderPage = Paginated<Order>;      // a page of orders
type MenuRes = ApiResponse<MenuItem[]>; // the menu endpoint's response

const page1: OrderPage = {
  list: [{ id: 1, item: "Boba milk tea", size: "large" }],
  page: 1,
  total: 42,
};

type Wrong = Paginated;
// Generic type 'Paginated' requires 1 type argument(s).`,
  zh: `type Size = "small" | "medium" | "large";
type Order = { id: number; item: string; size: Size };
type MenuItem = { name: string; price: number };

// 接口的统一信封:code 和 msg 固定,data 百变。
type ApiResponse<T> = { code: number; msg: string; data: T };

// 一页结果:list 里装什么,由调用方决定。
type Paginated<T> = {
  list: T[];
  page: number;
  total: number;
};

type OrderPage = Paginated<Order>;      // 一页订单
type MenuRes = ApiResponse<MenuItem[]>; // 菜单接口的响应

const page1: OrderPage = {
  list: [{ id: 1, item: "Boba milk tea", size: "large" }],
  page: 1,
  total: 42,
};

type Wrong = Paginated;
// Generic type 'Paginated' requires 1 type argument(s).`,
};

const S5_CLASS: Loc<string> = {
  en: `// A generic class. T is chosen once, when the instance is created,
// and every member of that instance then uses the same T.
class Basket<T> {
  private items: T[] = [];
  add(item: T): void { this.items.push(item); }
  all(): T[] { return this.items; }
}

const b = new Basket<string>();
b.add("boba"); // ok
b.add(42);
// Argument of type 'number' is not assignable to parameter of type 'string'.

// A generic method on a plain class. U is chosen once per call,
// so two calls on the same instance can use different types.
class Counter {
  countOf<U>(items: U[], match: (v: U) => boolean): number {
    return items.filter(match).length;
  }
}

const c = new Counter();
c.countOf([1, 2, 3], (v) => v > 1);      // U = number
c.countOf(["a", "b"], (v) => v === "a"); // U = string`,
  zh: `// 泛型类。T 在创建实例的那一刻定下来,
// 之后这个实例的每个成员用的都是同一个 T。
class Basket<T> {
  private items: T[] = [];
  add(item: T): void { this.items.push(item); }
  all(): T[] { return this.items; }
}

const b = new Basket<string>();
b.add("boba"); // ✓
b.add(42);
// Argument of type 'number' is not assignable to parameter of type 'string'.

// 普通类上的泛型方法。U 每次调用各定一次,
// 所以同一个实例上的两次调用可以用不同的类型。
class Counter {
  countOf<U>(items: U[], match: (v: U) => boolean): number {
    return items.filter(match).length;
  }
}

const c = new Counter();
c.countOf([1, 2, 3], (v) => v > 1);      // U = number
c.countOf(["a", "b"], (v) => v === "a"); // U = string`,
};

const S5_DEFAULT: Loc<string> = {
  en: `// A default type argument, used when none is written and none is inferred.
type Labeled<T = string> = { label: string; value: T };

const size: Labeled = { label: "size", value: "large" };
// No type argument, so T is string.

const stock: Labeled<number> = { label: "stock", value: 42 };
// T = number.

// A constraint says what T may be. A default says what T is
// when nothing is supplied. They are separate, and can be combined.
type Sized<T extends string = "small"> = { v: T };

const s1: Sized = { v: "small" };          // T = "small"
const s2: Sized<"large"> = { v: "large" }; // T = "large"`,
  zh: `// 默认类型实参:既没写、也推不出来的时候才用上它。
type Labeled<T = string> = { label: string; value: T };

const size: Labeled = { label: "size", value: "large" };
// 没写类型实参,所以 T 是 string。

const stock: Labeled<number> = { label: "stock", value: 42 };
// T = number。

// 约束规定 T 可以是什么;默认值规定不给类型实参时 T 是什么。
// 两者互不相干,也可以同时出现。
type Sized<T extends string = "small"> = { v: T };

const s1: Sized = { v: "small" };          // T = "small"
const s2: Sized<"large"> = { v: "large" }; // T = "large"`,
};

/* ---------- §06 擦除 ---------- */

const S6_TS: Loc<string> = {
  en: `function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const x = first<string>(["boba"]);`,
  zh: `function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const x = first<string>(["boba"]);`,
};

const S6_JS: Loc<string> = {
  en: `function first(arr) {
  return arr[0];
}

const x = first(["boba"]);`,
  zh: `function first(arr) {
  return arr[0];
}

const x = first(["boba"]);`,
};

const S6_TSX: Loc<string> = {
  en: `// In a .tsx file, <T> at the start of an arrow function
// is read as the opening tag of a JSX element.
const id = <T>(x: T) => x;
// JSX element 'T' has no corresponding closing tag.
// Unexpected token. Did you mean \`{'>'}\` or \`&gt;\`?

// A trailing comma removes the ambiguity.
const ok = <T,>(x: T) => x;

// So does a constraint, because <T extends ...> cannot be a tag.
const ok2 = <T extends unknown>(x: T) => x;

// A function declaration never has this problem, in any file.
function ok3<T>(x: T) { return x; }`,
  zh: `// 在 .tsx 文件里,箭头函数开头的 <T>
// 会被当成一个 JSX 元素的开标签。
const id = <T>(x: T) => x;
// JSX element 'T' has no corresponding closing tag.
// Unexpected token. Did you mean \`{'>'}\` or \`&gt;\`?

// 补一个逗号就消除了歧义。
const ok = <T,>(x: T) => x;

// 写约束也行,因为 <T extends ...> 不可能是标签。
const ok2 = <T extends unknown>(x: T) => x;

// 函数声明在任何文件里都没有这个问题。
function ok3<T>(x: T) { return x; }`,
};

export default function GenericsPage() {
  return (
    <main className="page" data-ch="generics">
      <Hero
        ch="generics"
        title={{
          en: (
            <>
              Generics: one function, <span className="grad">many types</span>
            </>
          ),
          zh: (
            <>
              泛型:留个洞的<span className="grad">模具</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              Do not commit to a type yet. Write a placeholder,{" "}
              <code>&lt;T&gt;</code>, and let the call site decide what it
              stands for. Every <code>T</code> in one signature is the same{" "}
              <code>T</code>, so the type of the result stays tied to the type
              of the input.
            </>
          ),
          zh: (
            <>
              先别急着说是什么类型 —— 留一个洞 <code>&lt;T&gt;</code>,
              调用的人来填。同一个签名里的每个 <code>T</code>{" "}
              都是同一个,所以返回值的类型始终和参数的类型绑在一起。
            </>
          ),
        }}
        chips={[
          { id: "pain", n: "01", label: { en: "The problem", zh: "先痛一下" } },
          {
            id: "hole",
            n: "02",
            label: { en: "Leave a hole", zh: "留一个洞" },
          },
          {
            id: "infer",
            n: "03",
            label: { en: "Inference", zh: "推断与显式" },
          },
          {
            id: "constraint",
            n: "04",
            label: { en: "Constraints", zh: "约束 extends" },
          },
          {
            id: "containers",
            n: "05",
            label: { en: "Containers", zh: "泛型容器" },
          },
          { id: "erased", n: "06", label: { en: "Erasure", zh: "擦除与误区" } },
          { id: "labs", n: "07", label: { en: "Labs", zh: "动手" } },
          { id: "quiz", n: "08", label: { en: "Quiz", zh: "测验" } },
        ]}
      >
        <HeroMold />
      </Hero>

      {/* ================= §01 先痛一下 ================= */}
      <Section
        id="pain"
        index="01"
        title={{
          en: "The problem: three bad versions of one small function",
          zh: "先痛一下:一个 first 函数的三种坏写法",
        }}
        desc={{
          en: "The task is as small as it gets: return the first element of an array. Without generics there is no good way to write it once.",
          zh: "需求小得不能再小:取数组第一个元素。没有泛型,这件事就是写不体面。",
        }}
      >
        <Callout
          tone="story"
          title={{
            en: "One action, three different arrays",
            zh: "同一个动作,三种不同的数组",
          }}
        >
          <p>
            <T
              en={
                <>
                  A small shop&apos;s ordering system needs the first order in a
                  list, the first item on a menu, and the first order in a
                  history. It is the same action three times, over three
                  different array types. Without generics you have three ways to
                  write it, and <b>all three are unsatisfying</b>.
                </>
              }
              zh={
                <>
                  一个小店的点单系统要「取订单列表的第一单」
                  「取菜单的第一项」「取杯型选项的第一个」——
                  同一个动作做三遍,面对三种不同的数组类型。
                  用现有的写法,你有三条路,<b>三条都不体面</b>。
                </>
              }
            />
          </p>
        </Callout>

        <CodeBlock
          lang="ts"
          title={{
            en: "Option 1 · one copy per type",
            zh: "路线一 · 每种类型抄一份",
          }}
          code={S1_DUP}
        />

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title={{
                en: "Option 2 · any, and the type is gone",
                zh: "路线二 · 用 any,类型丢在门口",
              }}
              hl={[5, 7]}
              code={S1_ANY}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title={{
                en: "Option 3 · a generic, and the type stays",
                zh: "路线三 · 泛型,类型不丢",
              }}
              hl={[1, 5]}
              code={S1_GEN}
            />
          }
        />

        <p className="sec-desc">
          <T
            en={
              <>
                Look at the right-hand version. One function handles every array
                type, and the input and the output stay <b>linked</b>: give it a{" "}
                <code>string[]</code> and you get back something built from{" "}
                <code>string</code>; give it an <code>Order[]</code> and you get
                back something built from <code>Order</code>. That link is what
                the middle version threw away. The next section slows a single
                call down to show how it is made.
              </>
            }
            zh={
              <>
                看右边这版:一份代码通吃所有数组,而且输入和输出是
                <b>连着的</b> —— 喂它 <code>string[]</code>,拿回来的东西和{" "}
                <code>string</code> 有关;喂它 <code>Order[]</code>, 拿回来的就和{" "}
                <code>Order</code> 有关。
                中间那一版丢掉的正是这条联系。下一节把一次调用放慢,
                看它是怎么建立起来的。
              </>
            }
          />
        </p>
      </Section>

      {/* ================= §02 留一个洞 ================= */}
      <Section
        id="hole"
        index="02"
        title={{
          en: "Leave a hole: what <T> actually does",
          zh: "留一个洞:<T> 是怎么工作的",
        }}
        desc={{
          en: "T is a placeholder for a type. It is filled in at the call site, not where the function is written. Because one signature reuses the same placeholder, the compiler can keep the input and the output in step.",
          zh: "T 是一个类型的占位符。它在调用处才被填上,而不是在写函数的地方。同一个签名反复用同一个占位符,编译器才有办法让输入和输出一起变。",
        }}
      >
        <HoleFiller />

        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">
              <T en="Declare it" zh="声明洞" />
            </div>
            <div className="card-title">&lt;T&gt;</div>
            <p>
              <T
                en={
                  <>
                    The angle brackets after the function name declare one
                    placeholder and give it the name <code>T</code>. It is
                    called a <b>type parameter</b>: a parameter like any other,
                    except that it holds a type instead of a value.
                  </>
                }
                zh={
                  <>
                    函数名后面的尖括号声明了一个占位符,并给它取名 <code>T</code>
                    。它叫<b>类型参数</b>:
                    和普通参数一样是参数,只不过里面装的是类型,不是值。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Use it" zh="用洞" />
            </div>
            <div className="card-title">arr: T[] → T</div>
            <p>
              <T
                en={
                  <>
                    Every <code>T</code> in the signature refers to that one
                    placeholder. That is the promise:{" "}
                    <b>what the array holds and what comes back are the same</b>
                    . <code>any</code> cannot state this.
                  </>
                }
                zh={
                  <>
                    签名里每个 <code>T</code> 指的都是那一个占位符。
                    这就是它的承诺:<b>数组里装的和返回的是同一种类型</b>。
                    <code>any</code> 说不出这句话。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Fill it" zh="填洞" />
            </div>
            <div className="card-title">
              <T en="at the call site" zh="调用时才发生" />
            </div>
            <p>
              <T
                en={
                  <>
                    Whoever writes the function does not know what{" "}
                    <code>T</code> will be, and does not need to. Each call
                    supplies its own arguments, and the compiler works out{" "}
                    <code>T</code> for that call alone.
                  </>
                }
                zh={
                  <>
                    写这个函数的人不知道 <code>T</code> 会是什么,也不需要知道。
                    每次调用各自带着实参过来,编译器就为这一次调用单独解出{" "}
                    <code>T</code>。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <CodeBlock
          lang="ts"
          title={{
            en: "pair.ts · one placeholder means one type",
            zh: "pair.ts · 同一个洞,只能是同一种",
          }}
          hl={[6]}
          code={S2_PAIR}
        />
        <p className="sec-desc">
          <T
            en={
              <>
                The compiler reads <code>T = string</code> from the first
                argument, then checks the second against it. If you want two
                independent types, declare two placeholders:{" "}
                <code>{"pair<A, B>(a: A, b: B)"}</code>. There is a lab for
                that.
              </>
            }
            zh={
              <>
                编译器从第一个实参读出 <code>T = string</code>,
                再拿第二个实参去对。想让两个位置各是各的类型,
                那就声明两个占位符:<code>{"pair<A, B>(a: A, b: B)"}</code> ——
                动手任务里有一题练这个。
              </>
            }
          />
        </p>

        <Callout
          tone="idea"
          title={{
            en: "The name T is only a convention",
            zh: "T 这个名字只是惯例",
          }}
        >
          <p>
            <T
              en={
                <>
                  <code>T</code> stands for Type. You can call it{" "}
                  <code>Item</code> or <code>Row</code> instead, exactly as a
                  value parameter can be called <code>x</code> or{" "}
                  <code>count</code>. Other common short names are{" "}
                  <code>K</code> and <code>V</code> for a key and a value, and{" "}
                  <code>E</code> for an element. The names are short because the
                  placeholder often really could be anything. When it does mean
                  something specific, use a real name:{" "}
                  <code>{"Paginated<Order>"}</code> reads better than{" "}
                  <code>{"Paginated<T>"}</code> at a use site.
                </>
              }
              zh={
                <>
                  <code>T</code> 取自 Type。你也可以叫它 <code>Item</code>、
                  <code>Row</code>,就像普通参数可以叫 <code>x</code> 也可以叫{" "}
                  <code>count</code>。常见的还有 <code>K</code> / <code>V</code>
                  (键和值)、<code>E</code>(元素)。名字短,是因为这个占位符
                  常常真的什么都可能是。一旦它有明确含义,就该起个真名: 使用处写{" "}
                  <code>{"Paginated<Order>"}</code> 比{" "}
                  <code>{"Paginated<T>"}</code> 好读。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 推断与显式 ================= */}
      <Section
        id="infer"
        index="03"
        title={{
          en: "Filling the hole: inference first, explicit when needed",
          zh: "填洞的两种姿势:先靠推断,不行才点名",
        }}
        desc={{
          en: "Most of the time you never see T being filled in. The compiler reads it from the arguments. Writing the type argument by hand is the exception, and it is worth knowing when it is required.",
          zh: "大多数时候你根本看不到 T 被填上 —— 编译器从实参里读出来。手写类型实参是例外,值得知道什么时候非写不可。",
        }}
      >
        <CodeBlock
          lang="ts"
          title={{
            en: "calls.ts · the same function, three calls",
            zh: "calls.ts · 同一个函数,三种调法",
          }}
          hl={[2, 10, 11]}
          code={S3_CALLS}
          note={{
            en: (
              <>
                Inference reads the <b>arguments</b>. That is its only source.
                An empty array carries no element type, so <code>T</code> is
                inferred as <code>never</code> and the result is{" "}
                <code>undefined</code>. This is not an error, but it is rarely
                what you wanted. Seeing <code>never</code> where you did not
                expect it is a good signal to write the type argument.
              </>
            ),
            zh: (
              <>
                推断的原料只有一个来源:<b>实参</b>。空数组带不出元素类型, 于是{" "}
                <code>T</code> 被推成 <code>never</code>,结果是{" "}
                <code>undefined</code>。这不是报错,但通常不是你要的。
                在意料之外的地方看到 <code>never</code>,
                就该想到去把类型实参写出来。
              </>
            ),
          }}
        />

        <Callout
          tone="deep"
          title={{
            en: "When there is nothing at all to infer from",
            zh: "当实参里根本没有可推的东西",
          }}
        >
          <p>
            <T
              en={
                <>
                  An empty array is still an argument, so the compiler has{" "}
                  <i>something</i> to work with. The harder case is a type
                  parameter that appears only in the <b>return type</b>. Then no
                  argument mentions it, and the compiler falls back to{" "}
                  <code>unknown</code>.
                </>
              }
              zh={
                <>
                  空数组好歹还是个实参,编译器手里<i>有东西</i>。
                  更极端的情况是:类型参数只出现在<b>返回值类型</b>里。
                  这时没有任何实参提到它,编译器就回落到 <code>unknown</code>。
                </>
              }
            />
          </p>
          <CodeBlock
            lang="ts"
            title={{
              en: "A type parameter with no inference site",
              zh: "无处可推的类型参数",
            }}
            hl={[3, 12]}
            code={S3_RETURN_ONLY}
          />
          <p>
            <T
              en={
                <>
                  This shape is common in code that parses or fetches data. Be
                  careful with it: <code>parseJson</code> promises to return a{" "}
                  <code>T</code>, but nothing checks that the parsed text
                  actually has that shape. The type argument is an assertion by
                  the caller, not a guarantee by the compiler. Chapter 03 covers
                  how to check such a value before trusting it.
                </>
              }
              zh={
                <>
                  这种写法在解析数据、请求数据的代码里很常见,但要小心:
                  <code>parseJson</code> 承诺返回一个 <code>T</code>,
                  却没有任何东西检查解析出来的内容真的长成那样。
                  类型实参是调用方的一句断言,不是编译器给的保证。
                  拿到这种值之后怎么检查,是第 03 章的内容。
                </>
              }
            />
          </p>
        </Callout>

        <p className="sec-desc">
          <T
            en={
              <>
                The rule of thumb: <b>let inference do the work</b>. Write the
                type argument only when the arguments cannot supply one (an
                empty array, a parameterless call, a type parameter used only in
                the return type), or when the inferred type is not the one you
                want.
              </>
            }
            zh={
              <>
                经验法则:<b>默认交给推断</b>。
                只有在实参给不出信息时才手写类型实参 ——
                比如空数组、没有参数的调用、类型参数只出现在返回值里 ——
                或者推出来的类型不是你想要的那个。
              </>
            }
          />
        </p>
      </Section>

      {/* ================= §04 约束 extends ================= */}
      <Section
        id="constraint"
        index="04"
        title={{
          en: "Constraints: not every type may fill the hole",
          zh: "约束:这个洞,不是什么都能填",
        }}
        desc={{
          en: "A completely open placeholder has a cost: inside the function you can do almost nothing with it. extends narrows what may be passed in, and in return the body gets to use what is guaranteed.",
          zh: "洞留得太自由是有代价的:函数体里几乎什么都不能对它做。extends 限制了能传进来的类型,函数体也就换到了可以放心使用的保证。",
        }}
      >
        <CodeBlock
          lang="ts"
          title={{
            en: "longest.ts · without a constraint, and with one",
            zh: "longest.ts · 没约束,和有约束",
          }}
          hl={[8]}
          code={S4_LONGEST}
        />

        <Callout
          tone="warn"
          title={{
            en: "extends here does not mean inheritance",
            zh: "这里的 extends 不是继承",
          }}
        >
          <p>
            <T
              en={
                <>
                  <code>{"T extends { length: number }"}</code> reads as:{" "}
                  <b>
                    T may be any type, as long as it is assignable to{" "}
                    {"{ length: number }"}
                  </b>
                  . It does not say that T is a subclass of anything, and no
                  class is involved. The test is the structural test from the
                  previous chapter: does the type have a <code>length</code>{" "}
                  property of type <code>number</code>? <code>string</code>{" "}
                  does. <code>number[]</code> does. An anonymous{" "}
                  <code>{"{ length: 12 }"}</code> does.
                </>
              }
              zh={
                <>
                  <code>{"T extends { length: number }"}</code> 读作:
                  <b>
                    T 可以是任何类型,只要它可以赋值给 {"{ length: number }"}
                  </b>
                  。这句话没有说 T 是谁的子类,整件事和 class
                  没有关系。判定用的就是上一章那套结构化检查: 这个类型有没有一个{" "}
                  <code>number</code> 类型的 <code>length</code> 属性?
                  <code>string</code> 有,
                  <code>number[]</code> 有, 一个无名的{" "}
                  <code>{"{ length: 12 }"}</code> 也有。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  One more thing the constraint does <b>not</b> do: it does not
                  replace T with the constraint.{" "}
                  <code>longest(&quot;a&quot;, &quot;b&quot;)</code> returns{" "}
                  <code>string</code>, not <code>{"{ length: number }"}</code>.
                  The constraint is only a condition on the argument. The
                  placeholder still holds the full type that was passed in.
                </>
              }
              zh={
                <>
                  还有一件事约束<b>不会</b>做:它不会把 T 换成约束本身。
                  <code>
                    longest(&quot;a&quot;, &quot;b&quot;)
                  </code> 返回的是 <code>string</code>,不是{" "}
                  <code>{"{ length: number }"}</code>。
                  约束只是对实参的一个条件,占位符里装的仍然是传进来的完整类型。
                </>
              }
            />
          </p>
        </Callout>

        <ConstraintGate />

        <CodeBlock
          lang="ts"
          title={{
            en: "getProp.ts · keyof and indexed access",
            zh: "getProp.ts · keyof 与索引访问",
          }}
          hl={[1]}
          code={S4_GETPROP}
          note={{
            en: (
              <>
                Two placeholders. <code>T</code> is the object. <code>K</code>{" "}
                is constrained to <code>keyof T</code>, which is the union of
                that object&apos;s key names. The constraint is what makes this
                safe: because <code>K</code> can only be a key that{" "}
                <code>T</code> really has, the indexed access <code>T[K]</code>{" "}
                is always a type that exists, and a wrong key name is rejected
                before the program runs. <code>keyof</code> and{" "}
                <code>T[K]</code> are covered properly in chapter 07.
              </>
            ),
            zh: (
              <>
                两个占位符。<code>T</code> 是那个对象;<code>K</code> 被约束成{" "}
                <code>keyof T</code>,也就是这个对象的键名联合。
                安全性正是这个约束给的:既然 <code>K</code> 只能是 <code>T</code>{" "}
                真有的键,索引访问 <code>T[K]</code>{" "}
                取到的就一定是存在的类型,写错键名也会在程序运行前被拦下。
                <code>keyof</code> 和 <code>T[K]</code> 的完整用法在第 07 章。
              </>
            ),
          }}
        />
      </Section>

      {/* ================= §05 泛型容器 ================= */}
      <Section
        id="containers"
        index="05"
        title={{
          en: "Generic types, interfaces, and classes",
          zh: "泛型类型、接口与类",
        }}
        desc={{
          en: "Functions are not the only place a placeholder can go. type, interface, and class can all take type parameters. Structures with a fixed outer shape and a varying inside are the usual reason to reach for one.",
          zh: "能留洞的不只是函数。type、interface、class 都可以带类型参数。「外壳固定、内容百变」的结构,正是用它的常见理由。",
        }}
      >
        <CodeBlock
          lang="ts"
          title={{
            en: "containers.ts · one shape, many contents",
            zh: "containers.ts · 一个壳子,装遍全店",
          }}
          hl={[6, 9, 24]}
          code={S5_CONTAINERS}
          note={{
            en: (
              <>
                A generic type must be given its type argument wherever it is
                used. <code>Paginated&lt;Order&gt;</code> is a type;{" "}
                <code>Paginated</code> on its own is not.
              </>
            ),
            zh: (
              <>
                带洞的类型,用到哪里就得在哪里填上类型实参。
                <code>Paginated&lt;Order&gt;</code> 是一个类型, 光写{" "}
                <code>Paginated</code> 不是。
              </>
            ),
          }}
        />

        <CodeBlock
          lang="ts"
          title={{
            en: "class.ts · a generic class, and a generic method",
            zh: "class.ts · 泛型类,和泛型方法",
          }}
          hl={[3, 16]}
          code={S5_CLASS}
          note={{
            en: (
              <>
                The difference is <b>when the placeholder is fixed</b>. On a
                generic class it is fixed once per instance, and every member
                shares it, so a <code>Basket&lt;string&gt;</code> only ever
                accepts strings. On a generic method it is fixed once per call,
                so the same <code>Counter</code> instance can count numbers and
                then count strings.
              </>
            ),
            zh: (
              <>
                区别在于<b>占位符什么时候定下来</b>。
                泛型类是每个实例定一次,所有成员共用它,所以一个{" "}
                <code>Basket&lt;string&gt;</code> 从头到尾只收 string。
                泛型方法是每次调用定一次,所以同一个 <code>Counter</code>{" "}
                实例可以先数 number,再数 string。
              </>
            ),
          }}
        />

        <CodeBlock
          lang="ts"
          title={{
            en: "default.ts · a default is not a constraint",
            zh: "default.ts · 默认值不是约束",
          }}
          hl={[2, 12]}
          code={S5_DEFAULT}
          note={{
            en: (
              <>
                <code>{"<T extends string>"}</code> limits which types are
                allowed. <code>{"<T = string>"}</code> supplies a type when none
                is written and none can be inferred. They answer different
                questions, and <code>{'<T extends string = "small">'}</code>{" "}
                uses both at once.
              </>
            ),
            zh: (
              <>
                <code>{"<T extends string>"}</code> 限制哪些类型被允许;
                <code>{"<T = string>"}</code>{" "}
                是在既没写、也推不出来时补一个类型。 两者回答的是不同的问题,
                <code>{'<T extends string = "small">'}</code> 就是同时用上。
              </>
            ),
          }}
        />

        <Callout
          tone="win"
          title={{
            en: "You have been using generics all along",
            zh: "你早就每天在用泛型了",
          }}
        >
          <p>
            <T
              en={
                <>
                  <code>string[]</code> is shorthand for{" "}
                  <code>Array&lt;string&gt;</code>, and <code>Array</code> is a
                  generic interface. <code>Promise&lt;Order&gt;</code> is a
                  value that will be an <code>Order</code> later.{" "}
                  <code>Map&lt;string, number&gt;</code> has two placeholders.
                  Once you can read the brackets, the type signatures in the
                  standard library become readable documentation.
                </>
              }
              zh={
                <>
                  <code>string[]</code> 是 <code>Array&lt;string&gt;</code>{" "}
                  的简写,而 <code>Array</code> 就是一个泛型接口。
                  <code>Promise&lt;Order&gt;</code> 表示「将来会是一个{" "}
                  <code>Order</code>」。<code>Map&lt;string, number&gt;</code>{" "}
                  有两个占位符。读懂了尖括号,
                  标准库的类型签名就变成了可以读的说明书。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  One thing that surprises people: <code>Array&lt;Dog&gt;</code>{" "}
                  is assignable to <code>Array&lt;Animal&gt;</code>, even though
                  that lets you <code>push</code> a non-<code>Dog</code> into
                  the original array. This is a deliberate decision about how
                  the methods of <code>Array</code> are compared, not something
                  generics do in general. Chapter 02 §04 works through it.
                </>
              }
              zh={
                <>
                  有一件事常让人意外:<code>Array&lt;Dog&gt;</code> 可以赋值给{" "}
                  <code>Array&lt;Animal&gt;</code>, 哪怕这样就能往原数组里{" "}
                  <code>push</code> 一个非 <code>Dog</code>。这是关于{" "}
                  <code>Array</code>{" "}
                  的方法如何比较的一个有意为之的决定,不是泛型的通则。 第 02 章
                  §04 讲透了这件事。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 擦除与误区 ================= */}
      <Section
        id="erased"
        index="06"
        title={{
          en: "Generics do not exist at runtime, and three common mistakes",
          zh: "泛型不在运行时,以及三个高频误区",
        }}
        desc={{
          en: "One last calibration: a type parameter is a compile-time thing only. Then three ideas that beginners often get wrong.",
          zh: "最后校准一次:类型参数完全是编译期的东西。再顺手掰直三个新手常见的想岔。",
        }}
      >
        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title={{
                en: "The TypeScript you write",
                zh: "你写的 TypeScript",
              }}
              code={S6_TS}
            />
          }
          right={
            <CodeBlock
              lang="js"
              title={{
                en: "The JavaScript that runs",
                zh: "真正跑起来的 JavaScript",
              }}
              code={S6_JS}
            />
          }
        />

        <p className="sec-desc">
          <T
            en={
              <>
                Type erasure applies to generics like everything else.{" "}
                <code>&lt;T&gt;</code>, <code>&lt;string&gt;</code>, and every
                annotation are removed during compilation. So there is no way to
                ask what <code>T</code> is while the program runs, and no way to
                write <code>new T()</code> or <code>if (T === String)</code>. A
                generic function does not know its type argument while it runs.
                The compiler resolved that argument earlier, while it was
                checking the file. If you need to branch on a type at runtime,
                you need a real check on a <b>value</b>, which is chapter 03.
              </>
            }
            zh={
              <>
                类型擦除对泛型一视同仁:<code>&lt;T&gt;</code>、
                <code>&lt;string&gt;</code>{" "}
                和所有注解,都在编译过程中被去掉。所以程序运行时没法问{" "}
                <code>T</code> 是什么,也写不出 <code>new T()</code> 或{" "}
                <code>if (T === String)</code>。泛型函数并不知道自己的类型实参
                —— 知道的是编译器,而且是在编译之前就知道。
                真要在运行时按类型分支,那得对<b>值</b>做真正的运行时检查, 那是第
                03 章的内容。
              </>
            }
          />
        </p>

        <Callout
          tone="warn"
          title={{
            en: "Mistake 1: a type parameter that is used only once",
            zh: "误区一:类型参数只用了一次",
          }}
        >
          <p>
            <T
              en={
                <>
                  <code>
                    {"function log<T>(x: T): void { console.log(x) }"}
                  </code>{" "}
                  declares <code>T</code> and then mentions it once. It links
                  nothing to anything, so it promises nothing. A useful rule:{" "}
                  <b>a type parameter should appear at least twice</b> — linking
                  two parameters, or linking a parameter to the return type. If
                  it appears once, <code>{"(x: unknown)"}</code> says the same
                  thing more honestly.
                </>
              }
              zh={
                <>
                  <code>
                    {"function log<T>(x: T): void { console.log(x) }"}
                  </code>{" "}
                  声明了 <code>T</code>,然后只提到它一次。
                  它没把任何东西和任何东西联系起来,也就什么都没承诺。
                  一条好用的规矩:<b>类型参数至少要出现两次</b> ——
                  联系两个参数,或者联系参数和返回值。只出现一次的话, 直接写{" "}
                  <code>{"(x: unknown)"}</code> 更诚实。
                </>
              }
            />
          </p>
        </Callout>

        <Callout
          tone="warn"
          title={{
            en: "Mistake 2: thinking a generic is just any",
            zh: "误区二:以为泛型就是 any",
          }}
        >
          <p>
            <T
              en={
                <>
                  <code>any</code> <b>gives up</b> on the type: whatever goes
                  in, what comes out is unchecked. A generic <b>keeps</b> the
                  type: <code>T</code> is resolved to a concrete type at the
                  call, and the input and output stay checked all the way
                  through. The two work in opposite directions. They only look
                  alike because both accept many types.
                </>
              }
              zh={
                <>
                  <code>any</code> 是<b>放弃</b>类型:不管进去的是什么,
                  出来的都不再受检查。泛型是<b>保住</b>类型:
                  <code>T</code> 在调用那一刻被解成一个具体类型,
                  输入和输出全程受检。两者方向相反,
                  看起来像,只是因为它们都「什么类型都收」。
                </>
              }
            />
          </p>
        </Callout>

        <Callout
          tone="warn"
          title={{
            en: "Mistake 3: <T> on an arrow function in a .tsx file",
            zh: "误区三:.tsx 文件里箭头函数的 <T>",
          }}
        >
          <CodeBlock
            lang="ts"
            title={{
              en: "widget.tsx · three ways out",
              zh: "widget.tsx · 三种写法",
            }}
            hl={[3, 8, 11]}
            code={S6_TSX}
          />
          <p>
            <T
              en={
                <>
                  A plain <code>.ts</code> file does not have this problem,
                  because it has no JSX syntax to be confused with. Neither does
                  a <code>function</code> declaration, in any file.
                </>
              }
              zh={
                <>
                  纯 <code>.ts</code> 文件没有这个问题,因为它里面没有 JSX
                  语法可以混淆。<code>function</code>{" "}
                  声明在任何文件里也都没有这个问题。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §07 动手任务 ================= */}
      <Section
        id="labs"
        index="07"
        title={{ en: "Labs", zh: "动手任务" }}
        desc={{
          en: "Four tasks, all of which run in the TypeScript Playground: fold three copies into one generic, build a paginated container, try a constraint, and use two placeholders at once.",
          zh: "四个任务,全在 TypeScript Playground 就能做:把三份重复代码合成一个泛型,写一个分页容器,试一次约束,再用一次两个占位符。",
        }}
      >
        <LabSet ch="generics" items={LABS} />
      </Section>

      {/* ================= §08 通关测验 ================= */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Eight questions. After this chapter, a signature like <T extends X = Y> should read as: a placeholder, with a condition on it, and a value to use when none is given.",
          zh: "八道题。答完这章,再看到 <T extends X = Y> 这种签名,你读到的应该是:一个占位符,带一个条件,外加一个没给时用的默认值。",
        }}
      >
        <Quiz ch="generics" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                A type parameter is a <b>placeholder for a type</b>, filled in
                at the call site. Every <code>T</code> in one signature is the
                same <code>T</code>, which is what keeps the output type tied to
                the input type.
              </>
            ),
            zh: (
              <>
                类型参数是一个<b>类型的占位符</b>,在调用处才被填上。
                同一个签名里的每个 <code>T</code> 都是同一个 ——
                返回值的类型就是这样和参数的类型绑在一起的。
              </>
            ),
          },
          {
            en: (
              <>
                Generics and <code>any</code> point in opposite directions.{" "}
                <code>any</code> drops the type at the door. A generic carries
                it <b>from the input through to the output</b>.
              </>
            ),
            zh: (
              <>
                泛型和 <code>any</code> 方向相反:<code>any</code>{" "}
                把类型丢在门口,泛型把类型<b>从输入一路带到输出</b>。
              </>
            ),
          },
          {
            en: (
              <>
                <b>Inference is the default</b>, and it reads the arguments.
                Write the type argument yourself when the arguments cannot
                supply one — an empty array gives <code>never</code>, and a
                parameter used only in the return type gives{" "}
                <code>unknown</code>.
              </>
            ),
            zh: (
              <>
                <b>推断是默认</b>,它的原料是实参。
                实参给不出信息时才手写类型实参 —— 空数组会得到{" "}
                <code>never</code>,只出现在返回值里的类型参数会得到{" "}
                <code>unknown</code>。
              </>
            ),
          },
          {
            en: (
              <>
                <code>extends</code> in a type parameter list is a{" "}
                <b>constraint, not inheritance</b>: T must be assignable to that
                shape. A default (<code>{"<T = string>"}</code>) is a separate
                thing, and the two can be combined.{" "}
                <code>{"K extends keyof T"}</code> with <code>T[K]</code> is the
                standard way to read a property safely.
              </>
            ),
            zh: (
              <>
                类型参数列表里的 <code>extends</code> 是<b>约束,不是继承</b>: T
                必须可以赋值给那个形状。默认值(
                <code>{"<T = string>"}</code>)是另一回事,两者可以同时用。
                <code>{"K extends keyof T"}</code> 配 <code>T[K]</code>{" "}
                是安全读取属性的标准写法。
              </>
            ),
          },
          {
            en: (
              <>
                Type parameters are <b>erased</b>: after compilation there is no{" "}
                <code>T</code> to inspect, so a generic function does not know
                its type argument at runtime. A generic class fixes its
                placeholder per instance; a generic method fixes it per call.
              </>
            ),
            zh: (
              <>
                类型参数会被<b>擦除</b>:编译之后没有 <code>T</code>{" "}
                可查,泛型函数在运行时并不知道自己的类型实参。
                泛型类的占位符按实例定一次,泛型方法的按调用定一次。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="generics" />
    </main>
  );
}
