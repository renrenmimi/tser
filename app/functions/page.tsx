"use client";

// 第 02 章 · 函数与对象类型 ——
// 函数签名是一份「进出货单」:签名解剖 → 参数三件套 → 函数类型与 void →
// 对象类型进阶 → interface vs type → 奶茶店实战。

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
import { LABS, QUIZ } from "@/lib/functions-data";
import { HeroManifest, SignatureAnatomy, CallCheck } from "./viz";

/* ---------- §01 签名 ---------- */

const S1_JS = `// menu.js —— 全靠脑子记
function makeOrder(item, size, toppings) {
  // item 长什么样?size 能传几种?
  // toppings 可以不传吗?返回什么?
  // —— 答案在三个月前写它的人脑子里
}`;

const S1_TS = `// menu.ts —— 全写在货单上
function makeOrder(
  item: MenuItem,        // 进:菜单上的一项
  size: Size,            // 进:"small" | "medium" | "large"
  toppings?: Topping[],  // 进(可不带):配料清单
): Order {               // 出:一张完整订单
  // …
}`;

const S1_INFER = `function subtotal(prices: number[]) {
  return prices.reduce((sum, p) => sum + p, 0);
}
// 悬停 subtotal,TS 说:function subtotal(prices: number[]): number
// 返回值没写,它顺着 return 语句自己推出来了`;

const S1_ANY_LEAK = `// 危险:返回值推断出 any,顺着调用链一路传染
function loadOrder(json: string) {
  return JSON.parse(json); // JSON.parse 的返回值是 any
}
const order = loadOrder('{"total": 25}');
order.tatol.toFixed(2); // 拼错了!但 order 是 any,编译器一声不吭

// 修法:出货栏写清楚,any 出不了这个门
function loadOrder2(json: string): Order {
  return JSON.parse(json);
}
const order2 = loadOrder2('{"total": 25}');
order2.tatol; // ✕ Property 'tatol' does not exist on type 'Order'.`;

/* ---------- §02 参数三件套 ---------- */

const S2_TRIO = `// ① 可选参数:名字后面加 ?
function makeTea(base: string, topping?: string) {
  // 函数体里,topping 的真实类型是 string | undefined
  return topping ? base + " + " + topping : base;
}
makeTea("乌龙");          // ✓ 不传,合法
makeTea("乌龙", "珍珠");  // ✓

// ② 默认值参数:类型都不用写,TS 从默认值推断
function pourSugar(base: string, sugar = 50) {
  return base + "(" + sugar + "% 糖)"; // sugar: number
}

// ③ rest 参数:来几个收几个,打包成数组
function addToppings(base: string, ...toppings: string[]) {
  return base + " + " + toppings.join(" + ");
}
addToppings("奶绿", "珍珠", "椰果", "布丁"); // 后面三个全进了 toppings`;

const S2_BAD_ORDER = `function bad(topping?: string, base: string) {}
//                             ~~~~
// ✕ A required parameter cannot follow an optional parameter.
//   (必选参数不能跟在可选参数后面)

// 为什么?想象调用 bad("乌龙") ——
// "乌龙" 算 topping 还是 base?没人说得清,干脆立法禁止。`;

const S2_OPT_VS_UNDEF = `function a(topping?: string) {}
function b(topping: string | undefined) {}

a();          // ✓ 可选 = 这一格可以整个不填
b();          // ✕ Expected 1 arguments, but got 0.
b(undefined); // ✓ 必须交表 —— 哪怕填的是「无」`;

/* ---------- §03 函数类型与 void ---------- */

const S3_FNTYPE = `// 函数类型表达式:描述「一个函数长什么样」
type PriceFormatter = (price: number) => string;
//                    ^ 进一个 number,出一个 string

const cny: PriceFormatter = (p) => "¥" + p.toFixed(2);
// p 没写类型,却不是 any —— 从 PriceFormatter 反推出 p: number
// 术语叫按上下文定型(contextual typing)`;

const S3_CALLBACK = `// 回调参数:把「你要交给我一个什么样的函数」也写进货单
function onEachItem(
  items: MenuItem[],
  cb: (item: MenuItem, index: number) => void,
) {
  items.forEach((it, i) => cb(it, i));
}`;

