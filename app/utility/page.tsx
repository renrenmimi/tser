"use client";

// 第 06 章 · 内置工具类型:
// 改锥套装比喻 → 为什么需要(Order 的五个变体)→ 类型加工流水线(招牌 viz)→
// 改形状(Partial/Required/Readonly)→ 挑字段(Pick/Omit/Record)→
// 修联合(Exclude/Extract/NonNullable)→ 拆函数与 Promise →
// 组合技 → 动手任务 → 测验 → 要点。
// 与 07 章成对:这一章先会用,下一章拆开看怎么造。

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
import { LABS, QUIZ } from "@/lib/utility-data";
import { UtHeroToolbox, UtPipeline, UtUnionSieve } from "./viz";

export default function UtilityPage() {
  return (
    <main className="page" data-ch="utility">
      <Hero
        ch="utility"
        title={
          <>
            内置<span className="grad">工具类型</span>
          </>
        }
        essence={
          <>
            官方送你一套「类型改锥」:已有的类型拧一下,就变出新类型,
            不用从头写。这一章先把每一把用顺手 —— 怎么造的,下一章拆开看。
          </>
        }
        chips={[
          { id: "why", n: "01", label: "为什么需要" },
          { id: "pipeline", n: "02", label: "加工流水线" },
          { id: "shape", n: "03", label: "改形状" },
          { id: "fields", n: "04", label: "挑字段" },
          { id: "union", n: "05", label: "修联合" },
          { id: "fn", n: "06", label: "拆函数" },
          { id: "combo", n: "07", label: "组合技" },
          { id: "labs", n: "08", label: "动手" },
          { id: "quiz", n: "09", label: "测验" },
        ]}
      >
        <UtHeroToolbox />
      </Hero>

      {/* ================= §01 为什么需要 ================= */}
      <Section
        id="why"
        index="01"
        title="为什么需要工具类型:一个 Order,五种长相"
        desc="还是那家奶茶店。Order 是系统的台柱类型 —— 可真实业务里,跟它像但不完全一样的类型,一抓一大把。"
      >
        <Callout tone="story" title="五张小票的烦恼">
          <p>
            草稿单:顾客还在犹豫,字段可以缺。锁定单:小票打出来,一个字都不许改。
            列表页:一行只显示三个字段。对外接口:内部备注绝不能漏出去。
            库存表:每个杯型对一个数字。—— 五个需求,五种类型。
          </p>
          <p>
            每种都照着 Order 重新手抄一遍?六个字段抄五遍,哪天 Order
            加一个字段,五个地方跟着改,漏一处埋一个雷。
            <b>这不叫勤奋,叫灾难。</b>
          </p>
        </Callout>

        <CodeBlock
          lang="ts"
          title="order.ts · 全章的主角"
          code={`type Size = "small" | "medium" | "large";
type Sugar = 0 | 30 | 50 | 70 | 100;

interface Order {
  id: string;           // 订单号
  drink: string;        // 喝什么
  size: Size;           // 杯型
  sugar: Sugar;         // 糖度
  toppings: string[];   // 加料
  internalNote: string; // 内部备注,只给店员看
}`}
          note={
            <>
              01 章给奶茶店标的类型,03 章的订单状态,这一章全要回收。
              把这份定义贴进 Playground,后面的代码都能接着跑。
            </>
          }
        />

        <p className="sec-desc">
          TypeScript 官方的解法:在语言里内置了一批
          <b>工具类型(utility types)</b> —— 吃进一个旧类型,吐出一个新类型。
          写法长得像函数调用,只是圆括号换成了尖括号:
          <code>Partial&lt;Order&gt;</code>。每个需求,一把改锥就搞定:
        </p>

        <div className="grid-2">
          <div className="card">
            <div className="card-kicker">Partial&lt;Order&gt;</div>
            <div className="card-title">草稿单:字段全变可选</div>
            <p>
              顾客还没选完,每一项都允许暂时空着 —— 六个 <code>?</code>{" "}
              一次拧上,不用手抄。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">Readonly&lt;Order&gt;</div>
            <div className="card-title">锁定单:字段全部上锁</div>
            <p>
              下单之后谁也别想改 —— 六个 <code>readonly</code> 一次焊死,
              改一下,编译器当场拦。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">Pick&lt;Order, …&gt;</div>
            <div className="card-title">列表页:只挑要的字段</div>
            <p>
              一行只显示订单号、饮品、杯型 —— 白名单点名,点到的留下,
              其余的不带走。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">Omit&lt;Order, …&gt;</div>
            <div className="card-title">对外接口:抹掉内部字段</div>
            <p>
              <code>internalNote</code> 是店里的悄悄话 ——
              黑名单点名删掉,剩下的原样保留。
            </p>
          </div>
        </div>

        <Callout tone="idea" title="改锥,不是新螺丝">
          <p>
            工具类型不发明新东西,只加工已有的类型。而且每一把都是
            <b>纯函数:产新,不改旧</b> —— 用 <code>Partial&lt;Order&gt;</code>{" "}
            造了草稿类型,Order 本身一根毫毛都不少。
            这一点贯穿全章,流水线上你马上能亲眼看到。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 加工流水线 ================= */}
      <Section
        id="pipeline"
        index="02"
        title="先上手感受:类型加工流水线"
        desc="别急着背 API。先把六个字段送进机器,换四种刀头各跑一遍 —— 手感有了,后面的每一节都是回忆。"
      >
        <UtPipeline />
        <p className="sec-desc">
          看清楚三件事:<b>进去的是类型,出来的也是类型</b>;换刀头(换工具)
          只改输出,不碰输入;被剔掉的字段进的是废料箱,不是被「删除」——
          Order 里它还好好的。带着这三个印象,下面逐把细讲。
        </p>
      </Section>

      {/* ================= §03 改形状 ================= */}
      <Section
        id="shape"
        index="03"
        title="改形状:Partial / Required / Readonly"
        desc="第一组改锥不增不删字段,只改每个字段的「待遇」:可选,还是只读。"
      >
        <h3 className="ut-tool-h">
          <span className="mono">Partial&lt;T&gt;</span> · 全员拧上问号
        </h3>
        <CodeBlock
          lang="ts"
          title="草稿订单:还没选完,先存着"
          code={`type DraftOrder = Partial<Order>;
// 展开等价于:
// {
//   id?: string;
//   drink?: string;
//   size?: Size;
//   sugar?: Sugar;
//   toppings?: string[];
//   internalNote?: string;
// }

const draft: DraftOrder = { drink: "茉莉奶绿" }; // ✓ 只填一项,合法
const blank: DraftOrder = {};                    // ✓ 一项不填,也合法`}
          hl={[1]}
          note={
            <>
              02 章手动给字段加过 <code>?</code> ——{" "}
              <code>Partial</code> 就是把这个动作对每个字段各来一遍。
            </>
          }
        />

        <h3 className="ut-tool-h">
          <span className="mono">Required&lt;T&gt;</span> · 反向:问号全拧掉
        </h3>
        <CodeBlock
          lang="ts"
          title="草稿转正:该填的一项都不能少"
          code={`type ConfirmedOrder = Required<DraftOrder>;
// 所有 ? 全部拧掉 —— 转回 Order 的形状

const confirmed: ConfirmedOrder = { drink: "多肉葡萄" };
// ❌ 报错:缺少属性 id、size、sugar、toppings、internalNote`}
          note={
            <>
              <code>Partial</code> 和 <code>Required</code> 是一对反向改锥:
              一个拧上 <code>?</code>,一个拧下来。
            </>
          }
        />

        <h3 className="ut-tool-h">
          <span className="mono">Readonly&lt;T&gt;</span> · 全员焊上锁
        </h3>
        <CodeBlock
          lang="ts"
          title="锁定订单:小票打出来就不许改"
          code={`type LockedOrder = Readonly<Order>;

const locked: LockedOrder = {
  id: "A-102", drink: "多肉葡萄", size: "large",
  sugar: 50, toppings: ["珍珠"], internalNote: "少冰",
};

locked.size = "small";
// ❌ 无法为 "size" 赋值,因为它是只读属性

locked.toppings.push("椰果");
// ✓ 编译器不拦!—— 锁只拧在第一层`}
          hl={[11, 12]}
          note={
            <>
              最后两行是本节的考点:<code>readonly</code> 拦的是
              「给字段重新赋值」,数组自己的 <code>push</code> 不归它管。
            </>
          }
        />

        <Callout tone="warn" title="这组改锥都是「浅」的">
          <p>
            <code>Partial</code>、<code>Required</code>、<code>Readonly</code>{" "}
            都只拧最外面一层:嵌套对象里面的字段,该必填还是必填,该能改还是能改。
            比如 <code>Partial&lt;{"{ meta: { note: string } }"}&gt;</code> 里,
            <code>meta</code> 变可选了,但 <code>meta.note</code> 依然必填。
          </p>
          <p>
            想要「深」版本?官方没给 —— 但零件都在下一章:
            学完类型运算,<b>DeepReadonly 你自己就能造一把</b>。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 挑字段 ================= */}
      <Section
        id="fields"
        index="04"
        title="挑字段:Pick / Omit / Record"
        desc="第二组改锥动的是「有哪些字段」:白名单、黑名单,还有一把从零起头的 Record。"
      >
        <h3 className="ut-tool-h">
          <span className="mono">Pick / Omit</span> · 白名单与黑名单
        </h3>
        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title="Pick:点名留下"
              code={`// 列表页一行只显示三样
type OrderListItem = Pick<
  Order,
  "id" | "drink" | "size"
>;
// {
//   id: string;
//   drink: string;
//   size: Size;
// }`}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title="Omit:点名删掉"
              code={`// 对外 API:内部备注不能漏
type PublicOrder = Omit<
  Order,
  "internalNote"
>;
// Order 的全部字段,
// 唯独没有 internalNote`}
            />
          }
        />
        <p className="sec-desc">
          怎么选?<b>要的少,用 Pick 点名要;不要的少,用 Omit 点名删。</b>
          列表页只要三个字段,Pick;对外只想抹掉一个字段,Omit。
        </p>

        <Callout tone="warn" title="Omit 的哑巴亏:键拼错了,它不吭声">
          <p>先看一段「看起来没问题」的代码:</p>
          <CodeBlock
            lang="ts"
            title="拼错键名,两种结局"
            code={`type Oops = Omit<Order, "internalNotes">;
// 多打了个 s —— 居然不报错!
// Oops 里 internalNote 原封不动:拼错 = 什么都没删

type Safe = Pick<Order, "internalNotes">;
// ❌ 类型 '"internalNotes"' 不满足约束 keyof Order`}
            hl={[1, 2, 3]}
          />
          <p>
            原因:<code>Pick</code> 要求键必须真的在 T 上(约束是{" "}
            <code>K extends keyof T</code>,05 章的 extends);而{" "}
            <code>Omit</code> 只要求「长得像个键」——
            这是官方故意放宽的,方便删「可能存在」的键,但对新手就是坑。
            <b>对外抹敏感字段时,拼错键名 = 字段照漏不误。</b>
            想严格?反过来用 Pick 点名要留的;或者等下一章,自己造一把严格版。
          </p>
        </Callout>

        <h3 className="ut-tool-h">
          <span className="mono">Record&lt;K, V&gt;</span> · 从两份材料现造一个对象类型
        </h3>
        <CodeBlock
          lang="ts"
          title="库存表与菜单字典"
          code={`// 每个杯型的库存:键是 Size 的三个成员,值是数字
type CupStock = Record<Size, number>;

const stock: CupStock = { small: 40, medium: 25, large: 0 };
// 少写 large?❌ 缺少属性 "large" —— 一个杯型都不许漏

// 键不确定时,退一步用 string
interface MenuItem { price: number; soldOut: boolean }
type Menu = Record<string, MenuItem>;

const menu: Menu = {
  茉莉奶绿: { price: 12, soldOut: false },
  多肉葡萄: { price: 18, soldOut: true },
};`}
          hl={[2, 5]}
          note={
            <>
              <code>Record&lt;Size, number&gt;</code> 比{" "}
              <code>{"{ [k: string]: number }"}</code> 强在会<b>数数</b>:
              键是有限名单时,少一个都过不了编译。
            </>
          }
        />
      </Section>

      {/* ================= §05 修联合 ================= */}
      <Section
        id="union"
        index="05"
        title="修联合:Exclude / Extract / NonNullable"
        desc="前面几把拧的是对象字段,这一组拧的是联合类型(union)的成员 —— 03 章的订单状态,该出场了。"
      >
        <CodeBlock
          lang="ts"
          title="订单状态的三种裁剪"
          code={`type OrderStatus = "queued" | "making" | "ready" | "done" | "cancelled";

// 取餐大屏:只滚动「还活着」的订单
type ActiveStatus = Exclude<OrderStatus, "done" | "cancelled">;
// "queued" | "making" | "ready"

// 归档表:只存已经终结的
type ClosedStatus = Extract<OrderStatus, "done" | "cancelled">;
// "done" | "cancelled"

// 表单里糖度可能还没选 —— 用之前先把空值清走
type SugarInput = Sugar | null | undefined;
type SugarValue = NonNullable<SugarInput>; // Sugar`}
          hl={[4, 8, 13]}
        />

        <UtUnionSieve />

        <Callout tone="idea" title="认对象改锥,还是认联合改锥?">
          <p>
            <code>Partial</code> / <code>Pick</code> / <code>Omit</code>{" "}
            这类吃的是<b>对象类型</b>,拧的是字段;<code>Exclude</code> /{" "}
            <code>Extract</code> / <code>NonNullable</code> 吃的是
            <b>联合类型</b>,拧的是成员。分不清时问一句:
            我手里这个类型,是「一张表」还是「一份名单」?
          </p>
          <p>
            顺嘴剧透:<code>Exclude</code> 的官方实现<b>只有一行</b>。
            那一行里藏着下一章最关键的机制 —— 分发。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 拆函数 ================= */}
      <Section
        id="fn"
        index="06"
        title="拆函数与 Promise:Parameters / ReturnType / Awaited"
        desc="第三组改锥对准函数:参数是什么、返回什么、异步剥掉壳是什么 —— 尤其适合「类型不是你写的」的场合。"
      >
        <CodeBlock
          lang="ts"
          title="从函数身上拆类型"
          code={`function makeOrder(drink: string, size: Size, sugar: Sugar): Order {
  return {
    id: crypto.randomUUID(), drink, size, sugar,
    toppings: [], internalNote: "",
  };
}

type MakeOrderArgs = Parameters<typeof makeOrder>;
// [drink: string, size: Size, sugar: Sugar] —— 参数元组

type MadeOrder = ReturnType<typeof makeOrder>;
// Order —— 返回值类型`}
          hl={[8, 11]}
          note={
            <>
              留意 <code>typeof makeOrder</code>:<code>makeOrder</code>{" "}
              是个<b>值</b>,类型世界不认识它;<code>typeof</code>{" "}
              把这个值的类型「拍」进类型世界,<code>ReturnType</code>{" "}
              才有的吃。它和 JS 运行时的 typeof 同名不同物 —— 下一章专门讲清。
            </>
          }
        />

        <p className="sec-desc">
          什么时候用得上?<b>第三方库的函数没导出返回值类型</b>、
          或者你不想为一个内部函数专门命名类型的时候 ——
          直接从函数身上拆,函数一改,类型自动跟着走。
        </p>

        <CodeBlock
          lang="ts"
          title="Awaited:异步的拆壳器"
          code={`declare function fetchOrder(id: string): Promise<Order>;
// declare:只声明形状、不写实现(09 章细讲),Playground 里照样能玩

type FetchReturn = ReturnType<typeof fetchOrder>;
// Promise<Order> —— 还裹着壳

type FetchedOrder = Awaited<FetchReturn>;
// Order —— 壳拆掉了

type Deep = Awaited<Promise<Promise<string>>>;
// string —— 套几层都拆到底,和 await 的行为一致`}
          hl={[7, 10]}
        />

        <Callout tone="deep" title="顺路认脸:字符串四件套,外加一把冷门的">
          <p>
            <code>Uppercase&lt;&quot;large&quot;&gt;</code> 得到{" "}
            <code>&quot;LARGE&quot;</code>,<code>Lowercase</code> 反之;
            <code>Capitalize&lt;&quot;size&quot;&gt;</code> 得到{" "}
            <code>&quot;Size&quot;</code>,<code>Uncapitalize</code> 反之 ——
            四把专拧字符串字面量的小改锥,配上下一章的模板字面量类型才真正发力,
            先混个脸熟。
          </p>
          <p>
            另有一把 <code>NoInfer&lt;T&gt;</code>(TS 5.4):把某个参数位从
            类型推断里摘出去。冷门,一句话点到,见到不慌即可。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 组合技 ================= */}
      <Section
        id="combo"
        index="07"
        title="组合技:改锥可以套着用"
        desc="每把改锥「进类型、出类型」—— 出来的类型当然能再进下一把。真实项目里的类型,多半是套出来的。"
      >
        <CodeBlock
          lang="ts"
          title="奶茶店的三个真实变体"
          code={`// 结账页:只允许改杯型和加料,而且可以先不改
type CheckoutPatch = Partial<Pick<Order, "size" | "toppings">>;
// { size?: Size; toppings?: string[] }

// 对外订单:先抹掉内部备注,再整体上锁
type PublicOrderView = Readonly<Omit<Order, "internalNote">>;

// 状态大屏:每个「进行中」状态各有多少单
type BoardStats = Record<Exclude<OrderStatus, "done" | "cancelled">, number>;
// { queued: number; making: number; ready: number }`}
          hl={[2, 6, 9]}
          note={
            <>
              读法和剥洋葱一样:<b>从最里层往外读</b>。第 2 行:先 Pick
              出两个字段,再整体 Partial —— 顺序换过来,含义就不同了。
            </>
          }
        />

        <Callout tone="warn" title="三个高频误区,一次说清">
          <p>
            <b>一,工具类型不改原类型。</b>怎么套,Order 都还是那个 Order ——
            产新,不改旧。
          </p>
          <p>
            <b>二,Partial 和 Readonly 是浅的。</b>嵌套对象里层不受影响,
            §03 讲过,考试要考。
          </p>
          <p>
            <b>三,Omit 的键拼错不报错。</b>对外抹敏感字段,拼写请再看三遍,
            或者干脆用 Pick 白名单。
          </p>
        </Callout>

        <Callout tone="story" title="预告:下一章,拆改锥">
          <p>
            这套改锥非常好用 —— 可它们不是天上掉下来的。
            <code>Partial</code> 的官方实现只有一行,<code>Exclude</code>{" "}
            更短。下一章把它们全部拆开:零件就那么几个,拆完,
            <b>这一章用过的每一把,你都能亲手复刻</b>。
          </p>
        </Callout>
      </Section>

      {/* ================= §08 动手任务 ================= */}
      <Section
        id="labs"
        index="08"
        title="动手任务"
        desc="四个任务,全部在 TypeScript Playground 完成 —— 免注册,鼠标悬停就能看类型,报错实时出现。"
      >
        <LabSet ch="utility" items={LABS} />
      </Section>

      {/* ================= §09 通关测验 ================= */}
      <Section
        id="quiz"
        index="09"
        title="通关测验"
        desc="八道题。错得最多的历来是「浅」和「Omit 拼错」两个坑 —— 都在上面亲手踩过了,应该稳。"
      >
        <Quiz ch="utility" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            工具类型(utility types)= 拿类型换类型的官方改锥:进旧类型,
            出新类型,<b>产新不改旧</b>,写法像函数调用但用尖括号。
          </>,
          <>
            改形状三把:<code>Partial</code> 拧上 <code>?</code>、
            <code>Required</code> 拧下来、<code>Readonly</code> 焊上锁 ——
            但全是<b>浅</b>的,只拧最外层。
          </>,
          <>
            挑字段三把:<code>Pick</code> 白名单、<code>Omit</code> 黑名单、
            <code>Record&lt;K, V&gt;</code> 现造对象类型且<b>会数键</b>;
            小心 <code>Omit</code> 键拼错不报错。
          </>,
          <>
            修联合三把:<code>Exclude</code> 剔除、<code>Extract</code> 挑出、
            <code>NonNullable</code> 清空值 —— 认联合成员,不认对象字段。
          </>,
          <>
            拆函数三把:<code>Parameters</code> / <code>ReturnType</code>{" "}
            配 <code>typeof</code> 从值取类型;<code>Awaited</code>{" "}
            剥 Promise,几层都剥到底。
          </>,
          <>
            改锥能套着用,从里往外读;不够用的部分(深只读、严格 Omit),
            下一章拆开零件,自己造。
          </>,
        ]}
      />

      <ChapterFooter ch="utility" />
    </main>
  );
}
