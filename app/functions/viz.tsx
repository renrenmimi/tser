"use client";

// 第 02 章专属可视化:
//  - HeroManifest:hero 里那张「函数进出货单」(纯装饰)。
//  - SignatureAnatomy:函数签名解剖台 —— 逐段点击,右侧讲解(承 01 章解剖台交互)。
//  - CallCheck:调用体检机 —— 六种调用先猜「能不能过」,点选即判,附编译器原话。

import { useState, type ReactNode } from "react";

/* ================= HeroManifest ================= */

export function HeroManifest() {
  return (
    <div className="fn-manifest" aria-hidden>
      <div className="fn-manifest-stamp">SIGNATURE</div>
      <div className="fn-manifest-title">进出货单 · makeOrder</div>
      <div className="fn-manifest-row">
        <span className="fn-dir in">进</span>
        <span className="fn-manifest-code">item: MenuItem</span>
        <span className="fn-manifest-tag">必须是菜单上的一项</span>
      </div>
      <div className="fn-manifest-row">
        <span className="fn-dir in">进</span>
        <span className="fn-manifest-code">size: Size</span>
        <span className="fn-manifest-tag">杯型,三选一</span>
      </div>
      <div className="fn-manifest-row">
        <span className="fn-dir in opt">进?</span>
        <span className="fn-manifest-code">toppings?: Topping[]</span>
        <span className="fn-manifest-tag">配料,可以不带</span>
      </div>
      <div className="fn-manifest-row out">
        <span className="fn-dir ret">出</span>
        <span className="fn-manifest-code">: Order</span>
        <span className="fn-manifest-tag">保证交付一张完整订单</span>
      </div>
    </div>
  );
}

/* ================= SignatureAnatomy ================= */

interface SigSeg {
  k: string;
  s: string;
  name: string;
  info: ReactNode;
}

const SIG_SEGS: SigSeg[] = [
  {
    k: "name",
    s: "function makeOrder(",
    name: "函数名 · 货单抬头",
    info: (
      <>
        这张货单叫什么。名字用<b>动词短语</b>,一眼看出这单是干什么的 ——
        makeOrder、addTopping、calcTotal。开门括号一开,进货栏正式开始。
      </>
    ),
  },
  {
    k: "p1",
    s: "item: MenuItem",
    name: "参数 · 名字: 类型",
    info: (
      <>
        进货第一件。冒号左边是<b>参数名</b>(函数体里怎么称呼它),右边是
        <b>类型</b>(调用方必须交出什么形状的货)。交来的东西不像
        MenuItem?货单当场打回,编译不过。
      </>
    ),
  },
  {
    k: "p2",
    s: ", size: Size",
    name: "参数 · 字面量联合",
    info: (
      <>
        Size 是 <code>&quot;small&quot; | &quot;medium&quot; |
        &quot;large&quot;</code> —— 三个词以外的字符串一律拒收,连
        <code>&quot;Large&quot;</code>(大写打头)都不行。这种「N
        选一」的类型,03 章整章都在跟它打交道。
      </>
    ),
  },
  {
    k: "p3",
    s: ", toppings?: Topping[]",
    name: "可选参数 · 带 ? 的格子",
    info: (
      <>
        名字后面挂个 <code>?</code>:这一格<b>可以整个不填</b>。但天下没有免费的
        ?—— 函数体里它的类型是 <code>Topping[] | undefined</code>,
        用之前得先确认「到底带没带」。另外可选参数必须排在必选参数
        <b>后面</b>,原因见 §02 的警告牌。
      </>
    ),
  },
  {
    k: "ret",
    s: "): Order",
    name: "返回值类型 · 出货栏",
    info: (
      <>
        关门括号后面的 <code>: Order</code> 是<b>出货保证</b>:函数体里少
        return 一个字段、类型对不上,当场被抓;调用方拿到结果,
        闭着眼当 Order 用。就算 TS 能推断出来,公共函数也建议写上 ——
        它同时是文档和闸门。
      </>
    ),
  },
];

export function SignatureAnatomy() {
  const [sel, setSel] = useState(1);
  const seg = SIG_SEGS[sel];

  return (
    <div className="fn-sig">
      <div className="fn-sig-bar" role="group" aria-label="函数签名分段解剖">
        {SIG_SEGS.map((s, i) => (
          <button
            key={s.k}
            type="button"
            data-k={s.k}
            className={`fn-sig-seg${sel === i ? " on" : ""}`}
            onClick={() => setSel(i)}
          >
            {s.s}
          </button>
        ))}
      </div>
      <div className="fn-sig-info" aria-live="polite">
        <div className="fn-sig-info-head">
          <span className="fn-sig-info-code">{seg.s}</span>
          <b>{seg.name}</b>
        </div>
        <p>{seg.info}</p>
      </div>
    </div>
  );
}

/* ================= CallCheck ================= */

interface CcCase {
  id: string;
  code: string;
  ok: boolean;
  /** 编译器原话(报错时) */
  err?: string;
  why: ReactNode;
}

