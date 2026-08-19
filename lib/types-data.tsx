"use client";

// 第 01 章 · 基础类型与推断:动手任务 LABS + 通关测验 QUIZ 数据(双语)。
// 约定:代码里的可执行行在 en / zh 两版中逐字节相同,只有注释分语言;
// 编译器报错原文一律保持英文原样。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";
import { T } from "@/lib/i18n";

const PLAYGROUND = (
  <a
    href="https://www.typescriptlang.org/play"
    target="_blank"
    rel="noreferrer"
  >
    typescriptlang.org/play
  </a>
);

/* ================= LABS ================= */

export const LABS: Lab[] = [
  {
    id: "hover-infer",
    title: {
      en: "Hover over everything: what type did inference give?",
      zh: "hover 大巡查:看推断给每个值发了什么类型",
    },
    d: "easy",
    tags: { en: ["Playground", "inference"], zh: ["Playground", "推断"] },
    task: (
      <>
        <p>
          <T
            en={
              <>Open {PLAYGROUND} and paste the code below. There is not a
              single annotation in it. Now hover over{" "}
              <b>each variable name</b> in turn and write the inferred type in a
              comment next to it. Compare with the answer afterwards.</>
            }
            zh={
              <>打开 {PLAYGROUND},贴入下面的代码 —— 里面一个注解都没有。
              然后把鼠标依次悬停在<b>每一个变量名</b>上,
              把 TS 推断出的类型写在旁边的注释里,写完再对答案。</>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title={{ en: "Paste this in", zh: "贴这段进去" }}
          code={`const shop = "Cup & Co";
let stock = 120;
let isOpen = true;
const flavors = ["jasmine", "oolong", "grape"];
const bestSeller = { name: "Grape Tea", price: 22, hot: true };
const nothing = null;`}
        />
      </>
    ),
    hint: (
      <T
        en={
          <>
            Look at the difference between <code>shop</code> and{" "}
            <code>stock</code>: one is <code>const</code> and one is{" "}
            <code>let</code>. The types are not equally precise.
          </>
        }
        zh={
          <>
            注意 <code>shop</code> 和 <code>stock</code> 的差别:一个{" "}
            <code>const</code> 一个 <code>let</code> —— 类型的精度不一样。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title={{ en: "What you should see", zh: "悬停结果" }}
          code={{
            en: `const shop: "Cup & Co"     // const + literal -> literal type
let stock: number          // let -> widened to number
let isOpen: boolean        // let -> widened to boolean
const flavors: string[]    // const does not lock the contents
const bestSeller: {        // properties widen for the same reason
  name: string;
  price: number;
  hot: boolean;
}
const nothing: null        // the type of null is null`,
            zh: `const shop: "Cup & Co"     // const + 字面量 -> 字面量类型
let stock: number          // let -> 拓宽成 number
let isOpen: boolean        // let -> 拓宽成 boolean
const flavors: string[]    // const 锁不住内容
const bestSeller: {        // 属性同理拓宽
  name: string;
  price: number;
  hot: boolean;
}
const nothing: null        // null 的类型就是 null`,
          }}
        />
        <p>
          <T
            en={
              <>
                Six variables, zero annotations, six types. Look closely at{" "}
                <code>flavors</code> and <code>bestSeller</code>:{" "}
                <b>
                  <code>const</code> only stops the variable name from being
                  reassigned
                </b>
                , so array elements and object properties still widen. This is
                the part people most often remember incorrectly.
              </>
            }
            zh={
              <>
                六个变量,零注解,类型全齐了。重点看 <code>flavors</code> 和{" "}
                <code>bestSeller</code>:
                <b>
                  <code>const</code> 只阻止重新给变量名赋值
                </b>
                ,所以数组元素和对象属性依旧拓宽 —— 这是最容易记错的一处。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "widen-lab",
    title: {
      en: "Widening experiment: what do let and const infer?",
      zh: "拓宽实验:let 和 const 各推出什么",
    },
    d: "easy",
    tags: { en: ["Playground", "widening"], zh: ["Playground", "拓宽"] },
    task: (
      <>
        <p>
          <T
            en={
              <>
                Type the four lines below into the Playground one at a time, and
                hover over each variable name as you go. Then answer: which
                lines have a literal type, which were widened, and why?
              </>
            }
            zh={
              <>
                在 Playground 里逐行输入下面四行,每写一行就 hover
                一次变量名,记下类型。最后回答:哪几行是字面量类型,
                哪几行被拓宽了?为什么?
              </>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title={{ en: "One line at a time", zh: "逐行输入" }}
          code={`let a = "small";
const b = "small";
let c = 42;
const d = 42;`}
        />
      </>
    ),
    hint: (
      <T
        en={
          <>
            Ask one question about each line: <b>can this variable be assigned
            a new value later?</b> If yes, TypeScript has to record a wider
            type.
          </>
        }
        zh={
          <>
            每一行都问自己一个问题:<b>这个变量以后还能不能被赋新值?</b>
            能 —— TS 就得把类型记宽一点。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title={{ en: "Result and explanation", zh: "结果与解释" }}
          code={{
            en: `let a = "small";   // string  -- let can be reassigned, so it widens
const b = "small"; // "small" -- const never changes, literal is kept
let c = 42;        // number  -- same as a
const d = 42;      // 42      -- same as b`,
            zh: `let a = "small";   // string  -- let 可再赋值,所以拓宽
const b = "small"; // "small" -- const 不会再变,保留字面量
let c = 42;        // number  -- 同 a
const d = 42;      // 42      -- 同 b`,
          }}
        />
        <p>
          <T
            en={
              <>
                The rule in one line: <b>let widens, const keeps the literal
                type</b>. One step further: <code>a = &quot;mega&quot;</code>{" "}
                is accepted, because string allows any string. But if you write{" "}
                <code>
                  let e: &quot;small&quot; | &quot;large&quot; =
                  &quot;small&quot;
                </code>{" "}
                and then <code>e = &quot;mega&quot;</code>, you get an error.
                That is what a union of literal types buys you, and chapter 03
                covers it properly.
              </>
            }
            zh={
              <>
                规律一句话:<b>let 拓宽,const 保留字面量类型</b>。再进一步:
                <code>a = &quot;mega&quot;</code> 能过,因为 string
                什么字符串都装;但写成{" "}
                <code>
                  let e: &quot;small&quot; | &quot;large&quot; =
                  &quot;small&quot;
                </code>{" "}
                之后再 <code>e = &quot;mega&quot;</code> 就会报错 ——
                这就是字面量联合的作用,03 章正式讲。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "menu-type",
    title: {
      en: "Give the menu a contract: MenuItem",
      zh: "给奶茶菜单立契约:MenuItem",
    },
    d: "medium",
    tags: {
      en: ["Playground", "object types"],
      zh: ["Playground", "对象类型"],
    },
    task: (
      <>
        <p>
          <T
            en={
              <>
                In the Playground: (1) write a <code>MenuItem</code> object type
                with four properties — <code>name</code> (string),{" "}
                <code>price</code> (number), <code>sizes</code> (array of
                string), <code>soldOut</code> (boolean); (2) declare{" "}
                <code>const menu: MenuItem[]</code> and put two or three drinks
                in it; (3) deliberately misspell one <code>price</code> as{" "}
                <code>prise</code>, and look at which line the error lands on
                and what it says.
              </>
            }
            zh={
              <>
                在 Playground 里:① 写一个 <code>MenuItem</code>{" "}
                对象类型,要求四个属性 —— <code>name</code>(字符串)、
                <code>price</code>(数字)、<code>sizes</code>(字符串数组)、
                <code>soldOut</code>(布尔);② 声明{" "}
                <code>const menu: MenuItem[]</code> 并填两三款奶茶;③
                故意把其中一款的 <code>price</code> 拼成 <code>prise</code>,
                观察报错落在哪一行、说了什么。
              </>
            }
          />
        </p>
      </>
    ),
    hint: (
      <T
        en={
          <>
            The syntax for object types is in section 03: one{" "}
            <code>propertyName: Type</code> per line, inside braces. A type
            alias is written <code>type MenuItem = {"{ ... }"}</code>.
          </>
        }
        zh={
          <>
            对象类型的写法在 §03:花括号里一行一个{" "}
            <code>属性名: 类型</code>。类型别名用{" "}
            <code>type MenuItem = {"{ ... }"}</code> 定义。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title={{ en: "One way to write it", zh: "参考答案" }}
          code={{
            en: `type MenuItem = {
  name: string;
  price: number;
  sizes: string[];
  soldOut: boolean;
};

const menu: MenuItem[] = [
  { name: "Grape Tea", price: 22, sizes: ["medium", "large"], soldOut: false },
  { name: "Oolong Tea", prise: 12, sizes: ["small"], soldOut: false },
  //                    ~~~~~ the error lands here:
  // Object literal may only specify known properties,
  // but 'prise' does not exist in type 'MenuItem'.
  // Did you mean to write 'price'?
];`,
            zh: `type MenuItem = {
  name: string;
  price: number;
  sizes: string[];
  soldOut: boolean;
};

const menu: MenuItem[] = [
  { name: "Grape Tea", price: 22, sizes: ["medium", "large"], soldOut: false },
  { name: "Oolong Tea", prise: 12, sizes: ["small"], soldOut: false },
  //                    ~~~~~ 错误落在这里:
  // Object literal may only specify known properties,
  // but 'prise' does not exist in type 'MenuItem'.
  // Did you mean to write 'price'?
];`,
          }}
        />
        <p>
          <T
            en={
              <>
                The error points <b>exactly at the typo</b> and suggests the
                fix. Now try deleting <code>: MenuItem[]</code> and look again:
                the error disappears, because inference simply accepts{" "}
                <code>prise</code> as a field. It comes back much later, when
                some other code reads <code>price</code>. That is the value of
                writing a contract for shared data.
              </>
            }
            zh={
              <>
                报错<b>精确落在错字上</b>,还给了改法。现在把{" "}
                <code>: MenuItem[]</code> 删掉再看:错误消失了 ——
                因为推断把 <code>prise</code> 也当成一个合法字段收下了。
                它会在很久以后、别处读 <code>price</code> 时才重新出现。
                这就是给共享数据立契约的价值。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "empty-array",
    title: {
      en: "The empty array trap: watch any[] appear",
      zh: "空数组的坑:亲眼看 any[] 长出来",
    },
    d: "medium",
    tags: {
      en: ["Playground", "noImplicitAny"],
      zh: ["Playground", "noImplicitAny"],
    },
    task: (
      <>
        <p>
          <T
            en={
              <>
                The Playground has <code>strict</code> on by default. Paste the
                code below and answer: (1) what error does the empty array
                inside the function produce? (2) which annotation fixes it? (3)
                after the fix, try <code>cart.push(42)</code> and see what
                happens.
              </>
            }
            zh={
              <>
                Playground 默认开着 <code>strict</code>。贴入下面的代码,观察:①
                函数里那个空数组报了什么错?② 加上什么注解能修好?③
                修好之后试试 <code>cart.push(42)</code>,看会发生什么。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title={{ en: "Paste this in", zh: "贴这段进去" }}
          code={`function newCart() {
  const cart = [];
  return cart;
}`}
        />
      </>
    ),
    hint: (
      <T
        en={
          <>
            An empty box shows nothing about its contents. Put the label in
            front of the <code>= []</code>.
          </>
        }
        zh={
          <>
            空箱子看不出装什么 —— 你得在 <code>= []</code> 前面贴张标签。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title={{ en: "The fix", zh: "修复" }}
          code={{
            en: `function newCart() {
  const cart: string[] = []; // labelled at creation
  return cart;               // return type is inferred as string[]
}

const cart = newCart();
cart.push("Oolong Tea"); // ok
cart.push(42);           // Argument of type 'number' is not
                         // assignable to parameter of type 'string'.`,
            zh: `function newCart() {
  const cart: string[] = []; // 出生就贴标签
  return cart;               // 返回类型自动推断为 string[]
}

const cart = newCart();
cart.push("Oolong Tea"); // 通过
cart.push(42);           // Argument of type 'number' is not
                         // assignable to parameter of type 'string'.`,
          }}
        />
        <p>
          <T
            en={
              <>
                The original errors are{" "}
                <code>
                  Variable &apos;cart&apos; implicitly has type
                  &apos;any[]&apos; in some locations where its type cannot be
                  determined
                </code>{" "}
                on the declaration and{" "}
                <code>
                  Variable &apos;cart&apos; implicitly has an
                  &apos;any[]&apos; type
                </code>{" "}
                on the <code>return</code>. That is{" "}
                <code>noImplicitAny</code> catching an any you never wrote. One
                annotation fixes it, and every later <code>push</code> is
                checked.
              </>
            }
            zh={
              <>
                原始报错有两条:声明那一行是{" "}
                <code>
                  Variable &apos;cart&apos; implicitly has type
                  &apos;any[]&apos; in some locations where its type cannot be
                  determined
                </code>
                ,<code>return</code> 那一行是{" "}
                <code>
                  Variable &apos;cart&apos; implicitly has an
                  &apos;any[]&apos; type
                </code>
                。这就是 <code>noImplicitAny</code> 拦下了一个你从没写过的
                any。一行注解修好,之后每次 <code>push</code> 都受检。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "boundary-fn",
    title: {
      en: "Boundary annotations: a typed checkout function",
      zh: "边界注解:给结算函数签合同",
    },
    d: "medium",
    tags: {
      en: ["Playground", "function types"],
      zh: ["Playground", "函数注解"],
    },
    task: (
      <>
        <p>
          <T
            en={
              <>
                Write a checkout function <code>calcTotal(price, qty)</code>{" "}
                that returns the unit price times the quantity. (1) Write it{" "}
                <b>with no annotations first</b> and read the errors on the
                parameters. (2) Annotate both parameters and the return type.
                (3) Call <code>calcTotal(&quot;22&quot;, 2)</code> and confirm
                the compiler stops it.
              </>
            }
            zh={
              <>
                写一个结算函数 <code>calcTotal(price, qty)</code>
                ,返回单价乘数量。① 先<b>什么注解都不写</b>
                ,看参数上报什么错;② 给两个参数和返回值补上注解;③ 调用{" "}
                <code>calcTotal(&quot;22&quot;, 2)</code>,确认编译器拦得住。
              </>
            }
          />
        </p>
      </>
    ),
    hint: (
      <T
        en={
          <>
            A parameter comes from outside the function, so inference has
            nothing to read. Under <code>noImplicitAny</code> the annotation is
            not a style choice, it is required.
          </>
        }
        zh={
          <>
            参数是从函数外面传进来的,推断没有材料可读。开着{" "}
            <code>noImplicitAny</code> 时,参数注解不是风格问题,是必须写的。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title={{ en: "One way to write it", zh: "参考答案" }}
          code={{
            en: `// (1) With no annotations:
// Parameter 'price' implicitly has an 'any' type.
// Parameter 'qty' implicitly has an 'any' type.

// (2) Annotated. Parameters are required, the return type is a promise:
function calcTotal(price: number, qty: number): number {
  return price * qty;
}

// (3) The wrong type is rejected at compile time:
calcTotal("22", 2);
// Argument of type 'string' is not assignable
// to parameter of type 'number'.`,
            zh: `// ① 不写注解:
// Parameter 'price' implicitly has an 'any' type.
// Parameter 'qty' implicitly has an 'any' type.

// ② 补上注解。参数是义务,返回值是承诺:
function calcTotal(price: number, qty: number): number {
  return price * qty;
}

// ③ 传错类型,编译期就被拦下:
calcTotal("22", 2);
// Argument of type 'string' is not assignable
// to parameter of type 'number'.`,
          }}
        />
        <p>
          <T
            en={
              <>
                Compare this with the prologue. In JavaScript{" "}
                <code>&quot;22&quot; * 2</code> happens to produce 44, so the
                bug hides. Change the value to{" "}
                <code>&quot;22 yuan&quot;</code> and the same expression
                produces <code>NaN</code>, at night, in production. TypeScript
                closes that path at compile time instead.
              </>
            }
            zh={
              <>
                对比一下序章:JavaScript 里 <code>&quot;22&quot; * 2</code>{" "}
                会「碰巧」算出 44,错误就藏住了;哪天值变成{" "}
                <code>&quot;22元&quot;</code>,同一个表达式就是{" "}
                <code>NaN</code>,而且是在半夜的线上。TS
                直接把这条路封死在编译期。
              </>
            }
          />
        </p>
      </>
    ),
  },
];

/* ================= QUIZ ================= */

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: (
      <T
        en={
          <>
            <code>let price = 22;</code> — what is the type of{" "}
            <code>price</code>?
          </>
        }
        zh={
          <>
            <code>let price = 22;</code> —— <code>price</code> 的类型是什么?
          </>
        }
      />
    ),
    opts: [
      <T
        key="a"
        en={<>any, because there is no annotation</>}
        zh={<>any,因为没写注解</>}
      />,
      <T key="b" en={<>number, from inference</>} zh={<>number,推断得出</>} />,
      <T key="c" en={<>22, a literal type</>} zh={<>22,字面量类型</>} />,
      <T
        key="d"
        en={<>unknown, waiting to be narrowed</>}
        zh={<>unknown,等待收窄</>}
      />,
    ],
    correct: 1,
    wrong: [
      <T
        key="a"
        en={
          <>
            A type falls back to any only when TypeScript has nothing to read,
            for example an unannotated function parameter. Here the 22 on the
            right is all it needs.
          </>
        }
        zh={
          <>
            只有当 TS 完全没有材料可读时,类型才会退化成 any ——
            比如没注解的函数参数。这里右边明明白白一个 22,推断直接给 number。
          </>
        }
      />,
      undefined,
      <T
        key="c"
        en={
          <>
            The literal type 22 is what <code>const</code> gets.{" "}
            <code>let</code> means the value may change later, so TypeScript
            widens it to number.
          </>
        }
        zh={
          <>
            字面量类型 22 是 <code>const</code> 的待遇。<code>let</code>{" "}
            意味着以后可能换值,所以 TS 把它拓宽成 number。
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            <code>unknown</code> never appears on its own. You write it
            deliberately as the safe alternative to any. Chapter 03 covers it.
          </>
        }
        zh={
          <>
            <code>unknown</code> 不会自己出现 ——
            它是你主动写的、any 的安全替代品,03 章才登场。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            Inference means the compiler works the type out for you. A{" "}
            <code>let</code> with an initial value already has a type, and you
            wrote no colon at all. This is why &quot;TypeScript makes you write
            annotations everywhere&quot; is not true.
          </>
        }
        zh={
          <>
            推断就是编译器替你把类型算出来。<code>let</code> 加初始值,
            类型当场就定了,你一个冒号都没写 ——
            所以「用 TS 就得到处写注解」是个误解。
          </>
        }
      />
    ),
  },
  {
    type: "choice",
    q: (
      <T
        en={
          <>
            <code>const size = &quot;small&quot;;</code> — what is the type of{" "}
            <code>size</code>?
          </>
        }
        zh={
          <>
            <code>const size = &quot;small&quot;;</code> —— <code>size</code>{" "}
            的类型是什么?
          </>
        }
      />
    ),
    opts: [
      "string",
      <T
        key="b"
        en={<>&quot;small&quot; (a literal type)</>}
        zh={<>&quot;small&quot;(字面量类型)</>}
      />,
      "any",
      "Size",
    ],
    correct: 1,
    wrong: [
      <T
        key="a"
        en={
          <>
            string is what <code>let</code> gets. A <code>const</code> variable
            is never assigned again, so TypeScript can use the narrowest type
            possible: the literal <code>&quot;small&quot;</code> itself.
          </>
        }
        zh={
          <>
            string 是 <code>let</code> 的待遇。<code>const</code>{" "}
            变量不会再被赋值,所以 TS 敢用最窄的类型 —— 字面量{" "}
            <code>&quot;small&quot;</code> 本身。
          </>
        }
      />,
      undefined,
      <T
        key="c"
        en={<>There is an initial value, so inference has everything it needs.</>}
        zh={<>有初始值,推断就有材料,轮不到 any。</>}
      />,
      <T
        key="d"
        en={
          <>
            TypeScript does not connect a value to a type alias you happened to
            define. You would have to write{" "}
            <code>const size: Size = &quot;small&quot;</code> yourself.
          </>
        }
        zh={
          <>
            TS 不会自动把值关联到你定义过的类型别名 —— 除非你亲手写{" "}
            <code>const size: Size = &quot;small&quot;</code>。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            <code>const</code> means the variable never changes, so its type can
            be the literal value itself. Literal types are the basis of the
            unions in chapter 03:{" "}
            <code>
              &quot;small&quot; | &quot;medium&quot; | &quot;large&quot;
            </code>{" "}
            is three literal types joined together. Note that this only applies
            to the variable itself; inside an array or object literal the
            properties still widen.
          </>
        }
        zh={
          <>
            <code>const</code> 意味着变量不会再变,所以类型可以就是那个值本身。
            字面量类型是 03 章联合类型的地基:
            <code>
              &quot;small&quot; | &quot;medium&quot; | &quot;large&quot;
            </code>{" "}
            就是三个字面量类型拼起来的。注意这只对变量本身成立 ——
            数组和对象字面量内部的属性照样拓宽。
          </>
        }
      />
    ),
  },
  {
    type: "choice",
    q: (
      <T
        en={
          <>
            <code>: String</code> (capital) and <code>: string</code>{" "}
            (lowercase) — how are they related?
          </>
        }
        zh={
          <>
            <code>: String</code>(大写)和 <code>: string</code>
            (小写),什么关系?
          </>
        }
      />
    ),
    opts: [
      <T
        key="a"
        en={<>The same thing; the case does not matter</>}
        zh={<>一样的,大小写随意</>}
      />,
      <T
        key="b"
        en={
          <>
            Different: string is the primitive, String is the wrapper object
            type. Annotations always use lowercase
          </>
        }
        zh={
          <>
            不一样:string 是原始类型,String 是包装对象类型 ——
            注解永远用小写
          </>
        }
      />,
      <T
        key="c"
        en={<>String is the more formal one and is officially recommended</>}
        zh={<>String 更正式,官方推荐</>}
      />,
      <T
        key="d"
        en={<>string is the old syntax and is deprecated</>}
        zh={<>string 是旧版写法,已废弃</>}
      />,
    ],
    correct: 1,
    wrong: [
      <T
        key="a"
        en={
          <>
            The case makes them two different types. Lowercase string is the
            primitive. Capital String is the object created by{" "}
            <code>new String()</code>, and a <code>String</code> cannot be
            assigned to a <code>string</code>.
          </>
        }
        zh={
          <>
            大小写在这里是两个不同的类型:小写 string 是原始类型;大写 String
            是 <code>new String()</code> 造出来的对象,而且{" "}
            <code>String</code> 不能赋给 <code>string</code>。
          </>
        }
      />,
      undefined,
      <T
        key="c"
        en={
          <>
            It is the other way round. The official guidance is to annotate with
            the lowercase primitive names. The capitalised wrapper types exist
            for historical reasons and are almost never what you want.
          </>
        }
        zh={
          <>
            恰恰相反 —— 官方建议注解用小写原始类型名;
            大写的包装对象类型是历史遗留,几乎从来不是你想要的。
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            Lowercase is the current and correct form. Nothing about it is
            deprecated.
          </>
        }
        zh={<>小写才是现行且正确的写法,不存在废弃一说。</>}
      />,
    ],
    why: (
      <T
        en={
          <>
            Rule to remember: <b>annotations use lowercase</b> — string, number,
            boolean. If you see <code>String</code>, <code>Number</code>, or{" "}
            <code>Boolean</code> in an annotation, change it.
          </>
        }
        zh={
          <>
            口诀:<b>注解一律小写</b> —— string、number、boolean。
            看到注解里出现 <code>String</code> / <code>Number</code> /{" "}
            <code>Boolean</code>,直接改。
          </>
        }
      />
    ),
  },
  {
    type: "multi",
    q: (
      <T
        en={
          <>
            Where is it worth writing (or required to write) a type annotation?
            Select all that apply.
          </>
        }
        zh={<>哪些地方值得(或必须)亲手写类型注解?(多选)</>}
      />
    ),
    opts: [
      <T
        key="a"
        en={<>Function parameters and return types</>}
        zh={<>函数的参数和返回值</>}
      />,
      <T
        key="b"
        en={<>A variable declared first and assigned later</>}
        zh={<>先声明、后赋值的变量</>}
      />,
      <T
        key="c"
        en={
          <>
            A local variable such as <code>let count = 0</code>
          </>
        }
        zh={
          <>
            <code>let count = 0</code> 这样的局部变量
          </>
        }
      />,
      <T
        key="d"
        en={<>Exported public API and data shared across the project</>}
        zh={<>对外导出的公共 API / 全项目共享的数据结构</>}
      />,
    ],
    correct: [0, 1, 3],
    missHint: (
      <T
        en={
          <>
            Think about the word &quot;boundary&quot;: anything other code
            depends on, and anything with no value on the right at declaration
            time. You are still missing one.
          </>
        }
        zh={
          <>
            想想「边界」两个字 —— 别人要依赖的地方,
            以及声明时右边没有值的地方。你还漏了一个。
          </>
        }
      />
    ),
    extraHint: (
      <T
        en={
          <>
            One of your choices is something TypeScript reads off the initial
            value. Annotating it is not wrong, but it adds noise. That is
            mistake 2 in section 08.
          </>
        }
        zh={
          <>
            你选的里面有一项,TS 看一眼初始值就知道了。
            给它写注解不算错,但属于噪音 —— 就是 §08 的坑二。
          </>
        }
      />
    ),
    why: (
      <T
        en={
          <>
            An annotation is a promise, inference is an observation. Write the
            promise at the boundaries: parameters (required under{" "}
            <code>noImplicitAny</code>), return types, shared contracts, and
            variables declared before assignment. Leave local variables to
            inference so the real contracts stand out.
          </>
        }
        zh={
          <>
            注解是承诺,推断是观察。承诺写在边界上:参数(开着{" "}
            <code>noImplicitAny</code> 时是必写的)、返回值、共享契约、
            先声明后赋值的变量。局部变量交给推断,真正的契约才显眼。
          </>
        }
      />
    ),
  },
  {
    type: "choice",
    q: (
      <T
        en={
          <>
            Which statement about <code>any</code> is correct?
          </>
        }
        zh={
          <>
            关于 <code>any</code>,哪个说法是对的?
          </>
        }
      />
    ),
    opts: [
      <T
        key="a"
        en={<>any turns off type checking for that one line only</>}
        zh={<>any 只关掉当前这一行的类型检查</>}
      />,
      <T
        key="b"
        en={
          <>
            any turns off all checking for that value, and it spreads through
            assignments and expressions
          </>
        }
        zh={<>any 关掉这个值的所有检查,而且会顺着赋值和运算扩散出去</>}
      />,
      <T
        key="c"
        en={
          <>
            any and <code>unknown</code> mean the same thing
          </>
        }
        zh={
          <>
            any 和 <code>unknown</code> 是同义词
          </>
        }
      />,
      <T
        key="d"
        en={<>Using any causes more errors to be thrown at runtime</>}
        zh={<>用了 any,代码会在运行时抛出更多错误</>}
      />,
    ],
    correct: 1,
    wrong: [
      <T
        key="a"
        en={
          <>
            It reaches further than one line. A property read from an any value,
            a result computed from it, and a callback it is passed to all become
            any as well.
          </>
        }
        zh={
          <>
            不止一行。从 any 值上取的属性、由它算出的结果、
            把它传进去的回调参数,统统也变成 any。
          </>
        }
      />,
      undefined,
      <T
        key="c"
        en={
          <>
            They are opposites. any lets you do anything with the value.{" "}
            <code>unknown</code> accepts any value but lets you do almost
            nothing with it until you check what it is. Chapter 03 covers it.
          </>
        }
        zh={
          <>
            方向相反。any 是「对这个值想干什么都行」;<code>unknown</code>{" "}
            接受任何值,但在你检查清楚它是什么之前几乎什么都不让你做。03 章讲。
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            any does not create runtime errors by itself. The problem is that it
            lets errors that <b>could have been caught at compile time</b> reach
            runtime instead, exactly as in plain JavaScript.
          </>
        }
        zh={
          <>
            any 本身不制造运行时错误。问题在于它把<b>本可以在编译期抓到</b>
            的错误放行到了运行时 —— 和裸写 JavaScript 一样。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            <code>any</code> means &quot;stop checking this&quot;. Useful as a
            temporary step, harmful as a permanent state. The{" "}
            <code>noImplicitAny</code> option exists to stop an any from
            appearing silently, most often through an unannotated parameter.
          </>
        }
        zh={
          <>
            <code>any</code> 的意思是「别检查这个」。当临时手段有用,
            长期留着就等于把 TS 关掉了。<code>noImplicitAny</code>{" "}
            这个开关,就是防止 any 从没注解的参数之类的地方悄悄溜进来。
          </>
        }
      />
    ),
  },
  {
    type: "fill",
    q: (
      <T
        en={
          <>
            &quot;An array whose elements are all number&quot;, written with the
            square-bracket syntax, is the type ____.
          </>
        }
        zh={<>「元素都是 number 的数组」,用方括号写法,类型写作____。</>}
      />
    ),
    placeholder: { en: "Type the type...", zh: "输入类型…" },
    answers: ["number[]"],
    hint: (
      <T
        en={<>Element type first, then an empty pair of square brackets.</>}
        zh={<>元素类型在前,一对空方括号在后。</>}
      />
    ),
    why: (
      <T
        en={
          <>
            <code>number[]</code> and <code>Array&lt;number&gt;</code> are
            exactly the same type. For simple element types most code uses the
            first form. The angle brackets in the second form are generic
            syntax, which chapter 05 covers.
          </>
        }
        zh={
          <>
            <code>number[]</code> 和 <code>Array&lt;number&gt;</code>{" "}
            是完全相同的类型。元素类型简单时,社区习惯用前者;
            后者的尖括号是泛型语法,05 章正式拆解。
          </>
        }
      />
    ),
  },
  {
    type: "choice",
    q: (
      <T
        en={
          <>
            <code>const toppings = [];</code> — what is the problem with this
            line?
          </>
        }
        zh={
          <>
            <code>const toppings = [];</code> —— 这行代码有什么问题?
          </>
        }
      />
    ),
    opts: [
      <T
        key="a"
        en={
          <>
            Nothing. TypeScript knows it is <code>string[]</code>
          </>
        }
        zh={
          <>
            没问题,TS 知道它是 <code>string[]</code>
          </>
        }
      />,
      <T
        key="b"
        en={
          <>
            An empty array gives nothing to infer from, so the type starts as{" "}
            <code>any[]</code>. Once the value is used outside the scope that
            fills it, <code>noImplicitAny</code> reports an error. Annotate it
            at creation
          </>
        }
        zh={
          <>
            空数组没有推断材料,类型先落成 <code>any[]</code>;
            一旦这个值离开填充它的作用域被使用,<code>noImplicitAny</code>{" "}
            就会报错。出生就注解最稳
          </>
        }
      />,
      <T
        key="c"
        en={
          <>
            An empty array literal is always <code>never[]</code>, so nothing
            can be pushed into it
          </>
        }
        zh={
          <>
            空数组字面量永远是 <code>never[]</code>,什么都塞不进去
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            An empty array must be created with <code>new Array()</code>
          </>
        }
        zh={
          <>
            空数组必须用 <code>new Array()</code> 创建
          </>
        }
      />,
    ],
    correct: 1,
    wrong: [
      <T
        key="a"
        en={
          <>
            Nothing has been put in it yet, so there is no element type to infer
            from. TypeScript records <code>any[]</code> for now.
          </>
        }
        zh={
          <>
            它还没装过任何东西,元素类型无从推起 —— TS 只能先记成{" "}
            <code>any[]</code>。
          </>
        }
      />,
      undefined,
      <T
        key="c"
        en={
          <>
            <code>never[]</code> does happen, but in other positions: an empty
            array literal that cannot evolve, such as{" "}
            <code>{"{ list: [] }"}</code> or an argument passed straight to a
            generic function. A plain <code>const x = []</code> starts as an
            evolving <code>any[]</code>, and TypeScript refines it from later{" "}
            <code>push</code> calls in the same scope.
          </>
        }
        zh={
          <>
            <code>never[]</code> 确实会出现,但是在别的位置 ——
            无法「演化」的空数组字面量,比如 <code>{"{ list: [] }"}</code>{" "}
            里的那个,或者直接作为实参传给泛型函数的那个。而单独一句{" "}
            <code>const x = []</code> 落的是可演化的 <code>any[]</code>,TS
            会根据同作用域后面的 <code>push</code> 反推它。
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            <code>new Array()</code> gives no element type either. The syntax is
            not the problem; the missing label is.
          </>
        }
        zh={
          <>
            <code>new Array()</code> 一样看不出元素类型。
            问题不在写法,而在缺那张标签。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            Label the empty box when you create it:{" "}
            <code>const toppings: string[] = []</code>. After that, pushing the
            wrong thing is an error on the spot.
          </>
        }
        zh={
          <>
            空箱子出生就贴标签:<code>const toppings: string[] = []</code>。
            之后 push 错任何东西都会当场报错。
          </>
        }
      />
    ),
  },
  {
    type: "choice",
    q: (
      <T
        en={
          <>
            <code>let size = &quot;small&quot;</code> is inferred as string, but
            you want <code>size</code> to accept only the three cup sizes. What
            is the right way?
          </>
        }
        zh={
          <>
            <code>let size = &quot;small&quot;</code> 推断成了 string,
            但你想让 <code>size</code> 只能取三种杯型。最对路的做法是?
          </>
        }
      />
    ),
    opts: [
      <T
        key="a"
        en={
          <>
            Change it to <code>let size: string = &quot;small&quot;</code>
          </>
        }
        zh={
          <>
            改成 <code>let size: string = &quot;small&quot;</code>
          </>
        }
      />,
      <T
        key="b"
        en={
          <>
            Define a union of literal types,{" "}
            <code>
              type Size = &quot;small&quot; | &quot;medium&quot; |
              &quot;large&quot;
            </code>
            , then write <code>let size: Size = &quot;small&quot;</code>
          </>
        }
        zh={
          <>
            定义字面量联合{" "}
            <code>
              type Size = &quot;small&quot; | &quot;medium&quot; |
              &quot;large&quot;
            </code>
            ,再 <code>let size: Size = &quot;small&quot;</code>
          </>
        }
      />,
      <T
        key="c"
        en={
          <>
            Change it to <code>const</code> so the literal type is kept
          </>
        }
        zh={<>改成 const,让它保留字面量类型</>}
      />,
      <T
        key="d"
        en={<>TypeScript cannot restrict a value to a fixed set</>}
        zh={<>TS 做不到「只能取几个值」这种限制</>}
      />,
    ],
    correct: 1,
    wrong: [
      <T
        key="a"
        en={
          <>
            <code>: string</code> is exactly as wide as writing nothing.{" "}
            <code>&quot;mega&quot;</code> and <code>&quot;LARGE&quot;</code>{" "}
            would still be accepted, so it restricts nothing.
          </>
        }
        zh={
          <>
            <code>: string</code> 和不写一样宽。<code>&quot;mega&quot;</code>、
            <code>&quot;LARGE&quot;</code> 照样合法,等于没加限制。
          </>
        }
      />,
      undefined,
      <T
        key="c"
        en={
          <>
            <code>const</code> means &quot;cannot be reassigned&quot;, not
            &quot;must be one of these three&quot;. It would fix the value to{" "}
            <code>&quot;small&quot;</code> and the size of an order needs to
            change.
          </>
        }
        zh={
          <>
            <code>const</code> 的意思是「不能重新赋值」,不是「只能取这三种」。
            它会把值固定成 <code>&quot;small&quot;</code>,
            而订单里的杯型本来就要换。
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            It can, and this is one of the most useful things TypeScript does:
            the list of allowed values goes into the type, and anything outside
            the list is rejected at compile time.
          </>
        }
        zh={
          <>
            做得到,而且这是 TS 最有用的能力之一:
            把合法值的名单写进类型,名单外的值编译期直接拒收。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            A union of literal types writes &quot;it can only be one of
            these&quot; into the type itself. This is how the menu example grows
            in chapter 03: cup size, sugar level, and order status are all held
            in place this way.
          </>
        }
        zh={
          <>
            字面量联合就是把「只能是这几个」写成类型。
            奶茶店案例在 03 章正是这样升级的:杯型、糖度、订单状态,
            全靠这一招守住。
          </>
        }
      />
    ),
  },
];
