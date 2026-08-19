"use client";

// 第 05 章 · 泛型 —— 动手任务 LABS + 通关测验 QUIZ 数据(双语)。
// 参考做法里的代码:可执行行在两种语言里逐字节相同,只有注释分 en / zh。
// 编译器报错原文一律不翻译;所有报错与推断结果在 TypeScript 5.9 + strict 下实测过。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";
import { T, type Loc } from "@/lib/i18n";

/* ---------- LAB 代码 ---------- */

const L1_SOL: Loc<string> = {
  en: `function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const a = first(["boba", "coconut jelly"]); // string | undefined
const b = first([9.9, 19.9]);               // number | undefined
const c = first([true, false]);             // boolean | undefined

// Hover a, b and c one by one. Three copies became one type parameter.`,
  zh: `function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const a = first(["boba", "coconut jelly"]); // string | undefined
const b = first([9.9, 19.9]);               // number | undefined
const c = first([true, false]);             // boolean | undefined

// 逐个悬停 a、b、c。三份重复代码,变成了一个类型参数。`,
};

const L2_SOL: Loc<string> = {
  en: `type Order = { id: number; item: string };
type MenuItem = { name: string; price: number };

type Paginated<T> = { list: T[]; page: number; total: number };

function paginate<T>(all: T[], page: number, size: number): Paginated<T> {
  return {
    list: all.slice((page - 1) * size, page * size),
    page,
    total: all.length,
  };
}

const orders: Order[] = [{ id: 1, item: "Boba milk tea" }];
const menu: MenuItem[] = [{ name: "Four Seasons tea", price: 12 }];

const p1 = paginate(orders, 1, 10); // Paginated<Order>
const p2 = paginate(menu, 1, 10);   // Paginated<MenuItem>

p1.list[0].item;
p1.list[0].price;
// Property 'price' does not exist on type 'Order'.`,
  zh: `type Order = { id: number; item: string };
type MenuItem = { name: string; price: number };

type Paginated<T> = { list: T[]; page: number; total: number };

function paginate<T>(all: T[], page: number, size: number): Paginated<T> {
  return {
    list: all.slice((page - 1) * size, page * size),
    page,
    total: all.length,
  };
}

const orders: Order[] = [{ id: 1, item: "Boba milk tea" }];
const menu: MenuItem[] = [{ name: "Four Seasons tea", price: 12 }];

const p1 = paginate(orders, 1, 10); // Paginated<Order>
const p2 = paginate(menu, 1, 10);   // Paginated<MenuItem>

p1.list[0].item;
p1.list[0].price;
// Property 'price' does not exist on type 'Order'.`,
};

const L3_SOL: Loc<string> = {
  en: `function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

longest("Boba milk tea", "Four Seasons tea"); // T = string
longest([1, 2, 3], [4, 5]);                   // T = number[]
longest({ length: 3 }, { length: 7 });        // T = { length: number }
longest(10, 100);
// Argument of type 'number' is not assignable
// to parameter of type '{ length: number; }'.

// Now delete "extends { length: number }" from the signature.
// The body stops compiling, on both a.length and b.length:
// Property 'length' does not exist on type 'T'.`,
  zh: `function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

longest("Boba milk tea", "Four Seasons tea"); // T = string
longest([1, 2, 3], [4, 5]);                   // T = number[]
longest({ length: 3 }, { length: 7 });        // T = { length: number }
longest(10, 100);
// Argument of type 'number' is not assignable
// to parameter of type '{ length: number; }'.

// 现在把签名里的 "extends { length: number }" 删掉。
// 函数体立刻编译不过,a.length 和 b.length 各报一次:
// Property 'length' does not exist on type 'T'.`,
};

const L4_SOL: Loc<string> = {
  en: `function swap<A, B>(pair: [A, B]): [B, A] {
  return [pair[1], pair[0]];
}

function zip<A, B>(as: A[], bs: B[]): [A, B][] {
  const out: [A, B][] = [];
  const n = Math.min(as.length, bs.length);
  for (let i = 0; i < n; i++) {
    out.push([as[i], bs[i]]);
  }
  return out;
}

const s = swap(["Boba milk tea", 18]); // [number, string]

const pairs = zip(["small", "large"], [12, 18]);
// [string, number][]
pairs[0][0].toUpperCase(); // position 0 is a string
pairs[0][1].toFixed(1);    // position 1 is a number`,
  zh: `function swap<A, B>(pair: [A, B]): [B, A] {
  return [pair[1], pair[0]];
}

function zip<A, B>(as: A[], bs: B[]): [A, B][] {
  const out: [A, B][] = [];
  const n = Math.min(as.length, bs.length);
  for (let i = 0; i < n; i++) {
    out.push([as[i], bs[i]]);
  }
  return out;
}

const s = swap(["Boba milk tea", 18]); // [number, string]

const pairs = zip(["small", "large"], [12, 18]);
// [string, number][]
pairs[0][0].toUpperCase(); // 第 0 位一定是 string
pairs[0][1].toFixed(1);    // 第 1 位一定是 number`,
};

