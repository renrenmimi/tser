"use client";

// Chapter 04 · Structural typing — visualizations for this chapter:
//  - HeroDuck: the "duck test" gate in the hero, looping (pure CSS).
//  - CompatPlayground: assign Barista to Staff and back, and see which
//    direction is allowed.
//  - ShapeMatcher: the object is checked member by member. The excess property
//    check becomes a switch between "literal at the call site" and "stored in a
//    variable first", so the same object gets two different verdicts.

import { useMemo, useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
import { T, useL, type Loc } from "@/lib/i18n";

/* ================= HeroDuck ================= */

const HERO_CANDS: Loc<string>[] = [
  { en: "class instance", zh: "class 实例" },
  { en: "object literal", zh: "对象字面量" },
  { en: "imported interface", zh: "别处的 interface" },
];

export function HeroDuck() {
  const L = useL();
  return (
    <div className="st-hero" aria-hidden>
      <div className="st-cands">
        {HERO_CANDS.map((c, i) => (
          <div key={i} className="st-cand">
            {L(c)}
          </div>
        ))}
      </div>
      <div className="flow-mid st-hero-mid">
        <div className="flow-line" />
        <span className="flow-packet st-go">{`{ name, makeTea }`}</span>
        <span className="flow-packet back st-back">
          <T en="✓ shape matches" zh="✓ 形状对上了" />
        </span>
      </div>
      <div className="flow-node lit st-gate">
        <span className="ico">🦆</span>
        <T en="Duck test" zh="鸭子测试" />
        <span className="st-gate-sub">
          <T en="Members only · no declaration" zh="只看成员 · 不问声明" />
        </span>
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
  const L = useL();
  const [dir, setDir] = useState<Dir>("idle");

  const msg: ReactNode =
    dir === "idle" ? (
      <T
        en={
          <>
            Two types are on the table. <b>Barista</b> has three members,{" "}
            <b>Staff</b> requires one. Use the buttons above to try both
            assignment directions, and predict which one is allowed.
          </>
        }
        zh={
          <>
            两个类型摆在这里:<b>Barista</b> 有三个成员,<b>Staff</b>{" "}
            只要求一个。用上面的按钮试两个赋值方向,先猜猜哪个能过。
          </>
        }
      />
    ) : dir === "toStaff" ? (
      <T
        en={
          <>
            <b>Allowed.</b> <code>Staff</code> asks one question: is there a{" "}
            <code>name</code>, and is it a <code>string</code>?{" "}
            <code>Barista</code> answers yes. The extra <code>makeTea</code> and{" "}
            <code>years</code> are not part of the requirement, so they are
            ignored. <b>A type with more members can stand in for one with
            fewer.</b>
          </>
        }
        zh={
          <>
            <b>通过。</b>
            <code>Staff</code> 只问一件事:有没有 <code>name</code>,
            是不是 <code>string</code>?<code>Barista</code> 的回答是有。
            多出来的 <code>makeTea</code> 和 <code>years</code>{" "}
            不在要求里,直接被忽略。<b>成员多的类型,可以顶替成员少的。</b>
          </>
        }
      />
    ) : (
      <T
        en={
          <>
            <b>Rejected.</b> <code>Staff</code> has no <code>makeTea</code> and
            no <code>years</code>, so two required members are missing. The
            compiler reports both of them at once:{" "}
            <b>a type with fewer members cannot stand in for one with more.</b>
          </>
        }
        zh={
          <>
            <b>拒绝。</b>
            <code>Staff</code> 身上既没有 <code>makeTea</code> 也没有{" "}
            <code>years</code>,两个必需成员都缺。编译器会一次报出这两个:
            <b>成员少的类型,顶替不了成员多的。</b>
          </>
        }
      />
    );

  const codeLine: Loc<string> =
    dir === "toStaff"
      ? {
          en: "const s: Staff = barista;   // ✓ accepted",
          zh: "const s: Staff = barista;   // ✓ 通过",
        }
      : dir === "toBarista"
        ? {
            en: "const b: Barista = staff;   // ✕ ts(2739): missing makeTea, years",
            zh: "const b: Barista = staff;   // ✕ ts(2739):缺 makeTea、years",
          }
        : {
            en: "// ← pick a direction to try",
            zh: "// ← 选一个方向试试",
          };

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="Assignability direction: more members can stand in for fewer, not the other way round"
          zh="兼容方向实验台:多的当少的用可以,反过来不行"
        />
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
              sub={<T en="the value · 3 members" zh="要赋的值 · 3 个成员" />}
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
                {dir === "idle" ? (
                  "?"
                ) : dir === "toStaff" ? (
                  <T en="✓ compatible" zh="✓ 兼容" />
                ) : (
                  <T en="✕ rejected" zh="✕ 拒绝" />
                )}
              </span>
            </div>
            <TypeCard
              name="Staff"
              sub={<T en="the target · 1 member" zh="目标要求 · 1 个成员" />}
              members={STAFF_MEMBERS}
              lights={dir === "toStaff" ? { name: "ok" } : {}}
            />
          </div>
        </div>
      </div>
      <div className="st-codeline mono">{L(codeLine)}</div>
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
  sub: ReactNode;
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
  label: Loc<string>;
  /** the members the object really has: key → displayed value + actual type */
  pins: { key: string; val: string; type: string }[];
}

const PRESETS: Preset[] = [
  {
    id: "fit",
    label: { en: "Zhen · exact match", zh: "Zhen · 刚好匹配" },
    pins: [
      { key: "name", val: '"Zhen"', type: "string" },
      { key: "makeTea", val: "() => { … }", type: "() => void" },
    ],
  },
  {
    id: "extra",
    label: { en: "Qiang · one extra salary", zh: "Qiang · 多带一个 salary" },
    pins: [
      { key: "name", val: '"Qiang"', type: "string" },
      { key: "makeTea", val: "() => { … }", type: "() => void" },
      { key: "salary", val: "8000", type: "number" },
    ],
  },
  {
    id: "missing",
    label: { en: "Temp · no makeTea", zh: "Temp · 少了 makeTea" },
    pins: [{ key: "name", val: '"Temp"', type: "string" }],
  },
  {
    id: "wrongtype",
    label: { en: "No.42 · name is a number", zh: "42 号 · name 类型不对" },
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
  /** compiler output — stays in English in both languages */
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
      <T
        en={
          <>
            The object is written <b>at the call site</b> and passed to{" "}
            <code>startShift</code> as a literal. The members are now checked
            one by one.
          </>
        }
        zh={
          <>
            这个对象<b>直接写在调用处</b>,以字面量的身份传给{" "}
            <code>startShift</code>。现在开始逐个检查成员。
          </>
        }
      />
    ) : (
      <T
        en={
          <>
            The object is stored in the variable <code>c</code> first, and{" "}
            <code>c</code> is passed to <code>startShift</code>. The members are
            now checked one by one.
          </>
        }
        zh={
          <>
            这个对象先存进变量 <code>c</code>,再把 <code>c</code> 传给{" "}
            <code>startShift</code>。现在开始逐个检查成员。
          </>
        }
      />
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
          <T
            en={
              <>
                Required member <code>{t.key}</code>: the object does not have
                it at all. <b>Missing, so this one fails.</b> This has nothing
                to do with how the object was passed. Missing is missing.
              </>
            }
            zh={
              <>
                必需成员 <code>{t.key}</code>:对象身上根本没有。
                <b>缺失,这一项不通过。</b>
                这和对象怎么传进来无关,缺就是缺。
              </>
            }
          />
        ),
      });
    } else if (pin.type !== t.type) {
      mem[t.key] = "bad";
      anyBad = true;
      frames.push({
        mem: { ...mem },
        extras: { ...extras },
        msg: (
          <T
            en={
              <>
                Required member <code>{t.key}</code>: the name is there, but its
                type is <code>{pin.type}</code> and the requirement is{" "}
                <code>{t.type}</code>. <b>The types do not match, so this one
                fails.</b>
              </>
            }
            zh={
              <>
                必需成员 <code>{t.key}</code>:名字是有,但它的类型是{" "}
                <code>{pin.type}</code>,要求的是 <code>{t.type}</code>。
                <b>类型对不上,这一项不通过。</b>
              </>
            }
          />
        ),
      });
    } else {
      mem[t.key] = "ok";
      frames.push({
        mem: { ...mem },
        extras: { ...extras },
        msg: (
          <T
            en={
              <>
                Required member <code>{t.key}</code>: present, and its type is{" "}
                <code>{t.type}</code>. <b>This one passes.</b>
              </>
            }
            zh={
              <>
                必需成员 <code>{t.key}</code>:有,类型也是{" "}
                <code>{t.type}</code>。<b>这一项通过。</b>
              </>
            }
          />
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
        <T
          en={
            <>
              One member is left over: <code>{extraPins[0].key}</code>, which
              the target type does not declare. The literal was written for this
              one call, so an extra property is almost always a typo or a
              misunderstanding. <b>The excess property check reports it.</b>
            </>
          }
          zh={
            <>
              还剩一个 <code>{extraPins[0].key}</code>,目标类型里没有声明它。
              这个字面量只为这一次调用而写,多出来的属性几乎都是拼错或误解。
              <b>多余属性检查在这里报错。</b>
            </>
          }
        />
      ) : (
        <T
          en={
            <>
              One member is left over: <code>{extraPins[0].key}</code>, which
              the target type does not declare. But the object lives in a
              variable and may be used elsewhere for a valid reason, so the
              ordinary rule applies: more members are allowed.{" "}
              <b>Not reported.</b>
            </>
          }
          zh={
            <>
              还剩一个 <code>{extraPins[0].key}</code>,目标类型里没有声明它。
              但这个对象存在变量里,别处可能另有正当用途,
              于是按普通规则判断:成员多是允许的。<b>不报错。</b>
            </>
          }
        />
      ),
    });
  } else if (extraPins.length > 0) {
    for (const p of extraPins) extras[p.key] = "warn";
  }

  const literalExtraBad = literal && extraPins.length > 0 && !anyBad;
  const pass = !anyBad && !literalExtraBad;

  let errText: string | undefined;
  if (!pass) {
    if (preset.id === "missing") {
      // identical in both modes: a missing member is not about freshness
      errText =
        "Argument of type '{ name: string; }' is not assignable to parameter of type 'Staff'. Property 'makeTea' is missing in type '{ name: string; }' but required in type 'Staff'. ts(2345)";
    } else if (preset.id === "wrongtype") {
      errText = literal
        ? "Type 'number' is not assignable to type 'string'. ts(2322)"
        : "Argument of type '{ name: number; makeTea: () => void; }' is not assignable to parameter of type 'Staff'. Types of property 'name' are incompatible. Type 'number' is not assignable to type 'string'. ts(2345)";
    } else {
      errText =
        "Object literal may only specify known properties, and 'salary' does not exist in type 'Staff'. ts(2353)";
    }
  }

  frames.push({
    mem: { ...mem },
    extras: { ...extras },
    verdict: pass ? "ok" : "bad",
    errText,
    msg: pass ? (
      extraPins.length > 0 ? (
        <T
          en={
            <>
              <b>Accepted.</b> Nobody objected to the extra{" "}
              {extraPins[0].key}. To see the other outcome, set the switch above
              to &quot;pass a literal&quot; and run it again.
            </>
          }
          zh={
            <>
              <b>通过。</b>多出来的 {extraPins[0].key} 没有被追究。
              想看另一种结果,把上面的开关拨到「字面量直传」,再走一遍。
            </>
          }
        />
      ) : (
        <T
          en={
            <>
              <b>Accepted.</b> Every required member is present with a matching
              type. The object never declared that it was a <code>Staff</code>,
              and that makes no difference.
            </>
          }
          zh={
            <>
              <b>通过。</b>每个必需成员都在,类型也对得上。
              这个对象从没声明过自己是 <code>Staff</code>,而这并不影响结果。
            </>
          }
        />
      )
    ) : anyBad ? (
      <T
        en={
          <>
            <b>Rejected.</b> A required member did not match, and that is true
            however the object is passed. The compiler message is shown above —
            it describes exactly the member that failed.
          </>
        }
        zh={
          <>
            <b>拒绝。</b>有必需成员没对上,而且无论对象怎么传都是这个结果。
            编译器的原文就在上面 —— 它描述的正是刚才没通过的那个成员。
          </>
        }
      />
    ) : (
      <T
        en={
          <>
            <b>Rejected.</b> The same object compiles once it is stored in a
            variable. Switch to &quot;store in a variable&quot; and check. This
            is not inconsistent behavior: the compiler is deliberately stricter
            with a fresh literal, because an extra property there is almost
            always a bug.
          </>
        }
        zh={
          <>
            <b>拒绝。</b>同一个对象,先存进变量就能通过 ——
            把开关拨到「先存变量」验证一下。这不是前后矛盾:
            编译器对新鲜的字面量刻意更严,因为此处多出来的属性几乎都是 bug。
          </>
        }
      />
    ),
  });

  return frames;
}

