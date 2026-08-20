"use client";

// 第 07 章 · 类型运算 —— 动手任务 LABS + 通关测验 QUIZ 数据(双语)。
// 参考做法里的代码:可执行行在两种语言里逐字节相同,只有注释分 en / zh,
// 因此 hl 行号在两种语言下一致。编译器报错原文一律不翻译。
// 所有报错文案、报错码与推断结果均在 TypeScript 5.9 + strict 下实测过。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";
import type { Loc } from "@/lib/i18n";

/* ---------- LAB 代码 ---------- */

const L1_SOL: Loc<string> = {
  en: `type Naked<T>   = T extends string ? true : false;
type Wrapped<T> = [T] extends [string] ? true : false;

type A = Naked<"a" | 1>;
// boolean -- T is a naked type parameter, so the union is split:
//            "a" gives true, 1 gives false, and true | false is boolean.

type B = Wrapped<"a" | 1>;
// false -- [T] is a tuple, so T is no longer naked and nothing is split.
//          "a" | 1 is not assignable to string, so the false branch runs.`,
  zh: `type Naked<T>   = T extends string ? true : false;
type Wrapped<T> = [T] extends [string] ? true : false;

type A = Naked<"a" | 1>;
// boolean —— T 是裸类型参数,联合被拆开分别判断:
//            "a" 得 true,1 得 false,而 true | false 就是 boolean。

type B = Wrapped<"a" | 1>;
// false —— [T] 是元组,T 不再是裸类型参数,不拆开。
//          "a" | 1 不能赋给 string,所以走假分支。`,
};

const L2_SOL: Loc<string> = {
  en: `type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

type OrderGetters = Getters<Pick<Order, "drink" | "size">>;
// {
//   getDrink: () => string;
//   getSize: () => Size;
// }

// The & string is required, not decoration: keyof T can also contain
// number and symbol, and Capitalize<S> only accepts S extends string.
// Without it: Type 'K' does not satisfy the constraint 'string'.`,
  zh: `type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

type OrderGetters = Getters<Pick<Order, "drink" | "size">>;
// {
//   getDrink: () => string;
//   getSize: () => Size;
// }

// & string 不是装饰,是必需的:keyof T 里还可能有 number 和 symbol,
// 而 Capitalize<S> 只接受 S extends string。
// 去掉它就会报:Type 'K' does not satisfy the constraint 'string'.`,
};

const L3_SOL: Loc<string> = {
  en: `type Unbox<T> = T extends Promise<infer U> ? U : T;
type DeepUnbox<T> = T extends Promise<infer U> ? DeepUnbox<U> : T;

type Onion = Promise<Promise<Promise<string>>>;

type One = Unbox<Onion>;      // Promise<Promise<string>> -- one layer removed
type Deep = DeepUnbox<Onion>; // string -- repeated until T is not a Promise`,
  zh: `type Unbox<T> = T extends Promise<infer U> ? U : T;
type DeepUnbox<T> = T extends Promise<infer U> ? DeepUnbox<U> : T;

type Onion = Promise<Promise<Promise<string>>>;

type One = Unbox<Onion>;      // Promise<Promise<string>> —— 只剥掉一层
type Deep = DeepUnbox<Onion>; // string —— 一直重复到 T 不再是 Promise`,
};

const L4_SOL: Loc<string> = {
  en: `// 1. The library definition: Omit is Pick plus Exclude.
type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

type P1 = MyOmit<Order, "internalNote">;  // same result as the built-in Omit
type P2 = MyOmit<Order, "internalNotes">; // no error, and nothing is removed:
                                          // P2 still has all six fields.

// 2. The strict version. Only the constraint changed.
type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type S1 = StrictOmit<Order, "internalNote">;
type S2 = StrictOmit<Order, "internalNotes">;
// Type '"internalNotes"' does not satisfy the constraint 'keyof Order'.`,
  zh: `// ① 标准库的写法:Omit 就是 Pick 加 Exclude。
type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

type P1 = MyOmit<Order, "internalNote">;  // 和内置 Omit 结果相同
type P2 = MyOmit<Order, "internalNotes">; // 不报错,也什么都没删掉:
                                          // P2 六个字段一个不少。

// ② 严格版。只改了约束,别的没动。
type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type S1 = StrictOmit<Order, "internalNote">;
type S2 = StrictOmit<Order, "internalNotes">;
// Type '"internalNotes"' does not satisfy the constraint 'keyof Order'.`,
};

