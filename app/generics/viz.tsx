"use client";

// 第 05 章 · 泛型 —— 本章专属可视化(双语:文案用 <T en zh />,
// 代码、类型名与编译器报错原文保持不变):
//  - HeroMold:hero 里的「留洞模具」循环动画(纯 CSS 驱动,三种类型轮流浇进洞里)。
//  - HoleFiller:类型洞填充机 —— 逐帧慢放一次泛型调用:实参亮相 → 推断 T →
//    签名里所有 T 同时点亮 → 返回值类型落定;string / number 两炉对照。
//  - ConstraintGate:约束安检门 —— <T extends { length: number }>,
//    点一个候选值,看门开还是拦。
//
// 所有报错文案与推断结果均在 TypeScript 5.9 + strict 下实测过。

import { useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
import { T as Tx } from "@/lib/i18n";

/* ================= HeroMold ================= */

export function HeroMold() {
  return (
    <div className="gn-hero" aria-hidden>
      <div className="gn-hero-sig mono">
        first&lt;
        <span className="gn-hero-hole" />
        &gt;(arr: <span className="gn-hero-hole" />
        []) : <span className="gn-hero-hole" /> | undefined
      </div>
      <div className="gn-hero-pours">
        <span className="gn-pour p1">string</span>
        <span className="gn-pour p2">number</span>
        <span className="gn-pour p3">Order</span>
      </div>
      <div className="gn-hero-cap">
        <Tx
          en="One signature · many call sites · one type per call"
          zh="同一副模具 · 三种浇法 · 处处同一种"
        />
      </div>
    </div>
  );
}

/* ================= HoleFiller ================= */

interface Run {
  id: string;
  /** 分段按钮上的标签 */
  seg: ReactNode;
  /** 以下全是代码,不翻译 */
  call: string;
  argLit: string;
  argType: string;
  fill: string;
  result: string;
}

const RUNS: Run[] = [
  {
    id: "string",
    seg: <Tx en="a string call" zh="string 这一炉" />,
    call: 'const x = first(["boba", "coconut jelly"]);',
    argLit: '["boba", "coconut jelly"]',
    argType: "string[]",
    fill: "string",
    result: "string | undefined",
  },
  {
    id: "number",
    seg: <Tx en="a number call" zh="number 这一炉" />,
    call: "const x = first([9.9, 19.9, 25]);",
    argLit: "[9.9, 19.9, 25]",
    argType: "number[]",
    fill: "number",
    result: "number | undefined",
  },
];

export function HoleFiller() {
  const [runIdx, setRunIdx] = useState(0);
  const run = RUNS[runIdx];
  const stepper = useStepper(4);
  const s = stepper.step;

  const pick = (i: number) => {
    setRunIdx(i);
    stepper.reset();
  };

  const filled = s >= 2;
  const msgs: ReactNode[] = [
    <Tx
      key="m0"
      en={
        <>
          The signature only. <code>&lt;T&gt;</code> <b>declares</b> the
          placeholder; the two later <code>T</code>s are uses of that same
          placeholder. Nothing is filled in yet. Press Next to bring in a call.
        </>
      }
      zh={
        <>
          先只看签名。<code>&lt;T&gt;</code> 是在<b>声明</b>占位符, 后面两个{" "}
          <code>T</code> 是同一个占位符的两次使用。
          现在还什么都没填。点「下一步」,让一次调用进场。
        </>
      }
    />,
    <Tx
      key="m1"
      en={
        <>
          The compiler reads the argument: <code>{run.argLit}</code> has type{" "}
          <code>{run.argType}</code>. It matches that against the declared
          parameter <code>arr: T[]</code> and gets <b>T = {run.fill}</b>. This
          is type argument inference, and the arguments are its only source.
        </>
      }
      zh={
        <>
          编译器去读实参:<code>{run.argLit}</code> 的类型是{" "}
          <code>{run.argType}</code>。拿它对上声明的参数 <code>arr: T[]</code>
          ,得出 <b>T = {run.fill}</b>。 这就是类型实参推断,而它的原料只有实参。
        </>
      }
    />,
    <Tx
      key="m2"
      en={
        <>
          One placeholder, so every use is filled at once: every <code>T</code>{" "}
          in this signature is now <code>{run.fill}</code>. There is no way for
          one end to be <code>string</code> and the other <code>number</code> in
          the same call.
        </>
      }
      zh={
        <>
          只有一个占位符,所以所有使用处同时被填上:这个签名里的每个{" "}
          <code>T</code> 现在都是 <code>{run.fill}</code>。
          同一次调用里,不可能这头是 <code>string</code>、那头是{" "}
          <code>number</code>。
        </>
      }
    />,
    <Tx
      key="m3"
      en={
        <>
          The return type follows: <code>x</code> is <code>{run.result}</code>.
          The type information travelled from the argument all the way to the
          result. That is the difference from <code>any</code>, which drops it
          at the door.
        </>
      }
      zh={
        <>
          返回值类型跟着落定:<code>x</code> 的类型是 <code>{run.result}</code>
          。类型信息从实参一路走到了结果。 这就是它和 <code>any</code> 的区别 ——{" "}
          <code>any</code> 把类型丢在门口。
        </>
      }
    />,
  ];

  return (
    <div className="viz">
      <div className="viz-title">
        <Tx
          en="Filling the hole: one generic call in slow motion"
          zh="类型洞填充机:一次泛型调用的慢动作"
        />
        <span className="seg" role="group">
          {RUNS.map((r, i) => (
            <button
              key={r.id}
              type="button"
              className={`seg-btn${runIdx === i ? " on" : ""}`}
              onClick={() => pick(i)}
            >
              {r.seg}
            </button>
          ))}
        </span>
      </div>
      <div className="viz-stage">
        <div className="viz-scroll">
          <div className="gn-machine">
            <div className="gn-sig mono">
              <span className="tk-kw">function</span>{" "}
              <span className="tk-fn">first</span>
              <span className="gn-dim">&lt;</span>
              <Hole label="T" fill={run.fill} filled={filled} declare />
              <span className="gn-dim">&gt;(</span>
              arr<span className="gn-dim">: </span>
              <Hole
                label="T"
                fill={run.fill}
                filled={filled}
                probing={s === 1}
              />
              <span className="gn-dim">[])</span>
              <span className="gn-dim">: </span>
              <Hole label="T" fill={run.fill} filled={filled} />
              <span className="gn-dim"> | </span>
              <span className={`gn-ret${s >= 3 ? " lit" : ""}`}>undefined</span>
            </div>

            {s >= 1 && (
              <div className="gn-callrow">
                <span className="gn-call mono">{run.call}</span>
                {s === 1 && (
                  <span className="gn-infer">
                    <Tx
                      en={
                        <>
                          argument is <b>{run.argType}</b> ⭢ so{" "}
                        </>
                      }
                      zh={
                        <>
                          实参是 <b>{run.argType}</b> ⭢ 解出{" "}
                        </>
                      }
                    />
                    <b className="gn-chip">T = {run.fill}</b>
                  </span>
                )}
                {s >= 3 && (
                  <span className="gn-infer done">
                    x: <b>{run.result}</b>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {msgs[s]}
      </div>
      <StepControls stepper={stepper} step={s} total={4} />
    </div>
  );
}

function Hole({
  label,
  fill,
  filled,
  probing,
  declare,
}: {
  label: string;
  fill: string;
  filled: boolean;
  probing?: boolean;
  declare?: boolean;
}) {
  return (
    <span
      className={`gn-hole${filled ? " filled" : ""}${probing ? " probing" : ""}${
        declare ? " declare" : ""
      }`}
    >
      {filled ? fill : label}
    </span>
  );
}

/* ================= ConstraintGate ================= */

interface Cand {
  id: string;
  /** 代码与类型,不翻译 */
  code: string;
  type: string;
  ok: boolean;
  msg: ReactNode;
}

const CANDS: Cand[] = [
  {
    id: "str",
    code: '"Boba milk tea"',
    type: "string",
    ok: true,
    msg: (
      <Tx
        en={
          <>
            <code>string</code> already has <code>.length</code>, so it is
            assignable to the constraint and the call is accepted, with{" "}
            <b>T = string</b>. Note that T is not reduced to{" "}
            <code>{"{ length: number }"}</code> — it is still the full{" "}
            <code>string</code> type.
          </>
        }
        zh={
          <>
            <code>string</code> 本来就有 <code>.length</code>,
            可以赋值给这个约束,调用通过,<b>T = string</b>。注意 T 并不会被削成{" "}
            <code>{"{ length: number }"}</code> —— 它仍然是完整的{" "}
            <code>string</code>。
          </>
        }
      />
    ),
  },
  {
    id: "arr",
    code: '["boba", "pudding"]',
    type: "string[]",
    ok: true,
    msg: (
      <Tx
        en={
          <>
            An array has <code>.length</code> too, so it is accepted, with{" "}
            <b>T = string[]</b>. The constraint asks what the type has, not what
            it is called.
          </>
        }
        zh={
          <>
            数组也有 <code>.length</code>,同样通过,<b>T = string[]</b>。
            约束问的是这个类型「有什么」,不是它「叫什么」。
          </>
        }
      />
    ),
  },
  {
    id: "obj",
    code: "{ length: 12 }",
    type: "{ length: number }",
    ok: true,
    msg: (
      <Tx
        en={
          <>
            An object literal with no name and no declared type, but it does
            have <code>length: number</code>. The structural check from the
            previous chapter is exactly the check a constraint uses.
          </>
        }
        zh={
          <>
            一个没名字、也没声明过类型的对象字面量,但它确实有{" "}
            <code>length: number</code>。
            上一章那套结构化检查,正是约束在这里用的检查。
          </>
        }
      />
    ),
  },
  {
    id: "num",
    code: "42",
    type: "number",
    ok: false,
    msg: (
      <Tx
        en={
          <>
            <code>number</code> has no <code>length</code>, so the call is
            rejected while you are typing it:{" "}
            <b>
              Argument of type &apos;number&apos; is not assignable to parameter
              of type {"'{ length: number; }'"}.
            </b>{" "}
            No <code>undefined</code> at runtime to debug later.
          </>
        }
        zh={
          <>
            <code>number</code> 身上没有 <code>length</code>,
            所以你还在敲代码的时候这次调用就被拒绝了:
            <b>
              Argument of type &apos;number&apos; is not assignable to parameter
              of type {"'{ length: number; }'"}.
            </b>{" "}
            不用等到运行时再去查一个 <code>undefined</code>。
          </>
        }
      />
    ),
  },
  {
    id: "bool",
    code: "true",
    type: "boolean",
    ok: false,
    msg: (
      <Tx
        en={
          <>
            <code>boolean</code> has no <code>length</code> either, so it is
            rejected. A constraint is a condition on the placeholder: not every
            type may fill it.
          </>
        }
        zh={
          <>
            <code>boolean</code> 同样没有 <code>length</code>,拒绝。
            约束是加在占位符上的一个条件:不是什么类型都能填进去。
          </>
        }
      />
    ),
  },
];

export function ConstraintGate() {
  const [sel, setSel] = useState<number | null>(null);
  const cand = sel === null ? null : CANDS[sel];

  return (
    <div className="viz">
      <div className="viz-title">
        <Tx
          en="The constraint gate: not every type may fill the hole"
          zh="约束安检门:这个洞,不是什么都能填"
        />
      </div>
      <div className="viz-stage">
        <div className="viz-scroll">
          <div className="gn-gatewrap">
            <div className="gn-cands" role="group">
              {CANDS.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  className={`gn-cand${sel === i ? " on" : ""}${
                    sel === i ? (c.ok ? " pass" : " fail") : ""
                  }`}
                  onClick={() => setSel(i)}
                >
                  <span className="mono">{c.code}</span>
                  <em>{c.type}</em>
                </button>
              ))}
            </div>
            <div
              className={`gn-gate${cand ? (cand.ok ? " open" : " shut") : ""}`}
            >
              <div className="gn-gate-rule mono">
                &lt;T <span className="tk-kw">extends</span>{" "}
                {"{ length: number }"}&gt;
              </div>
              <div className="gn-gate-door" aria-hidden>
                {cand ? (
                  cand.ok ? (
                    <Tx en="✓ Accepted" zh="✓ 放行" />
                  ) : (
                    <Tx en="✕ Rejected" zh="✕ 拦下" />
                  )
                ) : (
                  "…"
                )}
              </div>
              <div className="gn-gate-sub mono">longest(a: T, b: T): T</div>
            </div>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {cand ? (
          cand.msg
        ) : (
          <Tx
            en={
              <>
                <b>longest</b> compares the <code>.length</code> of two values,
                so its placeholder carries a condition: whatever fills it must
                have <code>length: number</code>. Pick a candidate above and
                send it through.
              </>
            }
            zh={
              <>
                <b>longest</b> 要比较两个值的 <code>.length</code>,
                所以它的占位符带了一个条件:填进来的类型必须有{" "}
                <code>length: number</code>。点上面的候选值,挨个送去检查。
              </>
            }
          />
        )}
      </div>
    </div>
  );
}
