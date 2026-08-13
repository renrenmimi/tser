"use client";

// 第 03 章 · 联合类型与收窄 ——
// 安检口:union 基础 → 类型漏斗 → 收窄六板斧 → 可辨识联合 →
// never 穷尽检查 → 类型谓词 → null/undefined 三件套。

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
import { LABS, QUIZ } from "@/lib/narrowing-data";
import {
  HeroGate,
  TypeFunnel,
  GuardsExplorer,
  OrderSwitchDemo,
} from "./viz";

/* ---------- §01 union 基础 ---------- */

const S1_UNION = `type Size = "small" | "medium" | "large"; // 字面量联合:三选一
let id: string | number;                  // 或串或数,两种都合法

id = "A-042"; // ✓
id = 42;      // ✓
id = true;    // ✕ Type 'boolean' is not assignable to type 'string | number'.`;

const S1_COMMON = `function printId(id: string | number) {
  id.toString();    // ✓ 共有成员:string 有,number 也有
  id.toUpperCase(); // ✕ Property 'toUpperCase' does not exist
                    //   on type 'string | number'.
                    //     Property 'toUpperCase' does not exist
                    //     on type 'number'.
}`;

const S1_FIXED = `function printId(id: string | number) {
  if (typeof id === "string") {
    return id.toUpperCase(); // 过了安检,这里 id: string
  }
  return id.toFixed(0);      // 剩下的只可能是 number
}`;

/* ---------- §04 可辨识联合 ---------- */

const S4_LOOSE = `// 大而全 + 可选属性:全靠人肉记忆
interface LooseOrder {
  status: string;     // 任意字符串,拼错也不知道
  paidAt?: Date;      // 什么时候有?说不清
  deliveredAt?: Date; // 同上
}

function report(o: LooseOrder) {
  if (o.status === "paid") {
    // paidAt 依然是 Date | undefined ——
    // 编译器不知道 "paid" 和 paidAt 的绑定关系
    return o.paidAt!.toLocaleTimeString(); // 只能 ! 硬闯
  }
}`;

const S4_TAGGED = `// 可辨识联合:每种状态一个成员,status 是「申报单」
type Order =
  | { status: "pending"; createdAt: Date }
  | { status: "paid"; createdAt: Date; paidAt: Date }
  | { status: "delivered"; createdAt: Date;
      paidAt: Date; deliveredAt: Date };

function report(order: Order) {
  if (order.status === "paid") {
    return order.paidAt.toLocaleTimeString(); // ✓ 不用 !,一定有
  }
}`;

const S4_SWITCH = `function report(order: Order): string {
  switch (order.status) {
    case "pending":
      return "制作中,请稍候";
    case "paid":
      return "已付款:" + order.paidAt.toLocaleTimeString();
      //                       ^ ✓ 这个分支里,编译器知道 paidAt 在
    case "delivered":
      return "已送达:" + order.deliveredAt.toLocaleTimeString();
      //                       ^ ✓ 这里连 paidAt、deliveredAt 都有
  }
}`;

/* ---------- §05 never 穷尽检查 ---------- */

const S5_EXHAUSTIVE = `function report(order: Order): string {
  switch (order.status) {
    case "pending":   return "制作中";
    case "paid":      return "已付款";
    case "delivered": return "已送达";
    default: {
      // 三种状态都处理完了,order 在这里不剩任何可能 —— never
      const _exhaustive: never = order;
      return _exhaustive;
    }
  }
}`;

const S5_NEW_STATUS = `type Order =
  | { status: "pending"; createdAt: Date }
  | { status: "paid"; createdAt: Date; paidAt: Date }
  | { status: "delivered"; createdAt: Date;
      paidAt: Date; deliveredAt: Date }
  | { status: "refunded"; refundedAt: Date }; // ← 上新:退款

// 保存的一瞬间,report 的 default 里立刻报错:
// Type '{ status: "refunded"; refundedAt: Date; }' is
//   not assignable to type 'never'.
// 翻译成人话:有个漏网的状态没处理 —— 去补分支。`;

/* ---------- §06 类型谓词 ---------- */

const S6_PREDICATE = `type Paid = { status: "paid"; createdAt: Date; paidAt: Date };

// 返回值不写 boolean,写 o is Paid ——
// 意思是:「我返回 true,就意味着 o 是 Paid」
function isPaid(o: Order): o is Paid {
  return o.status === "paid";
}

declare const orders: Order[];
const paidOrders = orders.filter(isPaid);
// paidOrders: Paid[] —— 类型跟着过滤走了
// (要是 isPaid 只返回 boolean,结果还是 Order[])`;