export const LABS: Lab[] = [
  {
    id: "no-distribute",
    title: { en: "Turn distribution off", zh: "关掉分发开关" },
    d: "easy",
    tags: {
      en: ["conditional types", "distribution", "Playground"],
      zh: ["条件类型", "分发", "Playground"],
    },
    task: {
      en: (
        <p>
          In the TypeScript Playground, write two conditional types:{" "}
          <code>Naked&lt;T&gt; = T extends string ? true : false</code> and{" "}
          <code>Wrapped&lt;T&gt; = [T] extends [string] ? true : false</code>.
          Give both the same argument, <code>&quot;a&quot; | 1</code>, then
          hover the two results. Explain why one is <code>boolean</code> and the
          other is <code>false</code>.
        </p>
      ),
      zh: (
        <p>
          在 TypeScript Playground 里写两个条件类型:
          <code>Naked&lt;T&gt; = T extends string ? true : false</code> 和{" "}
          <code>Wrapped&lt;T&gt; = [T] extends [string] ? true : false</code>。
          都传同一个实参 <code>&quot;a&quot; | 1</code>,再悬停看两个结果 ——
          说清楚为什么一个是 <code>boolean</code>,另一个是 <code>false</code>。
        </p>
      ),
    },
    hint: {
      en: (
        <>
          A naked <code>T</code> makes the conditional type run once per union
          member, and the results are joined back into a union. Wrapping the
          check in <code>[ ]</code> checks the whole union at once. Then ask
          yourself what <code>true | false</code> is displayed as.
        </>
      ),
      zh: (
        <>
          裸 <code>T</code> 会让条件类型对联合的每个成员各跑一次,
          结果再合并成联合;用 <code>[ ]</code> 包起来则是整体判断一次。
          再想一想:<code>true | false</code> 会被显示成什么。
        </>
      ),
    },
    solution: {
      en: (
        <>
          <CodeBlock
            lang="ts"
            title={{
              en: "distribute.ts · one answer",
              zh: "distribute.ts · 参考答案",
            }}
            code={L1_SOL}
            hl={[4, 8]}
          />
          <p>
            <code>A</code> being <code>boolean</code> is the step that surprises
            people. The compiler is not rounding the answer off:{" "}
            <code>true | false</code> and <code>boolean</code> are the same
            type, and <code>boolean</code> is how it is printed. So when a
            conditional type hands you a union that you did not expect, the
            first thing to check is whether it distributed.
          </p>
        </>
      ),
      zh: (
        <>
          <CodeBlock
            lang="ts"
            title={{
              en: "distribute.ts · one answer",
              zh: "distribute.ts · 参考答案",
            }}
            code={L1_SOL}
            hl={[4, 8]}
          />
          <p>
            <code>A</code> 显示成 <code>boolean</code> 是最容易卡住的一步。
            编译器没有偷懒:<code>true | false</code> 和 <code>boolean</code>{" "}
            本来就是同一个类型,<code>boolean</code>{" "}
            只是它的打印形式。所以条件类型返回了一个你没预料到的联合时,
            第一件要检查的事就是:它是不是发生了分发。
          </p>
        </>
      ),
    },
  },
  {
    id: "getter-factory",
    title: {
      en: "Build getters with a template literal type",
      zh: "用模板字面量类型造 getter",
    },
    d: "medium",
    tags: {
      en: ["mapped types", "as", "template literal types"],
      zh: ["映射类型", "as", "模板字面量类型"],
    },
    task: {
      en: (
        <p>
          Write <code>Getters&lt;T&gt;</code>. It turns every key <code>K</code>{" "}
          of <code>T</code> into a method named <code>get</code> plus{" "}
          <code>K</code> with the first letter in upper case, returning{" "}
          <code>T[K]</code>. Check it with{" "}
          <code>Pick&lt;Order, &quot;drink&quot; | &quot;size&quot;&gt;</code>:
          hovering should show <code>getDrink: () =&gt; string</code> and{" "}
          <code>getSize: () =&gt; Size</code>.
        </p>
      ),
      zh: (
        <p>
          写一个 <code>Getters&lt;T&gt;</code>:把 <code>T</code> 的每个键{" "}
          <code>K</code> 变成一个方法,名字是 <code>get</code> 加上首字母大写的{" "}
          <code>K</code>,返回 <code>T[K]</code>。用{" "}
          <code>Pick&lt;Order, &quot;drink&quot; | &quot;size&quot;&gt;</code>{" "}
          验证:悬停应该看到 <code>getDrink: () =&gt; string</code> 和{" "}
          <code>getSize: () =&gt; Size</code>。
        </p>
      ),
    },
    hint: {
      en: (
        <>
          Copy the shape of <code>Watchers</code> from this chapter:{" "}
          <code>[K in keyof T as …]</code>. Build the new key with a template
          literal type from <code>get</code> and <code>Capitalize</code>, and
          write the property type as <code>() =&gt; T[K]</code>. Do not drop the{" "}
          <code>string &amp; K</code> part.
        </>
      ),
      zh: (
        <>
          照本章 <code>Watchers</code> 的骨架抄:<code>[K in keyof T as …]</code>
          。新键名用模板字面量类型把 <code>get</code> 和 <code>Capitalize</code>{" "}
          拼起来,属性类型写成 <code>() =&gt; T[K]</code>。
          <code>string &amp; K</code> 那一段不能省。
        </>
      ),
    },
    solution: {
      en: (
        <>
          <CodeBlock
            lang="ts"
            title={{
              en: "getters.ts · one answer",
              zh: "getters.ts · 参考答案",
            }}
            code={L2_SOL}
            hl={[2]}
          />
          <p>
            Four pieces sit on one line: the mapped type loop, the{" "}
            <code>as</code> clause that renames the key, the template literal
            type, and <code>Capitalize</code>. Vue&apos;s <code>onXxx</code>{" "}
            props and the <code>mockXxx</code> helpers in test libraries are
            typed with the same shape.
          </p>
        </>
      ),
      zh: (
        <>
          <CodeBlock
            lang="ts"
            title={{
              en: "getters.ts · one answer",
              zh: "getters.ts · 参考答案",
            }}
            code={L2_SOL}
            hl={[2]}
          />
          <p>
            四个零件挤在一行里:映射类型的循环、给键改名的 <code>as</code>、
            模板字面量类型,以及 <code>Capitalize</code>。Vue 的{" "}
            <code>onXxx</code> 属性、测试库的 <code>mockXxx</code>,
            类型层面都是这个形状。
          </p>
        </>
      ),
    },
  },
  {
    id: "promise-onion",
    title: {
      en: "Unwrap three layers of Promise",
      zh: "把三层 Promise 剥到底",
    },
    d: "medium",
    tags: { en: ["infer", "recursion"], zh: ["infer", "递归"] },
    task: {
      en: (
        <p>
          The <code>Unbox</code> in this chapter removes one layer only. Give it{" "}
          <code>Promise&lt;Promise&lt;Promise&lt;string&gt;&gt;&gt;</code> and
          two layers are still there. Upgrade it to{" "}
          <code>DeepUnbox&lt;T&gt;</code>, which removes every layer and reaches{" "}
          <code>string</code> no matter how many there are. Hint: a type alias
          may refer to itself.
        </p>
      ),
      zh: (
        <p>
          本章的 <code>Unbox</code> 只剥一层:喂它{" "}
          <code>Promise&lt;Promise&lt;Promise&lt;string&gt;&gt;&gt;</code>,
          剩下的两层还在。把它升级成 <code>DeepUnbox&lt;T&gt;</code>:
          不管几层都剥到底,最后拿到 <code>string</code>。提示:
          类型别名可以引用自己。
        </p>
      ),
    },
    hint: {
      en: (
        <>
          After one layer comes off, the <code>U</code> you captured may still
          be a <code>Promise</code>. So do not return it yet: hand it back to{" "}
          <code>DeepUnbox</code> and let the same rule apply again ——{" "}
          <code>? DeepUnbox&lt;U&gt; : T</code>.
        </>
      ),
      zh: (
        <>
          剥掉一层之后,抓到的 <code>U</code> 可能还是 <code>Promise</code>。
          那就先别急着返回:把 <code>U</code> 再交给 <code>DeepUnbox</code>{" "}
          自己处理 —— <code>? DeepUnbox&lt;U&gt; : T</code>。
        </>
      ),
    },
    solution: {
      en: (
        <>
          <CodeBlock
            lang="ts"
            title={{
              en: "deep-unbox.ts · one answer",
              zh: "deep-unbox.ts · 参考答案",
            }}
            code={L3_SOL}
            hl={[2]}
          />
          <p>
            Line 2 is recursion in the type system: the true branch names the
            alias being defined, and this repeats until <code>T</code> is no
            longer a <code>Promise</code>. You have just written the core of the
            built-in <code>Awaited</code>. The library version also handles any
            object with a <code>then</code> method, not only{" "}
            <code>Promise</code>, but the shape is the same.
          </p>
          <p>
            Recursive types are not unlimited. The compiler stops after a fixed
            number of steps and reports{" "}
            <code>
              error TS2589: Type instantiation is excessively deep and possibly
              infinite.
            </code>{" "}
            The limit is high enough for real data, and it is much higher when
            the recursive call is the whole branch, as it is here, because the
            compiler can then repeat the step instead of nesting it.
          </p>
        </>
      ),
      zh: (
        <>
          <CodeBlock
            lang="ts"
            title={{
              en: "deep-unbox.ts · one answer",
              zh: "deep-unbox.ts · 参考答案",
            }}
            code={L3_SOL}
            hl={[2]}
          />
          <p>
            第 2 行就是类型系统里的递归:真分支里写出了正在定义的这个别名,
            于是同一条规则反复应用,直到 <code>T</code> 不再是{" "}
            <code>Promise</code>。你刚刚写出了内置 <code>Awaited</code>{" "}
            的核心。标准库那一版还会处理任何带 <code>then</code>{" "}
            方法的对象,不只是 <code>Promise</code>,但形状是一样的。
          </p>
          <p>
            递归类型不是无限的。步数超过上限时编译器会停下来并报{" "}
            <code>
              error TS2589: Type instantiation is excessively deep and possibly
              infinite.
            </code>{" "}
            这个上限对真实数据够用;而且当递归调用占据了整个分支
            (就像这里),上限还会高得多 ——
            这时编译器可以反复执行同一步,而不必层层嵌套。
          </p>
        </>
      ),
    },
  },
  {
    id: "my-omit",
    title: {
      en: "Build the strict Omit the library does not ship",
      zh: "造一把标准库没给的严格版 Omit",
    },
    d: "hard",
    tags: {
      en: ["Pick", "Exclude", "composition", "mapped types"],
      zh: ["Pick", "Exclude", "组合", "映射类型"],
    },
    task: {
      en: (
        <p>
          Two steps. First, build <code>MyOmit&lt;T, K&gt;</code> out of{" "}
          <code>Pick</code> and <code>Exclude</code> only, and check against{" "}
          <code>Order</code> that it behaves like the built-in <code>Omit</code>
          . Second, change the constraint on <code>K</code> to{" "}
          <code>K extends keyof T</code> to get a <b>strict</b> version,{" "}
          <code>StrictOmit</code>, where a misspelled key is reported instead of
          silently ignored. That closes the hole you saw in chapter 06.
        </p>
      ),
      zh: (
        <p>
          分两步。第一步:只用 <code>Pick</code> 和 <code>Exclude</code> 拼出{" "}
          <code>MyOmit&lt;T, K&gt;</code>,对 <code>Order</code> 验证它和内置{" "}
          <code>Omit</code> 行为一致。第二步:把 <code>K</code> 的约束改成{" "}
          <code>K extends keyof T</code>,做出<b>严格版</b>{" "}
          <code>StrictOmit</code> —— 键拼错要当场报错,而不是被默默忽略。 第 06
          章那个漏洞就补上了。
        </p>
      ),
    },
    hint: {
      en: (
        <>
          Turn the problem around. Removing <code>K</code> is the same as
          keeping every key except <code>K</code>. So compute the keys you want
          to keep with <code>Exclude&lt;keyof T, K&gt;</code>, then hand that
          list to <code>Pick</code>.
        </>
      ),
      zh: (
        <>
          换个角度想:「删掉 <code>K</code>」等于「留下除 <code>K</code>{" "}
          以外的所有键」。所以先用 <code>Exclude&lt;keyof T, K&gt;</code>{" "}
          算出要留的键,再把这份名单交给 <code>Pick</code>。
        </>
      ),
    },
    solution: {
      en: (
        <>
          <CodeBlock
            lang="ts"
            title={{
              en: "my-omit.ts · one answer",
              zh: "my-omit.ts · 参考答案",
            }}
            code={L4_SOL}
            hl={[2, 9]}
          />
          <p>
            Line 2 is the definition from <code>lib.es5.d.ts</code>, word for
            word. The library constraint is <code>keyof any</code>, which is{" "}
            <code>string | number | symbol</code>, so almost any key type is
            accepted and a typo passes. Line 9 changes only the constraint, and
            the silent failure becomes a compile error. That is the point of
            these two chapters: when a built-in type does not fit, you can now
            build the one that does.
          </p>
          <p>
            <code>Omit</code> stays loose on purpose. A looser constraint lets
            it accept keys that are not on <code>T</code>, which is useful when{" "}
            <code>T</code> is itself a union or is still generic. Use{" "}
            <code>StrictOmit</code> where you want the typo caught, and keep{" "}
            <code>Omit</code> where you do not.
          </p>
        </>
      ),
      zh: (
        <>
          <CodeBlock
            lang="ts"
            title={{
              en: "my-omit.ts · one answer",
              zh: "my-omit.ts · 参考答案",
            }}
            code={L4_SOL}
            hl={[2, 9]}
          />
          <p>
            第 2 行就是 <code>lib.es5.d.ts</code> 里的原文,一字不差。
            标准库的约束是 <code>keyof any</code>,也就是{" "}
            <code>string | number | symbol</code>,所以几乎任何键类型都收,
            拼错也能过。第 9 行只改了约束,默默失效就变成了编译错误。
            这两章要给你的就是这个:内置类型不合用的时候,你已经能自己造一个。
          </p>
          <p>
            <code>Omit</code> 宽松是故意的。约束松一点,它才能接受不在{" "}
            <code>T</code> 上的键 —— 当 <code>T</code> 本身是联合、
            或者还是泛型时,这一点有用。想抓拼写错误就用 <code>StrictOmit</code>
            ,其他地方继续用 <code>Omit</code>。
          </p>
        </>
      ),
    },
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: (
        <>
          <code>Order</code> has six fields: <code>id</code>, <code>drink</code>
          , <code>size</code>, <code>sugar</code>, <code>toppings</code>,{" "}
          <code>internalNote</code>. What is <code>keyof Order</code>?
        </>
      ),
      zh: (
        <>
          <code>Order</code> 有六个字段:<code>id</code>、<code>drink</code>、
          <code>size</code>、<code>sugar</code>、<code>toppings</code>、
          <code>internalNote</code>。那么 <code>keyof Order</code> 是什么?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            An array of strings:{" "}
            <code>[&quot;id&quot;, &quot;drink&quot;, …]</code>
          </>
        ),
        zh: (
          <>
            一个字符串数组:
            <code>[&quot;id&quot;, &quot;drink&quot;, …]</code>
          </>
        ),
      },
      {
        en: (
          <>
            A union of the key names:{" "}
            <code>
              &quot;id&quot; | &quot;drink&quot; | &quot;size&quot; | …
            </code>
          </>
        ),
        zh: (
          <>
            键名的字面量联合:
            <code>
              &quot;id&quot; | &quot;drink&quot; | &quot;size&quot; | …
            </code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>string</code>, because keys are strings anyway
          </>
        ),
        zh: (
          <>
            <code>string</code>,反正键都是字符串
          </>
        ),
      },
      {
        en: <>A union of the types of all the field values</>,
        zh: <>所有字段值类型的联合</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            An array is a value. <code>Object.keys(order)</code> returns one
            when the program runs. <code>keyof</code> works on types and
            produces a type: a union of string literals.
          </>
        ),
        zh: (
          <>
            数组是值。运行时是 <code>Object.keys(order)</code> 给你数组;
            <code>keyof</code> 作用在类型上,产出的也是类型: 字符串字面量的联合。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            It is far more precise than <code>string</code>: exactly those six
            names and nothing else. That is why{" "}
            <code>const k: keyof Order = &quot;cup&quot;</code> is reported as{" "}
            <code>
              Type &apos;&quot;cup&quot;&apos; is not assignable to type
              &apos;keyof Order&apos;.
            </code>
          </>
        ),
        zh: (
          <>
            它比 <code>string</code> 精确得多:就是那六个名字,一个不多。 所以{" "}
            <code>const k: keyof Order = &quot;cup&quot;</code> 会报{" "}
            <code>
              Type &apos;&quot;cup&quot;&apos; is not assignable to type
              &apos;keyof Order&apos;.
            </code>
          </>
        ),
      },
      {
        en: (
          <>
            That is <code>Order[keyof Order]</code>: first take the keys, then
            read the value types through them. <code>keyof</code> on its own
            stops at the keys.
          </>
        ),
        zh: (
          <>
            那是 <code>Order[keyof Order]</code>:先取键,再用键把值类型读出来。
            <code>keyof</code> 自己只走到键这一步。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>keyof T</code> collects the key names of a type into a{" "}
          <b>union of string literal types</b>. Every member is a key that
          really exists on <code>T</code>, which is what makes it useful as a
          constraint.
        </>
      ),
      zh: (
        <>
          <code>keyof T</code> 把一个类型的键名收成一个
          <b>字符串字面量联合</b>。每个成员都是 <code>T</code> 上真实存在的键 ——
          正因为如此,它才能用来当约束。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: <>Which of these four uses of typeof belongs to the type world?</>,
      zh: <>下面四个 typeof,哪一个属于类型世界?</>,
    },
    opts: [
      <>
        <code>if (typeof x === &quot;string&quot;) {"{ … }"}</code>
      </>,
      <>
        <code>type M = typeof menu;</code>
      </>,
      <>
        <code>console.log(typeof menu);</code>
      </>,
      <>
        <code>const t = typeof menu;</code>
      </>,
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            This is the narrowing guard from chapter 03. It runs at run time and
            compares a string, so it is the JavaScript <code>typeof</code>.
          </>
        ),
        zh: (
          <>
            这是第 03 章的收窄守卫:运行时执行,拿字符串比较, 是 JavaScript 的{" "}
            <code>typeof</code>。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            <code>console.log</code> takes an argument, so this is an expression
            and it really runs. It prints <code>&quot;object&quot;</code>.
          </>
        ),
        zh: (
          <>
            <code>console.log</code> 要的是实参,所以这里是表达式,
            会真的执行,打印出 <code>&quot;object&quot;</code>。
          </>
        ),
      },
      {
        en: (
          <>
            Everything after <code>const t =</code> is an expression, so this is
            the value world. <code>t</code> holds the string{" "}
            <code>&quot;object&quot;</code>, not a type.
          </>
        ),
        zh: (
          <>
            <code>const t =</code> 后面是表达式位置,属于值世界。
            <code>t</code> 里装的是字符串 <code>&quot;object&quot;</code>,
            不是类型。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Judge by position. After <code>=</code> in a <code>type</code>{" "}
          declaration, or after the <code>:</code> of an annotation, you are in
          a type position, and <code>typeof</code> there belongs to TypeScript
          and is erased when compiling. Anywhere else it is the JavaScript
          operator and it runs.
        </>
      ),
      zh: (
        <>
          看位置。<code>type</code> 声明的等号右边、注解的冒号后面,
          都是类型位置,那里的 <code>typeof</code> 属于 TypeScript,
          编译时被擦除。其余位置都是 JavaScript 的那个运算符,会真的执行。
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
          <code>
            const t = [&quot;boba&quot;, &quot;coconut jelly&quot;] as const;
          </code>
          , what is <code>(typeof t)[number]</code>?
        </>
      ),
      zh: (
        <>
          写下{" "}
          <code>
            const t = [&quot;boba&quot;, &quot;coconut jelly&quot;] as const;
          </code>{" "}
          之后,<code>(typeof t)[number]</code> 是什么?
        </>
      ),
    },
    opts: [
      <>
        <code>number</code>
      </>,
      <>
        <code>&quot;boba&quot; | &quot;coconut jelly&quot;</code>
      </>,
      <>
        <code>string[]</code>
      </>,
      {
        en: <>An error: an array cannot be indexed by number</>,
        zh: <>报错:数组不能用 number 索引</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            <code>number</code> is the key, not the result.{" "}
            <code>T[number]</code> asks what type you get when you read the
            array at a numeric index.
          </>
        ),
        zh: (
          <>
            <code>number</code> 是键,不是结果。<code>T[number]</code>{" "}
            问的是:用数字下标从数组里读出来的东西是什么类型。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            That is close to <code>typeof t</code> itself: without{" "}
            <code>as const</code> it would be <code>string[]</code>. Indexing it
            with <code>[number]</code> takes one more step and gives the{" "}
            <b>element</b> type.
          </>
        ),
        zh: (
          <>
            那接近 <code>typeof t</code> 本身:不加 <code>as const</code>{" "}
            时它就是 <code>string[]</code>。再用 <code>[number]</code>{" "}
            取一次下标,拿到的是<b>元素</b>类型。
          </>
        ),
      },
      {
        en: (
          <>
            It is valid. Arrays are indexed by number, and{" "}
            <code>T[number]</code> is the standard way to read the element type.
          </>
        ),
        zh: (
          <>
            完全合法。数组本来就用数字索引,<code>T[number]</code>{" "}
            正是取元素类型的标准写法。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>as const</code> makes the array a readonly tuple of literal
          types, and <code>T[number]</code> reads out the union of all its
          element types:{" "}
          <code>&quot;boba&quot; | &quot;coconut jelly&quot;</code>. One piece
          of data, and the type follows it.
        </>
      ),
      zh: (
        <>
          <code>as const</code> 把数组变成由字面量类型组成的只读元组,
          <code>T[number]</code> 取出全部元素类型的联合:
          <code>&quot;boba&quot; | &quot;coconut jelly&quot;</code>。
          数据只写一份,类型跟着它走。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          How does the compiler arrive at{" "}
          <code>
            Exclude&lt;&quot;a&quot; | &quot;b&quot; | &quot;c&quot;,
            &quot;b&quot;&gt;
          </code>
          ?
        </>
      ),
      zh: (
        <>
          编译器是怎么算出{" "}
          <code>
            Exclude&lt;&quot;a&quot; | &quot;b&quot; | &quot;c&quot;,
            &quot;b&quot;&gt;
          </code>{" "}
          的?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            It checks the whole union at once:{" "}
            <code>&quot;a&quot; | &quot;b&quot; | &quot;c&quot;</code> is not
            assignable to <code>&quot;b&quot;</code>, so all three are kept
          </>
        ),
        zh: (
          <>
            整体判断一次:
            <code>
              &quot;a&quot; | &quot;b&quot; | &quot;c&quot;
            </code> 不能赋给 <code>&quot;b&quot;</code>,所以三个全留下
          </>
        ),
      },
      {
        en: (
          <>
            It checks one member at a time: <code>&quot;a&quot;</code> and{" "}
            <code>&quot;c&quot;</code> fail the check and are kept,{" "}
            <code>&quot;b&quot;</code> passes it and becomes <code>never</code>;
            joining the results drops the <code>never</code> and leaves{" "}
            <code>&quot;a&quot; | &quot;c&quot;</code>
          </>
        ),
        zh: (
          <>
            逐个成员判断:<code>&quot;a&quot;</code> 和{" "}
            <code>&quot;c&quot;</code> 判否而留下,<code>&quot;b&quot;</code>{" "}
            判是而变成 <code>never</code>;合并结果时 <code>never</code>{" "}
            消失,剩下 <code>&quot;a&quot; | &quot;c&quot;</code>
          </>
        ),
      },
      {
        en: (
          <>
            It returns <code>&quot;b&quot;</code>, the member that matched
          </>
        ),
        zh: (
          <>
            返回 <code>&quot;b&quot;</code>,也就是匹配上的那个
          </>
        ),
      },
      {
        en: (
          <>
            It returns <code>never</code>: one member matched, so the whole
            union is discarded
          </>
        ),
        zh: (
          <>
            返回 <code>never</code>:有一个成员匹配,整个联合就作废
          </>
        ),
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            If it were checked as a whole, <code>Exclude</code> could never
            remove anything. A naked type parameter is deliberately <b>not</b>{" "}
            checked as a whole, and that is what makes <code>Exclude</code>{" "}
            possible.
          </>
        ),
        zh: (
          <>
            如果是整体判断,<code>Exclude</code> 就永远删不掉任何东西。
            裸类型参数遇到联合时故意<b>不</b>整体判断,
            <code>Exclude</code> 才成立。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            The direction is reversed. The member that matches goes to{" "}
            <code>never</code> and is dropped; what remains is what did{" "}
            <b>not</b> match. Keeping the matches is <code>Extract</code>.
          </>
        ),
        zh: (
          <>
            方向反了:匹配上的走 <code>never</code> 被丢掉,留下的是<b>没</b>
            匹配上的。挑出匹配的那个是 <code>Extract</code> 的活。
          </>
        ),
      },
      {
        en: (
          <>
            <code>never</code> replaces only the member that matched. It is the
            empty union, so it disappears when the results are joined and the
            other members are unaffected.
          </>
        ),
        zh: (
          <>
            <code>never</code> 只替换匹配上的那一个成员。它是空联合,
            合并结果时安静消失,不影响其他成员。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          This is a distributive conditional type: split the union, check each
          member, join the results. <code>&quot;b&quot;</code> becomes{" "}
          <code>never</code> and leaves nothing behind, so the result is{" "}
          <code>&quot;a&quot; | &quot;c&quot;</code>. The visualization in §04
          runs exactly this.
        </>
      ),
      zh: (
        <>
          这就是分布式条件类型:拆开联合、逐个判断、合并结果。
          <code>&quot;b&quot;</code> 变成 <code>never</code>,什么也没留下,
          所以结果是 <code>&quot;a&quot; | &quot;c&quot;</code>。§04
          的可视化演的就是这一段。
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
            type W&lt;T&gt; = [T] extends [string] ? &quot;pure&quot; :
            &quot;mixed&quot;;
          </code>
          , what is <code>W&lt;&quot;a&quot; | 1&gt;</code>?
        </>
      ),
      zh: (
        <>
          已知{" "}
          <code>
            type W&lt;T&gt; = [T] extends [string] ? &quot;pure&quot; :
            &quot;mixed&quot;;
          </code>
          ,那么 <code>W&lt;&quot;a&quot; | 1&gt;</code> 是?
        </>
      ),
    },
    opts: [
      <>
        <code>&quot;pure&quot; | &quot;mixed&quot;</code>
      </>,
      <>
        <code>&quot;mixed&quot;</code>
      </>,
      <>
        <code>&quot;pure&quot;</code>
      </>,
      {
        en: <>An error: a tuple cannot appear before extends</>,
        zh: <>报错:extends 前面不能写元组</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            A union result would mean distribution happened. But <code>T</code>{" "}
            is wrapped in <code>[ ]</code>, so it is not a naked type parameter
            and no distribution takes place.
          </>
        ),
        zh: (
          <>
            结果是联合就说明发生了分发。但 <code>T</code> 被 <code>[ ]</code>{" "}
            包住,不是裸类型参数,分发不会发生。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            <code>&quot;a&quot; | 1</code> contains a number, so the union as a
            whole is not assignable to <code>string</code>. Checked as a whole,
            it takes the false branch.
          </>
        ),
        zh: (
          <>
            <code>&quot;a&quot; | 1</code> 里混了个数字, 整个联合不能赋给{" "}
            <code>string</code>。整体判断走的是假分支。
          </>
        ),
      },
      {
        en: (
          <>
            It is valid. Wrapping both sides in a one-element tuple is the
            normal way to turn distribution off.
          </>
        ),
        zh: <>完全合法。把两边都包进单元素元组,正是关闭分发的常规写法。</>,
      },
    ],
    why: {
      en: (
        <>
          <code>[T]</code> means <code>T</code> is no longer a naked type
          parameter, so there is no distribution and the union is checked as one
          type. <code>[&quot;a&quot; | 1]</code> is not assignable to{" "}
          <code>[string]</code>, so the answer is <code>&quot;mixed&quot;</code>
          . Both sides must be wrapped for this to work.
        </>
      ),
      zh: (
        <>
          <code>[T]</code> 让 <code>T</code> 不再是裸类型参数,
          于是不分发,联合被当成一个类型整体判断。
          <code>[&quot;a&quot; | 1]</code> 不能赋给 <code>[string]</code>,
          所以答案是 <code>&quot;mixed&quot;</code>。注意两边都要包,才有效。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          What does the <code>infer</code> keyword do?
        </>
      ),
      zh: (
        <>
          <code>infer</code> 关键字的作用是什么?
        </>
      ),
    },
    opts: [
      {
        en: <>It tells TypeScript to skip type checking for that part</>,
        zh: <>让 TypeScript 跳过这一段的类型检查</>,
      },
      {
        en: (
          <>
            It declares a type variable inside the pattern after{" "}
            <code>extends</code>; when the pattern matches, that variable holds
            the matched type and can be used in the true branch
          </>
        ),
        zh: (
          <>
            在 <code>extends</code> 后面的模式里声明一个类型变量;
            模式匹配成功时,这个变量装着匹配到的类型,真分支里可以用
          </>
        ),
      },
      {
        en: <>It works out the run-time value of a variable</>,
        zh: <>推断变量在运行时的实际值</>,
      },
      {
        en: <>It declares a new type parameter for the caller to fill in</>,
        zh: <>声明一个新的类型参数,由调用方填入</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            Skipping checks is what <code>any</code> does. <code>infer</code> is
            the opposite: it reads a precise type out of a structure.
          </>
        ),
        zh: (
          <>
            跳过检查是 <code>any</code> 的事。<code>infer</code>{" "}
            恰恰相反:它从结构里精确地读出一个类型。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            The type world cannot reach run time. <code>infer</code> captures
            part of a type structure, and no code runs.
          </>
        ),
        zh: (
          <>
            类型世界碰不到运行时。<code>infer</code>{" "}
            抓的是类型结构里的一块,没有任何代码会执行。
          </>
        ),
      },
      {
        en: (
          <>
            Type parameters are declared in angle brackets and filled in by the
            caller. <code>infer</code> can appear only in the pattern after{" "}
            <code>extends</code>, and the compiler fills it in while matching.
          </>
        ),
        zh: (
          <>
            类型参数写在尖括号里,由调用方填。<code>infer</code> 只能出现在{" "}
            <code>extends</code> 后面的模式里,由编译器在匹配时填上。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>T extends Promise&lt;infer U&gt; ? U : T</code> reads as: if{" "}
          <code>T</code> has the shape <code>Promise&lt;something&gt;</code>,
          call that something <code>U</code> and return it. It is destructuring,
          done on types.
        </>
      ),
      zh: (
        <>
          <code>T extends Promise&lt;infer U&gt; ? U : T</code> 读作:如果{" "}
          <code>T</code> 长成 <code>Promise&lt;某个类型&gt;</code> 的样子,
          就把那个类型记作 <code>U</code> 并返回它。相当于对类型做解构。
        </>
      ),
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          In a mapped type, which symbol goes before <code>?</code> to{" "}
          <b>remove</b> the optional modifier, so that every property becomes
          required? Type the symbol: ____
        </>
      ),
      zh: (
        <>
          映射类型里,要把可选修饰符<b>去掉</b>(让所有属性变成必填), 该在{" "}
          <code>?</code> 前面写哪个符号?填空:____
        </>
      ),
    },
    placeholder: { en: "Type the symbol…", zh: "输入符号…" },
    answers: ["-", "-?", "−", "−?"],
    hint: {
      en: (
        <>
          A modifier can be added or removed. <code>+</code> adds it and may be
          left out; one other symbol removes it. The hand-written{" "}
          <code>Required</code> uses that one.
        </>
      ),
      zh: (
        <>
          修饰符能加也能减:<code>+</code> 是加,可以省略不写;
          另一个符号是减。手写版 <code>Required</code> 用的就是它。
        </>
      ),
    },
    why: {
      en: (
        <>
          <code>{"{ [K in keyof T]-?: T[K] }"}</code> removes the <code>?</code>{" "}
          from every property, which is exactly how <code>Required</code> is
          defined. Under <code>strictNullChecks</code> it also removes{" "}
          <code>undefined</code> from the property type. <code>-readonly</code>{" "}
          removes <code>readonly</code> the same way.
        </>
      ),
      zh: (
        <>
          <code>{"{ [K in keyof T]-?: T[K] }"}</code> 把每个属性的{" "}
          <code>?</code> 去掉,这正是 <code>Required</code> 的定义。 在{" "}
          <code>strictNullChecks</code> 下,它同时把属性类型里的{" "}
          <code>undefined</code> 也去掉。<code>-readonly</code> 同理,用来去掉{" "}
          <code>readonly</code>。
        </>
      ),
    },
  },
  {
    type: "multi",
    q: {
      en: (
        <>
          Which pieces does the hand-written{" "}
          <code>
            MyPick&lt;T, K extends keyof T&gt; = {"{ [P in K]: T[P] }"}
          </code>{" "}
          use? (choose all that apply)
        </>
      ),
      zh: (
        <>
          手写版{" "}
          <code>
            MyPick&lt;T, K extends keyof T&gt; = {"{ [P in K]: T[P] }"}
          </code>{" "}
          用到了哪些零件?(多选)
        </>
      ),
    },
    opts: [
      {
        en: <>A mapped type (the loop over keys)</>,
        zh: <>映射类型(逐键循环)</>,
      },
      {
        en: (
          <>
            A conditional type (<code>extends ? :</code>)
          </>
        ),
        zh: (
          <>
            条件类型(<code>extends ? :</code>)
          </>
        ),
      },
      {
        en: (
          <>
            A generic constraint (<code>K extends keyof T</code>)
          </>
        ),
        zh: (
          <>
            泛型约束(<code>K extends keyof T</code>)
          </>
        ),
      },
      {
        en: (
          <>
            Indexed access (<code>T[P]</code>)
          </>
        ),
        zh: (
          <>
            索引访问(<code>T[P]</code>)
          </>
        ),
      },
      <>infer</>,
      {
        en: <>Template literal types</>,
        zh: <>模板字面量类型</>,
      },
    ],
    correct: [0, 2, 3],
    missHint: {
      en: (
        <>
          Something is still missing. Read the line from left to right and name
          each part: what are the square brackets doing? what is the{" "}
          <code>extends</code> inside the angle brackets? what is{" "}
          <code>T[P]</code> after the colon?
        </>
      ),
      zh: (
        <>
          还漏了。把那行从左读到右,逐段对号:方括号在做什么? 尖括号里的{" "}
          <code>extends</code> 是什么?冒号后面的 <code>T[P]</code> 又是什么?
        </>
      ),
    },
    extraHint: {
      en: (
        <>
          One selection too many. The <code>extends</code> on this line is
          inside the <b>angle brackets</b>, so it is the generic constraint from
          chapter 05, not the <code>? :</code> of a conditional type.{" "}
          <code>Pick</code> uses no conditional type, no <code>infer</code>, and
          no template literal type.
        </>
      ),
      zh: (
        <>
          多勾了。这一行里的 <code>extends</code> 出现在<b>尖括号里</b>, 那是第
          05 章的泛型约束,不是条件类型的 <code>? :</code>。<code>Pick</code>{" "}
          没用条件类型,也没用 <code>infer</code> 和模板字面量类型。
        </>
      ),
    },
    why: {
      en: (
        <>
          Three pieces: the mapped type loops over <code>K</code>, the generic
          constraint makes sure every name in <code>K</code> is a real key of{" "}
          <code>T</code> (this is why <code>Pick</code> is strict), and indexed
          access copies the original property type. No conditional type, no{" "}
          <code>infer</code>.
        </>
      ),
      zh: (
        <>
          三个零件:映射类型对 <code>K</code> 逐键循环; 泛型约束保证{" "}
          <code>K</code> 里的每个名字都是 <code>T</code> 上真实的键(
          <code>Pick</code> 严格的根源);
          索引访问把原来的属性类型抄过来。没有条件类型,也没有 <code>infer</code>
          。
        </>
      ),
    },
  },
];
