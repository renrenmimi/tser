"use client";

// 终章 ✦ · 类型思维 —— 全书收束:
// 三兄弟(注解/as/satisfies)→ 断言的代价 → unknown 兜底边界 →
// any 的正确用法 → 类型即文档 → 类型体操入门 → 全书知识地图 →
// 动手任务 → 总测验 → 毕业寄语 → 全书要点。

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
import { LABS, QUIZ } from "@/lib/mindset-data";
import { HeroCreed, TrioLab, EraseFlow, RoadMap } from "./viz";

export default function MindsetPage() {
  return (
    <main className="page" data-ch="mindset">
      <Hero
        ch="mindset"
        title={
          <>
            终章:<span className="grad">类型思维</span>
          </>
        }
        essence={
          <>
            十一章下来,语法你都见过了。终章不教新语法,讲「怎么想」——
            类型不是给编译器交差的手续,是把你脑子里的约定写成代码。
            五条心法,一张地图,一场总测验。
          </>
        }
        chips={[
          { id: "trio", n: "01", label: "三兄弟" },
          { id: "assertion", n: "02", label: "断言的代价" },
          { id: "unknown", n: "03", label: "unknown 边界" },
          { id: "any", n: "04", label: "any 用法" },
          { id: "doc", n: "05", label: "类型即文档" },
          { id: "gym", n: "06", label: "类型体操" },
          { id: "map", n: "07", label: "知识地图" },
          { id: "labs", n: "08", label: "动手" },
          { id: "quiz", n: "09", label: "总测验" },
          { id: "grad", n: "10", label: "毕业" },
        ]}
      >
        <HeroCreed />
      </Hero>

      {/* ================= §01 三兄弟 ================= */}
      <Section
        id="trio"
        index="01"
        title="心法一 · 三兄弟:注解、as、satisfies"
        desc="同一个奶茶店配置对象,三种写法,三种人生 —— 差别全在「检查」和「推断」这两件事上。"
      >
        <Callout tone="story" title="三句口气不同的话">
          <p>
            给一个值「定类型」,其实是在跟编译器说话,而三种写法口气完全不同:
            <b>注解</b>(<code>: Config</code>)是「请你检查」——
            编译器认真查,但查完把推断改写成你声明的类型;<b>断言</b>(
            <code>as Config</code>)是「我说了算」—— 编译器闭嘴,检查跳过;
            <b>satisfies</b>(TS 4.9)是「检查完别改我」——
            形状照查,推断保留。口说无凭,上台对比:
          </p>
        </Callout>

        <TrioLab />

        <p className="sec-desc">
          三兄弟旁边还站着一位常搭档:<b>as const</b>。它不校验形状,
          干的是另一件事 —— 把字面量「钉死」:收窄到字面量类型,并且全员
          readonly:
        </p>

        <CodeBlock
          lang="ts"
          title="as const · 把字面量钉死"
          hl={[1, 5]}
          code={`const SIZES = ["small", "medium", "large"] as const;
// 类型:readonly ["small", "medium", "large"]
// 不是 string[] —— 一个字都没拓宽

type Size = (typeof SIZES)[number];
// "small" | "medium" | "large"
// 第 07 章的 typeof + 索引访问,在这里合体:
// 值只写一遍,类型从值里长出来`}
          note={
            <>
              经典配方:<b>satisfies 管「形状对不对」,as const
              管「字面量丢不丢」</b>,两个可以叠着用:
              <code>{"{...} as const satisfies Config"}</code>。
            </>
          }
        />
      </Section>

      {/* ================= §02 断言的代价 ================= */}
      <Section
        id="assertion"
        index="02"
        title="心法二 · 断言的代价:as 是签免责声明"
        desc="每写一个 as,你都在替编译器签一份「出了事算我的」—— 问题是,你真的比它知道得多吗?"
      >
        <p className="sec-desc">
          <code>as</code> 本身不是坏东西 —— 它是给「你确实比编译器知道得多」
          的场合准备的。判断标准就一条:<b>你的信息来自哪里?</b>
          来自你亲眼确认过的事实,合理;来自「我懒得处理」,自欺。
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title="合理 · 你真的知道得多"
              hl={[3]}
              code={`// 页面是你写的,#pay 确实是按钮
const btn = document
  .querySelector("#pay") as HTMLButtonElement;
btn.disabled = true;

// 测试桩:只造用得到的字段
const stub = {
  id: "T-1", total: 30,
} as Order; // 测试里只碰这两个字段`}
              note={
                <>
                  DOM 查询返回 <code>Element | null</code>,
                  编译器没读过你的 HTML,你读过 ——
                  这份信息差就是 as 的合法执照。
                </>
              }
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title="自欺 · 你只是懒得处理"
              hl={[3]}
              code={`// 网络那头长什么样,你根本不知道
const res = await fetch("/api/order/1");
const order = (await res.json()) as Order;

order.total.toFixed(2);
// 编译:通过 ✓
// 后端改了字段的那天:
// undefined.toFixed is not a function`}
              note={
                <>
                  fetch 回来的 JSON、localStorage、用户输入 ——
                  这些数据的形状<b>不归你的代码库管</b>,as
                  在这里不是自信,是眼罩。正确姿势见 §03。
                </>
              }
            />
          }
        />

        <Callout tone="warn" title="双跳断言:as unknown as T,最后的坦白">
          <p>
            当两个类型毫不沾边时,直接 as 会被编译器驳回,于是有人写{" "}
            <code>x as unknown as T</code> 强行两级跳。记住它的真实含义:
            <b>「我要求编译器彻底放弃对这个值的一切认知」</b> ——
            这是类型系统里最响亮的警报。偶尔在测试代码里当逃生舱可以,
            出现在业务代码里,基本等于类型设计出了问题,先回头改设计。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 unknown 边界 ================= */}
      <Section
        id="unknown"
        index="03"
        title="心法三 · unknown 兜底:守住类型世界的国境线"
        desc="编译器的管辖权到编译期为止 —— 运行时闯进来的数据,得靠你在边界上亲手查验。"
      >
        <p className="sec-desc">
          序章说过:类型在编译后<b>全部擦除</b>。这意味着一件冷酷的事 ——
          你写的每一个 interface,在线上都不存在;从外面进来的数据,
          没有任何自动检查。逐帧看清这条国境线:
        </p>

        <EraseFlow />

        <p className="sec-desc">
          那个站在边界上的 <code>isOrder</code>,就是第 03 章学过的
          <b>类型谓词(type predicate)</b> —— 值层面的检查,换来类型层面的收窄:
        </p>

        <CodeBlock
          lang="ts"
          title="边界校验函数 · 手写版"
          hl={[8, 16]}
          code={`interface Order {
  id: string;
  total: number;
  size: "small" | "medium" | "large";
}

// 返回类型 x is Order:检查通过,unknown 就地收窄成 Order
function isOrder(x: unknown): x is Order {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>; // 局部断言:只为逐字段检查
  return (
    typeof o.id === "string" &&
    typeof o.total === "number" &&
    (o.size === "small" || o.size === "medium" || o.size === "large")
  );
}

const data: unknown = await res.json(); // 先老实承认:不知道
if (isOrder(data)) {
  data.total.toFixed(2); // ✓ 这里 data 是 Order,证据确凿
} else {
  throw new Error("后端返回的数据不是 Order,拦在边界");
}`}
          note={
            <>
              注意第 10 行的 as:它只活在函数内部、只为逐字段检查服务,
              而且每个字段<b>真的被查了</b> ——
              这是「断言给检查打下手」,不是「断言替检查上岗」。
            </>
          }
        />

        <Callout tone="idea" title="校验多了,手酸怎么办">
          <p>
            真实项目里字段一多,手写校验又长又容易漏,社区早有解药:
            <b>zod</b> 这类运行时校验库 —— 用代码描述一次形状,
            校验函数和 TypeScript 类型都从这份描述自动长出来。
            本课不展开,只记一句:<b>它们解决的正是「类型擦除之后,
            运行时谁来查」这个问题</b>,思路和你刚手写的 isOrder 一模一样。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 any 用法 ================= */}
      <Section
        id="any"
        index="04"
        title="心法四 · any 不是原罪,失控才是"
        desc="骂 any 容易,用好 any 难 —— 它是拆弹工具,不是日用品。"
      >
        <p className="sec-desc">
          全书说了十一章「少用 any」,终章说句公道话:any
          有它的合法岗位 —— <b>迁移期的旧代码</b>(第 10 章的过渡态)、
          <b>真正动态的边界层</b>(eval 的产物、结构完全未知的第三方回调)。
          用它的纪律只有一条:<b>控制爆炸半径</b>。
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title="失控 · any 泄漏进导出签名"
              hl={[2, 7]}
              code={`// utils.ts
export function parseOrder(raw: any): any {
  return JSON.parse(raw);
}

// 三个月后,另一个文件:
const o = parseOrder(raw); // o: any
o.tatol; // 拼错了,没人管 ——
// any 顺着调用链传染了整个项目`}
              note={
                <>
                  any 会传染:从 any 里取出的每个值还是 any。
                  它一旦进入导出签名,全项目的调用方都被拖下水。
                </>
              }
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title="受控 · 脏活关在屋里干"
              hl={[2, 5]}
              code={`// utils.ts
export function parseOrder(raw: string): Order {
  // 屋里怎么折腾都行,哪怕局部 any:
  const data: unknown = JSON.parse(raw);
  if (!isOrder(data)) throw new Error("坏数据");
  return data; // 出门时是干净的 Order
}

const o = parseOrder(raw); // o: Order ✓`}
              note={
                <>
                  导出签名干干净净,调用方全程有保护 ——
                  <b>邋遢可以,但只准在自己屋里邋遢</b>。
                </>
              }
            />
          }
        />

        <Callout tone="idea" title="口诀:先 unknown,不行再 any">
          <p>
            两者都能收下任何值,差别在取用:unknown <b>必须收窄才能用</b>
            (编译器逼你补检查),any 直接放行(检查全关)。
            所以拿不准类型时,第一反应永远是 unknown ——
            它是「类型安全的 any」;真到 unknown 让你寸步难行的动态场景,
            再降级到 any,并且把它锁在最小的作用域里。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 类型即文档 ================= */}
      <Section
        id="doc"
        index="05"
        title="心法五 · 类型即文档:让非法状态无法表示"
        desc="最好的注释会过时,最好的文档会没人读 —— 只有类型,骗它的代码根本编译不过。"
      >
        <p className="sec-desc">
          同一个订单状态,两种建模,高下立判。左边的每个字段都「可能有」,
          于是<b>鬼状态</b>随便造;右边用第 03 章的可辨识联合,
          把「什么状态下有什么字段」写成铁律:
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title="一个大对象,全可选 · 鬼状态自由通行"
              hl={[3, 4, 5]}
              code={`interface Order {
  status: string;      // 拼错也没人管
  paidAt?: Date;
  deliveredAt?: Date;
  cancelReason?: string;
}

// 这些「鬼状态」全都合法:
// 已送达,但从没付过钱:
//   { status: "delivered" }
// 已取消,却还在配送:
//   { status: "canceled",
//     deliveredAt: 昨天 }`}
              note={
                <>
                  文档里写「status 为 paid 时才有 paidAt」?
                  文档不报错,代码不看文档 —— 约定只活在人的记性里。
                </>
              }
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title="可辨识联合 · 非法状态不可表示"
              hl={[2, 3, 4, 5]}
              code={`type Order =
  | { status: "unpaid";    items: Item[] }
  | { status: "paid";      items: Item[]; paidAt: Date }
  | { status: "delivered"; items: Item[]; paidAt: Date;
      deliveredAt: Date }
  | { status: "canceled";  reason: string };

// 「已送达但没付钱」?
// 这个类型根本写不出来 ——
// 编译器:missing paidAt。
// 约定从注释升级成了铁律`}
              note={
                <>
                  switch (order.status) 之后各分支字段自动就位,
                  never 兜住穷尽 —— 03 章的技术,终章的思想:
                  <b>把约定编码进类型,而不是备注在旁边</b>。
                </>
              }
            />
          }
        />

        <Callout tone="deep" title="这条心法为什么排最后">
          <p>
            前四条心法都在讲「怎么跟编译器相处」,这一条讲的是
            <b>类型系统真正的用途</b>:它不是拼写检查器,
            是给你的领域规则建模的语言。「订单没付钱就不可能已送达」——
            这句话写进类型,今后每一个违反它的 bug,都活不过编译。
            能把业务约定翻译成类型的人,和只会加注解的人,
            是两个工种。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 类型体操 ================= */}
      <Section
        id="gym"
        index="06"
        title="类型体操入门:自己动手造改锥"
        desc="06 章用过的工具、07 章拆过的零件 —— 现在合起来,亲手造两把。"
      >
        <p className="sec-desc">
          第一道:<b>MyOmit</b> —— 重写 06 章天天用的 Omit。
          零件全在 07 章:映射类型遍历键,<code>as</code> 键重映射(TS 4.1)
          负责「踢人」:
        </p>

        <CodeBlock
          lang="ts"
          title="第一道 · MyOmit"
          hl={[4]}
          code={`// 目标:MyOmit<Order, "toppings"> = 去掉 toppings 的 Order

type MyOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

// 拆开读第 4 行:
//   [P in keyof T          —— 逐个遍历 T 的键(映射类型)
//    as P extends K        —— 键重映射:每个键过一遍安检
//       ? never : P]       —— 在黑名单 K 里?重命名成 never = 除名
//   : T[P]                 —— 留下的键,值类型照抄(索引访问)

type Draft = MyOmit<Order, "paidAt" | "deliveredAt">; // ✓`}
          note={
            <>
              <code>extends K ? never : P</code> 里的 never 又立功了:
              键被映射成 never 就等于被删掉 —— 空集在类型运算里是万能橡皮。
            </>
          }
        />

        <p className="sec-desc">
          第二道上难度:<b>DeepReadonly</b> —— Readonly
          只锁一层,嵌套对象里面照改不误;想全锁,让映射类型<b>递归</b>:
        </p>

        <CodeBlock
          lang="ts"
          title="第二道 · DeepReadonly"
          hl={[2, 3]}
          code={`type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>   // 是对象?进去继续锁(递归)
    : T[K];                // 是原始值?锁到头了
};

const cfg: DeepReadonly<{
  shop: string;
  hours: { open: number; close: number };
}> = { shop: "茶言观色", hours: { open: 9, close: 22 } };

cfg.hours.open = 8;
// ✕ Cannot assign to 'open' because it is
//   a read-only property —— 里层也锁住了`}
          note={
            <>
              条件类型(07 章)+ 映射类型(07 章)+ 递归 = 一把新改锥。
              严谨版还要对函数、数组开小灶(函数也是 object,
              但没必要往里递归)—— 那是 type-challenges 里 medium 难度的坑,
              留给你去踩。
            </>
          }
        />

        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">练功房 · 题库</div>
            <div className="card-title">🏋️ type-challenges</div>
            <p>
              github.com/type-challenges/type-challenges ——
              社区维护的类型体操题库,从 easy 到 extreme,
              每题都能在 Playground 里做、有测试用例当场判分。
              你刚写的 MyOmit 和 DeepReadonly 都是里面的原题。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">原典 · 官方手册</div>
            <div className="card-title">📖 TypeScript Handbook</div>
            <p>
              typescriptlang.org/docs 下的 Handbook 是第一手资料:
              本书讲过的每个概念,那里都有权威版本。
              你现在的水平,读它不再费劲 —— 这是这门课给你的入场券。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">工作台 · 随手验证</div>
            <div className="card-title">🧪 TS Playground</div>
            <p>
              typescriptlang.org/play —— 免注册、可分享链接、能切 TS
              版本、能看编译产物。拿不准的行为,别猜,贴进去五秒出答案。
              这个习惯比任何知识点都值钱。
            </p>
          </div>
        </div>
      </Section>

      {/* ================= §07 知识地图 ================= */}
      <Section
        id="map"
        index="07"
        title="全书回顾:从值到类型到工程,一张地图"
        desc="十二章,五个阶段。每章一句灵魂总结 —— 哪句读着心虚,点卡片回去补课。"
      >
        <RoadMap />
      </Section>

      {/* ================= §08 动手任务 ================= */}
      <Section
        id="labs"
        index="08"
        title="动手任务"
        desc="心法要过手才算数:三兄弟实验、手写校验器、两道体操。"
      >
        <LabSet ch="mindset" items={LABS} />
      </Section>

      {/* ================= §09 总测验 ================= */}
      <Section
        id="quiz"
        index="09"
        title="总测验"
        desc="十二道题横跨全书 —— 推断、收窄、结构化、泛型、工具类型、类型运算、tsconfig,一个不少。全对,才算把 TypeScript 讲透的「透」字拿到手。"
      >
        <Quiz ch="mindset" items={QUIZ} />
      </Section>

      {/* ================= §10 毕业寄语 ================= */}
      <Section
        id="grad"
        index="10"
        title="毕业寄语,和接下来的路"
        desc="课程到这里讲完了。但「学透」的最后一步,从来都在课程外面。"
      >
        <Callout tone="win" title="你已经毕业了">
          <p>
            序章那天,你还在问「类型能干嘛,JS 不是跑得好好的」。现在你能读懂
            报错里的每一个单词,能给 fetch 回来的数据设计校验边界,能用可辨识
            联合让非法状态无法表示,能亲手把 Omit 造出来,还能给一个祖传 JS
            项目排一份渐进迁移的计划。十二章没有白走。
          </p>
        </Callout>

        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">路线一 · 动手</div>
            <div className="card-title">把奶茶店系统真写出来</div>
            <p>
              用 Vite + TypeScript 起个项目,把贯穿全书的点单系统实现出来:
              MenuItem、可辨识联合的 Order、泛型容器、Partial
              草稿单、边界上的 isOrder —— strict 全开,
              noUncheckedIndexedAccess 也签上。
            </p>
            <p>写完你会发现:全书的类型,一直在描述同一个世界。</p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">路线二 · 深潜</div>
            <div className="card-title">每天一道体操</div>
            <p>
              type-challenges 从 easy 刷起,每天一道,做不出看讨论区 ——
              那里藏着社区最聪明的类型写法。刷完 easy 和 medium,
              你读任何开源库的类型定义都不再发怵。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">路线三 · 实战</div>
            <div className="card-title">去读真实世界的类型</div>
            <p>
              打开你最常用的 JS 库,去 node_modules 里读它的 .d.ts;
              去 DefinitelyTyped 看看 @types 是怎么给 JS 库补类型的 ——
              能读懂别人的类型设计,才谈得上设计自己的。
            </p>
            <p>作品和 PR,比证书有说服力。</p>
          </div>
        </div>

        <div className="ms-farewell">
          <span className="ms-farewell-mark" aria-hidden>
            ✦
          </span>
          <p>
            最后说句真心话。这门课教的不是语法,是<b>一种世界观</b>:
            程序里的每个值都有形状,形状可以被描述、被检查、被推导 ——
            而你脑子里那些「这里不会是 null」「这个状态下一定有那个字段」
            的默契,统统可以写下来,交给一个永不疲倦的审查员。
            往后你写任何语言,都会先想「这里的约定是什么」——
            这个习惯,就是这门课真正教给你的东西。
          </p>
          <p>
            <b>类型已签,后会有期。</b>
          </p>
        </div>
      </Section>

      <KeyPoints
        title="这一整门课,真正要带走的"
        points={[
          <>
            类型是「约定的形状」:写下来的约定编译器替你守,
            记在脑子里的约定只能靠运气。
          </>,
          <>
            三兄弟口诀:注解检查但拓宽,as 不检查还拓宽,satisfies
            又检查又保推断 —— 配上 as const 钉死字面量。
          </>,
          <>
            编译器的管辖权到编译期为止(类型擦除)。外部数据一律
            unknown 进门,边界上用类型谓词收窄 —— 错误要炸在边界,
            不是炸在千里之外。
          </>,
          <>
            any 只在迁移期和真正动态的边界层合法,纪律是控制爆炸半径:
            局部可以脏,导出签名必须干净。先 unknown,不行再 any。
          </>,
          <>
            最高级的类型是建模:用可辨识联合让非法状态不可表示 ——
            约定从注释升级成铁律,违反它的 bug 活不过编译。
          </>,
          <>
            拿不准就去 Playground 验证,想变强就去 type-challenges
            刷题,要权威就读 Handbook —— 工具都在手上了,去吧。
          </>,
        ]}
      />

      <ChapterFooter ch="mindset" />
    </main>
  );
}