const S6_AUTO = `const names = ["茉莉", undefined, "四季春"]
  .filter((n) => n !== undefined);

// TS 5.5 之前:names: (string | undefined)[] —— filter 白干了
// TS 5.5 之后:names: string[]
//   简单的过滤函数,编译器自动推断出类型谓词,不用你写 is`;

/* ---------- §07 null/undefined 三件套 ---------- */

const S7_TRIO = `interface Member {
  nickname?: string;
}

function greet(m: Member | null) {
  m.nickname;  // ✕ 'm' is possibly 'null'.

  const n1 = m?.nickname;
  // ?. :m 是 null/undefined 就短路,整段表达式变 undefined
  //     n1: string | undefined

  const n2 = m?.nickname ?? "匿名买家";
  // ?? :左边是 null/undefined 才用右边兜底
  //     n2: string —— undefined 被兜没了

  const n3 = m!.nickname;
  // !  :「我拍胸脯它不是 null」—— 编译器闭嘴,运行时不管
}`;

const S7_NULLISH = `declare const order: { sugar?: number };

const a = order.sugar ?? 50; // 只有 null/undefined 才兜底
const b = order.sugar || 50; // 0 也会被换成 50!

// 顾客点了 0% 糖(无糖):
// a === 0  ✓ 尊重顾客
// b === 50 ✕ 无糖变半糖,投诉预定`;

