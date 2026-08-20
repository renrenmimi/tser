"use client";

// 终章 · 类型思维 —— 动手任务 LABS + 总测验 QUIZ 数据(双语)。
// 总测验横跨全书 12 章;每个错误选项都有针对性纠错,并注明回看章节。
//
// 代码示例:可执行行在两种语言里逐字节相同,只有注释分 en / zh;
// 因此 hl 行号在两种语言下一致。编译器报错原文一律不翻译。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import type { Loc } from "@/lib/i18n";
import { CodeBlock } from "@/lib/code";

/* ---------- LAB 01 ---------- */

const TRIO_RESULT: Loc<string> = {
  en: `interface Config {
  shop: string;
  theme: "light" | "dark";
  maxSugar: number;
}

const config = {
  shop: "Sunrise Tea",
  theme: "dark",
  maxSugar: 7,
} satisfies Config;

// misspell theme as thema  -> annotation: error / as: accepted / satisfies: error
// delete maxSugar          -> annotation: error / as: accepted / satisfies: error
// hover config.theme       -> annotation: "light" | "dark"
//                             as          "light" | "dark"
//                             satisfies   "dark"   <- only this one keeps it`,
  zh: `interface Config {
  shop: string;
  theme: "light" | "dark";
  maxSugar: number;
}

const config = {
  shop: "Sunrise Tea",
  theme: "dark",
  maxSugar: 7,
} satisfies Config;

// 把 theme 拼成 thema  -> 注解:报错 / as:放行 / satisfies:报错
// 删掉 maxSugar        -> 注解:报错 / as:放行 / satisfies:报错
// 悬停 config.theme    -> 注解      "light" | "dark"
//                         as        "light" | "dark"
//                         satisfies "dark"   <- 只有它保住了字面量`,
};

/* ---------- LAB 02 ---------- */

const IS_ORDER_FULL: Loc<string> = {
  en: `interface Order {
  id: string;
  total: number;
  toppings: string[];
}

function isOrder(x: unknown): x is Order {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.total === "number" &&
    Array.isArray(o.toppings) &&
    o.toppings.every((t) => typeof t === "string")
  );
}

const good: unknown =
  JSON.parse('{"id":"A-1","total":30,"toppings":["boba"]}');
const bad: unknown =
  JSON.parse('{"id":"A-2","total":"30","toppings":[1]}');

console.log(isOrder(good)); // true  -> narrowed to Order, allowed through
console.log(isOrder(bad));  // false -> stopped here, total is a string`,
  zh: `interface Order {
  id: string;
  total: number;
  toppings: string[];
}

function isOrder(x: unknown): x is Order {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.total === "number" &&
    Array.isArray(o.toppings) &&
    o.toppings.every((t) => typeof t === "string")
  );
}

const good: unknown =
  JSON.parse('{"id":"A-1","total":30,"toppings":["boba"]}');
const bad: unknown =
  JSON.parse('{"id":"A-2","total":"30","toppings":[1]}');

console.log(isOrder(good)); // true  -> 收窄成 Order,放行
console.log(isOrder(bad));  // false -> 拦在这里,total 是字符串`,
};

/* ---------- LAB 03 ---------- */

const MY_OMIT_CASES: Loc<string> = {
  en: `type Case1 = MyOmit<{ a: 1; b: 2; c: 3 }, "a">;
//   expected: { b: 2; c: 3 }
type Case2 = MyOmit<Order, "toppings" | "total">;
//   expected: only id is left`,
  zh: `type Case1 = MyOmit<{ a: 1; b: 2; c: 3 }, "a">;
//   期望:{ b: 2; c: 3 }
type Case2 = MyOmit<Order, "toppings" | "total">;
//   期望:只剩 id`,
};

const MY_OMIT_SOLUTION: Loc<string> = {
  en: `// Version 1: key remapping (TS 4.1, the one shown in section 06)
type MyOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

// Version 2: filter the keys first, then map (Exclude is a conditional type)
type MyOmit2<T, K extends keyof T> = {
  [P in Exclude<keyof T, K>]: T[P];
};`,
  zh: `// 写法一:键重映射(TS 4.1,§06 讲的版本)
type MyOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

// 写法二:先过滤键,再映射(Exclude 是第 07 章的条件类型)
type MyOmit2<T, K extends keyof T> = {
  [P in Exclude<keyof T, K>]: T[P];
};`,
};

/* ---------- LAB 04 ---------- */

const DEEP_READONLY: Loc<string> = {
  en: `type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends (...args: never[]) => unknown
      ? T[K]              // a function: leave it alone, do not recurse
      : DeepReadonly<T[K]> // an object: keep going down
    : T[K];               // a primitive: nothing left to lock
};

declare const cfg: DeepReadonly<{
  shop: string;
  hours: { open: number; close: number };
}>;
cfg.hours.open = 8;
// Cannot assign to 'open' because it is a read-only property.`,
  zh: `type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends (...args: never[]) => unknown
      ? T[K]              // 是函数:放过,不再往里递归
      : DeepReadonly<T[K]> // 是对象:继续往下锁
    : T[K];               // 是原始值:锁到头了
};

declare const cfg: DeepReadonly<{
  shop: string;
  hours: { open: number; close: number };
}>;
cfg.hours.open = 8;
// Cannot assign to 'open' because it is a read-only property.`,
};

