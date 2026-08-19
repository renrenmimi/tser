"use client";

// 第 02 章专属可视化(双语:文案用 <T en zh />,代码、类型名与编译器报错原文保持不变):
//  - HeroManifest:hero 里那张「函数签名 = 进出清单」(纯装饰)。
//  - SignatureAnatomy:函数签名解剖台 —— 逐段点击,右侧讲解(承 01 章解剖台交互)。
//  - CallCheck:调用体检机 —— 六种调用先猜「能不能过」,点选即判,附编译器原话。
//
// 所有报错文案均在 TypeScript 5.9 + strict 下实测过。

import { useState, type ReactNode } from "react";
import { T, useL } from "@/lib/i18n";

/* ================= HeroManifest ================= */

export function HeroManifest() {
  return (
    <div className="fn-manifest" aria-hidden>
      <div className="fn-manifest-stamp">SIGNATURE</div>
      <div className="fn-manifest-title">
        <T en="IN AND OUT · makeOrder" zh="进出清单 · makeOrder" />
      </div>
      <div className="fn-manifest-row">
        <span className="fn-dir in">
          <T en="IN" zh="进" />
        </span>
        <span className="fn-manifest-code">item: MenuItem</span>
        <span className="fn-manifest-tag">
          <T en="one item from the menu" zh="菜单上的一项" />
        </span>
      </div>
      <div className="fn-manifest-row">
        <span className="fn-dir in">
          <T en="IN" zh="进" />
        </span>
        <span className="fn-manifest-code">size: Size</span>
        <span className="fn-manifest-tag">
          <T en="one of three sizes" zh="杯型,三选一" />
        </span>
      </div>
      <div className="fn-manifest-row">
        <span className="fn-dir in opt">
          <T en="IN?" zh="进?" />
        </span>
        <span className="fn-manifest-code">toppings?: Topping[]</span>
        <span className="fn-manifest-tag">
          <T en="toppings, may be omitted" zh="配料,可以不带" />
        </span>
      </div>
      <div className="fn-manifest-row out">
        <span className="fn-dir ret">
          <T en="OUT" zh="出" />
        </span>
        <span className="fn-manifest-code">: Order</span>
        <span className="fn-manifest-tag">
          <T en="always one complete order" zh="保证交出一张完整订单" />
        </span>
      </div>
    </div>
  );
}

/* ================= SignatureAnatomy ================= */

interface SigSeg {
  k: string;
  /** 签名片段本身是代码,不翻译 */
  s: string;
  name: ReactNode;
  info: ReactNode;
}

