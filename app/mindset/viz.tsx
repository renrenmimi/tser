"use client";

// 终章 · 类型思维 专属可视化:
//  - HeroCreed:hero 里的五条心法进场动画(纯 CSS)。
//  - TrioLab:三兄弟对比台 —— 同一个对象字面量,切换 注解 / as / satisfies,
//    红绿灯展示「多余字段抓不抓」「漏字段抓不抓」「字面量保不保」。
//  - EraseFlow:类型擦除边界逐帧 —— as 骗过编译器 vs unknown + 校验守边界。
//  - RoadMap:全书 12 章知识地图(按阵营分组,链接回各章)。

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { CHAPTERS, type ChapterId, type Chapter } from "@/lib/curriculum";
import { CodeLines } from "@/lib/code";
import { FlowStepper, type FlowFrame } from "@/lib/stepper";

/* ================= HeroCreed ================= */

const CREEDS = [
  { ico: "✅", name: "satisfies", sub: "检查形状,不改推断" },
  { ico: "🎭", name: "as", sub: "你说了算,后果自负" },
  { ico: "🛃", name: "unknown", sub: "先收窄,再使用" },
  { ico: "🧨", name: "any", sub: "控制爆炸半径" },
  { ico: "🧱", name: "类型即文档", sub: "非法状态不可表示" },
];

export function HeroCreed() {
  return (
    <div className="ms-creeds" aria-hidden>
      {CREEDS.map((c, i) => (
        <div
          key={c.name}
          className="ms-creed"
          style={{ animationDelay: `${140 + i * 120}ms` }}
        >
          <span className="ico">{c.ico}</span>
          <span>
            {c.name}
            <small>{c.sub}</small>
          </span>
        </div>
      ))}
    </div>
  );
}

/* ================= TrioLab ================= */

type TrioMode = "anno" | "as" | "satisfies";

const TRIO_TYPE = `interface Config {
  shop: string;
  theme: "light" | "dark";
  maxSugar: number;
}`;

const TRIO_CODE: Record<TrioMode, string> = {
  anno: `const config: Config = {
  shop: "茶言观色",
  theme: "dark",
  maxSugar: 7,
};`,
  as: `const config = {
  shop: "茶言观色",
  theme: "dark",
  maxSugar: 7,
} as Config;`,
  satisfies: `const config = {
  shop: "茶言观色",
  theme: "dark",
  maxSugar: 7,
} satisfies Config;`,
};

const TRIO_MODES: { id: TrioMode; label: string; stance: string }[] = [
  { id: "anno", label: ": Config 注解", stance: "「请你检查」—— 检查,但把推断改写成声明类型" },
  { id: "as", label: "as Config 断言", stance: "「我说了算」—— 编译器闭嘴,后果自负" },
  { id: "satisfies", label: "satisfies Config", stance: "「检查完别改我」—— 校验形状,保留字面量推断" },
];

interface TrioVerdict {
  tone: "ok" | "bad";
  label: string;
  detail: string;
}

const TRIO_TESTS: {
  id: string;
  q: string;
  verdict: Record<TrioMode, TrioVerdict>;
}[] = [
  {
    id: "typo",
    q: "考题一:手滑多写一个 Config 里没有的字段 thema",
    verdict: {
      anno: {
        tone: "ok",
        label: "当场报错",
        detail:
          "对象字面量直接赋给带类型的变量,多余属性检查(excess property check)生效:『Config 里没有 thema,你是不是想写 theme?』—— 第 04 章的老朋友。",
      },
      as: {
        tone: "bad",
        label: "静默放行",
        detail:
          "断言把检查降级成「两边沾点边就行」,字面量的多余属性检查直接跳过 —— 拼错的字段就这么带着 Config 的户口上线了。",
      },
      satisfies: {
        tone: "ok",
        label: "当场报错",
        detail:
          "satisfies 对字面量做的是和注解同款的新鲜检查 —— thema 一样逃不掉。",
      },
    },
  },
  {
    id: "missing",
    q: "考题二:漏写 maxSugar 字段",
    verdict: {
      anno: {
        tone: "ok",
        label: "当场报错",
        detail:
          "『Property maxSugar is missing』—— 注解要求字面量完整地长成 Config 的形状,缺一个都不行。",
      },
      as: {
        tone: "bad",
        label: "静默放行",
        detail:
          "只要两个类型「有重叠」,断言就放行 —— 缺字段的对象照样领证。运行时 config.maxSugar 是 undefined,糖度计算 NaN,炸在收银台。",
      },
      satisfies: {
        tone: "ok",
        label: "当场报错",
        detail: "形状校验一视同仁:少了 maxSugar,satisfies 立刻翻脸。",
      },
    },
  },
  {
    id: "literal",
    q: "考题三:事后 config.theme 还记得自己是 \"dark\" 吗",
    verdict: {
      anno: {
        tone: "bad",
        label: '拓宽成 "light" | "dark"',
        detail:
          "注解把推断改写成声明类型 —— 编译器从此只知道「是俩之一」,不记得具体是哪个。写 if (config.theme === \"light\") 它也不帮你排除。",
      },
      as: {
        tone: "bad",
        label: '拓宽成 "light" | "dark"',
        detail:
          "断言同样用 Config 覆盖了字面量信息 —— 检查没做,推断还丢了,两头空。",
      },
      satisfies: {
        tone: "ok",
        label: '保住 "dark"',
        detail:
          "检查归检查,推断不动 —— config.theme 依然是字面量类型 \"dark\"。「既要校验又要精确推断」,这正是 satisfies 在 TS 4.9 出道的理由。",
      },
    },
  },
];