export const LABS: Lab[] = [
  {
    id: "trio-bench",
    title: {
      en: "The three forms side by side: run all nine cases yourself",
      zh: "三种写法同台:九个格子亲手填一遍",
    },
    d: "easy",
    tags: {
      en: ["satisfies", "as", "Playground"],
      zh: ["satisfies", "as", "Playground"],
    },
    task: {
      en: (
        <>
          <p>
            Open typescriptlang.org/play. Paste in the <code>Config</code>{" "}
            interface and the config object from section 01, then run three
            rounds: (1) with the annotation <code>: Config</code>, (2) with{" "}
            <code>as Config</code>, (3) with <code>satisfies Config</code>. In
            each round, break the object twice: misspell <code>theme</code> as{" "}
            <code>thema</code>, and delete <code>maxSugar</code>. Write down
            which form reports an error and which one accepts it. Then restore
            the correct object and hover over <code>config.theme</code> to see
            what each form infers.
          </p>
        </>
      ),
      zh: (
        <>
          <p>
            打开 typescriptlang.org/play,把 §01 的 <code>Config</code>{" "}
            和配置对象粘进去,然后做三轮:① 用 <code>: Config</code> 注解 ② 用{" "}
            <code>as Config</code> ③ 用 <code>satisfies Config</code>。
            每一轮都把对象弄坏两次:把 <code>theme</code> 拼成{" "}
            <code>thema</code>、删掉 <code>maxSugar</code>,
            记下哪种写法报错、哪种放行。最后恢复正确的对象,
            悬停 <code>config.theme</code>,看三种写法各推断出什么。
          </p>
        </>
      ),
    },
    hint: {
      en: (
        <>
          You are filling in a table with nine cells: three forms multiplied by
          three questions (misspelled key, missing key, inferred type). It
          should match the three traffic lights in section 01 exactly. If one
          cell disagrees, look again before moving on.
        </>
      ),
      zh: (
        <>
          你在填一张九格表:三种写法 × 三个问题(拼错的键、缺失的键、
          推断出的类型)。填完应该和 §01 的三盏灯完全一致。
          有一格对不上,先弄清楚再往下走。
        </>
      ),
    },
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title={{
            en: "What you should have found",
            zh: "你应该得到的结论",
          }}
          code={TRIO_RESULT}
          note={{
            en: (
              <>
                One more experiment: change the last line to{" "}
                <code>{"} as const satisfies Config;"}</code> and hover again.
                Every property is now <code>readonly</code>, every literal
                keeps its exact type, and the shape is still checked against{" "}
                <code>Config</code>. That combination is the usual way to
                write a configuration object.
              </>
            ),
            zh: (
              <>
                再做一个实验:把最后一行改成{" "}
                <code>{"} as const satisfies Config;"}</code> 再悬停。
                这时每个属性都是 <code>readonly</code>,每个字面量都保留精确
                类型,形状仍然按 <code>Config</code> 校验 ——
                配置对象通常就这么写。
              </>
            ),
          }}
        />
      </>
    ),
  },
  {
    id: "order-guard",
    title: {
      en: "Write an Order validator and guard the boundary",
      zh: "手写 Order 校验器,把边界守起来",
    },
    d: "medium",
    tags: {
      en: ["unknown", "type predicate", "boundary"],
      zh: ["unknown", "类型谓词", "边界"],
    },
    task: {
      en: (
        <>
          <p>
            In the Playground, declare{" "}
            <code>
              {
                "interface Order { id: string; total: number; toppings: string[] }"
              }
            </code>
            . Then write <code>isOrder(x: unknown): x is Order</code> by hand.
            Check every field, <b>including whether toppings is an array of
            strings</b>. <code>Array.isArray</code> alone is not enough, because
            it says nothing about the elements.
          </p>
          <p>
            Test it with two values:{" "}
            <code>{`JSON.parse('{"id":"A-1","total":30,"toppings":["boba"]}')`}</code>{" "}
            should pass, and{" "}
            <code>{`JSON.parse('{"id":"A-2","total":"30","toppings":[1]}')`}</code>{" "}
            should be rejected.
          </p>
        </>
      ),
      zh: (
        <>
          <p>
            在 Playground 里声明{" "}
            <code>
              {
                "interface Order { id: string; total: number; toppings: string[] }"
              }
            </code>
            ,然后手写 <code>isOrder(x: unknown): x is Order</code>,
            逐个字段检查,<b>包括 toppings 是不是「字符串数组」</b>。
            光用 <code>Array.isArray</code> 不够,它不说明元素是什么。
          </p>
          <p>
            用两份数据自测:
            <code>{`JSON.parse('{"id":"A-1","total":30,"toppings":["boba"]}')`}</code>{" "}
            应该通过;
            <code>{`JSON.parse('{"id":"A-2","total":"30","toppings":[1]}')`}</code>{" "}
            应该被拦下。
          </p>
        </>
      ),
    },
    hint: {
      en: (
        <>
          The pattern for arrays: <code>Array.isArray(o.toppings)</code> first,
          then{" "}
          <code>{'o.toppings.every((t) => typeof t === "string")'}</code> for
          the elements. Since TypeScript 5.5 the compiler can infer a type
          predicate for that arrow function on its own, so{" "}
          <code>every</code> narrows the array to <code>string[]</code>.
        </>
      ),
      zh: (
        <>
          数组的套路:先 <code>Array.isArray(o.toppings)</code> 确认是数组,
          再 <code>{'o.toppings.every((t) => typeof t === "string")'}</code>{" "}
          检查元素。TypeScript 5.5 起,编译器能自己给这个箭头函数推断出类型谓词,
          所以 <code>every</code> 之后数组会被收窄成 <code>string[]</code>。
        </>
      ),
    },
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title={{ en: "isOrder, full version", zh: "isOrder · 完整版" }}
          hl={[7, 11]}
          code={IS_ORDER_FULL}
          note={{
            en: (
              <>
                In the second value <code>total</code> is the string{" "}
                <code>{'"30"'}</code>, not the number 30. Data that is wrong
                by only one detail is the most common kind in production.{" "}
                <code>as</code> would let it in. A validator does not.
              </>
            ),
            zh: (
              <>
                第二份数据的 <code>total</code> 是字符串{" "}
                <code>{'"30"'}</code>,不是数字 30。
                线上最常见的坏数据就是这种「只差一点点」的。
                <code>as</code> 会放它进来,校验函数不会。
              </>
            ),
          }}
        />
      </>
    ),
  },
  {
    id: "my-omit",
    title: {
      en: "First exercise: implement MyOmit without looking",
      zh: "第一道体操:不看答案实现 MyOmit",
    },
    d: "medium",
    tags: {
      en: ["mapped types", "key remapping", "type-challenges"],
      zh: ["映射类型", "键重映射", "type-challenges"],
    },
    task: {
      en: (
        <>
          <p>
            In the Playground, implement <code>MyOmit&lt;T, K&gt;</code>{" "}
            yourself. <b>Do not use the built-in Omit and do not scroll back to
            section 06.</b> Use these two lines to check your work:
          </p>
          <CodeBlock lang="ts" code={MY_OMIT_CASES} />
          <p>
            Give it ten minutes before you open the hint. The time you spend
            stuck is the time you actually learn.
          </p>
        </>
      ),
      zh: (
        <>
          <p>
            在 Playground 里自己实现 <code>MyOmit&lt;T, K&gt;</code>。
            <b>不要用内置的 Omit,也不要回看 §06。</b>用这两行验收:
          </p>
          <CodeBlock lang="ts" code={MY_OMIT_CASES} />
          <p>卡住十分钟以上再看提示 —— 卡住的时间就是长本事的时间。</p>
        </>
      ),
    },
    hint: {
      en: (
        <>
          There are two routes. (1) Key remapping:{" "}
          <code>[P in keyof T as …]</code>, mapping every key on the exclusion
          list to <code>never</code>. (2) Filter <code>keyof T</code> with{" "}
          <code>Exclude</code> first, then map over what is left. Write both.
          Only then have you really understood it.
        </>
      ),
      zh: (
        <>
          两条路:① 键重映射 <code>[P in keyof T as …]</code>,
          把黑名单上的键映射成 <code>never</code>;② 先用{" "}
          <code>Exclude</code> 过滤 <code>keyof T</code>,再映射剩下的键。
          两种都写出来,才算真懂。
        </>
      ),
    },
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title={{ en: "Two ways to write it", zh: "两种写法" }}
          code={MY_OMIT_SOLUTION}
          note={{
            en: (
              <>
                The two versions behave the same. The second one shows how the
                standard library actually defines it:{" "}
                <code>{"Pick<T, Exclude<keyof T, K>>"}</code>. Submit your
                version to problem 3 (Omit) on type-challenges and see whether
                the test cases find an edge you missed.
              </>
            ),
            zh: (
              <>
                两种写法行为相同。第二种更接近标准库的真实定义:
                <code>{"Pick<T, Exclude<keyof T, K>>"}</code>。
                去 type-challenges 的第 3 题(Omit)提交你的版本,
                看看测试用例能不能找出你漏掉的边角。
              </>
            ),
          }}
        />
      </>
    ),
  },
  {
    id: "deep-readonly",
    title: {
      en: "Second exercise: DeepReadonly, then keep going on your own",
      zh: "第二道体操:DeepReadonly,然后自己上路",
    },
    d: "hard",
    tags: {
      en: ["recursion", "conditional types", "type-challenges"],
      zh: ["递归", "条件类型", "type-challenges"],
    },
    task: {
      en: (
        <>
          <p>
            Implement <code>DeepReadonly&lt;T&gt;</code> in the Playground:
            every property, at every level of nesting, becomes{" "}
            <code>readonly</code>. To check it, take a config object nested two
            levels deep and try to assign to the innermost field. That
            assignment must be an error. When it works, go to{" "}
            <b>github.com/type-challenges/type-challenges</b> and do three
            problems from the easy set. Pick, Readonly, and Tuple to Object are
            good first ones. Each problem ships with test cases, so you get an
            answer immediately.
          </p>
        </>
      ),
      zh: (
        <>
          <p>
            在 Playground 实现 <code>DeepReadonly&lt;T&gt;</code>:
            对象每一层的每个属性都变成 <code>readonly</code>。
            验收方法:拿一个嵌套两层的配置对象,给最里层的字段赋值 ——
            这一行必须报错。做完这道,去{" "}
            <b>github.com/type-challenges/type-challenges</b> 的 easy
            区做三道,推荐 Pick、Readonly、Tuple to Object。
            每道题自带测试用例,当场就有结果。
          </p>
        </>
      ),
    },
    hint: {
      en: (
        <>
          The skeleton: a mapped type with a <code>readonly</code> modifier, and
          a conditional type for the property type. If the property is an
          object, recurse with <code>DeepReadonly&lt;T[K]&gt;</code>; otherwise
          keep it as it is. Watch out for functions: a function is also an
          object, so add one more <code>extends</code> check if you want to
          leave functions alone.
        </>
      ),
      zh: (
        <>
          骨架:一个带 <code>readonly</code> 修饰符的映射类型,
          属性类型走条件类型 —— 是对象就递归{" "}
          <code>DeepReadonly&lt;T[K]&gt;</code>,不是就原样保留。
          小心函数:函数也是对象,想放过它,就再加一层{" "}
          <code>extends</code> 判断。
        </>
      ),
    },
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title={{
            en: "DeepReadonly, course version",
            zh: "DeepReadonly · 课程版",
          }}
          hl={[2, 3]}
          code={DEEP_READONLY}
          note={{
            en: (
              <>
                The official type-challenges tests ask for more: arrays and
                tuples have their own rules. Submit your version, read the
                failing test, and fix it. That loop teaches more than the
                finished answer does.
              </>
            ),
            zh: (
              <>
                type-challenges 的官方判题要求更细 —— 数组和元组还有各自的
                规则。提交你的版本,读失败的测试用例,再改。
                这个循环比现成答案更有用。
              </>
            ),
          }}
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
          What does TypeScript infer for{" "}
          <code>let a = &quot;Oolong Tea&quot;;</code> and{" "}
          <code>const b = &quot;Oolong Tea&quot;;</code>?
        </>
      ),
      zh: (
        <>
          <code>let a = &quot;Oolong Tea&quot;;</code> 和{" "}
          <code>const b = &quot;Oolong Tea&quot;;</code>,TypeScript
          分别推断出什么类型?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            a and b are both <code>string</code>
          </>
        ),
        zh: (
          <>
            a 和 b 都是 <code>string</code>
          </>
        ),
      },
      {
        en: (
          <>
            a is <code>string</code>, b is the literal type{" "}
            <code>&quot;Oolong Tea&quot;</code>
          </>
        ),
        zh: (
          <>
            a 是 <code>string</code>,b 是字面量类型{" "}
            <code>&quot;Oolong Tea&quot;</code>
          </>
        ),
      },
      {
        en: (
          <>
            a and b are both <code>&quot;Oolong Tea&quot;</code>
          </>
        ),
        zh: (
          <>
            a 和 b 都是 <code>&quot;Oolong Tea&quot;</code>
          </>
        ),
      },
      {
        en: (
          <>
            a is <code>&quot;Oolong Tea&quot;</code>, b is <code>string</code>
          </>
        ),
        zh: (
          <>
            a 是 <code>&quot;Oolong Tea&quot;</code>,b 是 <code>string</code>
          </>
        ),
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            Look at b again. A <code>const</code> binding can never be assigned
            again, so the compiler has no reason to widen it. Inference stops at
            the literal type <code>&quot;Oolong Tea&quot;</code>.
          </>
        ),
        zh: (
          <>
            再想想 b。<code>const</code> 绑定不会被重新赋值,
            编译器没有理由拓宽它,推断停在字面量类型{" "}
            <code>&quot;Oolong Tea&quot;</code>。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            a is declared with <code>let</code>, so a different string may be
            assigned later. The compiler widens it to <code>string</code>,
            otherwise you could never change it.
          </>
        ),
        zh: (
          <>
            a 用 <code>let</code> 声明,以后可能被赋成别的字符串。
            编译器把它拓宽成 <code>string</code>,不然你连改都改不了。
          </>
        ),
      },
      {
        en: (
          <>
            That is the two cases swapped. <code>let</code> widens,{" "}
            <code>const</code> keeps the literal. Whether the binding can change
            decides how wide the inferred type is.
          </>
        ),
        zh: (
          <>
            正好说反了:<code>let</code> 拓宽,<code>const</code> 保留字面量。
            「会不会被改」决定「推得多宽」。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          A <code>let</code> binding can be reassigned, so inference widens to{" "}
          <code>string</code>. A <code>const</code> binding cannot, so inference
          keeps the literal type. This is also where the name{" "}
          <code>as const</code> comes from: infer this the way you would infer a{" "}
          <code>const</code>. Chapter 01 covers it.
        </>
      ),
      zh: (
        <>
          <code>let</code> 可以再赋值,推断拓宽成 <code>string</code>;
          <code>const</code> 不能,推断保留字面量类型。
          <code>as const</code> 的名字也是这么来的:「像 const 一样推断」。
          —— 回看第 01 章。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          An order status is modelled as a discriminated union, and the{" "}
          <code>default</code> branch of the switch contains{" "}
          <code>const x: never = order;</code>. Three months later someone adds
          a new status, <code>&quot;refunded&quot;</code>. What happens?
        </>
      ),
      zh: (
        <>
          订单状态用可辨识联合建模,switch 的 <code>default</code> 分支里写了{" "}
          <code>const x: never = order;</code>。三个月后新增状态{" "}
          <code>&quot;refunded&quot;</code>,会发生什么?
        </>
      ),
    },
    opts: [
      {
        en: <>Nothing. The new status quietly falls through to default</>,
        zh: <>什么都不会发生,新状态自动走 default</>,
      },
      {
        en: (
          <>
            A compile error. The refunded member is not narrowed away, so it
            cannot be assigned to <code>never</code>, and the compiler makes you
            add the case
          </>
        ),
        zh: (
          <>
            编译报错:refunded 那个成员没有被收窄掉,赋不给{" "}
            <code>never</code> —— 编译器逼你补上这个 case
          </>
        ),
      },
      {
        en: <>A NeverError is thrown at runtime</>,
        zh: <>运行时抛出 NeverError</>,
      },
      {
        en: <>The whole switch statement stops working</>,
        zh: <>switch 语句整个失效</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            That is what happens when there is no exhaustiveness check: the new
            status is swallowed and the page renders blank with no explanation.
            The <code>never</code> assignment exists to break that silence.
          </>
        ),
        zh: (
          <>
            那是没有穷尽检查时的情况:新状态被静默吞掉,
            页面显示成一片空白,没人知道为什么。
            那行 <code>never</code> 赋值就是为了打破这种沉默。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            <code>never</code> exists only at compile time. Types are erased, so
            there is no trace of it at runtime. Its entire job is to move the
            error to compile time.
          </>
        ),
        zh: (
          <>
            <code>never</code> 只存在于编译期。类型被擦除,
            运行时找不到它的任何痕迹。它的全部作用就是把错误提前到编译期。
          </>
        ),
      },
      {
        en: (
          <>
            The switch is fine. The error appears on that one{" "}
            <code>never</code> assignment, which is exactly the design: one line
            guards every branch.
          </>
        ),
        zh: (
          <>
            switch 本身没问题。报错只出现在那一行 <code>never</code> 赋值上 ——
            这正是设计目的:一行代码守住所有分支。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          This is an exhaustiveness check. When every member of the union has
          been handled, what reaches the default branch is narrowed to{" "}
          <code>never</code>, and assigning it to <code>never</code> is legal.
          Miss one member and that member is still there, so the assignment
          fails. The moment a new status is added, every switch that does not
          handle it reports an error. Chapter 03 covers it.
        </>
      ),
      zh: (
        <>
          这是穷尽检查(exhaustiveness check):联合的成员全部处理完之后,
          走到 default 的值被收窄成 <code>never</code>,赋给{" "}
          <code>never</code> 合法;漏了一个,那个成员还在,赋值就失败。
          新增状态的那一刻,所有没处理它的 switch 一起报错。—— 回看第 03 章。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          <code>{'order({ size: "large", ice: "none" })'}</code> reports that{" "}
          <code>ice</code> does not exist, but storing the same object in a
          variable first and passing the variable compiles. Why?
        </>
      ),
      zh: (
        <>
          <code>{'order({ size: "large", ice: "none" })'}</code> 报错说{" "}
          <code>ice</code> 不存在,但先把同一个对象存进变量再传就通过了。
          为什么?
        </>
      ),
    },
    opts: [
      {
        en: <>Variables have higher priority, so the check is skipped</>,
        zh: <>变量优先级更高,检查被跳过了</>,
      },
      {
        en: (
          <>
            An object literal passed directly is &quot;fresh&quot;, so it gets
            the excess property check. Once it is in a variable, only ordinary
            structural compatibility applies, and extra properties are allowed
          </>
        ),
        zh: (
          <>
            直接传的对象字面量是「新鲜」的,要做多余属性检查;
            存进变量之后只按普通的结构兼容判断,多出来的属性不追究
          </>
        ),
      },
      {
        en: <>This is a TypeScript bug, fixed in a later version</>,
        zh: <>这是 TypeScript 的 bug,新版本已修复</>,
      },
      {
        en: (
          <>
            Objects declared with <code>const</code> are not type checked at all
          </>
        ),
        zh: (
          <>
            用 <code>const</code> 声明的对象不做任何类型检查
          </>
        ),
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            There is no priority involved. The two cases run different checks: a
            fresh literal gets one extra check on top of the normal structural
            comparison.
          </>
        ),
        zh: (
          <>
            没有「优先级」这回事。两种情况走的检查不同:
            新鲜的字面量在普通结构比较之外,多受一道检查。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            It is deliberate. An extra property on a literal written right at
            the call site is almost always a typo or a misunderstanding, so it
            is worth reporting. A variable may be used elsewhere for other
            purposes, so extra properties are fine.
          </>
        ),
        zh: (
          <>
            这是刻意设计:在调用处现写的字面量,多出来的属性几乎都是拼错
            或误解,值得报出来;变量可能在别处另有用途,多几个属性是合法的。
          </>
        ),
      },
      {
        en: (
          <>
            A <code>const</code> object is fully type checked. The only check it
            does not get is the excess property check. Structural compatibility
            still applies, so a missing property is still an error.
          </>
        ),
        zh: (
          <>
            <code>const</code> 对象的类型检查一点不少,少的只是多余属性检查
            这一项。结构兼容仍然生效:少了属性照样报错。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          The excess property check only applies to a fresh object literal, at
          the moment it is assigned or passed directly. Store it in a variable
          first and TypeScript falls back to structural compatibility: if the
          shape covers what is required, it is accepted. Chapter 04 covers it.
        </>
      ),
      zh: (
        <>
          多余属性检查(excess property check)只对「新鲜」的对象字面量生效 ——
          直接赋值、直接传参的那一刻查。先存进变量,TypeScript
          就退回普通的结构兼容:形状够用就放行。—— 回看第 04 章。
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
          , which call is an error?
        </>
      ),
      zh: (
        <>
          <code>
            {"function longest<T extends { length: number }>(a: T, b: T): T"}
          </code>
          ,下面哪个调用会报错?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            <code>{'longest("Oolong Tea", "Mango Sago")'}</code>
          </>
        ),
        zh: (
          <>
            <code>{'longest("Oolong Tea", "Mango Sago")'}</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>longest([1, 2, 3], [4, 5])</code>
          </>
        ),
        zh: (
          <>
            <code>longest([1, 2, 3], [4, 5])</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>longest(15, 12)</code>
          </>
        ),
        zh: (
          <>
            <code>longest(15, 12)</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>{"longest({ length: 3 }, { length: 7 })"}</code>
          </>
        ),
        zh: (
          <>
            <code>{"longest({ length: 3 }, { length: 7 })"}</code>
          </>
        ),
      },
    ],
    correct: 2,
    wrong: [
      {
        en: (
          <>
            A string has a <code>length</code> property, so the constraint is
            satisfied and T is inferred as <code>string</code>. This call is
            fine.
          </>
        ),
        zh: (
          <>
            字符串有 <code>length</code> 属性,约束满足,T 推断成{" "}
            <code>string</code>。这个调用合法。
          </>
        ),
      },
      {
        en: (
          <>
            An array has <code>length</code> too. T is inferred as{" "}
            <code>number[]</code>. This call is fine.
          </>
        ),
        zh: (
          <>
            数组也有 <code>length</code>,T 推断成 <code>number[]</code>。
            这个调用合法。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            The object literally has <code>length: number</code> in its shape.
            TypeScript compares shapes, not names, so anything that provides{" "}
            <code>length</code> satisfies the constraint.
          </>
        ),
        zh: (
          <>
            这个对象的形状里明写着 <code>length: number</code>。
            TypeScript 比较形状而不是名字,谁提供了 <code>length</code>{" "}
            谁就满足约束。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>extends {"{ length: number }"}</code> is the constraint on the
          type parameter: whatever is passed in must have a{" "}
          <code>length</code> property of type <code>number</code>. A number has
          no <code>length</code>, so the call is rejected. Chapter 05 covers it.
        </>
      ),
      zh: (
        <>
          <code>extends {"{ length: number }"}</code> 是类型参数的约束:
          传进来的类型必须有一个 <code>number</code> 类型的{" "}
          <code>length</code> 属性。number 没有 <code>length</code>,
          调用被拦下。—— 回看第 05 章。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          You are adding drafts: a half-filled Order must also be saveable, and
          every field may be empty for now. Which utility type is meant for
          this?
        </>
      ),
      zh: (
        <>
          要做草稿功能:没填完的 Order 也要能保存,每个字段都允许先空着。
          哪个工具类型是为这件事准备的?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            <code>Partial&lt;Order&gt;</code>
          </>
        ),
        zh: (
          <>
            <code>Partial&lt;Order&gt;</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>Required&lt;Order&gt;</code>
          </>
        ),
        zh: (
          <>
            <code>Required&lt;Order&gt;</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>Readonly&lt;Order&gt;</code>
          </>
        ),
        zh: (
          <>
            <code>Readonly&lt;Order&gt;</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>{'Pick<Order, "id">'}</code>
          </>
        ),
        zh: (
          <>
            <code>{'Pick<Order, "id">'}</code>
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
            <code>Required</code> goes the other way: it makes every optional
            field mandatory. That is useful for a final check before submitting,
            not for saving a draft.
          </>
        ),
        zh: (
          <>
            <code>Required</code> 方向相反:它把所有可选字段变成必填。
            那是提交前做最后校验用的,不是保存草稿用的。
          </>
        ),
      },
      {
        en: (
          <>
            <code>Readonly</code> controls whether a field can be changed, not
            whether it can be missing. A draft is exactly the thing you keep
            changing.
          </>
        ),
        zh: (
          <>
            <code>Readonly</code> 管的是「能不能改」,不是「能不能空」。
            草稿恰恰是要反复改的。
          </>
        ),
      },
      {
        en: (
          <>
            <code>Pick</code> builds a new type from a few chosen fields. A
            draft is not &quot;only id&quot;. It is &quot;every field may be
            missing for now&quot;.
          </>
        ),
        zh: (
          <>
            <code>Pick</code> 是挑几个字段组成新类型。草稿不是「只剩 id」,
            而是「每个字段都可以先没有」。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>Partial&lt;Order&gt;</code> adds <code>?</code> to every field,
          which is exactly the definition of a draft. Its own definition is a
          single mapped type:{" "}
          <code>{"{ [K in keyof T]?: T[K] }"}</code>. Chapter 06 covers using
          it, and chapter 07 covers how it is built.
        </>
      ),
      zh: (
        <>
          <code>Partial&lt;Order&gt;</code> 给每个字段加上 <code>?</code> ——
          「所有字段都可以缺席」正是草稿的定义。它自己的实现只有一行映射类型:
          <code>{"{ [K in keyof T]?: T[K] }"}</code>。
          —— 回看第 06 章;想看它怎么造出来的,回看第 07 章。
        </>
      ),
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          <code>{"const MENU = { oolong: 12, mango: 22 } as const;"}</code>
          <br />
          <code>type Name = keyof typeof MENU;</code> — what is{" "}
          <code>Name</code>? Join the members with <code>|</code>.
        </>
      ),
      zh: (
        <>
          <code>{"const MENU = { oolong: 12, mango: 22 } as const;"}</code>
          <br />
          <code>type Name = keyof typeof MENU;</code> —— <code>Name</code>{" "}
          是什么类型?用 <code>|</code> 连接。
        </>
      ),
    },
    placeholder: { en: 'for example "a" | "b"', zh: '例如 "a" | "b"' },
    answers: [
      '"oolong" | "mango"',
      '"mango" | "oolong"',
      "oolong | mango",
      "mango | oolong",
    ],
    hint: {
      en: (
        <>
          Two steps. <code>typeof MENU</code> takes the object type from the
          value. <code>keyof</code> then turns its keys into a union. The keys
          here are the two drink names.
        </>
      ),
      zh: (
        <>
          两步:<code>typeof MENU</code> 先从值取出对象类型,
          <code>keyof</code> 再把它的键变成联合。这里的键是两个饮品名。
        </>
      ),
    },
    why: {
      en: (
        <>
          <code>typeof</code> in type position reads a type out of a value, and{" "}
          <code>keyof</code> collects the keys into a union:{" "}
          <code>{'"oolong" | "mango"'}</code>. The menu is written once, and the
          type of a name grows out of it. Change the menu and the type follows.
          Chapter 07 covers it.
        </>
      ),
      zh: (
        <>
          <code>typeof</code>(用在类型位置)从值里取出类型,
          <code>keyof</code> 再把键收成联合:
          <code>{'"oolong" | "mango"'}</code>。菜单只写一遍,
          名字的类型从菜单里长出来;菜单改了,类型跟着改。—— 回看第 07 章。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Under <code>strict</code>, what is the type of <code>e</code> in{" "}
          <code>catch (e)</code>, and why?
        </>
      ),
      zh: (
        <>
          开着 <code>strict</code> 时,<code>catch (e)</code> 里的{" "}
          <code>e</code> 是什么类型?为什么?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            <code>Error</code> — what else could you catch
          </>
        ),
        zh: (
          <>
            <code>Error</code> —— 抓到的当然是错误对象
          </>
        ),
      },
      {
        en: (
          <>
            <code>any</code> — the source is unknown, so nothing can be checked
          </>
        ),
        zh: (
          <>
            <code>any</code> —— 来源不明,只能放开
          </>
        ),
      },
      {
        en: (
          <>
            <code>unknown</code> — anything can be thrown, so narrow it before
            using it
          </>
        ),
        zh: (
          <>
            <code>unknown</code> —— 什么都可能被 throw,先收窄再用
          </>
        ),
      },
      {
        en: (
          <>
            <code>never</code> — a normal run should not reach catch
          </>
        ),
        zh: (
          <>
            <code>never</code> —— 正常流程不该走到 catch
          </>
        ),
      },
    ],
    correct: 2,
    wrong: [
      {
        en: (
          <>
            JavaScript allows throwing any value: a string, a number,{" "}
            <code>undefined</code>. What you catch is not necessarily an{" "}
            <code>Error</code>. To read <code>e.message</code>, narrow first
            with <code>e instanceof Error</code>.
          </>
        ),
        zh: (
          <>
            JavaScript 允许 throw 任何值:字符串、数字、<code>undefined</code>{" "}
            都行,catch 到的未必是 <code>Error</code>。想读{" "}
            <code>e.message</code>,先用 <code>e instanceof Error</code> 收窄。
          </>
        ),
      },
      {
        en: (
          <>
            <code>any</code> was the old behaviour.{" "}
            <code>useUnknownInCatchVariables</code>, part of the strict family,
            changed it to <code>unknown</code>.
          </>
        ),
        zh: (
          <>
            <code>any</code> 是旧版本的行为。strict 家族里的{" "}
            <code>useUnknownInCatchVariables</code> 把它改成了{" "}
            <code>unknown</code>。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            <code>never</code> means &quot;there can be no value here&quot;. In
            a catch block there clearly is a value. You just do not know its
            shape, which is what <code>unknown</code> is for.
          </>
        ),
        zh: (
          <>
            <code>never</code> 的意思是「这里不可能有值」。catch
            里明明抓到了一个值,只是不知道它的形状 —— 那是{" "}
            <code>unknown</code> 的岗位。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>useUnknownInCatchVariables</code>, a member of the strict
          family, makes the catch variable <code>unknown</code>: a type-safe way
          of saying &quot;I do not know&quot;. You must narrow before you use
          it, usually with <code>e instanceof Error</code>. Chapter 10 covers
          it.
        </>
      ),
      zh: (
        <>
          <code>useUnknownInCatchVariables</code>(strict 家族成员)让 catch
          变量是 <code>unknown</code>:一种类型安全的「不知道」。
          用之前必须收窄,通常是 <code>e instanceof Error</code>。
          —— 回看第 10 章。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          You are writing a theme config object. You want the compiler to{" "}
          <b>check that it matches Config</b>, and you also want{" "}
          <code>config.theme</code> to keep the literal type{" "}
          <code>&quot;dark&quot;</code> so later checks stay precise. Which form
          do you use?
        </>
      ),
      zh: (
        <>
          写一个主题配置对象:既要编译器<b>校验它符合 Config</b>,
          又要 <code>config.theme</code> 保持字面量类型{" "}
          <code>&quot;dark&quot;</code>,方便后续做精确判断。用哪种写法?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            <code>const config: Config = {"{…}"}</code>
          </>
        ),
        zh: (
          <>
            <code>const config: Config = {"{…}"}</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>const config = {"{…}"} as Config</code>
          </>
        ),
        zh: (
          <>
            <code>const config = {"{…}"} as Config</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>const config = {"{…}"} satisfies Config</code>
          </>
        ),
        zh: (
          <>
            <code>const config = {"{…}"} satisfies Config</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>const config = {"{…}"}</code> with nothing added
          </>
        ),
        zh: (
          <>
            <code>const config = {"{…}"}</code>,什么都不加
          </>
        ),
      },
    ],
    correct: 2,
    wrong: [
      {
        en: (
          <>
            The annotation does check the object, but it also replaces the
            inferred type with <code>Config</code>. So{" "}
            <code>config.theme</code> becomes{" "}
            <code>{'"light" | "dark"'}</code> and you lose the information about
            which one it actually is.
          </>
        ),
        zh: (
          <>
            注解确实会检查这个对象,但它同时把推断结果换成了{" "}
            <code>Config</code>。于是 <code>config.theme</code> 变成{" "}
            <code>{'"light" | "dark"'}</code>,「到底是哪一个」这条信息丢了。
          </>
        ),
      },
      {
        en: (
          <>
            <code>as</code> loses both: a missing field is still accepted (no
            check), and <code>theme</code> is still widened (no precise
            inference).
          </>
        ),
        zh: (
          <>
            <code>as</code> 两头都丢:缺字段照样放行(没有检查),
            <code>theme</code> 照样被拓宽(推断也没保住)。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            With nothing added, inference is precise, but nothing is checked. A
            misspelled or missing field only surfaces where the value is used,
            far from where you wrote it.
          </>
        ),
        zh: (
          <>
            什么都不加,推断确实精确,但没有任何校验:字段拼错、漏写,
            要到使用它的地方才暴露,离你写下它的位置很远。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>satisfies</code> (TypeScript 4.9) checks the shape and keeps the
          inferred literal types. It is the only form that gives you both. The
          summary: an annotation checks but widens, <code>as</code> neither
          checks nor keeps the literal, <code>satisfies</code> does both.
          Section 01 of this chapter covers it.
        </>
      ),
      zh: (
        <>
          <code>satisfies</code>(TypeScript 4.9)校验形状,同时保留推断出的
          字面量类型 —— 只有它两样都给。一句话:注解检查但拓宽,
          <code>as</code> 既不检查也不保留,<code>satisfies</code> 两样都做。
          —— 回看本章 §01。
        </>
      ),
    },
  },
  {
    type: "multi",
    q: {
      en: (
        <>
          Which of these statements about <code>any</code> and{" "}
          <code>unknown</code> are correct? (Choose all that apply.)
        </>
      ),
      zh: (
        <>
          关于 <code>any</code> 和 <code>unknown</code>,下面哪些说法是对的?
          (多选)
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            You cannot call a method or read a property on an{" "}
            <code>unknown</code> value until you narrow it
          </>
        ),
        zh: (
          <>
            <code>unknown</code> 的值在收窄之前不能调方法、不能取属性
          </>
        ),
      },
      {
        en: (
          <>
            <code>any</code> spreads: anything read out of an <code>any</code>{" "}
            value is <code>any</code> as well
          </>
        ),
        zh: (
          <>
            <code>any</code> 会扩散:从 <code>any</code> 值上取出来的东西还是{" "}
            <code>any</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>unknown</code> and <code>any</code> behave the same, only the
            name is different
          </>
        ),
        zh: (
          <>
            <code>unknown</code> 和 <code>any</code> 效果一样,只是名字不同
          </>
        ),
      },
      {
        en: (
          <>
            A local <code>any</code> during a migration is acceptable, as long
            as it does not reach an exported function signature
          </>
        ),
        zh: (
          <>
            迁移期在局部用 <code>any</code> 可以接受,
            只要它不出现在导出的函数签名上
          </>
        ),
      },
      {
        en: (
          <>
            Under <code>strict</code>, JSON returned by <code>fetch</code> gets
            the correct type automatically
          </>
        ),
        zh: (
          <>
            开着 <code>strict</code> 时,<code>fetch</code> 回来的 JSON
            会自动带上正确的类型
          </>
        ),
      },
    ],
    correct: [0, 1, 3],
    missHint: {
      en: (
        <>
          One more is correct. Think about the most damaging property of{" "}
          <code>any</code>: it travels along assignments and property accesses.
          And do not forget the one about keeping it out of exported signatures.
        </>
      ),
      zh: (
        <>
          还漏了一条。想想 <code>any</code> 最麻烦的性质:
          它会顺着赋值和属性访问一路传下去。另外「别进导出签名」那条也别漏。
        </>
      ),
    },
    extraHint: {
      en: (
        <>
          One selection is wrong. Either you treated <code>unknown</code> and{" "}
          <code>any</code> as the same thing (they differ completely in what
          they let you do with the value), or you assumed the compiler knows
          something about runtime data (types are erased, so it does not).
        </>
      ),
      zh: (
        <>
          有一项选多了。要么是把 <code>unknown</code> 和 <code>any</code>{" "}
          当成了一回事(它们对「怎么用这个值」的规定完全不同),
          要么是高估了编译器对运行时数据的了解(类型被擦除了,它管不到)。
        </>
      ),
    },
    why: {
      en: (
        <>
          <code>unknown</code> accepts any value but requires narrowing before
          use. <code>any</code> accepts any value and allows any use, and it
          spreads. The rule of thumb: reach for <code>unknown</code> first, drop
          to <code>any</code> only when <code>unknown</code> makes the code
          impossible to write, and keep it in the smallest scope. Option E is
          false: <code>res.json()</code> is typed{" "}
          <code>Promise&lt;any&gt;</code> in the DOM library, and the real shape
          is only known once something checks it at runtime. Sections 03 and 04
          of this chapter cover it.
        </>
      ),
      zh: (
        <>
          <code>unknown</code> 接收任何值,但用之前必须收窄;<code>any</code>{" "}
          接收任何值且放行任何用法,还会扩散。原则:先用 <code>unknown</code>,
          只有当它让代码写不下去时才降级到 <code>any</code>,
          并且锁在最小的作用域里。E 是错的:<code>res.json()</code> 在 DOM
          库里的类型是 <code>Promise&lt;any&gt;</code>,
          真实形状只有在运行时被检查过才知道。—— 回看本章 §03、§04。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          With <code>verbatimModuleSyntax</code> on, you need to import{" "}
          <code>Order</code>, which is <b>used only as a type</b>. Which form is
          correct?
        </>
      ),
      zh: (
        <>
          开着 <code>verbatimModuleSyntax</code>,要导入一个<b>只当类型用</b>的{" "}
          <code>Order</code>,正确写法是?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            <code>{'import { Order } from "./order"'}</code>
          </>
        ),
        zh: (
          <>
            <code>{'import { Order } from "./order"'}</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>{'import type { Order } from "./order"'}</code>
          </>
        ),
        zh: (
          <>
            <code>{'import type { Order } from "./order"'}</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>{'const Order = require("./order")'}</code>
          </>
        ),
        zh: (
          <>
            <code>{'const Order = require("./order")'}</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>{'import * as Order from "./order"'}</code>
          </>
        ),
        zh: (
          <>
            <code>{'import * as Order from "./order"'}</code>
          </>
        ),
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            Under this flag a plain import of a type is an error:{" "}
            <code>
              &apos;Order&apos; is a type and must be imported using a type-only
              import when &apos;verbatimModuleSyntax&apos; is enabled.
            </code>{" "}
            The compiler keeps import statements exactly as written, so it will
            not guess which ones can be dropped.
          </>
        ),
        zh: (
          <>
            开着这个开关时,用普通 import 导入一个类型会报错:
            <code>
              &apos;Order&apos; is a type and must be imported using a type-only
              import when &apos;verbatimModuleSyntax&apos; is enabled.
            </code>{" "}
            编译器会原样保留 import 语句,不去猜哪一行可以删。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            <code>require</code> is a CommonJS runtime function. It imports a
            value, which cannot be erased. That is a different thing entirely.
          </>
        ),
        zh: (
          <>
            <code>require</code> 是 CommonJS 的运行时函数,导入的是值,
            擦不掉,和类型导入完全是两回事。
          </>
        ),
      },
      {
        en: (
          <>
            A namespace import brings in the whole module as a value. You only
            wanted a type but you pulled in the entire implementation, which is
            what <code>import type</code> avoids.
          </>
        ),
        zh: (
          <>
            命名空间导入拿进来的是整个模块的值。你只想要一个类型,
            却把全部实现搬了进来 —— 这正是 <code>import type</code> 要避免的。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>import type</code> states that the line carries types only, so
          the compiler removes the whole line and bundlers do not have to guess.{" "}
          <code>verbatimModuleSyntax</code> (TypeScript 5.0) turns that habit
          into a rule. Chapters 09 and 10 cover it.
        </>
      ),
      zh: (
        <>
          <code>import type</code> 明确表示这一行只有类型,
          编译时整行删除,打包器也不用猜。
          <code>verbatimModuleSyntax</code>(TypeScript 5.0)
          把这个习惯变成了硬规定。—— 回看第 09 章、第 10 章。
        </>
      ),
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          <code>{'const config = { theme: "dark" } as const;'}</code> — what is
          the type of <code>config.theme</code>?
        </>
      ),
      zh: (
        <>
          <code>{'const config = { theme: "dark" } as const;'}</code> —— 此时{" "}
          <code>config.theme</code> 的类型是什么?
        </>
      ),
    },
    placeholder: { en: "the exact type", zh: "写出精确类型" },
    answers: ['"dark"', "dark"],
    hint: {
      en: (
        <>
          The job of <code>as const</code> is to widen nothing. Inference stops
          at the literal you wrote, and every property also becomes{" "}
          <code>readonly</code>.
        </>
      ),
      zh: (
        <>
          <code>as const</code> 的作用就是「一点都不拓宽」。
          推断停在你写下的那个字面量上,同时每个属性都变成{" "}
          <code>readonly</code>。
        </>
      ),
    },
    why: {
      en: (
        <>
          <code>as const</code> pins inference to the literal{" "}
          <code>{'"dark"'}</code> and adds <code>readonly</code>. Without it, an
          object property is widened to <code>string</code>. Combined with{" "}
          <code>satisfies</code>, this is the usual way to write a config
          object. Section 01 of this chapter covers it.
        </>
      ),
      zh: (
        <>
          <code>as const</code> 把推断钉在字面量 <code>{'"dark"'}</code> 上,
          并加上 <code>readonly</code>。没有它,对象属性会被拓宽成{" "}
          <code>string</code>。配合 <code>satisfies</code>,
          就是配置对象最常见的写法。—— 回看本章 §01。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Last question. In the compiled code that runs in production, can{" "}
          <code>{"if (order instanceof Order)"}</code> test whether a value
          matches an <code>interface</code> named <code>Order</code>?
        </>
      ),
      zh: (
        <>
          最后一题。在编译后真正运行的代码里,能不能用{" "}
          <code>{"if (order instanceof Order)"}</code> 判断一个值符合名为{" "}
          <code>Order</code> 的 <code>interface</code>?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            Yes. TypeScript generates a runtime class for every{" "}
            <code>interface</code>
          </>
        ),
        zh: (
          <>
            能,TypeScript 会为每个 <code>interface</code> 生成运行时的类
          </>
        ),
      },
      {
        en: (
          <>
            No. Interfaces are erased during compilation, so a runtime test has
            to inspect the value itself, with a type predicate or a validator
          </>
        ),
        zh: (
          <>
            不能 —— interface 在编译时被擦除,
            运行时的判断只能检查值本身(类型谓词或校验函数)
          </>
        ),
      },
      {
        en: (
          <>
            Yes, but you have to turn on <code>strict</code> first
          </>
        ),
        zh: (
          <>
            能,但要先开 <code>strict</code>
          </>
        ),
      },
      {
        en: (
          <>
            No, but it works if you use <code>type</code> instead of{" "}
            <code>interface</code>
          </>
        ),
        zh: (
          <>
            不能,但把 <code>interface</code> 换成 <code>type</code> 就可以了
          </>
        ),
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            The opposite is true. An <code>interface</code> produces no
            JavaScript at all. Search the compiled output and you will not find
            a single byte of it.
          </>
        ),
        zh: (
          <>
            恰好相反:<code>interface</code> 不产生任何 JavaScript,
            在编译产物里一个字节都找不到。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            <code>strict</code> controls how strict the compile-time checks are.
            It cannot create a runtime class. Erasure works the same under every
            configuration.
          </>
        ),
        zh: (
          <>
            <code>strict</code> 管的是编译期检查有多严,变不出运行时的类。
            擦除对所有配置一视同仁。
          </>
        ),
      },
      {
        en: (
          <>
            <code>type</code> and <code>interface</code> behave identically
            here: both exist only at compile time and both are erased. At
            runtime you can only inspect the shape of the value.
          </>
        ),
        zh: (
          <>
            这件事上 <code>type</code> 和 <code>interface</code> 完全一样:
            都只存在于编译期,都会被擦除。运行时只能检查值本身的形状。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Type erasure is both the first lesson of this course and the last one.
          Types exist while you write and compile. What runs is plain
          JavaScript, and it contains values only. That is why a boundary needs
          a validator you write by hand, like <code>isOrder</code> in section
          03. It is also why a discriminated union discriminates on{" "}
          <code>status</code>, <b>a real property of the value</b>, and not on
          the name of a type. Prologue and section 03 of this chapter cover it.
        </>
      ),
      zh: (
        <>
          类型擦除既是这门课的第一课,也是最后一课:类型存在于你写代码和
          编译的阶段;真正运行的是普通 JavaScript,里面只有值。
          所以边界上需要你手写校验(本章 §03 的 <code>isOrder</code>);
          也所以可辨识联合靠的是 <code>status</code> 这个
          <b>真实存在的属性</b>,而不是类型的名字。—— 回看序章、本章 §03。
        </>
      ),
    },
  },
];
