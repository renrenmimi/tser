"use client";

// 09 · Modules and declaration files 专属可视化(双语):
//  - ManualHero:hero 里的三种「有没有类型」的库(纯 CSS 进场)。
//  - LibShelf:TypeScript 自带的几本 lib 声明文件,点一本看它管什么。
//  - ErasedImports:import 擦除观察台 —— 编译前 / 编译后 seg 切换。
//    三行的编译结果已用 tsc 5.9.3 实测:值导入原样保留,纯类型导入整行删除,
//    混合导入只留下值。
//  - TypeQuest:编译器查找类型声明的三站逐帧动画(6 帧)。

import { Fragment, useState, type ReactNode } from "react";
import { FlowStepper, type FlowFrame } from "@/lib/stepper";
import { T, useL, type Loc } from "@/lib/i18n";

/* ================= ManualHero ================= */

const GOODS: {
  ico: string;
  tag: Loc<string>;
  name: Loc<string>;
  sub: Loc<string>;
}[] = [
  {
    ico: "📦",
    tag: { en: "📖 Types included", zh: "📖 自带类型" },
    name: { en: "Written in TypeScript", zh: "TS 写的库" },
    sub: {
      en: "Generates its own .d.ts at build time",
      zh: "编译时顺手生成 .d.ts,装完即有",
    },
  },
  {
    ico: "📦",
    tag: { en: "📖 Types sold separately", zh: "📖 类型另装" },
    name: { en: "Established JS library", zh: "老牌 JS 库" },
    sub: {
      en: "Community declarations: npm i -D @types/xxx",
      zh: "社区补写声明:npm i -D @types/xxx",
    },
  },
  {
    ico: "📦",
    tag: { en: "❓ No types anywhere", zh: "❓ 到处都没有类型" },
    name: { en: "Little-used JS library", zh: "冷门 JS 库" },
    sub: {
      en: "You write declare module yourself",
      zh: "自己写 declare module 补上",
    },
  },
];

export function ManualHero() {
  const L = useL();
  return (
    <div className="md-shelf" aria-hidden>
      {GOODS.map((g, i) => (
        <div
          key={L(g.name)}
          className="md-good"
          style={{ animationDelay: `${180 + i * 170}ms` }}
        >
          <span className="md-good-tag">{L(g.tag)}</span>
          <span className="ico">{g.ico}</span>
          <b>{L(g.name)}</b>
          <small>{L(g.sub)}</small>
        </div>
      ))}
    </div>
  );
}

/* ================= LibShelf ================= */

const LIB_BOOKS: {
  ico: string;
  name: string;
  who: string;
  sub: Loc<string>;
  on: Loc<string>;
}[] = [
  {
    ico: "🌐",
    name: "lib.dom.d.ts",
    who: "document · fetch · window",
    sub: {
      en: "everything the browser provides.",
      zh: "浏览器提供的那一整套 API。",
    },
    on: { en: "In the default lib set", zh: "默认 lib 里就有" },
  },
  {
    ico: "📗",
    name: "lib.es2022.d.ts",
    who: "Array · Promise · Object",
    sub: {
      en: "the JavaScript language itself, up to ES2022.",
      zh: "JavaScript 语言本身,到 ES2022 为止。",
    },
    on: {
      en: "In the default set when target is ES2022 or later",
      zh: "target 为 ES2022 或更高时默认就有",
    },
  },
  {
    ico: "📕",
    name: "lib.esnext.d.ts",
    who: "Iterator.prototype.map · Float16Array",
    sub: {
      en: "APIs still going through the standards process. Add esnext to lib to use them.",
      zh: "还在标准流程里的提案 API。要用就得在 lib 里加上 esnext。",
    },
    on: { en: "Not in the default set", zh: "默认不在里面" },
  },
];

