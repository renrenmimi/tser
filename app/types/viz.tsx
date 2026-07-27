"use client";

// 第 01 章专属可视化:
//  - HeroIdCards:hero 里三张悬浮的「值的身份证」(纯装饰)。
//  - IdWall:原始类型证件墙 —— 点一个值,右侧发一张身份证(类型 + 说明)。
//  - InferenceLens:推断放大镜 —— 一段代码逐行步进,右侧实时显示推断结果;
//    let / const 对照开关演示拓宽(widening)差异。

import { useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";

/* ================= HeroIdCards ================= */

const HERO_CARDS = [
  { value: '"多肉葡萄"', type: "string" },
  { value: "22", type: "number" },
  { value: "false", type: "boolean" },
];

export function HeroIdCards() {
  return (
    <div className="tp-heroids" aria-hidden>
      {HERO_CARDS.map((c, i) => (
        <div className="tp-idcard" key={i} style={{ "--i": i } as React.CSSProperties}>
          <div className="tp-idcard-head">TYPE ID · 值的身份证</div>
          <div className="tp-idcard-row">
            <span className="k">值</span>
            <span className="v">{c.value}</span>
          </div>
          <div className="tp-idcard-row">
            <span className="k">类型</span>
            <span className="v t">{c.type}</span>
          </div>
          <div className="tp-idcard-foot">签发机关:类型推断 · 免申请</div>
        </div>
      ))}
    </div>
  );
}

/* ================= IdWall ================= */

interface IdEntry {
  /** 墙上展示的值 */
  value: string;
  type: string;
  /** 一句话说明 */
  info: ReactNode;
  /** 补充小字(可选) */
  extra?: ReactNode;
}

const ID_ENTRIES: IdEntry[] = [
  {
    value: '"多肉葡萄"',
    type: "string",
    info: (
      <>
        一串字符。单引号、双引号、反引号包的都算 ——
        对类型系统来说没区别,都是 string。
      </>
    ),
  },
  {
    value: "22",
    type: "number",
    info: (
      <>
        JS/TS 不分整数和小数:22、19.5、-3 都是同一个
        number。别的语言里的 int / float 之分,这里没有。
      </>
    ),
  },
  {
    value: "NaN",
    type: "number",
    info: (
      <>
        冷知识:Not-a-Number(不是数)的类型,偏偏是
        number。序章那杯 ¥NaN 的奶茶,类型上完全合法 ——
        所以光靠类型防不住 NaN,还得防它的源头 undefined。
      </>
    ),
  },
  {
    value: "true",
    type: "boolean",
    info: <>非真即假,全家就 true 和 false 两口人 —— 最小的类型之一。</>,
  },
  {
    value: "null",
    type: "null",
    info: (
      <>
        「这里空着」—— <b>有意为之</b>的空:查无此人、暂不设置。
        得有人亲手把 null 赋进去,它才会出现。
      </>
    ),
    extra: (
      <>
        历史包袱:<code>typeof null === &quot;object&quot;</code> 是 JS
        著名的 bug,改不了了。但 TS 的类型系统里,null 就是 null。
      </>
    ),
  },
  {
    value: "undefined",
    type: "undefined",
    info: (
      <>
        「还没填」—— 声明了没赋值、读不存在的属性、函数没 return,
        得到的都是它。序章事故的元凶。
      </>
    ),
    extra: (
      <>
        和 null 的分工:undefined 是「系统默认的没有」,null
        是「人主动放的没有」。
      </>
    ),
  },
  {
    value: "9007199254740993n",
    type: "bigint",
    info: (
      <>
        超出安全范围的大整数,数字后面加个 n。日常业务几乎用不上,
        知道有这户人家就行。
      </>
    ),
  },
  {
    value: 'Symbol("vip")',
    type: "symbol",
    info: (
      <>
        全宇宙唯一的标签,常用来做对象里不会撞名的键。同样一句话带过,
        遇到再回来查。
      </>
    ),
  },
];

export function IdWall() {
  const [sel, setSel] = useState(0);
  const e = ID_ENTRIES[sel];

  return (
    <div className="tp-wall">
      <div className="tp-wall-grid" role="group" aria-label="点一个值,看它的类型">
        {ID_ENTRIES.map((it, i) => (
          <button
            key={i}
            type="button"
            className={`tp-wall-chip${sel === i ? " on" : ""}`}
            onClick={() => setSel(i)}
          >
            {it.value}
          </button>
        ))}
      </div>
      <div className="tp-wall-card" aria-live="polite">
        <div className="tp-idcard tp-idcard-big">
          <div className="tp-idcard-head">TYPE ID · 值的身份证</div>
          <div className="tp-idcard-row">
            <span className="k">值</span>
            <span className="v">{e.value}</span>
          </div>
          <div className="tp-idcard-row">
            <span className="k">类型</span>
            <span className="v t">{e.type}</span>
          </div>
        </div>
        <p className="tp-wall-info">{e.info}</p>
        {e.extra && <p className="tp-wall-extra">☞ {e.extra}</p>}
      </div>
    </div>
  );
}

/* ================= InferenceLens ================= */

type LensMode = "let" | "const";

interface LensLine {
  code: Record<LensMode, string>;
  /** 推断结果(错误行填报错原文) */
  type: Record<LensMode, string>;
  /** 该模式下这一行是否报错 */
  err?: Partial<Record<LensMode, boolean>>;
  note: Record<LensMode, ReactNode>;
}

const LENS_LINES: LensLine[] = [
  {
    code: {
      let: 'let drink = "多肉葡萄";',
      const: 'const drink = "多肉葡萄";',
    },
    type: { let: "string", const: '"多肉葡萄"' },
    note: {
      let: (
        <>
          let 声明的变量以后还能改,TS 往<b>宽</b>了记:「反正是个字符串」。
          从字面量放宽到 string,术语叫<b>拓宽(widening)</b>。
        </>
      ),
      const: (
        <>
          const 一辈子不会再赋值,TS 就敢把话说死:类型就是字面量{" "}
          <code>&quot;多肉葡萄&quot;</code> 本身 ——
          比 string 窄得多,这叫<b>字面量类型</b>。
        </>
      ),
    },
  },
  {
    code: { let: "let price = 22;", const: "const price = 22;" },
    type: { let: "number", const: "22" },
    note: {
      let: (
        <>
          同样的道理:初始值是 22,但以后可能改成 19.5,所以记成
          number。注意你没写一个冒号 —— 推断全自动。
        </>
      ),
      const: (
        <>
          const 版直接记成字面量 22。「这个变量永远是
          22」,编译器连这种话都敢替你担保。
        </>
      ),
    },
  },
  {
    code: { let: "let soldOut = false;", const: "const soldOut = false;" },
    type: { let: "boolean", const: "false" },
    note: {
      let: <>布尔同理:let 拓宽成 boolean,true / false 都能装。</>,
      const: (
        <>
          const 版类型就是 false —— 后面第 03 章你会看到,这种「值即类型」
          是联合类型和收窄的地基。
        </>
      ),
    },
  },
  {
    code: {
      let: 'let sizes = ["small", "medium", "large"];',
      const: 'const sizes = ["small", "medium", "large"];',
    },
    type: { let: "string[]", const: "string[]" },
    note: {
      let: (
        <>
          数组:每个元素都是字符串,所以是 <code>string[]</code>
          (读作「string 的数组」,也可写成 <code>Array&lt;string&gt;</code>)。
        </>
      ),
      const: (
        <>
          意外吧?<b>const 版居然还是 string[]</b>。因为 const
          只锁「变量名不能重新赋值」,数组内容照样能 push 能改 ——
          内容会变,元素类型就得拓宽。想连内容一起锁死,终章的{" "}
          <code>as const</code> 见。
        </>
      ),
    },
  },
  {
    code: {
      let: 'let item = { name: "多肉葡萄", price: 22 };',
      const: 'const item = { name: "多肉葡萄", price: 22 };',
    },
    type: {
      let: "{ name: string; price: number }",
      const: "{ name: string; price: number }",
    },
    note: {
      let: (
        <>
          对象:TS 把每个属性的类型都推出来,拼成一份「形状」。
          这份形状就是后面所有章节反复出现的主角。
        </>
      ),
      const: (
        <>
          和数组一个道理:const 锁不住属性,
          <code>item.price = 19</code> 依然合法,所以属性类型照样拓宽成
          string 和 number。
        </>
      ),
    },
  },
  {
    code: { let: "price = 19.5;", const: "price = 19.5;" },
    type: {
      let: "✓ 放行 —— 还是 number",
      const: "✗ Cannot assign to 'price' because it is a constant.",
    },
    err: { const: true },
    note: {
      let: (
        <>
          重新赋值一个 number?身份证没换,放行。let
          的「宽」就是为这种正常改动留的余地。
        </>
      ),
      const: (
        <>
          const 连赋值这一步就被拦下了 —— 都轮不到类型出场。
          这是 JS 自己的规矩,TS 只是提前到编译期告诉你。
        </>
      ),
    },
  },
  {
    code: { let: 'price = "第二杯半价";', const: 'price = "第二杯半价";' },
    type: {
      let: "✗ Type 'string' is not assignable to type 'number'.",
      const: "✗ Cannot assign to 'price' because it is a constant.",
    },
    err: { let: true, const: true },
    note: {
      let: (
        <>
          这行是推断的高光时刻:你<b>从没写过一个冒号</b>,TS
          照样逮住「拿字符串冒充数字」——
          「string 不能赋给 number」。推断出来的类型,和手写的一样管用。
        </>
      ),
      const: <>const 版依旧在赋值那关就被拦下,理由同上一行。</>,
    },
  },
];

export function InferenceLens() {
  const [mode, setMode] = useState<LensMode>("let");
  const stepper = useStepper(LENS_LINES.length, 2600);
  const cur = LENS_LINES[stepper.step];
  const isErr = !!cur.err?.[mode];

  return (
    <div className="viz tp-lens">
      <div className="viz-title">
        推断放大镜:编译器眼里的每一行
        <span className="tp-lens-switch" role="group" aria-label="let / const 对照">
          <button
            type="button"
            className={`btn btn-sm${mode === "let" ? " btn-primary" : ""}`}
            onClick={() => setMode("let")}
          >
            let 版
          </button>
          <button
            type="button"
            className={`btn btn-sm${mode === "const" ? " btn-primary" : ""}`}
            onClick={() => setMode("const")}
          >
            const 版
          </button>
        </span>
      </div>
      <div className="tp-lens-grid">
        <div className="tp-lens-win">
          <div className="codewin-bar">
            <span className="codewin-dots" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <span className="codewin-name">menu.ts · 第 {stepper.step + 1} 行放大中</span>
            <span style={{ width: 47 }} aria-hidden />
          </div>
          <div className="tp-lens-body">
            {LENS_LINES.map((l, i) => (
              <button
                key={i}
                type="button"
                className={`tp-lens-line${i === stepper.step ? " on" : ""}${
                  l.err?.[mode] && i === stepper.step ? " bad" : ""
                }`}
                onClick={() => {
                  // 点某行直接跳到那一帧(next/prev 是函数式更新,连点安全)
                  const diff = i - stepper.step;
                  for (let k = 0; k < diff; k++) stepper.next();
                  for (let k = 0; k < -diff; k++) stepper.prev();
                }}
              >
                <span className="n">{i + 1}</span>
                <span className="c">{l.code[mode]}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="tp-lens-panel" aria-live="polite">
          <div className="tp-lens-code">{cur.code[mode]}</div>
          <div className={`tp-lens-type${isErr ? " bad" : ""}`}>
            {isErr ? "" : "推断 → "}
            {cur.type[mode]}
          </div>
          <p className="tp-lens-note">{cur.note[mode]}</p>
        </div>
      </div>
      <StepControls
        stepper={stepper}
        step={stepper.step}
        total={LENS_LINES.length}
      />
    </div>
  );
}
