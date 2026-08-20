"use client";

// 第 01 章 · 基础类型与推断(双语:正文用 <T en zh />,组件 props 用 { en, zh })——
// 身份证比喻 → 原始类型证件墙 → 数组/元组/对象 → 注解 vs 推断(放大镜)→
// 字面量与拓宽 → any 的诱惑 → 奶茶店案例 → 三个坑 → 动手 → 测验 → 要点。
//
// 代码示例:可执行行在两种语言里逐字节相同,只有注释分 en / zh;
// 因此 hl 行号在两种语言下一致。编译器报错原文一律不翻译。

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
import { LABS, QUIZ } from "@/lib/types-data";
import { HeroIdCards, IdWall, InferenceLens } from "./viz";

/* ---------- §03 数组、元组与对象 ---------- */

const ARR_CODE: Loc<string> = {
  en: `const sizes: string[] = ["small", "medium", "large"];
const prices: number[] = [12, 18, 22];

// The same type written with generic syntax (chapter 05 explains it):
const toppings: Array<string> = ["boba", "coconut jelly", "taro balls"];`,
  zh: `const sizes: string[] = ["small", "medium", "large"];
const prices: number[] = [12, 18, 22];

// 同一个类型的另一种写法(泛型语法,05 章细讲):
const toppings: Array<string> = ["boba", "coconut jelly", "taro balls"];`,
};

const TUPLE_CODE: Loc<string> = {
  en: `// An array type says nothing about length.
const prices: number[] = [12, 18, 22];  // 3 items today, 10 tomorrow

// A tuple fixes the length and the type of each position.
const entry: [string, number] = ["Oolong Tea", 12];

const swapped: [string, number] = [12, "Oolong Tea"];
// Type 'number' is not assignable to type 'string'.
// Type 'string' is not assignable to type 'number'.

entry.push("large"); // no error — push still works on a tuple
entry[2];
// Tuple type '[string, number]' of length '2' has no element at index '2'.`,
  zh: `// 数组类型不说明长度。
const prices: number[] = [12, 18, 22];  // 今天 3 个,明天 10 个都行

// 元组固定长度,并且规定每个位置的类型。
const entry: [string, number] = ["Oolong Tea", 12];

const swapped: [string, number] = [12, "Oolong Tea"];
// Type 'number' is not assignable to type 'string'.
// Type 'string' is not assignable to type 'number'.

entry.push("large"); // 不报错 —— 元组上的 push 依然可用
entry[2];
// Tuple type '[string, number]' of length '2' has no element at index '2'.`,
};

const OBJ_CODE: Loc<string> = {
  en: `// An object type lists the type of every property. That list is the shape.
const drink: { name: string; price: number } = {
  name: "Mango Sago",
  price: 22,
};

// Shapes can nest, and they can go inside arrays:
const combo: { title: string; items: string[] } = {
  title: "Afternoon set",
  items: ["Oolong Tea", "Grape Tea"],
};`,
  zh: `// 对象类型把每个属性的类型都写进花括号,这份清单就是「形状」。
const drink: { name: string; price: number } = {
  name: "Mango Sago",
  price: 22,
};

// 形状可以嵌套,也可以装进数组:
const combo: { title: string; items: string[] } = {
  title: "Afternoon set",
  items: ["Oolong Tea", "Grape Tea"],
};`,
};

/* ---------- §04 注解 vs 推断 ---------- */

const BOUNDARY_CODE: Loc<string> = {
  en: `// Inside a function body, inference is enough. No colon needed.
const basePrice = 18;
const withTopping = basePrice + 3;

// At a boundary, write it down. The annotation is a promise to the caller.
function applyDiscount(price: number, rate: number): number {
  return Math.round(price * rate);
}

// Declared first, assigned later: inference has nothing to read.
let firstOrder: string;
if (Math.random() > 0.5) firstOrder = "Oolong Tea";
else firstOrder = "Grape Tea";`,
  zh: `// 函数体内部:推断就够了,一个冒号都不用写。
const basePrice = 18;
const withTopping = basePrice + 3;

// 边界上:写出来。注解是给调用者的承诺。
function applyDiscount(price: number, rate: number): number {
  return Math.round(price * rate);
}

// 先声明、后赋值:推断没有材料可读。
let firstOrder: string;
if (Math.random() > 0.5) firstOrder = "Oolong Tea";
else firstOrder = "Grape Tea";`,
};

/* ---------- §05 字面量与拓宽 ---------- */

const LITERAL_CODE: Loc<string> = {
  en: `let size1 = "small";    // inferred as string (let widens)
const size2 = "small";  // inferred as "small" (const keeps the literal)

// One literal type alone does little. A union of them is useful:
type Size = "small" | "medium" | "large";

let cup: Size = "medium"; // ✓ on the list
cup = "large";            // ✓ on the list
cup = "mega";             // ✗ Type '"mega"' is not
                          //   assignable to type 'Size'.`,
  zh: `let size1 = "small";    // 推断为 string(let 会拓宽)
const size2 = "small";  // 推断为 "small"(const 保留字面量)

// 单个字面量类型没什么用,联合起来才有用:
type Size = "small" | "medium" | "large";

let cup: Size = "medium"; // ✓ 在名单上
cup = "large";            // ✓ 在名单上
cup = "mega";             // ✗ Type '"mega"' is not
                          //   assignable to type 'Size'.`,
};

/* ---------- §06 any ---------- */

const ANY_CODE: Loc<string> = {
  en: `let data: any = JSON.parse('{"price": 22}');

const total = data.prise * 2;      // key is misspelled, nobody complains
const label = total.toUpperCase(); // total is any too, still silent

// The program only fails when it runs:
// TypeError: total.toUpperCase is not a function
console.log(label);`,
  zh: `let data: any = JSON.parse('{"price": 22}');

const total = data.prise * 2;      // 键名拼错了,没人吭声
const label = total.toUpperCase(); // total 也成了 any,继续沉默

// 直到程序跑起来才出错:
// TypeError: total.toUpperCase is not a function
console.log(label);`,
};