export function LibShelf() {
  const L = useL();
  const [picked, setPicked] = useState(0);
  const b = LIB_BOOKS[picked];
  const isDefault = picked !== 2;
  return (
    <div className="viz md-lib">
      <div className="viz-title">
        <T
          en="The declaration files TypeScript ships with · pick one to see what it covers"
          zh="TypeScript 自带的几本声明文件 · 点一本看它管什么"
        />
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
        <span className="chip" data-tone={isDefault ? "ok" : "info"}>
          {isDefault ? "☑ " : "◻ "}
          {L(b.on)}
        </span>
        <p>
          <b>
            <T en="Covers: " zh="管辖范围:" />
          </b>
          <code>{b.who}</code> — {L(b.sub)}
        </p>
      </div>
      <div className="viz-msg">
        <T
          en={
            <>
              If you do not set <b>lib</b>, TypeScript picks a default set from{" "}
              <b>target</b>, and that default includes the DOM. Writing{" "}
              <code>lib</code> yourself <b>replaces</b> the default rather than
              adding to it. A Node-only project that sets{" "}
              <code>&quot;lib&quot;: [&quot;es2022&quot;]</code> therefore has no
              DOM, and <code>document</code> is reported as{" "}
              <code>ts(2584)</code>.
            </>
          }
          zh={
            <>
              不写 <b>lib</b> 时,TypeScript 会按 <b>target</b>{" "}
              选一套默认的声明文件,而这套默认里包含 DOM。
              自己写 <code>lib</code> 是<b>替换</b>默认值,不是往上追加。
              所以一个只跑 Node 的项目写了{" "}
              <code>&quot;lib&quot;: [&quot;es2022&quot;]</code> 之后就没有 DOM,
              这时用 <code>document</code> 会报 <code>ts(2584)</code>。
            </>
          }
        />
      </div>
    </div>
  );
}

/* ================= ErasedImports ================= */

interface ImportLine {
  before: string;
  /** null = the whole line is removed */
  after: string | null;
  note: Loc<string>;
}

const IMPORT_LINES: ImportLine[] = [
  {
    before: 'import { fetchMenu } from "./api";',
    after: 'import { fetchMenu } from "./api";',
    note: {
      en: "A value — the code calls it, so the line stays as written",
      zh: "值 —— 运行时要调用它,这一行原样保留",
    },
  },
  {
    before: 'import type { MenuItem } from "./menu";',
    after: null,
    note: {
      en: "Types only — the whole line is removed",
      zh: "只有类型 —— 整行被删掉",
    },
  },
  {
    before: 'import { TAX, type Order } from "./order";',
    after: 'import { TAX } from "./order";',
    note: {
      en: "Mixed — Order is taken out, TAX stays",
      zh: "混合 —— Order 被摘掉,TAX 留下",
    },
  },
];

export function ErasedImports() {
  const L = useL();
  const [after, setAfter] = useState(false);
  return (
    <div className="viz md-erase">
      <div className="viz-title">
        <T
          en="What the compiler does to each import"
          zh="编译器对每一行 import 做了什么"
        />
        <span className="seg">
          <button
            type="button"
            className={`seg-btn${!after ? " on" : ""}`}
            onClick={() => setAfter(false)}
          >
            <T en="Source .ts" zh="编译前 .ts" />
          </button>
          <button
            type="button"
            className={`seg-btn${after ? " on" : ""}`}
            onClick={() => setAfter(true)}
          >
            <T en="Output .js" zh="编译后 .js" />
          </button>
        </span>
      </div>
      <div className="md-erase-list">
        {IMPORT_LINES.map((l) => {
          const gone = after && l.after === null;
          const text = after ? l.after ?? l.before : l.before;
          return (
            <div
              key={l.before}
              className={`md-erase-row${gone ? " gone" : ""}`}
            >
              <code>{gone ? l.before : text}</code>
              <span className="md-erase-note">
                {gone ? (
                  <T en="💨 removed" zh="💨 已删除" />
                ) : (
                  L(l.note)
                )}
              </span>
            </div>
          );
        })}
      </div>
      <div className="viz-msg">
        {after ? (
          <T
            en={
              <>
                Types are erased, so a type-only import has nothing left to
                import and the line goes. A value import is kept exactly as
                written. Marking the type-only names with <b>type</b> is what
                makes this result the same in every build tool.
              </>
            }
            zh={
              <>
                类型会被擦除,所以纯类型导入没有东西可导入,整行就消失了;
                值导入则被原样保留。把只当类型用的名字标上 <b>type</b>,
                这个结果在任何构建工具下都一样。
              </>
            }
          />
        ) : (
          <T
            en={
              <>
                Three imports, two kinds of thing: values, which the code needs
                while it runs, and types, which exist only during compilation.
                Switch to <b>Output .js</b> to see what happens to each one.
              </>
            }
            zh={
              <>
                三行导入,两种东西:值 —— 代码运行时要用到;
                类型 —— 只存在于编译期。切到 <b>编译后 .js</b>{" "}
                看它们各自的结果。
              </>
            }
          />
        )}
      </div>
    </div>
  );
}

