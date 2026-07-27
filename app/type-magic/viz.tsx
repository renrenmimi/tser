"use client";

// 第 07 章 · 类型运算 —— 本章专属可视化:
//  - TmHeroParts:hero 里的「拆开 Partial 看零件」爆炸图(纯 CSS)。
//  - TmDistribute:条件类型分发机(本章招牌)—— union 成员排队过闸,
//    匹配的落进 never 垃圾桶,不匹配的通过,最后合流。逐帧慢放。
//  - TmMappedFactory:映射类型工厂 —— 四种改造规则切换,逐键看「进 → 出」。

import { useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";

/* ================= TmHeroParts ================= */

export function TmHeroParts() {
  return (
    <div className="tm-hero" aria-hidden>
      <div className="tm-hero-line mono">
        type MyPartial&lt;T&gt; = {"{ "}
        <span className="tm-part" data-p="1">
          [K in keyof T]
        </span>
        <span className="tm-part" data-p="2">
          ?
        </span>
        {": "}
        <span className="tm-part" data-p="3">
          T[K]
        </span>
        {" }"}
      </div>
      <div className="tm-hero-tags">
        <span className="tm-hero-tag" data-p="1">
          ① 映射:逐键改造
        </span>
        <span className="tm-hero-tag" data-p="2">
          ② 修饰符:拧上可选
        </span>
        <span className="tm-hero-tag" data-p="3">
          ③ 索引访问:抄原类型
        </span>
      </div>
    </div>
  );
}

/* ================= TmDistribute ================= */

const TM_MEMBERS = ["queued", "making", "ready", "cancelled"];
const TM_TARGET = "cancelled";

export function TmDistribute() {
  const total = TM_MEMBERS.length + 2; // 开场 + 每成员一帧 + 合流
  const s = useStepper(total, 1800);

  const curIdx =
    s.step >= 1 && s.step <= TM_MEMBERS.length ? s.step - 1 : null;
  const sorted = Math.min(Math.max(s.step, 0), TM_MEMBERS.length);
  const passed = TM_MEMBERS.slice(0, sorted).filter((m) => m !== TM_TARGET);
  const binned = TM_MEMBERS.slice(0, sorted).filter((m) => m === TM_TARGET);
  const finished = s.step === total - 1;

  let msg: ReactNode;
  if (s.step === 0)
    msg = (
      <>
        关键在这:条件类型<b>不会把联合当一个整体</b>判断 —— T
        是裸类型参数,四个成员在左边排好队,<b>一个一个</b>过闸。
      </>
    );
  else if (curIdx !== null) {
    const m = TM_MEMBERS[curIdx];
    msg =
      m === TM_TARGET ? (
        <>
          <code>&quot;{m}&quot;</code> extends{" "}
          <code>&quot;cancelled&quot;</code> —— 成立,判成 <b>never</b>
          ,落进垃圾桶。never 是空集,最后合并时它什么都贡献不了。
        </>
      ) : (
        <>
          <code>&quot;{m}&quot;</code> 塞不进{" "}
          <code>&quot;cancelled&quot;</code> —— 判否,走 <code>T</code>{" "}
          那条分支,原样通过,进入结果区。
        </>
      );
  } else
    msg = (
      <>
        全部过闸,通过的合流:
        <code>&quot;queued&quot; | &quot;making&quot; | &quot;ready&quot;</code>
        。这套「拆开 → 逐个判 → 合并」就是
        <b>分布式条件类型(distributive conditional types)</b> ——
        Exclude 一行实现的全部秘密。
      </>
    );

  return (
    <div className="viz">
      <div className="viz-title">
        条件类型分发机:MyExclude&lt;OrderStatus, &quot;cancelled&quot;&gt;
        是怎么算出来的
      </div>
      <div className="tm-dist-sig mono">
        type MyExclude&lt;T, U&gt; = T extends U ? never : T
      </div>
      <div className="viz-stage">
        <div className="tm-dist">
          <div className="tm-dist-col">
            <div className="tm-dist-lab">待检成员</div>
            {TM_MEMBERS.map((m, i) => (
              <div
                key={m}
                className={`tm-chip mono${i < sorted ? " spent" : ""}${
                  i === curIdx ? " active" : ""
                }`}
              >
                &quot;{m}&quot;
              </div>
            ))}
          </div>

          <div className="tm-dist-mid">
            <div className={`tm-gate${curIdx !== null ? " on" : ""}`}>
              <div className="tm-gate-cond mono">
                extends &quot;cancelled&quot; ?
              </div>
              {curIdx !== null ? (
                <div
                  className={`tm-gate-chip mono ${
                    TM_MEMBERS[curIdx] === TM_TARGET ? "bad" : "ok"
                  }`}
                  key={curIdx}
                >
                  &quot;{TM_MEMBERS[curIdx]}&quot;
                  <i>
                    {TM_MEMBERS[curIdx] === TM_TARGET
                      ? "✓ 成立 → never"
                      : "✕ 不成立 → 通过"}
                  </i>
                </div>
              ) : (
                <div className="tm-gate-idle">
                  {s.step === 0 ? "等待进料…" : "闸口空闲"}
                </div>
              )}
            </div>
            <div className="tm-bin">
              <div className="tm-bin-lab">never 垃圾桶</div>
              {binned.length === 0 ? (
                <span className="tm-bin-empty">(空)</span>
              ) : (
                binned.map((m) => (
                  <span key={m} className="tm-bin-item mono">
                    &quot;{m}&quot;
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="tm-dist-col">
            <div className="tm-dist-lab">通过 · 等待合流</div>
            {passed.length === 0 && (
              <div className="tm-dist-empty">还没有成员通过…</div>
            )}
            {passed.map((m) => (
              <div key={m} className="tm-chip mono pass">
                &quot;{m}&quot;
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={`tm-dist-result mono${finished ? " on" : ""}`}>
        {finished
          ? '= "queued" | "making" | "ready"'
          : "= ?(过完闸才知道)"}
      </div>
      <div className="viz-msg" aria-live="polite">
        {msg}
      </div>
      <StepControls stepper={s} step={s.step} total={total} />
    </div>
  );
}

/* ================= TmMappedFactory ================= */

interface TmField {
  key: string;
  type: string;
}

const TM_FIELDS: TmField[] = [
  { key: "size", type: "Size" },
  { key: "sugar", type: "Sugar" },
  { key: "toppings", type: "string[]" },
];

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const TM_RULES: {
  id: string;
  label: string;
  src: string;
  inOpt: boolean;
  out: (f: TmField) => string;
  note: ReactNode;
}[] = [
  {
    id: "opt",
    label: "加 ?",
    src: "{ [K in keyof T]?: T[K] }",
    inOpt: false,
    out: (f) => `${f.key}?: ${f.type}`,
    note: (
      <>
        逐键抄写,冒号前拧上 <code>?</code> —— 这就是{" "}
        <b>Partial</b> 的全部实现。
      </>
    ),
  },
  {
    id: "req",
    label: "去 ?(-?)",
    src: "{ [K in keyof T]-?: T[K] }",
    inOpt: true,
    out: (f) => `${f.key}: ${f.type}`,
    note: (
      <>
        修饰符前挂个减号,把 <code>?</code> 拧下来 —— 这就是{" "}
        <b>Required</b>。注意进料这次带着 ?。
      </>
    ),
  },
  {
    id: "lock",
    label: "上锁 readonly",
    src: "{ readonly [K in keyof T]: T[K] }",
    inOpt: false,
    out: (f) => `readonly ${f.key}: ${f.type}`,
    note: (
      <>
        方括号前焊上 <code>readonly</code> —— 这就是 <b>Readonly</b>。
        同理 <code>-readonly</code> 能把锁拆掉。
      </>
    ),
  },
  {
    id: "event",
    label: "键重映射 as",
    src: "{ [K in keyof T as `on${Capitalize<string & K>}Change`]: (next: T[K]) => void }",
    inOpt: false,
    out: (f) => `on${cap(f.key)}Change: (next: ${f.type}) => void`,
    note: (
      <>
        <code>as</code> 把键名整个换掉:模板字面量拼新名字,值改成回调 ——
        一份事件接口凭空长出来(TS 4.1)。
      </>
    ),
  },
];

export function TmMappedFactory() {
  const [sel, setSel] = useState(0);
  const rule = TM_RULES[sel];

  return (
    <div className="viz">
      <div className="viz-title">
        映射类型工厂:同一批键,四种改造规则 —— 点谁看谁
      </div>
      <div className="seg tm-mf-seg" role="tablist">
        {TM_RULES.map((r, i) => (
          <button
            key={r.id}
            type="button"
            role="tab"
            aria-selected={sel === i}
            className={`seg-btn${sel === i ? " on" : ""}`}
            onClick={() => setSel(i)}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className="tm-mf-src mono">{rule.src}</div>
      <div className="tm-mf-grid" aria-live="polite">
        <div className="tm-mf-col">
          <div className="tm-dist-lab">进 · T 的每个键</div>
          {TM_FIELDS.map((f) => (
            <div key={f.key} className="tm-mf-card mono">
              {f.key}
              {rule.inOpt ? "?" : ""}: {f.type}
            </div>
          ))}
        </div>
        <div className="tm-mf-arrow" aria-hidden>
          →
        </div>
        <div className="tm-mf-col">
          <div className="tm-dist-lab">出 · 改造后的键</div>
          {TM_FIELDS.map((f) => (
            <div key={`${rule.id}-${f.key}`} className="tm-mf-card mono out">
              {rule.out(f)}
            </div>
          ))}
        </div>
      </div>
      <div className="viz-msg">{rule.note}</div>
    </div>
  );
}
