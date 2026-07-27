"use client";

// 第 04 章 · 结构化类型 —— 本章专属可视化:
//  - HeroDuck:hero 里的「鸭子测试安检口」循环动画(纯 CSS 驱动)。
//  - CompatPlayground:兼容方向实验台 —— Barista 和 Staff 互相赋值,看哪个方向亮绿灯。
//  - ShapeMatcher:形状匹配器 —— 对象逐成员「对孔」,多余属性检查做成
//    「字面量直传 / 先存变量」开关,亲眼看同一个对象两种命运。

import { useMemo, useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";

/* ================= HeroDuck ================= */

export function HeroDuck() {
  return (
    <div className="st-hero" aria-hidden>
      <div className="st-cands">
        <div className="st-cand">class 正式工</div>
        <div className="st-cand">对象字面量</div>
        <div className="st-cand">隔壁店的 interface</div>
      </div>
      <div className="flow-mid st-hero-mid">
        <div className="flow-line" />
        <span className="flow-packet st-go">{`{ name, makeTea }`}</span>
        <span className="flow-packet back st-back">✓ 形状对,上岗</span>
      </div>
      <div className="flow-node lit st-gate">
        <span className="ico">🦆</span>
        鸭子测试
        <span className="st-gate-sub">只看形状 · 不问出身</span>
      </div>
    </div>
  );
}

/* ================= CompatPlayground ================= */

type Dir = "idle" | "toStaff" | "toBarista";

const BARISTA_MEMBERS = [
  { key: "name", type: "string" },
  { key: "makeTea", type: "() => void" },
  { key: "years", type: "number" },
];
const STAFF_MEMBERS = [{ key: "name", type: "string" }];

export function CompatPlayground() {
  const [dir, setDir] = useState<Dir>("idle");

  const msg: ReactNode =
    dir === "idle" ? (
      <>
        两个类型摆在这:<b>Barista</b> 三个成员,<b>Staff</b>{" "}
        只要一个。点上面的按钮,试试两个赋值方向 —— 猜猜哪个能过。
      </>
    ) : dir === "toStaff" ? (
      <>
        <b>绿灯。</b>排班表只问一件事:有 name 吗?Barista 有,还是
        string —— 对上了。多出来的 makeTea 和 years 是「多带的技能」,
        不碍事。<b>成员多的更具体,可以当成员少的用。</b>
      </>
    ) : (
      <>
        <b>红灯。</b>Staff 身上翻不出 makeTea,也没有 years ——
        缺两个成员,两个孔都对不上。让只登记了名字的人直接上吧台,
        编译器不答应。<b>成员少的,当不了成员多的用。</b>
      </>
    );

  const codeLine =
    dir === "toStaff"
      ? "const s: Staff = barista;   // ✅ 通过"
      : dir === "toBarista"
        ? "const b: Barista = staff;   // ❌ 缺 makeTea、years"
        : "// ← 选一个方向试试";

  return (
    <div className="viz">
      <div className="viz-title">
        兼容方向实验台:多的当少的用,行;反过来,不行
        <span className="seg" role="group">
          <button
            type="button"
            className={`seg-btn${dir === "toStaff" ? " on" : ""}`}
            onClick={() => setDir("toStaff")}
          >
            Barista ⭢ Staff
          </button>
          <button
            type="button"
            className={`seg-btn${dir === "toBarista" ? " on" : ""}`}
            onClick={() => setDir("toBarista")}
          >
            Staff ⭢ Barista
          </button>
        </span>
      </div>
      <div className="viz-stage">
        <div className="viz-scroll">
          <div className="st-duel">
            <TypeCard
              name="Barista"
              sub="后厨老手 · 3 个成员"
              members={BARISTA_MEMBERS}
              lights={
                dir === "toBarista"
                  ? { name: "ok", makeTea: "bad", years: "bad" }
                  : dir === "toStaff"
                    ? { name: "ok", makeTea: "dim", years: "dim" }
                    : {}
              }
            />
            <div className={`st-duel-arrow${dir !== "idle" ? " on" : ""}`}>
              {dir === "toBarista" ? "⬅" : "⮕"}
              <span
                className={`st-duel-verdict ${
                  dir === "idle" ? "" : dir === "toStaff" ? "ok" : "bad"
                }`}
              >
                {dir === "idle" ? "?" : dir === "toStaff" ? "✓ 兼容" : "✕ 拒绝"}
              </span>
            </div>
            <TypeCard
              name="Staff"
              sub="排班表要求 · 1 个成员"
              members={STAFF_MEMBERS}
              lights={dir === "toStaff" ? { name: "ok" } : {}}
            />
          </div>
        </div>
      </div>
      <div className="st-codeline mono">{codeLine}</div>
      <div className="viz-msg" aria-live="polite">
        {msg}
      </div>
    </div>
  );
}

function TypeCard({
  name,
  sub,
  members,
  lights,
}: {
  name: string;
  sub: string;
  members: { key: string; type: string }[];
  lights: Record<string, "ok" | "bad" | "dim">;
}) {
  return (
    <div className="st-type">
      <div className="st-type-name">
        {name}
        <span className="st-type-sub">{sub}</span>
      </div>
      {members.map((m) => (
        <div key={m.key} className={`st-mem ${lights[m.key] ?? ""}`}>
          <span className="st-mem-key">{m.key}</span>
          <span className="st-mem-type">{m.type}</span>
          <span className="st-light" data-s={lights[m.key] ?? "idle"} />
        </div>
      ))}
    </div>
  );
}

/* ================= ShapeMatcher ================= */

const TARGET = [
  { key: "name", type: "string" },
  { key: "makeTea", type: "() => void" },
];

interface Preset {
  id: string;
  label: string;
  /** 对象实际有的成员:key → 展示值 + 实际类型 */
  pins: { key: string; val: string; type: string }[];
}

const PRESETS: Preset[] = [
  {
    id: "fit",
    label: "阿珍 · 刚好匹配",
    pins: [
      { key: "name", val: '"阿珍"', type: "string" },
      { key: "makeTea", val: "() => { … }", type: "() => void" },
    ],
  },
  {
    id: "extra",
    label: "阿强 · 多带一个 salary",
    pins: [
      { key: "name", val: '"阿强"', type: "string" },
      { key: "makeTea", val: "() => { … }", type: "() => void" },
      { key: "salary", val: "8000", type: "number" },
    ],
  },
  {
    id: "missing",
    label: "临时工 · 少了 makeTea",
    pins: [{ key: "name", val: '"临时工"', type: "string" }],
  },
  {
    id: "wrongtype",
    label: "42 号 · name 类型不对",
    pins: [
      { key: "name", val: "42", type: "number" },
      { key: "makeTea", val: "() => { … }", type: "() => void" },
    ],
  },
];

type Light = "idle" | "ok" | "bad" | "warn";

interface MatchFrame {
  mem: Record<string, Light>;
  extras: Record<string, Light>;
  msg: ReactNode;
  verdict?: "ok" | "bad";
  errText?: string;
}

function buildFrames(preset: Preset, literal: boolean): MatchFrame[] {
  const frames: MatchFrame[] = [];
  const mem: Record<string, Light> = {};
  const extras: Record<string, Light> = {};
  const extraPins = preset.pins.filter(
    (p) => !TARGET.some((t) => t.key === p.key),
  );
  let anyBad = false;

  frames.push({
    mem: { ...mem },
    extras: { ...extras },
    msg: literal ? (
      <>
        对象<b>现做现卖</b>,以字面量的身份直接递给 startShift ——
        逐个成员对孔,开始。
      </>
    ) : (
      <>
        对象先存进了变量 <code>c</code>,再把 <code>c</code> 递给
        startShift —— 逐个成员对孔,开始。
      </>
    ),
  });

  for (const t of TARGET) {
    const pin = preset.pins.find((p) => p.key === t.key);
    if (!pin) {
      mem[t.key] = "bad";
      anyBad = true;
      frames.push({
        mem: { ...mem },
        extras: { ...extras },
        msg: (
          <>
            对 <code>{t.key}</code> 这个孔:对象身上翻遍了也没有 ——
            <b>缺孔,红灯</b>。这一条跟怎么传无关,缺就是缺。
          </>
        ),
      });
    } else if (pin.type !== t.type) {
      mem[t.key] = "bad";
      anyBad = true;
      frames.push({
        mem: { ...mem },
        extras: { ...extras },
        msg: (
          <>
            对 <code>{t.key}</code> 这个孔:名字对上了,可它是{" "}
            <code>{pin.type}</code>,孔要的是 <code>{t.type}</code> ——
            <b>插头形状不对,红灯</b>。
          </>
        ),
      });
    } else {
      mem[t.key] = "ok";
      frames.push({
        mem: { ...mem },
        extras: { ...extras },
        msg: (
          <>
            对 <code>{t.key}</code> 这个孔:有,而且是{" "}
            <code>{t.type}</code> —— <b>这一孔对上了,绿灯</b>。
          </>
        ),
      });
    }
  }

  if (extraPins.length > 0 && !anyBad) {
    for (const p of extraPins) extras[p.key] = literal ? "bad" : "warn";
    frames.push({
      mem: { ...mem },
      extras: { ...extras },
      msg: literal ? (
        <>
          还剩一个 <code>{extraPins[0].key}</code>,目标类型里没这个孔。
          字面量是现做现卖的 —— 多写一个属性,只可能是拼错或想多了。
          <b>多余属性检查出手,红灯</b>。
        </>
      ) : (
        <>
          还剩一个 <code>{extraPins[0].key}</code>,目标类型里没这个孔。
          但它存过变量,别处可能正当用途 —— 按「多的当少的用」放行,
          <b>黄灯,不追究</b>。
        </>
      ),
    });
  } else if (extraPins.length > 0) {
    for (const p of extraPins) extras[p.key] = "warn";
  }

  const literalExtraBad = literal && extraPins.length > 0 && !anyBad;
  const pass = !anyBad && !literalExtraBad;
  frames.push({
    mem: { ...mem },
    extras: { ...extras },
    verdict: pass ? "ok" : "bad",
    errText: pass
      ? undefined
      : anyBad
        ? preset.id === "missing"
          ? "Property 'makeTea' is missing in type '{ name: string; }' but required in type 'Staff'."
          : "Type 'number' is not assignable to type 'string'."
        : "Object literal may only specify known properties, and 'salary' does not exist in type 'Staff'.",
    msg: pass ? (
      <>
        <b>通过,上岗。</b>
        {extraPins.length > 0 ? (
          <>
            多带的 {extraPins[0].key} 没人追究 —— 想看另一种命运,
            把上面的开关拨到「字面量直传」再走一遍。
          </>
        ) : (
          <>每个孔都严丝合缝 —— 它从没声明过自己是 Staff,但这不重要。</>
        )}
      </>
    ) : anyBad ? (
      <>
        <b>拒绝。</b>孔对不上就是对不上 —— 编译器把报错原文摆在下面了,
        试着读懂它:说的正是刚才那盏红灯。
      </>
    ) : (
      <>
        <b>拒绝。</b>同一个对象,先存变量就能过 —— 把开关拨到
        「先存变量」验证一下。这不是编译器抽风,是它对「新鲜」字面量
        故意更严:此刻多写的属性,九成是 bug。
      </>
    ),
  });

  return frames;
}

export function ShapeMatcher() {
  const [presetIdx, setPresetIdx] = useState(1);
  const [literal, setLiteral] = useState(true);
  const preset = PRESETS[presetIdx];
  const frames = useMemo(
    () => buildFrames(preset, literal),
    [preset, literal],
  );
  const stepper = useStepper(frames.length);
  const f = frames[Math.min(stepper.step, frames.length - 1)];
  const extraPins = preset.pins.filter(
    (p) => !TARGET.some((t) => t.key === p.key),
  );

  const pick = (i: number) => {
    setPresetIdx(i);
    stepper.reset();
  };
  const setMode = (lit: boolean) => {
    setLiteral(lit);
    stepper.reset();
  };

  return (
    <div className="viz">
      <div className="viz-title">
        形状匹配器:startShift(s: Staff) 的安检口
        <span className="seg" role="group">
          <button
            type="button"
            className={`seg-btn${literal ? " on" : ""}`}
            onClick={() => setMode(true)}
          >
            字面量直传
          </button>
          <button
            type="button"
            className={`seg-btn${!literal ? " on" : ""}`}
            onClick={() => setMode(false)}
          >
            先存变量
          </button>
        </span>
      </div>

      <div className="st-presets" role="group">
        {PRESETS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className={`st-preset${presetIdx === i ? " on" : ""}`}
            onClick={() => pick(i)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="viz-stage">
        <div className="viz-scroll">
          <div className="st-match">
            <div className="st-match-head">
              <span>来应聘的对象</span>
              <span />
              <span>插座 · type Staff</span>
            </div>
            {TARGET.map((t) => {
              const pin = preset.pins.find((p) => p.key === t.key);
              const s = f.mem[t.key] ?? "idle";
              return (
                <div key={t.key} className={`st-row ${s}`}>
                  <span className="st-plug">
                    {pin ? (
                      <>
                        <b>{pin.key}</b>: {pin.val}
                        <em className="st-tt">{pin.type}</em>
                      </>
                    ) : (
                      <span className="st-none">(没有这个成员)</span>
                    )}
                  </span>
                  <span className="st-wire">
                    <span className="st-light" data-s={s} />
                  </span>
                  <span className="st-hole">
                    <b>{t.key}</b>: {t.type}
                  </span>
                </div>
              );
            })}
            {extraPins.map((p) => {
              const s = f.extras[p.key] ?? "idle";
              return (
                <div key={p.key} className={`st-row extra ${s}`}>
                  <span className="st-plug">
                    <b>{p.key}</b>: {p.val}
                    <em className="st-tt">{p.type}</em>
                  </span>
                  <span className="st-wire">
                    <span className="st-light" data-s={s} />
                  </span>
                  <span className="st-hole st-none">(没有对应的孔)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="st-codeline mono">
        {literal
          ? `startShift({ ${preset.pins.map((p) => `${p.key}: ${p.val}`).join(", ")} })`
          : `const c = { ${preset.pins.map((p) => `${p.key}: ${p.val}`).join(", ")} };  startShift(c)`}
        {f.verdict && (
          <span className={`st-verdict ${f.verdict}`}>
            {f.verdict === "ok" ? "✓ 编译通过" : "✕ 编译报错"}
          </span>
        )}
      </div>
      {f.errText && <div className="st-err mono">{f.errText}</div>}

      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={frames.length} />
    </div>
  );
}
