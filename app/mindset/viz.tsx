"use client";

// 终章 · 类型思维 专属可视化(双语):
//  - HeroCreed:hero 里的五条心法进场动画(纯 CSS)。
//  - TrioLab:三种写法对比台 —— 同一个对象字面量,切换 注解 / as / satisfies,
//    用三个问题展示「多余字段查不查」「漏字段查不查」「字面量保不保」。
//  - EraseFlow:类型擦除边界逐帧 —— as 骗过编译器 vs unknown + 校验守边界。
//  - RoadMap:全书 12 章知识地图(按阵营分组,链接回各章)。
//
// 结论已用 tsc 5.9 逐条核对:注解报 TS2561 / TS2741,satisfies 报 TS2561 / TS1360,
// as 两个用例都无错;推断结果分别是 "light" | "dark" / "light" | "dark" / "dark"。

import { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { CHAPTERS, type ChapterId, type Chapter } from "@/lib/curriculum";
import { CodeLines } from "@/lib/code";
import { T, useL, type Loc } from "@/lib/i18n";
import { FlowStepper, type FlowFrame } from "@/lib/stepper";

/* ================= HeroCreed ================= */

const CREEDS: { ico: string; name: Loc<string>; sub: Loc<string> }[] = [
  {
    ico: "✅",
    name: "satisfies",
    sub: { en: "checks the shape, keeps the inference", zh: "检查形状,不改推断" },
  },
  {
    ico: "🎭",
    name: "as",
    sub: { en: "you decide, you carry the risk", zh: "你说了算,后果自负" },
  },
  {
    ico: "🛃",
    name: "unknown",
    sub: { en: "narrow it, then use it", zh: "先收窄,再使用" },
  },
  {
    ico: "🧨",
    name: "any",
    sub: { en: "keep it in a small scope", zh: "锁在最小的作用域" },
  },
  {
    ico: "🧱",
    name: { en: "types as documentation", zh: "类型即文档" },
    sub: { en: "make illegal states unrepresentable", zh: "非法状态不可表示" },
  },
];

export function HeroCreed() {
  const L = useL();
  return (
    <div className="ms-creeds" aria-hidden>
      {CREEDS.map((c, i) => (
        <div
          key={c.ico}
          className="ms-creed"
          style={{ animationDelay: `${140 + i * 120}ms` }}
        >
          <span className="ico">{c.ico}</span>
          <span>
            {L(c.name)}
            <small>{L(c.sub)}</small>
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
  shop: "Sunrise Tea",
  theme: "dark",
  maxSugar: 7,
};`,
  as: `const config = {
  shop: "Sunrise Tea",
  theme: "dark",
  maxSugar: 7,
} as Config;`,
  satisfies: `const config = {
  shop: "Sunrise Tea",
  theme: "dark",
  maxSugar: 7,
} satisfies Config;`,
};

const TRIO_MODES: {
  id: TrioMode;
  label: Loc<string>;
  stance: Loc<ReactNode>;
}[] = [
  {
    id: "anno",
    label: { en: ": Config", zh: ": Config 注解" },
    stance: {
      en: 'Annotation — "please check this". The compiler checks the object, then replaces the inferred type with the declared one.',
      zh: "「请你检查」—— 编译器认真检查这个对象,然后把推断结果换成你声明的类型。",
    },
  },
  {
    id: "as",
    label: { en: "as Config", zh: "as Config 断言" },
    stance: {
      en: 'Assertion — "take my word for it". The compiler stops checking the object, and you carry the risk.',
      zh: "「我说了算」—— 编译器不再检查这个对象,风险由你承担。",
    },
  },
  {
    id: "satisfies",
    label: { en: "satisfies Config", zh: "satisfies Config" },
    stance: {
      en: 'satisfies — "check it, but do not rewrite it". The shape is checked, and the literal types stay.',
      zh: "「检查完别改我」—— 形状照查,字面量推断保留。",
    },
  },
];

interface TrioVerdict {
  tone: "ok" | "bad";
  label: Loc<string>;
  detail: Loc<ReactNode>;
}

const TRIO_TESTS: {
  id: string;
  q: Loc<string>;
  verdict: Record<TrioMode, TrioVerdict>;
}[] = [
  {
    id: "typo",
    q: {
      en: "Question 1 — you add a field thema that Config does not have",
      zh: "问题一:多写了一个 Config 里没有的字段 thema",
    },
    verdict: {
      anno: {
        tone: "ok",
        label: { en: "Error", zh: "当场报错" },
        detail: {
          en: (
            <>
              An object literal assigned straight to a typed variable gets the
              excess property check:{" "}
              <em>
                Object literal may only specify known properties, but
                &apos;thema&apos; does not exist in type &apos;Config&apos;. Did
                you mean to write &apos;theme&apos;?
              </em>{" "}
              (TS2561). That check is from chapter 04.
            </>
          ),
          zh: (
            <>
              对象字面量直接赋给带类型的变量,会触发多余属性检查:
              <em>
                Object literal may only specify known properties, but
                &apos;thema&apos; does not exist in type &apos;Config&apos;. Did
                you mean to write &apos;theme&apos;?
              </em>
              (TS2561)。这道检查来自第 04 章。
            </>
          ),
        },
      },
      as: {
        tone: "bad",
        label: { en: "Accepted", zh: "静默放行" },
        detail: {
          en: (
            <>
              An assertion only requires that the two types overlap enough for
              one to be the other. The excess property check is skipped
              entirely, so the misspelled field goes through with the{" "}
              <code>Config</code> label on it.
            </>
          ),
          zh: (
            <>
              断言只要求两个类型有足够的重叠,能互相当成对方。
              多余属性检查完全不做,拼错的字段就这样带着 <code>Config</code>{" "}
              的名分通过了。
            </>
          ),
        },
      },
      satisfies: {
        tone: "ok",
        label: { en: "Error", zh: "当场报错" },
        detail: {
          en: (
            <>
              <code>satisfies</code> runs the same check on the literal that an
              annotation does, so <code>thema</code> is reported here too, with
              the same TS2561.
            </>
          ),
          zh: (
            <>
              <code>satisfies</code> 对字面量做的检查和注解是同一套,
              <code>thema</code> 一样被报出来,同样是 TS2561。
            </>
          ),
        },
      },
    },
  },
  {
    id: "missing",
    q: {
      en: "Question 2 — you forget the maxSugar field",
      zh: "问题二:漏写了 maxSugar 字段",
    },
    verdict: {
      anno: {
        tone: "ok",
        label: { en: "Error", zh: "当场报错" },
        detail: {
          en: (
            <>
              <em>
                Property &apos;maxSugar&apos; is missing in type &apos;{"{"}{" "}
                shop: string; theme: &quot;dark&quot;; {"}"}&apos; but required
                in type &apos;Config&apos;.
              </em>{" "}
              (TS2741). The annotation requires the literal to have the full
              shape of <code>Config</code>.
            </>
          ),
          zh: (
            <>
              <em>
                Property &apos;maxSugar&apos; is missing in type &apos;{"{"}{" "}
                shop: string; theme: &quot;dark&quot;; {"}"}&apos; but required
                in type &apos;Config&apos;.
              </em>
              (TS2741)。注解要求这个字面量具备 <code>Config</code>{" "}
              的完整形状,缺一个都不行。
            </>
          ),
        },
      },
      as: {
        tone: "bad",
        label: { en: "Accepted", zh: "静默放行" },
        detail: {
          en: (
            <>
              <code>Config</code> is assignable to the smaller shape you wrote,
              so the two types overlap and the assertion is allowed. At runtime{" "}
              <code>config.maxSugar</code> is <code>undefined</code>, and any
              arithmetic with it produces <code>NaN</code>.
            </>
          ),
          zh: (
            <>
              <code>Config</code> 可以赋给你写的这个更小的形状,
              两个类型有重叠,断言就通过了。运行时{" "}
              <code>config.maxSugar</code> 是 <code>undefined</code>,
              拿它做算术会得到 <code>NaN</code>。
            </>
          ),
        },
      },
      satisfies: {
        tone: "ok",
        label: { en: "Error", zh: "当场报错" },
        detail: {
          en: (
            <>
              <em>
                Type &apos;{"{"} shop: string; theme: &quot;dark&quot;; {"}"}
                &apos; does not satisfy the expected type &apos;Config&apos;.
              </em>{" "}
              (TS1360), followed by the same missing-property line.
            </>
          ),
          zh: (
            <>
              <em>
                Type &apos;{"{"} shop: string; theme: &quot;dark&quot;; {"}"}
                &apos; does not satisfy the expected type &apos;Config&apos;.
              </em>
              (TS1360),后面跟着同样一行「缺少属性」的说明。
            </>
          ),
        },
      },
    },
  },
  {
    id: "literal",
    q: {
      en: 'Question 3 — afterwards, does config.theme still know it is "dark"?',
      zh: "问题三:事后 config.theme 还记得自己是 \"dark\" 吗",
    },
    verdict: {
      anno: {
        tone: "bad",
        label: { en: 'Widened to "light" | "dark"', zh: '拓宽成 "light" | "dark"' },
        detail: {
          en: (
            <>
              The annotation replaces the inferred type with the declared one.
              From here on the compiler only knows it is one of the two, not
              which one. So <code>{'if (config.theme === "light")'}</code> is
              still considered possible.
            </>
          ),
          zh: (
            <>
              注解把推断结果换成了你声明的类型。
              编译器从此只知道「是两者之一」,不知道具体是哪一个。
              写 <code>{'if (config.theme === "light")'}</code>{" "}
              它仍然认为有可能成立。
            </>
          ),
        },
      },
      as: {
        tone: "bad",
        label: { en: 'Widened to "light" | "dark"', zh: '拓宽成 "light" | "dark"' },
        detail: {
          en: (
            <>
              The assertion also replaces the literal information with{" "}
              <code>Config</code>. No check was done and the precise inference
              is gone as well, so this form loses on both counts.
            </>
          ),
          zh: (
            <>
              断言同样把字面量信息换成了 <code>Config</code>。
              检查没做,精确的推断也丢了 —— 两头都没落着。
            </>
          ),
        },
      },
      satisfies: {
        tone: "ok",
        label: { en: 'Keeps "dark"', zh: '保住 "dark"' },
        detail: {
          en: (
            <>
              The check runs, and the inferred type is left alone.{" "}
              <code>config.theme</code> is still the literal type{" "}
              <code>&quot;dark&quot;</code>. Wanting both the check and the
              precise inference is exactly why <code>satisfies</code> was added
              in TypeScript 4.9.
            </>
          ),
          zh: (
            <>
              检查照做,推断不动 —— <code>config.theme</code> 依然是字面量类型{" "}
              <code>&quot;dark&quot;</code>。「既要校验又要精确推断」,
              正是 TypeScript 4.9 加入 <code>satisfies</code> 的原因。
            </>
          ),
        },
      },
    },
  },
];

export function TrioLab() {
  const L = useL();
  const [mode, setMode] = useState<TrioMode>("anno");
  const [openTest, setOpenTest] = useState<string | null>("typo");
  const cur = TRIO_MODES.find((m) => m.id === mode)!;

  return (
    <div className="viz ms-trio">
      <div className="viz-title">
        <T
          en="Three forms, one object literal"
          zh="三种写法对比台 —— 同一个字面量,三种说法"
        />
        <span
          className="seg"
          role="group"
          aria-label={L({ en: "Choose a form", zh: "切换写法" })}
        >
          {TRIO_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`seg-btn${mode === m.id ? " on" : ""}`}
              onClick={() => setMode(m.id)}
            >
              {L(m.label)}
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
          <div className="ms-trio-stance">{L(cur.stance)}</div>
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
                    {L(t.q)}
                    <small data-tone={v.tone}>{L(v.label)}</small>
                  </span>
                  <span className="ms-test-caret" aria-hidden>
                    ▾
                  </span>
                </button>
                {open && <p className="ms-test-detail">{L(v.detail)}</p>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="ms-trio-score">
        <T
          en={
            <>
              Summary: annotation <b>checks ✓ infers ✕</b> · as{" "}
              <b>checks ✕ infers ✕</b> · satisfies <b>checks ✓ infers ✓</b>. When
              you want both, use satisfies.
            </>
          }
          zh={
            <>
              总结:注解 <b>检查 ✓ 推断 ✕</b> · as <b>检查 ✕ 推断 ✕</b> ·
              satisfies <b>检查 ✓ 推断 ✓</b> —— 两样都想要,用 satisfies。
            </>
          }
        />
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
  left: { ico: string; name: ReactNode; lit?: boolean; tone?: "ok" | "bad" };
  right: { ico: string; name: ReactNode; lit?: boolean; tone?: "ok" | "bad" };
  packet?: ReactNode;
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

const YOUR_CODE = <T en="Your code" zh="你的代码" />;
const COMPILER = <T en="Compiler" zh="编译器" />;

const EF_FRAMES: FlowFrame[] = [
  {
    stage: (
      <EfStage
        left={{ ico: "👨‍💻", name: YOUR_CODE, lit: true }}
        right={{ ico: "👮", name: COMPILER }}
        packet="JSON.parse(raw) as Order"
      />
    ),
    msg: (
      <T
        en={
          <>
            A request comes back with some JSON. You write <b>as Order</b>, and
            the compiler accepts it without looking at the value. From this
            point on, the type of that value is <code>Order</code> as far as the
            compiler is concerned.
          </>
        }
        zh={
          <>
            一次请求带回一段 JSON。你写下 <b>as Order</b>,
            编译器不再检查这个值,直接接受。
            从这里开始,在编译器眼里它的类型就是 <code>Order</code>。
          </>
        }
      />
    ),
  },
  {
    stage: (
      <EfStage
        left={{ ico: "👮", name: COMPILER }}
        right={{
          ico: "🌃",
          name: <T en="Runtime, in production" zh="运行期 · 线上" />,
          lit: true,
        }}
        packet={<T en="all types removed" zh="类型已全部擦除" />}
      />
    ),
    msg: (
      <T
        en={
          <>
            The compiler emits plain JavaScript. <b>The word Order does not
            exist at runtime</b>, and nothing checks the data at the door. This
            is type erasure: the compiler can check the code you wrote, but it
            cannot check the data someone else sends you.
          </>
        }
        zh={
          <>
            编译产物是普通 JavaScript。<b>Order 这个名字在运行时并不存在</b>,
            门口也没有任何检查。这就是类型擦除:
            编译器能检查你写的代码,检查不了别人发来的数据。
          </>
        }
      />
    ),
  },
  {
    stage: (
      <EfStage
        left={{
          ico: "📡",
          name: <T en="Backend, field renamed" zh="后端改了字段名" />,
        }}
        right={{
          ico: "💥",
          name: <T en="Report page shows NaN" zh="报表页显示 NaN" />,
          tone: "bad",
          lit: true,
        }}
        packet='{ "amount": 15 }'
        packetTone="bad"
      />
    ),
    msg: (
      <T
        en={
          <>
            One night the backend renames <code>total</code> to{" "}
            <code>amount</code>. The JSON still arrives.{" "}
            <b>
              <code>order.total</code> is now <code>undefined</code>
            </b>
            , and it travels through three files before a report page fails. The
            further the failure is from its cause, the longer it takes to find.
          </>
        }
        zh={
          <>
            某天后端把 <code>total</code> 改名成 <code>amount</code>。
            JSON 照样进来,
            <b>
              <code>order.total</code> 变成 <code>undefined</code>
            </b>
            ,一路传过三个文件,直到报表页才出错。
            出错的地方离原因越远,排查越费时间。
          </>
        }
      />
    ),
  },
  {
    stage: (
      <EfStage
        left={{ ico: "👨‍💻", name: YOUR_CODE, lit: true }}
        right={{
          ico: "🛃",
          name: <T en="Boundary check isOrder()" zh="边界校验 isOrder()" />,
        }}
        packet={<T en="received as unknown" zh="接收时标成 unknown" />}
      />
    ),
    msg: (
      <T
        en={
          <>
            Try it the other way. Type incoming data as <b>unknown</b> first.
            Now the compiler refuses every use of it until you narrow it, so you
            write a check at the boundary. That check is the part the type
            system cannot do for you, because it has to happen at runtime.
          </>
        }
        zh={
          <>
            换一种做法:外部数据先标成 <b>unknown</b>。
            这样编译器会拒绝一切用法,直到你把它收窄,
            于是你在边界上写一个检查函数 ——
            这个检查就是类型系统替你做不了的那部分。
          </>
        }
      />
    ),
  },
  {
    stage: (
      <EfStage
        left={{
          ico: "📡",
          name: <T en="Backend changes again" zh="后端又改了字段" />,
        }}
        right={{
          ico: "🛃",
          name: <T en="isOrder rejects it" zh="isOrder 当场拦下" />,
          tone: "ok",
          lit: true,
        }}
        packet='{ "amount": 15 } → ✕'
        packetTone="bad"
        back
      />
    ),
    msg: (
      <T
        en={
          <>
            The bad data arrives again, and <code>isOrder</code> rejects it at
            the door with one log line that names the problem. The error still
            happens. It just <b>happens at the boundary instead of three files
            away</b>. That is the whole value of taking data in as{" "}
            <code>unknown</code> and narrowing it with a check.
          </>
        }
        zh={
          <>
            坏数据再来一次,<code>isOrder</code> 在门口拦下,
            一行日志就能说清问题。错误仍然会发生,只是
            <b>发生在边界,而不是三个文件之外</b>。
            「用 <code>unknown</code> 接收,再用检查收窄」的价值就在这里。
          </>
        }
      />
    ),
  },
];

export function EraseFlow() {
  return (
    <FlowStepper
      title={{
        en: "Types end at compile time. The boundary is yours to guard.",
        zh: "类型的世界在编译期结束 —— 边界要靠你自己守",
      }}
      frames={EF_FRAMES}
    />
  );
}

/* ================= RoadMap ================= */

const SOULS: Record<ChapterId, Loc<string>> = {
  home: {
    en: "A JavaScript mistake fails at night in production. A TypeScript mistake fails when you save the file.",
    zh: "JavaScript 的错误半夜在线上出现,TypeScript 的错误在你保存文件时出现。",
  },
  types: {
    en: "Every value has a type. Inference covers most of them. any throws that information away, so use it rarely.",
    zh: "每个值都有类型,大多数靠推断就够;any 是把这份信息丢掉,别轻易用。",
  },
  functions: {
    en: "Write down the shape going in and the shape coming out. interface and type overlap almost entirely; pick one per team and stay consistent.",
    zh: "把参数和返回值的形状写清楚;interface 和 type 几乎完全重叠,团队统一即可。",
  },
  narrowing: {
    en: '"A or B" has to be narrowed before use: typeof, in, discriminated unions, and never for exhaustiveness.',
    zh: "「A 或 B」要先收窄再用:typeof、in、可辨识联合,never 负责穷尽检查。",
  },
  structural: {
    en: "Compatibility is decided by shape, not by name. The excess property check only applies to object literals written in place.",
    zh: "兼容看形状不看名字;多余属性检查只对当场写下的对象字面量生效。",
  },
  generics: {
    en: "Leave a hole in the type and let the caller fill it. extends puts a limit on what can go in the hole.",
    zh: "在类型里留一个洞,让调用方来填;extends 给这个洞加上限制。",
  },
  utility: {
    en: "Partial, Pick, Omit, Record are a standard toolkit. Learn to use them before you build your own.",
    zh: "Partial、Pick、Omit、Record 是一套标准工具,先会用,再谈自己造。",
  },
  "type-magic": {
    en: "keyof, conditional types, infer, mapped types. This is where types start to compute.",
    zh: "keyof、条件类型、infer、映射类型 —— 类型从这里开始能计算。",
  },
  classes: {
    en: "Access modifiers control what code may touch, abstract leaves a gap for subclasses, implements records a promise. Structural rules apply to classes too.",
    zh: "访问修饰符管谁能碰,abstract 给子类留缺口,implements 记录一份承诺;结构化规则对 class 同样生效。",
  },
  modules: {
    en: "A .d.ts file has types and no implementation. Types come from three places: the library itself, @types, or your own declare module.",
    zh: ".d.ts 只有类型没有实现;类型有三个来源:库自带、@types、自己写 declare module。",
  },
  tsconfig: {
    en: "strict switches on a family of checks at once. noUncheckedIndexedAccess is outside that family and has to be enabled separately.",
    zh: "strict 一次打开一整族检查;noUncheckedIndexedAccess 不在这一族里,要单独开。",
  },
  mindset: {
    en: "satisfies checks without rewriting the inference, unknown guards the boundary, any stays in a small scope. A type is an agreement you wrote down.",
    zh: "satisfies 检查但不改推断,unknown 守边界,any 锁在小范围 —— 类型是你写下来的约定。",
  },
};

const CAMP_META: { camp: Chapter["camp"]; label: Loc<string>; sub: Loc<string> }[] =
  [
    {
      camp: "core",
      label: { en: "Foundations", zh: "地基" },
      sub: { en: "write it", zh: "先会写" },
    },
    {
      camp: "type",
      label: { en: "The type system", zh: "类型系统" },
      sub: { en: "think in it", zh: "会想" },
    },
    {
      camp: "meta",
      label: { en: "Type programming", zh: "类型编程" },
      sub: { en: "build with it", zh: "会造" },
    },
    {
      camp: "eng",
      label: { en: "Using it on a project", zh: "工程落地" },
      sub: { en: "run it", zh: "会管" },
    },
    {
      camp: "verdict",
      label: { en: "Finale", zh: "终章" },
      sub: { en: "judge it", zh: "会判" },
    },
  ];

export function RoadMap() {
  const L = useL();
  return (
    <div className="ms-map">
      {CAMP_META.map((g) => {
        const chs = CHAPTERS.filter((c) => c.camp === g.camp);
        return (
          <div key={g.camp} className="ms-map-group">
            <div className="ms-map-head">
              <span className="ms-map-camp">{L(g.label)}</span>
              <span className="ms-map-sub">{L(g.sub)}</span>
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
                    {c.num} · {L(c.en)}
                  </span>
                  <span className="ms-map-title">{L(c.title)}</span>
                  <span className="ms-map-soul">{L(SOULS[c.id])}</span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
