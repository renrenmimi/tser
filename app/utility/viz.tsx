"use client";

// 第 06 章 · 内置工具类型 —— 本章专属可视化:
//  - UtHeroToolbox:hero 顶部的「Order 进 → 换刀头 → 新类型出」轮播示意。
//  - UtPipeline:类型加工流水线(本章招牌)—— 六个字段逐个过机,
//    Partial / Readonly / Pick / Omit 四个刀头可切换,配逐帧旁白。
//  - UtUnionSieve:联合类型筛子 —— Exclude / Extract 对同一个 union 的两种筛法。

import { useEffect, useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";

/* ================= UtHeroToolbox ================= */

const HERO_TOOLS = [
  { tool: "Partial", out: "Partial<Order>", eff: "字段全变可选" },
  { tool: "Readonly", out: "Readonly<Order>", eff: "字段全部上锁" },
  { tool: "Pick", out: 'Pick<Order, "id" | "size">', eff: "只挑要的字段" },
  { tool: "Omit", out: 'Omit<Order, "internalNote">', eff: "抹掉不给看的" },
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
  blurb: string;
}[] = [
  {
    id: "Partial",
    sig: "Partial<Order>",
    out: "DraftOrder",
    blurb: "每个字段拧上 ? —— 草稿订单,想填几项填几项",
  },
  {
    id: "Readonly",
    sig: "Readonly<Order>",
    out: "LockedOrder",
    blurb: "每个字段焊上 readonly —— 小票打出来就不许改",
  },
  {
    id: "Pick",
    sig: 'Pick<Order, "id" | "drink" | "size">',
    out: "OrderListItem",
    blurb: "白名单:点到名的留下,其他一律不放行",
  },
  {
    id: "Omit",
    sig: 'Omit<Order, "internalNote">',
    out: "PublicOrder",
    blurb: "黑名单:点到名的丢废料箱,其他原样通过",
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
      <>
        <b>{f.key}</b> 过机:类型一个字符没动,冒号前拧上一个 <code>?</code> ——
        这一项想填就填,不填也合法。
      </>
    );
  if (v === "lock")
    return (
      <>
        <b>{f.key}</b> 过机:前面焊上 <code>readonly</code> ——
        初始化之后再想赋值,编译器直接拦下。
      </>
    );
  if (v === "keep")
    return tool === "Pick" ? (
      <>
        <b>{f.key}</b> 在白名单上,原样放行 —— 名字、类型,一个字符都没改。
      </>
    ) : (
      <>
        <b>{f.key}</b> 没被点名,原样通过 —— Omit 只对名单上的键下手。
      </>
    );
  return tool === "Pick" ? (
    <>
      <b>{f.key}</b> 不在 Pick 的白名单上,拦下丢进废料箱 ——
      新类型里查无此人。
    </>
  ) : (
    <>
      <b>{f.key}</b> 被 Omit 点名,丢进废料箱 ——
      对外的类型里再也看不到它。
    </>
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
      <>
        六个字段在传送带上排好队,机器换上 <b>{tool}</b> 刀头
        —— 点「下一步」,看它们一个个过机。
      </>
    );
  else if (curIdx !== null) msg = utFieldMsg(tool, UT_FIELDS[curIdx]);
  else
    msg = (
      <>
        出料完毕,这就是 <b>{meta.out}</b>。回头看入料区:<b>Order</b>{" "}
        一根毫毛都没少 —— 工具类型是纯函数,<b>产新,不改旧</b>。
      </>
    );

  return (
    <div className="viz">
      <div className="viz-title">
        类型加工流水线:同一个 Order,换个刀头就是另一种类型
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
            <div className="ut-pipe-lab">入料 · Order</div>
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
                <div className="ut-bin-lab">废料箱</div>
                {dropped.length === 0 ? (
                  <span className="ut-bin-empty">(空)</span>
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
              出料 · {meta.out}
              {doneAll && <span className="ut-pipe-done">✓ 完工</span>}
            </div>
            {outFields.length === 0 && (
              <div className="ut-pipe-empty">等待出料…</div>
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
        联合类型的筛子:同一份名单,Exclude 剔人,Extract 挑人
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
              <i className="ut-sv-mark">{ok ? "✓ 留" : "✕ 筛掉"}</i>
            </span>
          );
        })}
      </div>
      <div className="ut-sv-result mono">
        = {kept.map((m) => `"${m}"`).join(" | ")}
      </div>
      <div className="viz-msg">
        {mode === "exclude" ? (
          <>
            <b>Exclude</b> 是漏勺:榜上有名的(done / cancelled)漏下去,
            剩下的接着走 —— 正好筛出「还活着」的订单状态,喂给取餐大屏。
          </>
        ) : (
          <>
            <b>Extract</b> 是磁铁:只把榜上有名的吸出来,其余一概不要 ——
            归档表里只存已经终结的订单,就用它。
          </>
        )}
      </div>
    </div>
  );
}
