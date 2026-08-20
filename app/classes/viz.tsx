"use client";

// Chapter 08 · Classes and interfaces — visualizations:
//  - GateHero: the three access levels, as three floors (decorative).
//  - AccessGate: member × access location, with the compiler's real message.
//  - ErasureViz: TS private vs JS #field, source next to compiled output.
//  - ContractBoard: one interface and three classes that try to match it.
//  - StructuralClassFlow: same shape → compatible; add private → not compatible.

import { useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
import { T, useL, type Loc } from "@/lib/i18n";

/* ================= GateHero ================= */

interface Floor {
  ico: string;
  name: Loc<string>;
  sub: Loc<string>;
}

const FLOORS: Floor[] = [
  {
    ico: "🏦",
    name: { en: "private · this class only", zh: "private · 只有本类" },
    sub: {
      en: "Only code written inside the same class body may read it.",
      zh: "只有写在同一个类体里的代码能读它。",
    },
  },
  {
    ico: "🛗",
    name: {
      en: "protected · this class and its subclasses",
      zh: "protected · 本类与子类",
    },
    sub: {
      en: "The class and any class that extends it may read it.",
      zh: "本类,以及任何 extends 它的类,都能读。",
    },
  },
  {
    ico: "🏠",
    name: { en: "public · any code", zh: "public · 任何代码" },
    sub: {
      en: "Any code may read it. You get this when you write no modifier.",
      zh: "任何代码都能读 —— 不写修饰符时,默认就是它。",
    },
  },
];

export function GateHero() {
  const L = useL();
  return (
    <div className="cl-tower" aria-hidden>
      {FLOORS.map((f, i) => (
        <div
          key={i}
          className="cl-floor"
          style={{ animationDelay: `${180 + i * 170}ms` }}
        >
          <span className="ico">{f.ico}</span>
          <b>{L(f.name)}</b>
          <small>{L(f.sub)}</small>
        </div>
      ))}
    </div>
  );
}

/* ================= AccessGate ================= */

interface GateMember {
  key: string;
  mod: string;
  ico: string;
  decl: string;
}

const GATE_MEMBERS: GateMember[] = [
  { key: "name", mod: "public", ico: "🏠", decl: 'name = "Bloom Tea"' },
  {
    key: "recipe",
    mod: "protected",
    ico: "🛗",
    decl: 'protected recipe = "tea base first"',
  },
  {
    key: "vaultCode",
    mod: "private",
    ico: "🏦",
    decl: 'private vaultCode = "8848"',
  },
];

const GATE_PLACES: { label: Loc<string>; sub: Loc<string> }[] = [
  {
    label: { en: "Inside the class", zh: "类内部" },
    sub: {
      en: "in a method of MilkTeaShop",
      zh: "在 MilkTeaShop 自己的方法里",
    },
  },
  {
    label: { en: "In a subclass", zh: "子类里" },
    sub: {
      en: "in FranchiseShop extends MilkTeaShop",
      zh: "在 FranchiseShop extends MilkTeaShop 里",
    },
  },
  {
    label: { en: "Outside", zh: "外部" },
    sub: {
      en: "on an instance created with new",
      zh: "在 new 出来的实例上直接点",
    },
  },
];

const GATE_OK_MSG: Loc<string>[][] = [
  [
    {
      en: "A public member is readable from anywhere, so reading it inside the class is fine.",
      zh: "public 成员任何地方都能读,类内部当然可以。",
    },
    {
      en: "A public member is readable from anywhere, so a subclass can read it too.",
      zh: "public 成员任何地方都能读,子类自然也能。",
    },
    {
      en: "A public member is readable from anywhere, including outside the class. public is also what you get when you write no modifier at all.",
      zh: "public 成员任何地方都能读,类外也一样。不写修饰符时,默认就是 public。",
    },
  ],
  [
    {
      en: "A protected member is readable inside the class that declares it.",
      zh: "protected 成员在声明它的类内部可读。",
    },
    {
      en: "A protected member is readable inside subclasses too. That is the only thing protected adds over private.",
      zh: "protected 成员在子类里同样可读 —— 这正是它比 private 多出来的那一点。",
    },
    "",
  ],
  [
    {
      en: "A private member is readable inside the class that declares it, and this code is inside that class.",
      zh: "private 成员只在声明它的类内部可读,而这段代码正在类内部。",
    },
    "",
    "",
  ],
];

function gateAllowed(m: number, p: number): boolean {
  if (m === 0) return true;
  if (m === 1) return p < 2;
  return p === 0;
}

function gateError(m: number): { note: Loc<string>; err: string } {
  if (m === 1)
    return {
      note: {
        en: "Code outside the class cannot read a protected member. Subclasses can; outside code cannot.",
        zh: "类外的代码读不到 protected 成员:子类可以,外部不行。",
      },
      err: "Property 'recipe' is protected and only accessible within class 'MilkTeaShop' and its subclasses. ts(2445)",
    };
  return {
    note: {
      en: "A private member is readable only inside the class that declares it. A subclass does not count as inside, and neither does outside code.",
      zh: "private 成员只在声明它的那个类内部可读。子类不算「内部」,类外更不算。",
    },
    err: "Property 'vaultCode' is private and only accessible within class 'MilkTeaShop'. ts(2341)",
  };
}

function gateLines(
  m: GateMember,
  place: number,
): { s: string; on?: boolean }[] {
  if (place === 0)
    return [
      { s: "class MilkTeaShop {" },
      { s: `  ${m.decl};` },
      { s: "  intro() {" },
      { s: `    return this.${m.key};`, on: true },
      { s: "  }" },
      { s: "}" },
    ];
  if (place === 1)
    return [
      { s: "class FranchiseShop extends MilkTeaShop {" },
      { s: "  open() {" },
      { s: `    return this.${m.key};`, on: true },
      { s: "  }" },
      { s: "}" },
    ];
  return [
    { s: "const shop = new MilkTeaShop();" },
    { s: `shop.${m.key};`, on: true },
  ];
}

export function AccessGate() {
  const L = useL();
  const [member, setMember] = useState(2);
  const [place, setPlace] = useState(2);
  const m = GATE_MEMBERS[member];
  const allowed = gateAllowed(member, place);
  const deny = allowed ? null : gateError(member);
  const lines = gateLines(m, place);

  return (
    <div className="viz cl-gate">
      <div className="viz-title">
        <T
          en="Access checker: pick a member, then pick where the access happens"
          zh="访问检查器:选一个成员,再选从哪里访问"
        />
      </div>
      <div className="cl-gate-row">
        <span className="cl-gate-lab">
          <T en="MEMBER" zh="成员" />
        </span>
        <div className="seg">
          {GATE_MEMBERS.map((gm, i) => (
            <button
              key={gm.key}
              type="button"
              className={`seg-btn${member === i ? " on" : ""}`}
              onClick={() => setMember(i)}
            >
              {gm.ico} {gm.mod} {gm.key}
            </button>
          ))}
        </div>
      </div>
      <div className="cl-gate-row">
        <span className="cl-gate-lab">
          <T en="FROM" zh="位置" />
        </span>
        <div className="seg">
          {GATE_PLACES.map((gp, i) => (
            <button
              key={i}
              type="button"
              className={`seg-btn${place === i ? " on" : ""}`}
              onClick={() => setPlace(i)}
            >
              {L(gp.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="cl-gate-stage">
        <pre className="cl-code">
          {lines.map((l, i) => (
            <div
              key={i}
              className={`cl-ln${l.on ? (allowed ? " on ok" : " on bad") : ""}`}
            >
              {l.s}
            </div>
          ))}
        </pre>
        <div className={`cl-lamp ${allowed ? "ok" : "bad"}`} aria-live="polite">
          <span className="cl-lamp-ico">{allowed ? "🟢" : "🔴"}</span>
          <div>
            <b>
              {allowed ? (
                <T en="The compiler accepts this" zh="编译器放行" />
              ) : (
                <T en="The compiler rejects this" zh="编译器拦下" />
              )}
            </b>
            <p>{L(allowed ? GATE_OK_MSG[member][place] : deny!.note)}</p>
            <p className="cl-gate-sub">
              {m.ico} {m.mod}{" "}
              <T en="member · read from" zh="成员 · 访问自" />{" "}
              {L(GATE_PLACES[place].label)} ({L(GATE_PLACES[place].sub)})
            </p>
            {deny && <code className="cl-err">{deny.err}</code>}
          </div>
        </div>
      </div>
      <div className="viz-msg">
        <T
          en={
            <>
              Try all nine combinations. <b>public passes in all three places,
              protected in two, private in one.</b> Read the two error messages
              closely: the protected one ends with{" "}
              <code>and its subclasses</code>, the private one does not. Both
              checks happen only while compiling.
            </>
          }
          zh={
            <>
              九种组合都点一遍。<b>public 三处全通,protected 两通一拦,private
              一通两拦。</b>两条报错值得读细:protected 那条末尾多了{" "}
              <code>and its subclasses</code>,private 那条没有。
              两种检查都只发生在编译期。
            </>
          }
        />
      </div>
    </div>
  );
}

/* ================= ErasureViz ================= */

interface EraseTab {
  label: string;
  src: string;
  out: string;
  probe: string;
  result: Loc<string>;
  sealed: boolean;
  note: ReactNode;
}

const ERASE_TABS: EraseTab[] = [
  {
    label: "TS private",
    src: `class Shop {
  private vaultCode = "8848";
}`,
    out: `class Shop {
  vaultCode = "8848";
}`,
    probe: 'shop["vaultCode"]',
    result: {
      en: '"8848" — no error, no cast',
      zh: '"8848" —— 不报错,也不用断言',
    },
    sealed: false,
    note: (
      <T
        en={
          <>
            <b>The word private is erased.</b> The compiled JavaScript holds an
            ordinary property. TypeScript even accepts{" "}
            <code>shop[&quot;vaultCode&quot;]</code> in the source: bracket
            access to a private member is a deliberate escape hatch, so no cast
            is needed. At runtime <code>JSON.stringify(shop)</code>, DevTools,
            and any plain JavaScript file all see the value.
          </>
        }
        zh={
          <>
            <b>private 这个词被整个擦掉了。</b>编译产物里就是一个普通属性。
            连源码里的 <code>shop[&quot;vaultCode&quot;]</code> TypeScript
            都放行 —— 用方括号访问私有成员是它有意保留的后门,连断言都不用写。
            运行时,<code>JSON.stringify(shop)</code>、DevTools
            和任何一个普通 JavaScript 文件都看得见这个值。
          </>
        }
      />
    ),
  },
  {
    label: "JS #field",
    src: `class Shop {
  #vaultCode = "8848";
}`,
    out: `class Shop {
  #vaultCode = "8848";
}`,
    probe: 'shop["#vaultCode"]',
    result: {
      en: "undefined — there is no such property",
      zh: "undefined —— 根本没有这个属性",
    },
    sealed: true,
    note: (
      <T
        en={
          <>
            <b>#vaultCode is JavaScript syntax, not TypeScript syntax.</b> With
            a modern target it is emitted unchanged and stays unreachable from
            outside the class at runtime. <code>shop.#vaultCode</code> written
            outside the class is a syntax error, and{" "}
            <code>JSON.stringify(shop)</code> prints <code>{"{}"}</code>. With
            an older target the compiler emits a <code>WeakMap</code> that
            keeps the same behavior.
          </>
        }
        zh={
          <>
            <b>#vaultCode 是 JavaScript 的语法,不是 TypeScript 的。</b>
            在较新的 target 下它原样输出,运行时类外确实拿不到。类外写{" "}
            <code>shop.#vaultCode</code> 是语法错误,
            <code>JSON.stringify(shop)</code> 打印出来是 <code>{"{}"}</code>。
            target 较老时,编译器会改用 <code>WeakMap</code> 实现,行为一样。
          </>
        }
      />
    ),
  },
];

export function ErasureViz() {
  const L = useL();
  const [tab, setTab] = useState(0);
  const t = ERASE_TABS[tab];
  return (
    <div className="viz cl-erase">
      <div className="viz-title">
        <T en="Source next to compiled output" zh="源码与编译产物对照" />
        <span className="seg">
          {ERASE_TABS.map((et, i) => (
            <button
              key={et.label}
              type="button"
              className={`seg-btn${tab === i ? " on" : ""}`}
              onClick={() => setTab(i)}
            >
              {et.label}
            </button>
          ))}
        </span>
      </div>
      <div className="cl-erase-grid">
        <div className="cl-erase-panel">
          <div className="hd">
            <T en="The .ts you write" zh="你写的 .ts" />
          </div>
          <pre>{t.src}</pre>
        </div>
        <span className="cl-erase-arrow" aria-hidden>
          tsc →
        </span>
        <div className="cl-erase-panel">
          <div className="hd">
            <T en="The .js it produces" zh="编译出的 .js" />
          </div>
          <pre>{t.out}</pre>
        </div>
      </div>
      <div className={`cl-probe ${t.sealed ? "ok" : "bad"}`}>
        <span className="cl-probe-lab">
          <T en="TRY TO READ IT" zh="试着读它" />
        </span>
        <code>{t.probe}</code>
        <span className="cl-probe-res">
          {t.sealed ? "🔒" : "🔓"} {L(t.result)}
        </span>
      </div>
      <div className="viz-msg">{t.note}</div>
    </div>
  );
}

/* ================= ContractBoard ================= */

export function ContractBoard() {
  return (
    <div className="cl-contract">
      <div className="cl-pact">
        <div className="cl-pact-head">
          <T
            en="📜 interface PaymentProvider — the contract"
            zh="📜 interface PaymentProvider —— 契约"
          />
        </div>
        <ul>
          <li>
            <code>pay(amount: number): Promise&lt;string&gt;</code>
          </li>
          <li>
            <code>refund(txId: string): Promise&lt;void&gt;</code>
          </li>
        </ul>
        <small>
          <T
            en="It lists which members must exist. It contains no implementation, and it disappears when the code is compiled."
            zh="它只列出必须有哪些成员,没有任何实现,而且编译后会整个消失。"
          />
        </small>
      </div>
      <div className="cl-arrow" aria-hidden>
        <T
          en="implements — checked, nothing added"
          zh="implements —— 只检查,不添加任何成员"
        />
        <span>▼</span>
      </div>
      <div className="cl-fuls">
        <div className="cl-ful">
          <b>💚 WeChatPay</b>
          <span className="tick ok">✓ pay ✓ refund</span>
          <small>
            <T
              en="Calls the WeChat SDK. Both members exist with matching types, so the check passes."
              zh="内部调微信 SDK。两个成员都在,类型也对得上,检查通过。"
            />
          </small>
        </div>
        <div className="cl-ful">
          <b>💙 AliPay</b>
          <span className="tick ok">✓ pay ✓ refund</span>
          <small>
            <T
              en="A different SDK, the same two members. The check passes just the same."
              zh="换了一套 SDK,成员还是那两个,照样通过。"
            />
          </small>
        </div>
        <div className="cl-ful bad">
          <b>🩶 CashPay</b>
          <span className="tick no">
            <T en="✓ pay ✕ refund missing" zh="✓ pay ✕ 缺 refund" />
          </span>
          <small>
            Class &apos;CashPay&apos; incorrectly implements interface
            &apos;PaymentProvider&apos;. Property &apos;refund&apos; is missing
            in type &apos;CashPay&apos; but required in type
            &apos;PaymentProvider&apos;. ts(2420)
          </small>
        </div>
      </div>
    </div>
  );
}

/* ================= StructuralClassFlow ================= */

interface CupFrame {
  base?: boolean;
  withPrivate: boolean;
  inherit?: boolean;
  ok: boolean;
  assign: Loc<string>;
  msg: ReactNode;
}

const CUP_FRAMES: CupFrame[] = [
  {
    withPrivate: false,
    ok: true,
    assign: "const cup: PaperCup = new PlasticCup();  // ✓",
    msg: (
      <T
        en={
          <>
            The rule from chapter 04 applies to classes as well:{" "}
            <b>the compiler compares shapes, not names</b>. These two classes
            declare the same members, so a PlasticCup is accepted where a
            PaperCup is expected.
          </>
        }
        zh={
          <>
            第 04 章的规则在 class 上照常生效:<b>编译器比较的是形状,不是名字</b>
            。这两个类声明的成员完全一样,所以要 PaperCup 的地方,
            给一个 PlasticCup 也接受。
          </>
        }
      />
    ),
  },
  {
    withPrivate: true,
    ok: false,
    assign: "const cup: PaperCup = new PlasticCup();  // ✕ ts(2322)",
    msg: (
      <T
        en={
          <>
            Now each class declares its own <code>private stock</code>. The name
            and the type are identical, and the assignment still fails:{" "}
            <b>
              Types have separate declarations of a private property
              &apos;stock&apos;.
            </b>
          </>
        }
        zh={
          <>
            现在两个类各自声明了一个 <code>private stock</code>。名字一样、
            类型一样,赋值依然失败:
            <b>
              Types have separate declarations of a private property
              &apos;stock&apos;.
            </b>
          </>
        }
      />
    ),
  },
  {
    withPrivate: true,
    ok: false,
    assign: {
      en: "const cup: PaperCup = new PlasticCup();  // ✕ why?",
      zh: "const cup: PaperCup = new PlasticCup();  // ✕ 为什么?",
    },
    msg: (
      <T
        en={
          <>
            Why? TypeScript compares private and protected members by{" "}
            <b>where they were declared</b>, not by name and type. Two separate
            declarations are two different members. A private member is meant to
            be an internal detail of one class, so allowing another class to
            stand in for it would defeat the point. This is the one place where
            classes are compared by identity rather than by shape.
          </>
        }
        zh={
          <>
            为什么?对 private 和 protected 成员,TypeScript 比较的是
            <b>它们在哪里声明</b>,而不是名字和类型。两处声明就是两个不同的成员。
            private 的用意是「这是某一个类的内部细节」,如果别的类能顶替,
            这个用意就落空了。这是 class 唯一一处按「出身」而不是按形状比较的地方。
          </>
        }
      />
    ),
  },
  {
    base: true,
    withPrivate: false,
    inherit: true,
    ok: true,
    assign: {
      en: "const cup: PaperCup = new PlasticCup();  // ✓ same declaration",
      zh: "const cup: PaperCup = new PlasticCup();  // ✓ 同源,兼容恢复",
    },
    msg: (
      <T
        en={
          <>
            The fix follows from the rule. Let both classes{" "}
            <b>extend the same base class</b>. Now there is only one declaration
            of <code>private stock</code>, inherited by both, so the two types
            are compatible again.
          </>
        }
        zh={
          <>
            解法顺着规则就出来了:让两个类 <b>extends 同一个基类</b>。
            这时 <code>private stock</code> 只有一处声明,两边都继承自它,
            于是重新兼容。
          </>
        }
      />
    ),
  },
];

function CupCard({ name, f }: { name: string; f: CupFrame }) {
  return (
    <div className="cl-cup">
      <b>
        class {name}
        {f.inherit ? " extends Cup" : ""}
      </b>
      <span>size: Size</span>
      <span>fill(ml: number): void</span>
      {f.withPrivate && <span className="pri">private stock = 0</span>}
    </div>
  );
}

export function StructuralClassFlow() {
  const L = useL();
  const stepper = useStepper(CUP_FRAMES.length, 2600);
  const f = CUP_FRAMES[stepper.step];

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="Two classes with the same shape, and what private changes"
          zh="两个同形状的类,加上 private 之后"
        />
      </div>
      <div className="viz-stage">
        <div className="viz-scroll">
          <div className="cl-struct">
            {f.base && (
              <div className="cl-cup base">
                <b>class Cup</b>
                <span className="pri">private stock = 0</span>
                <span>size: Size · fill(ml: number): void</span>
              </div>
            )}
            <div className="cl-struct-row">
              <CupCard name="PaperCup" f={f} />
              <div className={`cl-verdict ${f.ok ? "ok" : "bad"}`}>
                {f.ok ? (
                  <T en="✓ Compatible" zh="✓ 兼容" />
                ) : (
                  <T en="✕ Not compatible" zh="✕ 不兼容" />
                )}
              </div>
              <CupCard name="PlasticCup" f={f} />
            </div>
            <code className="cl-assign">{L(f.assign)}</code>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls
        stepper={stepper}
        step={stepper.step}
        total={CUP_FRAMES.length}
      />
    </div>
  );
}
