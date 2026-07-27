"use client";

// 第 04 章 · 结构化类型:
// 鸭子测试比喻 → 名义 vs 结构两种世界观 → 兼容规则(多的当少的用 + 集合观)→
// 多余属性检查(形状匹配器 + 为什么这样设计)→ 同形状的坑与品牌类型一瞥 →
// 动手任务 → 测验 → 要点。

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
import { LABS, QUIZ } from "@/lib/structural-data";
import { HeroDuck, CompatPlayground, ShapeMatcher } from "./viz";

export default function StructuralPage() {
  return (
    <main className="page" data-ch="structural">
      <Hero
        ch="structural"
        title={
          <>
            结构化<span className="grad">类型</span>
          </>
        }
        essence={
          <>
            走路像鸭子、叫声像鸭子,TypeScript 就把它当鸭子 ——
            不查户口,不看文凭,只看形状。这一章讲透这条贯穿全书的地基规则,
            顺便拆掉新手第一大惑:多余属性检查。
          </>
        }
        chips={[
          { id: "duck", n: "01", label: "鸭子测试" },
          { id: "nominal", n: "02", label: "名义 vs 结构" },
          { id: "compat", n: "03", label: "兼容规则" },
          { id: "excess", n: "04", label: "多余属性检查" },
          { id: "traps", n: "05", label: "同形状的坑" },
          { id: "labs", n: "06", label: "动手" },
          { id: "quiz", n: "07", label: "测验" },
        ]}
      >
        <HeroDuck />
      </Hero>

      {/* ================= §01 鸭子测试 ================= */}
      <Section
        id="duck"
        index="01"
        title="鸭子测试:看形状,不看名字"
        desc="想象一家奶茶店招人:老板不看学历证书,只看你会不会做奶茶 —— TypeScript 判断类型,用的就是这套标准。"
      >
        <Callout tone="story" title="一场只考实操的面试">
          <p>
            奶茶店缺人,老板贴出要求:<b>有名字,会做茶</b>。来了个应聘者,
            没带任何证书 —— 老板不在乎。名字?有。做茶?当场做了一杯。录用。
            至于这人以前叫「正式工」还是「隔壁店员工」,<b>没人问</b>。
          </p>
          <p>
            这就是结构化类型(structural typing)的全部精神:一个值是不是某个
            类型,<b>只看它有没有那个类型要求的成员</b>,不看它「声明过自己
            是谁」。英语世界管这叫鸭子测试(duck test):走路像鸭子、叫声像
            鸭子,那就是鸭子。
          </p>
        </Callout>

        <CodeBlock
          lang="ts"
          title="structural.ts · 从没「自称 Staff」的对象,照样上岗"
          hl={[15]}
          code={`type Size = "small" | "medium" | "large";

type Staff = {
  name: string;
  makeTea: (size: Size) => void;
};

function startShift(s: Staff) {
  console.log(s.name + " 上岗了");
}

// 注意:这个对象从头到尾没提过 Staff 三个字
const zhen = {
  name: "阿珍",
  makeTea(size: Size) {
    console.log("做一杯 " + size);
  },
};

startShift(zhen); // ✅ 通过 —— 长得像 Staff,就是 Staff`}
          note={
            <>
              <b>zhen</b> 和 Staff 之间没有任何「登记关系」——
              编译器只是拿它的形状对着 Staff 的形状比了一遍,严丝合缝,放行。
            </>
          }
        />

        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">名字 name</div>
            <div className="card-title">只是标签</div>
            <p>
              <code>Staff</code> 这个名字,是你给「某种形状」起的外号,
              方便人读。编译器比较类型时,把外号撕掉,只剩形状。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">形状 shape</div>
            <div className="card-title">才是本体</div>
            <p>
              有哪些成员、每个成员什么类型 —— 这才是编译器眼里的
              「类型本身」。两个类型形状相同,就是同一个类型的两个名字。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">鸭子测试 duck test</div>
            <div className="card-title">判定方式</div>
            <p>
              要求你有的,你都有,且类型对得上 —— 测试通过。
              从没「声明过关系」不要紧,<b>关系是比出来的,不是登记出来的</b>。
            </p>
          </div>
        </div>

        <Callout tone="warn" title="误区预警:「我 interface 起了个新名字,就是新类型了」">
          <p>
            不是。<code>interface A {"{ x: number }"}</code> 和{" "}
            <code>interface B {"{ x: number }"}</code>{" "}
            在编译器眼里可以互相赋值 —— 名字只是标签,形状相同就是兼容的。
            想让「同形状不同名」真的隔离开?§05 会给你看一招。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 名义 vs 结构 ================= */}
      <Section
        id="nominal"
        index="02"
        title="两种世界观:看血统 vs 看能力"
        desc="Java、C# 走的是另一条路:名义类型(nominal typing)—— 同一段代码,两个世界给出相反的判决。"
      >
        <CodePair
          left={
            <CodeBlock
              lang="js"
              title="Java · 名义类型:看血统"
              hl={[7]}
              code={`class MilkTea {
  String name;
}
class FruitTea {
  String name;
}

// MilkTea a = new MilkTea();
// FruitTea b = a;
// ❌ 编译错误:incompatible types
// 形状一模一样也没用 —— 不同名,就是陌生人`}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title="TypeScript · 结构化类型:看能力"
              hl={[9]}
              code={`class MilkTea {
  name = "";
}
class FruitTea {
  name = "";
}

const a = new MilkTea();
const b: FruitTea = a;
// ✅ 通过 —— 形状相同就兼容
// class 也逃不过鸭子测试`}
            />
          }
        />

        <p className="sec-desc">
          名义类型(nominal typing)看<b>血统</b>:你得明确声明「我继承自它」
          「我实现了它」,关系才成立 —— 像户口本,登记了才算一家人。
          结构化类型看<b>能力</b>:不用登记,现场比对形状 ——
          像招聘,会干活就行。注意右边那个例子:在 TypeScript 里,
          <b>连 class 都按形状比</b>,这是从 Java 转来的人最常撞的墙。
        </p>

        <Callout tone="deep" title="为什么 TypeScript 选了结构化?">
          <p>
            因为它要给 JavaScript 建模。JS 的日常是什么?随手一个对象字面量、
            从 JSON.parse 里蹦出来的数据、几个函数拼出来的鸭子 ——
            这些值<b>谁都没有「血统」</b>,没在任何地方登记过身份。
            要是类型必须先声明关系才兼容,那 TS 得逼所有 JS
            代码改写成注册式的,没人会用。结构化类型让 TS 能
            <b>直接描述 JS 世界的现状</b>,而不是要求 JS 变成另一门语言 ——
            这是「JS 超集」承诺的技术底座。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 兼容规则 ================= */}
      <Section
        id="compat"
        index="03"
        title="兼容规则:多的可以当少的用"
        desc="鸭子测试的方向感:一个 20 项技能的老手,当然能干「只要求 3 项技能」的活 —— 反过来不行。"
      >
        <CompatPlayground />

        <CodeBlock
          lang="ts"
          title="compat.ts · 上面实验台的代码版"
          hl={[10]}
          code={`type Staff = { name: string };

const barista = {
  name: "阿珍",
  makeTea: () => {},
  years: 3,
};

// 成员多 ⭢ 成员少:通过
const s: Staff = barista; // ✅

// 成员少 ⭢ 成员多:拒绝
const staff = { name: "新人" };
// const b: typeof barista = staff;
// ❌ 缺 makeTea 和 years`}
        />

        <Callout tone="deep" title="集合观:成员越多,集合越小">
          <p>
            换个角度想,直觉会更稳:<b>类型 = 一群值组成的集合</b>。
            <code>{"{ name: string }"}</code> 的集合很大 ——
            只要有名字的对象都算;
            <code>{"{ name: string; makeTea: () => void; years: number }"}</code>{" "}
            的集合小得多 —— 要求越多,合格的值越少。
          </p>
          <p>
            所以「成员多」=「更具体」=「更小的集合」。小集合里的每个值,
            天然也是大集合的成员 —— Barista 一定是 Staff,Staff
            不一定是 Barista。这个「小集合可以当大集合用」的方向感,
            上一章的联合类型、下一章的泛型约束,全靠它。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 多余属性检查 ================= */}
      <Section
        id="excess"
        index="04"
        title="多余属性检查:字面量的特殊待遇"
        desc="刚说完「多的成员不碍事」,编译器马上给你表演一个自相矛盾 —— 新手第一大惑,这一节拆到底。"
      >
        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title="字面量直传 · 报错"
              hl={[8]}
              code={`type Order = {
  item: string;
  sweetness?: string; // 糖度,可选
};

function makeOrder(o: Order) {}

makeOrder({
  item: "波霸奶茶",
  sweetnes: "半糖",
});
// ❌ 'sweetnes' does not exist
//    in type 'Order'`}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title="先存变量 · 通过"
              hl={[6]}
              code={`// 同一个对象,先存进变量
const draft = {
  item: "波霸奶茶",
  sweetnes: "半糖",
};

makeOrder(draft); // ✅ 编译通过

// 但注意:sweetness 没被赋值,
// 顾客要的半糖,悄悄丢了……`}
            />
          }
        />

        <p className="sec-desc">
          同一个对象,直接写成字面量传进去就报错,先存进变量再传就放行 ——
          这不是 bug,是一条<b>故意更严</b>的规则:多余属性检查(excess
          property check)。它只对「新鲜」(fresh)的对象字面量生效。
          为什么这样设计?想想两种场景的区别:
        </p>

        <div className="grid-2">
          <div className="card">
            <div className="card-kicker">字面量直传</div>
            <div className="card-title">现做现卖,没有别的买家</div>
            <p>
              这个对象是<b>当场为这次调用现写的</b>,写完就交货,
              不会有第二个用途。此时多写一个属性,只有两种可能:
              <b>拼错了</b>(sweetnes),或者<b>误解了类型</b>。
              两种都是 bug,编译器果断报错 —— 上面左边那杯半糖,
              就是这么被救回来的。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">先存变量</div>
            <div className="card-title">身份不新鲜,可能另有正业</div>
            <p>
              存过变量的对象,可能在别处有<b>完全合法的用途</b> ——
              它也许本来就是个信息更全的 Barista,顺路来干 Staff 的活。
              按 §03 的规则「多的当少的用」放行。代价是:拼错的属性
              也跟着混进来了,右边那杯半糖就这么丢的。
            </p>
          </div>
        </div>

        <ShapeMatcher />

        <Callout tone="warn" title="用 as 硬压检查?那是自欺">
          <p>
            <code>{'makeOrder({ item: "波霸奶茶", sweetnes: "半糖" } as Order)'}</code>{" "}
            确实能让报错消失 —— 但错字还在,半糖照样丢。<code>as</code>{" "}
            是对编译器说「别查了,我保证没错」,它不修 bug,只捂嘴。
            正确姿势永远是:看一眼报错里那个属性名,改对它。
          </p>
        </Callout>

        <Callout tone="win" title="报错读法速成">
          <p>
            <code>
              Object literal may only specify known properties, and 'sweetnes'
              does not exist in type 'Order'.
            </code>{" "}
            —— 翻译:对象字面量只能写目标类型认识的属性,
            <b>'sweetnes' 这个词 Order 里没有</b>。TS
            报这个错时,十有八九还会附一句 Did you mean to write
            'sweetness'?—— 它连正确答案都替你猜好了。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 同形状的坑 ================= */}
      <Section
        id="traps"
        index="05"
        title="同形状的坑:长得一样,不代表是一回事"
        desc="鸭子测试也有翻车的时候:两个语义上八竿子打不着的类型,只因形状撞车,就能随便互换。"
      >
        <Callout tone="story" title="奶茶店事故:自取单打出了外卖面单">
          <p>
            店里有两个类型:外卖平台的 <code>DeliveryAddress</code>{" "}
            和到店自取的 <code>PickupInfo</code>。两拨人分头定义,
            形状凑巧撞车 —— 都是一个电话加一句备注。某天有人把自取单
            传给了打面单的函数,编译器<b>一声没吭</b>:形状对得上,
            它没有理由拦。当晚,骑手照着「面单」上的备注,
            去店里取了一杯不存在的外卖。
          </p>
        </Callout>

        <CodeBlock
          lang="ts"
          title="collision.ts · 编译器没错,是我们没把「不同」写进类型"
          hl={[9]}
          code={`type DeliveryAddress = { phone: string; note: string };
type PickupInfo      = { phone: string; note: string };

function printShippingLabel(addr: DeliveryAddress) {
  // 打印外卖面单……
}

const pickup: PickupInfo = { phone: "138…", note: "少冰,到店自取" };
printShippingLabel(pickup);
// ✅ 编译通过 —— 但这单是自取的,根本不该打面单!`}
          note={
            <>
              结构化类型的判定完全正确:两个类型形状相同。问题在于
              「外卖」和「自取」的区别<b>只存在于我们脑子里</b>,
              没有写进形状 —— 编译器看不见脑子。
            </>
          }
        />

        <p className="sec-desc">
          更常见的版本是 ID 混用:<code>UserId</code> 和 <code>PostId</code>{" "}
          都是 string,于是「拿帖子 ID 查用户」这种事故,编译器全程放行。
          解决思路只有一个:<b>把区别写进形状</b> ——
          既然只认形状,那就让形状不同。
        </p>

        <CodeBlock
          lang="ts"
          title="branded.ts · 品牌类型(branded types)雏形一瞥"
          hl={[1, 2]}
          code={`type UserId = string & { __brand: "user" };
type PostId = string & { __brand: "post" };

declare function getUser(id: UserId): void;
declare const postId: PostId;

// getUser(postId);
// ❌ '__brand' 对不上 —— 两个 string 从此形同陌路`}
          note={
            <>
              给类型缝一个「品牌标签」成员,同为 string
              的两个类型形状就不同了。这里点到为止 ——
              完整的品牌类型手艺,终章「类型思维」回收。
            </>
          }
        />

        <Callout tone="warn" title={<>还有个惯犯:空对象类型 {"{}"}</>}>
          <p>
            按鸭子测试的逻辑推到极限:<code>{"{}"}</code> 要求
            「有 0 个成员」—— 那几乎什么值都合格。<code>42</code>、
            <code>"奶茶"</code>、函数、任何对象,统统能赋给{" "}
            <code>{"{}"}</code>(只有 null 和 undefined 进不来)。
            所以想表达「任意对象」,别用 <code>{"{}"}</code>,用{" "}
            <code>object</code>;想表达「什么都可能」,用{" "}
            <code>unknown</code> —— <code>{"{}"}</code>{" "}
            基本是个写出来像有要求、实际没要求的陷阱。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 动手任务 ================= */}
      <Section
        id="labs"
        index="06"
        title="动手任务"
        desc="四个任务,全在 TypeScript Playground(typescriptlang.org/play)就能做:亲手触发多余属性检查的两副面孔,再造一次同形状事故并堵上它。"
      >
        <LabSet ch="structural" items={LABS} />
      </Section>

      {/* ================= §07 通关测验 ================= */}
      <Section
        id="quiz"
        index="07"
        title="通关测验"
        desc="八道题。答完这章,「TS 怎么判断两个类型兼容」这个问题,你能从形状讲到集合,再讲到字面量的特殊待遇。"
      >
        <Quiz ch="structural" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            TypeScript 是<b>结构化类型</b>:兼容看形状不看名字 ——
            名字只是标签,成员清单才是类型本体。连 class 都按形状比。
          </>,
          <>
            方向感:<b>成员多的更具体,可以当成员少的用</b>;反过来不行。
            集合观帮记忆 —— 要求越多,集合越小,小集合天然属于大集合。
          </>,
          <>
            多余属性检查只对「新鲜」的对象字面量生效:<b>直传报错,
            存过变量放行</b> —— 现做现卖的对象,多写属性九成是拼错。
          </>,
          <>
            用 <code>as</code> 压掉多余属性报错是捂嘴不是治病;
            正确做法是把拼错的属性名改对。
          </>,
          <>
            同形状 = 可互换,哪怕语义无关 —— UserId 混 PostId
            这类事故,用品牌类型把「不同」写进形状;
            <code>{"{}"}</code> 几乎不设防,想说「任意对象」用{" "}
            <code>object</code>。
          </>,
        ]}
      />

      <ChapterFooter ch="structural" />
    </main>
  );
}
