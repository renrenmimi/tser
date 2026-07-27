"use client";

// 第 03 章专属可视化:
//  - HeroGate:hero 里的迷你安检通道(纯装饰)。
//  - TypeFunnel:类型漏斗 —— 本章招牌。一个 union 的所有可能性排队过闸,
//    每过一道守卫就少一种,终点是 never(空集)。逐帧步进,复用 useStepper。
//  - GuardsExplorer:收窄六板斧,点一把看代码、编译器视角和坑。
//  - OrderSwitchDemo:可辨识联合分拣台 —— 点订单状态,看每个分支里
//    编译器「自动知道」的字段。

import { useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
import { CodeBlock } from "@/lib/code";

/* ================= HeroGate ================= */

export function HeroGate() {
  return (
    <div className="nr-hero" aria-hidden>
      <div className="nr-hero-stamp">SECURITY CHECK</div>
      <div className="nr-hero-row roomy">
        <span className="nr-hero-code">x: string | number | null</span>
        <span className="nr-hero-tag">过检前:三种可能</span>
      </div>
      <div className="nr-hero-gate">▼ if (x === null) return</div>
      <div className="nr-hero-row">
        <span className="nr-hero-code">x: string | number</span>
        <span className="nr-hero-tag">少一种</span>
      </div>
      <div className="nr-hero-gate">▼ if (typeof x === &quot;string&quot;) …</div>
      <div className="nr-hero-row">
        <span className="nr-hero-code lit">x: number</span>
        <span className="nr-hero-tag">else 里只剩一种 —— 放行,随便用</span>
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
  /** 闸口上的代码 */
  code: string;
  /** 在这道闸被拦下的成员 k */
  catches: string;
  /** 假想闸口(最后一帧才出现) */
  ghost?: boolean;
}

const GATES: FunnelGate[] = [
  { code: 'if (x === null) return "空空如也"', catches: "null" },
  { code: 'if (typeof x === "string") return "文本:" + x', catches: "string" },
  { code: 'if (typeof x === "number") return x.toFixed(2)', catches: "number" },
  {
    code: '(假想)if (typeof x === "boolean") return …',
    catches: "boolean",
    ghost: true,
  },
];

// 每帧处理完的闸口数:第 4 帧不推进闸口(讲 else 的排除法),第 5 帧启用假想闸
const FRAME_GATES = [0, 1, 2, 3, 3, 4];

const FRAME_MSGS: ReactNode[] = [
  <>
    安检口前站着一个值:<code>x: string | number | boolean | null</code>。
    编译器此刻只敢按「四种都有可能」处理 —— 只能用四种类型的<b>共有成员</b>。
  </>,
  <>
    第一道闸:<code>x === null</code>。相等检查把 null 拦下、就地处理(return
    离场)。注意看右侧:往下走的 x,类型<b>少了一种可能</b>。
  </>,
  <>
    第二道闸:<code>typeof x === &quot;string&quot;</code>。文本分流进 if
    分支 —— 在那条支路上,x 就是纯 string,<code>toUpperCase</code> 随便调。
  </>,
  <>
    第三道闸:数字也分流走了。每过一道闸,类型就窄一分 ——
    这个过程就叫<b>收窄(narrowing)</b>,编译器逐行帮你记账。
  </>,
  <>
    出口:一行检查都没写,编译器也知道剩下的 x 只能是{" "}
    <code>boolean</code> —— 排除法。<b>else 分支同样是收窄</b>,
    被前面拦掉的可能性不会复活。
  </>,
  <>
    假想再加一道闸,把 boolean 也拦掉 —— 闸后的类型是{" "}
    <code>never</code>:<b>空集</b>,谁也不可能走到的地方。
    记住它,§05 的穷尽检查全靠这个「空」。
  </>,
];

export function TypeFunnel() {
  const stepper = useStepper(FRAME_MSGS.length, 2400);
  const step = stepper.step;
  const processed = FRAME_GATES[step];

  const caughtSet = new Set(
    GATES.slice(0, processed).map((g) => g.catches),
  );
  const remaining = MEMBERS.filter((m) => !caughtSet.has(m.k));
  const typeExpr =
    remaining.length === 0 ? "never" : remaining.map((m) => m.label).join(" | ");

  return (
    <div className="viz nr-funnel">
      <div className="viz-title">类型漏斗:一个 union 的安检之旅</div>
      <div className="viz-stage">
        <div className="nr-fn">
          {/* 入口 */}
          <div className="nr-fn-entry">
            <span className="nr-fn-lab">进入安检</span>
            <code className="nr-fn-type">
              x: string | number | boolean | null
            </code>
          </div>

          {/* 闸口 */}
          {GATES.map((g, gi) => {
            const done = processed > gi;
            const active = processed === gi + 1 && step === gi + 1;
            if (g.ghost && step < 5) return null;
            return (
              <div
                key={g.code}
                className={`nr-fn-gate${done ? " done" : ""}${
                  active ? " active" : ""
                }${g.ghost ? " ghost" : ""}`}
              >
                <span className="nr-fn-gate-code">{g.code}</span>
                <span className="nr-fn-gate-catch">
                  {done ? (
                    <span className="nr-chip caught" data-m={g.catches}>
                      {g.catches} ↩ 拦下处理
                    </span>
                  ) : (
                    <span className="nr-fn-wait">…待检</span>
                  )}
                </span>
              </div>
            );
          })}

          {/* 出口 */}
          <div className={`nr-fn-outlet${remaining.length === 0 ? " empty" : ""}`}>
            <span className="nr-fn-lab">
              {remaining.length === 0 ? "闸后无人" : "走到这里的 x"}
            </span>
            <div className="nr-fn-chips">
              {remaining.map((m) => (
                <span key={m.k} className="nr-chip" data-m={m.k}>
                  {m.label}
                </span>
              ))}
              {remaining.length === 0 && (
                <span className="nr-chip never">never(空集)</span>
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
  name: string;
  tagline: string;
  code: string;
  view: ReactNode;
  pit?: ReactNode;
}

const GUARDS: Guard[] = [
  {
    k: "typeof",
    name: "typeof",
    tagline: "查原始类型",
    code: `function fmt(x: string | number) {
  if (typeof x === "string") {
    return x.toUpperCase(); // 这条道上 x: string
  }
  return x.toFixed(2);      // 走到这里,只可能是 number
}`,
    view: (
      <>
        看到 <code>typeof x === &quot;string&quot;</code> 为真,编译器就把
        「不是 string」的可能全划掉;else 里再反着划一遍。
        对付 string / number / boolean 这些原始类型,它是首选。
      </>
    ),
    pit: (
      <>
        <b>typeof null === &quot;object&quot;</b> —— 1995 年遗留的历史
        bug,标准为了兼容一直不敢修。所以{" "}
        <code>typeof x === &quot;object&quot;</code> 挡不住 null,
        得先补一刀 <code>x !== null</code>。
      </>
    ),
  },
  {
    k: "truthy",
    name: "真值检查",
    tagline: "if (x) 一竿子",
    code: `function label(count: number | undefined) {
  if (count) {
    return count.toFixed(0) + " 件"; // count: number
  }
  return "没货"; // count: number | undefined —— 0 也掉进了这里!
}`,
    view: (
      <>
        <code>if (count)</code> 排除的是<b>所有 falsy 值</b>:undefined、
        null、0、&quot;&quot;、NaN,一竿子全打掉 —— 收窄效果最猛,
        误伤也最容易。
      </>
    ),
    pit: (
      <>
        0 和 &quot;&quot; 是无辜的:「0 件配料」「备注为空串」都是合法数据,
        却被当成「没填」。只想排除 undefined?老老实实写{" "}
        <code>count !== undefined</code>。
      </>
    ),
  },
  {
    k: "equal",
    name: "相等比较",
    tagline: "=== 与 != null",
    code: `function ship(dest: string | null | undefined) {
  if (dest != null) {
    // 宽松 != null 一次排掉 null 和 undefined
    return "寄往:" + dest; // dest: string
  }
  return "到店自提";
}`,
    view: (
      <>
        <code>===</code>、<code>!==</code>、<code>==</code>、<code>!=</code>{" "}
        都能收窄。冷知识:<code>x != null</code>(宽松相等)一次排掉 null{" "}
        <b>和</b> undefined —— 这是宽松相等在现代代码里唯一的正经用途。
      </>
    ),
  },
  {
    k: "in",
    name: "in 操作符",
    tagline: "问有没有成员",
    code: `type Tea = { steep: () => void };
type Coffee = { grind: () => void };

function brew(drink: Tea | Coffee) {
  if ("steep" in drink) {
    drink.steep(); // drink: Tea
  } else {
    drink.grind(); // drink: Coffee
  }
}`,
    view: (
      <>
        问包裹一句「身上有没有 steep?」—— 有的归 Tea,没有的归
        Coffee。适合<b>形状不同的对象联合</b>,不用碰值本身。
      </>
    ),
  },
  {
    k: "instanceof",
    name: "instanceof",
    tagline: "查族谱",
    code: `function when(x: Date | string) {
  if (x instanceof Date) {
    return x.getTime(); // x: Date
  }
  return new Date(x).getTime(); // x: string
}`,
    view: (
      <>
        沿原型链查族谱:x 是不是 <code>new Date()</code> 出来的?适合类的实例
        (Date、Error、自家 class)。对字面量对象无效 ——
        它们不是 new 出来的,没族谱可查。
      </>
    ),
  },
  {
    k: "du",
    name: "可辨识联合",
    tagline: "看申报单分拣",
    code: `switch (order.status) {
  case "paid":
    order.paidAt; // ✓ 编译器知道这个分支里一定有 paidAt
    break;
}`,
    view: (
      <>
        前五招收窄的都是「一个值」;这一招凭 status
        这张申报单,把<b>整个对象</b>连皮带馅一次分拣清楚 ——
        六板斧里最工程化的一把,下一节整节讲它。
      </>
    ),
  },
];

export function GuardsExplorer() {
  const [sel, setSel] = useState(0);
  const g = GUARDS[sel];

  return (
    <div className="nr-gx">
      <div className="nr-gx-grid" role="group" aria-label="收窄手段选择">
        {GUARDS.map((x, i) => (
          <button
            key={x.k}
            type="button"
            className={`nr-gx-cell${sel === i ? " on" : ""}`}
            onClick={() => setSel(i)}
          >
            <b>{x.name}</b>
            <span>{x.tagline}</span>
          </button>
        ))}
      </div>
      <div className="nr-gx-detail" aria-live="polite">
        <CodeBlock lang="ts" title={`板斧 ${sel + 1} · ${g.name}`} code={g.code} />
        <div className="nr-gx-view">
          <span className="nr-gx-view-lab">编译器视角</span>
          <p>{g.view}</p>
        </div>
        {g.pit && (
          <div className="nr-gx-pit">
            <span className="nr-gx-pit-lab">坑</span>
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
    narrowed: '{ status: "pending"; createdAt: Date }',
    note: (
      <>
        刚下单,还没付钱 —— 这个分支里访问 <code>order.paidAt</code>{" "}
        是编译错误。JS 时代它会安静地给你一个 undefined,然后在{" "}
        <code>.toLocaleTimeString()</code> 上炸。
      </>
    ),
  },
  {
    status: "paid",
    has: ["createdAt", "paidAt"],
    narrowed: '{ status: "paid"; createdAt: Date; paidAt: Date }',
    note: (
      <>
        比对了一句 <code>status === &quot;paid&quot;</code>,paidAt
        就从「可能没有」变成「一定有」—— 不用 if、不用 <code>!</code>,
        编译器自己想明白的。
      </>
    ),
  },
  {
    status: "delivered",
    has: ["createdAt", "paidAt", "deliveredAt"],
    narrowed:
      '{ status: "delivered"; createdAt: Date; paidAt: Date; deliveredAt: Date }',
    note: (
      <>
        终态:三个时间戳齐了。注意 delivered 一定经历过 paid,所以这个成员里
        paidAt 也在 —— 类型把<b>业务规则</b>原样写了下来。
      </>
    ),
  },
];

export function OrderSwitchDemo() {
  const [sel, setSel] = useState(1);
  const c = OS_CASES[sel];

  return (
    <div className="viz nr-os">
      <div className="viz-title">分拣台:点一个状态,看编译器在分支里知道什么</div>
      <div className="nr-os-switch mono">
        switch (order.status) {"{"} … {"}"}
      </div>
      <div className="nr-os-btns" role="group" aria-label="订单状态选择">
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
          <span className="nr-os-lab">此分支里 order 的类型</span>
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
        {c.has.length < OS_FIELDS.length && (
          <div className="nr-os-err mono">
            order.{OS_FIELDS.find((f) => !c.has.includes(f))} → Property
            &apos;{OS_FIELDS.find((f) => !c.has.includes(f))}&apos; does not
            exist on type &apos;{c.narrowed}&apos;.
          </div>
        )}
        <p className="nr-os-note">{c.note}</p>
      </div>
    </div>
  );
}