const S3_VOID = `const collected: number[] = [];

[1, 2, 3].forEach((n) => collected.push(n));
// push 返回 number(数组的新长度),
// 而 forEach 想要的回调是 (…) => void —— 居然不报错?`;

const S3_VOID_STRICT = `// 但「亲手声明返回 void」的函数,真返回东西会被抓
function log(msg: string): void {
  return msg.length; // ✕ Type 'number' is not assignable to type 'void'.
}`;

/* ---------- §04 对象类型进阶 ---------- */

const S4_OBJ = `interface MenuItem {
  readonly id: number; // readonly:上架之后,货号不许改
  name: string;
  price: number;
  desc?: string;       // 可选属性:写不写随你
}

const jasmine: MenuItem = { id: 1, name: "茉莉奶绿", price: 16 };

jasmine.price = 18; // ✓ 涨价,可以
jasmine.id = 2;     // ✕ Cannot assign to 'id' because it is
                    //   a read-only property.`;

const S4_INDEX = `// 库存表:今天上什么货、编号是啥,事先说不准 ——
// 但「键是编号(string)、值是件数(number)」这个形状是定死的
interface Inventory {
  [sku: string]: number;
}

const stock: Inventory = { "tea-001": 30, "tea-002": 12 };
stock["tea-003"] = 50;   // ✓ 新编号随便加
stock["tea-001"] = "多"; // ✕ Type 'string' is not assignable to type 'number'.`;

/* ---------- §05 interface vs type ---------- */

const S5_IFACE = `interface MenuItem {
  name: string;
  price: number;
}

// 扩展:extends
interface ToppedItem extends MenuItem {
  toppings: string[];
}`;

const S5_TYPE = `type MenuItem = {
  name: string;
  price: number;
};

// 扩展:交叉类型 &
type ToppedItem = MenuItem & {
  toppings: string[];
};`;

const S5_MERGE = `// declaration merging:同名 interface 自动合并 —— interface 独有

// ⚠ 前提:只有「脚本文件」(整个文件没有任何 import / export)里的
// interface 才直接落在全局。真实项目的文件几乎都是模块,此时下面这样写
// 声明的是一个「局部的 Window」,不会与内置 Window 合并:
//   error TS2339: Property 'teaShopVersion' does not exist on
//                 type 'Window & typeof globalThis'.
// 模块里要扩全局,必须用 declare global 包起来:
declare global {
  interface Window {
    teaShopVersion: string;
  }
}
// 这样才真的和浏览器内置的 Window 合并了:
window.teaShopVersion; // ✓ 给全局对象「补」字段,靠的就是它

// type 重名?直接报错:
type Size = "small";
type Size = "large"; // ✕ Duplicate identifier 'Size'.`;

const S5_TYPE_ONLY = `// union、映射类型 —— type 独有,interface 写不出来
type Size = "small" | "medium" | "large"; // 「三选一」
type SoldOut = { [K in Size]: boolean };  // 映射类型,07 章的主角`;

/* ---------- §06 奶茶店实战 ---------- */

const S6_FULL = `type Size = "small" | "medium" | "large";
type Topping = "珍珠" | "椰果" | "布丁" | "芋圆";

interface MenuItem {
  readonly id: number;
  name: string;
  price: number;
}

interface Order {
  item: MenuItem;
  size: Size;
  toppings: Topping[];
  total: number;
}

function makeOrder(
  item: MenuItem,
  size: Size,
  toppings: Topping[] = [], // 默认值:不带料就是空数组
): Order {
  const sizeFee = size === "large" ? 3 : size === "medium" ? 1 : 0;
  const toppingFee = toppings.length * 2;
  return { item, size, toppings, total: item.price + sizeFee + toppingFee };
}`;