/* ================= TypeQuest ================= */

interface QuestFrameDef {
  lit: number[];
  packetAt?: 0 | 1 | 2;
  packet?: Loc<string>;
  back?: boolean;
  /** node that shows the "declaration found" badge */
  found?: number;
  /** show the "nothing found" badge */
  deny?: boolean;
  msg: ReactNode;
}

const QUEST_NODES: {
  id: string;
  ico: string;
  label: Loc<string>;
  sub: Loc<string>;
}[] = [
  {
    id: "tsc",
    ico: "🧭",
    label: "tsc",
    sub: { en: "needs a type for debounce", zh: "需要 debounce 的类型" },
  },
  {
    id: "pkg",
    ico: "📦",
    label: "node_modules/lodash",
    sub: { en: "1 · types in the package?", zh: "第一站 · 包里自带?" },
  },
  {
    id: "types",
    ico: "📚",
    label: "node_modules/@types",
    sub: { en: "2 · community types?", zh: "第二站 · 社区补写的?" },
  },
  {
    id: "own",
    ico: "🗂️",
    label: { en: "your project", zh: "你的项目" },
    sub: { en: "3 · your own declaration", zh: "第三站 · 你自己写的声明" },
  },
];

const QUEST_FRAMES: QuestFrameDef[] = [
  {
    lit: [0],
    msg: (
      <T
        en={
          <>
            You write <code>import {"{ debounce }"} from &quot;lodash&quot;</code>
            . The compiler now needs to know the type of{" "}
            <code>debounce</code>, so it starts looking for a declaration. It
            checks three places, in order, and stops at the first one that
            answers.
          </>
        }
        zh={
          <>
            你写下 <code>import {"{ debounce }"} from &quot;lodash&quot;</code>
            。编译器现在需要知道 <code>debounce</code> 的类型,
            于是开始找它的声明。它会按顺序看三个地方,哪一个有结果就停。
          </>
        }
      />
    ),
  },
  {
    lit: [0, 1],
    packetAt: 0,
    packet: { en: 'read package.json "types"…', zh: '读 package.json 的 "types"…' },
    msg: (
      <T
        en={
          <>
            <b>Stop 1: inside the package.</b> The compiler reads lodash&apos;s{" "}
            <code>package.json</code> and looks for a <code>types</code> field,
            or a <code>types</code> condition inside <code>exports</code>. There
            is none. lodash is written in plain JavaScript and ships no
            declarations of its own.
          </>
        }
        zh={
          <>
            <b>第一站:包里面。</b>编译器读 lodash 的{" "}
            <code>package.json</code>,找 <code>types</code> 字段,
            或者 <code>exports</code> 里的 <code>types</code> 条件 —— 没有。
            lodash 是纯 JavaScript 写的,自己不带声明。
          </>
        }
      />
    ),
  },
  {
    lit: [0, 2],
    packetAt: 1,
    packet: { en: "node_modules/@types/lodash?", zh: "node_modules/@types/lodash?" },
    found: 2,
    msg: (
      <T
        en={
          <>
            <b>Stop 2: the @types folder.</b> If you have run{" "}
            <code>npm i -D @types/lodash</code>, the compiler finds the
            community-written <code>index.d.ts</code> here. Parameter types and
            return types for <code>debounce</code> are all there, and the search
            ends.
          </>
        }
        zh={
          <>
            <b>第二站:@types 目录。</b>只要你跑过{" "}
            <code>npm i -D @types/lodash</code>,编译器就在这里找到社区写的{" "}
            <code>index.d.ts</code>。<code>debounce</code>{" "}
            的参数类型和返回类型都在里面,查找到此结束。
          </>
        }
      />
    ),
  },
  {
    lit: [0, 3],
    packetAt: 2,
    packet: { en: 'declare module "lodash"?', zh: 'declare module "lodash"?' },
    msg: (
      <T
        en={
          <>
            <b>If stop 2 is also empty</b> — common for a little-used library —
            there is one place left: a declaration file in your own project. You
            write <code>declare module &quot;lodash&quot;</code> and describe the
            parts you actually use.
          </>
        }
        zh={
          <>
            <b>假如第二站也是空的</b>(冷门库很常见),还剩最后一个地方:
            你项目里自己的声明文件。写一段{" "}
            <code>declare module &quot;lodash&quot;</code>,
            把你真正用到的部分描出来。
          </>
        }
      />
    ),
  },
  {
    lit: [0],
    deny: true,
    msg: (
      <T
        en={
          <>
            <b>All three empty.</b> Then <code>debounce</code> would be an
            implicit <code>any</code>, and with <code>noImplicitAny</code> on
            (part of <code>strict</code>) that is reported as <b>ts(7016)</b>.
            The message names both remaining options itself: &quot;Try{" "}
            <code>npm i --save-dev @types/lodash</code> if it exists or add a
            new declaration (.d.ts) file containing{" "}
            <code>declare module &apos;lodash&apos;;</code>&quot;
          </>
        }
        zh={
          <>
            <b>三个地方全是空的。</b>那 <code>debounce</code> 就是隐式{" "}
            <code>any</code>;打开 <code>noImplicitAny</code>
            (<code>strict</code> 的一部分)时会报 <b>ts(7016)</b>。
            报错原文自己就写出了剩下两条路:&quot;Try{" "}
            <code>npm i --save-dev @types/lodash</code> if it exists or add a
            new declaration (.d.ts) file containing{" "}
            <code>declare module &apos;lodash&apos;;</code>&quot;
          </>
        }
      />
    ),
  },
  {
    lit: [0, 1, 2, 3],
    msg: (
      <T
        en={
          <>
            The order again: <b>1 the package&apos;s own types → 2 @types → 3 a
            declaration you write</b>. The first one that answers wins. When you
            are choosing a library, check it in this order and you will know
            before you install what its type support costs you.
          </>
        }
        zh={
          <>
            再看一遍顺序:<b>① 包自带的类型 → ② @types → ③ 你自己写的声明</b>
            ,第一个有结果的胜出。给项目挑库时按这个顺序查一遍,
            装之前就知道它的类型支持要付多少代价。
          </>
        }
      />
    ),
  },
];

function QuestStage({ f }: { f: QuestFrameDef }) {
  const L = useL();
  return (
    <div className="flow md-quest">
      {QUEST_NODES.map((n, i) => (
        <Fragment key={n.id}>
          {i > 0 && (
            <div className="flow-mid md-quest-mid">
              <div className="flow-line" />
              {f.packetAt === i - 1 && f.packet && (
                <span className={`flow-packet${f.back ? " back" : ""}`}>
                  {L(f.packet)}
                </span>
              )}
            </div>
          )}
          <div className={`flow-node${f.lit.includes(i) ? " lit" : ""}`}>
            <span className="ico">{n.ico}</span>
            {L(n.label)}
            <small className="md-node-sub">{L(n.sub)}</small>
            {f.found === i && (
              <small className="md-found">
                ☑ <T en="found index.d.ts" zh="找到 index.d.ts" />
              </small>
            )}
            {f.deny && i === 0 && (
              <small className="md-deny">
                ⛔ <T en="implicit any" zh="隐式 any" /> · ts(7016)
              </small>
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
      title={{
        en: "How the compiler finds a type declaration: three places, in order",
        zh: "编译器怎么找到类型声明:三个地方,按顺序",
      }}
      frames={frames}
    />
  );
}
