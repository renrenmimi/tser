"use client";

// Chapter 04 · Structural typing — practice LABS + QUIZ data.

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";
import { T, type Loc } from "@/lib/i18n";

/* ---------- lab code ---------- */

const LAB1_CODE: Loc<string> = {
  en: `type Order = { item: string; sweetness?: string };

function makeOrder(o: Order) {
  console.log(o.item, o.sweetness ?? "full sugar");
}

// 1. literal passed directly — error, with a suggested fix
makeOrder({ item: "Boba milk tea", sweetnes: "half sugar" });
// Object literal may only specify known properties, but 'sweetnes'
// does not exist in type 'Order'. Did you mean to write
// 'sweetness'? ts(2561)

// 2. same object, stored first — accepted, and the half sugar is lost
const draft = { item: "Boba milk tea", sweetnes: "half sugar" };
makeOrder(draft); // logs: Boba milk tea full sugar`,
  zh: `type Order = { item: string; sweetness?: string };

function makeOrder(o: Order) {
  console.log(o.item, o.sweetness ?? "full sugar");
}

// ① 字面量直接传 —— 报错,还附带一个改法建议
makeOrder({ item: "Boba milk tea", sweetnes: "half sugar" });
// Object literal may only specify known properties, but 'sweetnes'
// does not exist in type 'Order'. Did you mean to write
// 'sweetness'? ts(2561)

// ② 同一个对象,先存进变量 —— 通过,半糖也就此丢了
const draft = { item: "Boba milk tea", sweetnes: "half sugar" };
makeOrder(draft); // 输出:Boba milk tea full sugar`,
};

const LAB2_CODE: Loc<string> = {
  en: `type HasName = { name: string };

function greet(x: HasName) {
  console.log("Hello, " + x.name);
}

// 1. a class instance — no implements, no annotation
class Cat {
  name = "Tangerine";
  meow() {}
}
greet(new Cat()); // ✓

// 2. an object literal stored in a variable (the extra age is fine)
const person = { name: "Zhen", age: 25 };
greet(person); // ✓

// 3. a function return value
function makeShop() {
  return { name: "Bloom Tea", city: "Hangzhou" };
}
greet(makeShop()); // ✓`,
  zh: `type HasName = { name: string };

function greet(x: HasName) {
  console.log("Hello, " + x.name);
}

// ① class 实例 —— 没写 implements,也没写类型注解
class Cat {
  name = "Tangerine";
  meow() {}
}
greet(new Cat()); // ✓

// ② 存进变量的对象字面量(多出来的 age 不碍事)
const person = { name: "Zhen", age: 25 };
greet(person); // ✓

// ③ 函数的返回值
function makeShop() {
  return { name: "Bloom Tea", city: "Hangzhou" };
}
greet(makeShop()); // ✓`,
};

const LAB3_CODE: Loc<string> = {
  en: `// Step 1: both are string, so anything goes — the accident
type UserId0 = string;
type PostId0 = string;
declare function getUser0(id: UserId0): void;
declare const postId0: PostId0;
getUser0(postId0); // ✓ compiles, and it is still a bug

// Step 2: write the difference into the shape
type UserId = string & { __brand: "user" };
type PostId = string & { __brand: "post" };

declare function getUser(id: UserId): void;
declare const postId: PostId;
// getUser(postId);
// ✕ Argument of type 'PostId' is not assignable to parameter
//     of type 'UserId'. ... Type '"post"' is not assignable
//     to type '"user"'. ts(2345)

// Making one requires an assertion, so keep it in one place
const uid = "u_42" as UserId;
getUser(uid); // ✓`,
  zh: `// 第一步:两个都是 string,随便混 —— 事故现场
type UserId0 = string;
type PostId0 = string;
declare function getUser0(id: UserId0): void;
declare const postId0: PostId0;
getUser0(postId0); // ✓ 编译通过,但它就是个 bug

// 第二步:把「不同」写进形状
type UserId = string & { __brand: "user" };
type PostId = string & { __brand: "post" };

declare function getUser(id: UserId): void;
declare const postId: PostId;
// getUser(postId);
// ✕ Argument of type 'PostId' is not assignable to parameter
//     of type 'UserId'. ... Type '"post"' is not assignable
//     to type '"user"'. ts(2345)

// 造一个品牌值必须断言,所以把断言收在一处
const uid = "u_42" as UserId;
getUser(uid); // ✓`,
};

