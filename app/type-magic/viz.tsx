"use client";

// 第 07 章 · 类型运算 —— 本章专属可视化(双语:文案用 <Tx en zh />,
// 代码、类型名与编译器报错原文保持不变):
//  - TmHeroParts:hero 里的「拆开 Partial 看零件」爆炸图(纯 CSS)。
//  - TmDistribute:分布式条件类型逐帧慢放 —— 联合的成员逐个过闸,
//    判成 never 的丢弃,其余保留,最后合并成结果联合。
//  - TmMappedFactory:映射类型工厂 —— 四种改造规则切换,逐键看「进 → 出」。
//
// 所有推断结果均在 TypeScript 5.9 + strict 下实测过。

import { useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
import { T as Tx } from "@/lib/i18n";

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
          <Tx en="① Mapped type: one key at a time" zh="① 映射类型:逐键处理" />
        </span>
        <span className="tm-hero-tag" data-p="2">
          <Tx
            en="② Modifier: make each one optional"
            zh="② 修饰符:每个都变可选"
          />
        </span>
        <span className="tm-hero-tag" data-p="3">
          <Tx
            en="③ Indexed access: keep the original type"
            zh="③ 索引访问:沿用原来的类型"
          />
        </span>
      </div>
    </div>
  );
}

/* ================= TmDistribute ================= */

const TM_MEMBERS = ["queued", "making", "ready", "cancelled"];
const TM_TARGET = "cancelled";