export default function NarrowingPage() {
  return (
    <main className="page" data-ch="narrowing">
      <Hero
        ch="narrowing"
        title={
          <>
            先过<span className="grad">安检</span>,再拆包裹
          </>
        }
        essence={
          <>
            「可能是 A 也可能是 B」的值,就像没过检的包裹 ——
            不检查就当 A 用,是 JS 时代半夜炸线上的头号来源。
            这一章教你设卡:每过一道检查,可能性就少一种,编译器全程记账。
          </>
        }
        chips={[
          { id: "union", n: "01", label: "联合类型" },
          { id: "funnel", n: "02", label: "类型漏斗" },
          { id: "guards", n: "03", label: "收窄六板斧" },
          { id: "du", n: "04", label: "可辨识联合" },
          { id: "never", n: "05", label: "never 穷尽检查" },
          { id: "predicate", n: "06", label: "类型谓词" },
          { id: "nullish", n: "07", label: "null 三件套" },
          { id: "labs", n: "08", label: "动手" },
          { id: "quiz", n: "09", label: "测验" },
        ]}
      >
        <HeroGate />
      </Hero>

      {/* ================= §01 联合类型 ================= */}
      <Section
        id="union"
        index="01"
        title="联合类型:这个包裹,可能装着几种东西"
        desc="竖线 | 读作「或」:string | number 就是「或串或数」。先看它怎么写,再看它带来的新问题。"
      >
        <CodeBlock lang="ts" title="union.ts" code={S1_UNION} />

        <p className="sec-desc">
          union 解决了「一格装多种」的表达问题,但立刻带来新问题:
          <b>包裹没拆之前,你敢用里面的东西吗?</b>编译器的答案很保守:
        </p>
        <CodeBlock
          lang="ts"
          title="共有成员规则"
          code={S1_COMMON}
          hl={[3]}
          note={
            <>
              编译器按<b>最坏情况</b>想:万一 id 是 number 呢?number 可没有
              toUpperCase。所以联合类型上只准用<b>所有成员共有</b>的部分
              (比如 toString 谁都有)。
            </>
          }
        />
        <p className="sec-desc">
          想用某个成员的独门方法?先过安检 —— 检查一下,让编译器确认「这条路上
          只可能是它」:
        </p>
        <CodeBlock lang="ts" title="过检之后随便用" code={S1_FIXED} hl={[2]} />

        <Callout tone="idea" title="| 是「或」,不是「和」">
          <p>
            <code>string | number</code> = 是 string <b>或</b>是
            number,二者取一;不是「既有 string 的能力又有 number 的能力」
            (那是交叉类型 <code>&amp;</code>,04 章见)。
            所以 union 越联越「窄用」:成员越多,共有成员越少,
            不安检就越什么都干不了。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 类型漏斗 ================= */}
      <Section
        id="funnel"
        index="02"
        title="类型漏斗:眼看着可能性一种种减少"
        desc="这是本章的核心画面:一个 union 的全部可能性排队过闸,每道守卫拦下一种。放一遍,记住这个漏斗。"
      >
        <TypeFunnel />
        <Callout tone="deep" title="收窄是「逐行」发生的">
          <p>
            编译器不是笼统地看一眼函数 —— 它<b>逐行</b>追踪每个变量
            「此刻还剩哪些可能」,术语叫控制流分析(control flow
            analysis)。同一个 x,第 3 行和第 5 行的类型可以不一样。
            在编辑器里把光标悬停在不同行的同一个变量上,能亲眼看到类型在变 ——
            这是理解 TS 的一个「顿悟时刻」。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 收窄六板斧 ================= */}
      <Section
        id="guards"
        index="03"
        title="收窄六板斧:安检设备一字排开"
        desc="漏斗里的「闸口」有六种造法,各有擅长的场景 —— 点一把,看代码、编译器视角和坑。"
      >
        <GuardsExplorer />

        <Callout tone="warn" title="两大冤案,上线前必读">
          <p>
            <b>冤案一:真值检查误杀 0 和 &quot;&quot;。</b>
            <code>if (count)</code> 想排除 undefined,却把 0 一起排了 ——
            「0 件配料」是合法数据,不是没填。精确表达用{" "}
            <code>count !== undefined</code>。
          </p>
          <p>
            <b>冤案二:typeof 放过 null。</b>
            <code>typeof x === &quot;object&quot;</code> 对 null 也返回
            true(1995 年的历史 bug,永远不会修了)。判对象之前,
            先 <code>x !== null</code> 挡一刀。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 可辨识联合 ================= */}
      <Section
        id="du"
        index="04"
        title="可辨识联合:给每个包裹贴一张申报单"
        desc="本章高潮。奶茶店的订单有三种状态,每种状态字段不同 —— 怎么让编译器在每个分支里「自动知道」有什么?"
      >
        <p className="sec-desc">
          先看没有申报单的写法有多难受。所有字段揉成一个大类型,
          「什么状态有什么字段」只存在于你的脑子里:
        </p>
        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title="✕ 大而全 + 可选属性"
              code={S4_LOOSE}
              hl={[12]}
              note={
                <>
                  那个 <code>!</code> 就是投降书:类型系统帮不上忙,
                  只好人肉担保。改天有人在 status 里拼错一个词,
                  谁也不会知道。
                </>
              }
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title="✓ 可辨识联合"
              code={S4_TAGGED}
              hl={[3, 4, 5, 6]}
              note={
                <>
                  每种状态一个成员,status 的类型是<b>字面量</b>
                  (&quot;paid&quot; 这个词本身)。比对一句
                  status,整个对象的形状就定了 —— 不用 <code>!</code>,
                  不用猜。
                </>
              }
            />
          }
        />

        <p className="sec-desc">
          配上 <code>switch</code>,每个 case 分支里编译器都精确知道
          order 长什么样:
        </p>
        <CodeBlock lang="ts" title="switch 分拣" code={S4_SWITCH} hl={[6, 9]} />

        <OrderSwitchDemo />

        <Callout tone="idea" title="可辨识联合三要素">
          <p>
            ① 每个成员都有<b>同一个公共字段</b>(叫 status、kind、type
            都行);② 字段类型是<b>字面量</b>(&quot;paid&quot;
            这种具体的词,不是宽泛的 string);③ 各成员的字面量
            <b>互不相同</b>。三样凑齐,switch/if 一比对,整个对象跟着收窄 ——
            这是 TS 里表达「状态机」的标准姿势,前端组件状态、后端订单流转,
            全是它的主场。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 never 穷尽检查 ================= */}
      <Section
        id="never"
        index="05"
        title="never 与穷尽检查:让编译器替你记住所有 TODO"
        desc="漏斗的终点是 never(空集)。这个「空」不是摆设 —— 它是全书性价比最高的工程技巧之一。"
      >
        <CodeBlock
          lang="ts"
          title="穷尽检查(exhaustiveness check)"
          code={S5_EXHAUSTIVE}
          hl={[8]}
          note={
            <>
              读法:「到 default 时,order 应该<b>什么可能都不剩</b>(never)」。
              三种状态都被 case 拦走了,这行赋值成立,风平浪静。
            </>
          }
        />
        <p className="sec-desc">
          好戏在后头。三个月后,产品经理说要支持退款 ——
          你在类型里加了一个新状态:
        </p>
        <CodeBlock
          lang="ts"
          title="上新状态的一瞬间"
          code={S5_NEW_STATUS}
          hl={[6]}
        />
        <Callout tone="win" title="这就是「编译器替你记 TODO」">
          <p>
            项目里有二十处 switch 在处理订单?加一个新状态,
            <b>二十处同时报错、逐个点名</b> ——
            你顺着报错列表补分支就行,一处都漏不掉。反过来想想 JS
            的版本:新状态静默掉进 default(或者压根没有 default),
            函数悄悄返回 undefined,一个月后才在客诉里露头。
          </p>
        </Callout>
        <Callout tone="warn" title="不写穷尽检查,保护就不存在">
          <p>
            没有那行 <code>never</code> 赋值,新增状态不会有任何报错 ——
            switch 静静漏过它。写了 default 却只 <code>return
            &quot;未知状态&quot;</code> 也一样:编译器认为你「处理了」,
            保护失效。要么穷尽检查,要么别怪编译器没提醒。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 类型谓词 ================= */}
      <Section
        id="predicate"
        index="06"
        title="类型谓词:把安检逻辑打包复用"
        desc="同一段检查逻辑到处写?抽成函数。但普通 boolean 函数不带收窄效果 —— 得用 is 签名。"
      >
        <CodeBlock lang="ts" title="type-predicate.ts" code={S6_PREDICATE} hl={[5]} />
        <Callout tone="warn" title="谓词是「编译器信人」的地方">
          <p>
            <code>o is Paid</code> 是你对编译器的<b>单方面承诺</b> ——
            它不检查你的函数体逻辑。把判断写错成{" "}
            <code>o.status === &quot;pending&quot;</code>,编译器照信不误,
            类型和现实从此分道扬镳。这是少数几个能亲手把类型系统骗翻的地方,
            写的时候多看一眼。
          </p>
        </Callout>
        <p className="sec-desc">
          好消息:从 TS 5.5 起,简单的过滤函数<b>不用手写谓词</b>了:
        </p>
        <CodeBlock lang="ts" title="TS 5.5:自动推断谓词" code={S6_AUTO} />
      </Section>

      {/* ================= §07 null 三件套 ================= */}
      <Section
        id="nullish"
        index="07"
        title="null/undefined 三件套:?.、??、!"
        desc="strict 模式下,null 和 undefined 是两种要单独安检的「可能」。三件套三种态度:绕、兜、闯。"
      >
        <CodeBlock lang="ts" title="三件套同框" code={S7_TRIO} hl={[8, 12, 16]} />

        <p className="sec-desc">
          <code>??</code> 有个长得像的前辈 <code>||</code>,
          区别正是 §03 那桩「真值冤案」:
        </p>
        <CodeBlock
          lang="ts"
          title="?? vs ||"
          code={S7_NULLISH}
          hl={[3, 4]}
          note={
            <>
              <code>||</code> 看真值,0 和 &quot;&quot; 都会被换掉;
              <code>??</code> 只认 null/undefined。
              兜底默认值,<b>一律用 ??</b>。
            </>
          }
        />

        <Callout tone="warn" title="! 是「后果自负」,不是第四种检查">
          <p>
            <code>?.</code> 和 <code>??</code> 编译后是<b>真实的运行时检查</b>
            (可选链和空值合并是 JS 正式语法);而 <code>!</code>{" "}
            编译后<b>消失得无影无踪</b> —— 它没有做任何检查,
            只是让编译器别再报警。你拍胸脯的地方一旦真来了 null,
            照样 TypeError,而且这次连编译器的提醒都没了。
            规矩:能用 ?. 和 ?? 解决的,绝不用 !。
          </p>
        </Callout>
      </Section>

      {/* ================= §08 动手任务 ================= */}
      <Section
        id="labs"
        index="08"
        title="动手任务"
        desc="收窄这东西,必须亲眼看着悬停提示里的类型一步步变窄才算学会。四个任务,Playground 就够。"
      >
        <LabSet ch="narrowing" items={LABS} />
      </Section>

      {/* ================= §09 通关测验 ================= */}
      <Section
        id="quiz"
        index="09"
        title="通关测验"
        desc="九道题,从共有成员规则到 !的代价,把安检口的规矩一网打尽。全对点亮侧栏绿灯。"
      >
        <Quiz ch="narrowing" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            联合类型只准用<b>共有成员</b> —— 编译器按最坏情况想。
            想用独门成员,先过安检(收窄),编译器逐行记账。
          </>,
          <>
            六板斧:typeof、真值、相等、in、instanceof、可辨识联合。
            两大冤案背下来:<b>真值检查误杀 0 和 &quot;&quot;</b>;
            <b>typeof null === &quot;object&quot;</b>。
          </>,
          <>
            可辨识联合三要素:公共字段 + 字面量类型 + 互不相同。
            比对一句 status,<b>整个对象</b>跟着收窄 ——
            表达状态机的标准姿势。
          </>,
          <>
            switch 的 default 里塞一行 <code>const _x: never = order</code>{" "}
            = 穷尽检查:以后新增状态,编译器全项目点名,一处不漏。
          </>,
          <>
            <code>o is Paid</code> 谓词把安检逻辑打包复用,但编译器无条件信你
            —— 逻辑自己保真。TS 5.5 起简单 filter 能自动推断。
          </>,
          <>
            三件套三种态度:<code>?.</code> 绕着走、<code>??</code>{" "}
            有兜底(别用 || 兜底,0 会被误杀)、<code>!</code>{" "}
            后果自负 —— 前两个是真检查,最后一个只是让编译器闭嘴。
          </>,
        ]}
      />

      <ChapterFooter ch="narrowing" />
    </main>
  );
}
