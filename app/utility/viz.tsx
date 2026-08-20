"use client";

// 第 06 章 · 内置工具类型 —— 本章专属可视化(双语:文案用 <Tx en zh />,
// 类型名、代码与编译器报错原文保持不变):
//  - UtHeroToolbox:hero 顶部的「Order 进 → 换工具 → 新类型出」轮播示意。
//  - UtPipeline:类型加工流水线(本章招牌)—— 六个属性逐个过机,
//    Partial / Readonly / Pick / Omit 四种工具可切换,配逐帧旁白。
//  - UtUnionSieve:联合类型筛子 —— Exclude / Extract 对同一个 union 的两种筛法。
//
// 所有推断结果与「哪一行会被拦」均在 TypeScript 5.9 + strict 下实测过。

import { useEffect, useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
import { T as Tx } from "@/lib/i18n";

/* ================= UtHeroToolbox ================= */

const HERO_TOOLS: { tool: string; out: string; eff: ReactNode }[] = [
  {
    tool: "Partial",
    out: "Partial<Order>",
    eff: <Tx en="every property optional" zh="每个属性都变可选" />,
  },
  {
    tool: "Readonly",
    out: "Readonly<Order>",
    eff: <Tx en="every property read-only" zh="每个属性都变只读" />,
  },
  {
    tool: "Pick",
    out: 'Pick<Order, "id" | "size">',
    eff: <Tx en="keep only these properties" zh="只留下点到名的属性" />,
  },
  {
    tool: "Omit",
    out: 'Omit<Order, "internalNote">',
    eff: <Tx en="remove these properties" zh="删掉点到名的属性" />,
  },
];

export function UtHeroToolbox() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % HERO_TOOLS.length), 2600);
    return () => clearInterval(t);
  }, []);
  const cur = HERO_TOOLS[i];
  return (
    <div className="ut-hero" aria-hidden>
      <div className="ut-hero-box mono">Order</div>
      <div className="ut-hero-link" />
      <div className="ut-hero-tool" key={`t${i}`}>
        <div className="ut-hero-tool-name mono">{cur.tool}&lt;…&gt;</div>
        <div className="ut-hero-tool-eff">{cur.eff}</div>
      </div>
      <div className="ut-hero-link" />
      <div className="ut-hero-box out mono" key={`o${i}`}>
        {cur.out}
      </div>
    </div>
  );
}

/* ================= UtPipeline ================= */

type UtToolId = "Partial" | "Readonly" | "Pick" | "Omit";
type UtVerdict = "opt" | "lock" | "keep" | "drop";

interface UtField {
  key: string;
  type: string;
}

const UT_FIELDS: UtField[] = [
  { key: "id", type: "string" },
  { key: "drink", type: "string" },
  { key: "size", type: "Size" },
  { key: "sugar", type: "Sugar" },
  { key: "toppings", type: "string[]" },
  { key: "internalNote", type: "string" },
];

const PICK_KEYS = new Set(["id", "drink", "size"]);

const UT_TOOLS: {
  id: UtToolId;
  sig: string;
  out: string;
  blurb: ReactNode;
}[] = [
  {
    id: "Partial",
    sig: "Partial<Order>",
    out: "DraftOrder",
    blurb: (
      <Tx
        en="Adds ? to every property. A draft order can be saved half-filled."
        zh="给每个属性加上 ?。草稿订单可以只填一部分就存下来。"
      />
    ),
  },
  {
    id: "Readonly",
    sig: "Readonly<Order>",
    out: "LockedOrder",
    blurb: (
      <Tx
        en="Adds readonly to every property. A printed receipt must not be reassigned."
        zh="给每个属性加上 readonly。小票已经打出来了,不能再改。"
      />
    ),
  },
  {
    id: "Pick",
    sig: 'Pick<Order, "id" | "drink" | "size">',
    out: "OrderListItem",
    blurb: (
      <Tx
        en="An allow-list: the named properties are kept, everything else is left out."
        zh="白名单:点到名的属性留下,其余一概不带走。"
      />
    ),
  },
  {
    id: "Omit",
    sig: 'Omit<Order, "internalNote">',
    out: "PublicOrder",
    blurb: (
      <Tx
        en="A block-list: the named properties are dropped, everything else passes through."
        zh="黑名单:点到名的属性丢掉,其余原样通过。"
      />
    ),
  },
];