const CC_CASES: CcCase[] = [
  {
    id: "no-topping",
    code: 'makeOrder(milkTea, "large")',
    ok: true,
    why: (
      <>
        toppings 带 <code>?</code>,整格不填完全合法 —— 一杯不加料的大杯,
        天经地义。返回值照样是一张完整的 Order。
      </>
    ),
  },
  {
    id: "missing-size",
    code: "makeOrder(milkTea)",
    ok: false,
    err: "Expected 2-3 arguments, but got 1.",
    why: (
      <>
        size 没有 <code>?</code>,是必填格。货单要求「至少 2 件、至多 3
        件」进货,你只交了 1 件 —— 编译器连范围都替你数好了。
      </>
    ),
  },
  {
    id: "wrong-size",
    code: 'makeOrder(milkTea, "grande")',
    ok: false,
    err: `Argument of type '"grande"' is not assignable to parameter of type 'Size'.`,
    why: (
      <>
        Size 只认 small / medium / large 三个词。&quot;grande&quot;
        是隔壁咖啡店的黑话 —— 字面量联合就是这么较真,错一个字母都进不来。
      </>
    ),
  },
  {
    id: "with-toppings",
    code: 'makeOrder(milkTea, "medium", ["珍珠", "布丁"])',
    ok: true,
    why: (
      <>
        第三格要的是 <code>Topping[]</code>:一个数组,里面每一项都得是
        Topping 联合里的词。「珍珠」「布丁」都在册 —— 放行。
      </>
    ),
  },
  {
    id: "string-item",
    code: 'makeOrder("茉莉奶绿", "large")',
    ok: false,
    err: "Argument of type 'string' is not assignable to parameter of type 'MenuItem'.",
    why: (
      <>
        第一格要的是<b>一件商品的完整形状</b>(id、name、price),
        不是商品名字符串。名字对了没用 —— 编译器看形状,不看意思。
      </>
    ),
  },
  {
    id: "bare-topping",
    code: 'makeOrder(milkTea, "large", "珍珠")',
    ok: false,
    err: "Argument of type 'string' is not assignable to parameter of type 'Topping[]'.",
    why: (
      <>
        就加一样配料,也得装袋:<code>[&quot;珍珠&quot;]</code>。
        第三格的类型是数组,单个字符串和「装着一个字符串的数组」
        在类型系统眼里是两种东西。
      </>
    ),
  },
];

export function CallCheck() {
  // 记录每题的猜测:true = 猜「能过」,false = 猜「报错」
  const [guesses, setGuesses] = useState<Record<string, boolean>>({});
  const solved = CC_CASES.filter((c) => guesses[c.id] === c.ok).length;
  const tried = Object.keys(guesses).length;

  return (
    <div className="viz fn-cc">
      <div className="viz-title">
        调用体检机:先猜,再看编译器怎么说
        <span className="mono dim fn-cc-score">
          猜对 {solved} / {tried === 0 ? CC_CASES.length : CC_CASES.length}
        </span>
      </div>
      <div className="fn-cc-sig mono" aria-label="被体检的签名">
        <span className="dim">{"// 菜单上现成有一杯:"}</span>
        {"\n"}declare const milkTea: MenuItem;
        {"\n\n"}function makeOrder(item: MenuItem, size: Size, toppings?:
        Topping[]): Order
      </div>
      <div className="fn-cc-list">
        {CC_CASES.map((c, i) => {
          const g = guesses[c.id];
          const answered = g !== undefined;
          const right = g === c.ok;
          return (
            <div
              key={c.id}
              className={`fn-cc-item${answered && right ? " solved" : ""}`}
            >
              <div className="fn-cc-head">
                <span className="fn-cc-n">{i + 1}</span>
                <code className="fn-cc-code">{c.code}</code>
                <span className="fn-cc-btns">
                  <button
                    type="button"
                    className={`fn-cc-btn pass${
                      answered && g === true
                        ? c.ok
                          ? " right"
                          : " wrong"
                        : ""
                    }`}
                    onClick={() =>
                      setGuesses((p) => ({ ...p, [c.id]: true }))
                    }
                  >
                    ✓ 能过
                  </button>
                  <button
                    type="button"
                    className={`fn-cc-btn stop${
                      answered && g === false
                        ? !c.ok
                          ? " right"
                          : " wrong"
                        : ""
                    }`}
                    onClick={() =>
                      setGuesses((p) => ({ ...p, [c.id]: false }))
                    }
                  >
                    ✕ 报错
                  </button>
                </span>
              </div>
              {answered && (
                <div
                  className={`fn-cc-fb ${right ? "ok" : "no"}`}
                  aria-live="polite"
                >
                  <p className="fn-cc-verdict">
                    {right ? "✓ 猜对了。" : "✕ 猜反了。"}
                    {c.ok ? (
                      <>这一单<b>编译通过</b>。</>
                    ) : (
                      <>这一单<b>被编译器拦下</b>。</>
                    )}
                  </p>
                  {c.err && <div className="fn-cc-err mono">{c.err}</div>}
                  <p className="fn-cc-why">{c.why}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="viz-msg">
        六单全审完,你就有了<b>编译器的眼睛</b>:看到调用,先在脑子里对一遍货单。
      </div>
    </div>
  );
}
