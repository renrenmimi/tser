"use client";

// 第 06 章 · 内置工具类型 —— 动手任务 LABS + 通关测验 QUIZ 数据(双语)。
// 参考答案里的代码:可执行行在两种语言里逐字节相同,只有注释分 en / zh,
// 因此 hl 行号在两种语言下一致。编译器报错原文一律不翻译。
// 所有报错文案、报错码与推断结果均在 TypeScript 5.9 + strict 下实测过。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";
import { T, type Loc } from "@/lib/i18n";

/* ---------- LAB 代码 ---------- */

const L1_SOL: Loc<string> = {
  en: `type Size = "small" | "medium" | "large";
type Sugar = 0 | 30 | 50 | 70 | 100;

interface Order {
  id: string;
  drink: string;
  size: Size;
  sugar: Sugar;
  toppings: string[];
  internalNote: string;
}

type DraftOrder = Partial<Order>;
type PublicOrder = Readonly<Omit<Order, "internalNote">>;
type CheckoutPatch = Partial<Pick<Order, "size" | "toppings">>;

const patch: CheckoutPatch = { size: "large" }; // toppings may be left out

const pub: PublicOrder = {
  id: "A-1", drink: "Jasmine Milk Green", size: "small",
  sugar: 50, toppings: [],
  internalNote: "less ice",
  // Object literal may only specify known properties, and 'internalNote'
  // does not exist in type 'Readonly<Omit<Order, "internalNote">>'.
};

// pub.size = "large";
// Cannot assign to 'size' because it is a read-only property.`,
  zh: `type Size = "small" | "medium" | "large";
type Sugar = 0 | 30 | 50 | 70 | 100;

interface Order {
  id: string;
  drink: string;
  size: Size;
  sugar: Sugar;
  toppings: string[];
  internalNote: string;
}

type DraftOrder = Partial<Order>;
type PublicOrder = Readonly<Omit<Order, "internalNote">>;
type CheckoutPatch = Partial<Pick<Order, "size" | "toppings">>;

const patch: CheckoutPatch = { size: "large" }; // toppings 不填也合法

const pub: PublicOrder = {
  id: "A-1", drink: "Jasmine Milk Green", size: "small",
  sugar: 50, toppings: [],
  internalNote: "less ice",
  // Object literal may only specify known properties, and 'internalNote'
  // does not exist in type 'Readonly<Omit<Order, "internalNote">>'.
};

// pub.size = "large";
// Cannot assign to 'size' because it is a read-only property.`,
};

const L2_SOL: Loc<string> = {
  en: `type Oops = Omit<Order, "internalNotes">;
// No error. Hover Oops: all six properties are still there,
// including internalNote. A misspelled key removes nothing.

type Safe = Pick<Order, "internalNotes">;
// Type '"internalNotes"' does not satisfy the constraint 'keyof Order'.
// Pick constrains its keys to keyof Order, so the typo is caught here.`,
  zh: `type Oops = Omit<Order, "internalNotes">;
// 不报错。悬停 Oops:六个属性一个不少,internalNote 还在。
// 键名拼错,等于什么都没删。

type Safe = Pick<Order, "internalNotes">;
// Type '"internalNotes"' does not satisfy the constraint 'keyof Order'.
// Pick 把键约束在 keyof Order 上,拼错当场被抓。`,
};

const L3_SOL: Loc<string> = {
  en: `type Size = "small" | "medium" | "large";
type CupStock = Record<Size, number>;

const stock: CupStock = { small: 40, medium: 25 };
// Property 'large' is missing in type '{ small: number; medium: number; }'
// but required in type 'CupStock'.

const loose: { [k: string]: number } = { small: 40 };
// No error. A string key is an unlimited set, so there is no
// list of required keys to check against.

stock.large;   // number
loose.large;   // number, even though the property is missing at run time`,
  zh: `type Size = "small" | "medium" | "large";
type CupStock = Record<Size, number>;

const stock: CupStock = { small: 40, medium: 25 };
// Property 'large' is missing in type '{ small: number; medium: number; }'
// but required in type 'CupStock'.

const loose: { [k: string]: number } = { small: 40 };
// 不报错。string 键是无限集合,
// 所以没有一份「必须齐全」的键名单可以核对。

stock.large;   // number
loose.large;   // number —— 尽管运行时这个属性根本不存在`,
};

const L4_SOL: Loc<string> = {
  en: `type Onion = Promise<Promise<Promise<string>>>;
type Core = Awaited<Onion>;
// string. Awaited unwraps every layer, like a chain of awaits.

declare function fetchOrder(id: string): Promise<Order>;

type Fetched = Awaited<ReturnType<typeof fetchOrder>>;
// Order. Read it inside out: typeof takes the type of the value,
// ReturnType takes its return type, Awaited removes the Promise.`,
  zh: `type Onion = Promise<Promise<Promise<string>>>;
type Core = Awaited<Onion>;
// string。Awaited 会一层层拆到底,和连续 await 的结果一致。

declare function fetchOrder(id: string): Promise<Order>;

type Fetched = Awaited<ReturnType<typeof fetchOrder>>;
// Order。从里往外读:typeof 取到值的类型,
// ReturnType 取返回值类型,Awaited 再拆掉 Promise。`,
};

