"use client";

// 第 05 章 · 泛型:
// 三份重复函数的痛 → 留一个洞(类型洞填充机)→ 推断与显式 →
// 约束 extends(安检门)→ 泛型接口/默认类型参数(奶茶店容器)→
// 类型擦除与常见误区 → 动手任务 → 测验 → 要点。

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
import { LABS, QUIZ } from "@/lib/generics-data";
import { HeroMold, HoleFiller, ConstraintGate } from "./viz";

export default function GenericsPage() {
  return (
    <main className="page" data-ch="generics">
      <Hero
        ch="generics"
        title={
          <>
            泛型:留个洞的<span className="grad">模具</span>
          </>
        }
        essence={
          <>
            先别急着说是什么类型 —— 留一个洞 <code>&lt;T&gt;</code>,
            调用的人来填。编译器只承诺一件事,却值千金:
            同一个洞,处处填的是同一种。
          </>
        }
        chips={[
          { id: "pain", n: "01", label: "先痛一下" },
          { id: "hole", n: "02", label: "留一个洞" },
          { id: "infer", n: "03", label: "推断与显式" },
          { id: "constraint", n: "04", label: "约束 extends" },
          { id: "containers", n: "05", label: "泛型容器" },
          { id: "erased", n: "06", label: "擦除与误区" },
          { id: "labs", n: "07", label: "动手" },
          { id: "quiz", n: "08", label: "测验" },
        ]}
      >
        <HeroMold />
      </Hero>

      {/* ================= §01 先痛一下 ================= */}
      <Section
        id="pain"
        index="01"
        title="先痛一下:一个 first 函数的三种坏写法"
        desc="需求小得不能再小:取数组第一个元素。没有泛型的世界,这件事居然做不体面。"
      >
        <Callout tone="story" title="奶茶店的点单系统,遇到一个小需求">
          <p>
            「把订单列表的第一单拿出来」「把菜单的第一款拿出来」
            「把糖度选项的第一个拿出来」—— 同一个动作,不同的数组。
            你打开编辑器,发现自己站在三岔路口,<b>三条路都不对劲</b>。
          </p>
        </Callout>

        <CodeBlock
          lang="ts"
          title="路线一 · 每种类型抄一份:代码复读机"
          code={`function firstString(arr: string[]): string | undefined {
  return arr[0];
}
function firstNumber(arr: number[]): number | undefined {
  return arr[0];
}
function firstOrder(arr: Order[]): Order | undefined {
  return arr[0];
}
// 函数体一字不差,抄了三遍 —— 明天来个 MenuItem[],抄第四遍?`}
        />

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title="路线二 · 全部用 any:类型丢在门口"
              hl={[4, 6]}
              code={`function first(arr: any[]): any {
  return arr[0];
}

const x = first(["三分糖", "七分糖"]);
// x 的类型是 any —— 进去是 string,
x.toFixed(2); // 出来成了「随便」,
// 编译器不拦,运行时才炸`}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title="路线三 · 泛型:一份代码,类型不丢"
              hl={[1, 5]}
              code={`function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const x = first(["三分糖", "七分糖"]);
// x 的类型是 string | undefined
// x.toFixed(2);
// ❌ 编译期就拦下 —— 类型全程在线`}
            />
          }
        />

        <p className="sec-desc">
          看右边:<code>first&lt;T&gt;</code> 一份代码通吃所有数组,
          而且<b>输入和输出联动</b> —— 喂它 string[],它保证吐出来的和
          string 有关;喂它 Order[],吐出来的就和 Order 有关。
          「写一次,类型不丢」,这就是泛型(generics)解决的问题。
          它是怎么做到的?下一节慢放给你看。
        </p>
      </Section>

      {/* ================= §02 留一个洞 ================= */}
      <Section
        id="hole"
        index="02"
        title="留一个洞:<T> 是怎么工作的"
        desc="把 first<T> 想成一副模具:T 是模具上留的洞,调用时才浇进具体的类型 —— 同一炉,处处同一种。"
      >
        <HoleFiller />

        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">声明洞</div>
            <div className="card-title">&lt;T&gt;</div>
            <p>
              函数名后的尖括号,是在说「本函数留了一个类型洞,取名 T」。
              T 叫类型参数(type parameter)—— 参数,只不过装的是类型,
              不是值。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">用洞</div>
            <div className="card-title">arr: T[]、返回 T</div>
            <p>
              签名里每个 T 都指向同一个洞。这就是承诺:
              <b>arr 里装的,和返回的,必定是同一种</b> ——
              这份「联动」正是 any 给不了的。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">填洞</div>
            <div className="card-title">调用时才发生</div>
            <p>
              写模具的人不知道 T 是什么,也不需要知道;
              调用的人拿实参一喂,编译器当场解出 T。
              一副模具,浇多少种类型都行。
            </p>
          </div>
        </div>

        <CodeBlock
          lang="ts"
          title="pair.ts · 「同一个洞,处处同一种」不是空话"
          hl={[6]}
          code={`function pair<T>(a: T, b: T): T[] {
  return [a, b];
}

pair("小杯", "大杯"); // ✅ T = string
pair("小杯", 42);
// ❌ 同一个洞,不能一半 string 一半 number
//    Argument of type 'number' is not
//    assignable to parameter of type 'string'`}
          note={
            <>
              编译器从第一个实参解出 T = string,第二个实参 42
              立刻露馅。想两种类型混着来?那得留两个洞:
              <code>{"pair<A, B>(a: A, b: B)"}</code> —— 动手任务里练。
            </>
          }
        />

        <Callout tone="idea" title="T 这个名字,不神秘">
          <p>
            T 只是惯例(Type 的首字母),叫 <code>Item</code>、
            <code>Row</code> 都行,和参数叫 x 还是 count 一个道理。
            惯例里还有 K、V(键、值)、E(元素)。名字短是因为洞
            通常「什么都可能」,起不出更具体的名 ——
            真有含义时,就该起真名:<code>{"Paginated<Order>"}</code>{" "}
            里的 Order 比 T 好读得多。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 推断与显式 ================= */}
      <Section
        id="infer"
        index="03"
        title="填洞的两种姿势:推断,或者点名"
        desc="大多数时候你根本看不到 T 被填 —— 编译器从实参里自己解出来。但也有非点名不可的时候。"
      >
        <CodeBlock
          lang="ts"
          title="calls.ts · 同一个函数,两种调法"
          hl={[2, 5, 8]}
          code={`// 姿势一:显式点名 —— 尖括号里亲手填洞
const a = first<string>(["三分糖", "七分糖"]);

// 姿势二:推断 —— 编译器看实参,自己解
const b = first(["三分糖", "七分糖"]); // T = string,一个字不用写

// 推断没原料的时刻:空数组
const c = first([]);        // T 被推成 never,c 是 undefined
const d = first<string>([]); // 点名 T = string,d 是 string | undefined`}
          note={
            <>
              经验法则:<b>默认靠推断</b>,代码最干净;推断的原料永远来自
              实参 —— 实参给不出信息(比如空数组),或推出来的不是你想要的,
              再显式点名。
            </>
          }
        />

        <Callout tone="deep" title="推断解不出来的时候,编译器怎么办?">
          <p>
            <code>first([])</code> 里,空数组给不出任何线索,T 被推成{" "}
            <code>never</code>(空集,03 章的老朋友)——
            意思是「这数组里什么都没有,元素类型无从谈起」。
            这不是报错,但往往不是你想要的。看到 never
            出现在意料之外的地方,第一反应就该是:
            <b>推断缺原料了,去点名</b>。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 约束 extends ================= */}
      <Section
        id="constraint"
        index="04"
        title="约束:这个洞,不是什么都能填"
        desc="洞留得太自由也有代价:函数体里对 T 什么都不敢做。extends 给洞立门规 —— 来者必须长这样。"
      >
        <CodeBlock
          lang="ts"
          title="longest.ts · 没约束,寸步难行;有约束,理直气壮"
          hl={[7]}
          code={`// 想写:谁长谁赢。可 T 什么都可能是……
// function longest<T>(a: T, b: T): T {
//   return a.length >= b.length ? a : b;
//   // ❌ Property 'length' does not exist on type 'T'
// }

function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b; // ✅ 门规保证了 length 存在
}

longest("波霸奶茶", "四季春");   // ✅ T = string
longest([1, 2, 3], [4, 5]);     // ✅ T = number[]
longest(10, 100);
// ❌ number 没有 length,门口就被拦下`}
          note={
            <>
              <code>{"T extends { length: number }"}</code> 读作:
              「T 可以是任何类型,<b>只要它的形状兼容</b>{" "}
              {"{ length: number }"}」—— extends 在这里是「符合、兼容」,
              不是 class 继承的那个 extends。
            </>
          }
        />

        <ConstraintGate />

        <Callout tone="idea" title="安检标准,正是上一章的鸭子测试">
          <p>
            门开不开,判定方式一个字没变:<b>看形状</b>。string 有
            length,放行;<code>{"{ length: 12 }"}</code>{" "}
            这种无名对象,有 length 也放行 —— 泛型约束就是
            「结构化类型 + 一个洞」,两章的知识在这里咬合。
          </p>
        </Callout>

        <CodeBlock
          lang="ts"
          title="getProp.ts · 约束的高光时刻(07 章伏笔)"
          hl={[1]}
          code={`function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const order = { item: "波霸奶茶", price: 18 };

getProp(order, "price"); // 类型是 number —— 编译器连返回值都算准了
getProp(order, "topping");
// ❌ Argument of type '"topping"' is not assignable
//    to parameter of type '"item" | "price"'`}
          note={
            <>
              两个洞:T 装对象,K 被约束成「T 的某个键」。于是传错键名
              <b>编译期就拦</b>,返回值类型还能精确到那个键对应的类型。
              <code>keyof</code> 和 <code>T[K]</code> 是 07
              章「类型运算」的主角,这里混个脸熟就行。
            </>
          }
        />
      </Section>

      {/* ================= §05 泛型容器 ================= */}
      <Section
        id="containers"
        index="05"
        title="泛型接口:给奶茶店造通用容器"
        desc="洞不只函数能留 —— interface 和 type 也能。分页、接口响应这类「壳子固定、内容百变」的结构,正是泛型的主场。"
      >
        <CodeBlock
          lang="ts"
          title="containers.ts · 一个壳子,装遍全店"
          hl={[5, 10, 13, 19]}
          code={`type Size = "small" | "medium" | "large";
type Order = { id: number; item: string; size: Size };
type MenuItem = { name: string; price: number };

interface Box<T> {
  value: T;
}

// 后端接口的统一信封:code/msg 固定,data 百变
type ApiResponse<T> = { code: number; msg: string; data: T };

// 分页的壳子:list 里装什么,调用方说了算
type Paginated<T> = {
  list: T[];
  page: number;
  total: number;
};

type OrderPage = Paginated<Order>;        // 订单分页
type MenuRes = ApiResponse<MenuItem[]>;   // 菜单接口的响应

const page1: OrderPage = {
  list: [{ id: 1, item: "波霸奶茶", size: "large" }],
  page: 1,
  total: 42,
}; // list 里混进一个 MenuItem?编译器立刻翻脸`}
          note={
            <>
              使用带洞的类型时必须填洞:<code>Paginated&lt;Order&gt;</code>{" "}
              合法,裸写 <code>Paginated</code> 会报错「Generic type
              requires 1 type argument」—— 模具不浇料,出不了货。
            </>
          }
        />

        <CodeBlock
          lang="ts"
          title="default.ts · 默认类型参数:洞也可以有默认值"
          hl={[2]}
          code={`// 不填洞时,T 默认按 string 算
type Labeled<T = string> = { label: string; value: T };

const size: Labeled = { label: "杯型", value: "large" };
// ✅ 没填洞,T = string

const stock: Labeled<number> = { label: "库存", value: 42 };
// ✅ 填了洞,T = number`}
          note={
            <>
              <code>{"<T = string>"}</code> 和函数参数默认值一个思路:
              最常见的用法免填,特殊场合再点名。
            </>
          }
        />

        <Callout tone="win" title="你早就每天在用泛型了">
          <p>
            <code>string[]</code> 其实是 <code>Array&lt;string&gt;</code>{" "}
            的糖 —— Array 就是个带洞的接口;
            <code>Promise&lt;Order&gt;</code>「将来会给你一个
            Order」、<code>Map&lt;string, number&gt;</code>
            (两个洞)全是同款。读懂了洞,标准库的类型签名就从天书变成了
            说明书。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 擦除与误区 ================= */}
      <Section
        id="erased"
        index="06"
        title="泛型不在运行时,以及三个高频误区"
        desc="最后校准一次认知:洞是编译期的概念 —— 还有几个新手常见的想岔,顺手掰直。"
      >
        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title="你写的 TypeScript"
              code={`function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const x = first<string>(["三分糖"]);`}
            />
          }
          right={
            <CodeBlock
              lang="js"
              title="编译后的 JavaScript"
              code={`function first(arr) {
  return arr[0];
}

const x = first(["三分糖"]);`}
            />
          }
        />

        <p className="sec-desc">
          序章说过的「类型擦除」在这里再次生效:<code>&lt;T&gt;</code>、
          <code>&lt;string&gt;</code>、所有注解,编译后<b>一个不剩</b>。
          所以运行时不存在「问一下 T 是什么」这种操作 ——
          泛型是编译器在你保存文件那一刻做的推理,不是程序跑起来的机关。
        </p>

        <Callout tone="warn" title="误区一:无意义泛型 —— 洞白留了">
          <p>
            <code>{"function log<T>(x: T): void { console.log(x) }"}</code>{" "}
            —— T 只出现了一次,没联动任何东西,这个洞什么承诺都没兑现。
            经验法则:<b>类型参数至少出现两次</b>
            (联动两个参数,或联动参数和返回值)才值得留洞;只出现一次,
            直接写 <code>{"(x: unknown)"}</code> 更诚实。
          </p>
        </Callout>

        <Callout tone="warn" title="误区二:「泛型不就是 any 吗」—— 恰恰相反">
          <p>
            any 是<b>放弃</b>类型:进去什么,出来都是「随便」,检查全关。
            泛型是<b>保住</b>类型:T 在调用那一刻被解出具体类型,
            输入输出全程联动、全程受检。一个丢,一个不丢 ——
            方向完全相反的两个东西,只是都写着「什么类型都能来」。
          </p>
        </Callout>

        <Callout tone="warn" title="误区三:.tsx 文件里,箭头函数的 <T> 写不出来">
          <p>
            在 .tsx 里写 <code>{"const id = <T>(x: T) => x"}</code>,
            编译器会把 <code>&lt;T&gt;</code> 当成一个 JSX 标签的开头,
            会把 <code>&lt;T&gt;</code> 当成 JSX 标签,报语法错。解法是加个逗号消歧义:
            <code>{"const id = <T,>(x: T) => x"}</code> ——
            纯 .ts 文件没这个问题,function 声明也没有。一句话记住:
            <b>tsx 里箭头函数留洞,逗号护体</b>。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 动手任务 ================= */}
      <Section
        id="labs"
        index="07"
        title="动手任务"
        desc="四个任务,全在 TypeScript Playground 就能做:把复读机代码合成一个泛型,给奶茶店写分页容器,再玩一轮约束和双洞模具。"
      >
        <LabSet ch="generics" items={LABS} />
      </Section>

      {/* ================= §08 通关测验 ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="八道题。答完这章,下次看到 <T extends X = Y> 这种签名,你眼里就不再是乱码,而是「一个带门规、带默认值的洞」。"
      >
        <Quiz ch="generics" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            泛型 = <b>留个洞的模具</b>:<code>&lt;T&gt;</code> 声明洞,
            签名里的每个 T 指向同一个洞 —— 编译器保证同一炉浇的是同一种。
          </>,
          <>
            泛型和 any 方向相反:any 把类型丢在门口,泛型让类型
            <b>从输入一路联动到输出</b> —— 这是「写一次,类型不丢」的关键。
          </>,
          <>
            填洞默认靠<b>推断</b>(原料来自实参);推断缺原料(如空数组)
            或推得不对时,显式点名 <code>first&lt;string&gt;([])</code>。
          </>,
          <>
            <code>extends</code> 给洞立门规,判定标准就是上一章的鸭子测试;
            <code>{"K extends keyof T"}</code> 让「传错键名」死在编译期 ——
            07 章展开。
          </>,
          <>
            洞是编译期的:类型擦除后 <code>&lt;T&gt;</code> 无影无踪。
            类型参数至少出现两次才值得留洞,只出现一次不如 unknown;
            .tsx 里箭头函数留洞记得 <code>&lt;T,&gt;</code>。
          </>,
        ]}
      />

      <ChapterFooter ch="generics" />
    </main>
  );
}
