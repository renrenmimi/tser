"use client";

// 第 05 章 · 泛型 —— 本章专属可视化:
//  - HeroMold:hero 里的「留洞模具」循环动画(纯 CSS 驱动,三种类型轮流浇进洞里)。
//  - HoleFiller:类型洞填充机 —— 逐帧慢放一次泛型调用:实参亮相 → 推断 T →
//    签名里所有 T 同时点亮 → 返回值类型落定;string / number 两炉对照。
//  - ConstraintGate:约束安检门 —— <T extends { length: number }>,
//    点一个候选值,看门开还是拦。

import { useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";

/* ================= HeroMold ================= */

export function HeroMold() {
  return (
    <div className="gn-hero" aria-hidden>
      <div className="gn-hero-sig mono">
        first&lt;<span className="gn-hero-hole" />
        &gt;(arr: <span className="gn-hero-hole" />
        []) : <span className="gn-hero-hole" /> | undefined
      </div>
      <div className="gn-hero-pours">
        <span className="gn-pour p1">string</span>
        <span className="gn-pour p2">number</span>
        <span className="gn-pour p3">Order</span>
      </div>
      <div className="gn-hero-cap">同一副模具 · 三种浇法 · 处处同一种</div>
    </div>
  );
}

/* ================= HoleFiller ================= */

interface Run {
  id: string;
  seg: string;
  call: string;
  argLit: string;
  argType: string;
  fill: string;
  result: string;
}

const RUNS: Run[] = [
  {
    id: "string",
    seg: "string 这一炉",
    call: 'const x = first(["三分糖", "七分糖"]);',
    argLit: '["三分糖", "七分糖"]',
    argType: "string[]",
    fill: "string",
    result: "string | undefined",
  },
  {
    id: "number",
    seg: "number 这一炉",
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
    <>
      模具本体:尖括号里的 <code>&lt;T&gt;</code> 是<b>洞的声明</b>,
      后面两个 T 是同一个洞的两个开口 —— 声明一次,处处引用。
      现在洞还空着,先点「下一步」让调用进场。
    </>,
    <>
      编译器不用你交代,直接看实参:<code>{run.argLit}</code> 是{" "}
      <code>{run.argType}</code>。拿它对上参数声明 <code>arr: T[]</code>,
      一比 —— <b>解出 T = {run.fill}</b>。这就是类型实参推断,推断的原料
      永远来自实参。
    </>,
    <>
      同一个洞,处处同时填上:签名里的每一个 T,此刻都是{" "}
      <code>{run.fill}</code> —— 不存在「这头 string、那头 number」,
      编译器保证同一炉浇的是同一种。
    </>,
    <>
      返回值跟着落定:<code>x</code> 的类型是 <code>{run.result}</code>。
      类型信息从进到出一路没丢 —— 这就是泛型和 any 的分水岭:any
      把类型丢在门口,泛型把类型送到终点。
    </>,
  ];

  return (
    <div className="viz">
      <div className="viz-title">
        类型洞填充机:一次泛型调用的慢动作
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
                    实参是 <b>{run.argType}</b> ⭢ 解出{" "}
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
  code: string;
  type: string;
  ok: boolean;
  msg: ReactNode;
}

const CANDS: Cand[] = [
  {
    id: "str",
    code: '"波霸奶茶"',
    type: "string",
    ok: true,
    msg: (
      <>
        string 天生带 <code>.length</code> —— 形状对得上,门开,
        <b>T = string</b>。注意:T 不会被削成{" "}
        <code>{"{ length: number }"}</code>,它还是完整的 string。
      </>
    ),
  },
  {
    id: "arr",
    code: '["珍珠", "椰果"]',
    type: "string[]",
    ok: true,
    msg: (
      <>
        数组也有 <code>.length</code> —— 放行,<b>T = string[]</b>。
        约束只问「有没有」,不问「你是谁」。
      </>
    ),
  },
  {
    id: "obj",
    code: "{ length: 12 }",
    type: "{ length: number }",
    ok: true,
    msg: (
      <>
        一个谁都不认识的对象,但它有 <code>length: number</code> ——
        鸭子测试在泛型约束里同样生效(上一章的规则,原封不动搬过来用)。
      </>
    ),
  },
  {
    id: "num",
    code: "42",
    type: "number",
    ok: false,
    msg: (
      <>
        number 身上没有 length —— 门口就拦下,<b>编译期报错</b>:
        Argument of type 'number' is not assignable to parameter of type{" "}
        {"'{ length: number; }'"}。等不到运行时的 undefined。
      </>
    ),
  },
  {
    id: "bool",
    code: "true",
    type: "boolean",
    ok: false,
    msg: (
      <>
        boolean 也没有 length —— 拒绝。约束就是给洞立的门规:
        不是什么都能往里填。
      </>
    ),
  },
];

export function ConstraintGate() {
  const [sel, setSel] = useState<number | null>(null);
  const cand = sel === null ? null : CANDS[sel];

  return (
    <div className="viz">
      <div className="viz-title">
        约束安检门:这个洞,不是什么都能填
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
              className={`gn-gate${
                cand ? (cand.ok ? " open" : " shut") : ""
              }`}
            >
              <div className="gn-gate-rule mono">
                &lt;T <span className="tk-kw">extends</span>{" "}
                {"{ length: number }"}&gt;
              </div>
              <div className="gn-gate-door" aria-hidden>
                {cand ? (cand.ok ? "✓ 放行" : "✕ 拦下") : "…"}
              </div>
              <div className="gn-gate-sub">
                longest(a: T, b: T): T 的门规
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {cand ? (
          cand.msg
        ) : (
          <>
            <b>longest</b> 要比较两个值的 <code>.length</code>,
            所以给洞立了门规:来的类型必须有{" "}
            <code>length: number</code>。点上面的候选值,挨个送去安检。
          </>
        )}
      </div>
    </div>
  );
}