export function TmDistribute() {
  const total = TM_MEMBERS.length + 2; // 开场 + 每成员一帧 + 合并
  const s = useStepper(total, 1800);

  const curIdx = s.step >= 1 && s.step <= TM_MEMBERS.length ? s.step - 1 : null;
  const sorted = Math.min(Math.max(s.step, 0), TM_MEMBERS.length);
  const passed = TM_MEMBERS.slice(0, sorted).filter((m) => m !== TM_TARGET);
  const binned = TM_MEMBERS.slice(0, sorted).filter((m) => m === TM_TARGET);
  const finished = s.step === total - 1;

  let msg: ReactNode;
  if (s.step === 0)
    msg = (
      <Tx
        en={
          <>
            The rule: a conditional type is checked{" "}
            <b>one union member at a time</b>, but only when the type on the
            left of <code>extends</code> is a naked type parameter — a bare{" "}
            <code>T</code>, as it is here. So the four members line up on the
            left and go through the check separately.
          </>
        }
        zh={
          <>
            规则是这样的:条件类型会<b>逐个成员</b>判断, 但前提是{" "}
            <code>extends</code> 左边是一个裸类型参数 —— 也就是光秃秃的{" "}
            <code>T</code>,这里正是如此。
            所以四个成员在左边排好队,一个一个过闸。
          </>
        }
      />
    );
  else if (curIdx !== null) {
    const m = TM_MEMBERS[curIdx];
    msg =
      m === TM_TARGET ? (
        <Tx
          en={
            <>
              <code>&quot;{m}&quot;</code> extends{" "}
              <code>&quot;cancelled&quot;</code> is true, so this member becomes{" "}
              <b>never</b> and is dropped. <code>never</code> is the empty
              union, so it adds nothing when the results are joined.
            </>
          }
          zh={
            <>
              <code>&quot;{m}&quot;</code> extends{" "}
              <code>&quot;cancelled&quot;</code> 成立,所以这个成员变成{" "}
              <b>never</b>,被丢弃。<code>never</code> 是空联合,
              合并结果时它什么也不贡献。
            </>
          }
        />
      ) : (
        <Tx
          en={
            <>
              <code>&quot;{m}&quot;</code> is not assignable to{" "}
              <code>&quot;cancelled&quot;</code>, so the check is false and the
              false branch runs. That branch is <code>T</code>, so the member is
              kept unchanged.
            </>
          }
          zh={
            <>
              <code>&quot;{m}&quot;</code> 不能赋给{" "}
              <code>&quot;cancelled&quot;</code>,判断为假,走假分支。
              假分支写的是 <code>T</code>,所以这个成员原样保留。
            </>
          }
        />
      );
  } else
    msg = (
      <Tx
        en={
          <>
            Every member has been checked, and the results are joined back into
            one union:{" "}
            <code>
              &quot;queued&quot; | &quot;making&quot; | &quot;ready&quot;
            </code>
            . Split, check each member, join — that is a{" "}
            <b>distributive conditional type</b>, and it is the whole of{" "}
            <code>Exclude</code>.
          </>
        }
        zh={
          <>
            所有成员都判完了,结果合并成一个联合:
            <code>
              &quot;queued&quot; | &quot;making&quot; | &quot;ready&quot;
            </code>
            。拆开、逐个判断、合并 —— 这就是<b>分布式条件类型</b>, 也是{" "}
            <code>Exclude</code> 的全部内容。
          </>
        }
      />
    );

  return (
    <div className="viz">
      <div className="viz-title">
        <Tx
          en={
            <>
              Distribution, step by step: how MyExclude&lt;OrderStatus,
              &quot;cancelled&quot;&gt; is computed
            </>
          }
          zh={
            <>
              分发逐帧看:MyExclude&lt;OrderStatus, &quot;cancelled&quot;&gt;
              是怎么算出来的
            </>
          }
        />
      </div>
      <div className="tm-dist-sig mono">
        type MyExclude&lt;T, U&gt; = T extends U ? never : T
      </div>
      <div className="viz-stage">
        <div className="tm-dist">
          <div className="tm-dist-col">
            <div className="tm-dist-lab">
              <Tx en="Union members" zh="联合的成员" />
            </div>
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
                    {TM_MEMBERS[curIdx] === TM_TARGET ? (
                      <Tx en="✓ true → never" zh="✓ 成立 → never" />
                    ) : (
                      <Tx en="✕ false → kept" zh="✕ 不成立 → 保留" />
                    )}
                  </i>
                </div>
              ) : (
                <div className="tm-gate-idle">
                  {s.step === 0 ? (
                    <Tx
                      en="Waiting for the first member…"
                      zh="等待第一个成员…"
                    />
                  ) : (
                    <Tx en="Nothing at the gate" zh="闸口空闲" />
                  )}
                </div>
              )}
            </div>
            <div className="tm-bin">
              <div className="tm-bin-lab">
                <Tx en="Dropped · became never" zh="已丢弃 · 判成 never" />
              </div>
              {binned.length === 0 ? (
                <span className="tm-bin-empty">
                  <Tx en="(empty)" zh="(空)" />
                </span>
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
            <div className="tm-dist-lab">
              <Tx en="Kept · to be joined" zh="保留 · 等待合并" />
            </div>
            {passed.length === 0 && (
              <div className="tm-dist-empty">
                <Tx en="No member kept yet…" zh="还没有成员被保留…" />
              </div>
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
        {finished ? (
          '= "queued" | "making" | "ready"'
        ) : (
          <Tx
            en="= ? (known once every member is checked)"
            zh="= ?(全部判完才知道)"
          />
        )}
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
  label: ReactNode;
  src: string;
  inOpt: boolean;
  out: (f: TmField) => string;
  note: ReactNode;
}[] = [
  {
    id: "opt",
    label: <Tx en="Add ?" zh="加上 ?" />,
    src: "{ [K in keyof T]?: T[K] }",
    inOpt: false,
    out: (f) => `${f.key}?: ${f.type}`,
    note: (
      <Tx
        en={
          <>
            Every key is copied, with a <code>?</code> added before the colon.
            That is the entire definition of <b>Partial</b>.
          </>
        }
        zh={
          <>
            每个键都照抄一遍,只在冒号前加上 <code>?</code>。 这就是{" "}
            <b>Partial</b> 的全部定义。
          </>
        }
      />
    ),
  },
  {
    id: "req",
    label: <Tx en="Remove ? (-?)" zh="去掉 ?(-?)" />,
    src: "{ [K in keyof T]-?: T[K] }",
    inOpt: true,
    out: (f) => `${f.key}: ${f.type}`,
    note: (
      <Tx
        en={
          <>
            A minus sign before the modifier removes it, so <code>?</code> is
            taken off. That is <b>Required</b>. Note that the input side carries{" "}
            <code>?</code> this time. Under <code>strictNullChecks</code>,{" "}
            <code>-?</code> also removes <code>undefined</code> from the
            property type.
          </>
        }
        zh={
          <>
            修饰符前面加个减号就是去掉它,于是 <code>?</code> 被摘掉。 这就是{" "}
            <b>Required</b>。注意这一次进来的键带着 <code>?</code>。 在{" "}
            <code>strictNullChecks</code> 下,<code>-?</code>{" "}
            同时会把属性类型里的 <code>undefined</code> 去掉。
          </>
        }
      />
    ),
  },
  {
    id: "lock",
    label: <Tx en="Add readonly" zh="加上 readonly" />,
    src: "{ readonly [K in keyof T]: T[K] }",
    inOpt: false,
    out: (f) => `readonly ${f.key}: ${f.type}`,
    note: (
      <Tx
        en={
          <>
            <code>readonly</code> goes before the square brackets. That is{" "}
            <b>Readonly</b>. In the same way, <code>-readonly</code> removes it
            again.
          </>
        }
        zh={
          <>
            <code>readonly</code> 写在方括号前面。这就是 <b>Readonly</b>。 同理,
            <code>-readonly</code> 可以把它去掉。
          </>
        }
      />
    ),
  },
  {
    id: "event",
    label: <Tx en="Rename keys with as" zh="用 as 给键改名" />,
    src: "{ [K in keyof T as `on${Capitalize<string & K>}Change`]: (next: T[K]) => void }",
    inOpt: false,
    out: (f) => `on${cap(f.key)}Change: (next: ${f.type}) => void`,
    note: (
      <Tx
        en={
          <>
            The <code>as</code> clause replaces the key name: a template literal
            type builds the new name, and the property type becomes a callback.
            One object type turns into a matching set of event handlers. Both{" "}
            <code>as</code> and template literal types arrived in TypeScript
            4.1.
          </>
        }
        zh={
          <>
            <code>as</code> 把键名整个换掉:模板字面量类型拼出新名字,
            属性类型改成回调。一个对象类型就变成了配套的事件处理器类型。
            <code>as</code> 和模板字面量类型都是 TypeScript 4.1 加入的。
          </>
        }
      />
    ),
  },
];

export function TmMappedFactory() {
  const [sel, setSel] = useState(0);
  const rule = TM_RULES[sel];

  return (
    <div className="viz">
      <div className="viz-title">
        <Tx
          en="The mapped type factory: the same keys, four rules — pick one"
          zh="映射类型工厂:同一批键,四种规则 —— 点谁看谁"
        />
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
          <div className="tm-dist-lab">
            <Tx en="In · each key of T" zh="进 · T 的每个键" />
          </div>
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
          <div className="tm-dist-lab">
            <Tx en="Out · after the rule" zh="出 · 按规则改造后" />
          </div>
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
