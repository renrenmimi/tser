"use client";

// 第 01 章专属可视化(双语:文案用 <T en zh />,代码与类型名保持原样):
//  - HeroIdCards:hero 里三张悬浮的「值的身份证」(纯装饰)。
//  - IdWall:原始类型证件墙 —— 点一个值,右侧发一张身份证(类型 + 说明)。
//  - InferenceLens:推断放大镜 —— 一段代码逐行步进,右侧实时显示推断结果;
//    let / const 对照开关演示拓宽(widening)差异。

import { useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
import { T, useL } from "@/lib/i18n";

/* ================= HeroIdCards ================= */

const HERO_CARDS = [
  { value: '"Grape Tea"', type: "string" },
  { value: "22", type: "number" },
  { value: "false", type: "boolean" },
];

export function HeroIdCards() {
  return (
    <div className="tp-heroids" aria-hidden>
      {HERO_CARDS.map((c, i) => (
        <div className="tp-idcard" key={i} style={{ "--i": i } as React.CSSProperties}>
          <div className="tp-idcard-head">
            <T en="TYPE ID" zh="TYPE ID · 值的身份证" />
          </div>
          <div className="tp-idcard-row">
            <span className="k">
              <T en="Value" zh="值" />
            </span>
            <span className="v">{c.value}</span>
          </div>
          <div className="tp-idcard-row">
            <span className="k">
              <T en="Type" zh="类型" />
            </span>
            <span className="v t">{c.type}</span>
          </div>
          <div className="tp-idcard-foot">
            <T
              en="Issued automatically by type inference"
              zh="签发机关:类型推断 · 免申请"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================= IdWall ================= */

interface IdEntry {
  /** 墙上展示的值(代码,不翻译) */
  value: string;
  type: string;
  /** 一句话说明 */
  info: ReactNode;
  /** 补充小字(可选) */
  extra?: ReactNode;
}

const ID_ENTRIES: IdEntry[] = [
  {
    value: '"Grape Tea"',
    type: "string",
    info: (
      <T
        en={
          <>
            A sequence of characters. Single quotes, double quotes, and
            backticks all produce the same type: string.
          </>
        }
        zh={
          <>
            一串字符。单引号、双引号、反引号包起来的都一样 ——
            对类型系统来说没区别,都是 string。
          </>
        }
      />
    ),
  },
  {
    value: "22",
    type: "number",
    info: (
      <T
        en={
          <>
            JavaScript and TypeScript have one number type. 22, 19.5, and -3 are
            all number. There is no separate int and float here.
          </>
        }
        zh={
          <>
            JS/TS 只有一种数字类型:22、19.5、-3 都是 number。
            别的语言里的 int / float 之分,这里没有。
          </>
        }
      />
    ),
  },
  {
    value: "NaN",
    type: "number",
    info: (
      <T
        en={
          <>
            NaN means &quot;Not a Number&quot;, and its type is number. So the
            type system cannot stop a NaN from appearing. You stop it by
            checking the value that produced it, which is usually an undefined.
          </>
        }
        zh={
          <>
            NaN 的意思是「不是数」,可它的类型偏偏是 number。
            所以类型系统拦不住 NaN —— 要拦,得去查产生它的那个值,
            通常是某个 undefined。
          </>
        }
      />
    ),
  },
  {
    value: "true",
    type: "boolean",
    info: (
      <T
        en={
          <>
            Exactly two values live in this type: true and false. It is one of
            the smallest types you will meet.
          </>
        }
        zh={<>整个类型里只有两个值:true 和 false —— 最小的类型之一。</>}
      />
    ),
  },
  {
    value: "null",
    type: "null",
    info: (
      <T
        en={
          <>
            &quot;Nothing here, on purpose.&quot; A null only appears because
            some code assigned it. It usually means &quot;this field exists and
            is deliberately empty&quot;.
          </>
        }
        zh={
          <>
            「这里空着」,而且是<b>有意为之</b>的空。
            null 不会自己出现,一定是某段代码把它赋了进去 ——
            通常表示「这个字段存在,但故意留空」。
          </>
        }
      />
    ),
    extra: (
      <T
        en={
          <>
            A historical bug in JavaScript:{" "}
            <code>typeof null === &quot;object&quot;</code>. It cannot be fixed
            without breaking old code. In the TypeScript type system, null is
            its own type.
          </>
        }
        zh={
          <>
            历史包袱:<code>typeof null === &quot;object&quot;</code> 是 JS
            著名的 bug,为了兼容旧代码改不了了。但在 TS 的类型系统里,
            null 就是 null 这个独立类型。
          </>
        }
      />
    ),
  },
  {
    value: "undefined",
    type: "undefined",
    info: (
      <T
        en={
          <>
            &quot;No value was ever put here.&quot; You get undefined from a
            variable that was declared but not assigned, from a property that
            does not exist, and from a function that returns nothing.
          </>
        }
        zh={
          <>
            「从来没人往这儿放过值」。声明了没赋值、读一个不存在的属性、
            函数没有 return —— 拿到的都是它。
          </>
        }
      />
    ),
    extra: (
      <T
        en={
          <>
            null and undefined are two different values with two different
            meanings. They only stay separate types because{" "}
            <code>strictNullChecks</code> is on. With that flag off, both are
            assignable to every type and the compiler stops warning you.
          </>
        }
        zh={
          <>
            null 和 undefined 是两个不同的值,含义也不同。
            它们之所以是两个独立的类型,是因为 <code>strictNullChecks</code>{" "}
            开着;这个开关一关,两者可以赋给任何类型,编译器也就不再提醒你了。
          </>
        }
      />
    ),
  },
  {
    value: "9007199254740993n",
    type: "bigint",
    info: (
      <T
        en={
          <>
            An integer too large for number to hold exactly. You write it with
            an <code>n</code> suffix. Rare in everyday application code.
          </>
        }
        zh={
          <>
            大到 number 存不准的整数,写法是在数字后面加一个 <code>n</code>。
            日常业务代码几乎用不上,知道有这户人家就行。
          </>
        }
      />
    ),
  },
  {
    value: 'Symbol("vip")',
    type: "symbol",
    info: (
      <T
        en={
          <>
            A value that is guaranteed to be different from every other value.
            It is mostly used as an object key that cannot collide with another
            key. Rare in everyday application code.
          </>
        }
        zh={
          <>
            保证和其他任何值都不相等的值,常用来做「绝不会撞名」的对象键。
            日常业务代码里也少见,遇到再回来查。
          </>
        }
      />
    ),
  },
];

export function IdWall() {
  const L = useL();
  const [sel, setSel] = useState(0);
  const e = ID_ENTRIES[sel];

  return (
    <div className="tp-wall">
      <div
        className="tp-wall-grid"
        role="group"
        aria-label={L({
          en: "Pick a value to see its type",
          zh: "点一个值,看它的类型",
        })}
      >
        {ID_ENTRIES.map((it, i) => (
          <button
            key={i}
            type="button"
            className={`tp-wall-chip${sel === i ? " on" : ""}`}
            onClick={() => setSel(i)}
          >
            {it.value}
          </button>
        ))}
      </div>
      <div className="tp-wall-card" aria-live="polite">
        <div className="tp-idcard tp-idcard-big">
          <div className="tp-idcard-head">
            <T en="TYPE ID" zh="TYPE ID · 值的身份证" />
          </div>
          <div className="tp-idcard-row">
            <span className="k">
              <T en="Value" zh="值" />
            </span>
            <span className="v">{e.value}</span>
          </div>
          <div className="tp-idcard-row">
            <span className="k">
              <T en="Type" zh="类型" />
            </span>
            <span className="v t">{e.type}</span>
          </div>
        </div>
        <p className="tp-wall-info">{e.info}</p>
        {e.extra && <p className="tp-wall-extra">☞ {e.extra}</p>}
      </div>
    </div>
  );
}

/* ================= InferenceLens ================= */

type LensMode = "let" | "const";

interface LensLine {
  /** 代码(两种语言相同) */
  code: Record<LensMode, string>;
  /** 推断结果;报错行填编译器原文(原文不翻译,只翻译前缀标记) */
  type: Record<LensMode, ReactNode>;
  /** 该模式下这一行是否报错 */
  err?: Partial<Record<LensMode, boolean>>;
  note: Record<LensMode, ReactNode>;
}

const LENS_LINES: LensLine[] = [
  {
    code: {
      let: 'let drink = "Grape Tea";',
      const: 'const drink = "Grape Tea";',
    },
    type: { let: "string", const: '"Grape Tea"' },
    note: {
      let: (
        <T
          en={
            <>
              A <code>let</code> variable can be assigned again later, so
              TypeScript records the <b>wider</b> type: &quot;some string&quot;.
              Going from the literal type to string is called{" "}
              <b>widening</b>.
            </>
          }
          zh={
            <>
              <code>let</code> 声明的变量以后还能改,所以 TS 往<b>宽</b>了记:
              「反正是个字符串」。从字面量类型放宽到 string,这个动作叫
              <b>拓宽(widening)</b>。
            </>
          }
        />
      ),
      const: (
        <T
          en={
            <>
              A <code>const</code> variable is never assigned again, so
              TypeScript can be exact: the type is the literal{" "}
              <code>&quot;Grape Tea&quot;</code> itself. That is much narrower
              than string, and it is called a <b>literal type</b>.
            </>
          }
          zh={
            <>
              <code>const</code> 变量不会再被赋值,TS 就敢把话说死:
              类型就是字面量 <code>&quot;Grape Tea&quot;</code> 本身 ——
              比 string 窄得多,这叫<b>字面量类型</b>。
            </>
          }
        />
      ),
    },
  },
  {
    code: { let: "let price = 22;", const: "const price = 22;" },
    type: { let: "number", const: "22" },
    note: {
      let: (
        <T
          en={
            <>
              Same rule for numbers. The starting value is 22, but the variable
              may become 19.5 later, so the type is number. Notice that you did
              not write a single colon.
            </>
          }
          zh={
            <>
              数字同理:初始值是 22,但以后可能改成 19.5,所以记成 number。
              注意你一个冒号都没写。
            </>
          }
        />
      ),
      const: (
        <T
          en={
            <>
              The <code>const</code> version gets the literal type 22. The
              compiler can promise that this variable is always exactly 22.
            </>
          }
          zh={
            <>
              <code>const</code> 版直接记成字面量类型 22 ——
              「这个变量永远是 22」,编译器敢替你担保。
            </>
          }
        />
      ),
    },
  },
  {
    code: { let: "let soldOut = false;", const: "const soldOut = false;" },
    type: { let: "boolean", const: "false" },
    note: {
      let: (
        <T
          en={
            <>
              Booleans widen too: <code>let</code> gives boolean, which holds
              both true and false.
            </>
          }
          zh={
            <>
              布尔也一样:<code>let</code> 拓宽成 boolean,true 和 false 都能装。
            </>
          }
        />
      ),
      const: (
        <T
          en={
            <>
              The <code>const</code> version has the type false. In chapter 03
              you will see that this &quot;one value, one type&quot; idea is the
              basis of unions and narrowing.
            </>
          }
          zh={
            <>
              <code>const</code> 版的类型就是 false。第 03
              章你会看到,这种「一个值就是一个类型」正是联合类型和收窄的地基。
            </>
          }
        />
      ),
    },
  },
  {
    code: {
      let: 'let sizes = ["small", "medium", "large"];',
      const: 'const sizes = ["small", "medium", "large"];',
    },
    type: { let: "string[]", const: "string[]" },
    note: {
      let: (
        <T
          en={
            <>
              Every element is a string, so the type is <code>string[]</code>,
              read as &quot;array of string&quot;. It can also be written{" "}
              <code>Array&lt;string&gt;</code>.
            </>
          }
          zh={
            <>
              每个元素都是字符串,所以类型是 <code>string[]</code>
              (读作「string 的数组」),也可以写成{" "}
              <code>Array&lt;string&gt;</code>。
            </>
          }
        />
      ),
      const: (
        <T
          en={
            <>
              This one surprises people: <b>the const version is still</b>{" "}
              <code>string[]</code>. <code>const</code> only stops the variable
              name from being reassigned. The array contents can still be
              pushed and changed, so the element type has to stay wide. To lock
              the contents as well, use <code>as const</code> (the final
              chapter).
            </>
          }
          zh={
            <>
              这一行常让人意外:<b>const 版依旧是</b> <code>string[]</code>。
              <code>const</code> 只保证「变量名不能重新赋值」,
              数组内容照样能 push、能改,所以元素类型必须留宽。
              想连内容一起锁死,要用 <code>as const</code>(终章讲)。
            </>
          }
        />
      ),
    },
  },
  {
    code: {
      let: 'let item = { name: "Grape Tea", price: 22 };',
      const: 'const item = { name: "Grape Tea", price: 22 };',
    },
    type: {
      let: "{ name: string; price: number }",
      const: "{ name: string; price: number }",
    },
    note: {
      let: (
        <T
          en={
            <>
              For an object, TypeScript infers the type of every property and
              combines them into one shape. This shape is what later chapters
              keep working with.
            </>
          }
          zh={
            <>
              对象:TS 把每个属性的类型都推出来,拼成一份「形状」。
              后面的章节反复出现的就是这份形状。
            </>
          }
        />
      ),
      const: (
        <T
          en={
            <>
              Same reason as the array. <code>const</code> does not lock the
              properties, so <code>item.price = 19</code> is still legal, and
              the property types widen to string and number. Only{" "}
              <code>as const</code> keeps them as literal types.
            </>
          }
          zh={
            <>
              和数组同理:<code>const</code> 锁不住属性,
              <code>item.price = 19</code> 依然合法,所以属性类型照样拓宽成
              string 和 number。只有 <code>as const</code>{" "}
              才会把它们留成字面量类型。
            </>
          }
        />
      ),
    },
  },
  {
    code: { let: "price = 19.5;", const: "price = 19.5;" },
    type: {
      let: "number",
      const: "Cannot assign to 'price' because it is a constant.",
    },
    err: { const: true },
    note: {
      let: (
        <T
          en={
            <>
              Assigning another number is fine: the type has not changed. This
              is exactly what the wider <code>let</code> type is for.
            </>
          }
          zh={
            <>
              重新赋一个 number,类型没变,放行。<code>let</code>{" "}
              把类型记宽,就是为了给这种正常改动留余地。
            </>
          }
        />
      ),
      const: (
        <T
          en={
            <>
              The <code>const</code> version is rejected at the assignment
              itself, before types are even considered. This rule comes from
              JavaScript. TypeScript only reports it earlier, at compile time.
            </>
          }
          zh={
            <>
              <code>const</code> 版在赋值这一步就被拦下了,还轮不到类型出场。
              这是 JavaScript 自己的规矩,TS 只是把它提前到编译期告诉你。
            </>
          }
        />
      ),
    },
  },
  {
    code: { let: 'price = "half price";', const: 'price = "half price";' },
    type: {
      let: "Type 'string' is not assignable to type 'number'.",
      const: "Cannot assign to 'price' because it is a constant.",
    },
    err: { let: true, const: true },
    note: {
      let: (
        <T
          en={
            <>
              This is the point of the whole section. You{" "}
              <b>never wrote a single type annotation</b>, and TypeScript still
              catches a string being used as a number. An inferred type is just
              as strict as one you write by hand.
            </>
          }
          zh={
            <>
              这一行是整节的重点:你<b>一个类型注解都没写</b>,TS
              照样逮住「拿字符串当数字用」。
              推断出来的类型,和你手写的一样严格。
            </>
          }
        />
      ),
      const: (
        <T
          en={
            <>
              The <code>const</code> version is still stopped at the assignment,
              for the same reason as the previous line.
            </>
          }
          zh={<>const 版依旧在赋值那一关被拦下,理由同上一行。</>}
        />
      ),
    },
  },
];

export function InferenceLens() {
  const L = useL();
  const [mode, setMode] = useState<LensMode>("let");
  const stepper = useStepper(LENS_LINES.length, 2600);
  const cur = LENS_LINES[stepper.step];
  const isErr = !!cur.err?.[mode];

  return (
    <div className="viz tp-lens">
      <div className="viz-title">
        <T
          en="Inference, line by line: what the compiler sees"
          zh="推断放大镜:编译器眼里的每一行"
        />
        <span
          className="tp-lens-switch"
          role="group"
          aria-label={L({
            en: "Compare let and const",
            zh: "let / const 对照",
          })}
        >
          <button
            type="button"
            className={`btn btn-sm${mode === "let" ? " btn-primary" : ""}`}
            onClick={() => setMode("let")}
          >
            let
          </button>
          <button
            type="button"
            className={`btn btn-sm${mode === "const" ? " btn-primary" : ""}`}
            onClick={() => setMode("const")}
          >
            const
          </button>
        </span>
      </div>
      <div className="tp-lens-grid">
        <div className="tp-lens-win">
          <div className="codewin-bar">
            <span className="codewin-dots" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <span className="codewin-name">
              <T
                en={<>menu.ts · line {stepper.step + 1}</>}
                zh={<>menu.ts · 第 {stepper.step + 1} 行放大中</>}
              />
            </span>
            <span style={{ width: 47 }} aria-hidden />
          </div>
          <div className="tp-lens-body">
            {LENS_LINES.map((l, i) => (
              <button
                key={i}
                type="button"
                className={`tp-lens-line${i === stepper.step ? " on" : ""}${
                  l.err?.[mode] && i === stepper.step ? " bad" : ""
                }`}
                onClick={() => {
                  // 点某行直接跳到那一帧(next/prev 是函数式更新,连点安全)
                  const diff = i - stepper.step;
                  for (let k = 0; k < diff; k++) stepper.next();
                  for (let k = 0; k < -diff; k++) stepper.prev();
                }}
              >
                <span className="n">{i + 1}</span>
                <span className="c">{l.code[mode]}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="tp-lens-panel" aria-live="polite">
          <div className="tp-lens-code">{cur.code[mode]}</div>
          <div className={`tp-lens-type${isErr ? " bad" : ""}`}>
            {isErr ? "✗ " : ""}
            {!isErr && <T en="Inferred → " zh="推断 → " />}
            {cur.type[mode]}
          </div>
          <p className="tp-lens-note">{cur.note[mode]}</p>
        </div>
      </div>
      <StepControls
        stepper={stepper}
        step={stepper.step}
        total={LENS_LINES.length}
      />
    </div>
  );
}
