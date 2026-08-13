"use client";

// 第 01 章 · 基础类型与推断 ——
// 身份证比喻 → 原始类型证件墙 → 数组与对象 → 注解 vs 推断(放大镜)→
// 字面量与拓宽 → any 的诱惑 → 奶茶店案例 → 三个坑 → 动手 → 测验 → 要点。

import "./chapter.css";

import {
  Hero,
  Section,
  Callout,
  KeyPoints,
  ChapterFooter,
} from "@/lib/kit";
import { CodeBlock, CodePair } from "@/lib/code";
import { LabSet } from "@/lib/labs";
import { Quiz } from "@/lib/quiz";
import { LABS, QUIZ } from "@/lib/types-data";
import { HeroIdCards, IdWall, InferenceLens } from "./viz";

/* ---------- §03 数组与对象 ---------- */

const ARR_CODE = `const sizes: string[] = ["small", "medium", "large"];
const prices: number[] = [12, 18, 22];

// 同一个意思的另一种写法(泛型语法,05 章细讲):
const toppings: Array<string> = ["珍珠", "椰果", "芋圆"];`;

const OBJ_CODE = `// 对象类型:把每个属性的类型写进花括号,就是一份「形状」
const drink: { name: string; price: number } = {
  name: "杨枝甘露",
  price: 22,
};

// 形状可以嵌套、可以装进数组:
const combo: { title: string; items: string[] } = {
  title: "下午茶双杯",
  items: ["四季春", "多肉葡萄"],
};`;

/* ---------- §04 注解 vs 推断 ---------- */

const BOUNDARY_CODE = `// 边界之内:推断就够了 —— 一个冒号都不用写
const basePrice = 18;
const withTopping = basePrice + 3;

// 边界之上:注解写清楚 —— 这是给调用者的承诺
function applyDiscount(price: number, rate: number): number {
  return Math.round(price * rate);
}

// 先声明、后赋值:推断没材料,得你来说
let firstOrder: string;
if (Math.random() > 0.5) firstOrder = "四季春";
else firstOrder = "多肉葡萄";`;

/* ---------- §05 字面量与拓宽 ---------- */

const LITERAL_CODE = `let size1 = "small";    // 推断:string(let 会拓宽)
const size2 = "small";  // 推断:"small"(const 锁死为字面量)

// 字面量类型单独用不大,联合起来就是大杀器:
type Size = "small" | "medium" | "large";

let cup: Size = "medium"; // ✓ 在名单上
cup = "large";            // ✓ 在名单上
cup = "mega";             // ✗ Type '"mega"' is not
                          //   assignable to type 'Size'.`;

/* ---------- §06 any ---------- */

const ANY_CODE = `let data: any = JSON.parse('{"price": 22}');

const total = data.prise * 2;    // 拼错了,没人吭声 —— any 关掉了检查
const label = total.toUpperCase(); // total 也被传染成 any,继续沉默

// 运行到这里才炸:total.toUpperCase is not a function
console.log(label);`;

/* ---------- §07 奶茶店案例 ---------- */

const MENU_INFER = `// 什么注解都不写,推断已经很能打:
const menu = [
  { name: "杨枝甘露", price: 22, sizes: ["medium", "large"], soldOut: false },
  { name: "四季春", price: 12, sizes: ["small", "medium", "large"], soldOut: false },
];
// hover menu:{ name: string; price: number;
//              sizes: string[]; soldOut: boolean }[]`;

const MENU_PLAIN = `// 不注解:错字混进了菜单,推断照单全收
const menu = [
  { name: "杨枝甘露", price: 22, soldOut: false },
  { name: "四季春", prise: 12, soldOut: false },
];

// 直到很远的下游,错误才炸出来,而且报得很绕:
const cheap = menu.filter((m) => m.price < 15);
// error TS18048: 'm.price' is possibly 'undefined'.
//
// 为什么是「可能没有」而不是「不存在」?TS 把数组里两个对象字面量
// 归一成一个联合类型,各自缺的属性会被补上并标成可选 ——
// 于是 price 的类型成了 number | undefined。`;

