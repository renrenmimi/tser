"use client";

// 08 · 类与接口 专属可视化:
//  - GateHero:hero 里的「门禁三级」楼层图(纯 CSS 进场)。
//  - AccessGate:访问门禁演示器 —— 成员 × 访问位置,亮灯 + 真实报错文案。
//  - ErasureViz:TS private vs JS #field 编译产物对照(seg 切换 + 运行时试探)。
//  - ContractBoard:PaymentProvider 契约与两个兑现者(静态)。
//  - StructuralClassFlow:同形状类兼容 → 加 private 变「准名义」逐帧。

import { useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";

/* ================= GateHero ================= */

const FLOORS = [
  { ico: "🏦", name: "保险库 · private", sub: "只有本人(类内部)能开" },
  { ico: "🛗", name: "办公区 · protected", sub: "持工牌(子类)可进" },
  { ico: "🏠", name: "大堂 · public", sub: "谁都能进 —— 不写修饰符,默认就是它" },
];

export function GateHero() {
  return (
    <div className="cl-tower" aria-hidden>
      {FLOORS.map((f, i) => (
        <div
          key={f.name}
          className="cl-floor"
          style={{ animationDelay: `${180 + i * 170}ms` }}
        >
          <span className="ico">{f.ico}</span>
          <b>{f.name}</b>
          <small>{f.sub}</small>
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
  floor: string;
  decl: string;
}

const GATE_MEMBERS: GateMember[] = [
  { key: "name", mod: "public", ico: "🏠", floor: "大堂", decl: 'name = "杭州店"' },
  {
    key: "recipe",
    mod: "protected",
    ico: "🛗",
    floor: "办公区",
    decl: 'protected recipe = "茶底先放"',
  },
  {
    key: "vaultCode",
    mod: "private",
    ico: "🏦",
    floor: "保险库",
    decl: 'private vaultCode = "8848"',
  },
];

const GATE_PLACES = [
  { label: "类内部", sub: "MilkTeaShop 自己的方法里" },
  { label: "子类", sub: "FranchiseShop extends MilkTeaShop" },
  { label: "外部", sub: "new 出来的实例上直接点" },
];

const GATE_OK_MSG: string[][] = [
  [
    "public 成员,类内部当然畅通 —— 自己家的大堂。",
    "public 成员,子类照样畅通 —— 大堂对分店也开放。",
    "public 成员,外部随便点 —— 大堂谁都能进,这也是不写修饰符时的默认等级。",
  ],
  [
    "protected 成员,类内部可用 —— 本人进自家办公区,天经地义。",
    "protected 成员,子类可用 —— extends 就是那张工牌,分店能看总部配方。",
    "",
  ],
  [
    "private 成员,类内部可用 —— 保险库只对本人开放,这里正是本人。",
    "",
    "",
  ],
];

function gateAllowed(m: number, p: number): boolean {
  if (m === 0) return true;
  if (m === 1) return p < 2;
  return p === 0;
}

function gateError(m: number): { note: string; err: string } {
  if (m === 1)
    return {
      note: "办公区要工牌 —— 外部的散客没有,红灯。",
      err: "Property 'recipe' is protected and only accessible within class 'MilkTeaShop' and its subclasses. ts(2445)",
    };
  return {
    note: "保险库只有本人能开 —— 连持工牌的分店都不行,红灯。",
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
  const [member, setMember] = useState(2);
  const [place, setPlace] = useState(2);
  const m = GATE_MEMBERS[member];
  const allowed = gateAllowed(member, place);
  const deny = allowed ? null : gateError(member);
  const lines = gateLines(m, place);

  return (
    <div className="viz cl-gate">
      <div className="viz-title">访问门禁演示器 · 选一个成员,再选从哪儿访问</div>
      <div className="cl-gate-row">
        <span className="cl-gate-lab">成员</span>
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
        <span className="cl-gate-lab">位置</span>
        <div className="seg">
          {GATE_PLACES.map((gp, i) => (
            <button
              key={gp.label}
              type="button"
              className={`seg-btn${place === i ? " on" : ""}`}
              onClick={() => setPlace(i)}
            >
              {gp.label}
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
            <b>{allowed ? "绿灯放行" : "红灯拦下"}</b>
            <p>
              {allowed
                ? GATE_OK_MSG[member][place]
                : deny?.note}
            </p>
            <p className="cl-gate-sub">
              {m.ico} {m.floor}成员 × 访问自「{GATE_PLACES[place].label}」
              ({GATE_PLACES[place].sub})
            </p>
            {deny && <code className="cl-err">{deny.err}</code>}
          </div>
        </div>
      </div>
      <div className="viz-msg">
        九种组合都点一遍,门禁表就长在手上了:<b>public 三处全绿,protected
        两绿一红,private 一绿两红</b> —— 红灯时的报错原文也值得读熟,
        真实项目里天天见。
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
  result: string;
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
    probe: '(shop as any).vaultCode',
    result: '"8848" —— 拿到了',
    sealed: false,
    note: (
      <>
        <b>private 三个字被整个擦掉</b>,产物里就是个普通属性。门禁只存在于
        编译期 —— 运行时,保险库的门是敞开的,<code>as any</code>、
        <code>JSON.stringify</code>、DevTools 全都看得见。
      </>
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
    probe: '(shop as any)["#vaultCode"]',
    result: "undefined —— 真拿不到",
    sealed: true,
    note: (
      <>
        <b>#field 是 JavaScript 自己的私有语法</b>,编译后原样保留(现代
        target 下)。运行时也是铁门:类外任何写法都摸不到它,
        这才是「真隐藏」。
      </>
    ),
  },
];

export function ErasureViz() {
  const [tab, setTab] = useState(0);
  const t = ERASE_TABS[tab];
  return (
    <div className="viz cl-erase">
      <div className="viz-title">
        编译产物对照台
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
          <div className="hd">你写的 .ts</div>
          <pre>{t.src}</pre>
        </div>
        <span className="cl-erase-arrow" aria-hidden>
          tsc →
        </span>
        <div className="cl-erase-panel">
          <div className="hd">编译后的 .js</div>
          <pre>{t.out}</pre>
        </div>
      </div>
      <div className={`cl-probe ${t.sealed ? "ok" : "bad"}`}>
        <span className="cl-probe-lab">运行时试探</span>
        <code>{t.probe}</code>
        <span className="cl-probe-res">
          {t.sealed ? "🔒" : "🔓"} {t.result}
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
        <div className="cl-pact-head">📜 interface PaymentProvider —— 契约</div>
        <ul>
          <li>
            <code>pay(amount: number): Promise&lt;string&gt;</code>
          </li>
          <li>
            <code>refund(txId: string): Promise&lt;void&gt;</code>
          </li>
        </ul>
        <small>只写「要有什么」,一行实现都没有</small>
      </div>
      <div className="cl-arrow" aria-hidden>
        implements —— 兑现契约
        <span>▼</span>
      </div>
      <div className="cl-fuls">
        <div className="cl-ful">
          <b>💚 WeChatPay</b>
          <span className="tick ok">✓ pay ✓ refund</span>
          <small>调微信 SDK 干活,形状齐全,通过</small>
        </div>
        <div className="cl-ful">
          <b>💙 AliPay</b>
          <span className="tick ok">✓ pay ✓ refund</span>
          <small>换一套 SDK,同一份契约,照样通过</small>
        </div>
        <div className="cl-ful bad">
          <b>🩶 CashPay</b>
          <span className="tick no">✓ pay ✕ 缺 refund</span>
          <small>
            Class &apos;CashPay&apos; incorrectly implements interface
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
  assign: string;
  msg: ReactNode;
}

const CUP_FRAMES: CupFrame[] = [
  {
    withPrivate: false,
    ok: true,
    assign: "const cup: PaperCup = new PlasticCup();  // ✅",
    msg: (
      <>
        第 04 章的规矩在 class 上照常生效:<b>编译器只看形状</b>。
        两个类的成员一模一样,互相兼容 —— 名字叫纸杯还是塑料杯,它不关心。
      </>
    ),
  },
  {
    withPrivate: true,
    ok: false,
    assign: "const cup: PaperCup = new PlasticCup();  // ❌ ts(2322)",
    msg: (
      <>
        各自加了一个 <code>private stock</code> —— 哪怕连名字都一样,
        兼容当场破裂:<b>Types have separate declarations of a private
        property &apos;stock&apos;.</b> 私有成员一登场,规则就变了。
      </>
    ),
  },
  {
    withPrivate: true,
    ok: false,
    assign: "const cup: PaperCup = new PlasticCup();  // ❌ 为什么?",
    msg: (
      <>
        为什么?private 的含义是「这是我的实现细节,外人别碰」。
        如果同形状还能互换,别人就能拿 PlasticCup 冒充 PaperCup
        去动它的私产。所以编译器规定:<b>private 成员必须来自同一处声明</b>
        —— 类从「看形状」变成了「认出身」,这叫<b>准名义(nominal-ish)</b>。
      </>
    ),
  },
  {
    base: true,
    withPrivate: false,
    inherit: true,
    ok: true,
    assign: "const cup: PaperCup = new PlasticCup();  // ✅ 同源,恢复兼容",
    msg: (
      <>
        出路也顺理成章:让两个类 <b>extends 同一个基类</b>,
        <code>private stock</code> 来自同一处声明(同源),兼容恢复 ——
        这也是「private 认出身」这条规则最自然的用法。
      </>
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
  const stepper = useStepper(CUP_FRAMES.length, 2600);
  const f = CUP_FRAMES[stepper.step];

  return (
    <div className="viz">
      <div className="viz-title">同形状的两个类,private 一来就翻脸(逐帧)</div>
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
                {f.ok ? "✓ 兼容" : "✕ 不兼容"}
              </div>
              <CupCard name="PlasticCup" f={f} />
            </div>
            <code className="cl-assign">{f.assign}</code>
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
