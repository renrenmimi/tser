"use client";

// 序章专属可视化:
//  - HeroSquiggle:hero 里那扇「刚按下保存」的编辑器小窗 —— 红波浪线循环弹提示。
//  - TwoTimelines:两条时间线逐帧慢放 —— 同一个拼写错误,JS 线炸在半夜,TS 线炸在保存。
//  - ErasureViz:类型擦除三段式 —— .ts 源码 → 标记类型 → .js 产物。
//  - CourseMap:全书 12 章地图,按五个阵营分组(数据来自 lib/curriculum.ts)。

import { Fragment, useState, type ReactNode } from "react";
import Link from "next/link";
import { CHAPTERS, type Chapter } from "@/lib/curriculum";
import { useStepper, StepControls } from "@/lib/stepper";
import { T, useL, type Loc } from "@/lib/i18n";

/* ================= HeroSquiggle ================= */

export function HeroSquiggle() {
  const L = useL();
  return (
    <div className="hm-squig" aria-hidden>
      <div className="codewin-bar">
        <span className="codewin-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="codewin-name">
          {L({ en: "order.ts · just saved", zh: "order.ts · 刚按下 ⌘S" })}
        </span>
        <span style={{ width: 47 }} />
      </div>
      <div className="hm-squig-body">
        <div className="hm-squig-line">
          <span className="hm-squig-n">1</span>
          <span>
            <span className="tk-kw">const</span> bill = order.
            <span className="hm-squig-err">totle</span>
            <span className="tk-op"> * </span>
            <span className="tk-num">2</span>;
          </span>
        </div>
        <div className="hm-squig-tip">
          <b>
            Property &apos;totle&apos; does not exist on type &apos;Order&apos;.
          </b>{" "}
          Did you mean &apos;total&apos;?
          <span className="hm-squig-ecode">ts(2551)</span>
        </div>
      </div>
      <div className="hm-squig-foot">
        <T
          en="This one red line just prevented a bug that would have reached your users."
          zh="这条红线,替你挡下了一次凌晨三点的线上事故。"
        />
      </div>
    </div>
  );
}

/* ================= TwoTimelines ================= */

const JS_STATIONS: Loc<string>[] = [
  { en: "Write the code", zh: "写下代码" },
  { en: "Ship it", zh: "顺利上线" },
  { en: "A user hits it", zh: "用户触发" },
  { en: "Debug at 3 a.m.", zh: "凌晨排查" },
];
const TS_STATIONS: Loc<string>[] = [
  { en: "Write the code", zh: "写下代码" },
  { en: "Save · red line", zh: "保存 · 红线" },
  { en: "Fix it now", zh: "当场修好" },
  { en: "Ship it calmly", zh: "安心上线" },
];

interface LaneState {
  /** 当前点亮的站(之前的站标记为已走过) */
  at: number;
  /** 当前站头顶的气泡 */
  tag?: Loc<string>;
  /** 当前站是否炸了(红色脉冲) */
  boom?: boolean;
}

interface TLFrame {
  js: LaneState;
  ts: LaneState;
  msg: ReactNode;
}