/* ---------- §07 奶茶店案例 ---------- */

const MENU_INFER: Loc<string> = {
  en: `// No annotations at all. Inference already knows the shape:
const menu = [
  { name: "Mango Sago", price: 22, sizes: ["medium", "large"], soldOut: false },
  { name: "Oolong Tea", price: 12, sizes: ["small", "large"], soldOut: false },
];
// hover over menu: { name: string; price: number;
//                    sizes: string[]; soldOut: boolean }[]`,
  zh: `// 一个注解都没写,推断已经把形状认全了:
const menu = [
  { name: "Mango Sago", price: 22, sizes: ["medium", "large"], soldOut: false },
  { name: "Oolong Tea", price: 12, sizes: ["small", "large"], soldOut: false },
];
// 悬停 menu 看到的是:{ name: string; price: number;
//                     sizes: string[]; soldOut: boolean }[]`,
};

const MENU_PLAIN: Loc<string> = {
  en: `// No annotation: a typo gets into the menu and inference accepts it.
const menu = [
  { name: "Mango Sago", price: 22, soldOut: false },
  { name: "Oolong Tea", prise: 12, soldOut: false },
];

// The error only appears further downstream:
const cheap = menu.filter((m) => m.price < 15);
// error TS18048: 'm.price' is possibly 'undefined'.
//
// Why "possibly undefined" and not "does not exist"? For an array of
// object literals TypeScript builds a union of the two shapes and adds
// each missing property as optional. So price is number | undefined.`,
  zh: `// 不注解:错字混进了菜单,推断照单全收。
const menu = [
  { name: "Mango Sago", price: 22, soldOut: false },
  { name: "Oolong Tea", prise: 12, soldOut: false },
];

// 错误要到很远的下游才冒出来:
const cheap = menu.filter((m) => m.price < 15);
// error TS18048: 'm.price' is possibly 'undefined'.
//
// 为什么是「可能是 undefined」而不是「不存在」?对于一个由对象字面量
// 组成的数组,TS 会把两种形状合成一个联合类型,并把各自缺的属性
// 补成可选。于是 price 的类型成了 number | undefined。`,
};

const MENU_TYPED: Loc<string> = {
  en: `// Annotate at the boundary: the menu is shared data, so give it a shape.
type MenuItem = {
  name: string;
  price: number;
  soldOut: boolean;
};

const menu: MenuItem[] = [
  { name: "Mango Sago", price: 22, soldOut: false },
  { name: "Oolong Tea", prise: 12, soldOut: false },
  //                    ~~~~~ the error lands on the typo:
  // Object literal may only specify known properties,
  // but 'prise' does not exist in type 'MenuItem'.
  // Did you mean to write 'price'?
];`,
  zh: `// 在边界上注解:菜单是全店共用的数据,值得立一份形状。
type MenuItem = {
  name: string;
  price: number;
  soldOut: boolean;
};

const menu: MenuItem[] = [
  { name: "Mango Sago", price: 22, soldOut: false },
  { name: "Oolong Tea", prise: 12, soldOut: false },
  //                    ~~~~~ 错误当场落在错字上:
  // Object literal may only specify known properties,
  // but 'prise' does not exist in type 'MenuItem'.
  // Did you mean to write 'price'?
];`,
};

/* ---------- §08 三个坑 ---------- */

const EMPTY_ARR_CODE: Loc<string> = {
  en: `const toppings = [];        // no error here — the type is just any[]

function newCart() {
  const items = [];         // TS7034 is reported on this line
  return items;             // TS7005 is reported on this line
}

const safe: string[] = []; // ✓ label the empty box now, and push is checked`,
  zh: `const toppings = [];        // 这行不报错 —— 类型就是 any[]

function newCart() {
  const items = [];         // 这一行报 TS7034
  return items;             // 这一行报 TS7005
}

const safe: string[] = []; // ✓ 空箱子出生就贴标签,之后 push 全受检`,
};

