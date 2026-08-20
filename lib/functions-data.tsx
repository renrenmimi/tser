"use client";

// 第 02 章 · 函数与对象类型 —— 动手任务 LABS + 通关测验 QUIZ 数据(双语)。
// 正文用 <T en zh />,props 用 { en, zh };代码示例的可执行行两语言逐字节相同。
// 编译器报错原文一律保留英文,并已在 TypeScript 5.9 + strict 下实测。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";
import { T } from "@/lib/i18n";

export const LABS: Lab[] = [
  {
    id: "annotate-maketea",
    title: {
      en: "Annotate makeTea",
      zh: "给 makeTea 补上完整注解",
    },
    d: "easy",
    tags: {
      en: ["Playground", "parameter types", "return type"],
      zh: ["Playground", "参数注解", "返回值"],
    },
    task: (
      <T
        en={
          <>
            <p>
              Open the TypeScript Playground (typescriptlang.org/play) and
              paste in this JavaScript-style function:{" "}
              <code>{`function makeTea(base, sweet) { return base + "(" + sweet + "% sugar)"; }`}</code>{" "}
              Annotate it: base is a string, sweet is a number, and it returns
              a string. Then call{" "}
              <code>makeTea(50, &quot;Oolong&quot;)</code> with the arguments
              swapped and read what the compiler reports.
            </p>
          </>
        }
        zh={
          <>
            <p>
              打开 TypeScript Playground(typescriptlang.org/play),
              把下面这段 JS 风格的函数贴进去:
              <code>{`function makeTea(base, sweet) { return base + "(" + sweet + "% sugar)"; }`}</code>
              。给它补上注解:base 是 string,sweet 是 number,返回值 string。
              然后故意把参数反着传,调用{" "}
              <code>makeTea(50, &quot;Oolong&quot;)</code>,读一读编译器报了什么。
            </p>
          </>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            Each parameter is written <code>name: type</code>. The return type
            goes after the closing parenthesis: <code>): string</code>. The
            error names the parameter, what was expected, and what was given.
          </>
        }
        zh={
          <>
            每个参数写成 <code>名字: 类型</code>,返回值写在关门括号后面:
            <code>): string</code>。
            报错会说清是哪个参数、期望什么、实际给了什么。
          </>
        }
      />
    ),
    solution: (
      <T
        en={
          <>
            <CodeBlock
              lang="ts"
              title="playground"
              code={`function makeTea(base: string, sweet: number): string {
  return base + "(" + sweet + "% sugar)";
}

makeTea("Oolong", 50); // ok
makeTea(50, "Oolong");
// Argument of type 'number' is not assignable to parameter of type 'string'.`}
            />
            <p>
              Only <b>one</b> error appears, not two. For a call to a function
              with a single signature, TypeScript reports the first argument
              that does not fit and stops there. Fix that argument and the
              error on the second one appears. Without annotations, this bug
              produces no error at all: the program runs and prints
              &quot;50(Oolong% sugar)&quot;.
            </p>
          </>
        }
        zh={
          <>
            <CodeBlock
              lang="ts"
              title="playground"
              code={`function makeTea(base: string, sweet: number): string {
  return base + "(" + sweet + "% sugar)";
}

makeTea("Oolong", 50); // ✓
makeTea(50, "Oolong");
// Argument of type 'number' is not assignable to parameter of type 'string'.`}
            />
            <p>
              只会出现<b>一条</b>报错,不是两条。
              对一个只有单条签名的函数,TypeScript 报出第一个对不上的实参就停了;
              把它改对,第二个实参的报错才会冒出来。
              而没有注解的 JS 版本根本不报错:程序照跑,打印出
              &quot;50(Oolong% sugar)&quot;。
            </p>
          </>
        }
      />
    ),
  },
  {
    id: "trio-orderline",
    title: {
      en: "Optional, default, and rest in one function",
      zh: "可选、默认值、rest:一口气用上",
    },
    d: "medium",
    tags: {
      en: ["Playground", "optional parameters", "rest"],
      zh: ["Playground", "可选参数", "rest"],
    },
    task: (
      <T
        en={
          <>
            <p>
              Write an <code>orderLine</code> function in the Playground: a
              required first parameter base (string), a second parameter sugar
              with the default 50, and then any number of toppings as{" "}
              <code>...toppings: string[]</code>. Then do three things. (1)
              Hover sugar and read its inferred type. (2) Check that both{" "}
              <code>orderLine(&quot;Milk Green&quot;)</code> and{" "}
              <code>
                orderLine(&quot;Milk Green&quot;, 30, &quot;boba&quot;,
                &quot;coconut jelly&quot;)
              </code>{" "}
              compile. (3) Move sugar in front of base and see what happens.
            </p>
          </>
        }
        zh={
          <>
            <p>
              在 Playground 里写一个 <code>orderLine</code> 函数:
              第一个参数 base(string,必选),
              第二个参数 sugar(默认值 50),后面收任意多个配料{" "}
              <code>...toppings: string[]</code>。然后做三件事:
              ① 悬停 sugar,看推断出来的类型;
              ② 确认 <code>orderLine(&quot;Milk Green&quot;)</code> 和{" "}
              <code>
                orderLine(&quot;Milk Green&quot;, 30, &quot;boba&quot;,
                &quot;coconut jelly&quot;)
              </code>{" "}
              都能编译;③ 把 sugar 挪到 base 前面,看会发生什么。
            </p>
          </>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            A parameter with a default needs no type annotation. A rest
            parameter has to be last. Step 3 does not report &quot;wrong
            order&quot;. Think about how many arguments the function now
            requires.
          </>
        }
        zh={
          <>
            带默认值的参数不用写类型;rest 参数必须放在最后。
            第 ③ 步不会报「顺序错误」—— 想想这时候函数到底要求几个实参。
          </>
        }
      />
    ),
    solution: (
      <T
        en={
          <>
            <CodeBlock
              lang="ts"
              title="playground"
              code={`function orderLine(base: string, sugar = 50, ...toppings: string[]) {
  return base + " " + sugar + "% sugar + " + toppings.join(", ");
}

orderLine("Milk Green");                            // ok, sugar is 50, toppings is []
orderLine("Milk Green", 30, "boba", "coconut jelly"); // ok, the last two go into toppings

// Step 3: put the defaulted parameter first.
function bad(sugar = 50, base: string) {}
bad("Milk Green");
// Expected 2 arguments, but got 1.`}
            />
            <p>
              Hovering sugar shows <code>number</code>, read from the default
              value 50. Step 3 is the interesting one. Putting a defaulted
              parameter first is not a syntax error, but the default stops
              being usable: a parameter only becomes optional at the call site
              if every parameter after it is optional too. Here base is
              required, so the function still needs two arguments and{" "}
              <code>bad(&quot;Milk Green&quot;)</code> fails on the count. To
              use the default you would have to write{" "}
              <code>bad(undefined, &quot;Milk Green&quot;)</code>. That is why
              defaulted parameters go at the end in practice.
            </p>
          </>
        }
        zh={
          <>
            <CodeBlock
              lang="ts"
              title="playground"
              code={`function orderLine(base: string, sugar = 50, ...toppings: string[]) {
  return base + " " + sugar + "% sugar + " + toppings.join(", ");
}

orderLine("Milk Green");                            // ✓ sugar 用默认值,toppings 是 []
orderLine("Milk Green", 30, "boba", "coconut jelly"); // ✓ 后两个进了 toppings

// ③ 把带默认值的参数挪到最前面:
function bad(sugar = 50, base: string) {}
bad("Milk Green");
// Expected 2 arguments, but got 1.`}
            />
            <p>
              悬停 sugar 显示 <code>number</code>,是从默认值 50 推断的。
              第 ③ 步最有意思:把带默认值的参数放在前面并不是语法错误,
              但这个默认值用不上了 ——
              一个参数要在调用处变成可选,前提是它<b>后面</b>的参数也全都可选。
              这里 base 是必选的,所以函数仍然要求两个实参,
              <code>bad(&quot;Milk Green&quot;)</code> 直接卡在个数上。
              想用默认值就得写成{" "}
              <code>bad(undefined, &quot;Milk Green&quot;)</code>。
              所以实践中带默认值的参数照样放在最后。
            </p>
          </>
        }
      />
    ),
  },
  {
    id: "readonly-inventory",
    title: {
      en: "readonly and index signatures: build a stock table",
      zh: "readonly 与索引签名:建一张库存表",
    },
    d: "medium",
    tags: {
      en: ["Playground", "readonly", "index signature"],
      zh: ["Playground", "readonly", "索引签名"],
    },
    task: (
      <T
        en={
          <>
            <p>
              In the Playground, define <code>MenuItem</code> (readonly id:
              number, name: string, price: number) and{" "}
              <code>Inventory</code> (an index signature with string keys and
              number values). Then: (1) create a MenuItem and try to change its
              id; (2) create a stock table, assign a number under a new key,
              then assign a string. Read both errors.
            </p>
          </>
        }
        zh={
          <>
            <p>
              在 Playground 里定义 <code>MenuItem</code>
              (readonly id: number、name: string、price: number)和{" "}
              <code>Inventory</code>(索引签名:键 string、值 number)。然后:
              ① 造一个 MenuItem,试着改它的 id;
              ② 造一张库存表,先给一个新键赋一个 number,再赋一个 string ——
              把两条报错分别读懂。
            </p>
          </>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            An index signature is written <code>{"[sku: string]: number"}</code>
            . The two errors read very differently: one is about a read-only
            property, the other about a type that is not assignable.
          </>
        }
        zh={
          <>
            索引签名的写法是 <code>{"[sku: string]: number"}</code>。
            两条报错的说法完全不同:一条说属性只读,一条说类型不可赋值。
          </>
        }
      />
    ),
    solution: (
      <T
        en={
          <>
            <CodeBlock
              lang="ts"
              title="playground"
              code={`interface MenuItem {
  readonly id: number;
  name: string;
  price: number;
}

interface Inventory {
  [sku: string]: number;
}

const jasmine: MenuItem = { id: 1, name: "Jasmine Milk Green", price: 16 };
jasmine.id = 99;
// Cannot assign to 'id' because it is a read-only property.

const stock: Inventory = {};
stock["tea-001"] = 30;     // ok, any key is allowed
stock["tea-002"] = "many";
// Type 'string' is not assignable to type 'number'.`}
            />
            <p>
              The two rules cover different things. <code>readonly</code>{" "}
              controls whether a property can be written at all. The index
              signature controls what a written value may look like. One more
              experiment: open the .JS tab on the right. Both{" "}
              <code>readonly</code> and every type are gone, which is what
              &quot;types exist only at compile time&quot; means in practice.
            </p>
          </>
        }
        zh={
          <>
            <CodeBlock
              lang="ts"
              title="playground"
              code={`interface MenuItem {
  readonly id: number;
  name: string;
  price: number;
}

interface Inventory {
  [sku: string]: number;
}

const jasmine: MenuItem = { id: 1, name: "Jasmine Milk Green", price: 16 };
jasmine.id = 99;
// Cannot assign to 'id' because it is a read-only property.

const stock: Inventory = {};
stock["tea-001"] = 30;     // ✓ 任意键都能加
stock["tea-002"] = "many";
// Type 'string' is not assignable to type 'number'.`}
            />
            <p>
              两条规则各管一头:<code>readonly</code> 管的是这个属性能不能写,
              索引签名管的是写进去的值长什么样。
              顺手再做个实验:点开右侧的 .JS 标签 —— <code>readonly</code>{" "}
              和所有类型都不见了。这就是「类型只活在编译期」的实际含义。
            </p>
          </>
        }
      />
    ),
  },
  {
    id: "iface-vs-type",
    title: {
      en: "Trigger declaration merging, then the type alias error",
      zh: "亲手触发 declaration merging(和 type 的报错)",
    },
    d: "hard",
    tags: {
      en: ["Playground", "interface", "type"],
      zh: ["Playground", "interface", "type"],
    },
    task: (
      <T
        en={
          <>
            <p>
              In the Playground: (1) declare an interface <code>Shop</code>{" "}
              with name: string, then a few lines later declare{" "}
              <b>another interface with the same name</b> holding city: string,
              and create a Shop object — see how many fields it needs. (2)
              Change both to type aliases and read the error. (3) Write
              something with type that interface cannot express:{" "}
              <code>
                type Size = &quot;small&quot; | &quot;large&quot;
              </code>
              .
            </p>
          </>
        }
        zh={
          <>
            <p>
              在 Playground 里:① 用 interface 写一个 <code>Shop</code>
              (name: string),隔几行<b>再写一个同名的</b> interface Shop
              (city: string),然后造一个 Shop 对象 —— 看它需要几个字段;
              ② 把两个都改成 type,读一读报错;
              ③ 用 type 写一个 interface 写不出来的东西:
              <code>
                type Size = &quot;small&quot; | &quot;large&quot;
              </code>
              。
            </p>
          </>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            The point of step 1 is that nothing is reported. The two interfaces
            are combined into one. Leave out either field when creating the
            object and the compiler will say so.
          </>
        }
        zh={
          <>
            第 ① 步的重点是「什么都不报」:两个同名 interface 会被合并成一个。
            造对象时少写任何一个字段,编译器都会告诉你。
          </>
        }
      />
    ),
    solution: (
      <T
        en={
          <>
            <CodeBlock
              lang="ts"
              title="playground"
              code={`interface Shop { name: string }
interface Shop { city: string }
// No error. The two declarations merge into { name: string; city: string }.

const s: Shop = { name: "TSer Tea", city: "Hangzhou" }; // both fields required
const t: Shop = { name: "TSer Tea" };
// Property 'city' is missing in type '{ name: string; }' but
// required in type 'Shop'.

// Step 2, with type aliases:
type Shop2 = { name: string };
type Shop2 = { city: string }; // Duplicate identifier 'Shop2'.

// Step 3, only type can do this:
type Size = "small" | "large";`}
            />
            <p>
              Merging looks like a bug and is a feature: it is the door left
              open for adding to a type you do not own, such as putting a
              custom field on window or patching the types of a third-party
              package (chapter 09). Because it is easy to miss when reading
              code, teams usually agree on one style. That is what &quot;pick
              either one, but be consistent&quot; is really about.
            </p>
          </>
        }
        zh={
          <>
            <CodeBlock
              lang="ts"
              title="playground"
              code={`interface Shop { name: string }
interface Shop { city: string }
// 不报错。两个声明合并成 { name: string; city: string }。

const s: Shop = { name: "TSer Tea", city: "Hangzhou" }; // 两个字段都必须有
const t: Shop = { name: "TSer Tea" };
// Property 'city' is missing in type '{ name: string; }' but
// required in type 'Shop'.

// ② 换成 type 别名:
type Shop2 = { name: string };
type Shop2 = { city: string }; // Duplicate identifier 'Shop2'.

// ③ 只有 type 写得出来:
type Size = "small" | "large";`}
            />
            <p>
              合并看着像 bug,其实是一道特意留的门:
              用来给不属于你的类型做补充,比如给 window 加自定义字段,
              或者给第三方包的类型打补丁(09 章细讲)。
              也正因为它在读代码时容易被忽略,团队通常会约定统一用法 ——
              「随便选一个,但要一致」说的就是这件事。
            </p>
          </>
        }
      />
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: (
        <>
          <code>{"function brew(topping?: string, base: string) {}"}</code>{" "}
          does not compile. Why?
        </>
      ),
      zh: (
        <>
          <code>{"function brew(topping?: string, base: string) {}"}</code>{" "}
          一保存就报错,为什么?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            topping has the wrong type. <code>?</code> and string cannot be
            combined.
          </>
        ),
        zh: (
          <>
            topping 的类型写错了,<code>?</code> 和 string 不能连用。
          </>
        ),
      },
      {
        en: (
          <>
            A required parameter cannot follow an optional one, because
            arguments are matched by position.
          </>
        ),
        zh: <>可选参数后面不能跟必选参数 —— 实参按位置对号入座,会对不上。</>,
      },
      {
        en: <>Too many parameters. A TypeScript function takes at most one.</>,
        zh: <>参数太多,TS 的函数最多只能有一个参数。</>,
      },
      {
        en: <>base has no default value, and every parameter needs one.</>,
        zh: <>base 没有默认值,而所有参数都必须有默认值。</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            <code>topping?: string</code> is a perfectly normal optional
            parameter. The problem is not this parameter, it is where it sits.
          </>
        ),
        zh: (
          <>
            <code>topping?: string</code> 本身是完全合法的可选参数写法。
            问题不在这个参数身上,在它站的位置。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            There is no limit on parameter count, and a rest parameter accepts
            any number of arguments. The error is about order, not count.
          </>
        ),
        zh: (
          <>
            参数个数没有上限,rest 参数甚至能收任意多个。
            报错说的是顺序,不是数量。
          </>
        ),
      },
      {
        en: (
          <>
            A required parameter needs no default. The actual rule is that
            optional and defaulted parameters come after the required ones.
          </>
        ),
        zh: (
          <>
            必选参数本来就不需要默认值。
            真正的规矩是:可选的、带默认值的,都排在必选参数后面。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Arguments are matched by position. In the call{" "}
          <code>brew(&quot;Oolong&quot;)</code> there is no way to tell whether
          &quot;Oolong&quot; is topping or base, so TypeScript forbids the
          declaration. The message is: A required parameter cannot follow an
          optional parameter.
        </>
      ),
      zh: (
        <>
          实参按位置对号入座。调用 <code>brew(&quot;Oolong&quot;)</code> 时,
          没法说清 &quot;Oolong&quot; 算 topping 还是 base,
          所以 TypeScript 直接禁止这样声明。报错原文:A required parameter
          cannot follow an optional parameter.
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          <code>type Cb = () =&gt; void;</code> and then{" "}
          <code>const f: Cb = () =&gt; 123;</code> — what happens?
        </>
      ),
      zh: (
        <>
          <code>type Cb = () =&gt; void;</code> 然后{" "}
          <code>const f: Cb = () =&gt; 123;</code> —— 会发生什么?
        </>
      ),
    },
    opts: [
      {
        en: <>An error: void means no value may be returned.</>,
        zh: <>报错:声明了 void 就不许返回任何值。</>,
      },
      {
        en: (
          <>
            It compiles. void in a function type means the caller ignores the
            return value.
          </>
        ),
        zh: <>编译通过:函数类型里的 void 意思是「调用方不看返回值」。</>,
      },
      {
        en: <>An error: 123 is not a function.</>,
        zh: <>报错:123 不是函数。</>,
      },
      {
        en: <>It compiles, but throws at runtime.</>,
        zh: <>编译通过,但运行时会抛异常。</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            That rule applies when the <b>function declares</b>{" "}
            <code>: void</code> itself —{" "}
            <code>{"function f(): void { return 123 }"}</code> is an error.{" "}
            <b>void in a type</b> is a statement to the caller: I will not use
            what you return.
          </>
        ),
        zh: (
          <>
            那是「<b>函数自己声明</b> <code>: void</code>」的规矩 ——
            <code>{"function f(): void { return 123 }"}</code> 才报错。
            <b>类型里的 void</b> 是对调用方说的:你返回什么我都不用。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            <code>() =&gt; 123</code> is an arrow function that returns 123.
            The question is about the type check, not about what the value is.
          </>
        ),
        zh: (
          <>
            <code>() =&gt; 123</code> 是一个返回 123 的箭头函数。
            这道题问的是类型检查,不是这个值本身。
          </>
        ),
      },
      {
        en: (
          <>
            Nothing happens at runtime. Types are erased, the function returns
            123 as written, and nobody reads it.
          </>
        ),
        zh: (
          <>
            运行时什么事都没有。类型全部被擦除,
            这个函数老老实实返回 123,只是没人去读它。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          The tolerance of <code>() =&gt; void</code> is deliberate. Without
          it, <code>forEach((n) =&gt; arr.push(n))</code> would not type-check,
          because push returns a number. Remember the split: void{" "}
          <b>in a type</b> means the caller ignores the result; void{" "}
          <b>on a declaration</b> means the function returns nothing.
        </>
      ),
      zh: (
        <>
          <code>() =&gt; void</code> 的宽容是有意设计的。
          否则 <code>forEach((n) =&gt; arr.push(n))</code> 就通不过检查,
          因为 push 返回一个 number。记住这个分工:
          <b>类型里的</b> void 表示调用方不看结果,
          <b>声明上的</b> void 表示函数不返回值。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          <code>
            {"function load(json: string) { return JSON.parse(json); }"}
          </code>{" "}
          — what is the risk here?
        </>
      ),
      zh: (
        <>
          <code>
            {"function load(json: string) { return JSON.parse(json); }"}
          </code>{" "}
          —— 这个函数最大的隐患是?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>JSON.parse can throw, and without try/catch it does not compile.</>
        ),
        zh: <>JSON.parse 可能抛异常,没有 try/catch 就编译不过。</>,
      },
      {
        en: (
          <>
            The return type is inferred as any, and that any spreads to every
            caller.
          </>
        ),
        zh: <>返回值被推断成 any,并且悄悄传染给每一个调用方。</>,
      },
      {
        en: <>The json parameter should be typed object, not string.</>,
        zh: <>json 参数应该声明成 object 而不是 string。</>,
      },
      {
        en: <>There is no risk. Inference produces the correct type.</>,
        zh: <>没有隐患,推断会得出正确的类型。</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            It can throw, but TypeScript does not require try/catch. This code
            compiles. The compiler checks types, not runtime risk.
          </>
        ),
        zh: (
          <>
            确实可能抛,但 TypeScript 不强制 try/catch,这段代码编译毫无问题。
            编译器检查的是类型,不是运行时风险。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            JSON.parse takes a string, so <code>json: string</code> is exactly
            right. The problem is on the way out, not on the way in.
          </>
        ),
        zh: (
          <>
            JSON.parse 吃的就是字符串,<code>json: string</code> 写得完全正确。
            问题出在「出去」那一头,不在「进来」这一头。
          </>
        ),
      },
      {
        en: (
          <>
            Inference does work, but what it reads is the return type of
            JSON.parse, and that type is any in the standard library.
          </>
        ),
        zh: (
          <>
            推断确实在工作,但它读的是 JSON.parse 的返回值类型,
            而那个类型在标准库里就是 any。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>JSON.parse</code> returns any, inference passes it straight
          through, so load returns any as well. Callers can misspell fields and
          call methods that do not exist without a single error. The fix is to
          write the return type, which keeps the any inside the function.
        </>
      ),
      zh: (
        <>
          <code>JSON.parse</code> 返回 any,推断原样放行,
          于是 load 的返回值也是 any。
          调用方拼错字段、乱调方法,编译器全程沉默。
          修法是写出返回值类型,把 any 关在函数内部。
        </>
      ),
    },
  },
  {
    type: "multi",
    q: {
      en: (
        <>
          Which of these can <b>only</b> be written with type, not with
          interface? (choose all that apply)
        </>
      ),
      zh: (
        <>
          下面哪些能力是 <b>type 独有</b>、interface 写不出来的?(多选)
        </>
      ),
    },
    opts: [
      { en: <>Describing the shape of an object</>, zh: <>描述一个对象的形状</> },
      {
        en: (
          <>
            A union, such as{" "}
            <code>&quot;s&quot; | &quot;m&quot; | &quot;l&quot;</code>
          </>
        ),
        zh: (
          <>
            联合类型,例如{" "}
            <code>&quot;s&quot; | &quot;m&quot; | &quot;l&quot;</code>
          </>
        ),
      },
      {
        en: <>Merging two declarations with the same name</>,
        zh: <>同名声明自动合并(declaration merging)</>,
      },
      {
        en: (
          <>
            A mapped type, such as <code>{"{ [K in Size]: boolean }"}</code>
          </>
        ),
        zh: (
          <>
            映射类型,例如 <code>{"{ [K in Size]: boolean }"}</code>
          </>
        ),
      },
    ],
    correct: [1, 3],
    missHint: {
      en: (
        <>
          One is still missing. Think about the type-level programming syntax
          that chapter 07 previews. All of it lives on the right-hand side of a
          type alias.
        </>
      ),
      zh: (
        <>
          还漏了一个。想想 07 章预告过的类型编程语法 ——
          那一整套只能写在 type 等号的右边。
        </>
      ),
    },
    extraHint: {
      en: (
        <>
          Too many. One of your picks is basic and both can do it, and another
          is the one ability that only interface has: two type aliases with the
          same name are a Duplicate identifier error.
        </>
      ),
      zh: (
        <>
          勾多了。其中一项是两边都会的基本功,
          还有一项恰恰是 interface 独有的能力 —— 两个同名 type 只会报
          Duplicate identifier。
        </>
      ),
    },
    why: {
      en: (
        <>
          Both can describe an object shape. Merging belongs to interface
          alone. Unions and mapped types belong to type alone, which is why the
          type-level programming in chapters 06 and 07 is written entirely with
          type.
        </>
      ),
      zh: (
        <>
          描述对象形状两边都行;合并是 interface 独有;
          联合类型和映射类型是 type 独有 ——
          这也是 06、07 两章的类型编程全部写在 type 一侧的原因。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          What happens to a <code>readonly id: number</code> property after
          compilation to JavaScript?
        </>
      ),
      zh: (
        <>
          <code>readonly id: number</code> 这个属性,编译成 JavaScript 之后?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            It becomes a property frozen with <code>Object.freeze</code>.
          </>
        ),
        zh: (
          <>
            自动变成被 <code>Object.freeze</code> 冻结的属性。
          </>
        ),
      },
      { en: <>It becomes a getter, readable but not writable.</>, zh: <>变成 getter,只能读不能写。</> },
      {
        en: (
          <>
            Nothing is left. readonly is a compile-time check only, and the
            property can still be written at runtime.
          </>
        ),
        zh: <>什么都不剩 —— readonly 只是编译期检查,运行时照样能写。</>,
      },
      {
        en: <>It is kept as a comment for runtime frameworks to read.</>,
        zh: <>保留为注释,供运行时框架读取。</>,
      },
    ],
    correct: 2,
    wrong: [
      {
        en: (
          <>
            <code>Object.freeze</code> is a runtime function you call yourself.
            TypeScript never adds behaviour to the output. Type erasure is
            absolute.
          </>
        ),
        zh: (
          <>
            <code>Object.freeze</code> 是要你自己调用的运行时函数。
            TypeScript 从不往产物里添加行为,类型擦除是铁律。
          </>
        ),
      },
      {
        en: (
          <>
            A getter is real JavaScript syntax that you have to write yourself.
            readonly emits nothing at all.
          </>
        ),
        zh: (
          <>
            getter 是真实的 JavaScript 语法,得你自己写。
            readonly 一个字节的代码都不产生。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Not even a comment survives. Type information is invisible at
            runtime, which is exactly what type erasure means.
          </>
        ),
        zh: (
          <>
            连注释都不会留下。类型信息对运行时完全不可见,
            这正是「类型擦除」的含义。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>readonly</code> is a <b>compile-time</b> check. The compiler
          stops you while you edit, and there is no protection at runtime. For
          a real freeze use <code>Object.freeze</code>. The compile-time check
          is still what catches almost every accidental write in a team.
        </>
      ),
      zh: (
        <>
          <code>readonly</code> 是<b>编译期</b>的检查:
          你写代码时编译器拦你,运行时没有任何防护。
          想要真冻结就用 <code>Object.freeze</code>。
          不过在团队协作里,编译期这一拦已经挡掉了绝大多数误改。
        </>
      ),
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          In the function type <code>(msg: string) =&gt; ____</code>, the blank
          means &quot;whatever this callback returns is ignored&quot;. Which
          type goes there?
        </>
      ),
      zh: (
        <>
          函数类型 <code>(msg: string) =&gt; ____</code>{" "}
          表示「这个回调返回什么都不会被使用」—— 空格里填哪个类型?
        </>
      ),
    },
    placeholder: { en: "one type keyword", zh: "一个类型关键字" },
    answers: ["void"],
    hint: {
      en: (
        <>
          Not any and not undefined. It is the keyword that means the return
          value is not used, and it is the return type of the forEach callback.
        </>
      ),
      zh: (
        <>
          不是 any,也不是 undefined ——
          是那个专门表示「返回值不被使用」的关键字,forEach 回调的返回值就是它。
        </>
      ),
    },
    why: {
      en: (
        <>
          <code>void</code>. In a type position it says the caller will not
          read the result, so a function returning any value is accepted. That
          is why <code>forEach</code> accepts a callback like{" "}
          <code>push</code> that does return something.
        </>
      ),
      zh: (
        <>
          <code>void</code>。写在类型位置上,它表示调用方不会读结果,
          所以返回任何值的函数都能匹配。这就是 <code>forEach</code> 能接收{" "}
          <code>push</code> 这种有返回值的回调的原因。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          What is the real difference between <code>f(t?: string)</code> and{" "}
          <code>g(t: string | undefined)</code>?
        </>
      ),
      zh: (
        <>
          <code>f(t?: string)</code> 和 <code>g(t: string | undefined)</code>{" "}
          的真实区别是?
        </>
      ),
    },
    opts: [
      { en: <>They are identical. Either one works.</>, zh: <>完全等价,写哪个都一样。</> },
      {
        en: (
          <>
            f can be called with no argument. g requires one, even if that
            argument is undefined.
          </>
        ),
        zh: <>f 可以不传参数调用;g 必须传 —— 哪怕传的是 undefined。</>,
      },
      { en: <>g can be called with no argument. f requires one.</>, zh: <>g 可以不传参数调用;f 必须传。</> },
      {
        en: <>In f, t is not allowed to be undefined. In g it is.</>,
        zh: <>f 的 t 不允许是 undefined,g 允许。</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            Try it: <code>g()</code> reports Expected 1 arguments, but got 0.
            The two differ exactly on whether the call may be empty.
          </>
        ),
        zh: (
          <>
            试试就知道:<code>g()</code> 会报 Expected 1 arguments, but got 0。
            两者的区别正是「能不能空手调用」。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            The other way around. <code>?</code> is what makes the argument
            skippable. <code>| undefined</code> only widens which values are
            allowed.
          </>
        ),
        zh: (
          <>
            方向反了。<code>?</code> 才是让实参可以跳过的那个;
            <code>| undefined</code> 只是拓宽了能放进去的值。
          </>
        ),
      },
      {
        en: (
          <>
            The opposite is true. Inside f, t has type{" "}
            <code>string | undefined</code>, because it is undefined when the
            argument is left out.
          </>
        ),
        zh: (
          <>
            恰恰相反。f 的 t 在函数体里就是{" "}
            <code>string | undefined</code>,因为不传时它就是 undefined。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>?</code> controls whether the argument may be left out.{" "}
          <code>| undefined</code> controls which values it may hold.{" "}
          <code>f()</code> compiles. <code>g()</code> does not, and you have to
          write <code>g(undefined)</code>.
        </>
      ),
      zh: (
        <>
          <code>?</code> 管的是这个实参能不能整个不写;
          <code>| undefined</code> 管的是它能放什么值。
          <code>f()</code> 合法,<code>g()</code> 报错,必须写成{" "}
          <code>g(undefined)</code>。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          <code>[1, 2, 3].map((n) =&gt; n * 2)</code> compiles, even though map
          calls the callback with three arguments. Why?
        </>
      ),
      zh: (
        <>
          <code>[1, 2, 3].map((n) =&gt; n * 2)</code> 能编译通过,
          可是 map 调用回调时会传三个实参。为什么?
        </>
      ),
    },
    opts: [
      {
        en: <>map has an overload that takes a one-parameter callback.</>,
        zh: <>map 有一条专门接收单参数回调的重载。</>,
      },
      {
        en: (
          <>
            A function with fewer parameters is assignable where one with more
            is expected, because extra arguments are ignored.
          </>
        ),
        zh: (
          <>
            参数更少的函数可以赋给「参数更多」的位置,因为多余的实参会被忽略。
          </>
        ),
      },
      {
        en: <>TypeScript fills the missing parameters in with undefined.</>,
        zh: <>TypeScript 会用 undefined 把缺的参数补上。</>,
      },
      {
        en: (
          <>
            The parameter count is not checked for callbacks, only for normal
            calls.
          </>
        ),
        zh: <>回调不检查参数个数,只有普通调用才检查。</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            <code>map</code> has one signature. The rule is general and applies
            to every function type, not to <code>map</code> in particular.
          </>
        ),
        zh: (
          <>
            <code>map</code> 只有一条签名。这条规则是通用的,
            对所有函数类型都成立,不是 <code>map</code> 的特例。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Nothing is filled in. <code>map</code> still passes all three
            arguments at runtime. The callback simply does not name the last
            two.
          </>
        ),
        zh: (
          <>
            没有任何补齐。运行时 <code>map</code> 照样传三个实参,
            只是这个回调没有给后两个起名字。
          </>
        ),
      },
      {
        en: (
          <>
            It is checked, in one direction. Declaring{" "}
            <i>more</i> parameters than the target provides is an error:
            Target signature provides too few arguments.
          </>
        ),
        zh: (
          <>
            检查的,只是单方向。声明的参数比目标提供的<i>还多</i>会报错:
            Target signature provides too few arguments.
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          In JavaScript, calling a function with more arguments than it
          declares is normal and harmless. TypeScript allows exactly that, so a
          one-parameter callback fits a three-parameter callback type. The
          reverse is rejected, because a fourth parameter would read an
          argument nobody passes.
        </>
      ),
      zh: (
        <>
          在 JavaScript 里,传的实参比声明的参数多是正常且无害的。
          TypeScript 允许的正是这一点,
          所以单参数的回调放得进三参数的回调类型里。
          反过来会被拒绝:第四个参数会去读一个根本没人传的实参。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          <code>interface Feeder &#123; feed(a: Animal): void &#125;</code>{" "}
          accepts an object whose <code>feed</code> takes a <code>Dog</code>,
          even with <code>strict</code> on. What does that tell you?
        </>
      ),
      zh: (
        <>
          即使开着 <code>strict</code>,
          <code>interface Feeder &#123; feed(a: Animal): void &#125;</code>{" "}
          也接受一个 <code>feed</code> 只收 <code>Dog</code> 的对象。
          这说明什么?
        </>
      ),
    },
    opts: [
      {
        en: <>Dog and Animal are the same type as far as parameters go.</>,
        zh: <>在参数这件事上,Dog 和 Animal 是同一个类型。</>,
      },
      {
        en: (
          <>
            Method syntax is still checked bivariantly. It is a deliberate
            unsoundness kept for compatibility.
          </>
        ),
        zh: (
          <>
            方法语法仍然是双变检查的 —— 这是为兼容性刻意保留的不健全之处。
          </>
        ),
      },
      {
        en: (
          <>
            <code>strictFunctionTypes</code> is off unless you enable it
            separately from <code>strict</code>.
          </>
        ),
        zh: (
          <>
            <code>strictFunctionTypes</code> 默认关着,
            必须在 <code>strict</code> 之外单独打开。
          </>
        ),
      },
      {
        en: <>Parameters are always checked covariantly, like return types.</>,
        zh: <>参数和返回值一样,永远按协变检查。</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            They are different types. Write the same member as a property —{" "}
            <code>feed: (a: Animal) =&gt; void</code> — and the assignment is
            rejected.
          </>
        ),
        zh: (
          <>
            它们是不同的类型。把同一个成员改写成属性 ——
            <code>feed: (a: Animal) =&gt; void</code> —— 这个赋值就被拒绝了。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            <code>strict</code> does turn <code>strictFunctionTypes</code> on.
            The flag simply does not apply to members declared with method
            syntax.
          </>
        ),
        zh: (
          <>
            <code>strict</code> 确实会打开 <code>strictFunctionTypes</code>。
            只是这个开关对用方法语法声明的成员不生效。
          </>
        ),
      },
      {
        en: (
          <>
            In a function <i>type</i>, parameters are checked contravariantly:
            a function taking Dog cannot be assigned where one taking Animal is
            expected. Method syntax is the exception.
          </>
        ),
        zh: (
          <>
            在函数<i>类型</i>里,参数按逆变检查:
            一个收 Dog 的函数不能赋给「要求收 Animal」的位置。
            方法语法才是例外。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Under <code>strictFunctionTypes</code>, parameters in function{" "}
          <b>type</b> positions are checked contravariantly. Members declared
          with <b>method syntax</b> keep the older bivariant rule. This is a
          known, intentional hole in the type system: closing it would stop{" "}
          <code>Array&lt;Dog&gt;</code> from being usable as{" "}
          <code>Array&lt;Animal&gt;</code>. Use property syntax when you want
          the strict check.
        </>
      ),
      zh: (
        <>
          在 <code>strictFunctionTypes</code> 下,函数<b>类型</b>位置上的参数
          按逆变检查,而用<b>方法语法</b>声明的成员沿用旧的双变规则。
          这是类型系统里一个已知且刻意保留的漏洞:
          堵上它,<code>Array&lt;Dog&gt;</code> 就不能当作{" "}
          <code>Array&lt;Animal&gt;</code> 用了。
          想要严格检查,就用属性语法写这个成员。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Given{" "}
          <code>function fmt(x: unknown): string;</code> followed by{" "}
          <code>function fmt(x: number): number;</code> (plus an
          implementation), what is the type of <code>fmt(1)</code>?
        </>
      ),
      zh: (
        <>
          先写 <code>function fmt(x: unknown): string;</code>,再写{" "}
          <code>function fmt(x: number): number;</code>
          (加上实现签名)。那么 <code>fmt(1)</code> 的类型是什么?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            <code>number</code>, because the second signature is the better
            match.
          </>
        ),
        zh: (
          <>
            <code>number</code>,因为第二条签名更匹配。
          </>
        ),
      },
      {
        en: (
          <>
            <code>string</code>, because TypeScript takes the first overload
            that matches.
          </>
        ),
        zh: (
          <>
            <code>string</code>,因为 TypeScript 取第一条匹配上的重载。
          </>
        ),
      },
      {
        en: (
          <>
            <code>string | number</code>, the union of both return types.
          </>
        ),
        zh: (
          <>
            <code>string | number</code>,两条返回值类型的联合。
          </>
        ),
      },
      {
        en: <>An error: two overloads match the same call.</>,
        zh: <>报错:两条重载同时匹配了这次调用。</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            Overload resolution does not look for the best match. It stops at
            the first signature that accepts the arguments, and{" "}
            <code>unknown</code> accepts everything.
          </>
        ),
        zh: (
          <>
            重载解析不会去找「最合适的那条」。
            它在第一条能接受这些实参的签名上就停了,而 <code>unknown</code>{" "}
            什么都接受。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            A call resolves to exactly one overload. The return types are never
            combined into a union.
          </>
        ),
        zh: (
          <>
            一次调用只会解析到一条重载,返回值类型不会被合成联合类型。
          </>
        ),
      },
      {
        en: (
          <>
            Overlapping overloads are allowed. Order decides which one wins, so
            there is nothing to report.
          </>
        ),
        zh: (
          <>
            重载之间允许重叠,由顺序决定谁胜出,所以没有什么可报的。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Overloads are tried in source order and the first match wins. Swap
          the two signatures and <code>fmt(1)</code> becomes{" "}
          <code>number</code>. Order is part of your API: write the more
          specific signatures first. Note also that the implementation
          signature is not callable from outside.
        </>
      ),
      zh: (
        <>
          重载按书写顺序尝试,第一条匹配的胜出。
          把两条签名调换,<code>fmt(1)</code> 就变成 <code>number</code> 了。
          顺序是 API 的一部分:越具体的签名越要写在前面。
          另外别忘了,实现签名不能从外部调用。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: <>Your team is arguing about interface vs type. Which claim holds?</>,
      zh: <>团队里为 interface vs type 吵起来了,下面哪个说法站得住脚?</>,
    },
    opts: [
      {
        en: (
          <>interface always compiles faster, so type should be banned.</>
        ),
        zh: <>interface 编译性能一定更好,应该全面禁用 type。</>,
      },
      {
        en: <>type is more modern. interface has been deprecated.</>,
        zh: <>type 更现代,interface 已被官方废弃。</>,
      },
      {
        en: (
          <>
            Pick either and stay consistent. Use type when you need a union or
            a mapped type, and interface when you want declaration merging.
          </>
        ),
        zh: (
          <>
            随便选一个并保持一致;需要 union 或映射类型时用 type,
            需要 merging 时用 interface。
          </>
        ),
      },
      {
        en: (
          <>
            There is an official rule: interface for objects, type for
            everything else.
          </>
        ),
        zh: <>官方强制规定:对象一律 interface,其余一律 type。</>,
      },
    ],
    correct: 2,
    wrong: [
      {
        en: (
          <>
            &quot;Always faster&quot; is a widely repeated claim with no such
            absolute result behind it, and the handbook never suggests banning
            type for performance.
          </>
        ),
        zh: (
          <>
            「一定更快」是流传很广的说法,并没有这样的绝对结论,
            官方也从没建议以性能为由禁用 type。
          </>
        ),
      },
      {
        en: (
          <>
            interface is not deprecated. Declaration merging is still something
            only interface can do.
          </>
        ),
        zh: (
          <>
            interface 没有被废弃。declaration merging
            这个能力至今仍然只有它有。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            The handbook deliberately does <b>not</b> impose a rule. Its
            current wording is to choose by preference and stay consistent.
          </>
        ),
        zh: (
          <>
            handbook 恰恰<b>没有</b>强制规定,
            现行说法是按个人与团队偏好选,保持一致即可。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          The disagreement is smaller than it sounds. In most code the two are
          interchangeable, and there are only two real criteria: the{" "}
          <b>ability</b> you need (union or mapped type means type, merging
          means interface) and <b>consistency</b> within the codebase.
        </>
      ),
      zh: (
        <>
          这场争论被夸大了。大部分代码里两者可以互换,
          真正的选型标准只有两条:你需要的<b>能力</b>
          (union 或映射类型 → type;merging → interface),
          以及代码库内部的<b>一致性</b>。
        </>
      ),
    },
  },
];
