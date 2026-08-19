"use client";

// Chapter 03 · Unions and narrowing — practice tasks (LABS) and quiz (QUIZ).

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";
import { T, type Loc } from "@/lib/i18n";

const LAB1_CODE: Loc<string> = {
  en: `function shout(id: string | number) {
  // return id.toUpperCase();
  // ✕ Property 'toUpperCase' does not exist on type 'string | number'.
  //     Property 'toUpperCase' does not exist on type 'number'.
  //   Two lines, two meanings: the union does not have it, because
  //   the number member of the union does not have it.

  if (typeof id === "string") {
    return id.toUpperCase();       // hover: id: string
  }
  return String(id).toUpperCase(); // hover: id: number
}`,
  zh: `function shout(id: string | number) {
  // return id.toUpperCase();
  // ✕ Property 'toUpperCase' does not exist on type 'string | number'.
  //     Property 'toUpperCase' does not exist on type 'number'.
  //   两行两层意思:联合类型上没有它,是因为联合里的
  //   number 成员没有它。

  if (typeof id === "string") {
    return id.toUpperCase();       // 悬停:id: string
  }
  return String(id).toUpperCase(); // 悬停:id: number
}`,
};

const LAB2_CODE: Loc<string> = {
  en: `declare function later(fn: () => void): void;

function schedule(x: string | number) {
  let value = x;

  if (typeof value === "string") {
    value.toUpperCase(); // ✓ fine here

    later(() => {
      value.toUpperCase();
      // ✕ Property 'toUpperCase' does not exist on type 'string | number'.
    });
  }

  value = 42; // delete this line and the error above disappears
}

// The fix: capture the checked value in a const.
function fixed(x: string | number) {
  const value = x;
  if (typeof value === "string") {
    later(() => {
      value.toUpperCase(); // ✓ a const cannot change
    });
  }
}`,
  zh: `declare function later(fn: () => void): void;

function schedule(x: string | number) {
  let value = x;

  if (typeof value === "string") {
    value.toUpperCase(); // ✓ 这里没问题

    later(() => {
      value.toUpperCase();
      // ✕ Property 'toUpperCase' does not exist on type 'string | number'.
    });
  }

  value = 42; // 删掉这一行,上面的报错就消失了
}

// 解法:把检查过的值捕获进一个 const。
function fixed(x: string | number) {
  const value = x;
  if (typeof value === "string") {
    later(() => {
      value.toUpperCase(); // ✓ const 不会变
    });
  }
}`,
};

const LAB3_CODE: Loc<string> = {
  en: `type Order =
  | { status: "pending"; createdAt: Date }
  | { status: "paid"; createdAt: Date; paidAt: Date }
  | { status: "delivered"; createdAt: Date; paidAt: Date; deliveredAt: Date };

function report(order: Order): string {
  switch (order.status) {
    case "pending":
      // order.paidAt ← ✕ Property 'paidAt' does not exist on
      //   type '{ status: "pending"; createdAt: Date; }'.
      return "Preparing";
    case "paid":
      return "Paid at " + order.paidAt.toLocaleTimeString();      // ✓
    case "delivered":
      return "Delivered at " + order.deliveredAt.toLocaleTimeString(); // ✓
  }
}`,
  zh: `type Order =
  | { status: "pending"; createdAt: Date }
  | { status: "paid"; createdAt: Date; paidAt: Date }
  | { status: "delivered"; createdAt: Date; paidAt: Date; deliveredAt: Date };

function report(order: Order): string {
  switch (order.status) {
    case "pending":
      // order.paidAt ← ✕ Property 'paidAt' does not exist on
      //   type '{ status: "pending"; createdAt: Date; }'.
      return "Preparing";
    case "paid":
      return "Paid at " + order.paidAt.toLocaleTimeString();      // ✓
    case "delivered":
      return "Delivered at " + order.deliveredAt.toLocaleTimeString(); // ✓
  }
}`,
};

const LAB4_CODE: Loc<string> = {
  en: `type Order =
  | { status: "pending"; createdAt: Date }
  | { status: "paid"; createdAt: Date; paidAt: Date }
  | { status: "delivered"; createdAt: Date; paidAt: Date; deliveredAt: Date }
  | { status: "refunded"; refundedAt: Date }; // ← the new state

function report(order: Order): string {
  switch (order.status) {
    case "pending":   return "Preparing";
    case "paid":      return "Paid";
    case "delivered": return "Delivered";
    // Adding this line makes the error go away:
    case "refunded":  return "Refunded";
    default: {
      const _exhaustive: never = order;
      // Without the case above, this line reports:
      // Type '{ status: "refunded"; refundedAt: Date; }' is
      //   not assignable to type 'never'.
      return _exhaustive;
    }
  }
}`,
  zh: `type Order =
  | { status: "pending"; createdAt: Date }
  | { status: "paid"; createdAt: Date; paidAt: Date }
  | { status: "delivered"; createdAt: Date; paidAt: Date; deliveredAt: Date }
  | { status: "refunded"; refundedAt: Date }; // ← 新增的状态

function report(order: Order): string {
  switch (order.status) {
    case "pending":   return "Preparing";
    case "paid":      return "Paid";
    case "delivered": return "Delivered";
    // 补上这一行,报错就消失了:
    case "refunded":  return "Refunded";
    default: {
      const _exhaustive: never = order;
      // 没补上面那个 case 时,这一行会报:
      // Type '{ status: "refunded"; refundedAt: Date; }' is
      //   not assignable to type 'never'.
      return _exhaustive;
    }
  }
}`,
};