export default function TypesPage() {
  return (
    <main className="page" data-ch="types">
      <Hero
        ch="types"
        title={{
          en: (
            <>
              Give every value an <span className="grad">ID card</span>
            </>
          ),
          zh: (
            <>
              给每个值一张<span className="grad">身份证</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              string, number, boolean — a type is just the label a value carries
              with it. The useful part is that you rarely have to write the
              label yourself. TypeScript looks at the value and fills it in.
              That is called inference.
            </>
          ),
          zh: (
            <>
              string、number、boolean…… 类型没那么神秘,
              就是每个值随身带的一张标签。更省事的是:
              大多数标签不用你写 —— TypeScript
              看一眼值,自己就填好了。这手本事叫推断。
            </>
          ),
        }}
        chips={[
          { id: "idcard", n: "01", label: { en: "The ID card idea", zh: "身份证比喻" } },
          { id: "prims", n: "02", label: { en: "Primitive types", zh: "原始类型" } },
          { id: "shapes", n: "03", label: { en: "Arrays, tuples, objects", zh: "数组、元组、对象" } },
          { id: "infer", n: "04", label: { en: "Annotation vs inference", zh: "注解 vs 推断" } },
          { id: "literal", n: "05", label: { en: "Literals and widening", zh: "字面量与拓宽" } },
          { id: "any", n: "06", label: { en: "The cost of any", zh: "any 的代价" } },
          { id: "milktea", n: "07", label: { en: "Menu case study", zh: "奶茶店案例" } },
          { id: "pitfalls", n: "08", label: { en: "Three pitfalls", zh: "三个坑" } },
          { id: "labs", n: "09", label: { en: "Practice", zh: "动手" } },
          { id: "quiz", n: "10", label: { en: "Quiz", zh: "测验" } },
        ]}
      >
        <HeroIdCards />
      </Hero>

      {/* ================= §01 身份证比喻 ================= */}
      <Section
        id="idcard"
        index="01"
        title={{ en: "Every value gets an ID card", zh: "每个值,发一张身份证" }}
        desc={{
          en: "The whole chapter grows out of this one comparison.",
          zh: "这一章的全部内容,都长在这一个比喻上。",
        }}
      >
        <Callout
          tone="story"
          title={{ en: "The stockroom", zh: "奶茶店的进货间" }}
        >
          <T
            en={
              <>
                <p>
                  You run a tea shop. The stockroom is full of boxes, and every
                  box has a label: &quot;boba, bagged, 5 kg&quot;, &quot;coconut
                  milk, canned, perishable&quot;.{" "}
                  <b>
                    You know what each box can and cannot be used for without
                    opening it.
                  </b>
                </p>
                <p>
                  TypeScript puts the same kind of label on every value in your
                  program. The label is called a <b>type</b>: the name field is
                  a string, the price field is a number. Every time you use the
                  value, the compiler reads the label first. If you try to
                  multiply a string, the label does not allow it and you get an
                  error.
                </p>
                <p>
                  You never write most of these labels. Type{" "}
                  <code>let price = 22</code> and TypeScript reads the 22 on the
                  right and fills the label in. That is called{" "}
                  <b>inference</b>. You only write the label by hand in a few
                  places, which is called an <b>annotation</b>. Section 04 says
                  exactly where.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  你是店长。进货间堆着几十个箱子,每个箱子上贴着标签:
                  「珍珠 · 袋装 · 5kg」「椰浆 · 罐装 · 易腐」。
                  <b>不用开箱,你就知道每箱能干什么、不能干什么。</b>
                </p>
                <p>
                  TypeScript 给程序里的每个值也贴这么一张标签,学名叫
                  <b>类型(type)</b>:name 这一栏是 string,price 这一栏是
                  number。之后你每次用这个值,编译器都先看一眼标签:
                  拿 string 去做乘法?标签不允许,报错。
                </p>
                <p>
                  大多数标签你从来不用写。写下 <code>let price = 22</code>,TS
                  看一眼右边的 22 就把标签填好了 —— 这叫
                  <b>推断(inference)</b>。只有少数地方需要你亲手写,
                  也就是<b>注解(annotation)</b>,§04 讲清楚是哪几处。
                </p>
              </>
            }
          />
        </Callout>
        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">
              <T en="Exists at runtime" zh="运行时存在" />
            </div>
            <div className="card-title">
              <T en="Value" zh="值(value)" />
            </div>
            <p>
              <T
                en={
                  <>
                    The real things in the program: 22, &quot;Oolong Tea&quot;,
                    an order object. These are what the program actually works
                    with when it runs.
                  </>
                }
                zh={
                  <>
                    程序里真实存在的东西:22、&quot;Oolong Tea&quot;、
                    一个订单对象。运行时真正干活的是它们。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Erased at compile time" zh="编译期被擦除" />
            </div>
            <div className="card-title">
              <T en="Type" zh="类型(type)" />
            </div>
            <p>
              <T
                en={
                  <>
                    A description of a value: what it is, which fields it has.
                    Types exist only while the compiler runs. The compiler
                    removes every annotation, <code>type</code>, and{" "}
                    <code>interface</code> and emits plain JavaScript, so
                    nothing checks types at runtime unless you write that check
                    yourself.
                  </>
                }
                zh={
                  <>
                    对值的描述:是什么、有哪些字段。类型只在编译期存在。
                    编译器会把所有注解、<code>type</code>、
                    <code>interface</code> 全部删掉,产出普通 JavaScript ——
                    所以运行时没有任何类型检查,除非那段检查是你自己写的。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Does the checking" zh="负责检查" />
            </div>
            <div className="card-title">
              <T en="The compiler (tsc)" zh="编译器(tsc)" />
            </div>
            <p>
              <T
                en={
                  <>
                    It fills in labels (inference) and reads them (checking).
                    When an operation does not match the label, it reports an
                    error before the code ever runs.
                  </>
                }
                zh={
                  <>
                    它负责填标签(推断)和读标签(检查)。
                    发现某个操作和标签对不上,就在代码运行之前报错。
                  </>
                }
              />
            </p>
          </div>
        </div>
      </Section>

      {/* ================= §02 原始类型 ================= */}
      <Section
        id="prims"
        index="02"
        title={{
          en: "Primitive types: the seven basic ones",
          zh: "原始类型:七户常住人口",
        }}
        desc={{
          en: "You meet string, number, and boolean every day. null and undefined are two different ways of saying there is no value. bigint and symbol are rare, but worth recognizing. Click a value to see its type.",
          zh: "string、number、boolean 你天天见;null 和 undefined 是两种不同的「没有值」;bigint、symbol 少见,认个脸就行。点一个值试试。",
        }}
      >
        <IdWall />
        <Callout
          tone="idea"
          title={{
            en: "Learn the first five well, and just recognize the last two",
            zh: "先认前五户,后两户认个脸就行",
          }}
        >
          <T
            en={
              <>
                <p>
                  Almost all everyday code deals with string, number, boolean,
                  null, and undefined. <b>The difference between null and
                  undefined is worth one sentence</b>: undefined is the value
                  you get when nothing was ever assigned (no initial value, a
                  missing property, a function that returns nothing), and null
                  is a value someone assigned on purpose to mean
                  &quot;empty&quot;.
                </p>
                <p>
                  They are separate types only because{" "}
                  <code>strictNullChecks</code> is on. Turn that flag off and
                  null and undefined can be assigned to every type, so the
                  compiler stops catching this whole class of mistake. Chapter
                  10 covers the flag itself.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  日常写码 95% 的时间在跟 string、number、boolean、null、
                  undefined 打交道。<b>null 和 undefined 的区别值得记一句</b>:
                  undefined 是「从来没人赋过值」时你拿到的东西(没写初始值、
                  属性不存在、函数没有 return);null 是有人特意赋进去的、
                  表示「空」的值。
                </p>
                <p>
                  它们之所以是两个独立的类型,是因为{" "}
                  <code>strictNullChecks</code> 开着。这个开关一关,
                  null 和 undefined 可以赋给任何类型,这一整类错误编译器就不再管了。
                  开关本身第 10 章细讲。
                </p>
              </>
            }
          />
        </Callout>
      </Section>

      {/* ================= §03 数组、元组与对象 ================= */}
      <Section
        id="shapes"
        index="03"
        title={{
          en: "Containers: arrays, tuples, and object shapes",
          zh: "装起来:数组、元组与对象的形状",
        }}
        desc={{
          en: "A single value has a type, and so does a container of values. An array type names the element type. A tuple also fixes the length. An object type names the type of each property.",
          zh: "单个值有类型,一箱值也有类型:数组写元素类型,元组还固定长度,对象写每个属性的类型。",
        }}
      >
        <CodeBlock
          lang="ts"
          title={{ en: "Arrays: element type + []", zh: "数组:元素类型 + []" }}
          code={ARR_CODE}
          note={
            <T
              en={
                <>
                  <code>string[]</code> is read as &quot;array of string&quot;.{" "}
                  <code>Array&lt;string&gt;</code> means exactly the same thing.
                  For simple element types most code uses the first form because
                  it is shorter.
                </>
              }
              zh={
                <>
                  <code>string[]</code> 读作「string 的数组」。
                  <code>Array&lt;string&gt;</code> 是完全相同的意思。
                  元素类型简单时,社区习惯用前者,因为短。
                </>
              }
            />
          }
        />
        <CodeBlock
          lang="ts"
          title={{
            en: "Tuples: a fixed length, and a type per position",
            zh: "元组:固定长度,每个位置一个类型",
          }}
          code={TUPLE_CODE}
          hl={[5, 11]}
          note={
            <T
              en={
                <>
                  An array type such as <code>number[]</code> says nothing about
                  how many elements there are. A tuple such as{" "}
                  <code>[string, number]</code> says there are exactly two, and
                  says what each one is. One surprise:{" "}
                  <b>
                    <code>push</code> on a tuple is still allowed
                  </b>
                  , because a tuple is still an ordinary array at runtime. The
                  fixed length is checked when you build the value and when you
                  index into it, not when you mutate it later. Add{" "}
                  <code>readonly</code> if you need the mutation blocked too.
                </>
              }
              zh={
                <>
                  <code>number[]</code> 这样的数组类型完全不说明元素有几个;
                  <code>[string, number]</code> 这样的元组则明确说「就两个」,
                  并且规定每个位置是什么。有一个反直觉的点:
                  <b>
                    元组上的 <code>push</code> 依然合法
                  </b>
                  ,因为元组在运行时仍然是个普通数组。
                  固定长度只在构造这个值和用下标取值时检查,后续修改不查。
                  想连修改一起禁掉,给它加 <code>readonly</code>。
                </>
              }
            />
          }
        />
        <CodeBlock
          lang="ts"
          title={{
            en: "Objects: the shape goes in the braces",
            zh: "对象:花括号里描形状",
          }}
          code={OBJ_CODE}
          note={
            <T
              en={
                <>
                  <code>{"{ name: string; price: number }"}</code> is itself a
                  type, written inline. It is called an{" "}
                  <b>object type literal</b>, and the properties are separated
                  by semicolons. Shapes nest and go into arrays, which is how
                  almost all real data gets described. Optional properties (
                  <code>?</code>), <code>interface</code>, and{" "}
                  <code>type</code> aliases are the whole of the next chapter.
                </>
              }
              zh={
                <>
                  <code>{"{ name: string; price: number }"}</code>{" "}
                  本身就是一个类型,直接写在原地,叫<b>对象类型字面量</b>,
                  属性之间用分号隔开。形状能嵌套、能进数组 ——
                  真实项目的数据几乎都是这样描述出来的。可选属性{" "}
                  <code>?</code>、<code>interface</code> 和 <code>type</code>{" "}
                  别名,是下一章的全部内容。
                </>
              }
            />
          }
        />
      </Section>

      {/* ================= §04 注解 vs 推断 ================= */}
      <Section
        id="infer"
        index="04"
        title={{
          en: "Annotation vs inference: when do you write the type yourself?",
          zh: "注解 vs 推断:什么时候要你亲手写",
        }}
        desc={{
          en: "An annotation is a promise. Inference is an observation. First look at how much the compiler works out on its own.",
          zh: "注解是承诺,推断是观察。先看看编译器自己能看出多少。",
        }}
      >
        <InferenceLens />
        <p className="sec-desc" style={{ marginTop: 18 }}>
          <T
            en={
              <>
                For a local variable that is assigned right where it is
                declared, inference covers everything. So where do annotations
                belong? <b>At the boundaries</b>: anywhere other code depends on
                the type, and anywhere inference has nothing to read.
              </>
            }
            zh={
              <>
                局部变量这种「声明的同时就赋值」的场合,推断全包了。
                那注解该写在哪?<b>写在边界上</b> ——
                凡是别的代码要依赖这个类型的地方,以及推断无从下手的地方。
              </>
            }
          />
        </p>
        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">
              <T en="Boundary 1" zh="边界一" />
            </div>
            <div className="card-title">
              <T
                en="Function parameters and return types"
                zh="函数参数与返回值"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    A parameter comes from outside, so inference has nothing to
                    read. Under <code>noImplicitAny</code> you{" "}
                    <b>have to write it</b>. A return type can be inferred, but
                    writing it makes the promise explicit, which is worth doing
                    for exported functions.
                  </>
                }
                zh={
                  <>
                    参数是外面塞进来的,推断没有材料;开着{" "}
                    <code>noImplicitAny</code> 时<b>必须写</b>。
                    返回值可以推断,但写出来等于把承诺讲明白 ——
                    对外导出的函数建议写。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Boundary 2" zh="边界二" />
            </div>
            <div className="card-title">
              <T en="Public API and shared data" zh="公共 API / 共享数据" />
            </div>
            <p>
              <T
                en={
                  <>
                    Exported constants, a menu structure the whole app reads:
                    give them a named type. It becomes the contract, and anyone
                    who puts the wrong thing in gets an error at that line.
                  </>
                }
                zh={
                  <>
                    导出的常量、全店共用的菜单结构 —— 给它们一个具名类型。
                    这份类型就是契约,谁塞错东西,就在那一行报错。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Boundary 3" zh="边界三" />
            </div>
            <div className="card-title">
              <T en="Declared first, assigned later" zh="先声明,后赋值" />
            </div>
            <p>
              <T
                en={
                  <>
                    At the moment of declaration there is no value on the right,
                    so there is nothing to infer from. You have to say what this
                    variable will hold.
                  </>
                }
                zh={
                  <>
                    声明那一刻右边没有值,推断没有依据 ——
                    这时你得亲口说这个变量将来装什么。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <CodeBlock
          lang="ts"
          title={{
            en: "boundary.ts · all three boundaries at once",
            zh: "boundary.ts · 三种边界一次看",
          }}
          code={BOUNDARY_CODE}
          hl={[6]}
          note={
            <T
              en={
                <>
                  <b>An annotation is a promise. Inference is an
                  observation.</b>{" "}
                  Where the observation is already correct, adding a colon does
                  not make the code safer. It only makes the real contracts
                  harder to find. Section 08 comes back to this.
                </>
              }
              zh={
                <>
                  <b>注解是承诺,推断是观察。</b>
                  观察已经对了的地方再加一个冒号,不会让代码更安全,
                  只会让真正的契约更难被看见。§08 还会说到它。
                </>
              }
            />
          }
        />
      </Section>

      {/* ================= §05 字面量与拓宽 ================= */}
      <Section
        id="literal"
        index="05"
        title={{
          en: "Literal types and widening: a type can be one exact value",
          zh: "字面量类型与拓宽:类型可以精确到「就是这一个值」",
        }}
        desc={{
          en: "The let / const difference from the previous section deserves a closer look. It is the entry point to unions in chapter 03.",
          zh: "上面放大镜里 let 和 const 的差别值得单独一节 —— 它是第 03 章联合类型的入口。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                A type can be wide, meaning any string at all. It can also be
                narrow, meaning exactly the string{" "}
                <code>&quot;small&quot;</code> and nothing else. The narrow one
                is called a <b>literal type</b>. Which one you get depends on
                how the variable was declared.{" "}
                <code>let</code> relaxes the literal into string, and that step
                is called <b>widening</b>. <code>const</code> keeps the literal.
                The reason is simple: a <code>let</code> variable is meant to be
                reassigned, so a type that only allows one value would be
                unusable.
              </>
            }
            zh={
              <>
                类型可以很宽(「是个字符串」),也可以很窄(「就是{" "}
                <code>&quot;small&quot;</code> 这个字符串」)。
                窄的那种叫<b>字面量类型(literal type)</b>。
                拿到哪一种,取决于变量是怎么声明的:<code>let</code>{" "}
                会把字面量放宽成 string,这个动作叫<b>拓宽(widening)</b>;
                <code>const</code> 则保留字面量。道理很直白:
                <code>let</code> 变量本来就是要重新赋值的,
                类型只允许一个值就没法用了。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title={{
            en: "size.ts · the list of cup sizes",
            zh: "size.ts · 奶茶店的杯型名单",
          }}
          code={LITERAL_CODE}
          hl={[9]}
          note={
            <T
              en={
                <>
                  <code>
                    &quot;small&quot; | &quot;medium&quot; | &quot;large&quot;
                  </code>{" "}
                  is read as &quot;one of these three&quot;. That is a{" "}
                  <b>union of literal types</b>: the list of allowed values is
                  written into the type itself, so a wrong size is rejected when
                  you save the file. The vertical bar <code>|</code> is the
                  subject of chapter 03.
                </>
              }
              zh={
                <>
                  <code>
                    &quot;small&quot; | &quot;medium&quot; | &quot;large&quot;
                  </code>{" "}
                  读作「三者之一」,这就是<b>字面量联合</b>:
                  把「只能取这几个值」写进类型本身,
                  错杯型在你保存文件那一刻就被拦下。竖线 <code>|</code>{" "}
                  是第 03 章的主角。
                </>
              }
            />
          }
        />
        <Callout
          tone="warn"
          title={{
            en: "const locks the variable, not the contents",
            zh: "const 锁的是变量,不是内容",
          }}
        >
          <T
            en={
              <>
                <p>
                  <code>const size = &quot;small&quot;</code> has the literal
                  type <code>&quot;small&quot;</code>. But{" "}
                  <code>const sizes = [&quot;small&quot;]</code> is{" "}
                  <code>string[]</code>, and{" "}
                  <code>const d = {"{ price: 22 }"}</code> is{" "}
                  <code>{"{ price: number }"}</code>. <b>
                    Array elements and object properties still widen
                  </b>
                  , because <code>const</code> only prevents reassigning the
                  variable name. The contents can still change.
                </p>
                <p>
                  To keep the literal types inside a structure, write{" "}
                  <code>as const</code>:{" "}
                  <code>const d = {"{ price: 22 }"} as const</code> has the type{" "}
                  <code>{"{ readonly price: 22 }"}</code>. The final chapter
                  covers it.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  <code>const size = &quot;small&quot;</code> 的类型是字面量{" "}
                  <code>&quot;small&quot;</code>。但{" "}
                  <code>const sizes = [&quot;small&quot;]</code> 的类型是{" "}
                  <code>string[]</code>,
                  <code>const d = {"{ price: 22 }"}</code> 的类型是{" "}
                  <code>{"{ price: number }"}</code>。
                  <b>数组元素和对象属性照样拓宽</b>,因为 <code>const</code>{" "}
                  只阻止重新给变量名赋值,内容还是能改。
                </p>
                <p>
                  想把结构内部的字面量类型也保住,要写 <code>as const</code>:
                  <code>const d = {"{ price: 22 }"} as const</code> 的类型是{" "}
                  <code>{"{ readonly price: 22 }"}</code>。终章细讲。
                </p>
              </>
            }
          />
        </Callout>
        <Callout
          tone="deep"
          title={{
            en: "Why is this so much better than string?",
            zh: "为什么这招比 string 强这么多?",
          }}
        >
          <T
            en={
              <>
                If a cup size is typed as string, then &quot;mega&quot;,
                &quot;Large&quot;, and &quot;LARGE&quot; are all legal, and a
                typo still costs you at runtime. With a union of literals,
                anything outside the list is <b>rejected at compile time</b>.
                The narrower the set of legal values, the more the compiler can
                catch for you. This idea runs through the whole course and
                chapter 03 uses it heavily.
              </>
            }
            zh={
              <>
                用 string 存杯型,&quot;mega&quot;、&quot;Large&quot;、
                &quot;LARGE&quot; 全都合法,写错的代价照旧发生在运行时。
                用字面量联合,名单之外的值<b>编译期直接拒收</b>。
                合法值的范围收得越窄,编译器能替你挡的就越多 ——
                这是贯穿全书的思路,03 章开始大量使用。
              </>
            }
          />
        </Callout>
      </Section>

      {/* ================= §06 any ================= */}
      <Section
        id="any"
        index="06"
        title={{
          en: "any: the switch that turns checking off",
          zh: "any:把检查关掉的那个开关",
        }}
        desc={{
          en: "any does not mean 'any type'. It means 'do not check this'. And it spreads to whatever the value touches.",
          zh: "any 不是「任意类型」,是「别检查我」。而且它会顺着这个值扩散出去。",
        }}
      >
        <CodeBlock
          lang="ts"
          title={{ en: "any.ts · how it spreads", zh: "any.ts · 扩散现场" }}
          code={ANY_CODE}
          hl={[3, 4]}
          note={
            <T
              en={
                <>
                  Both highlighted lines contain a real bug. The key{" "}
                  <code>prise</code> is misspelled, and nothing reports it. Then{" "}
                  <code>total</code> becomes any as well, so calling{" "}
                  <code>toUpperCase()</code> on a number is also accepted. Both
                  mistakes survive until the program runs, exactly as they would
                  in plain JavaScript.
                </>
              }
              zh={
                <>
                  两行高亮都藏着真错误:键名 <code>prise</code>{" "}
                  拼错了,没人报;然后 <code>total</code> 也成了 any,
                  于是拿一个数字调 <code>toUpperCase()</code> 同样被放行。
                  两个错都活到了运行时 —— 和裸写 JavaScript 一模一样。
                </>
              }
            />
          }
        />
        <Callout
          tone="warn"
          title={{
            en: "Two things any does to your code",
            zh: "any 干的两件事",
          }}
        >
          <T
            en={
              <>
                <p>
                  <b>It turns checking off.</b> Once a value is any, the
                  compiler accepts any operation on it: a misspelled property, a
                  method that does not exist, a wrong argument. All silent.
                </p>
                <p>
                  <b>It spreads.</b> A property read from an any value, a result
                  computed from it, a callback parameter it is passed to — all
                  become any. One any can quiet an entire chain of code.
                </p>
                <p>
                  This does not mean you must never use it. It is useful while
                  migrating an old JavaScript project, and sometimes as a
                  short-term escape (the final chapter discusses when it is
                  reasonable). The rule is: <b>use it deliberately, and know
                  what you switched off</b>. There is also a safe alternative,{" "}
                  <code>unknown</code>: it accepts any value, but it lets you do
                  almost nothing with that value until you check what it is.
                  Chapter 03 covers it.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  <b>一,关掉检查。</b>值一旦是 any,
                  对它做任何操作编译器都放行:属性拼错、方法不存在、参数传错,
                  全部沉默。
                </p>
                <p>
                  <b>二,会扩散。</b>从 any
                  值上取的属性、由它算出的结果、把它传进去的回调参数,
                  统统变成 any。一个 any 能让一整条数据流失去检查。
                </p>
                <p>
                  这不等于永远不能用。迁移老 JavaScript
                  项目时它有用,偶尔也可以当临时出口(终章专门讨论「何时 any
                  合理」)。原则是:<b>有意识地用,并且清楚自己关掉了什么</b>。
                  另外还有一个安全的替代品 <code>unknown</code>:
                  它接受任何值,但在你检查清楚它到底是什么之前,
                  几乎什么都不让你做。03 章细讲。
                </p>
              </>
            }
          />
        </Callout>
        <p className="sec-desc">
          <T
            en={
              <>
                There is also an any you did not write: an implicit one. An
                unannotated function parameter is the most common source. The
                compiler option <code>noImplicitAny</code>, part of the{" "}
                <code>strict</code> family, reports every place where a type
                silently falls back to any. The TypeScript Playground has{" "}
                <code>strict</code> on by default, so you will see this option
                working in the practice tasks.
              </>
            }
            zh={
              <>
                还有一种你没写、自己长出来的 any ——
                最常见的来源是没标类型的函数参数。<code>strict</code> 家族里的{" "}
                <code>noImplicitAny</code>{" "}
                专门管这个:凡是类型悄悄退化成 any 的地方一律报错。
                TypeScript Playground 默认开着 <code>strict</code>,
                所以你在动手任务里会亲眼见到它工作。
              </>
            }
          />
        </p>
      </Section>

      {/* ================= §07 奶茶店案例 ================= */}
      <Section
        id="milktea"
        index="07"
        title={{
          en: "Case study: typing the menu",
          zh: "奶茶店开工:给菜单立类型",
        }}
        desc={{
          en: "The first episode of the running example. One case shows what inference handles and what an annotation is for.",
          zh: "全书贯穿案例第一集 —— 一个例子看明白推断和注解各站什么岗。",
        }}
      >
        <CodeBlock
          lang="ts"
          title={{
            en: "menu.ts · step 1: let inference do the work",
            zh: "menu.ts · 第一步:先让推断干活",
          }}
          code={MENU_INFER}
          note={
            <T
              en={
                <>
                  Without a single annotation, TypeScript already has the full
                  shape of the menu. Inference is enough for a local value. But
                  the menu is not local: it is{" "}
                  <b>shared data that ordering, checkout, and stock all read</b>
                  . That makes it a boundary.
                </>
              }
              zh={
                <>
                  一个注解都没写,TS 已经把菜单的形状完整推了出来 ——
                  局部值有推断就够了。但菜单不是局部值:它是
                  <b>点单、结算、库存都要读的共享数据</b>,也就到了边界。
                </>
              }
            />
          }
        />
        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title={{
                en: "No annotation · the error surfaces downstream",
                zh: "不注解 · 错误在下游才浮现",
              }}
              code={MENU_PLAIN}
              hl={[4, 8]}
              note={
                <T
                  en={
                    <>
                      Inference accepts what it is given, so <code>prise</code>{" "}
                      is recorded as a real field. Nothing is reported until{" "}
                      <code>filter</code> reads <code>price</code>, and the
                      error then points at{" "}
                      <b>code that did nothing wrong</b>.
                    </>
                  }
                  zh={
                    <>
                      推断照单全收,<code>prise</code>{" "}
                      被当成一个真实字段记了下来。
                      在 <code>filter</code> 用到 <code>price</code>{" "}
                      之前什么都不报,而报错时指向的是
                      <b>并没有写错的那段代码</b>。
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
                en: "Annotated as MenuItem[] · caught on the spot",
                zh: "注解成 MenuItem[] · 当场落网",
              }}
              code={MENU_TYPED}
              hl={[10]}
              note={
                <T
                  en={
                    <>
                      With the <code>MenuItem</code> contract in place, the
                      error lands <b>on the line with the typo</b>, and it even
                      suggests the fix. That is what &quot;annotate at the
                      boundary&quot; buys you: the place that reports the error
                      is the place that contains the mistake.
                    </>
                  }
                  zh={
                    <>
                      立了 <code>MenuItem</code> 这份契约之后,错误
                      <b>精确落在写错的那一行</b>,还附带改法。
                      这就是「在边界上注解」的回报:
                      报错的位置就是犯错的位置。
                    </>
                  }
                />
              }
            />
          }
        />
        <Callout
          tone="win"
          title={{ en: "What this episode showed", zh: "本集小结" }}
        >
          <T
            en={
              <>
                Leave local variables to inference, and write a contract for
                shared data. The <code>MenuItem</code> shape follows us through
                the rest of the course: chapter 03 adds the{" "}
                <code>Size</code> union and an order status, chapter 05 puts it
                inside a generic container, and chapters 06 and 07 reshape it
                with utility types.
              </>
            }
            zh={
              <>
                局部变量交给推断,共享数据立契约。<code>MenuItem</code>{" "}
                这份形状会跟着我们走完全书:03 章给它加上 <code>Size</code>{" "}
                联合和订单状态,05 章用泛型把它装起来,06、07
                章再用工具类型改造它。
              </>
            }
          />
        </Callout>
      </Section>

      {/* ================= §08 三个坑 ================= */}
      <Section
        id="pitfalls"
        index="08"
        title={{
          en: "Three beginner mistakes, fixed now",
          zh: "三个新手坑,现在就填",
        }}
        desc={{
          en: "All three show up repeatedly in real projects. One minute each.",
          zh: "都是真实项目里反复出现的,每个一分钟。",
        }}
      >
        <Callout
          tone="warn"
          title={{
            en: "Mistake 1: String is not string",
            zh: "坑一:String 不是 string",
          }}
        >
          <T
            en={
              <>
                Capital <code>String</code> is the type of the wrapper object
                created by <code>new String()</code>, not the primitive string.
                A <code>String</code> is not assignable to a{" "}
                <code>string</code>, so using it produces confusing errors.{" "}
                <b>Annotations always use the lowercase names</b>: string,
                number, boolean. Treat <code>String</code>, <code>Number</code>,
                and <code>Boolean</code> as if they did not exist.
              </>
            }
            zh={
              <>
                大写的 <code>String</code> 是 <code>new String()</code>{" "}
                造出来的那个包装对象的类型,不是原始字符串。
                <code>String</code> 不能赋给 <code>string</code>,
                写了它就会遇到一串莫名其妙的兼容错误。
                <b>注解一律用小写</b>:string、number、boolean。大写的{" "}
                <code>String</code> / <code>Number</code> /{" "}
                <code>Boolean</code>,当它们不存在。
              </>
            }
          />
        </Callout>
        <Callout
          tone="warn"
          title={{
            en: "Mistake 2: annotating everything adds noise, not safety",
            zh: "坑二:到处写注解,是噪音不是严谨",
          }}
        >
          <T
            en={
              <>
                In <code>let count: number = 0</code> the annotation repeats
                what the compiler already read from the 0. It takes up space and
                it buries the annotations that actually matter. Let inference
                handle the obvious cases and keep annotations for the three
                boundaries in section 04. Then a reader can quickly see where the
                contracts are.
              </>
            }
            zh={
              <>
                <code>let count: number = 0</code>{" "}
                里的注解,只是把编译器从 0 那里已经读到的信息又说了一遍。
                它占地方,还会把真正重要的注解淹没掉。
                显而易见的地方交给推断,注解留给 §04 说的三种边界 ——
                这样读代码的人一眼就能看出契约在哪。
              </>
            }
          />
        </Callout>
        <Callout
          tone="warn"
          title={{
            en: "Mistake 3: an empty array becomes any[]",
            zh: "坑三:空数组会落成 any[]",
          }}
        >
          <T
            en={
              <>
                An empty array has no elements, so there is nothing to infer the
                element type from, and TypeScript records{" "}
                <code>any[]</code>. It then tries to work the type out from
                later <code>push</code> calls in the same scope, which is called
                an evolving array. That guess stops working as soon as the value
                leaves the function or is used before it is filled, and{" "}
                <code>noImplicitAny</code> reports it.{" "}
                <b>Give the empty box a label when you create it.</b>
              </>
            }
            zh={
              <>
                空数组没有元素,推断不出元素类型,TS 只能先记成{" "}
                <code>any[]</code>。它接着会尝试从同一作用域后面的{" "}
                <code>push</code> 反推类型,这叫「演化数组」。
                但只要这个值离开函数,或者在填进内容之前就被使用,
                这套猜测就失效了,<code>noImplicitAny</code> 会当场报错。
                <b>好习惯:空箱子出生就贴标签。</b>
              </>
            }
          />
        </Callout>
        <CodeBlock
          lang="ts"
          title={{
            en: "empty.ts · mistake 3 in action",
            zh: "empty.ts · 坑三现场",
          }}
          code={EMPTY_ARR_CODE}
          hl={[8]}
          note={
            <T
              en={
                <>
                  The two messages in full: TS7034 is{" "}
                  <i>
                    Variable &apos;items&apos; implicitly has type
                    &apos;any[]&apos; in some locations where its type cannot be
                    determined
                  </i>
                  , and TS7005 is{" "}
                  <i>
                    Variable &apos;items&apos; implicitly has an
                    &apos;any[]&apos; type
                  </i>
                  . Note that the top-level <code>toppings</code> line produces
                  no error at all; its type is simply <code>any[]</code>. One
                  annotation, <code>const safe: string[] = []</code>, removes
                  the whole problem, and every later <code>push</code> is
                  checked.
                </>
              }
              zh={
                <>
                  两条报错的完整原文:TS7034 是{" "}
                  <i>
                    Variable &apos;items&apos; implicitly has type
                    &apos;any[]&apos; in some locations where its type cannot be
                    determined
                  </i>
                  ,TS7005 是{" "}
                  <i>
                    Variable &apos;items&apos; implicitly has an
                    &apos;any[]&apos; type
                  </i>
                  。注意顶层那行 <code>toppings</code> 完全不报错,
                  它的类型就是 <code>any[]</code>。一行注解{" "}
                  <code>const safe: string[] = []</code>{" "}
                  就能解决全部问题,之后每一次 <code>push</code> 都受检。
                </>
              }
            />
          }
        />
      </Section>

      {/* ================= §09 动手任务 ================= */}
      <Section
        id="labs"
        index="09"
        title={{ en: "Practice", zh: "动手任务" }}
        desc={{
          en: "Five tasks, all in the TypeScript Playground, about fifteen minutes. For inference, hovering once teaches more than reading ten times.",
          zh: "五个任务,全在 TypeScript Playground 里,十五分钟 —— 推断这件事,hover 一次胜过读十遍。",
        }}
      >
        <LabSet ch="types" items={LABS} />
      </Section>

      {/* ================= §10 通关测验 ================= */}
      <Section
        id="quiz"
        index="10"
        title={{ en: "Chapter quiz", zh: "通关测验" }}
        desc={{
          en: "Eight questions covering inference, widening, any, and the empty array. Answer all of them correctly to light the green dot in the sidebar.",
          zh: "八道题,覆盖推断、拓宽、any 和空数组。全对点亮侧栏绿灯。",
        }}
      >
        <Quiz ch="types" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                A type is the label a value carries. <b>Inference means the
                compiler reads that label for you</b>, so most local variables
                need no annotation at all. Types are removed during compilation:
                nothing checks them while the program runs.
              </>
            ),
            zh: (
              <>
                类型就是值随身带的标签。<b>推断 = 编译器替你读这张标签</b>,
                所以大多数局部变量一个冒号都不用写。
                类型在编译时被删除:程序运行时没有任何东西再检查它们。
              </>
            ),
          },
          {
            en: (
              <>
                Seven primitive types. You use string, number, boolean, null,
                and undefined daily; bigint and symbol are rare. undefined means
                &quot;never assigned&quot;, null means &quot;deliberately
                empty&quot;, and <code>strictNullChecks</code> is what keeps
                them separate from every other type.
              </>
            ),
            zh: (
              <>
                原始类型七户:string / number / boolean / null / undefined
                天天见,bigint / symbol 少见。undefined 是「从没赋过值」,
                null 是「特意留空」,而让它们不混进其他类型的开关是{" "}
                <code>strictNullChecks</code>。
              </>
            ),
          },
          {
            en: (
              <>
                <b>An annotation is a promise, inference is an observation.</b>{" "}
                Write annotations at the boundaries: function parameters and
                return types, shared and exported data, and variables declared
                before they are assigned.
              </>
            ),
            zh: (
              <>
                <b>注解是承诺,推断是观察。</b>注解写在边界上 ——
                函数参数与返回值、共享和导出的数据、先声明后赋值的变量。
              </>
            ),
          },
          {
            en: (
              <>
                <code>let</code> widens (<code>&quot;small&quot;</code> becomes
                string), <code>const</code> keeps the literal type. But{" "}
                <code>const</code> does not lock the <b>contents</b>: array
                elements and object properties still widen unless you write{" "}
                <code>as const</code>. Unions of literals (
                <code>&quot;small&quot; | &quot;medium&quot; |
                &quot;large&quot;</code>) lead into chapter 03.
              </>
            ),
            zh: (
              <>
                <code>let</code> 拓宽(<code>&quot;small&quot;</code> →
                string),<code>const</code> 保留字面量类型。但{" "}
                <code>const</code> 锁不住<b>内容</b>:
                数组元素和对象属性照样拓宽,除非写 <code>as const</code>。
                字面量联合(<code>&quot;small&quot; | &quot;medium&quot; |
                &quot;large&quot;</code>)是 03 章的入口。
              </>
            ),
          },
          {
            en: (
              <>
                <code>any</code> turns checking off and spreads through
                expressions; an empty <code>[]</code> starts as{" "}
                <code>any[]</code>. Both are fine as a temporary step and bad as
                a permanent state. <code>noImplicitAny</code> reports the ones
                you did not write yourself.
              </>
            ),
            zh: (
              <>
                <code>any</code> 关掉检查,并顺着表达式扩散;空的{" "}
                <code>[]</code> 会先落成 <code>any[]</code>。
                两者当临时手段可以,长期留着不行。<code>noImplicitAny</code>{" "}
                负责报出那些你没亲手写的 any。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="types" />
    </main>
  );
}
