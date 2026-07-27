"use client";

// 第 07 章 · 类型运算:
// 拆改锥比喻 → 值世界 vs 类型世界 → keyof / typeof → 索引访问 →
// 条件类型与分发(招牌 viz)→ infer → 映射类型与键重映射 →
// 毕业仪式(亲手重写 06 章的五把改锥)→ 动手任务 → 测验 → 要点。
// 与 06 章成对:上一章会用,这一章拆开看怎么造。

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
import { LABS, QUIZ } from "@/lib/type-magic-data";
import { TmHeroParts, TmDistribute, TmMappedFactory } from "./viz";

export default function TypeMagicPage() {
  return (
    <main className="page" data-ch="type-magic">
      <Hero
        ch="type-magic"
        title={
          <>
            类型<span className="grad">运算</span>
          </>
        }
        essence={
          <>
            上一章的每一把改锥,拆开都是同一批零件:keyof、条件类型、infer、
            映射类型。这一章把零件认全 —— 章末,你会亲手把那五把改锥重新造一遍。
          </>
        }
        chips={[
          { id: "worlds", n: "01", label: "两个世界" },
          { id: "keyof", n: "02", label: "keyof 与 typeof" },
          { id: "index", n: "03", label: "索引访问" },
          { id: "cond", n: "04", label: "条件与分发" },
          { id: "infer", n: "05", label: "infer" },
          { id: "mapped", n: "06", label: "映射类型" },
          { id: "rebuild", n: "07", label: "毕业仪式" },
          { id: "labs", n: "08", label: "动手" },
          { id: "quiz", n: "09", label: "测验" },
        ]}
      >
        <TmHeroParts />
      </Hero>

      {/* ================= §01 两个世界 ================= */}
      <Section
        id="worlds"
        index="01"
        title="值世界与类型世界:类型是一门小语言"
        desc="拆改锥之前,先立一个坐标系:你写的每一行 TS,其实同时活在两个世界里。"
      >
        <Callout tone="story" title="拆改锥的下午">
          <p>
            上一章你已经把 Partial、Pick 用得顺手了。今天把改锥拆开 ——
            你猜怎么着,里面没有黑魔法,只有几个零件:取键的、取类型的、
            做判断的、做循环的。凑在一起,类型就成了一门能编程的小语言:
            <b>输入是类型,输出也是类型,整门语言只在编译期运行</b>。
          </p>
        </Callout>

        <p className="sec-desc">
          你熟的 JavaScript 操作,在类型世界几乎都有一个「镜像」——
          这张对照表就是全章的地图,每一行后面都是一节:
        </p>

        <div className="table-wrap">
          <table className="t-table tm-vs-table">
            <thead>
              <tr>
                <th>值世界(运行时,操作数据)</th>
                <th>类型世界(编译期,操作类型)</th>
                <th>在哪讲</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>Object.keys(order)</code>
                </td>
                <td>
                  <code>keyof Order</code>
                </td>
                <td>§02</td>
              </tr>
              <tr>
                <td>
                  <code>order[&quot;size&quot;]</code>
                </td>
                <td>
                  <code>Order[&quot;size&quot;]</code>
                </td>
                <td>§03</td>
              </tr>
              <tr>
                <td>
                  <code>cond ? a : b</code>
                </td>
                <td>
                  <code>T extends U ? X : Y</code>
                </td>
                <td>§04</td>
              </tr>
              <tr>
                <td>
                  解构:<code>const {"{ x }"} = obj</code>
                </td>
                <td>
                  <code>infer</code> 挖一块出来
                </td>
                <td>§05</td>
              </tr>
              <tr>
                <td>
                  <code>arr.map(fn)</code>
                </td>
                <td>
                  <code>{"{ [K in keyof T]: … }"}</code>
                </td>
                <td>§06</td>
              </tr>
              <tr>
                <td>
                  拼字符串:<code>{"`on${name}`"}</code>
                </td>
                <td>
                  模板字面量类型:<code>{"`on${K}`"}</code>
                </td>
                <td>§06</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout tone="idea" title="这门小语言,运行时零开销">
          <p>
            类型世界的所有运算都发生在编译期,<code>tsc</code>{" "}
            一跑完就全部蒸发(type erasure,序章讲过的「擦除」)。
            所以放心折腾:类型算得再花,<b>打包出来的 JS 一个字节都不会多</b>。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 keyof 与 typeof ================= */}
      <Section
        id="keyof"
        index="02"
        title="keyof 与 typeof:钥匙串和取景器"
        desc="零件一号和二号。一个把类型的键全部摘下来,一个把值的类型拍进类型世界。"
      >
        <h3 className="tm-tool-h">
          <span className="mono">keyof T</span> · 摘下整串钥匙
        </h3>
        <CodeBlock
          lang="ts"
          title="keyof:类型世界的 Object.keys"
          code={`type Size = "small" | "medium" | "large";
type Sugar = 0 | 30 | 50 | 70 | 100;

interface Order {
  id: string;
  drink: string;
  size: Size;
  sugar: Sugar;
  toppings: string[];
  internalNote: string;
}

type OrderKey = keyof Order;
// "id" | "drink" | "size" | "sugar" | "toppings" | "internalNote"

const k: OrderKey = "size";  // ✓
const bad: OrderKey = "cup"; // ❌ 不在钥匙串上`}
          hl={[13, 14]}
          note={
            <>
              对照记:<code>Object.keys(order)</code>{" "}
              运行时给你一个字符串数组;<code>keyof Order</code>{" "}
              编译期给你一个<b>字面量联合</b> —— 03 章的老朋友,
              每个成员都是一把真实存在的钥匙。
            </>
          }
        />

        <h3 className="tm-tool-h">
          <span className="mono">typeof x</span> · 对着值按下快门
        </h3>
        <CodeBlock
          lang="ts"
          title="typeof:从值反推类型"
          code={`const menu = {
  茉莉奶绿: 12,
  多肉葡萄: 18,
  芝士莓莓: 20,
};

type Menu = typeof menu;
// { 茉莉奶绿: number; 多肉葡萄: number; 芝士莓莓: number }

type DrinkName = keyof typeof menu;
// "茉莉奶绿" | "多肉葡萄" | "芝士莓莓"

function priceOf(name: DrinkName) {
  return menu[name]; // ✓ name 一定是菜单上的键,不用判空
}`}
          hl={[7, 10]}
          note={
            <>
              第 10 行是黄金组合:<b>先 typeof 拍照,再 keyof 摘钥匙</b> ——
              菜单加一款新品,DrinkName 自动多一个成员,一行不用改。
              上一章 <code>ReturnType&lt;typeof makeOrder&gt;</code>{" "}
              里那个 typeof,就是它。
            </>
          }
        />

        <Callout tone="warn" title="同名不同物:两个 typeof 别认串了">
          <p>
            JS 的 <code>typeof</code> 活在运行时,吐出{" "}
            <code>&quot;string&quot;</code>、<code>&quot;object&quot;</code>{" "}
            那八种字符串(03 章拿它做过收窄);TS 的 <code>typeof</code>{" "}
            只出现在<b>类型位置</b>(type 的等号右边、注解的冒号后面),
            编译后直接蒸发。
          </p>
          <p>
            判断口诀:看它站的位置 ——{" "}
            <code>if (typeof x === &quot;string&quot;)</code> 是值世界,
            <code>type M = typeof menu</code> 是类型世界。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 索引访问 ================= */}
      <Section
        id="index"
        index="03"
        title="索引访问:T[K],类型也能取下标"
        desc="零件三号。拿着钥匙开锁 —— 从类型里取出某个字段的类型。"
      >
        <CodeBlock
          lang="ts"
          title="索引访问类型(indexed access types)"
          code={`type OrderSize = Order["size"];
// Size —— 注意是方括号;Order.size ❌,点语法是值世界的

type IdOrDrink = Order["id" | "drink"];
// string —— 钥匙可以是联合,一次开好几把锁

type OrderValue = Order[keyof Order];
// string | Size | Sugar | string[] —— 全部值类型的联合

const toppings = ["珍珠", "椰果", "芋圆"] as const;
type Topping = (typeof toppings)[number];
// "珍珠" | "椰果" | "芋圆" —— 数组用 number 当钥匙,取出元素类型`}
          hl={[1, 7, 11]}
          note={
            <>
              最后一招 <code>T[number]</code> 值得单独记:数组的下标是
              number,拿 number 当钥匙,开出来的就是<b>元素类型</b>。
              配合 <code>as const</code>(把数组冻成字面量元组),
              一份运行时数据直接变一份类型名单 —— 维护一处,两个世界同步。
            </>
          }
        />
        <p className="sec-desc">
          到这里,三个「取」字辈零件集齐了:<code>keyof</code> 取键、
          <code>typeof</code> 取值的类型、<code>T[K]</code> 取字段的类型。
          它们是后面所有大零件的地基。
        </p>
      </Section>

      {/* ================= §04 条件与分发 ================= */}
      <Section
        id="cond"
        index="04"
        title="条件类型与分发:类型世界的 if"
        desc="零件四号,也是最有戏的一个。先看三元,再看它遇到联合类型时的「魔法时刻」。"
      >
        <CodeBlock
          lang="ts"
          title="条件类型(conditional types):T extends U ? X : Y"
          code={`type IsSize<T> = T extends Size ? "是杯型" : "不是杯型";

type A = IsSize<"large">; // "是杯型" —— "large" 是 Size 的成员
type B = IsSize<number>;  // "不是杯型"`}
          note={
            <>
              <code>extends</code> 在这里读作「能不能塞进」——
              04 章结构化类型的兼容判断,原样搬进了三元表达式。
            </>
          }
        />

        <p className="sec-desc">
          单看不惊艳,对吧?接下来是本章的魔法时刻。上一章说过{" "}
          <code>Exclude</code> 的官方实现只有一行 —— 就是下面这行。
          可一个「三元」怎么就能从联合里<b>剔掉</b>成员?
        </p>

        <CodeBlock
          lang="ts"
          title="一行 Exclude,手工推演"
          code={`type OrderStatus = "queued" | "making" | "ready" | "cancelled";

type MyExclude<T, U> = T extends U ? never : T;

type Active = MyExclude<OrderStatus, "cancelled">;
// 关键:不是整体判断,而是逐个「分发」:
//   "queued"    extends "cancelled" ? → 否 → 留下 "queued"
//   "making"    extends "cancelled" ? → 否 → 留下 "making"
//   "ready"     extends "cancelled" ? → 否 → 留下 "ready"
//   "cancelled" extends "cancelled" ? → 是 → never
// 合流:"queued" | "making" | "ready" | never
//     = "queued" | "making" | "ready"(never 是空集,并集里自动消失)`}
          hl={[3, 5]}
        />

        <TmDistribute />

        <p className="sec-desc">
          这就是<b>分布式条件类型(distributive conditional types)</b>:
          条件类型里的 T 如果是「光秃秃」的类型参数,遇到联合类型就自动拆开、
          逐个过闸、再把结果合并。<code>never</code>{" "}
          在这里客串垃圾桶 —— 它是空集(03 章讲过),并集里加多少个都等于没加。
        </p>

        <Callout tone="warn" title="分发只认「裸」的 T —— 包一层就不分了">
          <CodeBlock
            lang="ts"
            title="裸与不裸,结果两样"
            code={`type NakedCheck<T>   = T extends string ? "全是字符串" : "混了别的";
type WrappedCheck<T> = [T] extends [string] ? "全是字符串" : "混了别的";

type C = NakedCheck<"a" | 1>;
// "全是字符串" | "混了别的" —— 拆开逐个判,结果也是联合(不是你想要的)

type D = WrappedCheck<"a" | 1>;
// "混了别的" —— 包上 [ ] 变成元组,整体判断,不分发`}
            hl={[4, 7]}
          />
          <p>
            <b>这是特性,不是 bug。</b>想「逐个处理成员」(Exclude 那种),
            用裸 T;想「把联合当整体判断」,拿 <code>[T]</code>{" "}
            包一层再比。两种都用得上,关键是知道开关在哪。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 infer ================= */}
      <Section
        id="infer"
        index="05"
        title="infer:在匹配里挖一块出来"
        desc="零件五号。条件类型负责「像不像」,infer 负责「像的话,把里面那块给我」。"
      >
        <CodeBlock
          lang="ts"
          title="拆快递:从 Promise 里取货"
          code={`type Unbox<T> = T extends Promise<infer U> ? U : T;

type A = Unbox<Promise<Order>>; // Order —— 是快递,拆开拿货
type B = Unbox<string>;         // string —— 不是快递,原样退回`}
          hl={[1]}
          note={
            <>
              读法:「如果 T 长得像 <code>Promise&lt;某个东西&gt;</code>,
              就把那个东西记作 U,然后交出 U」。<code>infer</code>{" "}
              就是在 extends 的模式里挖一个洞,匹配成功时 TypeScript
              替你把洞里的类型填上名字 —— 类型世界的解构赋值。
            </>
          }
        />

        <CodeBlock
          lang="ts"
          title="洞可以挖在任何位置"
          code={`// 挖数组的元素
type ElementOf<T> = T extends (infer E)[] ? E : never;
type T1 = ElementOf<string[]>; // string
type T2 = ElementOf<Order[]>;  // Order

// 挖函数的返回值 —— 眼熟吗?
type MyReturnType<T> = T extends (...args: any) => infer R ? R : never;
type T3 = MyReturnType<() => Size>;          // Size
type T4 = MyReturnType<typeof Math.random>;  // number`}
          hl={[7]}
          note={
            <>
              第 7 行就是上一章 <code>ReturnType</code> 的芯子:
              「长得像函数?把返回值那块挖出来给我。」
              infer 还能加约束(<code>infer U extends …</code>),本章不展开。
            </>
          }
        />
      </Section>

      {/* ================= §06 映射类型 ================= */}
      <Section
        id="mapped"
        index="06"
        title="映射类型:类型世界的流水线循环"
        desc="最后一批零件:逐键改造的映射、拧上拧下的修饰符、给键改名的 as。上一章的流水线,图纸在这。"
      >
        <CodeBlock
          lang="ts"
          title="映射类型(mapped types):一行造出 Partial"
          code={`type MyPartial<T> = { [K in keyof T]?: T[K] };`}
          note={
            <>
              三个零件各就各位:<code>[K in keyof T]</code>{" "}
              逐键循环(§02 的钥匙串);<code>?</code> 修饰符,给每把钥匙拧上可选;
              <code>T[K]</code> 索引访问,把原来的值类型原样抄过来(§03)。
              —— 这就是你上一章用的 Partial,一行,没了。
            </>
          }
        />

        <TmMappedFactory />

        <CodeBlock
          lang="ts"
          title="修饰符全家:+ 拧上,- 拧下"
          code={`type Mutable<T>  = { -readonly [K in keyof T]: T[K] }; // 拆锁
type Concrete<T> = { [K in keyof T]-?: T[K] };         // 拧掉 ? = 手写 Required

// +? 和 ? 等价、+readonly 和 readonly 等价 —— 减号才是新知识`}
          hl={[1, 2]}
        />

        <h3 className="tm-tool-h">
          <span className="mono">as + 模板字面量</span> · 连键名都能重造(TS 4.1)
        </h3>
        <CodeBlock
          lang="ts"
          title="键重映射(key remapping):事件接口凭空长出来"
          code={`type Watchers<T> = {
  [K in keyof T as \`on\${Capitalize<string & K>}Change\`]: (next: T[K]) => void;
};

type OrderWatchers = Watchers<Pick<Order, "size" | "sugar">>;
// {
//   onSizeChange:  (next: Size)  => void;
//   onSugarChange: (next: Sugar) => void;
// }`}
          hl={[2]}
          note={
            <>
              <code>as</code> 后面跟新键名;模板字面量类型(template literal
              types)负责拼字符串,<code>Capitalize</code>{" "}
              上一章打过照面,在这儿正式上岗。<code>string &amp; K</code>{" "}
              是句保险话:keyof 可能混进 symbol,先跟 string 取个交集。
              键重映射和模板字面量类型都是 TS 4.1 加入的。
            </>
          }
        />
      </Section>

      {/* ================= §07 毕业仪式 ================= */}
      <Section
        id="rebuild"
        index="07"
        title="毕业仪式:亲手重写五把改锥"
        desc="零件认全了。现在打开 lib.es5.d.ts 的方式看官方原版,右边你来写 —— 每一把,零件就那几个。"
        badge="本章高潮"
      >
        <h3 className="tm-tool-h">
          <span className="mono">MyPartial</span> · 全员拧上问号
          <span className="tm-parts-used">零件:映射 + ? + T[K]</span>
        </h3>
        <CodePair
          left={
            <CodeBlock
              lang="dts"
              title="lib.es5.d.ts · 官方原版"
              code={`type Partial<T> = {
  [P in keyof T]?: T[P];
};`}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title="你的手写版"
              code={`type MyPartial<T> = {
  [K in keyof T]?: T[K];
};`}
            />
          }
        />

        <h3 className="tm-tool-h">
          <span className="mono">MyReadonly</span> · 全员焊上锁
          <span className="tm-parts-used">零件:映射 + readonly + T[K]</span>
        </h3>
        <CodePair
          left={
            <CodeBlock
              lang="dts"
              title="lib.es5.d.ts · 官方原版"
              code={`type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};`}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title="你的手写版"
              code={`type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};`}
            />
          }
        />

        <h3 className="tm-tool-h">
          <span className="mono">MyPick</span> · 白名单点名
          <span className="tm-parts-used">零件:映射 + 泛型约束 + T[K]</span>
        </h3>
        <CodePair
          left={
            <CodeBlock
              lang="dts"
              title="lib.es5.d.ts · 官方原版"
              code={`type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};`}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title="你的手写版"
              code={`type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};`}
            />
          }
        />
        <p className="sec-desc">
          看出门道了吗:循环范围不是 <code>keyof T</code>,而是来客点名的{" "}
          <code>K</code>;而 <code>K extends keyof T</code>
          (05 章泛型的约束)保证点的名真实存在 ——{" "}
          <b>这就是 Pick 拼错键会报错、Omit 不报的根源</b>,上一章的悬案破了。
        </p>

        <h3 className="tm-tool-h">
          <span className="mono">MyExclude</span> · 联合筛子
          <span className="tm-parts-used">零件:条件类型 + 分发 + never</span>
        </h3>
        <CodePair
          left={
            <CodeBlock
              lang="dts"
              title="lib.es5.d.ts · 官方原版"
              code={`type Exclude<T, U> =
  T extends U ? never : T;`}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title="你的手写版"
              code={`type MyExclude<T, U> =
  T extends U ? never : T;`}
            />
          }
        />

        <h3 className="tm-tool-h">
          <span className="mono">MyReturnType</span> · 挖函数返回值
          <span className="tm-parts-used">零件:条件类型 + infer</span>
        </h3>
        <CodePair
          left={
            <CodeBlock
              lang="dts"
              title="lib.es5.d.ts · 官方原版"
              code={`type ReturnType<
  T extends (...args: any) => any
> = T extends (...args: any) => infer R
  ? R
  : any;`}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title="你的手写版"
              code={`type MyReturnType<
  T extends (...args: any) => any
> = T extends (...args: any) => infer R
  ? R
  : never;`}
            />
          }
        />
        <p className="sec-desc">
          唯一的分歧在兜底分支:官方用 <code>any</code>,你用{" "}
          <code>never</code> 反而更严格 —— 约束已经保证 T 是函数,
          这个分支正常走不到。两版都对,你的甚至更讲究。
        </p>

        <Callout tone="win" title="毕业了">
          <p>
            五把改锥,全部亲手复刻,官方版和你的版本几乎逐字相同 ——
            <b>零件就这几个,组合而已</b>。现在去 VS Code 里按住{" "}
            Cmd/Ctrl 点一下 <code>Partial</code>,跳进 lib.es5.d.ts:
            上一章还是天书的地方,现在是白话。工具类型不够用的时候
            (深只读、严格 Omit),你已经有能力自己造 ——
            动手任务里就有一把等你。
          </p>
        </Callout>

        <Callout tone="warn" title="能造,更要克制">
          <p>
            类型编程和值编程一个脾气:<b>能一眼读懂的,别写成三层嵌套</b>。
            一个 interface 说得清的事,不要上条件类型;同事悬停十秒还看不懂的
            类型,是负债不是炫技。什么时候该花、什么时候该收 ——
            终章「类型思维」跟你算总账。
          </p>
        </Callout>
      </Section>

      {/* ================= §08 动手任务 ================= */}
      <Section
        id="labs"
        index="08"
        title="动手任务"
        desc="四个任务,难度递进:关分发开关、造 Getter、剥三层洋葱,最后造一把官方没有的改锥。"
      >
        <LabSet ch="type-magic" items={LABS} />
      </Section>

      {/* ================= §09 通关测验 ================= */}
      <Section
        id="quiz"
        index="09"
        title="通关测验"
        desc="八道题,分发和 infer 是重灾区 —— 拿不准就回 §04 的分发机再放一遍慢动作。"
      >
        <Quiz ch="type-magic" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            类型是一门小语言:输入类型、输出类型,只在编译期运行,
            打包产物零开销 —— 值世界的操作几乎都有类型世界的镜像。
          </>,
          <>
            三个「取」字辈零件:<code>keyof</code> 取键的联合、
            <code>typeof</code> 从值拍下类型、<code>T[K]</code>{" "}
            取字段类型(数组用 <code>T[number]</code> 取元素)。
          </>,
          <>
            条件类型 <code>T extends U ? X : Y</code> 是类型世界的三元;
            <b>裸类型参数遇到联合会分发</b>:拆开、逐个判、合并,never
            在并集里自动消失 —— Exclude 一行的全部原理。
          </>,
          <>
            <code>[T]</code> 包一层就不分发 —— 特性不是 bug,
            按「逐个处理」还是「整体判断」选用。
          </>,
          <>
            <code>infer</code> 在匹配里挖洞取类型;映射类型{" "}
            <code>{"{ [K in keyof T]: … }"}</code> 逐键改造,修饰符{" "}
            <code>+?/-?/readonly/-readonly</code> 拧上拧下,<code>as</code>{" "}
            + 模板字面量还能重造键名(TS 4.1)。
          </>,
          <>
            上一章的五把改锥你已经全部亲手复刻 ——
            但类型编程要克制:可读性永远优先于炫技。
          </>,
        ]}
      />

      <ChapterFooter ch="type-magic" />
    </main>
  );
}