const LAB4_CODE: Loc<string> = {
  en: `let x: {};
x = 42;         // ✓ a number has all zero required members
x = "tea";      // ✓
x = true;       // ✓
x = () => {};   // ✓
x = [1, 2];     // ✓
// x = null;      ✕ ts(2322), stopped by strictNullChecks
// x = undefined; ✕ ts(2322), same

let y: object;
// y = 42;      ✕ ts(2322), primitives are rejected
// y = "tea";   ✕ ts(2322)
y = () => {};   // ✓ a function is an object
y = [1, 2];     // ✓ an array is an object
y = { a: 1 };   // ✓`,
  zh: `let x: {};
x = 42;         // ✓ number 的「必需成员」也是 0 个
x = "tea";      // ✓
x = true;       // ✓
x = () => {};   // ✓
x = [1, 2];     // ✓
// x = null;      ✕ ts(2322),被 strictNullChecks 拦下
// x = undefined; ✕ ts(2322),同上

let y: object;
// y = 42;      ✕ ts(2322),原始值进不来
// y = "tea";   ✕ ts(2322)
y = () => {};   // ✓ 函数是对象
y = [1, 2];     // ✓ 数组也是对象
y = { a: 1 };   // ✓`,
};

export const LABS: Lab[] = [
  {
    id: "excess-two-faces",
    title: {
      en: "See both faces of the excess property check",
      zh: "亲手触发多余属性检查的两副面孔",
    },
    d: "easy",
    tags: ["Playground", "excess property"],
    task: (
      <p>
        <T
          en={
            <>
              Open the TypeScript Playground (typescriptlang.org/play). Declare{" "}
              <code>{"type Order = { item: string; sweetness?: string }"}</code>{" "}
              and a function <code>makeOrder(o: Order)</code>. Then do two
              things. First, pass an object literal{" "}
              <b>directly at the call site</b> with the misspelled property{" "}
              <code>sweetnes</code>, and read the error. Second, store the same
              object in a variable and pass the variable. It compiles. Read the
              first error word by word: did the compiler guess what you meant?
            </>
          }
          zh={
            <>
              打开 TypeScript Playground(typescriptlang.org/play),定义{" "}
              <code>{"type Order = { item: string; sweetness?: string }"}</code>{" "}
              和一个 <code>makeOrder(o: Order)</code> 函数。然后做两件事:①
              把带错字属性 <code>sweetnes</code> 的对象字面量
              <b>在调用处直接传</b>进去,读一遍报错;②
              把同一个对象先存进变量,再把变量传进去,它会安静通过。
              把 ① 的报错逐字读完 —— 编译器有没有猜出你想写什么?
            </>
          }
        />
      </p>
    ),
    hint: {
      en: (
        <>
          Not one character of the object changes between the two calls. The
          only difference is whether the literal is written at the call site.
          That is the whole rule: the excess property check only looks at a
          fresh object literal.
        </>
      ),
      zh: (
        <>
          两次传的对象一个字都没改,唯一的区别是字面量写没写在调用处。
          规则就是这么一句:多余属性检查只看「新鲜」的对象字面量。
        </>
      ),
    },
    solution: (
      <>
        <CodeBlock lang="ts" title="Playground" hl={[8, 15]} code={LAB1_CODE} />
        <p>
          <T
            en={
              <>
                Error 1 ends with <code>Did you mean to write &apos;sweetness&apos;?</code>{" "}
                — the compiler catches the typo and names the fix. Case 2
                compiles, but at run time it prints <code>full sugar</code>:
                the misspelled property came along for the ride and the real{" "}
                <code>sweetness</code> was never set. That is the trade-off in
                one screen. A literal at the call site is checked strictly. A
                variable is checked by the ordinary rule.
              </>
            }
            zh={
              <>
                ① 的报错结尾是 <code>Did you mean to write &apos;sweetness&apos;?</code>{" "}
                —— 编译器不但拦下错字,还说出了改法。② 编译通过,
                但运行时打印的是 <code>full sugar</code>:
                错字属性跟着混了进来,真正的 <code>sweetness</code>{" "}
                从头到尾没被赋值。一屏之内就是全部取舍:
                写在调用处的字面量从严查,变量按普通规则查。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "three-ducks",
    title: {
      en: "Make three values of different origins pass the same door",
      zh: "让三个出身不同的值,通过同一道门",
    },
    d: "medium",
    tags: ["Playground", "duck typing"],
    task: (
      <p>
        <T
          en={
            <>
              In the Playground, declare{" "}
              <code>{"type HasName = { name: string }"}</code> and a function{" "}
              <code>greet(x: HasName)</code>. Then build three values that come
              from completely different places: a class instance, an object
              literal stored in a variable, and the return value of a function.
              Pass all three to <code>greet</code> without writing{" "}
              <code>implements</code>, a type annotation, or{" "}
              <code>as</code> anywhere.
            </>
          }
          zh={
            <>
              在 Playground 里定义{" "}
              <code>{"type HasName = { name: string }"}</code> 和函数{" "}
              <code>greet(x: HasName)</code>。然后造三个来路完全不同的值:①
              一个 class 的实例;② 一个存进变量的对象字面量;③
              一个函数的返回值 —— 让它们全部通过 <code>greet</code>,
              全程不写 <code>implements</code>、不写类型注解、不写{" "}
              <code>as</code>。
            </>
          }
        />
      </p>
    ),
    hint: {
      en: (
        <>
          None of the three values has to declare that it is a{" "}
          <code>HasName</code>. If the shape contains{" "}
          <code>name: string</code>, the compiler accepts it.
        </>
      ),
      zh: (
        <>
          三个值都不需要声明「我是 HasName」。只要形状里有{" "}
          <code>name: string</code>,编译器就接受。
        </>
      ),
    },
    solution: (
      <>
        <CodeBlock lang="ts" title="Playground" code={LAB2_CODE} />
        <p>
          <T
            en={
              <>
                There is no declared relationship between any of the three
                values and <code>HasName</code>. The compiler compared each
                shape against the required members and found{" "}
                <code>name: string</code> every time. Compatibility here is
                computed, not registered.
              </>
            }
            zh={
              <>
                三个值和 <code>HasName</code>{" "}
                之间没有任何声明过的关系。编译器把每个形状和要求的成员比了一遍,
                每次都找到了 <code>name: string</code>。
                这里的兼容是算出来的,不是登记出来的。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "brand-the-ids",
    title: {
      en: "Reproduce an ID mix-up, then block it with a branded type",
      zh: "复刻一次 ID 混用事故,再用品牌类型堵上",
    },
    d: "medium",
    tags: ["Playground", "branded types"],
    task: (
      <p>
        <T
          en={
            <>
              Step 1: declare <code>type UserId = string</code> and{" "}
              <code>type PostId = string</code>, write{" "}
              <code>getUser(id: UserId)</code>, and pass a{" "}
              <code>PostId</code> into it on purpose. Confirm that the compiler{" "}
              <b>says nothing</b>. Step 2: turn both into branded types so that
              the same mistake becomes a compile error. Then try to create a{" "}
              <code>UserId</code> from a plain string and see what it costs.
            </>
          }
          zh={
            <>
              第一步:定义 <code>type UserId = string</code> 和{" "}
              <code>type PostId = string</code>,写一个{" "}
              <code>getUser(id: UserId)</code>,然后故意传一个{" "}
              <code>PostId</code> 进去,确认编译器<b>毫无反应</b>。第二步:
              把两个类型改成品牌类型(branded types),
              让同样的误传变成编译错误。再试着从一个普通 string 造出{" "}
              <code>UserId</code>,看看代价是什么。
            </>
          }
        />
      </p>
    ),
    hint: {
      en: (
        <>
          The compiler only compares shapes, so give the two shapes something
          different: intersect each one with an object type carrying a marker
          member whose type differs.
        </>
      ),
      zh: (
        <>
          编译器只比形状,那就让两个形状不一样:
          各自和一个带标记成员的对象类型求交集,标记成员的类型互不相同。
        </>
      ),
    },
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="Playground"
          hl={[9, 10]}
          code={LAB3_CODE}
        />
        <p>
          <T
            en={
              <>
                <code>__brand</code> exists only in the type system. At run time
                a <code>UserId</code> is an ordinary string, so the marker costs
                nothing. Note the honest part: no plain string is assignable to{" "}
                <code>UserId</code>, so creating one always needs an assertion.
                The usual way to keep that honest is to write one{" "}
                <code>toUserId(s: string)</code> function that performs the
                assertion, call it only where data enters the system, and never
                write <code>as UserId</code> anywhere else.
              </>
            }
            zh={
              <>
                <code>__brand</code> 只存在于类型层面。运行时{" "}
                <code>UserId</code> 就是普通 string,标记不占任何开销。
                注意诚实的那一面:普通 string 不能赋给{" "}
                <code>UserId</code>,所以造一个出来总得断言一次。
                通常的做法是只写一个 <code>toUserId(s: string)</code>{" "}
                函数来做这次断言,只在数据进入系统的入口调用它,
                别处一律不写 <code>as UserId</code>。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "empty-object-limits",
    title: {
      en: "Push the {} type to its limit",
      zh: "拿 {} 做一次极限测试",
    },
    d: "hard",
    tags: ["Playground", "{} vs object"],
    task: (
      <p>
        <T
          en={
            <>
              In the Playground (check that strict is on), declare{" "}
              <code>{"let x: {}"}</code> and assign these values to it one by
              one: <code>42</code>, <code>&quot;tea&quot;</code>,{" "}
              <code>true</code>, <code>{"() => {}"}</code>, <code>[1, 2]</code>,{" "}
              <code>null</code>, <code>undefined</code>. Write down which ones
              fail. Then change the type of <code>x</code> to{" "}
              <code>object</code> and run the same list again. Compare the two
              results and say what each type actually rejects.
            </>
          }
          zh={
            <>
              在 Playground(确认右上角 strict 是开的)声明{" "}
              <code>{"let x: {}"}</code>,依次把这些值赋给它:<code>42</code>、
              <code>&quot;tea&quot;</code>、<code>true</code>、
              <code>{"() => {}"}</code>、<code>[1, 2]</code>、<code>null</code>、
              <code>undefined</code>,记下哪些报错。再把 <code>x</code>{" "}
              的类型换成 <code>object</code> 重测一轮,对比两张结果,
              说清楚两个类型各自到底挡住了什么。
            </>
          }
        />
      </p>
    ),
    hint: {
      en: (
        <>
          <code>{"{}"}</code> literally means &quot;has these zero required
          members&quot;. Almost every value satisfies a list of zero
          requirements. <code>object</code> means something different: not a
          primitive.
        </>
      ),
      zh: (
        <>
          <code>{"{}"}</code>{" "}
          的字面意思是「必须有以下 0 个成员」——
          一份空要求清单,几乎人人合格。<code>object</code>{" "}
          的意思是另一回事:不是原始值。
        </>
      ),
    },
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title={{
            en: "Playground · strict mode",
            zh: "Playground · strict 模式",
          }}
          code={LAB4_CODE}
        />
        <p>
          <T
            en={
              <>
                Result: <code>{"{}"}</code> rejects only <code>null</code> and{" "}
                <code>undefined</code>. Every primitive passes, because the
                required member list is empty and every value satisfies it.{" "}
                <code>object</code> rejects all primitives and accepts objects,
                arrays, and functions. So: write <code>object</code> when you
                mean any object, write <code>unknown</code> when you mean any
                value at all and you will narrow it before use, and avoid{" "}
                <code>{"{}"}</code>.
              </>
            }
            zh={
              <>
                结果:<code>{"{}"}</code> 只挡 <code>null</code> 和{" "}
                <code>undefined</code>,原始值全部放行 ——
                因为它的必需成员清单是空的,任何值都满足。<code>object</code>{" "}
                挡掉全部原始值,只收对象、数组和函数。所以:
                想表达「任意对象」写 <code>object</code>;
                想表达「什么值都可能,用之前先收窄」写{" "}
                <code>unknown</code>;<code>{"{}"}</code> 尽量别用。
              </>
            }
          />
        </p>
      </>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: (
        <>
          When TypeScript decides whether two types are compatible, what does it
          compare?
        </>
      ),
      zh: <>TypeScript 判断两个类型是否兼容时,比较的是什么?</>,
    },
    opts: [
      { en: <>Whether the two types have the same name</>, zh: <>类型的名字是否相同</> },
      {
        en: <>Their shape: which members they have, and the type of each member</>,
        zh: <>类型的形状:有哪些成员,每个成员是什么类型</>,
      },
      {
        en: (
          <>
            Whether a relationship was declared with <code>implements</code> or{" "}
            <code>extends</code>
          </>
        ),
        zh: (
          <>
            是否用 <code>implements</code> 或 <code>extends</code> 声明过关系
          </>
        ),
      },
      {
        en: <>Whether both types are declared in the same file</>,
        zh: <>两个类型是否定义在同一个文件里</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            The name is only a label. Two interfaces with different names but
            the same members are assignable to each other. Comparing names is
            what Java and C# do. TypeScript does not.
          </>
        ),
        zh: (
          <>
            名字只是标签。两个不同名但成员相同的 interface
            可以互相赋值。比较名字是 Java 和 C# 的做法,TypeScript 不这样做。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            A declared relationship is not required. An object literal that
            never mentions the target type is accepted as long as its shape
            covers what the target requires.
          </>
        ),
        zh: (
          <>
            声明关系不是必需的。一个从没提过目标类型的对象字面量,
            只要形状覆盖了目标的要求,照样通过。
          </>
        ),
      },
      {
        en: (
          <>
            Where a type is declared has no effect. Two identically shaped types
            in two unrelated files are interchangeable.
          </>
        ),
        zh: (
          <>
            在哪里声明完全没有影响。两个毫无关系的文件里,
            形状相同的两个类型可以互换。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          TypeScript uses structural typing. It ignores the name and compares
          the members. If the source has every member the target requires, and
          each of those members has a compatible type, the assignment is
          allowed.
        </>
      ),
      zh: (
        <>
          TypeScript 用的是结构化类型(structural typing):忽略名字,比较成员。
          源类型有目标要求的每个成员,且这些成员的类型也兼容,赋值就成立。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Given <code>{"interface A { x: number }"}</code> and{" "}
          <code>{"interface B { x: number }"}</code>, and{" "}
          <code>const a: A = {"{ x: 1 }"}</code>, what happens on{" "}
          <code>const b: B = a</code>?
        </>
      ),
      zh: (
        <>
          有 <code>{"interface A { x: number }"}</code> 和{" "}
          <code>{"interface B { x: number }"}</code>,先写{" "}
          <code>const a: A = {"{ x: 1 }"}</code>,那么{" "}
          <code>const b: B = a</code> 会怎样?
        </>
      ),
    },
    opts: [
      {
        en: <>An error, because A and B are two different interfaces</>,
        zh: <>报错 —— A 和 B 是两个不同的 interface</>,
      },
      {
        en: <>It compiles, because the shapes match and the names do not matter</>,
        zh: <>通过 —— 形状相同,名字不同也兼容</>,
      },
      {
        en: (
          <>
            An error, unless you first write <code>A extends B</code>
          </>
        ),
        zh: (
          <>
            报错 —— 必须先写 <code>A extends B</code>
          </>
        ),
      },
      { en: <>It compiles, but throws at run time</>, zh: <>通过,但运行时会抛异常</> },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            &quot;Different interface means different type&quot; is the rule in
            a nominal system. In TypeScript the name is a label, and{" "}
            <code>x: number</code> matches <code>x: number</code>.
          </>
        ),
        zh: (
          <>
            「不同 interface 就是不同类型」是名义类型系统的规则。TypeScript
            里名字只是标签,<code>x: number</code> 对上 <code>x: number</code>,
            就是兼容。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            <code>extends</code> makes the intent easier to read, but it is not
            a precondition for compatibility. With no declaration at all, the
            same shape is still assignable.
          </>
        ),
        zh: (
          <>
            <code>extends</code>{" "}
            能让意图更好读,但它不是兼容的前提。一句声明都不写,
            形状相同照样能赋值。
          </>
        ),
      },
      {
        en: (
          <>
            There is nothing to throw. Types are erased during compilation, so
            this line becomes a plain <code>const b = a</code> in the JavaScript
            output.
          </>
        ),
        zh: (
          <>
            没有东西可抛。类型在编译时被擦除,这一行到了 JavaScript
            产物里就是普通的 <code>const b = a</code>。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Two types with the same shape and different names are assignable in
          both directions. <code>interface</code> and <code>type</code> behave
          the same way here. Neither one creates a distinct type just by having
          a distinct name.
        </>
      ),
      zh: (
        <>
          形状相同、名字不同的两个类型,可以互相赋值。<code>interface</code> 和{" "}
          <code>type</code> 在这一点上表现一致:
          都不会仅仅因为名字不同就造出一个不兼容的新类型。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          <code>{"type Staff = { name: string }"}</code>, and the variable{" "}
          <code>barista</code> has type{" "}
          <code>{"{ name: string; makeTea: () => void }"}</code>. Which
          assignment compiles?
        </>
      ),
      zh: (
        <>
          <code>{"type Staff = { name: string }"}</code>,变量{" "}
          <code>barista</code> 的类型是{" "}
          <code>{"{ name: string; makeTea: () => void }"}</code>。
          下面哪个赋值能通过?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            <code>const s: Staff = barista</code> — more members assigned to
            fewer
          </>
        ),
        zh: (
          <>
            <code>const s: Staff = barista</code> —— 成员多的赋给成员少的
          </>
        ),
      },
      {
        en: (
          <>
            <code>const b: typeof barista = someStaff</code> — fewer members
            assigned to more
          </>
        ),
        zh: (
          <>
            <code>const b: typeof barista = someStaff</code> ——
            成员少的赋给成员多的
          </>
        ),
      },
      { en: <>Both directions compile</>, zh: <>两个方向都通过</> },
      { en: <>Neither direction compiles</>, zh: <>两个方向都报错</> },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: (
          <>
            That is the wrong direction. <code>Staff</code> has no{" "}
            <code>makeTea</code>, so a required member is missing:{" "}
            <code>
              Property &apos;makeTea&apos; is missing in type ... ts(2741)
            </code>
            .
          </>
        ),
        zh: (
          <>
            方向反了。<code>Staff</code> 身上没有 <code>makeTea</code>,
            缺了一个必需成员:
            <code>
              Property &apos;makeTea&apos; is missing in type ... ts(2741)
            </code>
            。
          </>
        ),
      },
      {
        en: (
          <>
            Only one direction works. <code>barista</code> satisfies everything{" "}
            <code>Staff</code> requires, and the extra member is not a problem.
            The other way round, <code>makeTea</code> is missing.
          </>
        ),
        zh: (
          <>
            只有一个方向通。<code>barista</code> 满足 <code>Staff</code>{" "}
            的全部要求,多出来的成员不构成问题;反过来则缺了{" "}
            <code>makeTea</code>。
          </>
        ),
      },
      {
        en: (
          <>
            The first direction does compile. <code>barista</code> has{" "}
            <code>name</code> and its type matches, so every requirement of{" "}
            <code>Staff</code> is met.
          </>
        ),
        zh: (
          <>
            第一个方向是通的。<code>barista</code> 有 <code>name</code>,
            类型也对,<code>Staff</code> 的要求全部满足。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          More members means more specific, which means a smaller set of values.
          Every value in the smaller set also belongs to the larger one, so the
          more specific type can be used where the less specific one is
          expected. The reverse is not true.
        </>
      ),
      zh: (
        <>
          成员越多越具体,对应的值集合越小。小集合里的每个值同时也属于大集合,
          所以更具体的类型能用在要求较宽松的位置,反过来不行。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          <code>{'makeOrder({ item: "Milk tea", cup: "large" })'}</code> fails
          because of the extra <code>cup</code>, but{" "}
          <code>{'const d = { item: "Milk tea", cup: "large" }'}</code> followed
          by <code>makeOrder(d)</code> compiles. Why?
        </>
      ),
      zh: (
        <>
          <code>{'makeOrder({ item: "Milk tea", cup: "large" })'}</code> 因为多了{" "}
          <code>cup</code> 而报错,可先写{" "}
          <code>{'const d = { item: "Milk tea", cup: "large" }'}</code> 再{" "}
          <code>makeOrder(d)</code> 就通过了。为什么?
        </>
      ),
    },
    opts: [
      {
        en: <>Storing it in a variable makes the compiler drop the cup property</>,
        zh: <>存进变量后,cup 属性被编译器删掉了</>,
      },
      {
        en: (
          <>
            The excess property check only applies to a fresh object literal.
            Once the object is in a variable, only the ordinary compatibility
            rule applies, and extra members are allowed
          </>
        ),
        zh: (
          <>
            多余属性检查只对「新鲜」的对象字面量生效。对象一旦存进变量,
            就只按普通的兼容规则判断,多出来的成员是允许的
          </>
        ),
      },
      {
        en: <>It is a known TypeScript bug and a later version will fix it</>,
        zh: <>这是 TypeScript 的已知 bug,新版本会修</>,
      },
      {
        en: (
          <>
            The type of <code>d</code> is inferred as <code>any</code>
          </>
        ),
        zh: (
          <>
            变量 <code>d</code> 的类型被推断成了 <code>any</code>
          </>
        ),
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            Type checking never changes a value. <code>cup</code> is still on{" "}
            <code>d</code> at run time and can still be read.
          </>
        ),
        zh: (
          <>
            类型检查从不改变值。运行时 <code>cup</code> 仍然在 <code>d</code>{" "}
            身上,照样能读到。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            It is deliberate, and it is documented behavior. A literal written
            at the call site is used once, so an unexpected member is almost
            always a typo. A variable may be used elsewhere for a legitimate
            purpose, so it is judged by the normal rule.
          </>
        ),
        zh: (
          <>
            这是刻意设计,也是文档里写明的行为。写在调用处的字面量只用这一次,
            多出来的成员几乎都是拼错;变量可能在别处另有正当用途,
            所以按普通规则判断。
          </>
        ),
      },
      {
        en: (
          <>
            <code>d</code> is inferred as{" "}
            <code>{"{ item: string; cup: string }"}</code>, not{" "}
            <code>any</code>. It compiles because a type with more members is
            assignable to one with fewer.
          </>
        ),
        zh: (
          <>
            <code>d</code> 被推断成{" "}
            <code>{"{ item: string; cup: string }"}</code>,不是{" "}
            <code>any</code>。它能通过,靠的是「成员多的可以赋给成员少的」这条规则。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          The excess property check is an extra check layered on top of
          assignability, aimed at typos. It runs only when a fresh object
          literal is assigned or passed directly to a target with a known type.
          It is not part of the assignability rule itself, which is exactly why
          storing the object first makes it disappear.
        </>
      ),
      zh: (
        <>
          多余属性检查是叠加在可赋值性之上的一道额外检查,目标是抓拼写错误。
          只有当一个新鲜的对象字面量被直接赋值、或直接传给已知类型的位置时,
          它才会运行。它不属于可赋值性规则本身 ——
          这正是先存进变量它就消失的原因。
        </>
      ),
    },
  },
  {
    type: "multi",
    q: {
      en: <>Which of these statements about structural typing are true? (multiple answers)</>,
      zh: <>关于结构化类型,下面哪些说法是对的?(多选)</>,
    },
    opts: [
      {
        en: <>Giving a type a new name does not create an incompatible new type</>,
        zh: <>给类型起一个新名字,不会造出一个不兼容的新类型</>,
      },
      {
        en: (
          <>
            A class instance can be assigned to a type it never declared any
            relationship with
          </>
        ),
        zh: <>class 的实例可以赋给一个从没声明过关系的类型</>,
      },
      {
        en: <>An object literal with an extra property is an error wherever it appears</>,
        zh: <>对象字面量只要多写属性,在任何位置都会报错</>,
      },
      {
        en: (
          <>
            The <code>{"{}"}</code> type accepts almost any value, except{" "}
            <code>null</code> and <code>undefined</code>
          </>
        ),
        zh: (
          <>
            <code>{"{}"}</code> 类型几乎接受任何值,只有 <code>null</code> 和{" "}
            <code>undefined</code> 除外
          </>
        ),
      },
      {
        en: <>Two types can only be compatible if the same author declared both</>,
        zh: <>两个类型想兼容,必须由同一个人定义</>,
      },
    ],
    correct: [0, 1, 3],
    missHint: {
      en: (
        <>
          One or more correct answers are still unselected. Is a name a label?
          Do classes take part in shape comparison? How many members does{" "}
          <code>{"{}"}</code> require?
        </>
      ),
      zh: (
        <>
          还有正确项没选。名字是不是标签?class 参不参与形状比较?
          <code>{"{}"}</code> 要求几个成员?
        </>
      ),
    },
    extraHint: {
      en: (
        <>
          One of the selected statements is false. An extra property is only
          reported when the literal is fresh, and the compiler never looks at
          who wrote a type.
        </>
      ),
      zh: (
        <>
          选进了一个错误说法。多写的属性只在字面量「新鲜」时才被报出来,
          而类型是谁写的,编译器根本不看。
        </>
      ),
    },
    why: {
      en: (
        <>
          A is true: a name is only a label. B is true: classes are compared by
          shape as well, with one exception for <code>private</code> and{" "}
          <code>protected</code> members, covered in chapter 08. C is false: the
          excess property check only applies to a fresh literal. D is true:{" "}
          <code>{"{}"}</code> requires zero members. E is false: authorship is
          not part of the comparison.
        </>
      ),
      zh: (
        <>
          A 对:名字只是标签。B 对:class 同样按形状比较,唯一的例外是带{" "}
          <code>private</code> 或 <code>protected</code> 成员的类,见第 08 章。C
          错:多余属性检查只对新鲜的字面量生效。D 对:<code>{"{}"}</code>{" "}
          要求 0 个成员。E 错:谁写的不参与比较。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          <code>UserId</code> and <code>PostId</code> are both declared as{" "}
          <code>string</code>, so passing a post id where a user id is expected
          compiles. What is the right fix?
        </>
      ),
      zh: (
        <>
          <code>UserId</code> 和 <code>PostId</code> 都声明为{" "}
          <code>string</code>,于是把帖子 ID
          传到要用户 ID 的地方也能编译通过。最对症的修法是?
        </>
      ),
    },
    opts: [
      {
        en: <>Check the first letter of the id with an if before every call</>,
        zh: <>在每次调用前用 if 检查 ID 的开头字母</>,
      },
      {
        en: (
          <>
            Use branded types: <code>{'string & { __brand: "user" }'}</code>, so
            the two shapes differ
          </>
        ),
        zh: (
          <>
            用品牌类型:<code>{'string & { __brand: "user" }'}</code>,
            让两个形状不同
          </>
        ),
      },
      {
        en: (
          <>
            Change the parameter type to <code>any</code> to skip the check
          </>
        ),
        zh: (
          <>
            把参数类型改成 <code>any</code>,绕开检查
          </>
        ),
      },
      {
        en: <>Rename both types to something longer so people can tell them apart</>,
        zh: <>给两个类型换更长的名字,方便肉眼区分</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            A run-time check is a fallback, and it only fires once the wrong
            value is already in play. The goal here is to stop the call from
            compiling.
          </>
        ),
        zh: (
          <>
            运行时检查只是兜底,而且要等错误的值已经传进来才会响。
            这里的目标是让这次调用根本编译不过。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            <code>any</code> goes the wrong way. It turns off checking entirely,
            including the errors that were being caught. The problem is that the
            check is too coarse, not that there is too much checking.
          </>
        ),
        zh: (
          <>
            <code>any</code> 是往反方向走:它把检查整个关掉,
            连本来能拦下的错误也放过了。问题是检查太粗,不是检查太多。
          </>
        ),
      },
      {
        en: (
          <>
            The compiler does not read names. However long the name, the shape
            is still <code>string</code>, and the mix-up still compiles.
          </>
        ),
        zh: (
          <>
            编译器不看名字。名字再长,形状还是 <code>string</code>,
            误传照样通过。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Since the compiler compares shapes, write the difference into the
          shape. Intersect each type with a marker member of a different type
          and the two are no longer interchangeable. The marker exists only at
          compile time, so there is no run-time cost. The price is that creating
          one requires an assertion, which is normally wrapped in a single
          factory function.
        </>
      ),
      zh: (
        <>
          既然编译器比的是形状,就把区别写进形状:
          各自和一个类型不同的标记成员求交集,两者就不再能互换。
          标记只存在于编译期,没有运行时开销。代价是造一个值需要断言,
          通常把它包进唯一一个工厂函数里。
        </>
      ),
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          A type system that decides compatibility by shape rather than by name
          is called ________ typing (answer in English).
        </>
      ),
      zh: (
        <>
          「兼容看形状、不看名字」的类型系统,术语叫 ________
          typing(填英文单词)。
        </>
      ),
    },
    placeholder: { en: "one English word...", zh: "英文单词…" },
    answers: ["structural", "structural typing"],
    hint: {
      en: (
        <>
          It is the adjective formed from &quot;structure&quot;. It is also the
          title of this chapter.
        </>
      ),
      zh: (
        <>
          就是「结构」那个词的形容词形式,也是本章的标题:结构化类型。
        </>
      ),
    },
    why: {
      en: (
        <>
          Structural typing. The opposite approach, used by Java and C#, is
          nominal typing: those compilers compare the declared names and the
          declared inheritance, so two classes with identical members are still
          unrelated.
        </>
      ),
      zh: (
        <>
          structural typing,结构化类型。相对的一种做法是 Java、C# 用的
          nominal typing(名义类型):
          编译器比较声明的名字和声明的继承关系,所以成员完全一样的两个类
          依然毫无关系。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          You want a parameter type that means &quot;any object is fine, but not
          a primitive value&quot;. Which one do you write?
        </>
      ),
      zh: (
        <>
          想给函数参数一个类型,表达「任意对象都行,但原始值不行」,
          应该写哪个?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            <code>{"{}"}</code>
          </>
        ),
        zh: (
          <>
            <code>{"{}"}</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>object</code>
          </>
        ),
        zh: (
          <>
            <code>object</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>any</code>
          </>
        ),
        zh: (
          <>
            <code>any</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>unknown</code>
          </>
        ),
        zh: (
          <>
            <code>unknown</code>
          </>
        ),
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            <code>{"{}"}</code> looks like &quot;an object&quot;, but it means
            &quot;has these zero required members&quot;. <code>42</code>,{" "}
            <code>&quot;tea&quot;</code>, and <code>true</code> all satisfy
            that, so primitives are not rejected.
          </>
        ),
        zh: (
          <>
            <code>{"{}"}</code> 看着像「一个对象」,实际意思是「必须有以下 0
            个成员」。<code>42</code>、<code>&quot;tea&quot;</code>、
            <code>true</code> 全部满足,原始值根本挡不住。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            <code>any</code> turns checking off. It rejects nothing, and the
            values read out of it are unchecked too.
          </>
        ),
        zh: (
          <>
            <code>any</code> 把检查关掉了,什么都拦不住,
            而且从它读出来的值也不再受检查。
          </>
        ),
      },
      {
        en: (
          <>
            <code>unknown</code> means &quot;any value at all&quot;, primitives
            included. It is safe, but it does not say &quot;objects only&quot;.
          </>
        ),
        zh: (
          <>
            <code>unknown</code> 的意思是「任何值都可能」,原始值也收。
            它安全,但表达的不是「只要对象」。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>object</code> means &quot;not a primitive&quot;: objects,
          arrays, and functions are accepted, while{" "}
          <code>number</code>, <code>string</code>, and <code>boolean</code> are
          not. Use <code>object</code> for any object, <code>unknown</code> for
          any value that you will narrow before use, and leave{" "}
          <code>{"{}"}</code> alone.
        </>
      ),
      zh: (
        <>
          <code>object</code> 的意思是「不是原始值」:对象、数组、函数进得来,
          <code>number</code>、<code>string</code>、<code>boolean</code>{" "}
          进不来。想要任意对象用 <code>object</code>;
          想要任何值、用之前先收窄,用 <code>unknown</code>;<code>{"{}"}</code>{" "}
          放着别用。
        </>
      ),
    },
  },
];
