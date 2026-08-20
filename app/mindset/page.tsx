"use client";

// 终章 ✦ · 类型思维(双语:正文用 <T en zh />,组件 props 用 { en, zh })——
// 三种写法(注解/as/satisfies)→ 断言的代价与类型系统的不健全 →
// 类型擦除与 unknown 边界 → any 的正确用法 → 类型即文档 → 自己造工具类型 →
// 全书知识地图 → 动手任务 → 总测验 → 结课 → 全书要点。
//
// 代码示例:可执行行在两种语言里逐字节相同,只有注释分 en / zh;
// 因此 hl 行号在两种语言下一致。编译器报错原文一律不翻译。
// 所有报错文案与推断结果均已用 tsc 5.9 核对。

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
import { LABS, QUIZ } from "@/lib/mindset-data";
import { HeroCreed, TrioLab, EraseFlow, RoadMap } from "./viz";

/* ---------- §01 as const ---------- */

const AS_CONST_CODE: Loc<string> = {
  en: `const SIZES = ["small", "medium", "large"] as const;
// type: readonly ["small", "medium", "large"]
// not string[] — nothing was widened

type Size = (typeof SIZES)[number];
// "small" | "medium" | "large"
// typeof and indexed access, from chapter 07, working together:
// the values are written once and the type comes out of them`,
  zh: `const SIZES = ["small", "medium", "large"] as const;
// 类型:readonly ["small", "medium", "large"]
// 不是 string[] —— 一个字都没有被拓宽

type Size = (typeof SIZES)[number];
// "small" | "medium" | "large"
// 第 07 章的 typeof 与索引访问,在这里合起来用:
// 值只写一遍,类型从值里长出来`,
};

/* ---------- §02 断言 ---------- */

const AS_FAIR_CODE: Loc<string> = {
  en: `// You wrote the page. You know #pay is a button.
const btn = document
  .querySelector("#pay") as HTMLButtonElement;
btn.disabled = true;

// A test stub: only the fields the test touches
const stub = {
  id: "T-1", total: 30,
} as Order; // the test reads these two only`,
  zh: `// 页面是你写的,你知道 #pay 就是那个按钮。
const btn = document
  .querySelector("#pay") as HTMLButtonElement;
btn.disabled = true;

// 测试桩:只造测试会用到的字段
const stub = {
  id: "T-1", total: 30,
} as Order; // 这个测试只读这两个字段`,
};

const AS_UNFAIR_CODE: Loc<string> = {
  en: `// You have no idea what the other side sent.
const res = await fetch("/api/order/1");
const order = (await res.json()) as Order;

order.total.toFixed(2);
// compiles: yes
// the day the backend renames the field:
// TypeError: Cannot read properties of undefined`,
  zh: `// 网络那头发来什么,你根本不知道。
const res = await fetch("/api/order/1");
const order = (await res.json()) as Order;

order.total.toFixed(2);
// 编译:通过
// 后端改字段名的那天:
// TypeError: Cannot read properties of undefined`,
};

const UNSOUND_CODE: Loc<string> = {
  en: `// 1. any switches off every check on the values it touches
const raw: any = JSON.parse(input);
raw.total.toFixed(2);          // accepted; may fail at runtime

// 2. an assertion is believed, not verified
const order = raw as Order;    // accepted; nothing was checked

// 3. array types are covariant, so this is accepted
declare const rex: Dog;
declare const cat: Cat;
const dogs: Dog[] = [rex];
const animals: Animal[] = dogs;
animals.push(cat);             // accepted; dogs now holds a Cat

// 4. indexing is not checked unless you ask for it
const names: string[] = [];
const first: string = names[0];
// first has type string, and at runtime it is undefined.
// noUncheckedIndexedAccess (chapter 10) makes it string | undefined`,
  zh: `// 1. any 会关掉它碰到的一切检查
const raw: any = JSON.parse(input);
raw.total.toFixed(2);          // 通过;运行时可能出错

// 2. 断言只是被相信,并没有被验证
const order = raw as Order;    // 通过;什么都没检查

// 3. 数组类型是协变的,所以这一段是合法的
declare const rex: Dog;
declare const cat: Cat;
const dogs: Dog[] = [rex];
const animals: Animal[] = dogs;
animals.push(cat);             // 通过;dogs 里现在装着一只 Cat

// 4. 下标访问默认不做检查
const names: string[] = [];
const first: string = names[0];
// first 的类型是 string,而运行时它是 undefined。
// 开了 noUncheckedIndexedAccess(第 10 章)才是 string | undefined`,
};

/* ---------- §03 边界校验 ---------- */

const IS_ORDER_CODE: Loc<string> = {
  en: `interface Order {
  id: string;
  total: number;
  size: "small" | "medium" | "large";
}

// Return type x is Order: if the check passes, unknown becomes Order here
function isOrder(x: unknown): x is Order {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>; // local assertion, to read fields
  return (
    typeof o.id === "string" &&
    typeof o.total === "number" &&
    (o.size === "small" || o.size === "medium" || o.size === "large")
  );
}

const data: unknown = await res.json(); // start by admitting you do not know
if (isOrder(data)) {
  data.total.toFixed(2); // data is Order here, and it was actually checked
} else {
  throw new Error("Response body is not an Order");
}`,
  zh: `interface Order {
  id: string;
  total: number;
  size: "small" | "medium" | "large";
}

// 返回类型 x is Order:检查通过,unknown 就在这里变成 Order
function isOrder(x: unknown): x is Order {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>; // 局部断言,只为逐字段读取
  return (
    typeof o.id === "string" &&
    typeof o.total === "number" &&
    (o.size === "small" || o.size === "medium" || o.size === "large")
  );
}

const data: unknown = await res.json(); // 先老实承认:不知道它是什么
if (isOrder(data)) {
  data.total.toFixed(2); // 这里 data 是 Order,而且是真检查过的
} else {
  throw new Error("Response body is not an Order");
}`,
};

/* ---------- §04 any ---------- */

const ANY_LEAK_CODE: Loc<string> = {
  en: `// utils.ts
export function parseOrder(raw: any): any {
  return JSON.parse(raw);
}

// three months later, in another file:
const o = parseOrder(raw); // o: any
o.tatol;                   // misspelled, nobody reports it —
// any spread along the call chain into the whole project`,
  zh: `// utils.ts
export function parseOrder(raw: any): any {
  return JSON.parse(raw);
}

// 三个月后,另一个文件里:
const o = parseOrder(raw); // o: any
o.tatol;                   // 拼错了,没人报错 ——
// any 顺着调用链扩散到了整个项目`,
};