function utVerdict(tool: UtToolId, key: string): UtVerdict {
  switch (tool) {
    case "Partial":
      return "opt";
    case "Readonly":
      return "lock";
    case "Pick":
      return PICK_KEYS.has(key) ? "keep" : "drop";
    case "Omit":
      return key === "internalNote" ? "drop" : "keep";
  }
}

function utFieldMsg(tool: UtToolId, f: UtField): ReactNode {
  const v = utVerdict(tool, f.key);
  if (v === "opt")
    return (
      <Tx
        en={
          <>
            <b>{f.key}</b> goes through. A <code>?</code> is added before the
            colon. The property may now be left out, so reading it gives{" "}
            <code>
              {f.type} | undefined
            </code>
            .
          </>
        }
        zh={
          <>
            <b>{f.key}</b> 过机:冒号前加上一个 <code>?</code>。
            这个属性现在可以不写,所以读它拿到的是{" "}
            <code>
              {f.type} | undefined
            </code>
            。
          </>
        }
      />
    );
  if (v === "lock")
    return f.key === "toppings" ? (
      <Tx
        en={
          <>
            <b>toppings</b> goes through and becomes{" "}
            <code>readonly toppings: string[]</code>. Assigning a new array to{" "}
            <code>o.toppings</code> is rejected, but{" "}
            <code>o.toppings.push(&quot;boba&quot;)</code> is still allowed:{" "}
            <code>Readonly</code> only protects the property, not the array it
            points at.
          </>
        }
        zh={
          <>
            <b>toppings</b> 过机,变成{" "}
            <code>readonly toppings: string[]</code>。给{" "}
            <code>o.toppings</code> 赋一个新数组会被拒绝,但{" "}
            <code>o.toppings.push(&quot;boba&quot;)</code> 依然合法:
            <code>Readonly</code> 保护的是属性本身,不是属性指向的那个数组。
          </>
        }
      />
    ) : (
      <Tx
        en={
          <>
            <b>{f.key}</b> goes through. <code>readonly</code> is added in
            front. After the object is created, assigning to this property is
            rejected by the compiler.
          </>
        }
        zh={
          <>
            <b>{f.key}</b> 过机:前面加上 <code>readonly</code>。
            对象建好之后,再给这个属性赋值就会被编译器拒绝。
          </>
        }
      />
    );
  if (v === "keep")
    return tool === "Pick" ? (
      <Tx
        en={
          <>
            <b>{f.key}</b> is on the allow-list, so it passes through unchanged.
            Same name, same type, same optional and readonly markers.
          </>
        }
        zh={
          <>
            <b>{f.key}</b> 在白名单上,原样通过。名字、类型、
            可选与只读标记全都不变。
          </>
        }
      />
    ) : (
      <Tx
        en={
          <>
            <b>{f.key}</b> was not named, so it passes through unchanged.{" "}
            <code>Omit</code> only touches the keys you list.
          </>
        }
        zh={
          <>
            <b>{f.key}</b> 没被点名,原样通过。<code>Omit</code>{" "}
            只处理你列出的那些键。
          </>
        }
      />
    );
  return tool === "Pick" ? (
    <Tx
      en={
        <>
          <b>{f.key}</b> is not on the allow-list, so it is dropped. The new
          type has no such property, and reading it is a compile error.
        </>
      }
      zh={
        <>
          <b>{f.key}</b> 不在白名单上,被丢掉。新类型里没有这个属性,
          读它就是一个编译错误。
        </>
      }
    />
  ) : (
    <Tx
      en={
        <>
          <b>{f.key}</b> was named, so <code>Omit</code> drops it. The public
          type no longer has this property.
        </>
      }
      zh={
        <>
          <b>{f.key}</b> 被点了名,<code>Omit</code> 把它丢掉。
          对外的类型里再也没有这个属性。
        </>
      }
    />
  );
}

