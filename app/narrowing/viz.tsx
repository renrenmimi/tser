"use client";

// Chapter 03 visualizations:
//  - HeroGate: the miniature checkpoint in the hero (decorative).
//  - TypeFunnel: the chapter's main figure. Every member of a union queues up
//    at a series of checks; each check removes one member; the end is never.
//  - GuardsExplorer: the checks that narrow, with code, the compiler's
//    conclusion, and the mistake that goes with each one.
//  - OrderSwitchDemo: pick an order status, see what the compiler knows
//    inside that branch.

import { useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
import { CodeBlock } from "@/lib/code";
import { T, useL, type Loc } from "@/lib/i18n";

/* ================= HeroGate ================= */

export function HeroGate() {
  return (
    <div className="nr-hero" aria-hidden>
      <div className="nr-hero-stamp">SECURITY CHECK</div>
      <div className="nr-hero-row roomy">
        <span className="nr-hero-code">x: string | number | null</span>
        <span className="nr-hero-tag">
          <T en="Before any check: three possibilities" zh="过检前:三种可能" />
        </span>
      </div>
      <div className="nr-hero-gate">▼ if (x === null) return</div>
      <div className="nr-hero-row">
        <span className="nr-hero-code">x: string | number</span>
        <span className="nr-hero-tag">
          <T en="One possibility removed" zh="少一种可能" />
        </span>
      </div>
      <div className="nr-hero-gate">▼ if (typeof x === &quot;string&quot;) …</div>
      <div className="nr-hero-row">
        <span className="nr-hero-code lit">x: number</span>
        <span className="nr-hero-tag">
          <T
            en="In the else branch only one is left"
            zh="else 分支里只剩一种"
          />
        </span>
      </div>
    </div>
  );
}

/* ================= TypeFunnel ================= */

interface FunnelMember {
  k: string;
  label: string;
}

const MEMBERS: FunnelMember[] = [
  { k: "string", label: "string" },
  { k: "number", label: "number" },
  { k: "boolean", label: "boolean" },
  { k: "null", label: "null" },
];

interface FunnelGate {
  /** the code written at this check */
  code: Loc<string>;
  /** the member this check removes */
  catches: string;
  /** hypothetical check, shown only in the last frame */
  ghost?: boolean;
}

const GATES: FunnelGate[] = [
  { code: 'if (x === null) return "nothing here"', catches: "null" },
  {
    code: 'if (typeof x === "string") return "text: " + x',
    catches: "string",
  },
  { code: 'if (typeof x === "number") return x.toFixed(2)', catches: "number" },
  {
    code: {
      en: '(hypothetical) if (typeof x === "boolean") return …',
      zh: '(假想)if (typeof x === "boolean") return …',
    },
    catches: "boolean",
    ghost: true,
  },
];

// checks processed by the end of each frame. Frame 4 adds no check (it explains
// the else branch); frame 5 turns on the hypothetical check.
const FRAME_GATES = [0, 1, 2, 3, 3, 4];

const FRAME_MSGS: ReactNode[] = [
  <T
    key="f0"
    en={
      <>
        A value arrives with the type{" "}
        <code>x: string | number | boolean | null</code>. At this point the
        compiler has to treat all four as possible, so you may only use the
        members that <b>all four have</b>.
      </>
    }
    zh={
      <>
        一个值进来了,类型是{" "}
        <code>x: string | number | boolean | null</code>
        。此刻编译器必须按「四种都有可能」处理,所以你只能使用
        <b>四种类型共有</b>的成员。
      </>
    }
  />,
  <T
    key="f1"
    en={
      <>
        First check: <code>x === null</code>. The equality test catches{" "}
        <code>null</code> and the branch returns, so <code>null</code> never
        continues. Look at the type below: it has{" "}
        <b>one possibility fewer</b>.
      </>
    }
    zh={
      <>
        第一道检查:<code>x === null</code>。相等比较把 <code>null</code>{" "}
        拦下,分支直接 return,所以 <code>null</code>{" "}
        不会往下走。看下方的类型:它<b>少了一种可能</b>。
      </>
    }
  />,
  <T
    key="f2"
    en={
      <>
        Second check: <code>typeof x === &quot;string&quot;</code>. Text goes
        into the <code>if</code> branch. On that path <code>x</code> is exactly{" "}
        <code>string</code>, so <code>toUpperCase</code> is available there.
      </>
    }
    zh={
      <>
        第二道检查:<code>typeof x === &quot;string&quot;</code>
        。文本走进 <code>if</code> 分支。在那条路径上,<code>x</code>{" "}
        就是 <code>string</code>,可以直接用 <code>toUpperCase</code>。
      </>
    }
  />,
  <T
    key="f3"
    en={
      <>
        Third check: numbers leave as well. Each check makes the type one
        member narrower. That is what <b>narrowing</b> means, and the compiler
        tracks it line by line.
      </>
    }
    zh={
      <>
        第三道检查:数字也走了。每过一道检查,类型就少一个成员。
        这就是<b>收窄</b>的含义,而且编译器是逐行跟踪的。
      </>
    }
  />,
  <T
    key="f4"
    en={
      <>
        No check is written here, yet the compiler still knows that the
        remaining <code>x</code> can only be <code>boolean</code>. It removed
        the other three itself. <b>The else path narrows too</b>: a possibility
        that was handled earlier does not come back.
      </>
    }
    zh={
      <>
        这里一行检查都没写,编译器依然知道剩下的 <code>x</code> 只可能是{" "}
        <code>boolean</code> —— 另外三种是它自己排除掉的。
        <b>else 路径同样会收窄</b>:前面已经处理掉的可能不会再回来。
      </>
    }
  />,
  <T
    key="f5"
    en={
      <>
        Now imagine one more check that removes <code>boolean</code> as well.
        After it, the type is <code>never</code>: the <b>empty union</b>, a
        type with no possible values. Remember it — the exhaustiveness check in
        §06 is built on exactly this.
      </>
    }
    zh={
      <>
        再假想加一道检查,把 <code>boolean</code> 也排除掉。
        之后的类型就是 <code>never</code>:<b>空联合</b>
        ,一个没有任何可能取值的类型。记住它 —— §06
        的穷尽检查完全建立在这个「空」之上。
      </>
    }
  />,
];

export function TypeFunnel() {
  const L = useL();
  const stepper = useStepper(FRAME_MSGS.length, 2400);
  const step = stepper.step;
  const processed = FRAME_GATES[step];

  const caughtSet = new Set(GATES.slice(0, processed).map((g) => g.catches));
  const remaining = MEMBERS.filter((m) => !caughtSet.has(m.k));
  const typeExpr =
    remaining.length === 0 ? "never" : remaining.map((m) => m.label).join(" | ");

  return (
    <div className="viz nr-funnel">
      <div className="viz-title">
        <T
          en="One union, one check at a time"
          zh="类型漏斗:一个联合类型,一道道检查过去"
        />
      </div>
      <div className="viz-stage">
        <div className="nr-fn">
          {/* entry */}
          <div className="nr-fn-entry">
            <span className="nr-fn-lab">
              <T en="Coming in" zh="进入" />
            </span>
            <code className="nr-fn-type">
              x: string | number | boolean | null
            </code>
          </div>

          {/* checks */}
          {GATES.map((g, gi) => {
            const done = processed > gi;
            const active = processed === gi + 1 && step === gi + 1;
            if (g.ghost && step < 5) return null;
            return (
              <div
                key={g.catches}
                className={`nr-fn-gate${done ? " done" : ""}${
                  active ? " active" : ""
                }${g.ghost ? " ghost" : ""}`}
              >
                <span className="nr-fn-gate-code">{L(g.code)}</span>
                <span className="nr-fn-gate-catch">
                  {done ? (
                    <span className="nr-chip caught" data-m={g.catches}>
                      {g.catches} ↩{" "}
                      <T en="handled here" zh="在此处理" />
                    </span>
                  ) : (
                    <span className="nr-fn-wait">
                      <T en="…not checked yet" zh="…待检" />
                    </span>
                  )}
                </span>
              </div>
            );
          })}

          {/* exit */}
          <div
            className={`nr-fn-outlet${remaining.length === 0 ? " empty" : ""}`}
          >
            <span className="nr-fn-lab">
              {remaining.length === 0 ? (
                <T en="Nothing reaches here" zh="没有值能走到这里" />
              ) : (
                <T en="x at this point" zh="走到这里的 x" />
              )}
            </span>
            <div className="nr-fn-chips">
              {remaining.map((m) => (
                <span key={m.k} className="nr-chip" data-m={m.k}>
                  {m.label}
                </span>
              ))}
              {remaining.length === 0 && (
                <span className="nr-chip never">
                  <T en="never (empty union)" zh="never(空联合)" />
                </span>
              )}
            </div>
            <code className="nr-fn-type out">x: {typeExpr}</code>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {FRAME_MSGS[step]}
      </div>
      <StepControls stepper={stepper} step={step} total={FRAME_MSGS.length} />
    </div>
  );
}

/* ================= GuardsExplorer ================= */

interface Guard {
  k: string;
  name: Loc<string>;
  tagline: Loc<string>;
  code: Loc<string>;
  view: ReactNode;
  pit?: ReactNode;
}

const GUARDS: Guard[] = [
  {
    k: "typeof",
    name: "typeof",
    tagline: { en: "primitive types", zh: "查原始类型" },
    code: {
      en: `function fmt(x: string | number) {
  if (typeof x === "string") {
    return x.toUpperCase(); // on this path x is string
  }
  return x.toFixed(2);      // only number reaches this line
}`,
      zh: `function fmt(x: string | number) {
  if (typeof x === "string") {
    return x.toUpperCase(); // 这条路径上 x 是 string
  }
  return x.toFixed(2);      // 能走到这一行的只有 number
}`,
    },
    view: (
      <T
        en={
          <>
            When <code>typeof x === &quot;string&quot;</code> is true, the
            compiler removes everything that is not a string; the else branch
            removes the string. <code>typeof</code> returns exactly eight
            strings: <code>&quot;string&quot;</code>,{" "}
            <code>&quot;number&quot;</code>, <code>&quot;bigint&quot;</code>,{" "}
            <code>&quot;boolean&quot;</code>, <code>&quot;symbol&quot;</code>,{" "}
            <code>&quot;undefined&quot;</code>,{" "}
            <code>&quot;object&quot;</code> and{" "}
            <code>&quot;function&quot;</code>. It is the first choice for
            primitive types.
          </>
        }
        zh={
          <>
            <code>typeof x === &quot;string&quot;</code> 为真时,
            编译器排除掉所有不是字符串的可能;else 分支里再把字符串排除掉。
            <code>typeof</code> 的返回值只有八种:
            <code>&quot;string&quot;</code>、<code>&quot;number&quot;</code>、
            <code>&quot;bigint&quot;</code>、<code>&quot;boolean&quot;</code>、
            <code>&quot;symbol&quot;</code>、
            <code>&quot;undefined&quot;</code>、
            <code>&quot;object&quot;</code>、
            <code>&quot;function&quot;</code>。判断原始类型,它是首选。
          </>
        }
      />
    ),
    pit: (
      <T
        en={
          <>
            <b>typeof null === &quot;object&quot;</b>. This has been true since
            the first version of JavaScript in 1995 and cannot be changed
            without breaking existing code. So{" "}
            <code>typeof x === &quot;object&quot;</code> does not exclude{" "}
            <code>null</code>. Write <code>x !== null</code> first.
          </>
        }
        zh={
          <>
            <b>typeof null === &quot;object&quot;</b>。这个行为从 1995 年
            JavaScript 的第一个版本就是如此,改动会破坏现有代码,所以不会再改。
            也就是说 <code>typeof x === &quot;object&quot;</code> 排除不掉{" "}
            <code>null</code>,得先写一句 <code>x !== null</code>。
          </>
        }
      />
    ),
  },
  {
    k: "truthy",
    name: { en: "truthiness", zh: "真值检查" },
    tagline: { en: "if (x)", zh: "if (x) 一刀切" },
    code: {
      en: `function label(count: number | undefined) {
  if (count) {
    return count.toFixed(0) + " items"; // count: number
  }
  return "out of stock"; // count: number | undefined — and 0 lands here too
}`,
      zh: `function label(count: number | undefined) {
  if (count) {
    return count.toFixed(0) + " items"; // count: number
  }
  return "out of stock"; // count: number | undefined —— 0 也落在这里
}`,
    },
    view: (
      <T
        en={
          <>
            <code>if (count)</code> removes <b>every falsy value</b>:{" "}
            <code>undefined</code>, <code>null</code>, <code>0</code>,{" "}
            <code>&quot;&quot;</code> and <code>NaN</code>. It narrows the most
            in one line, which is also why it is the easiest one to get wrong.
          </>
        }
        zh={
          <>
            <code>if (count)</code> 会排除<b>所有 falsy 值</b>:
            <code>undefined</code>、<code>null</code>、<code>0</code>、
            <code>&quot;&quot;</code>、<code>NaN</code>。
            它一行就能收窄最多,这也正是它最容易用错的原因。
          </>
        }
      />
    ),
    pit: (
      <T
        en={
          <>
            <code>0</code> and <code>&quot;&quot;</code> are usually real data:
            zero toppings, an empty note. A truthiness check treats them as
            missing. If you only want to exclude <code>undefined</code>, write{" "}
            <code>count !== undefined</code>.
          </>
        }
        zh={
          <>
            <code>0</code> 和 <code>&quot;&quot;</code> 通常是真实数据:
            0 份配料、空的备注。真值检查却把它们当成「没填」。
            如果你只想排除 <code>undefined</code>,就写{" "}
            <code>count !== undefined</code>。
          </>
        }
      />
    ),
  },
  {
    k: "equal",
    name: { en: "equality", zh: "相等比较" },
    tagline: { en: "=== and != null", zh: "=== 与 != null" },
    code: {
      en: `function ship(dest: string | null | undefined) {
  if (dest != null) {
    // loose != null removes null and undefined in one check
    return "Shipping to " + dest; // dest: string
  }
  return "Pick up in store";
}`,
      zh: `function ship(dest: string | null | undefined) {
  if (dest != null) {
    // 宽松的 != null 一次排掉 null 和 undefined
    return "Shipping to " + dest; // dest: string
  }
  return "Pick up in store";
}`,
    },
    view: (
      <T
        en={
          <>
            <code>===</code>, <code>!==</code>, <code>==</code> and{" "}
            <code>!=</code> all narrow. <code>x != null</code> uses loose
            equality, which treats <code>null</code> and{" "}
            <code>undefined</code> as equal, so one check removes{" "}
            <b>both</b>. That is the one place where loose equality is worth
            using on purpose.
          </>
        }
        zh={
          <>
            <code>===</code>、<code>!==</code>、<code>==</code>、
            <code>!=</code> 都能收窄。<code>x != null</code>{" "}
            用的是宽松相等,而宽松相等认为 <code>null</code> 和{" "}
            <code>undefined</code> 相等,所以一次检查就能<b>同时</b>
            排掉两者。这是宽松相等唯一值得刻意使用的场合。
          </>
        }
      />
    ),
  },
  {
    k: "in",
    name: "in",
    tagline: { en: "does the property exist?", zh: "属性存不存在?" },
    code: {
      en: `type Tea = { steep: () => void };
type Coffee = { grind: () => void };

function brew(drink: Tea | Coffee) {
  if ("steep" in drink) {
    drink.steep(); // drink: Tea
  } else {
    drink.grind(); // drink: Coffee
  }
}`,
      zh: `type Tea = { steep: () => void };
type Coffee = { grind: () => void };

function brew(drink: Tea | Coffee) {
  if ("steep" in drink) {
    drink.steep(); // drink: Tea
  } else {
    drink.grind(); // drink: Coffee
  }
}`,
    },
    view: (
      <T
        en={
          <>
            <code>&quot;steep&quot; in drink</code> asks whether the object has
            that property. The compiler keeps the members that declare it and
            drops the rest. Use it for a union of objects with{" "}
            <b>different shapes</b>, when you do not want to add a tag field.
          </>
        }
        zh={
          <>
            <code>&quot;steep&quot; in drink</code> 问的是这个对象上有没有这个属性。
            编译器保留声明了该属性的成员,排除掉其余的。
            它适合<b>形状不同</b>的对象联合,尤其是你不想额外加一个标签字段的时候。
          </>
        }
      />
    ),
    pit: (
      <T
        en={
          <>
            If the property is declared <b>optional</b>, the else branch does
            not narrow. With{" "}
            <code>type A = &#123; kind: &quot;a&quot;; extra?: string &#125;</code>
            , an <code>A</code> can legitimately have no <code>extra</code>, so
            the compiler keeps <code>A</code> in the else branch as well.
          </>
        }
        zh={
          <>
            如果那个属性声明为<b>可选</b>,else 分支就不会收窄。
            对于{" "}
            <code>type A = &#123; kind: &quot;a&quot;; extra?: string &#125;</code>
            ,一个 <code>A</code> 完全可以没有 <code>extra</code>,
            所以编译器在 else 分支里仍然保留 <code>A</code>。
          </>
        }
      />
    ),
  },
  {
    k: "instanceof",
    name: "instanceof",
    tagline: { en: "the prototype chain", zh: "查原型链" },
    code: {
      en: `function when(x: Date | string) {
  if (x instanceof Date) {
    return x.getTime(); // x: Date
  }
  return new Date(x).getTime(); // x: string
}`,
      zh: `function when(x: Date | string) {
  if (x instanceof Date) {
    return x.getTime(); // x: Date
  }
  return new Date(x).getTime(); // x: string
}`,
    },
    view: (
      <T
        en={
          <>
            <code>x instanceof Date</code> walks the prototype chain of{" "}
            <code>x</code> and asks whether <code>Date.prototype</code> is on
            it. Use it for class instances: <code>Date</code>,{" "}
            <code>Error</code>, your own classes. It cannot help with object
            literals, because they are not created from a constructor.
          </>
        }
        zh={
          <>
            <code>x instanceof Date</code> 沿着 <code>x</code>{" "}
            的原型链往上找,看 <code>Date.prototype</code>{" "}
            在不在上面。它适合类的实例:<code>Date</code>、
            <code>Error</code>、你自己写的 class。
            对字面量对象无效,因为它们不是由构造函数创建的。
          </>
        }
      />
    ),
  },
  {
    k: "isarray",
    name: "Array.isArray",
    tagline: { en: "arrays vs. the rest", zh: "区分数组" },
    code: {
      en: `function toList(x: string | string[]) {
  if (Array.isArray(x)) {
    return x.join(", "); // x: string[]
  }
  return x;              // x: string
}`,
      zh: `function toList(x: string | string[]) {
  if (Array.isArray(x)) {
    return x.join(", "); // x: string[]
  }
  return x;              // x: string
}`,
    },
    view: (
      <T
        en={
          <>
            <code>typeof [] === &quot;object&quot;</code>, so{" "}
            <code>typeof</code> cannot tell an array from a plain object.{" "}
            <code>Array.isArray</code> can, and TypeScript treats it as a
            narrowing check. It is declared in the standard library with a type
            predicate, which is the mechanism §07 explains.
          </>
        }
        zh={
          <>
            <code>typeof [] === &quot;object&quot;</code>,所以{" "}
            <code>typeof</code> 分不出数组和普通对象。
            <code>Array.isArray</code> 分得出,TypeScript 也把它当作收窄检查。
            它在标准库里就是用类型谓词声明的 —— §07 会讲这个机制。
          </>
        }
      />
    ),
  },
  {
    k: "du",
    name: { en: "discriminated union", zh: "可辨识联合" },
    tagline: { en: "sort by a tag field", zh: "靠标签字段分拣" },
    code: {
      en: `switch (order.status) {
  case "paid":
    order.paidAt; // ✓ in this branch paidAt is known to exist
    break;
}`,
      zh: `switch (order.status) {
  case "paid":
    order.paidAt; // ✓ 这个分支里,paidAt 一定存在
    break;
}`,
    },
    view: (
      <T
        en={
          <>
            The first six checks narrow <i>one value</i>. This one compares a
            single field and narrows the <b>whole object</b> to one member of
            the union, including every other field it carries. It is the most
            useful of them in real code, and §05 is about it.
          </>
        }
        zh={
          <>
            前六种检查收窄的是<i>一个值</i>;这一种只比对一个字段,
            却能把<b>整个对象</b>收窄到联合里的某一个成员,
            连它带的其他字段一起确定。在真实代码里它最有用,§05 整节讲它。
          </>
        }
      />
    ),
  },
];

export function GuardsExplorer() {
  const L = useL();
  const [sel, setSel] = useState(0);
  const g = GUARDS[sel];

  return (
    <div className="nr-gx">
      <div
        className="nr-gx-grid"
        role="group"
        aria-label={L({
          en: "Choose a narrowing check",
          zh: "选择一种收窄检查",
        })}
      >
        {GUARDS.map((x, i) => (
          <button
            key={x.k}
            type="button"
            className={`nr-gx-cell${sel === i ? " on" : ""}`}
            onClick={() => setSel(i)}
          >
            <b>{L(x.name)}</b>
            <span>{L(x.tagline)}</span>
          </button>
        ))}
      </div>
      <div className="nr-gx-detail" aria-live="polite">
        <CodeBlock
          lang="ts"
          title={`${L({ en: "Check", zh: "检查" })} ${sel + 1} · ${L(g.name)}`}
          code={g.code}
        />
        <div className="nr-gx-view">
          <span className="nr-gx-view-lab">
            <T en="What the compiler concludes" zh="编译器的结论" />
          </span>
          <p>{g.view}</p>
        </div>
        {g.pit && (
          <div className="nr-gx-pit">
            <span className="nr-gx-pit-lab">
              <T en="Common mistake" zh="常见错误" />
            </span>
            <p>{g.pit}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= OrderSwitchDemo ================= */

const OS_FIELDS = ["createdAt", "paidAt", "deliveredAt"] as const;

interface OsCase {
  status: string;
  has: string[];
  narrowed: string;
  note: ReactNode;
}

const OS_CASES: OsCase[] = [
  {
    status: "pending",
    has: ["createdAt"],
    narrowed: '{ status: "pending"; createdAt: Date; }',
    note: (
      <T
        en={
          <>
            The order was just placed and is not paid yet, so reading{" "}
            <code>order.paidAt</code> in this branch is a compile error. In
            plain JavaScript the same code would quietly give you{" "}
            <code>undefined</code> and then fail on{" "}
            <code>.toLocaleTimeString()</code>.
          </>
        }
        zh={
          <>
            订单刚下,还没付款,所以在这个分支里读{" "}
            <code>order.paidAt</code> 是编译错误。
            换成纯 JavaScript,同样的代码会安静地给你一个{" "}
            <code>undefined</code>,然后在{" "}
            <code>.toLocaleTimeString()</code> 上抛错。
          </>
        }
      />
    ),
  },
  {
    status: "paid",
    has: ["createdAt", "paidAt"],
    narrowed: '{ status: "paid"; createdAt: Date; paidAt: Date; }',
    note: (
      <T
        en={
          <>
            One comparison, <code>status === &quot;paid&quot;</code>, turns{" "}
            <code>paidAt</code> from &quot;may be missing&quot; into
            &quot;always there&quot;. You did not write an extra{" "}
            <code>if</code> and you did not need <code>!</code>.
          </>
        }
        zh={
          <>
            只比对了一句 <code>status === &quot;paid&quot;</code>,
            <code>paidAt</code> 就从「可能没有」变成了「一定有」。
            你没有多写一个 <code>if</code>,也不需要 <code>!</code>。
          </>
        }
      />
    ),
  },
  {
    status: "delivered",
    has: ["createdAt", "paidAt", "deliveredAt"],
    narrowed:
      '{ status: "delivered"; createdAt: Date; paidAt: Date; deliveredAt: Date; }',
    note: (
      <T
        en={
          <>
            The final state has all three timestamps. A delivered order must
            have been paid, so <code>paidAt</code> is part of this member too.
            The type is writing down the <b>business rule</b>.
          </>
        }
        zh={
          <>
            终态有全部三个时间戳。已送达的订单一定付过款,
            所以这个成员里也有 <code>paidAt</code>。
            类型把这条<b>业务规则</b>原样记了下来。
          </>
        }
      />
    ),
  },
];

export function OrderSwitchDemo() {
  const L = useL();
  const [sel, setSel] = useState(1);
  const c = OS_CASES[sel];
  const missing = OS_FIELDS.find((f) => !c.has.includes(f));

  return (
    <div className="viz nr-os">
      <div className="viz-title">
        <T
          en="Pick a status and see what the compiler knows in that branch"
          zh="点一个状态,看编译器在那个分支里知道什么"
        />
      </div>
      <div className="nr-os-switch mono">
        switch (order.status) {"{"} … {"}"}
      </div>
      <div
        className="nr-os-btns"
        role="group"
        aria-label={L({ en: "Choose an order status", zh: "选择订单状态" })}
      >
        {OS_CASES.map((x, i) => (
          <button
            key={x.status}
            type="button"
            className={`nr-os-btn${sel === i ? " on" : ""}`}
            onClick={() => setSel(i)}
          >
            case &quot;{x.status}&quot;
          </button>
        ))}
      </div>
      <div className="nr-os-panel" aria-live="polite">
        <div className="nr-os-line">
          <span className="nr-os-lab">
            <T
              en="Type of order in this branch"
              zh="此分支里 order 的类型"
            />
          </span>
          <code className="nr-os-type">{c.narrowed}</code>
        </div>
        <div className="nr-os-fields">
          <span className="nr-os-field ok">status ✓</span>
          {OS_FIELDS.map((f) => {
            const ok = c.has.includes(f);
            return (
              <span key={f} className={`nr-os-field ${ok ? "ok" : "no"}`}>
                {f} {ok ? "✓" : "✕"}
              </span>
            );
          })}
        </div>
        {missing && (
          <div className="nr-os-err mono">
            order.{missing} → Property &apos;{missing}&apos; does not exist on
            type &apos;{c.narrowed}&apos;.
          </div>
        )}
        <p className="nr-os-note">{c.note}</p>
      </div>
    </div>
  );
}