const ANY_CONTAINED_CODE: Loc<string> = {
  en: `// utils.ts
export function parseOrder(raw: string): Order {
  // inside, do whatever you need — even a local any:
  const data: unknown = JSON.parse(raw);
  if (!isOrder(data)) throw new Error("Bad order payload");
  return data; // what leaves the function is a checked Order
}

const o = parseOrder(raw); // o: Order`,
  zh: `// utils.ts
export function parseOrder(raw: string): Order {
  // 函数里面怎么写都行,哪怕用一个局部 any:
  const data: unknown = JSON.parse(raw);
  if (!isOrder(data)) throw new Error("Bad order payload");
  return data; // 出函数的是一个已经检查过的 Order
}

const o = parseOrder(raw); // o: Order`,
};

/* ---------- §05 类型即文档 ---------- */

const LOOSE_ORDER_CODE: Loc<string> = {
  en: `interface Order {
  status: string;      // a typo here is not an error
  paidAt?: Date;
  deliveredAt?: Date;
  cancelReason?: string;
}

// All of these impossible orders type check:
// delivered, but never paid:
//   { status: "delivered" }
// canceled, and delivered anyway:
//   { status: "canceled",
//     deliveredAt: yesterday }`,
  zh: `interface Order {
  status: string;      // 这里拼错了也不算错误
  paidAt?: Date;
  deliveredAt?: Date;
  cancelReason?: string;
}

// 下面这些不可能存在的订单,类型检查全都通过:
// 已送达,却从没付过钱:
//   { status: "delivered" }
// 已取消,却仍然送达了:
//   { status: "canceled",
//     deliveredAt: 昨天 }`,
};

const UNION_ORDER_CODE: Loc<string> = {
  en: `type Order =
  | { status: "unpaid";    items: Item[] }
  | { status: "paid";      items: Item[]; paidAt: Date }
  | { status: "delivered"; items: Item[]; paidAt: Date;
      deliveredAt: Date }
  | { status: "canceled";  reason: string };

// "delivered but never paid"?
// You cannot write it down. The compiler says:
// Property 'paidAt' is missing in type
// '{ status: "delivered"; items: never[];
//    deliveredAt: Date; }' but required in type
// '{ status: "delivered"; items: Item[];
//    paidAt: Date; deliveredAt: Date; }'.`,
  zh: `type Order =
  | { status: "unpaid";    items: Item[] }
  | { status: "paid";      items: Item[]; paidAt: Date }
  | { status: "delivered"; items: Item[]; paidAt: Date;
      deliveredAt: Date }
  | { status: "canceled";  reason: string };

// 「已送达但没付过钱」?
// 这个类型根本写不出来,编译器会说:
// Property 'paidAt' is missing in type
// '{ status: "delivered"; items: never[];
//    deliveredAt: Date; }' but required in type
// '{ status: "delivered"; items: Item[];
//    paidAt: Date; deliveredAt: Date; }'.`,
};

/* ---------- §06 自己造工具类型 ---------- */

const MY_OMIT_CODE: Loc<string> = {
  en: `interface Order {
  id: string;
  total: number;
  toppings: string[];
}

type MyOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

// Line 8, piece by piece:
//   [P in keyof T          go through every key of T (mapped type)
//    as P extends K        key remapping: send each key through a test
//       ? never : P]       on the list K? rename it to never, which drops it
//   : T[P]                 for the keys that stay, copy the property type

type Draft = MyOmit<Order, "toppings">;
// { id: string; total: number }`,
  zh: `interface Order {
  id: string;
  total: number;
  toppings: string[];
}

type MyOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

// 拆开读第 8 行:
//   [P in keyof T          逐个遍历 T 的键(映射类型)
//    as P extends K        键重映射:每个键都过一道判断
//       ? never : P]       在名单 K 里?改名成 never,也就是删掉
//   : T[P]                 留下的键,属性类型照抄(索引访问)

type Draft = MyOmit<Order, "toppings">;
// { id: string; total: number }`,
};

const DEEP_READONLY_CODE: Loc<string> = {
  en: `type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>   // an object? go one level down (recursion)
    : T[K];                // a primitive? nothing left to lock
};

const cfg: DeepReadonly<{
  shop: string;
  hours: { open: number; close: number };
}> = { shop: "Sunrise Tea", hours: { open: 9, close: 22 } };

cfg.hours.open = 8;
// Cannot assign to 'open' because it is a read-only property.`,
  zh: `type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>   // 是对象?往下走一层(递归)
    : T[K];                // 是原始值?锁到头了
};

const cfg: DeepReadonly<{
  shop: string;
  hours: { open: number; close: number };
}> = { shop: "Sunrise Tea", hours: { open: 9, close: 22 } };

cfg.hours.open = 8;
// Cannot assign to 'open' because it is a read-only property.`,
};