export function UtPipeline() {
  const [tool, setTool] = useState<UtToolId>("Partial");
  const total = UT_FIELDS.length + 2;
  const s = useStepper(total, 1700);
  const meta = UT_TOOLS.find((t) => t.id === tool)!;

  const processed = Math.min(Math.max(s.step, 0), UT_FIELDS.length);
  const curIdx = s.step >= 1 && s.step <= UT_FIELDS.length ? s.step - 1 : null;
  const doneAll = s.step === total - 1;

  const outFields = UT_FIELDS.slice(0, processed).filter(
    (f) => utVerdict(tool, f.key) !== "drop",
  );
  const dropped = UT_FIELDS.slice(0, processed).filter(
    (f) => utVerdict(tool, f.key) === "drop",
  );

  let msg: ReactNode;
  if (s.step === 0)
    msg = (
      <Tx
        en={
          <>
            Six properties are queued on the left, and the machine is set to{" "}
            <b>{tool}</b>. Press Next to send them through one at a time.
          </>
        }
        zh={
          <>
            六个属性在左边排好队,机器上装的是 <b>{tool}</b>。
            点「下一步」,让它们一个一个过机。
          </>
        }
      />
    );
  else if (curIdx !== null) msg = utFieldMsg(tool, UT_FIELDS[curIdx]);
  else
    msg = (
      <Tx
        en={
          <>
            Output complete. This is <b>{meta.out}</b>. Look back at the input
            column: <b>Order</b> is exactly as it was. A utility type takes a
            type and returns a new type; it never changes the type you gave it.
          </>
        }
        zh={
          <>
            出料完毕,这就是 <b>{meta.out}</b>。回头看入料区:<b>Order</b>{" "}
            和原来一模一样。工具类型接受一个类型、返回一个新类型,
            从不改动你交给它的那个类型。
          </>
        }
      />
    );

  return (
    <div className="viz">
      <div className="viz-title">
        <Tx
          en="A type-processing line: one Order, a different type for each tool"
          zh="类型加工流水线:同一个 Order,换个工具就是另一种类型"
        />
      </div>
      <div className="seg ut-pipe-seg" role="tablist">
        {UT_TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tool === t.id}
            className={`seg-btn mono${tool === t.id ? " on" : ""}`}
            onClick={() => {
              setTool(t.id);
              s.reset();
            }}
          >
            {t.id}
          </button>
        ))}
      </div>
      <div className="ut-pipe-sig mono">
        type {meta.out} = {meta.sig}
      </div>
      <div className="viz-stage">
        <div className="ut-pipe">
          <div className="ut-pipe-col">
            <div className="ut-pipe-lab">
              <Tx en="In · Order" zh="入料 · Order" />
            </div>
            {UT_FIELDS.map((f, i) => (
              <div
                key={f.key}
                className={`ut-fcard${i < processed ? " spent" : ""}${
                  i === curIdx ? " active" : ""
                }`}
              >
                <span className="mono">
                  {f.key}: {f.type}
                </span>
              </div>
            ))}
          </div>

          <div className="ut-pipe-mid">
            <div className={`ut-machine${curIdx !== null ? " on" : ""}`}>
              <div className="ut-machine-name mono">{tool}&lt;…&gt;</div>
              <div className="ut-machine-sub">{meta.blurb}</div>
            </div>
            {(tool === "Pick" || tool === "Omit") && (
              <div className="ut-bin">
                <div className="ut-bin-lab">
                  <Tx en="Dropped" zh="丢掉的属性" />
                </div>
                {dropped.length === 0 ? (
                  <span className="ut-bin-empty">
                    <Tx en="(none yet)" zh="(还没有)" />
                  </span>
                ) : (
                  dropped.map((f) => (
                    <span key={f.key} className="ut-bin-item mono">
                      {f.key}
                    </span>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="ut-pipe-col">
            <div className="ut-pipe-lab">
              <Tx en="Out" zh="出料" /> · {meta.out}
              {doneAll && (
                <span className="ut-pipe-done">
                  <Tx en="✓ done" zh="✓ 完工" />
                </span>
              )}
            </div>
            {outFields.length === 0 && (
              <div className="ut-pipe-empty">
                <Tx en="Waiting for output…" zh="等待出料…" />
              </div>
            )}
            {outFields.map((f) => {
              const v = utVerdict(tool, f.key);
              return (
                <div key={f.key} className={`ut-fcard out v-${v}`}>
                  <span className="mono">
                    {v === "lock" && (
                      <span className="ut-lockword">readonly </span>
                    )}
                    {f.key}
                    {v === "opt" && <b className="ut-q">?</b>}: {f.type}
                  </span>
                  {v === "lock" && (
                    <span className="ut-badge" aria-hidden>
                      🔒
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {msg}
      </div>
      <StepControls stepper={s} step={s.step} total={total} />
    </div>
  );
}

/* ================= UtUnionSieve ================= */

const SIEVE_MEMBERS = ["queued", "making", "ready", "done", "cancelled"];
const SIEVE_TARGET = new Set(["done", "cancelled"]);

export function UtUnionSieve() {
  const [mode, setMode] = useState<"exclude" | "extract">("exclude");
  const keeps = (m: string) =>
    mode === "exclude" ? !SIEVE_TARGET.has(m) : SIEVE_TARGET.has(m);
  const kept = SIEVE_MEMBERS.filter(keeps);
  const toolName = mode === "exclude" ? "Exclude" : "Extract";
  const outName = mode === "exclude" ? "ActiveStatus" : "ClosedStatus";

  return (
    <div className="viz">
      <div className="viz-title">
        <Tx
          en="One union, two filters: Exclude removes members, Extract keeps them"
          zh="同一份联合,两种筛法:Exclude 去掉成员,Extract 留下成员"
        />
      </div>
      <div className="seg ut-sv-seg" role="tablist">
        {(["exclude", "extract"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            className={`seg-btn mono${mode === m ? " on" : ""}`}
            onClick={() => setMode(m)}
          >
            {m === "exclude" ? "Exclude" : "Extract"}
          </button>
        ))}
      </div>
      <div className="ut-pipe-sig mono">
        type {outName} = {toolName}&lt;OrderStatus, &quot;done&quot; |
        &quot;cancelled&quot;&gt;
      </div>
      <div className="ut-sv-row" aria-live="polite">
        {SIEVE_MEMBERS.map((m) => {
          const ok = keeps(m);
          return (
            <span key={m} className={`ut-sv-chip mono${ok ? " ok" : " cut"}`}>
              &quot;{m}&quot;
              <i className="ut-sv-mark">
                {ok ? (
                  <Tx en="✓ kept" zh="✓ 留下" />
                ) : (
                  <Tx en="✕ removed" zh="✕ 去掉" />
                )}
              </i>
            </span>
          );
        })}
      </div>
      <div className="ut-sv-result mono">
        = {kept.map((m) => `"${m}"`).join(" | ")}
      </div>
      <div className="viz-msg">
        {mode === "exclude" ? (
          <Tx
            en={
              <>
                <b>Exclude</b> removes the members that match the second
                argument. <code>&quot;done&quot;</code> and{" "}
                <code>&quot;cancelled&quot;</code> are dropped, and the rest
                stay. This is the list of orders that are still in progress, so
                it is the right type for the pickup screen.
              </>
            }
            zh={
              <>
                <b>Exclude</b> 去掉与第二个参数匹配的成员:
                <code>&quot;done&quot;</code> 和{" "}
                <code>&quot;cancelled&quot;</code> 被去掉,其余留下。
                这正好是「还在进行中」的订单状态,适合用在取餐大屏上。
              </>
            }
          />
        ) : (
          <Tx
            en={
              <>
                <b>Extract</b> keeps only the members that match, and removes
                everything else. Here it produces the two finished states, which
                is the type an archive table needs.
              </>
            }
            zh={
              <>
                <b>Extract</b> 只留下匹配的成员,其余全部去掉。
                这里得到的是两个终结状态,归档表要的就是这个类型。
              </>
            }
          />
        )}
      </div>
    </div>
  );
}
