"use client";

// 第 04 章 · 结构化类型 —— 动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "excess-two-faces",
    title: "亲手触发多余属性检查的两副面孔",
    d: "easy",
    tags: ["Playground", "excess property"],
    task: (
      <p>
        打开 TypeScript Playground(typescriptlang.org/play),定义{" "}
        <code>{"type Order = { item: string; sweetness?: string }"}</code> 和一个{" "}
        <code>makeOrder(o: Order)</code> 函数。然后做两件事:① 把带错字属性{" "}
        <code>sweetnes</code> 的对象<b>字面量直接传</b>进去,看报错;②
        把同一个对象<b>先存进变量再传</b>,看它安静通过。
        读一遍 ① 的报错原文 —— TS 有没有猜出你想写什么?
      </p>
    ),
    hint: (
      <>
        两次传的对象一个字都不用改,唯一的区别是「现做现卖」还是
        「先存变量」—— 报错行为不同,就是多余属性检查只认「新鲜」字面量的证据。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="Playground"
          hl={[8, 12]}
          code={`type Order = { item: string; sweetness?: string };

function makeOrder(o: Order) {
  console.log(o.item, o.sweetness ?? "默认全糖");
}

// ① 字面量直传 —— 报错,还附赠猜测
makeOrder({ item: "波霸奶茶", sweetnes: "半糖" });
// Did you mean to write 'sweetness'?

// ② 先存变量 —— 通过,但半糖悄悄丢了
const draft = { item: "波霸奶茶", sweetnes: "半糖" };
makeOrder(draft); // 运行输出:波霸奶茶 默认全糖`}
        />
        <p>
          ① 的报错里有 Did you mean to write 'sweetness'? ——
          编译器不但拦下错字,还猜出了正确答案。② 编译通过,
          但运行结果是「默认全糖」:错字属性混了进来,真正的 sweetness
          从头到尾没被赋值。这就是两副面孔背后的取舍:字面量从严,变量从宽。
        </p>
      </>
    ),
  },
  {
    id: "three-ducks",
    title: "让三个出身不同的值,通过同一道门",
    d: "medium",
    tags: ["Playground", "duck typing"],
    task: (
      <p>
        在 Playground 里定义{" "}
        <code>{"type HasName = { name: string }"}</code> 和函数{" "}
        <code>greet(x: HasName)</code>。然后造三个「出身」完全不同的值:①
        一个 class 的实例;② 一个先存进变量的对象字面量;③
        一个函数的返回值 —— 让它们全部通过 greet,全程不写一次{" "}
        <code>HasName</code> 之外的类型注解。
      </p>
    ),
    hint: (
      <>
        三个值都不需要「声明自己是 HasName」——
        只要形状里有 name: string,鸭子测试自动放行。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="Playground"
          code={`type HasName = { name: string };

function greet(x: HasName) {
  console.log("你好," + x.name);
}

// ① class 实例 —— 没写 implements,也没关系
class Cat {
  name = "橘座";
  meow() {}
}
greet(new Cat()); // ✅

// ② 存过变量的对象字面量(多个 age 也不碍事)
const person = { name: "阿珍", age: 25 };
greet(person); // ✅

// ③ 函数返回值
function makeShop() {
  return { name: "喜茶平替", city: "杭州" };
}
greet(makeShop()); // ✅`}
        />
        <p>
          三个值和 HasName 之间零登记关系:没有 implements、没有类型注解、
          没有 as。编译器各比了一遍形状,都有 name: string,全部放行 ——
          关系是比出来的,不是登记出来的。
        </p>
      </>
    ),
  },
  {
    id: "brand-the-ids",
    title: "复刻一次 ID 混用事故,再用品牌类型堵上",
    d: "medium",
    tags: ["Playground", "branded types"],
    task: (
      <p>
        第一步:定义 <code>type UserId = string</code> 和{" "}
        <code>type PostId = string</code>,写一个{" "}
        <code>getUser(id: UserId)</code>,然后故意传一个 PostId 进去 ——
        确认编译器<b>毫无反应</b>。第二步:把两个类型改成品牌类型
        (branded types),让同样的误传<b>变成编译错误</b>。
      </p>
    ),
    hint: (
      <>
        既然编译器只认形状,就让形状不同:给每个类型 <code>&</code>{" "}
        上一个内容不同的 <code>__brand</code> 成员。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="Playground"
          hl={[9, 10]}
          code={`// 第一步:同为 string,随便混 —— 事故现场
type UserId0 = string;
type PostId0 = string;
declare function getUser0(id: UserId0): void;
declare const postId0: PostId0;
getUser0(postId0); // ✅ 编译器全程放行,可这是个 bug

// 第二步:把「不同」缝进形状
type UserId = string & { __brand: "user" };
type PostId = string & { __brand: "post" };

declare function getUser(id: UserId): void;
declare const postId: PostId;
// getUser(postId);
// ❌ Type '"post"' is not assignable to type '"user"'

// 造一个品牌值:入口处断言一次,内部全程安全
const uid = "u_42" as UserId;
getUser(uid); // ✅`}
        />
        <p>
          <code>__brand</code> 只存在于类型层面,运行时它就是普通
          string,零开销。真实项目里会把 as 收进一个{" "}
          <code>toUserId()</code> 工厂函数,让断言只发生在系统入口 ——
          这套完整手艺,终章「类型思维」再展开。
        </p>
      </>
    ),
  },
  {
    id: "empty-object-limits",
    title: "拿 {} 做一次极限测试",
    d: "hard",
    tags: ["Playground", "{} vs object"],
    task: (
      <p>
        在 Playground(确认右上角开着 strict)声明{" "}
        <code>{"let x: {} "}</code>,依次把这些值赋给它:<code>42</code>、
        <code>"奶茶"</code>、<code>true</code>、<code>{"() => {}"}</code>、
        <code>[1, 2]</code>、<code>null</code>、<code>undefined</code> ——
        记录哪些报错。再把 x 的类型换成 <code>object</code> 重测一轮,
        对比两张成绩单,总结 <code>{"{}"}</code> 和 <code>object</code>{" "}
        各挡住了什么。
      </p>
    ),
    hint: (
      <>
        <code>{"{}"}</code> 的字面意思是「有 0 个成员的东西」——
        用鸭子测试想想,几乎谁都合格;<code>object</code>{" "}
        才是「非原始值」的意思。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="Playground · strict 模式"
          code={`let x: {};
x = 42;         // ✅ number 也有 0 个「必需成员」
x = "奶茶";      // ✅
x = true;       // ✅
x = () => {};   // ✅
x = [1, 2];     // ✅
// x = null;      ❌ strictNullChecks 拦下
// x = undefined; ❌ 同上

let y: object;
// y = 42;      ❌ 原始值不行
// y = "奶茶";   ❌
y = () => {};   // ✅ 函数是对象
y = [1, 2];     // ✅ 数组也是对象
y = { a: 1 };   // ✅`}
        />
        <p>
          成绩单:<code>{"{}"}</code> 只挡 null 和 undefined,
          原始值全放行 —— 它的「要求清单」是空的,鸭子测试对空清单人人合格。
          <code>object</code> 挡掉全部原始值,只收对象、数组、函数。
          结论:想说「任意对象」用 <code>object</code>,想说「什么都可能,
          用之前先收窄」用 <code>unknown</code>,<code>{"{}"}</code>{" "}
          基本别用。
        </p>
      </>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: <>TypeScript 判断两个类型是否兼容,依据是什么?</>,
    opts: [
      <>类型的名字是否相同</>,
      <>类型的形状(成员及其类型)是否对得上</>,
      <>是否用 implements 或 extends 声明过关系</>,
      <>两个类型是否定义在同一个文件里</>,
    ],
    correct: 1,
    wrong: [
      <>
        名字只是标签 —— 两个不同名的 interface,形状相同照样互相赋值。
        「看名字」是 Java/C# 那套名义类型的规则,TS 不用。
      </>,
      undefined,
      <>
        声明关系在 TS 里不是必需的:一个从没写过 implements
        的对象字面量,只要形状对,照样通过 —— 关系是比出来的,
        不是登记出来的。
      </>,
      <>
        定义位置完全无关 —— 天南地北两个文件里的同形状类型,
        在编译器眼里就是可互换的。
      </>,
    ],
    why: (
      <>
        TS 是结构化类型(structural typing):比较类型时把名字撕掉,
        只对形状 —— 要求的成员都有、类型都对得上,就兼容。
        这就是「鸭子测试」。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>{"interface A { x: number }"}</code> 和{" "}
        <code>{"interface B { x: number }"}</code>,声明{" "}
        <code>const a: A = {"{ x: 1 }"}</code> 之后,
        <code>const b: B = a</code> 会怎样?
      </>
    ),
    opts: [
      <>报错 —— A 和 B 是两个不同的 interface</>,
      <>通过 —— 形状相同,名字不同也兼容</>,
      <>报错 —— 必须先写 A extends B</>,
      <>通过,但运行时会抛异常</>,
    ],
    correct: 1,
    wrong: [
      <>
        「不同 interface = 不同类型」是名义类型的直觉 —— TS
        里名字只是外号,x: number 对 x: number,严丝合缝。
      </>,
      undefined,
      <>
        extends 能让关系更好读,但它不是兼容的前提 ——
        没有任何声明,形状相同照样赋值成功。
      </>,
      <>
        不会有运行时异常 —— 类型在编译后全部擦除,这行赋值到了 JS
        里就是普通的 <code>const b = a</code>,和任何异常无关。
      </>,
    ],
    why: (
      <>
        同形状不同名的两个类型,在 TS 眼里可以互相赋值 ——
        名字是给人看的,编译器只看成员清单。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>{"type Staff = { name: string }"}</code>,变量{" "}
        <code>barista</code> 的类型是{" "}
        <code>{"{ name: string; makeTea: () => void }"}</code>。
        下面哪个赋值方向能通过?
      </>
    ),
    opts: [
      <>
        <code>const s: Staff = barista</code> —— 成员多的赋给成员少的
      </>,
      <>
        <code>const b: typeof barista = someStaff</code> ——
        成员少的赋给成员多的
      </>,
      <>两个方向都通过</>,
      <>两个方向都报错</>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        方向反了:Staff 身上翻不出 makeTea,缺孔 ——
        让只登记了名字的人直接上吧台,编译器不答应。
      </>,
      <>
        只有「多 ⭢ 少」这一个方向通:barista 满足 Staff 的全部要求,
        多带的技能不碍事;反过来 Staff 缺 makeTea,过不去。
      </>,
      <>
        「多 ⭢ 少」是通的 —— barista 有 name,类型也对,
        Staff 的要求全满足,多出来的成员不追究。
      </>,
    ],
    why: (
      <>
        成员多 = 更具体 = 更小的集合,小集合的值天然属于大集合 ——
        所以多的能当少的用,反之不行。20 项技能的老手能干 3
        项技能的活,反过来不行。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>makeOrder({"{ item: \"奶茶\", cup: \"大\" }"})</code>{" "}
        因为多了 cup 报错,可先执行{" "}
        <code>const d = {"{ item: \"奶茶\", cup: \"大\" }"}</code> 再{" "}
        <code>makeOrder(d)</code> 就通过了。为什么?
      </>
    ),
    opts: [
      <>存进变量后,cup 属性被编译器自动删掉了</>,
      <>
        多余属性检查只对「新鲜」的对象字面量生效 ——
        存过变量就按普通兼容规则(多的当少的用)处理
      </>,
      <>这是 TypeScript 的已知 bug,新版本会修</>,
      <>变量 d 的类型被推断成了 any</>,
    ],
    correct: 1,
    wrong: [
      <>
        编译器从不删你的属性 —— 类型检查不改变值,cup 原封不动地在
        d 身上,运行时照样能访问到。
      </>,
      undefined,
      <>
        这是写进语言设计的故意行为,不是 bug:字面量现做现卖,
        多写属性九成是拼错;存过变量的对象可能另有正业,不该误伤。
      </>,
      <>
        d 的类型被推断成{" "}
        <code>{"{ item: string; cup: string }"}</code>,清清楚楚,
        不是 any —— 通过靠的是「成员多的当成员少的用」这条正常规则。
      </>,
    ],
    why: (
      <>
        多余属性检查(excess property check)是给「新鲜」字面量开的小灶:
        现场写的对象多出属性,只可能是拼错或误解,从严;
        存过变量的对象可能被别处合法使用,从宽。
      </>
    ),
  },
  {
    type: "multi",
    q: <>关于结构化类型,下面哪些说法是对的?(多选)</>,
    opts: [
      <>给类型起一个新名字,不会创造出一个不兼容的新类型</>,
      <>class 的实例可以通过鸭子测试,赋给从没声明过关系的类型</>,
      <>对象字面量在任何位置多写属性都会报错</>,
      <>
        <code>{"{}"}</code> 类型几乎什么值都能接受(除 null / undefined)
      </>,
      <>两个类型想兼容,必须由同一个人定义</>,
    ],
    correct: [0, 1, 3],
    missHint: (
      <>
        还有对的没选全 —— 想想:名字是不是标签?class
        逃不逃得过鸭子测试?<code>{"{}"}</code> 的要求清单里有几项?
      </>
    ),
    extraHint: (
      <>
        选进了错误说法 —— 多写属性只在「字面量直传」时报错,存过变量就放行;
        而「谁定义的」编译器根本不看。
      </>
    ),
    why: (
      <>
        名字只是标签(A 正确);class 实例照样按形状比(B 正确);
        多余属性检查只管新鲜字面量,不是「任何位置」(C 错);
        <code>{"{}"}</code> 要求 0 个成员,几乎不设防(D 正确);
        定义者是谁完全无关(E 错)。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>UserId</code> 和 <code>PostId</code> 都定义为{" "}
        <code>string</code>,结果拿帖子 ID 查用户,编译器不报错。
        最对症的修法是?
      </>
    ),
    opts: [
      <>在每次调用前手写 if 判断 ID 的开头字母</>,
      <>
        用品牌类型:<code>{'string & { __brand: "user" }'}</code>{" "}
        让两个类型形状不同
      </>,
      <>把参数类型改成 any,绕开检查</>,
      <>给两个类型换更长的名字,方便肉眼区分</>,
    ],
    correct: 1,
    wrong: [
      <>
        运行时检查能兜底,但它在事故发生的地方才响 ——
        我们要的是编译期就拦下,这正是类型系统的本职。
      </>,
      undefined,
      <>
        any 是往反方向跑:它关掉全部检查,连原本能拦的错都放走了 ——
        问题是「检查不够细」,不是「检查太多」。
      </>,
      <>
        编译器不看名字,再长的名字形状还是 string ——
        肉眼区分挡不住深夜两点写代码的手。
      </>,
    ],
    why: (
      <>
        编译器只认形状,那就把「不同」写进形状:各缝一个内容不同的{" "}
        <code>__brand</code>,两个 string 从此形同陌路 ——
        零运行时开销,编译期就拦截。
      </>
    ),
  },
  {
    type: "fill",
    q: (
      <>
        TypeScript 这种「兼容看形状、不看名字」的类型系统,术语叫
        ________ typing(填英文单词)。
      </>
    ),
    placeholder: "英文单词…",
    answers: ["structural", "structural typing"],
    hint: (
      <>
        中文叫「结构化类型」—— 英文就是「结构的」那个形容词,
        本章标题的英文副标里也写着它。
      </>
    ),
    why: (
      <>
        structural typing,结构化类型 —— 与之相对的是 Java/C# 的
        nominal typing(名义类型):前者看能力,后者看血统。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        想给函数参数一个类型,表达「任意对象都行,但原始值不行」。
        应该用哪个?
      </>
    ),
    opts: [
      <>
        <code>{"{}"}</code>
      </>,
      <>
        <code>object</code>
      </>,
      <>
        <code>any</code>
      </>,
      <>
        <code>unknown</code>
      </>,
    ],
    correct: 1,
    wrong: [
      <>
        <code>{"{}"}</code> 看着像「对象」,实际要求是「有 0 个成员」——
        42、"奶茶"、true 统统能进来,根本挡不住原始值。
      </>,
      undefined,
      <>
        any 直接关掉检查,别说原始值,什么都拦不住 ——
        而且它还会传染给后续代码。
      </>,
      <>
        unknown 表达的是「什么都可能」,原始值也收 ——
        它安全,但语义不是「只要对象」。
      </>,
    ],
    why: (
      <>
        <code>object</code> 才是「非原始值」的意思:对象、数组、
        函数进得来,number/string/boolean 进不来。三兄弟分工:
        object 收对象,unknown 收一切但用前先收窄,<code>{"{}"}</code>{" "}
        基本别碰。
      </>
    ),
  },
];