export default function MindsetPage() {
  return (
    <main className="page" data-ch="mindset">
      <Hero
        ch="mindset"
        title={{
          en: (
            <>
              Finale: <span className="grad">thinking in types</span>
            </>
          ),
          zh: (
            <>
              终章:<span className="grad">类型思维</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              Eleven chapters have covered the syntax. This one is about how to
              think. TypeScript is JavaScript plus a layer of types that exists
              only while you write and compile: the compiler checks the types,
              then removes them, and the JavaScript that runs is the JavaScript
              you wrote. Five ideas, one map of the course, and a final quiz.
            </>
          ),
          zh: (
            <>
              前十一章讲完了语法,这一章讲怎么想。TypeScript 就是 JavaScript
              加上一层类型,这层类型只存在于你写代码和编译的阶段:
              编译器检查完就把它删掉,真正运行的是你写的那份 JavaScript。
              五条心法,一张全书地图,一场总测验。
            </>
          ),
        }}
        chips={[
          {
            id: "trio",
            n: "01",
            label: { en: "Three forms", zh: "三种写法" },
          },
          {
            id: "assertion",
            n: "02",
            label: { en: "What as costs", zh: "断言的代价" },
          },
          {
            id: "unknown",
            n: "03",
            label: { en: "The unknown boundary", zh: "unknown 边界" },
          },
          { id: "any", n: "04", label: { en: "Using any", zh: "any 用法" } },
          {
            id: "doc",
            n: "05",
            label: { en: "Types as documentation", zh: "类型即文档" },
          },
          {
            id: "gym",
            n: "06",
            label: { en: "Your own helpers", zh: "自己造工具" },
          },
          {
            id: "map",
            n: "07",
            label: { en: "Course map", zh: "知识地图" },
          },
          { id: "labs", n: "08", label: { en: "Practice", zh: "动手" } },
          { id: "quiz", n: "09", label: { en: "Final quiz", zh: "总测验" } },
          {
            id: "grad",
            n: "10",
            label: { en: "What comes next", zh: "接下来" },
          },
        ]}
      >
        <HeroCreed />
      </Hero>

      {/* ================= §01 三种写法 ================= */}
      <Section
        id="trio"
        index="01"
        title={{
          en: "Idea 1 — three forms: annotation, as, and satisfies",
          zh: "心法一 · 三种写法:注解、as、satisfies",
        }}
        desc={{
          en: "The same config object, written three ways. The difference is what gets checked and what gets inferred.",
          zh: "同一个配置对象,三种写法。差别只在两件事上:检查什么,推断成什么。",
        }}
      >
        <Callout
          tone="story"
          title={{
            en: "Three ways to tell the compiler what a value is",
            zh: "三种告诉编译器「这是什么」的方式",
          }}
        >
          <T
            en={
              <>
                <p>
                  Giving a value a type is a message to the compiler, and these
                  three forms send three different messages.{" "}
                  <b>An annotation</b> (<code>: Config</code>) means &quot;check
                  this&quot;: the compiler checks the value, then replaces the
                  inferred type with the type you declared.{" "}
                  <b>An assertion</b> (<code>as Config</code>) means &quot;take
                  my word for it&quot;: the check is skipped.{" "}
                  <b>
                    <code>satisfies</code>
                  </b>{" "}
                  (added in TypeScript 4.9) means &quot;check it, but do not
                  rewrite it&quot;: the shape is checked and the inferred type
                  is left alone. Compare them below.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  给一个值「定类型」,其实是在对编译器说话,
                  而这三种写法说的是三句不同的话。<b>注解</b>(
                  <code>: Config</code>)是「请你检查」:
                  编译器检查这个值,然后把推断结果换成你声明的类型。
                  <b>断言</b>(<code>as Config</code>)是「我说了算」:
                  检查被跳过。
                  <b>
                    <code>satisfies</code>
                  </b>
                  (TypeScript 4.9 加入)是「检查完别改我」:
                  形状照查,推断结果保留。下面直接对比。
                </p>
              </>
            }
          />
        </Callout>

        <TrioLab />

        <p className="sec-desc">
          <T
            en={
              <>
                One more keyword often appears next to these three:{" "}
                <b>
                  <code>as const</code>
                </b>
                . It does not check a shape. It does something else: it stops
                widening. Literal values keep their exact literal types, and
                every property becomes <code>readonly</code>.
              </>
            }
            zh={
              <>
                这三种写法旁边常常还站着一个关键字:
                <b>
                  <code>as const</code>
                </b>
                。它不校验形状,干的是另一件事:阻止拓宽 ——
                字面量保留精确的字面量类型,并且每个属性都变成{" "}
                <code>readonly</code>。
              </>
            }
          />
        </p>

        <CodeBlock
          lang="ts"
          title={{
            en: "as const: keep the literals exactly as written",
            zh: "as const:字面量原样保留",
          }}
          hl={[1, 5]}
          code={AS_CONST_CODE}
          note={
            <T
              en={
                <>
                  A common combination:{" "}
                  <b>
                    <code>satisfies</code> checks the shape, and{" "}
                    <code>as const</code> keeps the literals
                  </b>
                  . They can be used together:{" "}
                  <code>{"{…} as const satisfies Config"}</code>.
                </>
              }
              zh={
                <>
                  常见组合:
                  <b>
                    <code>satisfies</code> 管形状对不对,<code>as const</code>{" "}
                    管字面量丢不丢
                  </b>
                  。两个可以叠着写:
                  <code>{"{…} as const satisfies Config"}</code>。
                </>
              }
            />
          }
        />

        <Callout
          tone="idea"
          title={{
            en: "Annotating everything is a beginner habit",
            zh: "什么都注解,是新手习惯",
          }}
        >
          <T
            en={
              <>
                <p>
                  Inference already does most of the work. Writing{" "}
                  <code>const total: number = 22</code> adds nothing the
                  compiler did not already know, and it makes the code longer
                  and harder to change.
                </p>
                <p>
                  Two places are worth annotating.{" "}
                  <b>Function parameters</b>, because a parameter comes from
                  outside and inference has nothing to read.{" "}
                  <b>Public boundaries</b> — exported functions, module APIs,
                  shared data — because there the type is a promise to other
                  code, and writing it down means the compiler checks the
                  promise instead of copying whatever you happened to return.
                  Everywhere else, let inference do it.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  推断已经承担了绝大部分工作。写{" "}
                  <code>const total: number = 22</code>{" "}
                  并没有告诉编译器任何它不知道的事,只是让代码更长、更难改。
                </p>
                <p>
                  值得注解的地方有两处。<b>函数参数</b> ——
                  参数来自外部,推断没有材料可读。<b>对外的边界</b> ——
                  导出的函数、模块 API、共享数据 ——
                  那里的类型是给别的代码的承诺,写下来,
                  编译器才会去检查这份承诺,而不是照抄你碰巧返回了什么。
                  除此之外,交给推断。
                </p>
              </>
            }
          />
        </Callout>
      </Section>

      {/* ================= §02 断言的代价 ================= */}
      <Section
        id="assertion"
        index="02"
        title={{
          en: "Idea 2 — what an assertion costs",
          zh: "心法二 · 断言的代价",
        }}
        desc={{
          en: "Every as says: I know more about this value than the compiler does. Sometimes that is true. The question is where your information comes from.",
          zh: "每写一个 as,你都在说:关于这个值,我比编译器知道得多。有时确实如此。问题是,你的信息从哪来。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                <code>as</code> is not a bad keyword. It exists for the cases
                where you really do know more than the compiler. There is one
                test: <b>where does your information come from?</b> If it comes
                from something you checked yourself, the assertion is
                reasonable. If it comes from not wanting to handle the other
                case, it is not.
              </>
            }
            zh={
              <>
                <code>as</code> 不是坏东西 ——
                它就是为「你确实比编译器知道得多」的场合准备的。
                判断标准只有一条:<b>你的信息从哪来?</b>
                来自你亲自确认过的事实,这个断言就合理;
                来自「另一种情况我懒得处理」,就不合理。
              </>
            }
          />
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title={{
                en: "Reasonable: you really do know more",
                zh: "合理:你真的知道得更多",
              }}
              hl={[3]}
              code={AS_FAIR_CODE}
              note={
                <T
                  en={
                    <>
                      <code>querySelector</code> returns{" "}
                      <code>Element | null</code>. The compiler has not read
                      your HTML and you have. That gap in information is what
                      makes the assertion reasonable. It is still a promise you
                      are making, so if the markup changes, this line becomes
                      wrong silently.
                    </>
                  }
                  zh={
                    <>
                      <code>querySelector</code> 返回{" "}
                      <code>Element | null</code>。编译器没读过你的 HTML,
                      你读过 —— 这份信息差让断言变得合理。
                      但它仍然是一份承诺:哪天页面结构改了,
                      这一行就会静悄悄地变成错的。
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
                en: "Not reasonable: you just skipped the work",
                zh: "不合理:你只是跳过了该做的事",
              }}
              hl={[3]}
              code={AS_UNFAIR_CODE}
              note={
                <T
                  en={
                    <>
                      JSON from a request, <code>localStorage</code>, form
                      input: the shape of that data{" "}
                      <b>is not controlled by your codebase</b>. Here{" "}
                      <code>as</code> is not knowledge, it is a guess written
                      down as a fact. Section 03 shows what to do instead.
                    </>
                  }
                  zh={
                    <>
                      请求回来的 JSON、<code>localStorage</code>、用户输入 ——
                      这些数据的形状<b>不由你的代码库决定</b>。
                      这里的 <code>as</code> 不是知识,
                      而是把一个猜测写成了事实。正确做法见 §03。
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
            en: "as unknown as T: the loudest signal in the type system",
            zh: "as unknown as T:类型系统里最响的信号",
          }}
        >
          <T
            en={
              <>
                <p>
                  When two types have nothing in common, a direct{" "}
                  <code>as</code> is rejected, so people write{" "}
                  <code>x as unknown as T</code> to get past it in two steps.
                  Read what that actually means:{" "}
                  <b>
                    &quot;discard everything the compiler knows about this
                    value, then let me relabel it&quot;
                  </b>
                  . In test code it is sometimes a reasonable escape hatch. In
                  application code it usually means the types are modelled
                  wrongly, and the model is what should change.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  当两个类型毫无交集时,直接 <code>as</code> 会被拒绝,
                  于是有人写 <code>x as unknown as T</code> 分两步硬转。
                  它的真实含义是:
                  <b>「把编译器对这个值的全部认知丢掉,然后让我重新贴标签」</b>
                  。在测试代码里,它有时是个合理的逃生口;
                  出现在业务代码里,通常说明类型建模本身有问题,
                  该改的是模型。
                </p>
              </>
            }
          />
        </Callout>

        <Callout
          tone="deep"
          title={{
            en: "TypeScript is deliberately not fully sound",
            zh: "TypeScript 的类型系统,是刻意不完全健全的",
          }}
        >
          <T
            en={
              <>
                <p>
                  A type system is <b>sound</b> when a program that passes the
                  check cannot fail in a way the types said was impossible.
                  TypeScript is not sound, and this is a design decision, not a
                  bug. A fully sound system would reject a great deal of
                  ordinary JavaScript, so TypeScript trades some guarantees for
                  being usable on real code.
                </p>
                <p>
                  It helps to know the specific holes, because these are the
                  places where a green compile still means nothing.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  一个类型系统是<b>健全的(sound)</b>,
                  意思是通过检查的程序不会以类型宣称不可能的方式出错。
                  TypeScript 并不健全,而这是设计决定,不是缺陷 ——
                  完全健全的系统会拒绝大量普通的 JavaScript,
                  TypeScript 用一部分保证换取了在真实代码上可用。
                </p>
                <p>
                  知道具体的口子在哪很有用,
                  因为正是在这些地方,「编译通过」什么也不能说明。
                </p>
              </>
            }
          />
        </Callout>

        <CodeBlock
          lang="ts"
          title={{
            en: "Four holes, all of which compile without an error",
            zh: "四个口子,全都能通过编译",
          }}
          hl={[3, 6, 13, 17]}
          code={UNSOUND_CODE}
          note={
            <T
              en={
                <>
                  None of these lines is an error today, and all four can fail
                  at runtime. This is not a reason to distrust TypeScript. It is
                  the reason the rest of this chapter exists:{" "}
                  <b>
                    keep <code>any</code> and <code>as</code> rare, check data
                    at the boundary yourself, and turn on{" "}
                    <code>noUncheckedIndexedAccess</code> when the project can
                    take it
                  </b>
                  .
                </>
              }
              zh={
                <>
                  这几行现在都不报错,而四种情况在运行时都可能出问题。
                  这不是不该信任 TypeScript 的理由,
                  而是这一章后面几节存在的理由:
                  <b>
                    少用 <code>any</code> 和 <code>as</code>,
                    在边界上自己检查数据,项目扛得住时打开{" "}
                    <code>noUncheckedIndexedAccess</code>
                  </b>
                  。
                </>
              }
            />
          }
        />
      </Section>

      {/* ================= §03 unknown 边界 ================= */}
      <Section
        id="unknown"
        index="03"
        title={{
          en: "Idea 3 — unknown at the boundary",
          zh: "心法三 · unknown 守住边界",
        }}
        desc={{
          en: "The compiler's authority ends when compilation ends. Data that arrives while the program runs has to be checked by code you wrote.",
          zh: "编译器的管辖权到编译结束为止 —— 程序运行时进来的数据,只能靠你写的代码检查。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                Types are <b>erased</b> during compilation. That has one cold
                consequence: every <code>interface</code> you wrote is gone in
                production, and data arriving from outside is not validated by
                anything. An <code>interface</code> that describes an API
                response is a <b>claim about the data, not a guarantee</b>. Step
                through what that looks like.
              </>
            }
            zh={
              <>
                类型在编译时会被<b>擦除</b>。这带来一个冷酷的结论:
                你写的每一个 <code>interface</code> 在线上都不存在,
                从外面进来的数据没有任何东西替你校验。
                一个描述接口返回值的 <code>interface</code>,
                是<b>对数据的一个声称,不是保证</b>。逐帧看一遍。
              </>
            }
          />
        </p>

        <EraseFlow />

        <Callout
          tone="warn"
          title={{
            en: "A type error is not a runtime error",
            zh: "类型错误不是运行时错误",
          }}
        >
          <T
            en={
              <>
                <p>
                  Beginners assume a type error stops everything. It does not.
                  By default <code>tsc</code> reports the error{" "}
                  <b>and still writes the JavaScript file</b>. Set{" "}
                  <code>noEmitOnError</code> if you want it to stop. Many build
                  tools go further and remove types without checking them at
                  all, so the type error never even appears during the build.
                </p>
                <p>
                  So a red underline is a message, not a wall. It is worth
                  saying plainly, because it explains something people find
                  confusing: <b>code with type errors can still run, and can
                  still be shipped</b>. Making the check part of continuous
                  integration is what turns the message into a wall.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  很多人以为类型报错会让一切停下,其实不会。默认情况下,
                  <code>tsc</code> 会报出错误,<b>同时照样写出 JavaScript 文件</b>
                  ;想让它停下,需要开 <code>noEmitOnError</code>。
                  不少构建工具走得更远:它们直接删掉类型,根本不做检查,
                  于是这个类型错误在构建过程中连出现的机会都没有。
                </p>
                <p>
                  所以那条红线是一条消息,不是一堵墙。
                  这一点值得直说,因为它解释了一个常见的困惑:
                  <b>有类型错误的代码照样能跑,也照样能发布</b>。
                  把类型检查放进持续集成,才是把消息变成墙。
                </p>
              </>
            }
          />
        </Callout>

        <p className="sec-desc">
          <T
            en={
              <>
                The <code>isOrder</code> function standing at the boundary is
                the <b>type predicate</b> from chapter 03: a check that runs on
                the value, in exchange for narrowing at the type level.
              </>
            }
            zh={
              <>
                站在边界上的那个 <code>isOrder</code>,就是第 03 章学过的
                <b>类型谓词(type predicate)</b>:
                在值这一层做检查,换来类型这一层的收窄。
              </>
            }
          />
        </p>

        <CodeBlock
          lang="ts"
          title={{
            en: "A boundary check, written by hand",
            zh: "边界校验函数 · 手写版",
          }}
          hl={[8, 19]}
          code={IS_ORDER_CODE}
          note={
            <T
              en={
                <>
                  Look at the <code>as</code> on line 10. It lives inside the
                  function, it exists only so the fields can be read one by one,
                  and <b>every field is then actually checked</b>. That is an
                  assertion helping a check, not an assertion replacing one.
                </>
              }
              zh={
                <>
                  注意第 10 行的 <code>as</code>:它只活在函数内部,
                  只为逐个读取字段服务,而且每个字段<b>之后真的被检查了</b>。
                  这是断言给检查打下手,不是断言替检查上岗。
                </>
              }
            />
          }
        />

        <Callout
          tone="idea"
          title={{
            en: "Writing every validator by hand gets tiring",
            zh: "校验函数写多了会累",
          }}
        >
          <T
            en={
              <>
                <p>
                  In a real project the shapes get large, and a hand-written
                  validator gets long and easy to get wrong. Runtime validation
                  libraries such as <b>zod</b> solve this: you describe the
                  shape once, and both the validation function and the
                  TypeScript type are generated from that one description.
                </p>
                <p>
                  This course does not cover them. One sentence is enough:{" "}
                  <b>
                    they exist because types are erased, so something has to do
                    the checking at runtime
                  </b>
                  . The idea is the same as the <code>isOrder</code> you just
                  read.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  真实项目里形状会变大,手写的校验函数又长又容易写漏。
                  <b>zod</b> 这类运行时校验库解决的正是这件事:
                  用代码描述一次形状,校验函数和 TypeScript
                  类型都从这一份描述里生成。
                </p>
                <p>
                  本课不展开,记一句就够:
                  <b>它们存在,是因为类型被擦除了,运行时得有人来查</b>。
                  思路和你刚读的 <code>isOrder</code> 完全一样。
                </p>
              </>
            }
          />
        </Callout>
      </Section>

      {/* ================= §04 any 用法 ================= */}
      <Section
        id="any"
        index="04"
        title={{
          en: "Idea 4 — any is a tool, not a habit",
          zh: "心法四 · any 是工具,不是习惯",
        }}
        desc={{
          en: "Criticising any is easy. Using it well is harder. The rule is about how far it can spread.",
          zh: "批评 any 很容易,用好它比较难 —— 规则只有一条:别让它扩散。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                Eleven chapters have said &quot;avoid <code>any</code>&quot;.
                Here is the fair version. <code>any</code> has legitimate uses:{" "}
                <b>old code during a migration</b> (the transitional state from
                chapter 10), and <b>a genuinely dynamic boundary</b>, such as
                the result of <code>eval</code> or a third-party callback whose
                shape is not documented anywhere. The discipline is one line:{" "}
                <b>keep it in the smallest scope that works</b>.
              </>
            }
            zh={
              <>
                前面十一章一直在说「少用 <code>any</code>」,这里说句公道话:
                <code>any</code> 有它的正当用途 —— <b>迁移期的旧代码</b>
                (第 10 章讲的过渡状态),以及<b>真正动态的边界</b>,
                比如 <code>eval</code> 的结果、
                形状没有任何文档的第三方回调。
                纪律只有一条:<b>把它锁在能跑通的最小范围里</b>。
              </>
            }
          />
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title={{
                en: "Out of control: any reaches an exported signature",
                zh: "失控:any 泄漏进了导出签名",
              }}
              hl={[2, 7]}
              code={ANY_LEAK_CODE}
              note={
                <T
                  en={
                    <>
                      <code>any</code> spreads: anything read out of an{" "}
                      <code>any</code> value is <code>any</code> as well. Once
                      it reaches an exported signature, every caller in the
                      project loses its checks too.
                    </>
                  }
                  zh={
                    <>
                      <code>any</code> 会扩散:从 <code>any</code>{" "}
                      值上取出来的东西还是 <code>any</code>。
                      一旦它进入导出签名,项目里所有调用方也一起失去了检查。
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
                en: "Contained: the messy part stays inside",
                zh: "受控:脏活留在函数内部",
              }}
              hl={[2, 5]}
              code={ANY_CONTAINED_CODE}
              note={
                <T
                  en={
                    <>
                      The exported signature is precise, so every caller is
                      protected. <b>Messy inside is fine. The boundary is
                      not.</b>
                    </>
                  }
                  zh={
                    <>
                      导出签名是精确的,所有调用方都受保护。
                      <b>内部可以乱,边界不行。</b>
                    </>
                  }
                />
              }
            />
          }
        />

        <Callout
          tone="idea"
          title={{
            en: "Reach for unknown first, and for any only if you must",
            zh: "先用 unknown,不行再用 any",
          }}
        >
          <T
            en={
              <>
                <p>
                  Both accept any value. The difference is what you may then do
                  with it. <code>unknown</code>{" "}
                  <b>must be narrowed before use</b>, so the compiler forces you
                  to add the check. <code>any</code> allows every use, so no
                  check is required and none is performed.
                </p>
                <p>
                  So when you do not know the type, start with{" "}
                  <code>unknown</code>. It is the type-safe way of saying &quot;I
                  do not know yet&quot;. Drop to <code>any</code> only when{" "}
                  <code>unknown</code> genuinely makes the code impossible to
                  write, and keep it in the smallest scope you can.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  两者都能接收任何值,差别在于之后你能拿它做什么。
                  <code>unknown</code> <b>必须先收窄才能使用</b>,
                  编译器会逼你补上检查;<code>any</code> 允许任何用法,
                  所以不需要检查,也就没有检查。
                </p>
                <p>
                  因此拿不准类型时,第一反应是 <code>unknown</code> ——
                  它是类型安全的「我还不知道」。
                  只有当 <code>unknown</code> 确实让代码写不下去时,
                  才降级到 <code>any</code>,并且锁在尽可能小的作用域里。
                </p>
              </>
            }
          />
        </Callout>
      </Section>

      {/* ================= §05 类型即文档 ================= */}
      <Section
        id="doc"
        index="05"
        title={{
          en: "Idea 5 — types as documentation: make illegal states unrepresentable",
          zh: "心法五 · 类型即文档:让非法状态无法表示",
        }}
        desc={{
          en: "A comment can go out of date and a document can go unread. A type cannot be quietly ignored, because code that contradicts it does not compile.",
          zh: "注释会过时,文档会没人读。类型不会被悄悄忽略 —— 和它矛盾的代码编译不过。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                The same order status, modelled two ways. On the left every
                field is optional, so <b>impossible combinations</b> can be
                built freely. On the right the discriminated union from chapter
                03 writes down which fields exist in which state.
              </>
            }
            zh={
              <>
                同一个订单状态,两种建模。左边每个字段都可选,
                于是<b>不可能存在的组合</b>可以随便造;
                右边用第 03 章的可辨识联合,
                把「什么状态下有什么字段」写进了类型。
              </>
            }
          />
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title={{
                en: "One big object, everything optional",
                zh: "一个大对象,字段全可选",
              }}
              hl={[2, 3, 4, 5]}
              code={LOOSE_ORDER_CODE}
              note={
                <T
                  en={
                    <>
                      You could write &quot;paidAt only exists when status is
                      paid&quot; in a document. A document does not report
                      errors, and code does not read documents. The agreement
                      lives only in someone&apos;s memory.
                    </>
                  }
                  zh={
                    <>
                      你可以在文档里写「status 为 paid 时才有 paidAt」。
                      文档不会报错,代码也不读文档 ——
                      这个约定只活在某个人的记忆里。
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
                en: "Discriminated union: illegal states cannot be written",
                zh: "可辨识联合:非法状态写不出来",
              }}
              hl={[2, 3, 4, 5, 6]}
              code={UNION_ORDER_CODE}
              note={
                <T
                  en={
                    <>
                      After <code>switch (order.status)</code> each branch has
                      exactly the fields that state has, and{" "}
                      <code>never</code> catches a state you forgot. Chapter 03
                      gave you the technique. This chapter gives the reason to
                      use it:{" "}
                      <b>
                        put the agreement in the type instead of in a comment
                        beside it
                      </b>
                      .
                    </>
                  }
                  zh={
                    <>
                      写完 <code>switch (order.status)</code>,
                      每个分支里恰好有该状态的字段,漏掉的状态由{" "}
                      <code>never</code> 兜住。第 03 章给了你技术,
                      这一章给的是用它的理由:
                      <b>把约定写进类型,而不是写在旁边的注释里</b>。
                    </>
                  }
                />
              }
            />
          }
        />

        <Callout
          tone="deep"
          title={{
            en: "Why this idea comes last",
            zh: "这条心法为什么放在最后",
          }}
        >
          <T
            en={
              <>
                <p>
                  The first four ideas are about getting along with the
                  compiler. This one is about{" "}
                  <b>what the type system is actually for</b>. It is not a spell
                  checker. It is a language for describing the rules of your
                  problem. &quot;An order cannot be delivered before it is
                  paid&quot; is such a rule. Written into the type, every future
                  change that breaks it fails to compile.
                </p>
                <p>
                  Notice what the union discriminates on:{" "}
                  <code>status</code>, a real property that exists at runtime.
                  It cannot discriminate on the name of a type, because
                  TypeScript compares <b>the shape of a type, not its name</b>,
                  and the name is gone after compilation. Chapter 04 covers
                  that comparison in detail.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  前四条心法讲的是怎么和编译器相处,这一条讲的是
                  <b>类型系统真正的用途</b>:它不是拼写检查器,
                  而是一门描述你的问题域规则的语言。
                  「订单没付钱就不可能已送达」就是这样一条规则 ——
                  写进类型之后,今后每一次破坏它的改动都编译不过。
                </p>
                <p>
                  注意这个联合是靠什么区分的:<code>status</code>,
                  一个运行时真实存在的属性。它没法靠类型的名字来区分 ——
                  因为 TypeScript 比较的是<b>类型的形状,不是名字</b>,
                  而名字在编译之后就没了。这套比较规则,第 04 章讲得很细。
                </p>
              </>
            }
          />
        </Callout>
      </Section>

      {/* ================= §06 自己造工具类型 ================= */}
      <Section
        id="gym"
        index="06"
        title={{
          en: "Building your own type helpers",
          zh: "自己造工具类型",
        }}
        desc={{
          en: "The tools from chapter 06 and the parts from chapter 07, put together. Build two of them yourself.",
          zh: "第 06 章用过的工具、第 07 章拆过的零件,现在合起来,亲手造两个。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                First one: <b>MyOmit</b>, a rewrite of the <code>Omit</code> you
                have been using since chapter 06. All the parts come from
                chapter 07. A mapped type walks the keys, and{" "}
                <code>as</code> key remapping (TypeScript 4.1) removes the ones
                you do not want.
              </>
            }
            zh={
              <>
                第一个:<b>MyOmit</b> —— 重写第 06 章起你一直在用的{" "}
                <code>Omit</code>。零件全来自第 07 章:
                映射类型遍历键,<code>as</code> 键重映射(TypeScript 4.1)
                负责把不要的键去掉。
              </>
            }
          />
        </p>

        <CodeBlock
          lang="ts"
          title={{ en: "First one: MyOmit", zh: "第一个:MyOmit" }}
          hl={[8]}
          code={MY_OMIT_CODE}
          note={
            <T
              en={
                <>
                  <code>never</code> does the work again here. A key mapped to{" "}
                  <code>never</code> is removed from the result, which makes{" "}
                  <code>never</code> a general way to delete things in type-level
                  code.
                </>
              }
              zh={
                <>
                  <code>never</code> 在这里又立了一功:
                  被映射成 <code>never</code> 的键会从结果里消失 ——
                  在类型层面的代码里,<code>never</code> 是通用的「删除」手段。
                </>
              }
            />
          }
        />

        <p className="sec-desc">
          <T
            en={
              <>
                Second one, harder: <b>DeepReadonly</b>. The built-in{" "}
                <code>Readonly</code> only locks the top level, so a nested
                object can still be changed. To lock all of it, let the mapped
                type <b>call itself</b>.
              </>
            }
            zh={
              <>
                第二个,难一些:<b>DeepReadonly</b>。内置的{" "}
                <code>Readonly</code> 只锁最外一层,嵌套对象里面照样能改。
                想全锁住,让映射类型<b>调用它自己</b>。
              </>
            }
          />
        </p>

        <CodeBlock
          lang="ts"
          title={{ en: "Second one: DeepReadonly", zh: "第二个:DeepReadonly" }}
          hl={[2, 3]}
          code={DEEP_READONLY_CODE}
          note={
            <T
              en={
                <>
                  Conditional types (chapter 07) plus mapped types (chapter 07)
                  plus recursion gives you a new tool. A careful version also
                  handles functions and arrays: a function is an{" "}
                  <code>object</code> too, and there is no point recursing into
                  it. That is a medium-level problem on type-challenges, and it
                  is worth doing yourself.
                </>
              }
              zh={
                <>
                  条件类型(第 07 章)+ 映射类型(第 07 章)+ 递归,
                  就得到一个新工具。严谨的版本还要处理函数和数组:
                  函数也是 <code>object</code>,往里递归没有意义。
                  那是 type-challenges 上 medium 难度的题,值得你自己做一遍。
                </>
              }
            />
          }
        />

        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Practice · problem set" zh="练功房 · 题库" />
            </div>
            <div className="card-title">type-challenges</div>
            <p>
              <T
                en={
                  <>
                    github.com/type-challenges/type-challenges is a
                    community-maintained set of type-level problems, from easy
                    to extreme. Each one runs in the Playground and ships with
                    test cases, so you get an answer immediately. The MyOmit and
                    DeepReadonly you just wrote are both problems from this set.
                  </>
                }
                zh={
                  <>
                    github.com/type-challenges/type-challenges
                    是社区维护的类型题库,难度从 easy 到 extreme。
                    每道题都能在 Playground 里做,自带测试用例,当场就有结果。
                    你刚写的 MyOmit 和 DeepReadonly 都是里面的原题。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Reference · official docs" zh="原典 · 官方手册" />
            </div>
            <div className="card-title">TypeScript Handbook</div>
            <p>
              <T
                en={
                  <>
                    The Handbook under typescriptlang.org/docs is the primary
                    source. Every concept in this course has an authoritative
                    version there. At your current level it is readable, which
                    is the main thing this course was for.
                  </>
                }
                zh={
                  <>
                    typescriptlang.org/docs 下的 Handbook 是第一手资料:
                    本课讲过的每个概念,那里都有权威版本。
                    以你现在的水平读它不再吃力 —— 这正是这门课的目的之一。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Workbench · check anything" zh="工作台 · 随手验证" />
            </div>
            <div className="card-title">TS Playground</div>
            <p>
              <T
                en={
                  <>
                    typescriptlang.org/play needs no account, produces a
                    shareable link, lets you switch TypeScript versions, and
                    shows the compiled output. When you are unsure how something
                    behaves, do not guess. Paste it in and read the answer. That
                    habit is worth more than any single fact in this course.
                  </>
                }
                zh={
                  <>
                    typescriptlang.org/play 免注册、可分享链接、
                    能切换 TypeScript 版本、能看编译产物。
                    行为拿不准的时候别猜,贴进去看答案。
                    这个习惯比这门课里的任何一个知识点都值钱。
                  </>
                }
              />
            </p>
          </div>
        </div>
      </Section>

      {/* ================= §07 知识地图 ================= */}
      <Section
        id="map"
        index="07"
        title={{
          en: "The whole course on one map",
          zh: "全书回顾:一张地图",
        }}
        desc={{
          en: "Twelve chapters, five stages, one sentence each. If a sentence does not feel solid, open that chapter again.",
          zh: "十二章,五个阶段,每章一句话。哪句读着心虚,点卡片回去补。",
        }}
      >
        <RoadMap />
      </Section>

      {/* ================= §08 动手任务 ================= */}
      <Section
        id="labs"
        index="08"
        title={{ en: "Practice", zh: "动手任务" }}
        desc={{
          en: "An idea only counts once you have used it: the three forms bench, a validator written by hand, and two type-level exercises.",
          zh: "心法要过手才算数:三种写法的实验、手写校验器、两道类型题。",
        }}
      >
        <LabSet ch="mindset" items={LABS} />
      </Section>

      {/* ================= §09 总测验 ================= */}
      <Section
        id="quiz"
        index="09"
        title={{ en: "Final quiz", zh: "总测验" }}
        desc={{
          en: "Twelve questions across the whole course: inference, narrowing, structural typing, generics, utility types, type operators, and tsconfig.",
          zh: "十二道题横跨全书:推断、收窄、结构化类型、泛型、工具类型、类型运算、tsconfig。",
        }}
      >
        <Quiz ch="mindset" items={QUIZ} />
      </Section>

      {/* ================= §10 结课 ================= */}
      <Section
        id="grad"
        index="10"
        title={{
          en: "Where to go next",
          zh: "接下来的路",
        }}
        desc={{
          en: "The course ends here. The part that makes it stick happens outside the course.",
          zh: "课程到这里讲完了,但真正学透的那一步,一直在课程外面。",
        }}
      >
        <Callout
          tone="win"
          title={{ en: "You have finished the course", zh: "你已经学完了" }}
        >
          <T
            en={
              <>
                <p>
                  In the prologue you were asking what types are for, since
                  JavaScript already runs. Now you can read every word of a
                  compiler error, design a validation boundary for data that
                  comes back from a request, use a discriminated union so that
                  illegal states cannot be written down, build{" "}
                  <code>Omit</code> yourself, and plan a step-by-step migration
                  for an old JavaScript project. That is twelve chapters of
                  progress.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  序章那天,你还在问「类型是干嘛的,JavaScript 不是跑得好好的」。
                  现在你能读懂编译器报错里的每一个词,
                  能为请求回来的数据设计校验边界,
                  能用可辨识联合让非法状态写不出来,能自己实现{" "}
                  <code>Omit</code>,
                  还能给一个老的 JavaScript 项目排一份分步迁移计划。
                  十二章没有白走。
                </p>
              </>
            }
          />
        </Callout>

        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Route 1 · build it" zh="路线一 · 动手" />
            </div>
            <div className="card-title">
              <T
                en="Actually write the tea shop system"
                zh="把奶茶店系统真写出来"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    Start a project with Vite and TypeScript, and implement the
                    ordering system this course kept coming back to:{" "}
                    <code>MenuItem</code>, an <code>Order</code> as a
                    discriminated union, a generic container, a{" "}
                    <code>Partial</code> draft, and <code>isOrder</code> at the
                    boundary. Turn on <code>strict</code>, and add{" "}
                    <code>noUncheckedIndexedAccess</code> as well.
                  </>
                }
                zh={
                  <>
                    用 Vite + TypeScript 起一个项目,
                    把贯穿全书的点单系统实现出来:<code>MenuItem</code>、
                    用可辨识联合写的 <code>Order</code>、一个泛型容器、
                    <code>Partial</code> 草稿单、边界上的{" "}
                    <code>isOrder</code>。<code>strict</code> 全开,
                    再把 <code>noUncheckedIndexedAccess</code> 也加上。
                  </>
                }
              />
            </p>
            <p>
              <T
                en="You will notice that all the types in this course were describing one world the whole time."
                zh="写完你会发现:全书的类型,一直在描述同一个世界。"
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Route 2 · go deeper" zh="路线二 · 深潜" />
            </div>
            <div className="card-title">
              <T en="One type problem a day" zh="每天一道类型题" />
            </div>
            <p>
              <T
                en={
                  <>
                    Work through type-challenges starting from the easy set, one
                    problem a day. When you cannot solve one, read the
                    discussion thread; the community posts some very clever
                    solutions there. Once easy and medium are done, the type
                    definitions in open-source libraries stop being intimidating.
                  </>
                }
                zh={
                  <>
                    type-challenges 从 easy 刷起,每天一道;做不出来就看讨论区,
                    那里有社区里很聪明的写法。刷完 easy 和 medium,
                    再读开源库的类型定义就不会发怵了。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Route 3 · read real code" zh="路线三 · 读真代码" />
            </div>
            <div className="card-title">
              <T en="Read types written by other people" zh="去读别人写的类型" />
            </div>
            <p>
              <T
                en={
                  <>
                    Open the JavaScript library you use most and read its{" "}
                    <code>.d.ts</code> inside <code>node_modules</code>. Then
                    look at DefinitelyTyped to see how <code>@types</code>{" "}
                    packages add types to libraries that have none. Reading
                    other people&apos;s type design comes before doing your own.
                  </>
                }
                zh={
                  <>
                    打开你最常用的 JavaScript 库,
                    去 <code>node_modules</code> 里读它的 <code>.d.ts</code>;
                    再去 DefinitelyTyped 看看 <code>@types</code>{" "}
                    是怎么给没有类型的库补类型的。
                    先读懂别人的类型设计,才谈得上设计自己的。
                  </>
                }
              />
            </p>
            <p>
              <T
                en="A project you built and a pull request you sent say more than a certificate."
                zh="一个你写完的项目、一个你提过的 PR,比证书更有说服力。"
              />
            </p>
          </div>
        </div>

        <div className="ms-farewell">
          <span className="ms-farewell-mark" aria-hidden>
            ✦
          </span>
          <T
            en={
              <>
                <p>
                  One last thing. What this course taught is not syntax. It is a
                  way of looking at a program: <b>every value has a shape, and a
                  shape can be described, checked, and derived</b>. The
                  assumptions you carry in your head — &quot;this will not be
                  null here&quot;, &quot;in this state that field must
                  exist&quot; — can be written down instead, and handed to a
                  checker that never gets tired and never forgets.
                </p>
                <p>
                  It will not catch everything. Types are erased, the system is
                  not fully sound, and the data arriving from outside is still
                  your responsibility. What it does catch, it catches early,
                  while you are still looking at the code that caused it.
                </p>
                <p>
                  <b>
                    Whatever language you write next, you will start by asking
                    what the agreements are. That habit is what this course was
                    really for.
                  </b>
                </p>
              </>
            }
            zh={
              <>
                <p>
                  最后说一句。这门课教的不是语法,是一种看待程序的方式:
                  <b>每个值都有形状,而形状可以被描述、被检查、被推导</b>。
                  你脑子里那些默契 ——「这里不会是 null」
                  「这个状态下一定有那个字段」——
                  统统可以写下来,交给一个不会累、也不会忘的审查员。
                </p>
                <p>
                  它不会替你抓住所有问题。类型会被擦除,
                  类型系统并不完全健全,外部进来的数据仍然归你负责。
                  但它能抓住的那些,会抓得很早 ——
                  早到你还在看着造成问题的那段代码。
                </p>
                <p>
                  <b>
                    往后你写任何语言,都会先问一句「这里的约定是什么」。
                    这个习惯,才是这门课真正教给你的东西。
                  </b>
                </p>
              </>
            }
          />
        </div>
      </Section>

      <KeyPoints
        title={{
          en: "What to take away from the whole course",
          zh: "这一整门课,真正要带走的",
        }}
        points={[
          {
            en: (
              <>
                A type is an agreement written down. The compiler keeps the
                agreements you wrote; the ones you only remembered depend on
                luck.
              </>
            ),
            zh: (
              <>
                类型是写下来的约定:写下来的,编译器替你守;
                只记在脑子里的,只能靠运气。
              </>
            ),
          },
          {
            en: (
              <>
                The three forms: an annotation checks but widens,{" "}
                <code>as</code> neither checks nor keeps the literal,{" "}
                <code>satisfies</code> does both. Add <code>as const</code> when
                you need the literals kept exactly.
              </>
            ),
            zh: (
              <>
                三种写法:注解检查但拓宽,<code>as</code> 既不检查也不保留,
                <code>satisfies</code> 两样都做。需要精确保留字面量时,
                再加 <code>as const</code>。
              </>
            ),
          },
          {
            en: (
              <>
                Types are erased at compile time, so{" "}
                <b>nothing is checked at runtime</b>. Take external data in as{" "}
                <code>unknown</code> and narrow it with a check you wrote, so
                that a failure happens at the boundary rather than three files
                away.
              </>
            ),
            zh: (
              <>
                类型在编译期被擦除,所以<b>运行时没有任何类型检查</b>。
                外部数据一律用 <code>unknown</code> 接收,
                再用你自己写的检查收窄 ——
                让错误发生在边界,而不是三个文件之外。
              </>
            ),
          },
          {
            en: (
              <>
                The type system is deliberately not fully sound.{" "}
                <code>any</code>, assertions, array covariance, and unchecked
                indexing are real holes, so &quot;it compiles&quot; is not the
                same as &quot;it is correct&quot;.
              </>
            ),
            zh: (
              <>
                类型系统是刻意不完全健全的:<code>any</code>、断言、
                数组协变、未开检查的下标访问,都是真实存在的口子 ——
                「编译通过」不等于「代码正确」。
              </>
            ),
          },
          {
            en: (
              <>
                <code>any</code> is legitimate during a migration and at a
                genuinely dynamic boundary. The rule is containment: messy
                inside is fine, exported signatures must be precise. Reach for{" "}
                <code>unknown</code> first.
              </>
            ),
            zh: (
              <>
                <code>any</code> 在迁移期和真正动态的边界上是正当的。
                纪律是控制范围:内部可以乱,导出签名必须精确。
                先用 <code>unknown</code>。
              </>
            ),
          },
          {
            en: (
              <>
                The most useful thing types do is modeling: a discriminated
                union makes illegal states impossible to write, so the agreement
                stops being a comment. And when you are unsure, check it in the
                Playground instead of guessing.
              </>
            ),
            zh: (
              <>
                类型最有价值的用途是建模:可辨识联合让非法状态写不出来,
                约定就不再只是一句注释。拿不准的时候,
                去 Playground 验证,别猜。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="mindset" />
    </main>
  );
}