const LAB5_CODE: Loc<string> = {
  en: `type Pending = { status: "pending"; createdAt: Date };
type Paid = { status: "paid"; createdAt: Date; paidAt: Date };
type Order = Pending | Paid;

declare const orders: Order[];

// 1. inline arrow function:
const a = orders.filter((o) => o.status === "paid");
// TS 5.4 and earlier: a is Order[] — the filter did not change the type
// TS 5.5 and later:   a is Paid[]  — the predicate was inferred

// 2. an explicit predicate narrows on every version:
function isPaid(o: Order): o is Paid {
  return o.status === "paid";
}
const b = orders.filter(isPaid); // b: Paid[]`,
  zh: `type Pending = { status: "pending"; createdAt: Date };
type Paid = { status: "paid"; createdAt: Date; paidAt: Date };
type Order = Pending | Paid;

declare const orders: Order[];

// 1. 内联箭头函数:
const a = orders.filter((o) => o.status === "paid");
// TS 5.4 及以前:a 是 Order[] —— filter 没有改变类型
// TS 5.5 及以后:a 是 Paid[]  —— 谓词被自动推断出来了

// 2. 手写谓词,任何版本都能收窄:
function isPaid(o: Order): o is Paid {
  return o.status === "paid";
}
const b = orders.filter(isPaid); // b: Paid[]`,
};