const MENU_TYPED = `// 注解在边界上:菜单是全店共用的数据,值得立一份形状
type MenuItem = {
  name: string;
  price: number;
  soldOut: boolean;
};

const menu: MenuItem[] = [
  { name: "杨枝甘露", price: 22, soldOut: false },
  { name: "四季春", prise: 12, soldOut: false },
  //                ~~~~~ 错误当场落在错字上:
  // Object literal may only specify known properties,
  // but 'prise' does not exist in type 'MenuItem'.
  // Did you mean to write 'price'?
];`;

/* ---------- §08 三个坑 ---------- */

const EMPTY_ARR_CODE = `const toppings = [];        // 推断只能记成 any[] —— 空箱子看不出装什么

function newCart() {
  const items = [];         // noImplicitAny 下,跨出函数就报:
  return items;             // Variable 'items' implicitly has an 'any[]' type.
}

const safe: string[] = [];  // ✓ 空箱子出生就贴标签,后面 push 错的全拦住`;

export default function TypesPage() {
  return (
    <main className="page" data-ch="types">
      <Hero
        ch="types"
        title={
          <>
            给每个值一张<span className="grad">身份证</span>
          </>
        }
        essence={
          <>
            string、number、boolean……类型没多神秘,就是每个值随身带的证件。
            更妙的是:大多数证件不用你去办 —— TypeScript
            看一眼值,自己就把证发了。这手本事叫推断。
          </>
        }
        chips={[
          { id: "idcard", n: "01", label: "身份证比喻" },
          { id: "prims", n: "02", label: "原始类型" },
          { id: "shapes", n: "03", label: "数组与对象" },
          { id: "infer", n: "04", label: "注解 vs 推断" },
          { id: "literal", n: "05", label: "字面量与拓宽" },
          { id: "any", n: "06", label: "any 的诱惑" },
          { id: "milktea", n: "07", label: "奶茶店案例" },
          { id: "pitfalls", n: "08", label: "三个坑" },
          { id: "labs", n: "09", label: "动手" },
          { id: "quiz", n: "10", label: "测验" },
        ]}
      >
        <HeroIdCards />
      </Hero>

      {/* ================= §01 身份证比喻 ================= */}
      <Section
        id="idcard"
        index="01"
        title="每个值,发一张身份证"
        desc="这一章的全部内容,都长在这一个比喻上。"
      >
        <Callout tone="story" title="奶茶店的进货间">
          <p>
            你是店长。进货间堆着几十个箱子,每个箱子上贴着标签:
            「珍珠 · 袋装 · 5kg」「椰浆 · 罐装 · 易腐」。
            <b>不用开箱,你就知道每箱能干什么、不能干什么</b> ——
            椰浆不能存到下个月,珍珠不能直接倒进冰沙机。
          </p>
          <p>
            TypeScript 给程序里的每个值也贴这么一张标签,学名叫
            <b>类型(type)</b>:name 这一栏是 string,price 这一栏是
            number。之后你每次用这个值,编译器都先看一眼证件:拿 string
            去做乘法?证件对不上,红线。
          </p>
          <p>
            最舒服的是:<b>大多数证件不用你办</b>。写下{" "}
            <code>let price = 22</code>,TS 看一眼右边的 22,证就发好了 ——
            这叫<b>推断(inference)</b>。你只在少数地方需要亲手填表,
            也就是<b>注解(annotation)</b>,§04 讲清楚哪些地方。
          </p>
        </Callout>
        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">公民</div>
            <div className="card-title">值(value)</div>
            <p>
              程序里真实存在的东西:22、&quot;四季春&quot;、一个订单对象。
              运行时真正干活的是它们。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">身份证</div>
            <div className="card-title">类型(type)</div>
            <p>
              对值的形状描述:是什么、有哪些字段。只活在编译期,
              序章说过 —— 编译完就被擦除。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">派出所</div>
            <div className="card-title">编译器(tsc)</div>
            <p>
              发证(推断)+ 查证(检查)。查出证件对不上的操作,
              当场红线,不放行。
            </p>
          </div>
        </div>
      </Section>

      {/* ================= §02 原始类型 ================= */}
      <Section
        id="prims"
        index="02"
        title="原始类型:七户常住人口"
        desc="string、number、boolean 你天天见;null 和 undefined 是两种「没有」;bigint、symbol 混个脸熟。点一个值试试。"
      >
        <IdWall />
        <Callout tone="idea" title="先认前五户,后两户路过打个招呼">
          <p>
            日常写码 95% 的时间在跟 string、number、boolean、null、undefined
            打交道。<b>null 和 undefined 的区别值得记一句</b>:undefined
            是「系统默认的没有」(没赋值、没这个属性),null
            是「人主动放的没有」(明确表示空)。bigint 和 symbol
            这两户,等真遇到再回来查,不影响后面任何章节。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 数组与对象 ================= */}
      <Section
        id="shapes"
        index="03"
        title="装起来:数组与对象的形状"
        desc="单个值有证,一箱值也得有证 —— 数组写元素类型,对象写每个属性的类型。"
      >
        <CodeBlock
          lang="ts"
          title="数组:元素类型 + []"
          code={ARR_CODE}
          note={
            <>
              <code>string[]</code> 读作「string 的数组」。
              <code>Array&lt;string&gt;</code> 是同一个意思的泛型写法 ——
              简单类型社区习惯用前者,读着顺。
            </>
          }
        />
        <CodeBlock
          lang="ts"
          title="对象:花括号里描形状"
          code={OBJ_CODE}
          note={
            <>
              <code>{"{ name: string; price: number }"}</code>{" "}
              整个就是一个类型,叫<b>对象类型字面量</b>。属性之间用分号隔开。
              形状能嵌套、能进数组 —— 真实项目的数据几乎全是这两招搭出来的。
              (可选属性 <code>?</code>、interface 和 type 的写法,下一章整章讲。)
            </>
          }
        />
      </Section>

      {/* ================= §04 注解 vs 推断 ================= */}
      <Section
        id="infer"
        index="04"
        title="注解 vs 推断:什么时候要你亲手写"
        desc="注解是承诺,推断是观察。先用放大镜看看编译器自己能看出多少。"
      >
        <InferenceLens />
        <p className="sec-desc" style={{ marginTop: 18 }}>
          看明白了吧:局部变量这种「左手赋值右手用」的场合,推断全包了。
          那注解该写在哪?一句话:<b>写在边界上</b> ——
          凡是「别人要用」或「推断没材料」的地方。
        </p>
        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">边界一</div>
            <div className="card-title">函数参数与返回值</div>
            <p>
              参数是外面塞进来的,推断没材料,<b>必须写</b>;
              返回值可以推断,但写出来是给调用者的承诺,公共函数建议写。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">边界二</div>
            <div className="card-title">公共 API / 共享数据</div>
            <p>
              导出的常量、全店共用的菜单结构 —— 立一份类型当契约,
              谁塞错东西谁当场领红线。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">边界三</div>
            <div className="card-title">先声明,后赋值</div>
            <p>
              声明那一刻右边没有值,推断巧妇难为无米之炊 ——
              这时你得亲口说这个变量将来装什么。
            </p>
          </div>
        </div>
        <CodeBlock
          lang="ts"
          title="boundary.ts · 三种边界一次看"
          code={BOUNDARY_CODE}
          hl={[6]}
          note={
            <>
              <b>注解是承诺,推断是观察。</b>观察够用的地方别写注解 ——
              到处写冒号不是严谨,是噪音(§08 还会说它)。
            </>
          }
        />
      </Section>

      {/* ================= §05 字面量与拓宽 ================= */}
      <Section
        id="literal"
        index="05"
        title="字面量类型与拓宽:证件能精确到「这一个值」"
        desc="刚才放大镜里 let 和 const 的差别,值得单独立一节 —— 它是第 03 章联合类型的入口。"
      >
        <p className="sec-desc">
          TS 的证件系统有个精度旋钮:可以粗到「是个字符串」,也可以细到
          「就是 &quot;small&quot; 这个字符串」。后者叫
          <b>字面量类型(literal type)</b>。let 声明会把字面量放宽成
          string,这个动作叫<b>拓宽(widening)</b>;const 则把类型锁在
          字面量上。为什么这么设计?因为 let 的变量<b>本来就是要改的</b>,
          锁太死反而没法用。
        </p>
        <CodeBlock
          lang="ts"
          title="size.ts · 奶茶店的杯型名单"
          code={LITERAL_CODE}
          hl={[9]}
          note={
            <>
              <code>&quot;small&quot; | &quot;medium&quot; |
              &quot;large&quot;</code> 读作「三者之一」——
              这就是<b>字面量联合</b>:把「只能取这几个值」写进类型,
              错杯型在保存那一刻就被拦下。竖线 <code>|</code>
              (联合类型)是第 03 章的主角,这里先混个脸熟。
            </>
          }
        />
        <Callout tone="deep" title="为什么这招比 string 强这么多?">
          <p>
            用 string 存杯型,「mega」「中杯」「LARGE」都合法 ——
            写错的代价照旧发生在运行时。用字面量联合,名单之外的值
            <b>编译期直接死刑</b>。把合法值收得越窄,编译器替你挡的就越多:
            这是贯穿全书的心法,03 章开始大规模发挥。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 any ================= */}
      <Section
        id="any"
        index="06"
        title="any 的诱惑:一支关掉安检的对讲机"
        desc="any 不是「任意类型」,是「别检查我」。它还会传染。"
      >
        <CodeBlock
          lang="ts"
          title="any.ts · 传染现场"
          code={ANY_CODE}
          hl={[3, 4]}
          note={
            <>
              高亮两行都藏着雷:prise 拼错了没人管;total 被传染成
              any,拿数字调 <code>toUpperCase()</code> 也没人管。
              两个错都熬到了运行时 —— 和裸写 JS 一模一样。
            </>
          }
        />
        <Callout tone="warn" title="any 的两宗罪">
          <p>
            <b>一,关检查:</b>值一旦是 any,对它做任何事编译器都放行 ——
            拼错属性、错用方法、乱传参数,全部沉默。
            <b>二,会传染:</b>从 any 值上取的属性、算出的结果、传进的回调,
            统统变成 any,像一滴墨掉进水杯。写一个 any,污染一整条数据流。
          </p>
          <p>
            那彻底不用?也不必走极端 —— 临时救急、渐进迁移老项目时它有用
            (终章专门讨论「何时 any 合理」)。原则是:<b>能不用就不用,
            用了要有意识</b>。顺带预告:有个安全版替身叫{" "}
            <code>unknown</code> ——「先验明正身,才许使用」,03 章见。
          </p>
        </Callout>
        <p className="sec-desc">
          还有一种更隐蔽的 any:你没写,它自己长出来的 ——
          比如没标类型的函数参数。strict 家族里的{" "}
          <code>noImplicitAny</code>{" "}
          专治这个:凡是「偷偷变 any」的地方一律红线。Playground 默认开着
          strict,所以你在 Labs 里会亲眼见到它工作。
        </p>
      </Section>

      {/* ================= §07 奶茶店案例 ================= */}
      <Section
        id="milktea"
        index="07"
        title="奶茶店开工:给菜单发证"
        desc="全书贯穿案例第一集 —— 推断和注解各站什么岗,一个例子看明白。"
      >
        <CodeBlock
          lang="ts"
          title="menu.ts · 第一步:先让推断干活"
          code={MENU_INFER}
          note={
            <>
              一个注解没写,TS 已经把菜单的形状完整推出来了 ——
              局部够用。但菜单不是局部变量:它是<b>全店共用的公共数据</b>
              ,点单、结算、库存都要读它。这就到「边界」了。
            </>
          }
        />
        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title="不注解 · 错误在下游爆炸"
              code={MENU_PLAIN}
              hl={[4, 8]}
              note={
                <>
                  推断照单全收:prise 也被当成合法字段记进类型。
                  错误直到 filter 用到 price 时才炸,而且报错落在
                  <b>无辜的下游代码</b>上。
                </>
              }
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title="注解 MenuItem[] · 错误当场落网"
              code={MENU_TYPED}
              hl={[10]}
              note={
                <>
                  立了 MenuItem 这份契约后,错误<b>精确落在错字那一行</b>,
                  还附赠改法。这就是「注解写在边界上」的回报:
                  出错地点 = 犯错地点。
                </>
              }
            />
          }
        />
        <Callout tone="win" title="本集小结">
          <p>
            局部变量交给推断,共享数据立契约 —— MenuItem
            这份形状会跟着我们走完全书:03 章给它加上 Size
            字面量联合和订单状态,05 章用泛型装它,06、07
            章拿工具类型改造它。
          </p>
        </Callout>
      </Section>

      {/* ================= §08 三个坑 ================= */}
      <Section
        id="pitfalls"
        index="08"
        title="三个新手坑,现在就填"
        desc="都是真实项目里反复出现的,每个一分钟。"
      >
        <Callout tone="warn" title="坑一:「: String」不等于「: string」">
          <p>
            大写 String 是 <code>new String()</code>{" "}
            那个古老的<b>包装对象</b>类型,不是原始字符串 ——
            写了它,等着接一串奇怪的兼容问题。<b>口诀:注解一律小写</b>:
            string、number、boolean。大写的 String / Number / Boolean,
            当它们不存在。
          </p>
        </Callout>
        <Callout tone="warn" title="坑二:到处写注解,是噪音不是严谨">
          <p>
            <code>let count: number = 0</code> 这种注解,TS
            看一眼 0 就知道的事你又说了一遍 ——
            白占宽度,还把真正重要的边界注解淹没在冒号海里。
            让推断干它的活,把注解留给 §04 说的三种边界,
            读代码的人反而一眼能看出「哪里是契约」。
          </p>
        </Callout>
        <Callout tone="warn" title="坑三:空数组 [] 会落成 any[]">
          <p>
            空数组没有元素,推断看不出你要装什么,只能记成{" "}
            <code>any[]</code>。TS 会尽量根据后面的 push 猜(所谓「演化数组」
            的小聪明),但一旦跨出函数、或者先用后填,noImplicitAny
            就会报「implicitly has an &apos;any[]&apos; type」。
            <b>好习惯:空箱子出生就贴标签。</b>
          </p>
        </Callout>
        <CodeBlock
          lang="ts"
          title="empty.ts · 坑三现场"
          code={EMPTY_ARR_CODE}
          hl={[8]}
          note={
            <>
              一行注解 <code>const safe: string[] = []</code>{" "}
              解决全部问题:之后 push 数字、push 对象,统统当场红线。
            </>
          }
        />
      </Section>

      {/* ================= §09 动手任务 ================= */}
      <Section
        id="labs"
        index="09"
        title="动手任务"
        desc="五个任务,全在 Playground 里,十五分钟 —— 推断这件事,hover 一次胜过读十遍。"
      >
        <LabSet ch="types" items={LABS} />
      </Section>

      {/* ================= §10 通关测验 ================= */}
      <Section
        id="quiz"
        index="10"
        title="通关测验"
        desc="八道题,把推断、拓宽、any、空数组一网打尽。全对点亮侧栏绿灯。"
      >
        <Quiz ch="types" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            类型 = 值的身份证;<b>推断 = 编译器自己看得出来</b>,
            大多数局部变量一个冒号都不用写。
          </>,
          <>
            原始类型七户:string / number / boolean / null / undefined
            天天见,bigint / symbol 点头之交;undefined 是「没给过」,
            null 是「主动放空」。
          </>,
          <>
            <b>注解是承诺,推断是观察</b>:注解写在边界上 ——
            函数参数与返回值、公共数据、先声明后赋值。
          </>,
          <>
            let 拓宽(<code>&quot;hi&quot;</code> → string),const
            锁字面量;但 const 锁不住数组和对象的<b>内容</b> ——
            字面量联合(&quot;small&quot; | &quot;medium&quot; |
            &quot;large&quot;)是 03 章的入口。
          </>,
          <>
            any 关检查且会传染,空数组 [] 会落成 any[] ——
            救急可以,常驻不行;noImplicitAny 替你守住暗门。
          </>,
        ]}
      />

      <ChapterFooter ch="types" />
    </main>
  );
}
