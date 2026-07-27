"use client";

// 09 · 模块与声明文件 专属可视化:
//  - ManualHero:hero 里的「商品与说明书」货架(纯 CSS 进场)。
//  - ErasedImports:import 蒸发观察台 —— 编译前 / 编译后 seg 切换。
//  - TypeQuest:编译器寻类型之旅逐帧动画(6 帧,三站寻书)。

import { Fragment, useState, type ReactNode } from "react";
import { FlowStepper, type FlowFrame } from "@/lib/stepper";

/* ================= ManualHero ================= */

const GOODS = [
  {
    ico: "📦",
    tag: "📖 随箱附带",
    name: "TS 写的库",
    sub: "编译时顺手生成 .d.ts,开箱即用",
  },
  {
    ico: "📦",
    tag: "📖 说明书另购",
    name: "JS 老牌库",
    sub: "社区补写:npm i -D @types/xxx",
  },
  {
    ico: "📦",
    tag: "❓ 三无产品",
    name: "冷门 JS 库",
    sub: "自己写 declare module 救场",
  },
];

export function ManualHero() {
  return (
    <div className="md-shelf" aria-hidden>
      {GOODS.map((g, i) => (
        <div
          key={g.name}
          className="md-good"
          style={{ animationDelay: `${180 + i * 170}ms` }}
        >
          <span className="md-good-tag">{g.tag}</span>
          <span className="ico">{g.ico}</span>
          <b>{g.name}</b>
          <small>{g.sub}</small>
        </div>
      ))}
    </div>
  );
}

/* ================= LibShelf ================= */

const LIB_BOOKS = [
  {
    ico: "🌐",
    name: "lib.dom.d.ts",
    who: "document · fetch · window",
    sub: "浏览器世界的说明书",
    on: true,
  },
  {
    ico: "📗",
    name: "lib.es2022.d.ts",
    who: "Array · Promise · Object",
    sub: "JS 语言本身的说明书",
    on: true,
  },
  {
    ico: "📕",
    name: "lib.esnext.d.ts",
    who: "最新提案的 API",
    sub: "追新才需要装的那本",
    on: false,
  },
];

export function LibShelf() {
  const [picked, setPicked] = useState(0);
  const b = LIB_BOOKS[picked];
  return (
    <div className="viz md-lib">
      <div className="viz-title">
        TS 自带的一摞说明书 · 点一本看看它管谁
      </div>
      <div className="md-lib-row">
        {LIB_BOOKS.map((bk, i) => (
          <button
            key={bk.name}
            type="button"
            className={`md-book${picked === i ? " on" : ""}`}
            onClick={() => setPicked(i)}
          >
            <span className="ico">{bk.ico}</span>
            <b>{bk.name}</b>
          </button>
        ))}
      </div>
      <div className="md-lib-info" aria-live="polite">
        <span className="chip" data-tone={b.on ? "ok" : "info"}>
          {b.on ? "☑ 常见 lib 配置里默认在架" : "◻ 需要在 lib 里手动加"}
        </span>
        <p>
          <b>管辖范围:</b>
          <code>{b.who}</code> —— {b.sub}。
        </p>
      </div>
      <div className="viz-msg">
        tsconfig 的 <b>lib</b> 选项就是「装哪几本上架」:写浏览器代码带上
        dom,纯 Node 项目就不带 —— 这也是为什么 Node 项目里写{" "}
        <code>document</code> 会直接报「找不到」。
      </div>
    </div>
  );
}

/* ================= ErasedImports ================= */

interface ImportLine {
  before: string;
  after: string | null; // null = 整句蒸发
  note: string;
}

const IMPORT_LINES: ImportLine[] = [
  {
    before: 'import { fetchMenu } from "./api";',
    after: 'import { fetchMenu } from "./api";',
    note: "值 —— 运行时要调用,原样留下",
  },
  {
    before: 'import type { MenuItem } from "./menu";',
    after: null,
    note: "纯类型 —— 编译后整句蒸发",
  },
  {
    before: 'import { TAX, type Order } from "./order";',
    after: 'import { TAX } from "./order";',
    note: "混装 —— Order 被抠掉,TAX 留下",
  },
];

export function ErasedImports() {
  const [after, setAfter] = useState(false);
  return (
    <div className="viz md-erase">
      <div className="viz-title">
        import 蒸发观察台
        <span className="seg">
          <button
            type="button"
            className={`seg-btn${!after ? " on" : ""}`}
            onClick={() => setAfter(false)}
          >
            编译前 .ts
          </button>
          <button
            type="button"
            className={`seg-btn${after ? " on" : ""}`}
            onClick={() => setAfter(true)}
          >
            编译后 .js
          </button>
        </span>
      </div>
      <div className="md-erase-list">
        {IMPORT_LINES.map((l) => {
          const gone = after && l.after === null;
          const text = after ? l.after ?? l.before : l.before;
          return (
            <div key={l.before} className={`md-erase-row${gone ? " gone" : ""}`}>
              <code>{gone ? l.before : text}</code>
              <span className="md-erase-note">
                {after && l.after === null ? "💨 整句删除" : l.note}
              </span>
            </div>
          );
        })}
      </div>
      <div className="viz-msg">
        {after ? (
          <>
            类型擦除之后:type 进口全部蒸发,值进口原样保留 ——
            <b>写了 type,谁来编译都不会猜错</b>。
          </>
        ) : (
          <>
            三句进口,两种货物:值(运行时要用)和类型(编译完就没了)。
            点「编译后 .js」看它们各自的下场。
          </>
        )}
      </div>
    </div>
  );
}