export default function FunctionsPage() {
  return (
    <main className="page" data-ch="functions">
      <Hero
        ch="functions"
        title={
          <>
            函数签名,一份<span className="grad">进出货单</span>
          </>
        }
        essence={
          <>
            参数进来什么形状、返回值出去什么形状,一行签名写清楚 ——
            写的人不用口头解释,调的人不用猜,三个月后的你也不用考古。
          </>
        }
        chips={[
          { id: "sign", n: "01", label: "签名解剖台" },
          { id: "params", n: "02", label: "参数三件套" },
          { id: "fntype", n: "03", label: "函数类型与 void" },
          { id: "objects", n: "04", label: "对象类型进阶" },
          { id: "ivt", n: "05", label: "interface vs type" },
          { id: "shop", n: "06", label: "奶茶店实战" },
          { id: "labs", n: "07", label: "动手" },
          { id: "quiz", n: "08", label: "测验" },
        ]}
      >
        <HeroManifest />
      </Hero>

      {/* ================= §01 签名解剖台 ================= */}
      <Section
        id="sign"
        index="01"
        title="签名解剖台:一行货单,五个部位"
        desc="奶茶店进货,货单上写清「进什么、出什么」,司机和仓库都安心。函数签名就是这张单子 —— 点每一段试试。"
      >
        <SignatureAnatomy />

        <p className="sec-desc" style={{ marginTop: 18 }}>
          先感受一下差距。同一个函数,JS 版和 TS 版摆在一起 ——
          左边要考古,右边自己会说话:
        </p>
        <CodePair
          left={<CodeBlock lang="js" title="menu.js" code={S1_JS} />}
          right={
            <CodeBlock
              lang="ts"
              title="menu.ts"
              code={S1_TS}
              note={
                <>
                  这行签名同时是<b>文档</b>(人看)和<b>合同</b>(编译器盯着执行)。
                  文档会过时,合同不会 —— 改了签名不改调用,当场报错。
                </>
              }
            />
          }
        />

        <p className="sec-desc">
          返回值其实<b>可以不写</b> —— 上一章说过,TS 的推断很能干:
        </p>
        <CodeBlock lang="ts" title="推断返回值" code={S1_INFER} />

        <Callout tone="warn" title="那为什么还建议公共函数显式写返回值?因为 any 会越狱">
          <p>
            推断靠的是函数体里的 return。万一 return 的东西本身是{" "}
            <code>any</code>(最经典的就是 <code>JSON.parse</code>),
            推断就把 any 原样奉上 —— 然后顺着调用链<b>一路传染</b>,
            你的类型检查从那一刻起名存实亡:
          </p>
          <CodeBlock lang="ts" title="any 泄漏现场" code={S1_ANY_LEAK} hl={[3, 9]} />
          <p>
            显式写 <code>: Order</code>,等于在出货口装了一道闸:里面就算推出
            any,调用方拿到的也是 Order,拼错字段立刻被抓。
            <b>对外的函数,返回值请写全。</b>
          </p>
        </Callout>
      </Section>

      {/* ================= §02 参数三件套 ================= */}
      <Section
        id="params"
        index="02"
        title="参数三件套:可选、默认值、rest"
        desc="真实的函数不会每格都必填。三种「灵活进货」的写法,各有各的规矩。"
      >
        <CodeBlock lang="ts" title="params.ts" code={S2_TRIO} hl={[2, 11, 16]} />

        <Callout tone="warn" title="可选参数只能排在队尾">
          <CodeBlock lang="ts" title="顺序错了" code={S2_BAD_ORDER} />
          <p>
            参数按<b>位置</b>对号入座 —— 可选的插在中间,后面的必选参数就永远
            对不上号。所以规矩是:<b>必选在前,可选(和默认值)在后。</b>
          </p>
        </Callout>

        <p className="sec-desc">
          另一个高频疑问:<code>topping?: string</code> 和{" "}
          <code>topping: string | undefined</code> 是一回事吗?<b>不是。</b>
        </p>
        <CodeBlock
          lang="ts"
          title="可选 ≠ | undefined"
          code={S2_OPT_VS_UNDEF}
          note={
            <>
              <code>?</code> 管的是「这格能不能空着」;<code>| undefined</code>{" "}
              管的是「这格能填什么」。前者可以整格不填,
              后者必须填 —— 哪怕填的是 undefined。
            </>
          }
        />
      </Section>

      {/* ================= §03 函数类型与 void ================= */}
      <Section
        id="fntype"
        index="03"
        title="函数类型表达式:函数自己也有「形状」"
        desc="函数能当参数传来传去,那「什么样的函数」也得说清楚 —— 这就是函数类型表达式。"
      >
        <CodeBlock lang="ts" title="函数类型表达式" code={S3_FNTYPE} />
        <CodeBlock lang="ts" title="回调参数" code={S3_CALLBACK} hl={[4]} />

        <p className="sec-desc">
          注意回调的返回值写的是 <code>void</code>。这个词的语义比看上去微妙:
          它不是「必须什么都不返回」,而是「<b>你返回什么,我都不看</b>」。
        </p>
        <CodeBlock
          lang="ts"
          title="void 的宽容"
          code={S3_VOID}
          note={
            <>
              不报错,而且是<b>故意设计的</b>。<code>(…) =&gt; void</code>{" "}
              的意思是「返回值我不用」—— 所以返回任何东西的函数都能胜任。
              不然呢?一行箭头函数天生会把表达式的值返回出去,
              <code>forEach</code> 这种回调就没法写了。
            </>
          }
        />
        <CodeBlock
          lang="ts"
          title="但字面声明是另一回事"
          code={S3_VOID_STRICT}
          note={
            <>
              区别在「谁说的 void」:<b>类型里写的 void</b> 是对使用方的承诺
              (我不看),宽容;<b>函数自己声明的 void</b>{" "}
              是对自己的要求(我不返回),严格。
            </>
          }
        />

        <Callout tone="deep" title="顺带报个信:函数重载">
          <p>
            有的函数一名多签 —— 传 string 一种行为、传 number 另一种,
            术语叫函数重载(overload)。读第三方库的类型时会撞见,
            本书等真用到再展开,今天知道有这回事就够。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 对象类型进阶 ================= */}
      <Section
        id="objects"
        index="04"
        title="对象类型进阶:可选、readonly、索引签名"
        desc="01 章给对象标过基本形状。这一节加三个修饰:哪些字段可以没有、哪些不许改、哪些键说不准。"
      >
        <CodeBlock lang="ts" title="menu-item.ts" code={S4_OBJ} hl={[2, 5]} />

        <Callout tone="deep" title="readonly 是君子协定,不是保险柜">
          <p>
            <code>readonly</code> 只在<b>编译期</b>拦你 —— 编译成 JS
            之后无影无踪,运行时想改照样能改(类型擦除,序章讲过)。
            想要真·运行时冻结,得用 <code>Object.freeze</code>。
            但别小看君子协定:团队里 99% 的误改,编译期这一拦就够了。
          </p>
        </Callout>

        <p className="sec-desc">
          还有一种情况:对象的<b>键</b>事先列不全 ——
          库存表里今天可能上新任何编号。这时候用<b>索引签名(index
          signature)</b>,只约定键和值的类型:
        </p>
        <CodeBlock lang="ts" title="索引签名初见" code={S4_INDEX} hl={[4]} />
        <Callout tone="idea" title="什么时候用索引签名?">
          <p>
            字段名<b>写得全</b>就老老实实一个个列(编译器帮你查拼写);
            键是<b>运行时才知道</b>的(编号、用户输入、动态字典)才用索引签名。
            它更宽松,也意味着编译器帮不上拼写的忙 —— 宽松是有代价的。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 interface vs type ================= */}
      <Section
        id="ivt"
        index="05"
        title="interface vs type:一场被夸大的战争"
        desc="描述对象形状,两种写法都行,而且大部分场景可以互换。先看语法对照,再说清各自的独门绝技。"
      >
        <CodePair
          left={<CodeBlock lang="ts" title="interface 写法" code={S5_IFACE} />}
          right={<CodeBlock lang="ts" title="type 写法" code={S5_TYPE} />}
        />

        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>能力</th>
                <th>interface</th>
                <th>type</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>描述对象形状</td>
                <td><span className="fn-yes">✓</span></td>
                <td><span className="fn-yes">✓</span></td>
                <td>日常九成场景,俩都行</td>
              </tr>
              <tr>
                <td>扩展</td>
                <td><code>extends</code></td>
                <td><code>&amp;</code> 交叉</td>
                <td>extends 冲突时报错更早更清楚</td>
              </tr>
              <tr>
                <td>同名声明自动合并</td>
                <td><span className="fn-yes">✓ 独有</span></td>
                <td><span className="fn-no">✕ 重名报错</span></td>
                <td>declaration merging,补全局类型靠它</td>
              </tr>
              <tr>
                <td>union(如 <code>&quot;s&quot; | &quot;m&quot;</code>)</td>
                <td><span className="fn-no">✕</span></td>
                <td><span className="fn-yes">✓ 独有</span></td>
                <td>「N 选一」只有 type 写得出</td>
              </tr>
              <tr>
                <td>映射类型 / 条件类型</td>
                <td><span className="fn-no">✕</span></td>
                <td><span className="fn-yes">✓ 独有</span></td>
                <td>类型编程(06/07 章)全在 type 侧</td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock lang="ts" title="interface 的独门:declaration merging" code={S5_MERGE} hl={[9, 10, 11]} />
        <CodeBlock lang="ts" title="type 的独门:union 与映射" code={S5_TYPE_ONLY} />

        <Callout tone="idea" title="到底选哪个?官方现行答案:随便,统一就行">
          <p>
            TypeScript 官方 handbook 的现行建议就这么朴素:
            <b>大部分场景随便选,团队风格一致即可</b>;要 union、映射类型,
            自然只能 type;写库、想给使用者留「合并扩展」的口子,用
            interface。至于网上流传的「interface 性能一定更好」——
            没有这种绝对结论,别拿它当选型依据。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 奶茶店实战 ================= */}
      <Section
        id="shop"
        index="06"
        title="奶茶店实战:makeOrder 的完整货单"
        desc="把这一章全用上:字面量联合、interface、readonly、可选与默认值、显式返回值 —— 一个函数集齐。"
      >
        <CodeBlock
          lang="ts"
          title="tea-shop.ts"
          code={S6_FULL}
          hl={[17, 18, 19, 20, 21]}
          note={
            <>
              高亮的签名就是本章 hero 里那张货单。注意 toppings 这次用了
              <b>默认值</b>而不是 <code>?</code>:函数体里它铁定是{" "}
              <code>Topping[]</code>,连检查都省了 ——
              有合理默认值时,默认值比可选参数好用。
            </>
          }
        />

        <p className="sec-desc">
          签名立好了,现在换你当编译器。下面六种调用,先猜「放行还是拦下」,
          再点开看编译器的原话:
        </p>
        <CallCheck />

        <Callout tone="story" title="这家店的故事才刚开头">
          <p>
            03 章,这张 Order 会长出「订单状态」:pending、paid、delivered ——
            用一种叫可辨识联合的写法,让编译器在每个状态分支里
            <b>自动知道</b>有哪些字段。奶茶店的世界观,一章比一章大。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 动手任务 ================= */}
      <Section
        id="labs"
        index="07"
        title="动手任务"
        desc="签名这东西,看十遍不如亲手写一遍报错一遍。四个任务,TypeScript Playground 就够。"
      >
        <LabSet ch="functions" items={LABS} />
      </Section>

      {/* ================= §08 通关测验 ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="八道题,把参数、void、readonly、interface vs type 一网打尽。全对点亮侧栏绿灯。"
      >
        <Quiz ch="functions" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            函数签名 = 进出货单:参数管「进」,返回值管「出」。
            返回值能推断,但<b>公共函数显式写</b> —— 既是文档,又是拦截 any
            越狱的闸门。
          </>,
          <>
            参数三件套:<code>?</code> 可选(格子能空着,但必须排队尾)、
            默认值(类型自动推断)、<code>...rest</code>(打包成数组)。
            可选 ≠ <code>| undefined</code>:一个是能不填,一个是必须填。
          </>,
          <>
            <code>(…) =&gt; void</code> 的意思是「返回值我不看」——
            所以能接收返回任何值的函数;但函数自己声明 <code>: void</code>{" "}
            就真的不许 return 值。
          </>,
          <>
            对象三修饰:<code>?</code> 可选属性、<code>readonly</code>{" "}
            编译期禁改(运行时无痕)、<code>[key: string]: T</code>{" "}
            索引签名对付「键说不准」的场景。
          </>,
          <>
            interface vs type:大部分场景随便选,<b>团队一致即可</b>;
            union 和映射类型是 type 独有,declaration merging 是 interface
            独有 —— 需要哪个能力就用哪边。
          </>,
        ]}
      />

      <ChapterFooter ch="functions" />
    </main>
  );
}