function Lane({
  name,
  tone,
  stations,
  st,
}: {
  name: string;
  tone: "js" | "ts";
  stations: Loc<string>[];
  st: LaneState;
}) {
  const L = useL();
  return (
    <div className="hm-lane" data-tone={tone}>
      <span className="hm-lane-name">{name}</span>
      <div className="hm-lane-track">
        {stations.map((label, i) => (
          <Fragment key={i}>
            <div
              className={`hm-tl-node${i === st.at ? " on" : ""}${
                i < st.at ? " done" : ""
              }${st.boom && i === st.at ? " boom" : ""}`}
            >
              {st.tag && i === st.at && (
                <span className="hm-tl-tag">{L(st.tag)}</span>
              )}
              {L(label)}
            </div>
            {i < stations.length - 1 && <div className="hm-tl-line" />}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

const TL_FRAMES: TLFrame[] = [
  {
    js: { at: 0, tag: "order.totle ✍️" },
    ts: { at: 0, tag: "order.totle ✍️" },
    msg: (
      <T
        en={
          <>
            Two developers, same day, make <b>the same typo</b> in the ordering
            app for a tea shop: they write totle instead of total. The top lane
            uses JavaScript, the bottom lane uses TypeScript.
          </>
        }
        zh={
          <>
            两位工程师,同一天,给奶茶店小程序写下<b>同一个拼写错误</b>:把 total
            写成了 totle。上面走 JavaScript,下面走 TypeScript —— 命运即将分岔。
          </>
        }
      />
    ),
  },
  {
    js: { at: 0, tag: { en: "Silence...", zh: "一片安静……" } },
    ts: { at: 1, tag: { en: "Red line!", zh: "红线!" }, boom: true },
    msg: (
      <T
        en={
          <>
            On the TypeScript side, the editor draws a red line{" "}
            <b>the moment the file is saved</b>:{" "}
            <code>
              Property &apos;totle&apos; does not exist. Did you mean
              &apos;total&apos;?
            </code>{" "}
            On the JavaScript side, nothing happens. Reading a missing property
            just gives undefined.
          </>
        }
        zh={
          <>
            TS 这边,按下保存的<b>那一瞬间</b>,编辑器画出红线:
            <code>
              Property &apos;totle&apos; does not exist. Did you mean
              &apos;total&apos;?
            </code>
            ——「没有 totle,你是不是想写 total?」JS 那边?一点动静都没有,
            undefined 从不吭声。
          </>
        }
      />
    ),
  },
  {
    js: { at: 1, tag: { en: "Tests pass ✅", zh: "测试全绿 ✅" } },
    ts: { at: 2, tag: "totle → total" },
    msg: (
      <T
        en={
          <>
            The TypeScript developer changes five letters, the red line
            disappears, and the whole thing takes 30 seconds. The JavaScript
            developer knows nothing: the tests never run that line, so the code
            ships <b>with the bug inside</b>.
          </>
        }
        zh={
          <>
            TS 工程师改了 5 个字母,红线消失,前后 30 秒。JS 工程师什么都不知道 ——
            测试恰好没走到这行,代码<b>带着 bug</b> 顺利上线。
          </>
        }
      />
    ),
  },
  {
    js: { at: 1, tag: { en: "Three quiet days", zh: "三天风平浪静" } },
    ts: { at: 3, tag: "😌" },
    msg: (
      <T
        en={
          <>
            A bug does not go off right away. It sits in a code path nobody has
            walked yet, <b>waiting for the user who will trigger it</b>. Three
            quiet days only mean the turn has not come.
          </>
        }
        zh={
          <>
            bug 不会立刻炸。它蹲在没人走过的代码路径里,<b>等一个触发它的用户</b>
            。这三天的「没出事」,只是还没轮到而已。
          </>
        }
      />
    ),
  },
  {
    js: {
      at: 2,
      tag: { en: "Total: $NaN", zh: "合计:¥NaN" },
      boom: true,
    },
    ts: { at: 3 },
    msg: (
      <T
        en={
          <>
            At 1:47 a.m. a customer uses the two-cup discount.{" "}
            <code>order.totle</code> is undefined, <code>undefined * 2</code> is{" "}
            <b>NaN</b>, and the page shows &quot;Total: $NaN&quot;. The customer
            takes a screenshot.
          </>
        }
        zh={
          <>
            深夜 1:47,一位用户点了「双杯优惠」:<code>order.totle</code> 是
            undefined,<code>undefined * 2</code> 算出 <b>NaN</b>
            ,页面赫然写着「合计:¥NaN」。用户截图发到了群里。
          </>
        }
      />
    ),
  },
  {
    js: { at: 3, tag: { en: "Two hours of console.log", zh: "console.log 两小时" } },
    ts: { at: 3, tag: "💤" },
    msg: (
      <T
        en={
          <>
            3 a.m.: support calls, log files, one console.log after another. Two
            hours later the cause turns out to be five misspelled letters. At the
            same moment, the TypeScript developer is asleep.
          </>
        }
        zh={
          <>
            凌晨三点:客服电话、翻日志、一行行加 console.log —— 两小时后才发现,
            凶手是 5 个拼错的字母。同一时刻,TS 工程师在睡觉。
          </>
        }
      />
    ),
  },
  {
    js: { at: 3, boom: true },
    ts: { at: 3 },
    msg: (
      <T
        en={
          <>
            One mistake, two outcomes. This is the first sentence of the course:{" "}
            <b>
              a JavaScript mistake shows up at night in production, a TypeScript
              mistake shows up when you save the file.
            </b>{" "}
            You cannot avoid mistakes, but you can choose where they surface.
          </>
        }
        zh={
          <>
            同一个错误,两种命运。这就是整门课第一句要记住的话:
            <b>JS 的错误在半夜的线上炸,TS 的错误在你保存文件时炸。</b>
            错误免不了,但你可以选它在哪炸。
          </>
        }
      />
    ),
  },
];

export function TwoTimelines() {
  const L = useL();
  const stepper = useStepper(TL_FRAMES.length, 2400);
  const f = TL_FRAMES[stepper.step];

  return (
    <div className="viz">
      <div className="viz-title">
        {L({
          en: "Two timelines: one typo, two endings",
          zh: "两条时间线:同一个错字的两种结局",
        })}
      </div>
      <div className="viz-stage">
        <div className="viz-scroll">
          <div className="hm-tl">
            <Lane name="JS" tone="js" stations={JS_STATIONS} st={f.js} />
            <Lane name="TS" tone="ts" stations={TS_STATIONS} st={f.ts} />
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls
        stepper={stepper}
        step={stepper.step}
        total={TL_FRAMES.length}
      />
    </div>
  );
}

/* ================= ErasureViz ================= */

interface ESeg {
  s: string;
  /** 类型部分:标记态划红线,产物态整段消失 */
  t?: boolean;
}
interface ELine {
  segs: ESeg[];
  /** 整行都是类型(type/interface 声明),产物里整行蒸发 */
  whole?: boolean;
}

/** 代码本身两种语言一致,只有里面的饮品名跟着界面语言走。 */
const eLines = (drink: string): ELine[] => [
  {
    whole: true,
    segs: [{ s: 'type Size = "small" | "medium" | "large";', t: true }],
  },
  { whole: true, segs: [{ s: "interface Order {", t: true }] },
  { whole: true, segs: [{ s: "  drink: string;", t: true }] },
  { whole: true, segs: [{ s: "  size: Size;", t: true }] },
  { whole: true, segs: [{ s: "  total: number;", t: true }] },
  { whole: true, segs: [{ s: "}", t: true }] },
  { whole: true, segs: [{ s: "", t: true }] },
  {
    segs: [
      { s: "const order" },
      { s: ": Order", t: true },
      { s: ` = { drink: "${drink}", size: "large", total: 22 };` },
    ],
  },
  { segs: [{ s: "" }] },
  {
    segs: [
      { s: "function priceOf(item" },
      { s: ": { price: number }", t: true },
      { s: ")" },
      { s: ": number", t: true },
      { s: " {" },
    ],
  },
  { segs: [{ s: "  return item.price;" }] },
  { segs: [{ s: "}" }] },
];

type EMode = "ts" | "mark" | "js";

const E_CAPTION: Record<EMode, ReactNode> = {
  ts: (
    <T
      en={
        <>
          Everything in color is <b>written for the compiler</b>: type,
          interface, and the annotations after each colon. The lines that
          actually run are the ones below them.
        </>
      }
      zh={
        <>
          带颜色的部分全是<b>写给编译器看的</b>:type、interface、冒号后面的注解。
          运行逻辑其实只有下面那几行。
        </>
      }
    />
  ),
  mark: (
    <T
      en={
        <>
          The struck-through parts are <b>removed during compilation</b>. Not one
          byte of them reaches the output. This step is called type erasure.
        </>
      }
      zh={
        <>
          划线的这些,编译时会被<b>整体擦掉</b> —— 一个字节都不会进产物。
          这个动作就叫类型擦除(type erasure)。
        </>
      }
    />
  ),
  js: (
    <T
      en={
        <>
          This is the code that actually runs in the browser:{" "}
          <b>the types are gone, the logic is untouched</b>. That is why types
          cannot stop bad data arriving at runtime. The finale comes back to
          this.
        </>
      }
      zh={
        <>
          这就是用户浏览器里真正跑的代码:<b>类型全没了,逻辑一字未动</b>。
          所以类型防不住运行时闯进来的坏数据 —— 这个伏笔,终章回收。
        </>
      }
    />
  ),
};

const E_MODES: [EMode, Loc<string>][] = [
  ["ts", { en: "1. .ts source", zh: "① .ts 源码" }],
  ["mark", { en: "2. mark the types", zh: "② 标记类型" }],
  ["js", { en: "3. .js output", zh: "③ .js 产物" }],
];

export function ErasureViz() {
  const L = useL();
  const [mode, setMode] = useState<EMode>("ts");
  const all = eLines(L({ en: "Jasmine Green", zh: "四季春" }));
  const lines = mode === "js" ? all.filter((l) => !l.whole) : all;

  return (
    <div className="viz hm-erase">
      <div className="viz-title">
        {L({ en: "Type erasure, step by step", zh: "类型擦除:亲眼看一遍" })}
      </div>
      <div
        className="hm-er-modes"
        role="group"
        aria-label={L({ en: "View mode", zh: "查看模式" })}
      >
        {E_MODES.map(([m, label]) => (
          <button
            key={m}
            type="button"
            className={`btn btn-sm${mode === m ? " btn-primary" : ""}`}
            onClick={() => setMode(m)}
          >
            {L(label)}
          </button>
        ))}
      </div>
      <div className="hm-er-win" data-mode={mode}>
        <div className="codewin-bar">
          <span className="codewin-dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span className="codewin-name">
            {mode === "js"
              ? L({ en: "order.js · compiler output", zh: "order.js · 编译产物" })
              : L({ en: "order.ts · source", zh: "order.ts · 源码" })}
          </span>
          <span style={{ width: 47 }} aria-hidden />
        </div>
        <pre className="hm-er-body">
          {lines.map((l, i) => (
            <div key={i} className="hm-er-line">
              <span className="hm-er-n">{i + 1}</span>
              <span>
                {l.segs.map((seg, j) =>
                  seg.t ? (
                    mode === "js" ? null : (
                      <span
                        key={j}
                        className={`hm-er-t${mode === "mark" ? " cut" : ""}`}
                      >
                        {seg.s}
                      </span>
                    )
                  ) : (
                    <span key={j}>{seg.s}</span>
                  ),
                )}
                {l.segs.every((s) => !s.s) && " "}
              </span>
            </div>
          ))}
        </pre>
      </div>
      <div className="viz-msg" aria-live="polite">
        {E_CAPTION[mode]}
      </div>
    </div>
  );
}

/* ================= CourseMap ================= */

const CAMPS: { id: Chapter["camp"]; label: Loc<string> }[] = [
  {
    id: "core",
    label: {
      en: "Foundations · start writing TypeScript",
      zh: "地基 · 先把 TS 用起来",
    },
  },
  {
    id: "type",
    label: {
      en: "The type system · learn to narrow",
      zh: "类型系统 · 学会「收窄」这门手艺",
    },
  },
  {
    id: "meta",
    label: {
      en: "Type-level programming · types can compute",
      zh: "类型编程 · 类型也能算",
    },
  },
  {
    id: "eng",
    label: {
      en: "In practice · how real projects are set up",
      zh: "工程落地 · 真实项目怎么配",
    },
  },
  {
    id: "verdict",
    label: { en: "Finale · thinking in types", zh: "终章 · 类型思维" },
  },
];

export function CourseMap() {
  const L = useL();
  return (
    <div className="hm-map">
      {CAMPS.map((camp) => (
        <div key={camp.id}>
          <div className="hm-map-camp">{L(camp.label)}</div>
          <div className="hm-map-grid">
            {CHAPTERS.filter((c) => c.camp === camp.id).map((c) => (
              <Link
                key={c.id}
                href={c.href}
                className="card hoverable hm-map-card"
                style={
                  { "--ch-hue": c.hue, "--hue": c.hue } as React.CSSProperties
                }
              >
                <span className="hm-map-num">
                  {c.num} · {L(c.en)}
                </span>
                <span className="hm-map-title">{L(c.title)}</span>
                <span className="hm-map-essence">{L(c.essence)}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