export const LABS: Lab[] = [
  {
    id: "checkout-dto",
    title: {
      en: "Build three Order variants by composing utility types",
      zh: "用工具类型组合出「结账页 DTO」",
    },
    d: "medium",
    tags: {
      en: ["Playground", "composition", "Pick", "Omit"],
      zh: ["Playground", "组合", "Pick", "Omit"],
    },
    task: (
      <T
        en={
          <p>
            Open the TypeScript Playground (typescriptlang.org/play) and paste
            in the <code>Order</code> definition from the start of this chapter.
            Now build three variants using <b>only built-in utility types</b>:{" "}
            <code>DraftOrder</code> (every property optional),{" "}
            <code>PublicOrder</code> (no <code>internalNote</code>, and every
            remaining property read-only), and <code>CheckoutPatch</code> (only{" "}
            <code>size</code> and <code>toppings</code>, both optional).
            Then declare one variable of each type. Writing an{" "}
            <code>internalNote</code> property on the <code>PublicOrder</code>{" "}
            variable must be an error.
          </p>
        }
        zh={
          <p>
            打开 TypeScript Playground(typescriptlang.org/play),把本章开头的{" "}
            <code>Order</code> 定义贴进去,然后<b>只用内置工具类型</b>
            造出三个变体:<code>DraftOrder</code>(全部属性可选)、
            <code>PublicOrder</code>(没有 <code>internalNote</code>
            ,其余属性全部只读)、<code>CheckoutPatch</code>(只有{" "}
            <code>size</code> 和 <code>toppings</code>,且都可选)。
            再给每个类型各声明一个变量。给 <code>PublicOrder</code> 的变量写{" "}
            <code>internalNote</code> 属性,必须报错。
          </p>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            The second and third variants need two utility types each. Decide
            from the inside out: first choose which properties exist (
            <code>Pick</code> or <code>Omit</code>), then choose how those
            properties behave (<code>Partial</code> or <code>Readonly</code>).
          </>
        }
        zh={
          <>
            第二、第三个变体各要套两层。从里往外想:先决定「有哪些属性」(
            <code>Pick</code> 或 <code>Omit</code>),
            再决定「这些属性怎么用」(<code>Partial</code> 或{" "}
            <code>Readonly</code>)。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title={{ en: "checkout.ts", zh: "checkout.ts" }}
          code={L1_SOL}
          hl={[13, 14, 15]}
        />
        <T
          en={
            <p>
              The three highlighted lines are the whole answer. None of the six
              properties is written out again. When <code>Order</code> gains a
              property later, all three variants follow automatically. That is
              the cost utility types remove: not typing, but keeping copies in
              sync.
            </p>
          }
          zh={
            <p>
              高亮的三行就是全部答案,六个属性一个都没重抄。
              以后 <code>Order</code> 增加属性,三个变体自动跟着变。
              工具类型省下的不是打字,而是「维护多份副本」的成本。
            </p>
          }
        />
      </>
    ),
  },
  {
    id: "omit-typo",
    title: {
      en: "See for yourself: Omit accepts a misspelled key",
      zh: "亲手试一次:Omit 接受拼错的键",
    },
    d: "easy",
    tags: {
      en: ["Omit", "Pick", "debugging"],
      zh: ["Omit", "Pick", "排错"],
    },
    task: (
      <T
        en={
          <p>
            Keep the same <code>Order</code> in the Playground. Misspell the key
            on purpose. First write{" "}
            <code>Omit&lt;Order, &quot;internalNotes&quot;&gt;</code> (with an
            extra <code>s</code>), then write{" "}
            <code>Pick&lt;Order, &quot;internalNotes&quot;&gt;</code>. Notice
            which one reports an error and which one stays silent. Then hover
            the <code>Omit</code> alias and count the properties it produced.
          </p>
        }
        zh={
          <p>
            还是 Playground 里那个 <code>Order</code>。故意把键名拼错:先写{" "}
            <code>Omit&lt;Order, &quot;internalNotes&quot;&gt;</code>(多一个{" "}
            <code>s</code>),再写{" "}
            <code>Pick&lt;Order, &quot;internalNotes&quot;&gt;</code>。
            看哪一个报错、哪一个一声不吭。然后悬停在 <code>Omit</code>{" "}
            那个类型别名上,数一数它到底产出了几个属性。
          </p>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            Hovering is the useful part. The alias expands into a full property
            list, so you can see exactly which properties were removed and
            which were not.
          </>
        }
        zh={
          <>
            重点在悬停:类型别名会展开成完整的属性列表,
            删掉了谁、没删掉谁,一眼就能看清。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title={{ en: "typo.ts", zh: "typo.ts" }}
          code={L2_SOL}
          hl={[1, 5]}
        />
        <T
          en={
            <p>
              The rule to remember: <b>Pick checks its keys, Omit does not</b>.
              When you remove a property because it must not leak, a silent
              typo means the property is still there. Use a <code>Pick</code>{" "}
              allow-list instead, or write a strict version of{" "}
              <code>Omit</code> yourself after Chapter 07.
            </p>
          }
          zh={
            <p>
              记住这条规则:<b>Pick 会检查键,Omit 不检查</b>。
              当你删掉一个属性是因为它绝对不能外泄时,一个不报错的拼写错误
              就意味着这个属性还在。这种场合改用 <code>Pick</code> 白名单,
              或者学完第 07 章,自己写一个严格版的 <code>Omit</code>。
            </p>
          }
        />
      </>
    ),
  },
  {
    id: "record-stock",
    title: {
      en: "Track stock for each cup size",
      zh: "给每个杯型记库存",
    },
    d: "easy",
    tags: {
      en: ["Record", "index signature"],
      zh: ["Record", "索引签名"],
    },
    task: (
      <T
        en={
          <p>
            Build a stock table for the three cup sizes with{" "}
            <code>Record&lt;Size, number&gt;</code>. Now remove the{" "}
            <code>large</code> entry and read the error. Then declare a second
            version typed <code>{"{ [k: string]: number }"}</code> with the same
            two entries, and work out why that one compiles.
          </p>
        }
        zh={
          <p>
            用 <code>Record&lt;Size, number&gt;</code> 给三个杯型建一张库存表。
            然后删掉 <code>large</code> 这一项,读一下报错。再声明一个类型为{" "}
            <code>{"{ [k: string]: number }"}</code> 的版本,同样只写两项,
            想清楚它为什么能编译过。
          </p>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            The difference is whether the key type is a finite list of names.{" "}
            <code>Size</code> is a union of three string literals, so{" "}
            <code>Record</code> knows exactly which properties must exist.{" "}
            <code>string</code> is an unlimited set, so there is nothing to
            check.
          </>
        }
        zh={
          <>
            差别在于「键类型是不是一份有限的名单」。<code>Size</code>{" "}
            是三个字符串字面量的联合,所以 <code>Record</code>{" "}
            清楚知道必须有哪几个属性;<code>string</code>{" "}
            是无限集合,没有名单可以核对。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title={{ en: "stock.ts", zh: "stock.ts" }}
          code={L3_SOL}
          hl={[4, 8]}
        />
        <T
          en={
            <p>
              A useful rule: when the keys are a known, finite set of names, use{" "}
              <code>Record</code> with a literal union and the compiler will
              check that none is missing. When the keys really are open-ended,
              fall back to an index signature or{" "}
              <code>Record&lt;string, V&gt;</code>. Note the last two lines:
              neither form adds <code>| undefined</code> when you read a
              property. That check is a separate compiler option,{" "}
              <code>noUncheckedIndexedAccess</code>, covered in Chapter 10.
            </p>
          }
          zh={
            <p>
              一条实用规则:键是一份已知的、有限的名单时,用{" "}
              <code>Record</code> 配字面量联合,编译器会帮你查有没有漏;
              键真的开放(用户输入、动态字典),再退回索引签名或{" "}
              <code>Record&lt;string, V&gt;</code>。注意最后两行:
              两种写法在读取属性时都不会加上 <code>| undefined</code>。
              那是另一个编译选项 <code>noUncheckedIndexedAccess</code>{" "}
              的事,第 10 章再讲。
            </p>
          }
        />
      </>
    ),
  },
  {
    id: "awaited-peel",
    title: {
      en: "Unwrap nested promises with Awaited",
      zh: "用 Awaited 拆开嵌套的 Promise",
    },
    d: "medium",
    tags: {
      en: ["Awaited", "ReturnType", "Promise"],
      zh: ["Awaited", "ReturnType", "Promise"],
    },
    task: (
      <T
        en={
          <p>
            In the Playground: (1) build a three-layer type{" "}
            <code>Promise&lt;Promise&lt;Promise&lt;string&gt;&gt;&gt;</code>,
            pass it to <code>Awaited</code>, and hover the result. (2) Use{" "}
            <code>declare</code> to state that <code>fetchOrder</code> returns{" "}
            <code>Promise&lt;Order&gt;</code>, then combine{" "}
            <code>Awaited</code> and <code>ReturnType</code> to get back to{" "}
            <code>Order</code>.
          </p>
        }
        zh={
          <p>
            在 Playground 里:① 造一个三层的{" "}
            <code>Promise&lt;Promise&lt;Promise&lt;string&gt;&gt;&gt;</code>
            ,交给 <code>Awaited</code>,悬停看结果;② 用 <code>declare</code>{" "}
            声明一个返回 <code>Promise&lt;Order&gt;</code> 的{" "}
            <code>fetchOrder</code>,再组合 <code>Awaited</code> 和{" "}
            <code>ReturnType</code>,拿回 <code>Order</code>。
          </p>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            Step 2 nests three things. Innermost, <code>typeof</code> turns the
            function value into a type. Then <code>ReturnType</code> takes its
            return type. Outermost, <code>Awaited</code> removes the{" "}
            <code>Promise</code>.
          </>
        }
        zh={
          <>
            第 ② 步要套三层:最里面 <code>typeof</code>{" "}
            把函数这个值变成类型,中间 <code>ReturnType</code>{" "}
            取它的返回值类型,最外面 <code>Awaited</code> 拆掉{" "}
            <code>Promise</code>。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title={{ en: "awaited.ts", zh: "awaited.ts" }}
          code={L4_SOL}
          hl={[2, 7]}
        />
        <T
          en={
            <p>
              Line 7 appears often in real projects. Many libraries export
              functions but not the types of their results, and this one line is
              the standard way to recover the type you need. It also stays
              correct when the library changes the return type.
            </p>
          }
          zh={
            <p>
              第 7 行在真实项目里出现得很频繁。很多库只导出函数,
              不导出返回结果的类型,这一行就是取回你需要的类型的标准写法。
              库以后改了返回类型,这一行也依然是对的。
            </p>
          }
        />
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
          What exactly does{" "}
          <code>type DraftOrder = Partial&lt;Order&gt;</code> do?
        </>
      ),
      zh: (
        <>
          <code>type DraftOrder = Partial&lt;Order&gt;</code>{" "}
          这一行到底做了什么?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            It creates a new type in which every property of <code>Order</code>{" "}
            has a <code>?</code>. <code>Order</code> itself is unchanged.
          </>
        ),
        zh: (
          <>
            造出一个新类型,里面 <code>Order</code> 的每个属性都带上{" "}
            <code>?</code>;<code>Order</code> 本身不变。
          </>
        ),
      },
      {
        en: (
          <>
            It makes <code>Order</code> optional, so every place that uses{" "}
            <code>Order</code> changes too.
          </>
        ),
        zh: (
          <>
            把 <code>Order</code> 改成可选,所以之后用到{" "}
            <code>Order</code> 的地方都跟着变。
          </>
        ),
      },
      {
        en: (
          <>
            It deletes the required properties of <code>Order</code> and keeps
            only the optional ones.
          </>
        ),
        zh: (
          <>
            删掉 <code>Order</code> 里的必填属性,只留下可选的。
          </>
        ),
      },
      {
        en: (
          <>
            It generates runtime code that fills in default values for missing
            properties.
          </>
        ),
        zh: <>生成运行时代码,属性没填时自动补上默认值。</>,
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: (
          <>
            A utility type never modifies its input. It produces a new type and
            leaves the old one exactly as it was. <code>Order</code> still has
            six required properties; only <code>DraftOrder</code> is new.
          </>
        ),
        zh: (
          <>
            工具类型从不修改输入:它产出一个新类型,旧类型原样不动。
            <code>Order</code> 仍然是六个必填属性,新出现的只有{" "}
            <code>DraftOrder</code>。
          </>
        ),
      },
      {
        en: (
          <>
            <code>Partial</code> deletes nothing. All six properties are still
            there; each one just gained a <code>?</code>. Removing properties by
            name is what <code>Pick</code> and <code>Omit</code> do.
          </>
        ),
        zh: (
          <>
            <code>Partial</code> 不删任何属性:六个属性全在,只是各自多了个{" "}
            <code>?</code>。按名字增删属性是 <code>Pick</code> 和{" "}
            <code>Omit</code> 的工作。
          </>
        ),
      },
      {
        en: (
          <>
            Types are erased when the code compiles, as Chapter 01 showed, so a
            type cannot produce any runtime behaviour. You still write the
            default values yourself.
          </>
        ),
        zh: (
          <>
            类型在编译后会被擦除(第 01 章讲过),所以类型不可能产生任何运行时行为。
            默认值还是得你自己写。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>Partial&lt;T&gt;</code> adds <code>?</code> to every property of{" "}
          <code>T</code>. It takes a type and returns a type, and the input type
          is untouched.
        </>
      ),
      zh: (
        <>
          <code>Partial&lt;T&gt;</code> 给 <code>T</code> 的每个属性加上{" "}
          <code>?</code>。进去是类型,出来也是类型,输入的类型不受影响。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          What happens with{" "}
          <code>Omit&lt;Order, &quot;internalNotes&quot;&gt;</code>? Note the
          misspelled key: there is an extra <code>s</code>.
        </>
      ),
      zh: (
        <>
          <code>Omit&lt;Order, &quot;internalNotes&quot;&gt;</code>{" "}
          会发生什么?注意键名拼错了,多了一个 <code>s</code>。
        </>
      ),
    },
    opts: [
      {
        en: <>A compile error saying that key does not exist on Order.</>,
        zh: <>编译报错,提示 Order 上没有这个键。</>,
      },
      {
        en: (
          <>
            No error. The new type has all six properties of{" "}
            <code>Order</code>, so the typo removed nothing.
          </>
        ),
        zh: (
          <>
            不报错。新类型有 <code>Order</code> 的全部六个属性,
            拼错等于什么都没删。
          </>
        ),
      },
      {
        en: (
          <>
            No error, but the new type is <code>never</code>.
          </>
        ),
        zh: (
          <>
            不报错,但新类型是 <code>never</code>。
          </>
        ),
      },
      {
        en: <>A warning, but compilation still succeeds.</>,
        zh: <>报一条警告,但编译能通过。</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            That is what <code>Pick</code> does. Its key parameter is
            constrained by <code>K extends keyof T</code>. The key parameter of{" "}
            <code>Omit</code> is constrained only by <code>keyof any</code>, so
            any string, number, or symbol is accepted.
          </>
        ),
        zh: (
          <>
            那是 <code>Pick</code> 的行为:它的键参数受{" "}
            <code>K extends keyof T</code> 约束。<code>Omit</code>{" "}
            的键参数只受 <code>keyof any</code> 约束,
            任何 string、number、symbol 都收。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            <code>Omit</code> returns an object type, not <code>never</code>. It
            removes the listed keys; when none of them matches, it removes
            nothing.
          </>
        ),
        zh: (
          <>
            <code>Omit</code> 返回的是对象类型,不是 <code>never</code>。
            它删掉名单上的键,名单上一个都对不上,就一个都不删。
          </>
        ),
      },
      {
        en: (
          <>
            TypeScript has no warning level between an error and success. Here
            it simply succeeds, and that is exactly what makes the typo
            dangerous.
          </>
        ),
        zh: (
          <>
            TypeScript 没有介于报错和通过之间的「警告」这一档。
            这里就是干干净净地通过 —— 危险正在这里。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          The key parameter of <code>Omit</code> only has to be a valid property
          key. It does not have to exist on <code>T</code>. A misspelling
          compiles and the property stays. When you remove a property so it
          cannot leak, prefer a <code>Pick</code> allow-list.
        </>
      ),
      zh: (
        <>
          <code>Omit</code> 的键参数只要求是一个合法的属性键,
          不要求真的存在于 <code>T</code> 上。拼错照样编译通过,属性照样留着。
          删属性是为了防外泄时,优先用 <code>Pick</code> 白名单。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Given <code>const o: Readonly&lt;Order&gt; = …</code>, which line does
          the compiler reject?
        </>
      ),
      zh: (
        <>
          已有 <code>const o: Readonly&lt;Order&gt; = …</code>,
          下面哪一行会被编译器拒绝?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            <code>o.toppings.push(&quot;boba&quot;)</code>
          </>
        ),
        zh: (
          <>
            <code>o.toppings.push(&quot;boba&quot;)</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>o.size = &quot;large&quot;</code>
          </>
        ),
        zh: (
          <>
            <code>o.size = &quot;large&quot;</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>console.log(o.size)</code>
          </>
        ),
        zh: (
          <>
            <code>console.log(o.size)</code>
          </>
        ),
      },
      { en: <>All three of them.</>, zh: <>以上三行全都会被拒绝。</> },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            This is allowed. <code>Readonly</code> is shallow. It stops you from
            assigning to <code>o.toppings</code>, but not from changing the
            array that <code>o.toppings</code> points at. To stop{" "}
            <code>push</code> as well, the property type has to be{" "}
            <code>readonly string[]</code>.
          </>
        ),
        zh: (
          <>
            这一行合法。<code>Readonly</code> 是浅的:它拦住「给{" "}
            <code>o.toppings</code> 赋值」,但拦不住修改{" "}
            <code>o.toppings</code> 指向的那个数组。
            想连 <code>push</code> 一起拦,属性类型得写成{" "}
            <code>readonly string[]</code>。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Reading is always allowed. <code>readonly</code> only restricts
            assignment.
          </>
        ),
        zh: (
          <>
            读取永远合法。<code>readonly</code> 只限制赋值。
          </>
        ),
      },
      {
        en: (
          <>
            Only the assignment is rejected. Reading is unrestricted, and so are
            methods that change the contents of the array, because{" "}
            <code>Readonly</code> is shallow.
          </>
        ),
        zh: (
          <>
            只有赋值那一行被拒绝。读取不受限制,改动数组内容的方法也不受限制,
            因为 <code>Readonly</code> 是浅的。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>readonly</code> rejects assignment to the property.{" "}
          <code>o.size = …</code> is exactly that. <code>push</code> does not
          assign to <code>o.toppings</code>; it changes the array the property
          already points at.
        </>
      ),
      zh: (
        <>
          <code>readonly</code> 拒绝的是「给属性赋值」,<code>o.size = …</code>{" "}
          正是这种。<code>push</code> 没有给 <code>o.toppings</code> 赋值,
          它改的是这个属性已经指向的那个数组。
        </>
      ),
    },
  },
  {
    type: "multi",
    q: {
      en: (
        <>
          Which of these take a union type and return a union with some members
          removed or kept? (Select all that apply.)
        </>
      ),
      zh: (
        <>
          下面哪些工具类型接受一个联合类型,
          并返回一个「留下或去掉部分成员」的联合类型?(多选)
        </>
      ),
    },
    opts: [
      { en: <>Partial</>, zh: <>Partial</> },
      { en: <>Exclude</>, zh: <>Exclude</> },
      { en: <>Pick</>, zh: <>Pick</> },
      { en: <>Extract</>, zh: <>Extract</> },
      { en: <>NonNullable</>, zh: <>NonNullable</> },
      { en: <>Readonly</>, zh: <>Readonly</> },
    ],
    correct: [1, 3, 4],
    missHint: {
      en: (
        <>
          One is still missing. <code>null</code> and <code>undefined</code> are
          also members of a union, and the type that removes them counts too.
        </>
      ),
      zh: (
        <>
          还漏了一个。<code>null</code> 和 <code>undefined</code>{" "}
          也是联合的成员,清掉它们的那一个也算。
        </>
      ),
    },
    extraHint: {
      en: (
        <>
          One of your answers works on object properties instead.{" "}
          <code>Partial</code>, <code>Pick</code> and <code>Readonly</code>{" "}
          change the <b>properties</b> of an object type. Ask yourself: is this
          type a record of properties, or a list of alternatives?
        </>
      ),
      zh: (
        <>
          你选中的有一个是作用在对象属性上的。<code>Partial</code>、
          <code>Pick</code>、<code>Readonly</code> 改的是对象类型的<b>属性</b>。
          问自己一句:我手上这个类型,是一组属性,还是一份候选名单?
        </>
      ),
    },
    why: {
      en: (
        <>
          Three of them work on union members: <code>Exclude</code> removes the
          matching members, <code>Extract</code> keeps only the matching
          members, and <code>NonNullable</code> removes <code>null</code> and{" "}
          <code>undefined</code>. All three are conditional types that are
          applied to each member separately. Chapter 07 shows how that works.
        </>
      ),
      zh: (
        <>
          三个作用在联合成员上:<code>Exclude</code> 去掉匹配的成员,
          <code>Extract</code> 只留下匹配的成员,<code>NonNullable</code>{" "}
          清掉 <code>null</code> 和 <code>undefined</code>。
          三者都是条件类型,会对每个成员分别求值。第 07 章会讲这是怎么做到的。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          What is the main difference between{" "}
          <code>Record&lt;Size, number&gt;</code> and{" "}
          <code>{"{ [k: string]: number }"}</code>?
        </>
      ),
      zh: (
        <>
          <code>Record&lt;Size, number&gt;</code> 和{" "}
          <code>{"{ [k: string]: number }"}</code> 最主要的区别是什么?
        </>
      ),
    },
    opts: [
      {
        en: <>There is no real difference; they are two ways to write the same thing.</>,
        zh: <>没有实质区别,只是两种写法。</>,
      },
      {
        en: (
          <>
            <code>Record&lt;Size, number&gt;</code> requires all three keys, so
            a missing one is an error. The index signature has no list of
            required keys.
          </>
        ),
        zh: (
          <>
            <code>Record&lt;Size, number&gt;</code> 要求三个键都在,少一个就报错;
            索引签名没有「必须齐全」的键名单。
          </>
        ),
      },
      {
        en: (
          <>
            <code>Record</code> allows any value type; an index signature allows
            only primitive value types.
          </>
        ),
        zh: (
          <>
            <code>Record</code> 的值可以是任意类型,索引签名的值只能是原始类型。
          </>
        ),
      },
      {
        en: (
          <>
            <code>Record</code> is a runtime data structure; an index signature
            is a compile-time type.
          </>
        ),
        zh: (
          <>
            <code>Record</code> 是运行时的数据结构,索引签名是编译期的类型。
          </>
        ),
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            The difference is large. Leave out one cup size and the{" "}
            <code>Record</code> version reports an error, while the index
            signature version compiles.
          </>
        ),
        zh: (
          <>
            区别很大:少写一个杯型,<code>Record</code>{" "}
            版当场报错,索引签名版照样编译通过。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Both accept any value type, including objects, arrays and
            functions. The difference is in the <b>keys</b>: a finite list of
            names on one side, an unlimited set on the other.
          </>
        ),
        zh: (
          <>
            两者的值类型都可以任意写,对象、数组、函数都行。区别在<b>键</b>:
            一边是有限的名单,一边是无限的集合。
          </>
        ),
      },
      {
        en: (
          <>
            Both are types and both are erased at compile time. The runtime data
            structure is the object literal itself, whichever type you annotate
            it with.
          </>
        ),
        zh: (
          <>
            两者都是类型,编译时都会被擦除。运行时的数据结构就是那个对象字面量本身,
            跟你用哪种类型标注无关。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          When the key type is a finite union of literals,{" "}
          <code>Record</code> checks that every key is present. That is what
          makes it stricter than an index signature. Neither one adds{" "}
          <code>| undefined</code> when you read a property, unless{" "}
          <code>noUncheckedIndexedAccess</code> is enabled.
        </>
      ),
      zh: (
        <>
          键类型是有限的字面量联合时,<code>Record</code>{" "}
          会检查每个键都在,这就是它比索引签名严格的地方。
          两者在读取属性时都不会加上 <code>| undefined</code>,除非开启{" "}
          <code>noUncheckedIndexedAccess</code>。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          In <code>ReturnType&lt;typeof makeOrder&gt;</code>, what is{" "}
          <code>typeof</code> doing?
        </>
      ),
      zh: (
        <>
          <code>ReturnType&lt;typeof makeOrder&gt;</code> 里的{" "}
          <code>typeof</code> 在做什么?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            The same thing as the JavaScript <code>typeof</code> operator: it
            returns the string <code>&quot;function&quot;</code>.
          </>
        ),
        zh: (
          <>
            和 JavaScript 运行时的 <code>typeof</code> 一样,返回字符串{" "}
            <code>&quot;function&quot;</code>。
          </>
        ),
      },
      {
        en: (
          <>
            It takes the type of the value <code>makeOrder</code>, because{" "}
            <code>ReturnType</code> accepts a type and not a value.
          </>
        ),
        zh: (
          <>
            取出值 <code>makeOrder</code> 的类型,因为 <code>ReturnType</code>{" "}
            接受的是类型,不是值。
          </>
        ),
      },
      {
        en: (
          <>
            It checks that <code>makeOrder</code> is a function and reports an
            error if it is not.
          </>
        ),
        zh: (
          <>
            检查 <code>makeOrder</code> 是不是函数,不是就报错。
          </>
        ),
      },
      {
        en: <>It calls makeOrder once to see what it actually returned.</>,
        zh: <>偷偷调用一次 makeOrder,看它实际返回了什么。</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            Same name, different operator. That <code>typeof</code> is a runtime
            expression. This one appears in a type position and is erased when
            the code compiles.
          </>
        ),
        zh: (
          <>
            同名,但不是同一个运算符。那个 <code>typeof</code>{" "}
            是运行时表达式;这里的 <code>typeof</code>{" "}
            出现在类型位置,编译后就消失了。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            It performs no check. It only takes the type. Whether that type fits
            is decided by the constraint on <code>ReturnType</code> around it.
          </>
        ),
        zh: (
          <>
            它不做任何检查,只负责取类型。取到的类型合不合适,
            由外面 <code>ReturnType</code> 的约束来判断。
          </>
        ),
      },
      {
        en: (
          <>
            Types cannot reach the running program. No line of code is
            executed. A type is computed by the compiler, not observed at run
            time.
          </>
        ),
        zh: (
          <>
            类型碰不到正在运行的程序,这里一行代码都不会执行。
            类型是编译器算出来的,不是跑出来看到的。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>makeOrder</code> is a value, and <code>ReturnType</code> needs a
          type. <code>typeof</code> in a type position is the bridge from a
          value to its type. It shares a name with the runtime operator but does
          something different. Chapter 07 goes through it in detail.
        </>
      ),
      zh: (
        <>
          <code>makeOrder</code> 是值,而 <code>ReturnType</code> 需要类型。
          类型位置上的 <code>typeof</code> 就是「从值取到它的类型」的桥。
          它和运行时的同名运算符做的不是一件事,第 07 章会详细讲。
        </>
      ),
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          <code>Awaited&lt;Promise&lt;Promise&lt;number&gt;&gt;&gt;</code>{" "}
          resolves to the type ____.
        </>
      ),
      zh: (
        <>
          <code>Awaited&lt;Promise&lt;Promise&lt;number&gt;&gt;&gt;</code>{" "}
          的结果类型是____。
        </>
      ),
    },
    placeholder: { en: "Type a type name…", zh: "输入一个类型名…" },
    answers: ["number"],
    hint: {
      en: (
        <>
          <code>Awaited</code> keeps unwrapping: if one layer is not enough it
          removes another, until no <code>Promise</code> is left. This matches
          what <code>await</code> does at run time.
        </>
      ),
      zh: (
        <>
          <code>Awaited</code> 会一直拆:一层不够就再拆一层,
          直到没有 <code>Promise</code> 为止。这和运行时 <code>await</code>{" "}
          的行为一致。
        </>
      ),
    },
    why: {
      en: (
        <>
          <code>Awaited</code> unwraps recursively. Both layers of{" "}
          <code>Promise</code> are removed, leaving <code>number</code>. How a
          type can be recursive is covered in Chapter 07.
        </>
      ),
      zh: (
        <>
          <code>Awaited</code> 会递归地拆壳,两层 <code>Promise</code>{" "}
          都被拆掉,剩下 <code>number</code>。
          类型为什么可以递归,第 07 章会讲。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          After{" "}
          <code>type T = Partial&lt;{"{ meta: { note: string } }"}&gt;</code>,
          which statement is true?
        </>
      ),
      zh: (
        <>
          写下{" "}
          <code>type T = Partial&lt;{"{ meta: { note: string } }"}&gt;</code>{" "}
          之后,哪个说法是对的?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            Both <code>meta</code> and <code>meta.note</code> became optional.
          </>
        ),
        zh: (
          <>
            <code>meta</code> 和 <code>meta.note</code> 都变成了可选。
          </>
        ),
      },
      {
        en: (
          <>
            Only the outer <code>meta</code> became optional.{" "}
            <code>note</code> is still required.
          </>
        ),
        zh: (
          <>
            只有外层的 <code>meta</code> 变可选,里面的 <code>note</code>{" "}
            仍然必填。
          </>
        ),
      },
      {
        en: (
          <>
            Only <code>note</code> became optional. <code>meta</code> is
            unchanged.
          </>
        ),
        zh: (
          <>
            只有 <code>note</code> 变可选,<code>meta</code> 不变。
          </>
        ),
      },
      {
        en: (
          <>
            An error: <code>Partial</code> cannot be used on a nested object
            type.
          </>
        ),
        zh: (
          <>
            报错:<code>Partial</code> 不能用在嵌套的对象类型上。
          </>
        ),
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            That would be a deep <code>Partial</code>. The built-in one is
            shallow: it only adds <code>?</code> to the properties of the
            top-level object, and never looks inside a property type.
          </>
        ),
        zh: (
          <>
            那是「深 Partial」的行为。内置的这个是浅的:
            它只给最外层对象的属性加 <code>?</code>,不会进到属性类型内部。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            The other way round. <code>Partial</code> works on the keys of the
            outer object, which here is only <code>meta</code>.
          </>
        ),
        zh: (
          <>
            方向反了。<code>Partial</code> 处理的是外层对象的键,
            这里只有 <code>meta</code> 一个。
          </>
        ),
      },
      {
        en: (
          <>
            No error. A nested object type is fine; the change simply applies
            to the top level only.
          </>
        ),
        zh: <>不报错。嵌套的对象类型完全合法,只是改动只发生在最外层。</>,
      },
    ],
    why: {
      en: (
        <>
          <code>Partial</code> is shallow. It adds <code>?</code> to the
          top-level properties and does nothing to the types of those
          properties. A deep version has to be written by hand, using the mapped
          and conditional types from Chapter 07.
        </>
      ),
      zh: (
        <>
          <code>Partial</code> 是浅的:它给最外层属性加 <code>?</code>,
          对这些属性的类型不做任何处理。深版本得自己写,
          用到第 07 章的映射类型和条件类型。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Given <code>type A = {"{ note?: string }"}</code>, what is the type of{" "}
          <code>note</code> in <code>Required&lt;A&gt;</code>?
        </>
      ),
      zh: (
        <>
          已有 <code>type A = {"{ note?: string }"}</code>,那么{" "}
          <code>Required&lt;A&gt;</code> 里 <code>note</code> 的类型是什么?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            <code>string</code> — the <code>?</code> is removed and{" "}
            <code>undefined</code> is removed with it
          </>
        ),
        zh: (
          <>
            <code>string</code> —— <code>?</code> 去掉了,
            <code>undefined</code> 也跟着去掉了
          </>
        ),
      },
      {
        en: (
          <>
            <code>string | undefined</code> — only the <code>?</code> is
            removed
          </>
        ),
        zh: (
          <>
            <code>string | undefined</code> —— 只去掉了 <code>?</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>unknown</code>, because the original type is lost
          </>
        ),
        zh: (
          <>
            <code>unknown</code>,因为原来的类型丢了
          </>
        ),
      },
      {
        en: (
          <>
            <code>never</code>, because an optional property cannot be made
            required
          </>
        ),
        zh: (
          <>
            <code>never</code>,因为可选属性无法变成必填
          </>
        ),
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: (
          <>
            This is the common guess, but <code>Required</code> is defined with{" "}
            <code>-?</code>, and removing <code>?</code> also removes{" "}
            <code>undefined</code> from the property type. The result is{" "}
            <code>string</code>. Note that a property declared{" "}
            <code>note: string | undefined</code>, with no <code>?</code>, keeps
            its <code>undefined</code>.
          </>
        ),
        zh: (
          <>
            这是常见的猜法,但 <code>Required</code> 是用 <code>-?</code>{" "}
            定义的,去掉 <code>?</code> 的同时也从属性类型里去掉了{" "}
            <code>undefined</code>,结果是 <code>string</code>。注意:
            如果属性本来写成 <code>note: string | undefined</code>(没有{" "}
            <code>?</code>),那个 <code>undefined</code> 会保留。
          </>
        ),
      },
      {
        en: (
          <>
            Nothing is lost. <code>Required</code> only changes the optional
            marker; the property type stays <code>string</code>.
          </>
        ),
        zh: (
          <>
            什么都没丢。<code>Required</code> 只改可选标记,
            属性类型仍然是 <code>string</code>。
          </>
        ),
      },
      {
        en: (
          <>
            Making an optional property required is exactly what{" "}
            <code>Required</code> is for. Nothing becomes <code>never</code>.
          </>
        ),
        zh: (
          <>
            把可选属性变成必填正是 <code>Required</code> 的用途,
            不会有任何东西变成 <code>never</code>。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>Required&lt;A&gt;</code> gives <code>note: string</code>.
          Removing the <code>?</code> also removes <code>undefined</code> from
          the property type. This only applies to properties that were written
          with <code>?</code>; an explicit <code>| undefined</code> on a
          required property is left alone.
        </>
      ),
      zh: (
        <>
          <code>Required&lt;A&gt;</code> 得到 <code>note: string</code>:去掉{" "}
          <code>?</code> 的同时,属性类型里的 <code>undefined</code>{" "}
          也被去掉。这只适用于本来写了 <code>?</code> 的属性;
          必填属性上显式写的 <code>| undefined</code> 不受影响。
        </>
      ),
    },
  },
];