export const LABS: Lab[] = [
  {
    id: "merge-three",
    title: {
      en: "Fold three copies into one generic function",
      zh: "把三份重复的函数,合成一个泛型",
    },
    d: "easy",
    tags: {
      en: ["Playground", "generic function"],
      zh: ["Playground", "泛型函数"],
    },
    task: (
      <T
        en={
          <p>
            Open the TypeScript Playground (typescriptlang.org/play) and write
            three functions: <code>firstString</code>, <code>firstNumber</code>{" "}
            and <code>firstBoolean</code>. Each body is exactly{" "}
            <code>return arr[0]</code>. Now delete all three and replace them
            with one generic <code>first</code>. It is done when hovering the
            result of <code>first([&quot;boba&quot;])</code> shows{" "}
            <code>string | undefined</code> and not <code>any</code>.
          </p>
        }
        zh={
          <p>
            打开 TypeScript Playground(typescriptlang.org/play),写三个函数:
            <code>firstString</code>、<code>firstNumber</code>、
            <code>firstBoolean</code>,函数体都是一句 <code>return arr[0]</code>
            。然后把三个都删掉, 换成一个泛型的 <code>first</code>
            。验收标准:悬停在 <code>first([&quot;boba&quot;])</code>{" "}
            的结果上,类型显示 <code>string | undefined</code>,不是{" "}
            <code>any</code>。
          </p>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            Add <code>&lt;T&gt;</code> after the function name to declare the
            placeholder, then replace every hard-coded <code>string</code> /{" "}
            <code>number</code> / <code>boolean</code> in the signature with{" "}
            <code>T</code>. Keep the <code>| undefined</code> in the return
            type: reading index 0 of an empty array gives <code>undefined</code>
            .
          </>
        }
        zh={
          <>
            在函数名后面加 <code>&lt;T&gt;</code> 声明占位符, 再把签名里写死的{" "}
            <code>string</code> / <code>number</code> / <code>boolean</code>{" "}
            都换成 <code>T</code>。 返回值里的 <code>| undefined</code> 要留着:
            空数组取第 0 个,拿到的是 <code>undefined</code>。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock lang="ts" title="Playground" code={L1_SOL} />
        <T
          en={
            <p>
              Hovering is the point of this exercise. You can see <code>T</code>{" "}
              resolve to a different type on each call, and the result type
              change with it. One definition, and no type is lost.
            </p>
          }
          zh={
            <p>
              这一题的重点就是悬停:你能亲眼看到 <code>T</code>{" "}
              在每次调用被解成不同的类型,返回值类型也跟着变。
              一份定义,一个类型都没丢。
            </p>
          }
        />
      </>
    ),
  },
  {
    id: "paginated-shop",
    title: {
      en: "Write Paginated<T> and a paginate function",
      zh: "写一个 Paginated<T> 和配套的 paginate",
    },
    d: "medium",
    tags: {
      en: ["Playground", "generic type"],
      zh: ["Playground", "泛型类型"],
    },
    task: (
      <T
        en={
          <p>
            A shop backend paginates everything: orders, menu items, members. In
            the Playground: (1) define <code>{"type Paginated<T>"}</code> with
            at least <code>list</code>, <code>page</code> and <code>total</code>
            ; (2) write{" "}
            <code>
              {
                "function paginate<T>(all: T[], page: number, size: number): Paginated<T>"
              }
            </code>{" "}
            that really slices the array; (3) call it once with an{" "}
            <code>Order[]</code> and once with a <code>MenuItem[]</code>, and
            hover each result to confirm that the type of <code>list</code>{" "}
            follows the input.
          </p>
        }
        zh={
          <p>
            店铺后台到处要分页:订单、菜单、会员。请在 Playground 里:① 定义{" "}
            <code>{"type Paginated<T>"}</code>,至少包含 <code>list</code>、
            <code>page</code>、<code>total</code>;② 写{" "}
            <code>
              {
                "function paginate<T>(all: T[], page: number, size: number): Paginated<T>"
              }
            </code>
            ,做真正的切片;③ 分别用 <code>Order[]</code> 和{" "}
            <code>MenuItem[]</code> 各调一次,悬停确认 <code>list</code>{" "}
            的类型跟着输入变。
          </p>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            Slice with <code>all.slice((page - 1) * size, page * size)</code>.
            Write the return type as <code>{"Paginated<T>"}</code>: the
            function&apos;s placeholder and the type&apos;s placeholder are the
            same <code>T</code>.
          </>
        }
        zh={
          <>
            切片用 <code>all.slice((page - 1) * size, page * size)</code>。
            返回值类型写成 <code>{"Paginated<T>"}</code> ——
            函数的占位符和类型的占位符是同一个 <code>T</code>。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock lang="ts" title="Playground" hl={[6, 21]} code={L2_SOL} />
        <T
          en={
            <p>
              Look at the last two lines. The same <code>paginate</code>{" "}
              produced a value whose <code>list</code> only exposes{" "}
              <code>Order</code> members, and another whose list only exposes{" "}
              <code>MenuItem</code> members. The container is reusable and the
              contents stay precisely typed.
            </p>
          }
          zh={
            <p>
              看最后两行:同一个 <code>paginate</code>,一个结果的{" "}
              <code>list</code> 只认 <code>Order</code> 的成员,另一个只认{" "}
              <code>MenuItem</code> 的。容器是通用的,内容的类型一点没糊。
            </p>
          }
        />
      </>
    ),
  },
  {
    id: "constraint-lab",
    title: {
      en: "Constraint experiment: what gets rejected, and why",
      zh: "约束实验:什么会被拒绝,为什么",
    },
    d: "medium",
    tags: { en: ["Playground", "extends"], zh: ["Playground", "extends"] },
    task: (
      <T
        en={
          <p>
            In the Playground write{" "}
            <code>
              {"function longest<T extends { length: number }>(a: T, b: T): T"}
            </code>
            , returning whichever value has the greater <code>length</code>.
            Then call it four times: with two strings, with two arrays, with{" "}
            <code>longest(10, 100)</code>, and with{" "}
            <code>{"longest({ length: 3 }, { length: 7 })"}</code>. Predict each
            result before you look. Finally, delete the constraint and see which
            line inside the body breaks first.
          </p>
        }
        zh={
          <p>
            在 Playground 里写{" "}
            <code>
              {"function longest<T extends { length: number }>(a: T, b: T): T"}
            </code>
            ,返回 <code>length</code> 更大的那个。然后调用四次:
            两个字符串、两个数组、<code>longest(10, 100)</code>、
            <code>{"longest({ length: 3 }, { length: 7 })"}</code>。
            每次先自己预测结果,再看编译器怎么说。最后把约束删掉,
            看函数体里哪一行先坏掉。
          </p>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            To decide whether a type is accepted, ask one question: is this type
            assignable to <code>{"{ length: number }"}</code>? That is the same
            structural check as in the previous chapter. Nothing about classes
            or inheritance is involved.
          </>
        }
        zh={
          <>
            判断一个类型能不能通过,只问一句:它可以赋值给{" "}
            <code>{"{ length: number }"}</code> 吗?这就是上一章那套结构化检查。
            和 class、继承没有任何关系。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock lang="ts" title="Playground" hl={[1, 8]} code={L3_SOL} />
        <T
          en={
            <p>
              The last experiment is the point of the task. A constraint works
              in two directions at once: for the caller it is a condition on the
              argument, and for the body it is a guarantee. Remove it and the
              body loses the guarantee first.
            </p>
          }
          zh={
            <p>
              最后那个实验才是这题的题眼:约束同时朝两个方向起作用 ——
              对调用方它是一个条件,对函数体它是一个保证。
              删掉它,先垮的是函数体。
            </p>
          }
        />
      </>
    ),
  },
  {
    id: "two-holes",
    title: {
      en: "Two placeholders: swap and zip",
      zh: "两个占位符:swap 与 zip",
    },
    d: "hard",
    tags: {
      en: ["Playground", "two type parameters"],
      zh: ["Playground", "多类型参数"],
    },
    task: (
      <T
        en={
          <p>
            One signature can declare more than one placeholder. Implement two
            functions in the Playground: (1){" "}
            <code>{"swap<A, B>(pair: [A, B]): [B, A]"}</code>, which swaps a
            two-element tuple; (2){" "}
            <code>{"zip<A, B>(as: A[], bs: B[]): [A, B][]"}</code>, which pairs
            two arrays by position and stops at the shorter one. It is done when{" "}
            <code>{'swap(["Boba milk tea", 18])'}</code> hovers as{" "}
            <code>[number, string]</code> and both positions of a zipped pair
            keep their own type.
          </p>
        }
        zh={
          <p>
            一个签名可以声明不止一个占位符。请在 Playground 里实现两个函数:①{" "}
            <code>{"swap<A, B>(pair: [A, B]): [B, A]"}</code>, 交换一个二元组;②{" "}
            <code>{"zip<A, B>(as: A[], bs: B[]): [A, B][]"}</code>,
            把两个数组按位配对,以短的那个为准。验收标准:
            <code>{'swap(["Boba milk tea", 18])'}</code> 悬停显示{" "}
            <code>[number, string]</code>,而且配出来的每一对,
            两个位置各自的类型都不糊。
          </p>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            A tuple type <code>[A, B]</code> is position-sensitive, so{" "}
            <code>swap</code> is just <code>{"return [pair[1], pair[0]]"}</code>
            . For <code>zip</code>, loop up to{" "}
            <code>Math.min(as.length, bs.length)</code> and push one{" "}
            <code>[as[i], bs[i]]</code> per step.
          </>
        }
        zh={
          <>
            元组类型 <code>[A, B]</code> 是分位置的,所以 <code>swap</code>{" "}
            就是一句 <code>{"return [pair[1], pair[0]]"}</code>。
            <code>zip</code> 循环到 <code>Math.min(as.length, bs.length)</code>{" "}
            为止, 每一步 push 一个 <code>[as[i], bs[i]]</code>。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock lang="ts" title="Playground" hl={[1, 5]} code={L4_SOL} />
        <T
          en={
            <p>
              <code>A</code> and <code>B</code> are inferred independently, and
              each stays consistent everywhere it appears. <code>swap</code>{" "}
              moves the values but not their types, and every pair{" "}
              <code>zip</code> produces is a real <code>[A, B]</code>. Multiple
              placeholders are what <code>{"Record<K, V>"}</code> and{" "}
              <code>{"Map<K, V>"}</code> are built on, which chapter 06 picks
              up.
            </p>
          }
          zh={
            <p>
              <code>A</code> 和 <code>B</code> 各自独立推断,
              各自在出现的每个位置保持一致。<code>swap</code>{" "}
              换的是值的位置,不是类型;<code>zip</code>{" "}
              配出的每一对都是货真价实的 <code>[A, B]</code>。多个占位符正是{" "}
              <code>{"Record<K, V>"}</code>、<code>{"Map<K, V>"}</code>{" "}
              的地基,第 06 章接着讲。
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
      en: <>Which sentence describes best what generics are for?</>,
      zh: <>泛型解决的核心问题,下面哪句说得最准?</>,
    },
    opts: [
      {
        en: (
          <>
            They let a function accept any type, so it stops reporting type
            errors
          </>
        ),
        zh: <>让函数能接受任何类型的参数,不再报类型错误</>,
      },
      {
        en: (
          <>
            They let one definition work for many types while keeping the output
            type tied to the input type
          </>
        ),
        zh: <>写一份代码通吃多种类型,同时让输入和输出的类型保持联动、不丢失</>,
      },
      {
        en: (
          <>
            They let code take a different branch at runtime depending on the
            type
          </>
        ),
        zh: <>让代码在运行时根据类型执行不同的分支</>,
      },
      {
        en: <>They reduce the number of characters, so files get smaller</>,
        zh: <>减少代码的字符数,让文件更小</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            <code>any</code> already accepts anything and reports nothing, and
            it does so more completely. The value of a generic is the opposite:
            it still reports an error when the types stop lining up.
          </>
        ),
        zh: (
          <>
            「什么都收 + 不报错」<code>any</code> 就做得到,而且做得更彻底。
            泛型的价值恰恰在于还会报错:类型对不上的时候它拦得住。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            A type parameter exists only at compile time. After erasure there is
            no <code>T</code> at runtime. Branching on the shape of a value is
            narrowing, which is chapter 03.
          </>
        ),
        zh: (
          <>
            类型参数只存在于编译期,擦除之后运行时没有 <code>T</code>。
            按值的形状分支那是收窄,第 03 章的内容。
          </>
        ),
      },
      {
        en: (
          <>
            The character count usually goes up, not down. What generics remove
            is duplicated definitions and lost type information, not keystrokes.
          </>
        ),
        zh: (
          <>
            字符数往往还变多了。泛型省掉的是重复的定义和丢失的类型信息,
            不是键盘敲击数。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          A type parameter is a placeholder filled in at the call site, and
          every use of it in one signature refers to the same type. That is what
          keeps the result type tied to the argument type.
        </>
      ),
      zh: (
        <>
          类型参数是一个在调用处才被填上的占位符,
          同一个签名里的每次使用指的都是同一个类型 ——
          返回值的类型就是这样和实参的类型绑在一起的。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Given <code>{"function first<T>(arr: T[]): T | undefined"}</code>, the
          call <code>first([9.9, 19.9])</code> is written without angle
          brackets. What is <code>T</code>?
        </>
      ),
      zh: (
        <>
          <code>{"function first<T>(arr: T[]): T | undefined"}</code>,调用{" "}
          <code>first([9.9, 19.9])</code> 且没写尖括号 —— <code>T</code> 是什么?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            <code>any</code>, because nothing was specified
          </>
        ),
        zh: (
          <>
            <code>any</code> —— 没显式指定,只能按 <code>any</code> 算
          </>
        ),
      },
      {
        en: (
          <>
            <code>unknown</code>, the safe default when nothing is specified
          </>
        ),
        zh: (
          <>
            <code>unknown</code> —— 没指定时的安全默认
          </>
        ),
      },
      {
        en: (
          <>
            <code>number</code>, inferred from the argument, which is{" "}
            <code>number[]</code>
          </>
        ),
        zh: (
          <>
            <code>number</code> —— 编译器从实参 <code>number[]</code> 推断出来
          </>
        ),
      },
      {
        en: <>An error, because a generic call must state its type argument</>,
        zh: <>报错 —— 泛型函数必须显式传类型实参</>,
      },
    ],
    correct: 2,
    wrong: [
      {
        en: (
          <>
            Leaving the brackets out does not mean giving up. The compiler uses
            the argument as its source and infers a real <code>number</code>,
            which you can confirm by hovering.
          </>
        ),
        zh: (
          <>
            不写尖括号不等于放弃。编译器拿实参当原料,推出来的是货真价实的{" "}
            <code>number</code>,悬停就能看到。
          </>
        ),
      },
      {
        en: (
          <>
            <code>unknown</code> is what you get when there is nothing at all to
            infer from, such as a type parameter used only in the return type.
            Here there is plenty: <code>[9.9, 19.9]</code> is{" "}
            <code>number[]</code>.
          </>
        ),
        zh: (
          <>
            <code>unknown</code>{" "}
            是在完全没有推断原料时才会出现的结果,比如类型参数只出现在返回值里。
            这里原料充足:<code>[9.9, 19.9]</code> 就是 <code>number[]</code>。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            The opposite is true. Writing the type argument is the exception;
            almost every generic call relies on inference.
          </>
        ),
        zh: <>恰恰相反。手写类型实参是例外, 绝大多数泛型调用都靠推断。</>,
      },
    ],
    why: {
      en: (
        <>
          Type argument inference: the compiler matches the argument{" "}
          <code>[9.9, 19.9]</code>, of type <code>number[]</code>, against the
          declared parameter <code>arr: T[]</code> and gets{" "}
          <code>T = number</code>. Inference reads the arguments and nothing
          else.
        </>
      ),
      zh: (
        <>
          类型实参推断:编译器拿实参 <code>[9.9, 19.9]</code>(类型是{" "}
          <code>number[]</code>)对上声明的参数 <code>arr: T[]</code>,得出{" "}
          <code>T = number</code>。推断的原料只有实参。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          &quot;A generic is just any with extra steps.&quot; What is the
          strongest reply?
        </>
      ),
      zh: <>「泛型不就是 any 吗?」—— 最有力的反驳是哪句?</>,
    },
    opts: [
      {
        en: <>A generic is longer to write and looks more formal</>,
        zh: (
          <>
            泛型比 <code>any</code> 写起来更长,更正式
          </>
        ),
      },
      {
        en: (
          <>
            <code>any</code> drops the type, while a generic keeps it: once{" "}
            <code>T</code> is resolved, input and output stay linked and stay
            checked
          </>
        ),
        zh: (
          <>
            <code>any</code> 丢类型,泛型保类型:<code>T</code>{" "}
            被解出之后,输入和输出全程联动、全程受检
          </>
        ),
      },
      {
        en: (
          <>
            Generic code runs faster than code that uses <code>any</code>
          </>
        ),
        zh: (
          <>
            泛型在运行时更快,<code>any</code> 在运行时更慢
          </>
        ),
      },
      {
        en: (
          <>
            <code>any</code> is deprecated and generics replace it
          </>
        ),
        zh: (
          <>
            <code>any</code> 已经被官方废弃了,泛型是它的替代品
          </>
        ),
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            Length is not the argument. The difference is in behaviour: one
            drops the type at the door, the other carries it through to the
            result.
          </>
        ),
        zh: (
          <>
            「写得长」不是论点。区别在行为:一个把类型丢在门口,
            一个把类型带到结果。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            At runtime they are identical. After erasure, the generic version
            and the <code>any</code> version compile to the same JavaScript. The
            entire difference is at compile time.
          </>
        ),
        zh: (
          <>
            运行时两者完全一样。擦除之后,泛型版本和 <code>any</code>{" "}
            版本编译出的 JavaScript 一模一样。区别全在编译期。
          </>
        ),
      },
      {
        en: (
          <>
            <code>any</code> is not deprecated and has legitimate uses. It and
            generics are two different tools, not an old and a new version of
            one tool.
          </>
        ),
        zh: (
          <>
            <code>any</code> 没有被废弃,它有合法的用途。
            它和泛型是两个不同的工具,不是新旧版本的关系。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          They point in opposite directions. With <code>first(arr: any[])</code>{" "}
          the result accepts any method call and nothing is reported. With{" "}
          <code>first&lt;T&gt;</code> and <code>T = string</code>, calling{" "}
          <code>toFixed</code> on the result fails at compile time.
        </>
      ),
      zh: (
        <>
          两者方向相反。<code>first(arr: any[])</code>{" "}
          的结果调用任何方法都不会报错;<code>first&lt;T&gt;</code> 在{" "}
          <code>T = string</code> 之后,对结果调用 <code>toFixed</code>{" "}
          在编译期就失败。
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
          <code>
            {"function longest<T extends { length: number }>(a: T, b: T): T"}
          </code>
          , which call is <b>rejected</b>?
        </>
      ),
      zh: (
        <>
          <code>
            {"function longest<T extends { length: number }>(a: T, b: T): T"}
          </code>
          ,下面哪个调用会<b>报错</b>?
        </>
      ),
    },
    opts: [
      <>
        <code>
          longest(&quot;Boba milk tea&quot;, &quot;Four Seasons tea&quot;)
        </code>
      </>,
      <>
        <code>longest([1, 2, 3], [4, 5])</code>
      </>,
      <>
        <code>{"longest({ length: 3 }, { length: 7 })"}</code>
      </>,
      <>
        <code>longest(10, 100)</code>
      </>,
    ],
    correct: 3,
    wrong: [
      {
        en: (
          <>
            <code>string</code> has <code>.length</code>, so it is assignable to{" "}
            <code>{"{ length: number }"}</code> and the call is accepted, with{" "}
            <code>T = string</code>.
          </>
        ),
        zh: (
          <>
            <code>string</code> 有 <code>.length</code>,可以赋值给{" "}
            <code>{"{ length: number }"}</code>,调用通过,
            <code>T = string</code>。
          </>
        ),
      },
      {
        en: (
          <>
            An array has <code>.length</code> too, so it is accepted, with{" "}
            <code>T = number[]</code>. The constraint checks the shape, not
            whether the value is an array.
          </>
        ),
        zh: (
          <>
            数组也有 <code>.length</code>,通过,<code>T = number[]</code>。
            约束检查的是形状,不是「你是不是数组」。
          </>
        ),
      },
      {
        en: (
          <>
            This anonymous object literal has exactly{" "}
            <code>length: number</code>, so it satisfies the constraint. A
            constraint asks about shape, not about where a type came from.
          </>
        ),
        zh: (
          <>
            这个匿名对象字面量正好有 <code>length: number</code>,
            所以满足约束。约束问的是形状,不问这个类型是哪来的。
          </>
        ),
      },
      undefined,
    ],
    why: {
      en: (
        <>
          <code>number</code> has no <code>length</code>, so it is not
          assignable to <code>{"{ length: number }"}</code>. The compiler
          reports: Argument of type &apos;number&apos; is not assignable to
          parameter of type {"'{ length: number; }'"}.
        </>
      ),
      zh: (
        <>
          <code>number</code> 没有 <code>length</code>,不能赋值给{" "}
          <code>{"{ length: number }"}</code>。编译器报的是:Argument of type
          &apos;number&apos; is not assignable to parameter of type{" "}
          {"'{ length: number; }'"}。
        </>
      ),
    },
  },
  {
    type: "multi",
    q: {
      en: <>Which of these statements about generics are true? (choose all)</>,
      zh: <>关于泛型,下面哪些说法是对的?(多选)</>,
    },
    opts: [
      {
        en: (
          <>
            Type parameters are erased, so the compiled JavaScript cannot ask
            what <code>T</code> is
          </>
        ),
        zh: (
          <>
            类型参数会被擦除,编译出的 JavaScript 里问不到 <code>T</code> 是什么
          </>
        ),
      },
      {
        en: <>A type parameter can have a default, as in {"<T = string>"}</>,
        zh: <>类型参数可以有默认值,如 {"<T = string>"}</>,
      },
      {
        en: (
          <>
            Within one call, every use of <code>T</code> in the signature stands
            for the same type
          </>
        ),
        zh: (
          <>
            同一次调用里,签名各处的 <code>T</code> 代表的是同一个类型
          </>
        ),
      },
      {
        en: (
          <>
            <code>extends</code> in <code>{"<T extends Shape>"}</code> means T
            inherits from Shape, so only classes can be used
          </>
        ),
        zh: (
          <>
            <code>{"<T extends Shape>"}</code> 里的 <code>extends</code> 表示 T
            继承自 Shape,所以只能用 class
          </>
        ),
      },
      {
        en: <>Calling a generic function requires writing the angle brackets</>,
        zh: <>调用泛型函数必须显式写出尖括号</>,
      },
    ],
    correct: [0, 1, 2],
    missHint: {
      en: (
        <>
          Some correct answers are still missing. Is there any <code>T</code>{" "}
          left in the compiled JavaScript? Is <code>{"<T = string>"}</code>{" "}
          valid syntax? Does one call ever fill the same placeholder with two
          different types?
        </>
      ),
      zh: (
        <>
          还有对的没选全。编译出的 JavaScript 里还有 <code>T</code> 吗?
          <code>{"<T = string>"}</code> 是合法语法吗?
          同一次调用会把同一个占位符填成两种类型吗?
        </>
      ),
    },
    extraHint: {
      en: (
        <>
          One of your picks is wrong. In a type parameter list{" "}
          <code>extends</code> is a constraint, not inheritance: it means
          &quot;assignable to&quot;, and <code>string</code> or a plain object
          type satisfies it. And most generic calls rely on inference, so the
          angle brackets are the exception.
        </>
      ),
      zh: (
        <>
          选进了错误说法。类型参数列表里的 <code>extends</code> 是约束,不是继承
          —— 它的意思是「可以赋值给」,
          <code>string</code> 或一个普通对象类型都满足它。
          而绝大多数泛型调用靠推断,尖括号是例外。
        </>
      ),
    },
    why: {
      en: (
        <>
          A: correct, erasure removes every type parameter. B: correct, default
          type arguments are standard syntax. C: correct, that is the core
          promise of a type parameter. D: wrong, <code>extends</code> in a
          constraint means assignable to a shape, and no class is required. E:
          wrong, the type argument is only needed when inference has nothing to
          work with.
        </>
      ),
      zh: (
        <>
          A 对:擦除会去掉所有类型参数。B 对:默认类型实参是正规语法。C
          对:这正是类型参数的核心承诺。D 错:约束里的 <code>extends</code>{" "}
          的意思是「可以赋值给某个形状」,和 class 无关。E
          错:只有推断没有原料时才需要写类型实参。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          A colleague wrote{" "}
          <code>{"function log<T>(x: T): void { console.log(x) }"}</code> and
          asks you to review it. What is the most useful comment?
        </>
      ),
      zh: (
        <>
          同事写了{" "}
          <code>{"function log<T>(x: T): void { console.log(x) }"}</code>
          ,请你 review。最中肯的意见是?
        </>
      ),
    },
    opts: [
      {
        en: <>Looks good, the generic makes this function more flexible</>,
        zh: <>很好,泛型让这个函数更灵活了</>,
      },
      {
        en: (
          <>
            <code>T</code> is used once and links nothing, so it promises
            nothing. <code>x: unknown</code> says the same thing more honestly
          </>
        ),
        zh: (
          <>
            <code>T</code> 只出现一次,没联系任何东西,也就什么都没承诺。 改成{" "}
            <code>x: unknown</code> 更诚实
          </>
        ),
      },
      {
        en: (
          <>
            Add an <code>extends object</code> constraint to <code>T</code>
          </>
        ),
        zh: (
          <>
            应该给 <code>T</code> 加上 <code>extends object</code> 约束
          </>
        ),
      },
      {
        en: (
          <>
            It has to be called as <code>log&lt;string&gt;(…)</code> to work
          </>
        ),
        zh: (
          <>
            应该显式调用 <code>log&lt;string&gt;(…)</code> 才能用
          </>
        ),
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            The flexibility is not real. <code>x: unknown</code> accepts every
            value too. The type parameter adds nothing that <code>unknown</code>{" "}
            does not already give, only something more to read.
          </>
        ),
        zh: (
          <>
            这种灵活是假的。<code>x: unknown</code> 一样什么值都收。
            类型参数在这里没提供 <code>unknown</code> 给不了的任何东西,
            只多了阅读成本。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            A constraint does not fix the real problem: <code>T</code> still
            appears once and still links nothing. The issue is not that the
            placeholder is too loose, it is that it is not doing any work.
          </>
        ),
        zh: (
          <>
            加约束解决不了根本问题:<code>T</code>{" "}
            依然只出现一次,依然没联系任何东西。
            问题不是「洞太松」,而是「这个洞根本没在做事」。
          </>
        ),
      },
      {
        en: (
          <>
            It works either way, and inference works fine. That is exactly the
            problem: whatever <code>T</code> is filled with, the behaviour and
            the result type do not change.
          </>
        ),
        zh: (
          <>
            两种写法都能用,推断也没问题。而这恰恰暴露了问题:不管 <code>T</code>{" "}
            被填成什么,函数的行为和结果类型都没有变化。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          A type parameter earns its place by linking things. It should appear
          at least twice: between two parameters, or between a parameter and the
          return type. A <code>T</code> that appears once promises nothing, so{" "}
          <code>unknown</code> is the clearer choice.
        </>
      ),
      zh: (
        <>
          类型参数的价值在于把东西联系起来,所以它至少要出现两次:
          在两个参数之间,或者在参数和返回值之间。 只出现一次的 <code>T</code>{" "}
          什么都没承诺,直接写 <code>unknown</code> 更清楚。
        </>
      ),
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          To put a condition on a type parameter — &quot;T may not be just
          anything, it has to be assignable to this shape&quot; — you use the
          keyword ________.
        </>
      ),
      zh: (
        <>
          给类型参数加一个条件 ——「T 不是什么都能填,得可以赋值给某个形状」——
          用的关键字是 ________(填英文关键字)。
        </>
      ),
    },
    placeholder: { en: "keyword…", zh: "关键字…" },
    answers: ["extends"],
    hint: {
      en: (
        <>
          It is the same word that class inheritance uses, but in a type
          parameter list it means &quot;assignable to&quot;. It is written on
          the gate in §04 of this chapter.
        </>
      ),
      zh: (
        <>
          和 class 继承用的是同一个单词,但在类型参数列表里它的意思是
          「可以赋值给」。本章 §04 那道门上就写着它。
        </>
      ),
    },
    why: {
      en: (
        <>
          <code>{"<T extends { length: number }>"}</code> means T must be
          assignable to <code>{"{ length: number }"}</code>. It is a constraint,
          not inheritance, and the test is the structural one from chapter 04.
        </>
      ),
      zh: (
        <>
          <code>{"<T extends { length: number }>"}</code> 的意思是 T
          必须可以赋值给 <code>{"{ length: number }"}</code>。它是约束,不是继承,
          判定用的是第 04 章那套结构化检查。
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
          <code>
            {"function getProp<T, K extends keyof T>(obj: T, key: K): T[K]"}
          </code>{" "}
          and{" "}
          <code>{'const order = { item: "Boba milk tea", price: 18 }'}</code>,
          what happens on <code>getProp(order, &quot;topping&quot;)</code>?
        </>
      ),
      zh: (
        <>
          <code>
            {"function getProp<T, K extends keyof T>(obj: T, key: K): T[K]"}
          </code>
          ,对{" "}
          <code>{'const order = { item: "Boba milk tea", price: 18 }'}</code>{" "}
          调用 <code>getProp(order, &quot;topping&quot;)</code>,会发生什么?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            It returns <code>undefined</code>, with type <code>any</code>
          </>
        ),
        zh: (
          <>
            返回 <code>undefined</code>,类型是 <code>any</code>
          </>
        ),
      },
      { en: <>It throws an exception at runtime</>, zh: <>运行时抛出异常</> },
      {
        en: (
          <>
            A compile error — <code>&quot;topping&quot;</code> is not one of{" "}
            <code>&quot;item&quot; | &quot;price&quot;</code>
          </>
        ),
        zh: (
          <>
            编译期报错 —— <code>&quot;topping&quot;</code> 不在{" "}
            <code>&quot;item&quot; | &quot;price&quot;</code> 里
          </>
        ),
      },
      {
        en: (
          <>
            It compiles, and the result type is <code>unknown</code>
          </>
        ),
        zh: (
          <>
            正常通过,返回值类型是 <code>unknown</code>
          </>
        ),
      },
    ],
    correct: 2,
    wrong: [
      {
        en: (
          <>
            Returning <code>undefined</code> is what plain JavaScript would do.
            With <code>K extends keyof T</code> the program never reaches
            runtime with that key: the call does not compile.
          </>
        ),
        zh: (
          <>
            「返回 <code>undefined</code>」是纯 JavaScript 的结果。加了{" "}
            <code>K extends keyof T</code> 之后,程序根本不会带着这个键跑起来 ——
            这次调用编译不过。
          </>
        ),
      },
      {
        en: (
          <>
            It never gets the chance to run. The error is reported at compile
            time, which is the whole point of putting the constraint in the
            signature.
          </>
        ),
        zh: (
          <>
            它连运行的机会都没有。错误在编译期就报出来了,
            这正是把约束写进签名的意义。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            It does not compile. <code>K</code> is constrained to the keys of{" "}
            <code>T</code>, and <code>order</code> only has <code>item</code>{" "}
            and <code>price</code>.
          </>
        ),
        zh: (
          <>
            它编译不过。<code>K</code> 被约束成 <code>T</code> 的键,而{" "}
            <code>order</code> 只有 <code>item</code> 和 <code>price</code>{" "}
            两个键。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>keyof T</code> gives the union of the key names,{" "}
          <code>&quot;item&quot; | &quot;price&quot;</code>, and <code>K</code>{" "}
          must be one of them. The constraint is also what makes the return type{" "}
          <code>T[K]</code> safe: <code>K</code> can only name a property that
          really exists. Full coverage of <code>keyof</code> and{" "}
          <code>T[K]</code> is in chapter 07.
        </>
      ),
      zh: (
        <>
          <code>keyof T</code> 给出键名的联合{" "}
          <code>&quot;item&quot; | &quot;price&quot;</code>,而 <code>K</code>{" "}
          必须落在里面。返回值类型 <code>T[K]</code> 的安全性也来自这个约束:
          <code>K</code> 只能指向真实存在的属性。<code>keyof</code> 和{" "}
          <code>T[K]</code> 的完整用法在第 07 章。
        </>
      ),
    },
  },
];