const SIG_SEGS: SigSeg[] = [
  {
    k: "name",
    s: "function makeOrder(",
    name: <T en="Function name" zh="函数名" />,
    info: (
      <T
        en={
          <>
            What this function is called. A <b>verb phrase</b> reads best,
            because a call site should say what happens: makeOrder,
            addTopping, calcTotal. The opening parenthesis starts the
            parameter list.
          </>
        }
        zh={
          <>
            这个函数叫什么。用<b>动词短语</b>最好读,
            因为调用处应该一眼看出发生了什么:makeOrder、addTopping、calcTotal。
            开门括号一开,参数列表就开始了。
          </>
        }
      />
    ),
  },
  {
    k: "p1",
    s: "item: MenuItem",
    name: <T en="Parameter · name: type" zh="参数 · 名字: 类型" />,
    info: (
      <T
        en={
          <>
            Left of the colon is the <b>parameter name</b>, which is how the
            body refers to the value. Right of the colon is the <b>type</b>,
            which is the shape the caller has to provide. Pass something that
            is not a MenuItem and the call does not compile.
          </>
        }
        zh={
          <>
            冒号左边是<b>参数名</b>,函数体里用这个名字称呼它;
            右边是<b>类型</b>,也就是调用方必须交出的形状。
            传一个不是 MenuItem 的东西进来,这次调用就编译不过。
          </>
        }
      />
    ),
  },
  {
    k: "p2",
    s: ", size: Size",
    name: <T en="Parameter · a literal union" zh="参数 · 字面量联合" />,
    info: (
      <T
        en={
          <>
            Size is{" "}
            <code>
              &quot;small&quot; | &quot;medium&quot; | &quot;large&quot;
            </code>
            . Any other string is rejected, including{" "}
            <code>&quot;Large&quot;</code> with a capital letter. Chapter 03 is
            about working with types like this one.
          </>
        }
        zh={
          <>
            Size 是{" "}
            <code>
              &quot;small&quot; | &quot;medium&quot; | &quot;large&quot;
            </code>
            。这三个词以外的字符串一律拒收,连大写开头的{" "}
            <code>&quot;Large&quot;</code> 都不行。03 章整章都在跟这种类型打交道。
          </>
        }
      />
    ),
  },
  {
    k: "p3",
    s: ", toppings?: Topping[]",
    name: <T en="Optional parameter · the ?" zh="可选参数 · 带 ? 的格子" />,
    info: (
      <T
        en={
          <>
            A <code>?</code> after the name means the argument{" "}
            <b>may be left out</b>. The cost is inside the function: the type
            there is <code>Topping[] | undefined</code>, so you have to check
            before using it. An optional parameter must also come{" "}
            <b>after</b> every required one — §02 explains why.
          </>
        }
        zh={
          <>
            名字后面挂一个 <code>?</code>,表示这个实参<b>可以整个不写</b>。
            代价在函数体里:那里它的类型是{" "}
            <code>Topping[] | undefined</code>,用之前得先检查。
            可选参数还必须排在所有必选参数<b>后面</b> —— 原因见 §02。
          </>
        }
      />
    ),
  },
  {
    k: "ret",
    s: "): Order",
    name: <T en="Return type" zh="返回值类型" />,
    info: (
      <T
        en={
          <>
            The <code>: Order</code> after the closing parenthesis is what the
            function promises to produce. Return an object missing a field and
            the error is reported here, at the definition. TypeScript could
            infer this, but writing it on a function other code calls keeps
            the promise stable — see the callout in §01.
          </>
        }
        zh={
          <>
            关门括号后面的 <code>: Order</code> 是这个函数承诺交出的东西。
            return 的对象少一个字段,错误就报在这里、报在定义处。
            TypeScript 本来能推断出它,
            但在会被别人调用的函数上写出来,这份承诺才稳定 —— 见 §01 的提示框。
          </>
        }
      />
    ),
  },
];