/* ================= TypeQuest ================= */

interface QuestFrameDef {
  lit: number[];
  packetAt?: 0 | 1 | 2;
  packet?: string;
  back?: boolean;
  /** 显示「找到说明书」徽章的节点 */
  found?: number;
  /** 显示「全落空」徽章 */
  deny?: boolean;
  msg: ReactNode;
}

const QUEST_NODES = [
  { ico: "🧭", label: "编译器", sub: "tsc · 出发找说明书" },
  { ico: "📦", label: "node_modules/lodash", sub: "第一站 · 随箱说明书?" },
  { ico: "📚", label: "node_modules/@types", sub: "第二站 · 说明书专柜" },
  { ico: "🗂️", label: "你的项目", sub: "第三站 · 手写 declare" },
];

const QUEST_FRAMES: QuestFrameDef[] = [
  {
    lit: [0],
    msg: (
      <>
        你写下 <code>import {"{ debounce }"} from &quot;lodash&quot;</code>。
        编译器立刻起身:debounce 是什么形状?它要为这件「进口商品」
        找一本说明书 —— 也就是类型声明。
      </>
    ),
  },
  {
    lit: [0, 1],
    packetAt: 0,
    packet: '查 package.json 的 "types" 字段…',
    msg: (
      <>
        <b>第一站:商品箱子里翻。</b>打开 lodash 的 package.json,找{" "}
        <code>types</code>(或 exports 里的 types 条件)字段 ——
        没有。lodash 是纯 JS 老牌商品,出厂不带说明书。
      </>
    ),
  },
  {
    lit: [0, 2],
    packetAt: 1,
    packet: "node_modules/@types/lodash 在吗?",
    found: 2,
    msg: (
      <>
        <b>第二站:说明书专柜 @types。</b>只要你{" "}
        <code>npm i -D @types/lodash</code> 装过,编译器就在这里找到
        社区补写的 index.d.ts —— debounce 的参数、返回值全齐,
        旅程到此圆满结束。
      </>
    ),
  },
  {
    lit: [0, 3],
    packetAt: 2,
    packet: 'declare module "lodash" 写了吗?',
    msg: (
      <>
        <b>平行宇宙:假如专柜也没货</b>(冷门库常见),还有最后一站 ——
        你项目里的声明文件。自己写一段{" "}
        <code>declare module &quot;lodash&quot;</code>
        ,亲手给商品配说明书。
      </>
    ),
  },
  {
    lit: [0],
    deny: true,
    msg: (
      <>
        <b>三站全落空:</b>lodash 只能算隐式 any,strict(noImplicitAny)
        下直接报错 <b>ts(7016)</b>。好消息是报错原文自带两条出路:
        「Try <code>npm i --save-dev @types/lodash</code> … or add a new
        declaration (.d.ts) file containing{" "}
        <code>declare module &apos;lodash&apos;;</code>」。
      </>
    ),
  },
  {
    lit: [0, 1, 2, 3],
    msg: (
      <>
        复盘寻书顺序:<b>① 自带(types 字段)→ ② @types 专柜 → ③ 手写
        declare module</b> —— 任何一站命中就停。给项目挑库时,
        照这个顺序检查它的类型供给,心里就有数了。
      </>
    ),
  },
];

function QuestStage({ f }: { f: QuestFrameDef }) {
  return (
    <div className="flow md-quest">
      {QUEST_NODES.map((n, i) => (
        <Fragment key={n.label}>
          {i > 0 && (
            <div className="flow-mid md-quest-mid">
              <div className="flow-line" />
              {f.packetAt === i - 1 && f.packet && (
                <span className={`flow-packet${f.back ? " back" : ""}`}>
                  {f.packet}
                </span>
              )}
            </div>
          )}
          <div className={`flow-node${f.lit.includes(i) ? " lit" : ""}`}>
            <span className="ico">{n.ico}</span>
            {n.label}
            <small className="md-node-sub">{n.sub}</small>
            {f.found === i && (
              <small className="md-found">☑ 找到 index.d.ts</small>
            )}
            {f.deny && i === 0 && (
              <small className="md-deny">⛔ 隐式 any · ts(7016)</small>
            )}
          </div>
        </Fragment>
      ))}
    </div>
  );
}

export function TypeQuest() {
  const frames: FlowFrame[] = QUEST_FRAMES.map((f) => ({
    stage: <QuestStage f={f} />,
    msg: f.msg,
  }));
  return (
    <FlowStepper
      title="编译器寻类型之旅:三站找一本说明书(逐帧)"
      frames={frames}
    />
  );
}