export const LABS: Lab[] = [
  {
    id: "common-members",
    title: {
      en: "Hit the shared-member rule yourself",
      zh: "亲手撞一次「共有成员」规则",
    },
    d: "easy",
    tags: ["Playground", "union", "typeof"],
    task: (
      <T
        en={
          <p>
            Open the TypeScript Playground (typescriptlang.org/play) and write{" "}
            <code>{"function shout(id: string | number)"}</code> with{" "}
            <code>return id.toUpperCase()</code> in the body. Read the error and
            notice that it has <b>two lines</b>: the second one names the member
            that is missing. Then fix it with <code>typeof</code>. After the
            fix, hover over <code>id</code> inside the <code>if</code> and again
            after it, and compare the two types.
          </p>
        }
        zh={
          <p>
            打开 TypeScript Playground(typescriptlang.org/play),写一个{" "}
            <code>{"function shout(id: string | number)"}</code>
            ,函数体里直接 <code>return id.toUpperCase()</code>。
            读一读报错,注意它有<b>两行</b>:第二行点名了到底是谁缺这个成员。
            然后用 <code>typeof</code> 把它修好。修好后,把光标分别悬停在{" "}
            <code>if</code> 里面和 <code>if</code> 之后的 <code>id</code> 上,
            对比这两个类型。
          </p>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            The second line of the error tells you which member of the union
            lacks <code>toUpperCase</code>. To fix it, write a check that leaves
            only one possibility open.
          </>
        }
        zh={
          <>
            报错的第二行会告诉你联合里哪个成员缺 <code>toUpperCase</code>。
            修的办法是:写一道检查,让这条路径上只剩一种可能。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock lang="ts" title="playground" code={LAB1_CODE} />
        <p>
          <T
            en={
              <>
                The change in the hover tooltip <i>is</i> narrowing. The same{" "}
                <code>id</code> is <code>string</code> inside the{" "}
                <code>if</code> and <code>number</code> after it, because the
                compiler tracks the possibilities line by line.
              </>
            }
            zh={
              <>
                悬停提示的变化<i>就是</i>收窄本身。同一个 <code>id</code>,在{" "}
                <code>if</code> 里面是 <code>string</code>,在它之后是{" "}
                <code>number</code> —— 因为编译器是逐行跟踪可能性的。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "narrowing-lost",
    title: {
      en: "Watch narrowing disappear inside a callback",
      zh: "看着收窄在回调里消失",
    },
    d: "medium",
    tags: {
      en: ["Playground", "control flow", "callback", "const"],
      zh: ["Playground", "控制流", "回调", "const"],
    },
    task: (
      <T
        en={
          <p>
            In the Playground, declare{" "}
            <code>{"declare function later(fn: () => void): void;"}</code>.
            Write a function that takes <code>x: string | number</code>, copies
            it into <code>let value = x</code>, narrows it with{" "}
            <code>typeof</code>, and calls <code>value.toUpperCase()</code>{" "}
            twice: once directly and once inside a callback passed to{" "}
            <code>later</code>. Add <code>value = 42</code> at the end of the
            function. Only one of the two calls reports an error. Now delete{" "}
            <code>value = 42</code> and watch the error disappear.
          </p>
        }
        zh={
          <p>
            在 Playground 里先声明{" "}
            <code>{"declare function later(fn: () => void): void;"}</code>。
            写一个接收 <code>x: string | number</code> 的函数,把它复制进{" "}
            <code>let value = x</code>,用 <code>typeof</code> 收窄,
            然后调用两次 <code>value.toUpperCase()</code>:
            一次直接调用,一次放在传给 <code>later</code> 的回调里面。
            最后在函数末尾加一行 <code>value = 42</code>。
            这时只有一次调用会报错。再把 <code>value = 42</code> 删掉,
            看那个报错消失。
          </p>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            The compiler does not know when the callback runs. Ask yourself
            what has to be true for the check to still hold at that moment.
            That is why the reassignment at the end matters.
          </>
        }
        zh={
          <>
            编译器不知道回调什么时候执行。想一想:
            到了那个时刻,要满足什么条件,先前那道检查才依然成立?
            这就是末尾那行重新赋值为什么会影响结果。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock lang="ts" title="playground" code={LAB2_CODE} />
        <p>
          <T
            en={
              <>
                Then try the same with a property: give a parameter the type{" "}
                <code>{"{ note?: string }"}</code>, check{" "}
                <code>if (d.note)</code>, and use <code>d.note</code> inside a
                callback. This one always reports{" "}
                <code>&apos;d.note&apos; is possibly &apos;undefined&apos;</code>
                , even with no reassignment anywhere, because a property can be
                changed from outside the function.
              </>
            }
            zh={
              <>
                然后换成属性再试一次:给参数一个{" "}
                <code>{"{ note?: string }"}</code> 类型,写{" "}
                <code>if (d.note)</code>,再在回调里用 <code>d.note</code>。
                这一次<b>一定</b>会报{" "}
                <code>&apos;d.note&apos; is possibly &apos;undefined&apos;</code>
                ,哪怕代码里没有任何重新赋值 ——
                因为属性随时可能被函数外面的代码改掉。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "tagged-order",
    title: {
      en: "Write a discriminated union for an order",
      zh: "给订单写一个可辨识联合",
    },
    d: "medium",
    tags: {
      en: ["Playground", "discriminated union", "switch"],
      zh: ["Playground", "可辨识联合", "switch"],
    },
    task: (
      <T
        en={
          <p>
            Define an <code>Order</code> type with three states: pending (only{" "}
            <code>createdAt</code>), paid (also <code>paidAt</code>), and
            delivered (also <code>deliveredAt</code>). Give{" "}
            <code>status</code> a <b>literal type</b> in each member. Then write{" "}
            <code>{"function report(order: Order): string"}</code> and switch on{" "}
            <code>status</code>. Hover over <code>order</code> in each case and
            confirm the shape differs. Finally, read{" "}
            <code>order.paidAt</code> in the pending case on purpose and read
            the error.
          </p>
        }
        zh={
          <p>
            定义一个三状态的 <code>Order</code> 类型:pending(只有{" "}
            <code>createdAt</code>)、paid(多一个 <code>paidAt</code>)、
            delivered(再多一个 <code>deliveredAt</code>)。
            每个成员的 <code>status</code> 都写成<b>字面量类型</b>。然后写{" "}
            <code>{"function report(order: Order): string"}</code>,对{" "}
            <code>status</code> 做 switch。在每个 case 里悬停{" "}
            <code>order</code>,确认形状不一样。最后故意在 pending 分支里读{" "}
            <code>order.paidAt</code>,读一读报错。
          </p>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            <code>status</code> must be written as{" "}
            <code>&quot;pending&quot;</code>, not <code>string</code>. Try it
            with <code>string</code> as well, so you see what breaks and why.
          </>
        }
        zh={
          <>
            <code>status</code> 必须写成 <code>&quot;pending&quot;</code>{" "}
            这样的字面量,而不是 <code>string</code>。也可以用{" "}
            <code>string</code> 试一遍,亲眼看看会坏在哪里、为什么。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock lang="ts" title="playground" code={LAB3_CODE} />
        <p>
          <T
            en={
              <>
                Now change <code>status</code> to <code>string</code> and look
                again: <code>order</code> no longer narrows in any case, and
                every access to <code>paidAt</code> fails. A wide{" "}
                <code>string</code> cannot tell the members apart, so the tag
                field has to be a literal type. That is the second of the three
                conditions.
              </>
            }
            zh={
              <>
                现在把 <code>status</code> 改成 <code>string</code>{" "}
                再看:<code>order</code> 在所有 case 里都不再收窄,
                每一处 <code>paidAt</code> 都会报错。宽泛的{" "}
                <code>string</code> 区分不了成员,所以标签字段必须是字面量类型
                —— 这正是三个条件里的第二条。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "exhaustive-refund",
    title: {
      en: "Exhaustiveness: add a state and let the compiler find the gaps",
      zh: "穷尽检查:新增状态,让编译器点名",
    },
    d: "hard",
    tags: {
      en: ["Playground", "never", "exhaustiveness"],
      zh: ["Playground", "never", "穷尽检查"],
    },
    task: (
      <T
        en={
          <p>
            Continue from the previous task. Add a <code>default</code> branch
            to the switch containing{" "}
            <code>const _exhaustive: never = order;</code> and confirm there is
            no error. Then add a fourth member{" "}
            <code>{'{ status: "refunded"; refundedAt: Date }'}</code> to{" "}
            <code>Order</code> and <b>do not touch report</b>. See which line
            the error lands on and what it says. Finally add the missing case
            and watch the error go away.
          </p>
        }
        zh={
          <p>
            接着上一题。给 switch 补一个 <code>default</code> 分支,里面写{" "}
            <code>const _exhaustive: never = order;</code>,确认没有报错。
            然后给 <code>Order</code> 加第四个成员{" "}
            <code>{'{ status: "refunded"; refundedAt: Date }'}</code>,并且
            <b>不要动 report</b>。看编译器把错报在哪一行、说了什么。
            最后补上缺的 case,看报错消失。
          </p>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            The error does not appear on the line you edited. It appears in the{" "}
            <code>default</code> branch, because a value now reaches a place
            that was supposed to be unreachable.
          </>
        }
        zh={
          <>
            报错不在你改动的那一行,而在 <code>default</code> 分支里 ——
            因为现在有一个值流到了本该没有任何值能到达的地方。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock lang="ts" title="playground" code={LAB4_CODE} />
        <p>
          <T
            en={
              <>
                This is the workflow: change the type, let the compiler list
                every switch that has not caught up, fix them one by one, done.
                In a real project a status can be consumed in twenty places.
                This turns &quot;search the codebase and hope&quot; into working
                down a list.
              </>
            }
            zh={
              <>
                体会这个工作流:改类型 → 编译器列出所有没跟上的 switch →
                逐个补齐 → 完成。真实项目里一个状态可能被二十处代码消费,
                这一招把「全局搜索然后祈祷」变成了照着清单干活。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "predicate-filter",
    title: {
      en: "Type predicates, and what TS 5.5 infers for you",
      zh: "类型谓词,以及 TS 5.5 能替你推断什么",
    },
    d: "medium",
    tags: ["Playground", "is", "filter"],
    task: (
      <T
        en={
          <p>
            Using the same <code>Order</code> type: (1) write{" "}
            <code>{'const paid = orders.filter((o) => o.status === "paid")'}</code>{" "}
            and hover over <code>paid</code>; (2) write a predicate{" "}
            <code>{"function isPaid(o: Order): o is Paid"}</code>, filter with
            it, and compare the result; (3) switch the TypeScript version in the
            Playground to something below 5.5 and look at step 1 again.
          </p>
        }
        zh={
          <p>
            还是那个 <code>Order</code> 类型:① 先写{" "}
            <code>{'const paid = orders.filter((o) => o.status === "paid")'}</code>
            ,悬停 <code>paid</code> 看类型;② 写一个谓词函数{" "}
            <code>{"function isPaid(o: Order): o is Paid"}</code>,
            用它再 filter 一次,对比结果;③ 把 Playground 的 TypeScript
            版本切到 5.5 以下,再看第 ① 步的类型。
          </p>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            The version selector is at the top of the Playground. The answer to
            step 1 <b>depends on the version</b>, and seeing that difference is
            the point of this task.
          </>
        }
        zh={
          <>
            版本选择器在 Playground 顶部。第 ① 步的答案<b>随版本变化</b>,
            亲眼看到这个差别正是这道题的重点。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock lang="ts" title="playground" code={LAB5_CODE} />
        <p>
          <T
            en={
              <>
                From TS 5.5, a filter callback that takes one parameter and
                immediately returns a narrowing expression gets a predicate
                inferred automatically. Longer logic still needs an explicit{" "}
                <code>is</code>. And writing it explicitly means the compiler
                trusts you: if the body is wrong, nothing will tell you.
              </>
            }
            zh={
              <>
                从 TS 5.5 起,「单参数、直接返回一个收窄表达式」的 filter
                回调会自动获得谓词。更长的逻辑仍然需要显式的{" "}
                <code>is</code>。而一旦手写,编译器就无条件信你:
                函数体写错了,没有任何东西会提醒你。
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
    q: (
      <T
        en={
          <>
            <code>
              {"function f(id: string | number) { id.toUpperCase(); }"}
            </code>{" "}
            fails to compile. Why?
          </>
        }
        zh={
          <>
            <code>
              {"function f(id: string | number) { id.toUpperCase(); }"}
            </code>{" "}
            编译不过,根本原因是什么?
          </>
        }
      />
    ),
    opts: [
      <T
        key="a"
        en={<>TypeScript does not allow string methods inside a function</>}
        zh={<>TypeScript 不允许在函数里调用字符串方法</>}
      />,
      <T
        key="b"
        en={
          <>
            The compiler assumes the worst case: <code>id</code> may be a
            number, and numbers have no <code>toUpperCase</code>
          </>
        }
        zh={
          <>
            编译器按最坏情况处理:<code>id</code> 可能是 number,而 number
            没有 <code>toUpperCase</code>
          </>
        }
      />,
      <T
        key="c"
        en={<>No method can be called on a union type</>}
        zh={<>联合类型上不能调用任何方法</>}
      />,
      <T
        key="d"
        en={
          <>
            <code>toUpperCase</code> has to be imported first
          </>
        }
        zh={
          <>
            <code>toUpperCase</code> 需要先 import 才能用
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
            It does allow them. Once <code>id</code> is known to be a string,
            the call is fine. The problem is that it is not known yet.
          </>
        }
        zh={
          <>
            当然允许。只要确定 <code>id</code> 是字符串,这个调用就没问题。
            问题在于现在还不确定。
          </>
        }
      />,
      undefined,
      <T
        key="c"
        en={
          <>
            <b>Shared members</b> can be called directly. <code>toString</code>{" "}
            works, because both <code>string</code> and <code>number</code>{" "}
            have it. Only members that some type lacks are blocked.
          </>
        }
        zh={
          <>
            <b>共有成员</b>可以直接调用。<code>toString</code> 就没问题,
            因为 <code>string</code> 和 <code>number</code> 都有它。
            被挡住的只是「有成员没有」的那些。
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            String methods are built into the language and have nothing to do
            with modules. The error says{" "}
            <code>Property does not exist</code>, not{" "}
            <code>Cannot find module</code>.
          </>
        }
        zh={
          <>
            字符串方法是语言内置的,和模块系统无关。报错写的是{" "}
            <code>Property does not exist</code>,不是{" "}
            <code>Cannot find module</code>。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            A union means several possibilities are open at once, so the
            compiler only allows the members that <b>all of them have</b>. To
            use a member of one type, narrow the union first — for example with{" "}
            <code>typeof id === &quot;string&quot;</code>.
          </>
        }
        zh={
          <>
            联合类型意味着几种可能同时存在,所以编译器只允许你使用
            <b>所有成员都有</b>的部分。想用某一种类型的成员,先收窄 ——
            比如写 <code>typeof id === &quot;string&quot;</code>。
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
            What does <code>typeof null</code> return?
          </>
        }
        zh={
          <>
            <code>typeof null</code> 的结果是什么?
          </>
        }
      />
    ),
    opts: [
      <code key="a">&quot;null&quot;</code>,
      <code key="b">&quot;object&quot;</code>,
      <code key="c">&quot;undefined&quot;</code>,
      <T key="d" en={<>It throws an error</>} zh={<>直接抛出异常</>} />,
    ],
    correct: 1,
    wrong: [
      <T
        key="a"
        en={
          <>
            That is what most people expect, but <code>typeof</code> has never
            had <code>&quot;null&quot;</code> among its results. That is exactly
            why this catches people out.
          </>
        }
        zh={
          <>
            大多数人都这么以为,但 <code>typeof</code> 的返回值里从来没有{" "}
            <code>&quot;null&quot;</code>。这正是它坑人的地方。
          </>
        }
      />,
      undefined,
      <T
        key="c"
        en={
          <>
            That is the result of <code>typeof undefined</code>.{" "}
            <code>null</code> and <code>undefined</code> are two different
            values and <code>typeof</code> answers differently for each.
          </>
        }
        zh={
          <>
            那是 <code>typeof undefined</code> 的结果。<code>null</code> 和{" "}
            <code>undefined</code> 是两个不同的值,<code>typeof</code>{" "}
            对它们的回答也不同。
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            <code>typeof</code> never throws. It even works on a variable that
            was never declared.
          </>
        }
        zh={
          <>
            <code>typeof</code> 从不抛错,连没声明过的变量都能查。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            <code>typeof null === &quot;object&quot;</code>. It comes from the
            first implementation of JavaScript in 1995 and is kept for
            compatibility. So the complete check for an object is{" "}
            <code>
              x !== null &amp;&amp; typeof x === &quot;object&quot;
            </code>
            .
          </>
        }
        zh={
          <>
            <code>typeof null === &quot;object&quot;</code>。
            这来自 1995 年 JavaScript 的第一版实现,为了兼容性一直保留。
            所以判断对象的完整写法是{" "}
            <code>
              x !== null &amp;&amp; typeof x === &quot;object&quot;
            </code>
            。
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
            <code>count: number | undefined</code>, and the code is{" "}
            <code>{"if (count) { A } else { B }"}</code>. Which branch runs when{" "}
            <code>count</code> is <b>0</b>?
          </>
        }
        zh={
          <>
            <code>count: number | undefined</code>,代码是{" "}
            <code>{"if (count) { A } else { B }"}</code>。当{" "}
            <code>count</code> 是 <b>0</b> 时,走哪个分支?
          </>
        }
      />
    ),
    opts: [
      <T
        key="a"
        en={
          <>
            A — <code>0</code> is a valid number
          </>
        }
        zh={
          <>
            A —— <code>0</code> 是合法的 number
          </>
        }
      />,
      <T
        key="b"
        en={
          <>
            B — <code>0</code> is falsy, so the truthiness check removes it too
          </>
        }
        zh={
          <>
            B —— <code>0</code> 是 falsy,真值检查把它一起排除了
          </>
        }
      />,
      <T
        key="c"
        en={<>It does not compile; a truthiness check on a number is rejected</>}
        zh={<>编译报错,不允许对 number 做真值检查</>}
      />,
      <T
        key="d"
        en={<>It throws at runtime</>}
        zh={<>运行时抛出异常</>}
      />,
    ],
    correct: 1,
    wrong: [
      <T
        key="a"
        en={
          <>
            <code>0</code> is a valid number, but a truthiness check does not
            look at the type. It looks at whether the value is truthy, and{" "}
            <code>0</code> is not.
          </>
        }
        zh={
          <>
            <code>0</code> 确实是合法的 number,但真值检查看的不是类型,
            而是这个值真不真 —— <code>0</code> 不真。
          </>
        }
      />,
      undefined,
      <T
        key="c"
        en={
          <>
            A truthiness check is legal on any type, which is exactly what makes
            it risky. The compiler says nothing, and the bug goes in quietly.
          </>
        }
        zh={
          <>
            真值检查对任何类型都合法,这正是它危险的地方。
            编译器一声不吭,坑就这么安静地埋下了。
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            <code>if (0)</code> evaluates to false at runtime without any error.
            Nothing throws; the code just takes the wrong branch.
          </>
        }
        zh={
          <>
            <code>if (0)</code> 在运行时平静地得到 false,不会有任何错误。
            没有异常,只有走错的分支。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            A truthiness check removes every falsy value at once:{" "}
            <code>undefined</code>, <code>null</code>, <code>0</code>,{" "}
            <code>&quot;&quot;</code> and <code>NaN</code>. Zero items is data,
            not a missing value. If you only want to exclude{" "}
            <code>undefined</code>, write <code>count !== undefined</code>.
          </>
        }
        zh={
          <>
            真值检查会一次排除所有 falsy 值:<code>undefined</code>、
            <code>null</code>、<code>0</code>、<code>&quot;&quot;</code>、
            <code>NaN</code>。「0 件」是数据,不是没填。
            如果你只想排除 <code>undefined</code>,就写{" "}
            <code>count !== undefined</code>。
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
            <code>x</code> is <code>string | number</code>. Inside{" "}
            <code>if (typeof x === &quot;string&quot;)</code> you pass a
            callback to <code>setTimeout</code> that calls{" "}
            <code>x.toUpperCase()</code>, and somewhere else in the same
            function you also write <code>x = 42</code>. What happens?
          </>
        }
        zh={
          <>
            <code>x</code> 的类型是 <code>string | number</code>。在{" "}
            <code>if (typeof x === &quot;string&quot;)</code> 里,
            你给 <code>setTimeout</code> 传了一个调用{" "}
            <code>x.toUpperCase()</code> 的回调;同一个函数里的别处,
            你还写了 <code>x = 42</code>。会发生什么?
          </>
        }
      />
    ),
    opts: [
      <T
        key="a"
        en={<>The callback keeps the narrowing, because it is inside the if</>}
        zh={<>回调保留收窄结果,因为它写在 if 里面</>}
      />,
      <T
        key="b"
        en={
          <>
            The callback reports an error: inside it, <code>x</code> is{" "}
            <code>string | number</code> again
          </>
        }
        zh={
          <>
            回调里报错:在回调内部,<code>x</code> 又变回了{" "}
            <code>string | number</code>
          </>
        }
      />,
      <T
        key="c"
        en={
          <>
            The error is reported on <code>x = 42</code> instead
          </>
        }
        zh={
          <>
            报错报在 <code>x = 42</code> 那一行
          </>
        }
      />,
      <T
        key="d"
        en={<>Nothing; TypeScript never narrows inside a callback anyway</>}
        zh={<>什么也不会发生,TypeScript 在回调里本来就不收窄</>}
      />,
    ],
    correct: 1,
    wrong: [
      <T
        key="a"
        en={
          <>
            Where the callback is written does not matter. What matters is{" "}
            <b>when it runs</b>, and the compiler cannot know that. Since{" "}
            <code>x</code> can be reassigned, the check may no longer hold by
            then.
          </>
        }
        zh={
          <>
            回调写在哪里并不重要,重要的是它<b>什么时候执行</b>,
            而编译器无法知道。既然 <code>x</code> 还会被重新赋值,
            到那时那道检查可能已经不成立了。
          </>
        }
      />,
      undefined,
      <T
        key="c"
        en={
          <>
            <code>x = 42</code> is a perfectly legal assignment for a variable
            of type <code>string | number</code>. It is the reason for the
            error, not the location of it.
          </>
        }
        zh={
          <>
            对一个 <code>string | number</code> 类型的变量来说,{" "}
            <code>x = 42</code> 是完全合法的赋值。
            它是报错的原因,而不是报错的位置。
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            It does narrow inside callbacks — but only for a variable that is
            never reassigned. Remove <code>x = 42</code> and the error is gone.
          </>
        }
        zh={
          <>
            回调里是会收窄的,但仅限于从未被重新赋值的变量。
            把 <code>x = 42</code> 删掉,报错就没了。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            The compiler carries narrowing into a nested function only when the
            variable cannot change. A reassignment anywhere in the function is
            enough to drop it. A narrowed object <b>property</b> is stricter
            still: it is never carried into a callback, because outside code
            could change it. The fix in both cases is to copy the checked value
            into a <code>const</code>.
          </>
        }
        zh={
          <>
            只有当变量不可能改变时,编译器才会把收窄结果带进嵌套函数。
            函数里任何一处重新赋值都足以让它失效。被收窄的对象<b>属性</b>
            更严格:它永远不会被带进回调,因为外部代码随时可能改动它。
            两种情况的解法一样:把检查过的值复制进一个 <code>const</code>。
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
            What must be true of the tag field in a discriminated union?
          </>
        }
        zh={<>可辨识联合里的标签字段,必须满足什么条件?</>}
      />
    ),
    opts: [
      <T
        key="a"
        en={
          <>
            It has to be called <code>status</code>
          </>
        }
        zh={
          <>
            字段名必须叫 <code>status</code>
          </>
        }
      />,
      <T
        key="b"
        en={
          <>
            Every member has it, its type is a literal, and the literals differ
            between members
          </>
        }
        zh={<>每个成员都有它、类型是字面量、且各成员的字面量互不相同</>}
      />,
      <T
        key="c"
        en={
          <>
            Its type has to be <code>string</code>
          </>
        }
        zh={
          <>
            它的类型必须是 <code>string</code>
          </>
        }
      />,
      <T
        key="d"
        en={<>It has to be the first property of every member</>}
        zh={<>它必须写在每个成员的第一个位置</>}
      />,
    ],
    correct: 1,
    wrong: [
      <T
        key="a"
        en={
          <>
            <code>kind</code>, <code>type</code>, <code>tag</code> all work. The
            compiler looks at the structure, not at the name.
          </>
        }
        zh={
          <>
            叫 <code>kind</code>、<code>type</code>、<code>tag</code> 都行。
            编译器看的是结构,不是名字。
          </>
        }
      />,
      undefined,
      <T
        key="c"
        en={
          <>
            Close, but one word off: it has to be a <b>literal type</b>, not{" "}
            <code>string</code>. A wide <code>string</code> cannot tell the
            members apart. Number and boolean literals work as tags too.
          </>
        }
        zh={
          <>
            差一个词:它必须是<b>字面量类型</b>,而不是 <code>string</code>。
            宽泛的 <code>string</code> 区分不了成员。
            数字字面量和布尔字面量同样可以当标签。
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            Property order does not matter to the type system. TypeScript
            compares shapes, not layout.
          </>
        }
        zh={
          <>
            属性顺序对类型系统毫无影响。TypeScript 比较的是形状,不是排版。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            Three conditions: a <b>shared field</b>, a <b>literal type</b>, and{" "}
            <b>different literals</b> in every member. With all three, one
            comparison such as <code>switch (order.status)</code> narrows the
            whole object to the matching member.
          </>
        }
        zh={
          <>
            三个条件:<b>公共字段</b>、<b>字面量类型</b>、
            各成员的字面量<b>互不相同</b>。三条都满足时,一句{" "}
            <code>switch (order.status)</code> 就能把整个对象收窄到对应的成员。
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
            Which of these are <b>real narrowing</b> — a check that actually
            runs, which the compiler uses to reduce the type? (Select all.)
          </>
        }
        zh={
          <>
            下面哪些是<b>真正的收窄</b> ——
            运行时真的会执行一次检查,编译器据此缩小类型?(多选)
          </>
        }
      />
    ),
    opts: [
      <code key="a">typeof x === &quot;string&quot;</code>,
      <code key="b">&quot;steep&quot; in drink</code>,
      <code key="c">x as string</code>,
      <code key="d">order.status === &quot;paid&quot;</code>,
      <code key="e">x!</code>,
    ],
    correct: [0, 1, 3],
    missHint: (
      <T
        en={
          <>
            One is missing. Comparing a field against a literal is an ordinary
            runtime comparison, and it is the everyday form of a discriminated
            union.
          </>
        }
        zh={
          <>
            还漏了一个。把字段和字面量比较,就是一次普通的运行时比较,
            也是可辨识联合最日常的写法。
          </>
        }
      />
    ),
    extraHint: (
      <T
        en={
          <>
            One too many. Two of the options <b>disappear when compiled</b> and
            check nothing at runtime. That is not narrowing; that is telling the
            compiler to stop reporting.
          </>
        }
        zh={
          <>
            勾多了。有两个选项<b>编译后就消失了</b>,运行时什么都不检查。
            那不是收窄,那只是让编译器别再报错。
          </>
        }
      />
    ),
    why: (
      <T
        en={
          <>
            <code>typeof</code>, <code>in</code> and a literal comparison all
            compile to JavaScript that <b>really executes</b>, so the narrowing
            is backed by a real check. <code>as</code> and <code>!</code>{" "}
            compile to nothing. If the type was wrong, the program still fails —
            only now without a warning.
          </>
        }
        zh={
          <>
            <code>typeof</code>、<code>in</code> 和字面量比较,
            编译成 JavaScript 后都<b>真的会执行</b>,
            所以收窄背后有一次真实的检查。<code>as</code> 和 <code>!</code>{" "}
            编译后什么都不剩。类型判断错了,程序照样出错,
            只是这次连提醒都没有了。
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
            Exhaustiveness check: writing{" "}
            <code>const _x: ____ = order;</code> in the <code>default</code>{" "}
            branch turns a forgotten case into a compile error. Which type goes
            in the blank?
          </>
        }
        zh={
          <>
            穷尽检查:在 <code>default</code> 分支里写{" "}
            <code>const _x: ____ = order;</code>,
            就能让「漏了一个 case」变成编译错误。空格里填哪个类型?
          </>
        }
      />
    ),
    placeholder: { en: "a type keyword", zh: "一个类型关键字" },
    answers: ["never"],
    hint: (
      <T
        en={
          <>
            It is the empty union: the type left over after every case has been
            handled. It was the last frame of the animation in §02.
          </>
        }
        zh={
          <>
            它是空联合 —— 所有 case 都处理完之后剩下的那个类型。
            §02 那段动画的最后一帧就是它。
          </>
        }
      />
    ),
    why: (
      <T
        en={
          <>
            <code>never</code> is the empty union, so no value can be assigned
            to it. While every case is handled, the compiler agrees the line is
            unreachable and the assignment compiles. Add a new member to the
            union and it reaches <code>default</code>, the assignment fails, and
            the compiler has pointed at the case you forgot.
          </>
        }
        zh={
          <>
            <code>never</code> 是空联合,所以任何值都不能赋给它。
            当所有 case 都被处理时,编译器认同这一行不可能被执行到,
            赋值成立。一旦联合里多出一个成员,它会流到{" "}
            <code>default</code>,赋值失败 —— 编译器就替你指出了漏掉的分支。
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
            <code>{"function isPaid(o: Order): o is Paid"}</code> — what does{" "}
            <code>o is Paid</code> tell the compiler to do?
          </>
        }
        zh={
          <>
            <code>{"function isPaid(o: Order): o is Paid"}</code> —— 这里的{" "}
            <code>o is Paid</code> 让编译器做什么?
          </>
        }
      />
    ),
    opts: [
      <T
        key="a"
        en={
          <>
            At the call site, narrow the argument to <code>Paid</code> in the
            branch where the call returned true
          </>
        }
        zh={
          <>
            在调用处,把返回 true 的那个分支里的实参收窄成 <code>Paid</code>
          </>
        }
      />,
      <T
        key="b"
        en={
          <>
            Convert <code>o</code> into a <code>Paid</code> object at runtime
          </>
        }
        zh={
          <>
            运行时把 <code>o</code> 转换成 <code>Paid</code> 对象
          </>
        }
      />,
      <T
        key="c"
        en={
          <>
            Verify that the function body really checks for <code>Paid</code>,
            and report an error if it does not
          </>
        }
        zh={
          <>
            检查函数体是否真的验证了 <code>Paid</code>,不对就报错
          </>
        }
      />,
      <T
        key="d"
        en={<>Only affect the inside of the function; callers see no change</>}
        zh={<>只在函数内部生效,调用方看不到任何变化</>}
      />,
    ],
    correct: 0,
    wrong: [
      undefined,
      <T
        key="b"
        en={
          <>
            All types are erased before the code runs, so no conversion happens.
            A predicate only changes what the compiler records; the value is
            untouched.
          </>
        }
        zh={
          <>
            代码运行前所有类型都被擦除了,不会发生任何转换。
            谓词只改变编译器记录的内容,值本身分毫不动。
          </>
        }
      />,
      <T
        key="c"
        en={
          <>
            It does the opposite: it <b>does not check</b>. This is the most
            dangerous part of a predicate. Write the logic backwards and the
            compiler still believes you.
          </>
        }
        zh={
          <>
            恰恰相反,它<b>不检查</b>。这正是谓词最危险的地方:
            逻辑写反了,编译器照样相信你。
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            The other way round: a predicate exists <b>for the caller</b>. The
            narrowing happens in <code>if (isPaid(order))</code> and in the
            result of <code>filter</code>.
          </>
        }
        zh={
          <>
            方向反了:谓词就是<b>写给调用方</b>用的。收窄发生在{" "}
            <code>if (isPaid(order))</code> 的分支里,以及{" "}
            <code>filter</code> 的结果上。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            <code>o is Paid</code> means &quot;if I return true, o is a
            Paid&quot;. So <code>order</code> becomes <code>Paid</code> inside{" "}
            <code>if (isPaid(order))</code>, and{" "}
            <code>orders.filter(isPaid)</code> has type <code>Paid[]</code>. A
            related form, <code>asserts o is Paid</code>, narrows everything
            after the call instead of inside a branch.
          </>
        }
        zh={
          <>
            <code>o is Paid</code> 的意思是「只要我返回 true,o 就是 Paid」。
            所以在 <code>if (isPaid(order))</code> 里 <code>order</code>{" "}
            变成 <code>Paid</code>,而 <code>orders.filter(isPaid)</code>{" "}
            的类型是 <code>Paid[]</code>。还有一种相近的写法{" "}
            <code>asserts o is Paid</code>,它收窄的不是某个分支,
            而是调用之后的所有代码。
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
            What does the <code>!</code> in <code>m!.nickname</code> (the
            non-null assertion) actually do?
          </>
        }
        zh={
          <>
            <code>m!.nickname</code> 里的 <code>!</code>(非空断言)
            实际做了什么?
          </>
        }
      />
    ),
    opts: [
      <T
        key="a"
        en={
          <>
            Checks at runtime that <code>m</code> is not null and throws a
            clearer error if it is
          </>
        }
        zh={
          <>
            运行时检查 <code>m</code> 非空,是空就抛出更清楚的错误
          </>
        }
      />,
      <T
        key="b"
        en={
          <>
            Nothing at runtime — it only stops the compiler from reporting
          </>
        }
        zh={<>运行时什么都不做,只是让编译器不再报错</>}
      />,
      <T
        key="c"
        en={
          <>
            Substitutes a default value when <code>m</code> is null
          </>
        }
        zh={
          <>
            <code>m</code> 是 null 时自动换成默认值
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            Exactly the same as <code>m?.nickname</code>
          </>
        }
        zh={
          <>
            和 <code>m?.nickname</code> 完全等价
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
            Some other languages work that way. In TypeScript,{" "}
            <code>!</code> disappears during compilation and generates no check
            at all.
          </>
        }
        zh={
          <>
            有些别的语言是这样,但 TypeScript 的 <code>!</code>{" "}
            在编译时就消失了,不会生成任何检查代码。
          </>
        }
      />,
      undefined,
      <T
        key="c"
        en={
          <>
            Substituting a default is what <code>??</code> does.{" "}
            <code>!</code> does not touch the value at all; it only changes what
            the compiler assumes.
          </>
        }
        zh={
          <>
            替换默认值是 <code>??</code> 的事。<code>!</code>{" "}
            完全不碰这个值,它改变的只是编译器的假设。
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            Not at all. <code>?.</code> compiles to a real null check.{" "}
            <code>!</code> compiles to nothing.
          </>
        }
        zh={
          <>
            差得远。<code>?.</code> 会编译成真实的判空检查;
            <code>!</code> 编译后什么都不剩。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            <code>!</code> is a compile-time claim. It removes the error and
            adds no protection. If the claim is wrong, you get a{" "}
            <code>TypeError</code> at runtime, and this time the compiler never
            warned you. Rule: if <code>?.</code> or <code>??</code> can express
            it, use them.
          </>
        }
        zh={
          <>
            <code>!</code> 是一句编译期的断言。它让报错消失,
            但不增加任何保护。断言错了,运行时照样是{" "}
            <code>TypeError</code>,而且这次编译器完全没有提醒过你。
            规矩:能用 <code>?.</code> 或 <code>??</code> 表达的,就用它们。
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
            <code>const sugar = order.sugar || 50;</code> — the customer asked
            for 0% sugar, so <code>order.sugar</code> is <code>0</code>. What is{" "}
            <code>sugar</code>?
          </>
        }
        zh={
          <>
            <code>const sugar = order.sugar || 50;</code> —— 顾客点的是 0%
            糖,也就是 <code>order.sugar</code> 为 <code>0</code>。
            <code>sugar</code> 的值是多少?
          </>
        }
      />
    ),
    opts: [
      <T
        key="a"
        en={
          <>
            <code>0</code> — the customer&apos;s choice is kept
          </>
        }
        zh={
          <>
            <code>0</code> —— 顾客的选择被保留
          </>
        }
      />,
      <T
        key="b"
        en={
          <>
            <code>50</code> — <code>||</code> treated <code>0</code> as
            &quot;not set&quot;
          </>
        }
        zh={
          <>
            <code>50</code> —— <code>||</code> 把 <code>0</code>{" "}
            当成了「没填」
          </>
        }
      />,
      <code key="c">undefined</code>,
      <T
        key="d"
        en={
          <>
            It does not compile; <code>||</code> cannot be used on numbers
          </>
        }
        zh={
          <>
            编译报错,<code>||</code> 不能用在 number 上
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
            That is what you want, but <code>||</code> tests truthiness and{" "}
            <code>0</code> is falsy, so it is replaced. Use <code>??</code> to
            get this behaviour.
          </>
        }
        zh={
          <>
            这是你想要的结果,但 <code>||</code> 判断的是真值,而{" "}
            <code>0</code> 是 falsy,所以它被替换掉了。
            想要这个效果,用 <code>??</code>。
          </>
        }
      />,
      undefined,
      <T
        key="c"
        en={
          <>
            <code>||</code> always returns one of its two operands. The left
            side is falsy, so it returns the right side: <code>50</code>.
          </>
        }
        zh={
          <>
            <code>||</code> 总会返回两个操作数之一。左边是 falsy,
            所以返回右边,也就是 <code>50</code>。
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            This is valid JavaScript and valid TypeScript. The compiler cannot
            catch a logic problem like this one.
          </>
        }
        zh={
          <>
            这是合法的 JavaScript,也是合法的 TypeScript。
            这种逻辑问题,编译器捕捉不到。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            <code>||</code> tests truthiness, so <code>0</code> and{" "}
            <code>&quot;&quot;</code> are replaced as well. <code>??</code>{" "}
            tests only for <code>null</code> and <code>undefined</code>. For a
            default value, use <code>??</code>.
          </>
        }
        zh={
          <>
            <code>||</code> 判断的是真值,所以 <code>0</code> 和{" "}
            <code>&quot;&quot;</code> 也会被替换;<code>??</code> 只认{" "}
            <code>null</code> 和 <code>undefined</code>。
            写默认值,用 <code>??</code>。
          </>
        }
      />
    ),
  },
];