export function SignatureAnatomy() {
  const L = useL();
  const [sel, setSel] = useState(1);
  const seg = SIG_SEGS[sel];

  return (
    <div className="fn-sig">
      <div
        className="fn-sig-bar"
        role="group"
        aria-label={L({
          en: "The signature, split into parts",
          zh: "函数签名分段解剖",
        })}
      >
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
  /** 调用代码,不翻译 */
  code: string;
  ok: boolean;
  /** 编译器原话(报错时),两种语言下都保持英文原文 */
  err?: string;
  why: ReactNode;
}

const CC_CASES: CcCase[] = [
  {
    id: "no-topping",
    code: 'makeOrder(milkTea, "large")',
    ok: true,
    why: (
      <T
        en={
          <>
            toppings carries a <code>?</code>, so leaving it out is allowed.
            Inside the function toppings is <code>undefined</code>, and the
            return value is still a complete Order.
          </>
        }
        zh={
          <>
            toppings 带了 <code>?</code>,所以整个不写是允许的。
            函数体里 toppings 是 <code>undefined</code>,
            返回值仍然是一张完整的 Order。
          </>
        }
      />
    ),
  },
  {
    id: "missing-size",
    code: "makeOrder(milkTea)",
    ok: false,
    err: "Expected 2-3 arguments, but got 1.",
    why: (
      <T
        en={
          <>
            size has no <code>?</code>, so it is required. Two parameters are
            required and one is optional, which is where the range 2-3 in the
            message comes from.
          </>
        }
        zh={
          <>
            size 没有 <code>?</code>,是必填的。
            两个必选参数加一个可选参数 —— 报错里那个 2-3 的范围就是这么来的。
          </>
        }
      />
    ),
  },
  {
    id: "wrong-size",
    code: 'makeOrder(milkTea, "grande")',
    ok: false,
    err: `Argument of type '"grande"' is not assignable to parameter of type 'Size'.`,
    why: (
      <T
        en={
          <>
            Size accepts exactly three strings: small, medium, large.
            &quot;grande&quot; is not one of them. A literal union compares the
            whole string, so one different letter is already a different type.
          </>
        }
        zh={
          <>
            Size 只认三个字符串:small、medium、large。
            &quot;grande&quot; 不在其中。字面量联合比的是整个字符串,
            差一个字母就已经是另一个类型了。
          </>
        }
      />
    ),
  },
  {
    id: "with-toppings",
    code: 'makeOrder(milkTea, "medium", ["boba", "pudding"])',
    ok: true,
    why: (
      <T
        en={
          <>
            The third parameter wants a <code>Topping[]</code>: an array whose
            every element is one of the Topping strings. Both values are on
            that list.
          </>
        }
        zh={
          <>
            第三个参数要的是 <code>Topping[]</code>:
            一个数组,里面每一项都得是 Topping 联合里的字符串。
            这两个值都在册。
          </>
        }
      />
    ),
  },
  {
    id: "string-item",
    code: 'makeOrder("Jasmine Milk Green", "large")',
    ok: false,
    err: "Argument of type 'string' is not assignable to parameter of type 'MenuItem'.",
    why: (
      <T
        en={
          <>
            The first parameter wants the <b>whole shape</b> of a menu item:
            id, name, price. A product name on its own is only a string. The
            compiler compares shapes, not meanings — chapter 04 is about that.
          </>
        }
        zh={
          <>
            第一个参数要的是一件商品的<b>完整形状</b>:id、name、price。
            光一个商品名只是个字符串。编译器比的是形状,不是意思 ——
            04 章专门讲这件事。
          </>
        }
      />
    ),
  },
  {
    id: "bare-topping",
    code: 'makeOrder(milkTea, "large", "boba")',
    ok: false,
    err: "Argument of type 'string' is not assignable to parameter of type 'Topping[]'.",
    why: (
      <T
        en={
          <>
            Even a single topping has to be wrapped:{" "}
            <code>[&quot;boba&quot;]</code>. The third parameter is an array
            type, and one string is not the same type as an array holding one
            string.
          </>
        }
        zh={
          <>
            就算只加一样配料,也得装进数组:
            <code>[&quot;boba&quot;]</code>。第三个参数的类型是数组,
            而「一个字符串」和「装着一个字符串的数组」是两种类型。
          </>
        }
      />
    ),
  },
];

export function CallCheck() {
  const L = useL();
  // 记录每题的猜测:true = 猜「能过」,false = 猜「报错」
  const [guesses, setGuesses] = useState<Record<string, boolean>>({});
  const solved = CC_CASES.filter((c) => guesses[c.id] === c.ok).length;

  return (
    <div className="viz fn-cc">
      <div className="viz-title">
        <T
          en="Guess first, then read what the compiler says"
          zh="调用体检机:先猜,再看编译器怎么说"
        />
        <span className="mono dim fn-cc-score">
          <T en="correct" zh="猜对" /> {solved} / {CC_CASES.length}
        </span>
      </div>
      <div
        className="fn-cc-sig mono"
        aria-label={L({
          en: "The signature under test",
          zh: "被体检的签名",
        })}
      >
        <span className="dim">
          <T
            en={"// one drink is already on the menu:"}
            zh={"// 菜单上现成有一杯:"}
          />
        </span>
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
                    ✓ <T en="Compiles" zh="能过" />
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
                    ✕ <T en="Error" zh="报错" />
                  </button>
                </span>
              </div>
              {answered && (
                <div
                  className={`fn-cc-fb ${right ? "ok" : "no"}`}
                  aria-live="polite"
                >
                  <p className="fn-cc-verdict">
                    {right ? (
                      <T en="✓ Correct. " zh="✓ 猜对了。" />
                    ) : (
                      <T en="✕ Not quite. " zh="✕ 猜反了。" />
                    )}
                    {c.ok ? (
                      <T
                        en={
                          <>
                            This call <b>compiles</b>.
                          </>
                        }
                        zh={
                          <>
                            这一次调用<b>编译通过</b>。
                          </>
                        }
                      />
                    ) : (
                      <T
                        en={
                          <>
                            This call is <b>rejected</b>.
                          </>
                        }
                        zh={
                          <>
                            这一次调用<b>被编译器拦下</b>。
                          </>
                        }
                      />
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
        <T
          en={
            <>
              Once all six make sense, you have{" "}
              <b>the compiler&apos;s habit</b>: when you read a call, you check
              it against the signature before you run anything.
            </>
          }
          zh={
            <>
              六单全审完,你就有了<b>编译器的习惯</b>:
              看到一次调用,先在脑子里对一遍签名,再去运行。
            </>
          }
        />
      </div>
    </div>
  );
}