export function ShapeMatcher() {
  const L = useL();
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
        <T
          en="Shape matcher: the check performed by startShift(s: Staff)"
          zh="形状匹配器:startShift(s: Staff) 处的检查"
        />
        <span className="seg" role="group">
          <button
            type="button"
            className={`seg-btn${literal ? " on" : ""}`}
            onClick={() => setMode(true)}
          >
            <T en="Pass a literal" zh="字面量直传" />
          </button>
          <button
            type="button"
            className={`seg-btn${!literal ? " on" : ""}`}
            onClick={() => setMode(false)}
          >
            <T en="Store in a variable" zh="先存变量" />
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
            {L(p.label)}
          </button>
        ))}
      </div>

      <div className="viz-stage">
        <div className="viz-scroll">
          <div className="st-match">
            <div className="st-match-head">
              <span>
                <T en="The value being passed" zh="传进来的值" />
              </span>
              <span />
              <span>
                <T en="Required · type Staff" zh="要求 · type Staff" />
              </span>
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
                      <span className="st-none">
                        <T en="(no such member)" zh="(没有这个成员)" />
                      </span>
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
                  <span className="st-hole st-none">
                    <T en="(not required)" zh="(不在要求里)" />
                  </span>
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
            {f.verdict === "ok" ? (
              <T en="✓ compiles" zh="✓ 编译通过" />
            ) : (
              <T en="✕ compile error" zh="✕ 编译报错" />
            )}
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