export function TrioLab() {
  const [mode, setMode] = useState<TrioMode>("anno");
  const [openTest, setOpenTest] = useState<string | null>("typo");
  const cur = TRIO_MODES.find((m) => m.id === mode)!;

  return (
    <div className="viz ms-trio">
      <div className="viz-title">
        三兄弟对比台 —— 同一个字面量,三种说法
        <span className="seg" role="group" aria-label="切换写法">
          {TRIO_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`seg-btn${mode === m.id ? " on" : ""}`}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </span>
      </div>

      <div className="ms-trio-grid">
        <div className="ms-trio-code">
          <div className="ms-trio-code-bar">config.ts</div>
          <CodeLines code={`${TRIO_TYPE}\n\n${TRIO_CODE[mode]}`} lang="ts" />
        </div>
        <div className="ms-trio-side">
          <div className="ms-trio-stance">{cur.stance}</div>
          {TRIO_TESTS.map((t) => {
            const v = t.verdict[mode];
            const open = openTest === t.id;
            return (
              <div key={t.id} className={`ms-test${open ? " open" : ""}`}>
                <button
                  type="button"
                  className="ms-test-head"
                  onClick={() => setOpenTest(open ? null : t.id)}
                  aria-expanded={open}
                >
                  <span className="ms-light" data-tone={v.tone} aria-hidden>
                    {v.tone === "ok" ? "✓" : "✕"}
                  </span>
                  <span className="ms-test-q">
                    {t.q}
                    <small data-tone={v.tone}>{v.label}</small>
                  </span>
                  <span className="ms-test-caret" aria-hidden>
                    ▾
                  </span>
                </button>
                {open && <p className="ms-test-detail">{v.detail}</p>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="ms-trio-score">
        总结:注解 <b>检查 ✓ 推断 ✕</b> · as <b>检查 ✕ 推断 ✕</b> ·
        satisfies <b>检查 ✓ 推断 ✓</b> —— 想两头都要,用 satisfies。
      </div>
    </div>
  );
}

/* ================= EraseFlow ================= */

function EfStage({
  left,
  right,
  packet,
  packetTone,
  back,
}: {
  left: { ico: string; name: string; lit?: boolean; tone?: "ok" | "bad" };
  right: { ico: string; name: string; lit?: boolean; tone?: "ok" | "bad" };
  packet?: string;
  packetTone?: "ok" | "bad";
  back?: boolean;
}) {
  return (
    <div className="flow ms-ef">
      <div
        className={`flow-node${left.lit ? " lit" : ""}`}
        data-tone={left.tone}
      >
        <span className="ico" aria-hidden>
          {left.ico}
        </span>
        {left.name}
      </div>
      <div className="flow-mid">
        <div className="flow-line" />
        {packet && (
          <div
            className={`flow-packet${back ? " back" : ""}`}
            data-tone={packetTone}
          >
            {packet}
          </div>
        )}
      </div>
      <div
        className={`flow-node${right.lit ? " lit" : ""}`}
        data-tone={right.tone}
      >
        <span className="ico" aria-hidden>
          {right.ico}
        </span>
        {right.name}
      </div>
    </div>
  );
}

const EF_FRAMES: FlowFrame[] = [
  {
    stage: (
      <EfStage
        left={{ ico: "👨‍💻", name: "你的代码", lit: true }}
        right={{ ico: "👮", name: "编译器" }}
        packet="JSON.parse(raw) as Order"
      />
    ),
    msg: (
      <>
        fetch 回来一坨 JSON,你一句 <b>as Order</b>,编译器立正:
        「你说了算。」检查结束,户口本上从此写着 Order。
      </>
    ),
  },
  {
    stage: (
      <EfStage
        left={{ ico: "👮", name: "编译器" }}
        right={{ ico: "🌃", name: "运行期 · 线上", lit: true }}
        packet="类型已全部擦除"
      />
    ),
    msg: (
      <>
        编译产物是纯 JS —— <b>Order 三个字在运行时根本不存在</b>,
        门口没有安检员。类型擦除(type erasure),序章埋的伏笔在这里收回:
        编译器管得了你的代码,管不了别人发来的数据。
      </>
    ),
  },
  {
    stage: (
      <EfStage
        left={{ ico: "📡", name: "后端(改了字段)" }}
        right={{ ico: "💥", name: "报表页 NaN", tone: "bad", lit: true }}
        packet='{ "amount": 15 }'
        packetTone="bad"
      />
    ),
    msg: (
      <>
        半夜,后端把 total 悄悄改名 amount。JSON 照样进门,
        <b>order.total 是 undefined</b>,一路传到三个文件之外的报表页才炸 ——
        离案发现场越远,排查越贵。
      </>
    ),
  },
  {
    stage: (
      <EfStage
        left={{ ico: "👨‍💻", name: "你的代码", lit: true }}
        right={{ ico: "🛃", name: "边界校验 isOrder()" }}
        packet="接的时候标 unknown"
      />
    ),
    msg: (
      <>
        换个姿势:外部数据一律先当 <b>unknown</b>。编译器立刻翻脸:
        「不收窄不许用。」你只好在边界写一个校验函数 —— 这不是麻烦,
        是编译器在替运行时讨说法。
      </>
    ),
  },
  {
    stage: (
      <EfStage
        left={{ ico: "📡", name: "后端(又改字段)" }}
        right={{ ico: "🛃", name: "isOrder:拦下", tone: "ok", lit: true }}
        packet='{ "amount": 15 } → ✕'
        packetTone="bad"
        back
      />
    ),
    msg: (
      <>
        坏数据再来:isOrder 在门口当场拦下,一行日志指明现场。
        错误还是会发生 —— 但它<b>炸在边界,而不是炸在千里之外</b>。
        这就是「unknown 兜底 + 校验收窄」的全部价值。
      </>
    ),
  },
];

export function EraseFlow() {
  return (
    <FlowStepper
      title="类型的世界在编译期结束 —— 边界要靠你自己守(逐帧)"
      frames={EF_FRAMES}
    />
  );
}

/* ================= RoadMap ================= */

const SOULS: Record<ChapterId, string> = {
  home: "JS 的错半夜在线上炸,TS 的错在你保存时炸 —— 类型是编译期的安检口。",
  types: "值有身份证:大多数时候推断就够;any 是撕掉身份证,别轻易撕。",
  functions:
    "参数和返回值的形状写清楚,谁调用谁安心;interface 和 type 大面积重叠,团队一致即可。",
  narrowing:
    "「可能是 A 也可能是 B」先收窄再用:typeof / in / 可辨识联合,never 兜住穷尽。",
  structural:
    "兼容看形状不看名字;字面量直接传参才有多余属性检查 —— 新手第一大惑在此。",
  generics: "先留一个洞,调用的人来填;extends 给洞加护栏。",
  utility: "Partial / Pick / Omit / Record…… 官方送的类型改锥,先会用。",
  "type-magic":
    "keyof、条件类型、infer、映射类型 —— 把改锥拆开看,类型也能编程。",
  classes:
    "访问修饰符管秩序,abstract 管半成品,implements 管承诺;结构化规则对 class 一样生效。",
  modules:
    ".d.ts 只有类型没有实现;库自带、@types、declare module —— 类型三来源。",
  tsconfig:
    "strict 是军规总开关;noUncheckedIndexedAccess 在军规之外,要单独签。",
  mindset:
    "satisfies 检查不改推断,unknown 守边界,any 控半径 —— 类型是写下来的约定。",
};

const CAMP_META: { camp: Chapter["camp"]; label: string; sub: string }[] = [
  { camp: "core", label: "地基", sub: "先会写" },
  { camp: "type", label: "类型系统", sub: "会想" },
  { camp: "meta", label: "类型编程", sub: "会造" },
  { camp: "eng", label: "工程落地", sub: "会管" },
  { camp: "verdict", label: "终章", sub: "会判" },
];

export function RoadMap() {
  return (
    <div className="ms-map">
      {CAMP_META.map((g) => {
        const chs = CHAPTERS.filter((c) => c.camp === g.camp);
        return (
          <div key={g.camp} className="ms-map-group">
            <div className="ms-map-head">
              <span className="ms-map-camp">{g.label}</span>
              <span className="ms-map-sub">{g.sub}</span>
            </div>
            <div className="ms-map-nodes">
              {chs.map((c) => (
                <Link
                  key={c.id}
                  href={c.href}
                  className="ms-map-node"
                  style={{ "--hue": c.hue } as CSSProperties}
                >
                  <span className="ms-map-num">
                    {c.num} · {c.en}
                  </span>
                  <span className="ms-map-title">{c.title}</span>
                  <span className="ms-map-soul">{SOULS[c.id]}</span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
