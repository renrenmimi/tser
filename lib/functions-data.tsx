"use client";

// 第 02 章 · 函数与对象类型 —— 动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "annotate-maketea",
    title: "给 makeTea 补一张进出货单",
    d: "easy",
    tags: ["Playground", "参数注解", "返回值"],
    task: (
      <p>
        打开 TypeScript Playground(typescriptlang.org/play),把下面这段 JS
        风格的函数贴进去:<code>{`function makeTea(base, sweet) { return base + "(" + sweet + "% 糖)"; }`}</code>
        。给它补上完整注解:base 是 string,sweet 是 number,返回值 string。
        然后故意调用 <code>makeTea(50, &quot;乌龙&quot;)</code>(参数反着传),
        读一读右侧的报错说了什么。
      </p>
    ),
    hint: (
      <>
        每个参数「名字: 类型」,返回值写在关门括号后面:<code>): string</code>。
        报错会精确指到第几个参数、期望什么、实际给了什么。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="playground"
          code={`function makeTea(base: string, sweet: number): string {
  return base + "(" + sweet + "% 糖)";
}

makeTea("乌龙", 50);   // ✓
makeTea(50, "乌龙");   // ✕ 两条报错:
// Argument of type 'number' is not assignable to parameter of type 'string'.
// Argument of type 'string' is not assignable to parameter of type 'number'.`}
        />
        <p>
          注意报错是<b>一格一格对</b>的:第一格给了 number(想要 string)、
          第二格给了 string(想要 number)—— 进货单逐项验货,谁不合格点谁的名。
          没有注解的 JS 版本,这个 bug 要等运行时输出「50(乌龙% 糖)」才露馅。
        </p>
      </>
    ),
  },
  {
    id: "trio-orderline",
    title: "可选、默认值、rest:一口气用上",
    d: "medium",
    tags: ["Playground", "可选参数", "rest"],
    task: (
      <p>
        在 Playground 写一个 <code>orderLine</code> 函数:第一个参数 base
        (string,必选),第二个参数 sugar(默认值 50),后面收任意多个配料
        <code>...toppings: string[]</code>。写完做三件事:① 悬停 sugar
        看推断出的类型;② 调用 <code>orderLine(&quot;奶绿&quot;)</code> 和{" "}
        <code>orderLine(&quot;奶绿&quot;, 30, &quot;珍珠&quot;, &quot;椰果&quot;)</code>{" "}
        确认都合法;③ 把 sugar 挪到 base 前面,看编译器骂什么。
      </p>
    ),
    hint: (
      <>
        默认值参数不用写类型;rest 参数必须是最后一个。第 ③ 步不会报
        「顺序错误」—— 想想调用 <code>orderLine(&quot;奶绿&quot;)</code>{" "}
        时那个 &quot;奶绿&quot; 会掉进哪一格。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="playground"
          code={`function orderLine(base: string, sugar = 50, ...toppings: string[]) {
  return base + " " + sugar + "% 糖 + " + toppings.join("、");
}

orderLine("奶绿");                        // ✓ sugar 用默认值,toppings 是 []
orderLine("奶绿", 30, "珍珠", "椰果");     // ✓ 后两个进了 toppings

// ③ 把默认值参数挪到前面:
function bad(sugar = 50, base: string) {}
bad("奶绿"); // ✕ Argument of type 'string' is not assignable
             //   to parameter of type 'number'.`}
        />
        <p>
          悬停 sugar 显示 <code>number</code> —— 从默认值 50 推断的。第 ③
          步的报错很有意思:带默认值的参数排在前面语法上不禁止,但调用{" "}
          <code>bad(&quot;奶绿&quot;)</code> 时 &quot;奶绿&quot;
          按位置掉进了 sugar 格 —— 想用默认值就得写{" "}
          <code>bad(undefined, &quot;奶绿&quot;)</code>,难看得很。
          所以实践里默认值参数照样放队尾。
        </p>
      </>
    ),
  },
  {
    id: "readonly-inventory",
    title: "readonly 与索引签名:建一张库存表",
    d: "medium",
    tags: ["Playground", "readonly", "索引签名"],
    task: (
      <p>
        在 Playground 定义 <code>MenuItem</code>(readonly id: number、name:
        string、price: number)和 <code>Inventory</code>
        (索引签名:键 string、值 number)。然后:① 造一个 MenuItem,试着改它的
        id;② 造一个库存表,给任意新编号赋 number 值,再赋一个 string
        值 —— 分别读懂两条报错。
      </p>
    ),
    hint: (
      <>
        索引签名写法:<code>{"[sku: string]: number"}</code>。改 readonly
        字段和给索引签名塞错类型,报错文案完全不同 —— 一个说 read-only,
        一个说 not assignable。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="playground"
          code={`interface MenuItem {
  readonly id: number;
  name: string;
  price: number;
}

interface Inventory {
  [sku: string]: number;
}

const jasmine: MenuItem = { id: 1, name: "茉莉奶绿", price: 16 };
jasmine.id = 99;
// ✕ Cannot assign to 'id' because it is a read-only property.

const stock: Inventory = {};
stock["tea-001"] = 30;   // ✓ 任意编号都能加
stock["tea-002"] = "多"; // ✕ Type 'string' is not assignable to type 'number'.`}
        />
        <p>
          两条报错各管一头:readonly 管「这格能不能写」,索引签名管
          「写进来的值长什么样」。顺手做个实验:把这段编译出的 JS 打开看
          (Playground 右侧 .JS 标签)—— readonly 和所有类型都消失了,
          印证「类型只活在编译期」。
        </p>
      </>
    ),
  },
  {
    id: "iface-vs-type",
    title: "亲手触发 declaration merging(和 type 的报错)",
    d: "hard",
    tags: ["Playground", "interface", "type"],
    task: (
      <p>
        在 Playground:① 用 interface 写一个 <code>Shop</code>
        (name: string),隔几行<b>再写一个同名</b> interface Shop(city:
        string),然后造一个 Shop 对象 —— 观察它需要几个字段;② 把两个
        interface 都改成 type,看报错;③ 用 type 写出 interface
        写不出来的东西:<code>type Size = &quot;small&quot; | &quot;large&quot;</code>。
      </p>
    ),
    hint: (
      <>
        第 ① 步不报错才是重点:两个同名 interface 会悄悄合体。
        造对象时少写任何一个字段,编译器都不答应。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="playground"
          code={`interface Shop { name: string }
interface Shop { city: string }
// 不报错!两个声明合并成 { name: string; city: string }

const s: Shop = { name: "TSer 奶茶", city: "杭州" }; // 两个字段都必须有
const t: Shop = { name: "TSer 奶茶" };
// ✕ Property 'city' is missing in type '{ name: string; }' but
//   required in type 'Shop'.

// ② 换成 type:
type Shop2 = { name: string };
type Shop2 = { city: string }; // ✕ Duplicate identifier 'Shop2'.

// ③ type 的独门:
type Size = "small" | "large"; // interface 无论如何写不出「二选一」`}
        />
        <p>
          merging 看起来像 bug,其实是给「后人补充类型」留的门:比如给
          window 补自定义字段、给第三方库的类型打补丁(09 章细讲)。
          也正因为它<b>太隐蔽</b>,普通业务代码里团队才要约定统一用法 ——
          你现在对「随便选,但要一致」这句话有体感了。
        </p>
      </>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: (
      <>
        <code>{"function brew(topping?: string, base: string) {}"}</code>{" "}
        一保存就报错,为什么?
      </>
    ),
    opts: [
      <>topping 的类型写错了,<code>?</code> 和 string 不能连用</>,
      <>可选参数后面不能跟必选参数 —— 按位置传参会对不上号</>,
      <>参数太多,TS 函数最多一个参数</>,
      <>base 没有默认值,所有参数都必须有默认值</>,
    ],
    correct: 1,
    wrong: [
      <>
        <code>topping?: string</code> 本身是完全合法的可选参数写法 ——
        问题不在这个参数自己,在它站的位置。
      </>,
      undefined,
      <>
        TS 对参数个数没有上限 —— rest 参数甚至能收无限个。
        报错说的是顺序,不是数量。
      </>,
      <>
        必选参数天经地义,根本不需要默认值 ——
        真正的规矩是:可选的、带默认值的,都排在必选后面。
      </>,
    ],
    why: (
      <>
        参数按位置对号入座:调用 <code>brew(&quot;乌龙&quot;)</code> 时,
        &quot;乌龙&quot; 算 topping 还是 base 说不清,所以 TS 立法:
        <b>必选在前,可选在后</b>。报错原文:A required parameter cannot
        follow an optional parameter.
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>type Cb = () =&gt; void;</code> 然后{" "}
        <code>const f: Cb = () =&gt; 123;</code> —— 会发生什么?
      </>
    ),
    opts: [
      <>报错:声明了 void 就不许返回任何值</>,
      <>编译通过:类型里的 void 意思是「返回值我不看」</>,
      <>报错:123 不是函数</>,
      <>编译通过,但运行时会抛异常</>,
    ],
    correct: 1,
    wrong: [
      <>
        那是「函数自己声明 <code>: void</code>」的规矩(
        <code>{"function f(): void { return 123 }"}</code> 才报错)。
        <b>类型里的 void</b> 是对使用方说的:返回什么我都不用。
      </>,
      undefined,
      <>
        <code>() =&gt; 123</code> 是一个货真价实的箭头函数,
        返回 123 —— 类型层面的问题才是这道题问的。
      </>,
      <>
        运行时什么事都没有 —— 类型全部擦除,这个函数老老实实返回
        123,只是没人看它而已。
      </>,
    ],
    why: (
      <>
        <code>() =&gt; void</code> 的宽容是故意设计的:不然{" "}
        <code>forEach((n) =&gt; arr.push(n))</code> 这种一行回调全都写不了
        (push 返回 number)。记住口诀:<b>类型里的 void = 我不看;
        自己声明的 void = 我不还</b>。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>{"function load(json: string) { return JSON.parse(json); }"}</code>{" "}
        —— 这个函数最大的隐患是?
      </>
    ),
    opts: [
      <>JSON.parse 可能抛异常,没有 try/catch 编译不过</>,
      <>返回值被推断成 any,悄悄传染给每一个调用方</>,
      <>json 参数应该声明成 object 而不是 string</>,
      <>没有隐患,推断会得出正确的类型</>,
    ],
    correct: 1,
    wrong: [
      <>
        异常确实可能抛,但 TS <b>不强制</b> try/catch,这段代码编译毫无问题
        —— 编译器抓的是类型问题,不是运行时风险。
      </>,
      undefined,
      <>
        JSON.parse 吃的就是字符串,<code>json: string</code>{" "}
        写得完全正确 —— 问题出在「出货」那头,不在「进货」。
      </>,
      <>
        推断确实很能干,但它推的是 JSON.parse 的返回值 ——
        而那个返回值在官方类型里就是 any。垃圾进,垃圾出。
      </>,
    ],
    why: (
      <>
        <code>JSON.parse</code> 返回 any,推断照单全收,于是 load 的返回值也是
        any —— 调用方拿到它,拼错字段、乱调方法,编译器全程沉默。
        修法:显式写返回值类型,把 any 拦在函数内部。
      </>
    ),
  },
  {
    type: "multi",
    q: (
      <>
        下面哪些能力是 <b>type 独有</b>、interface 写不出来的?(多选)
      </>
    ),
    opts: [
      <>描述一个对象的形状</>,
      <>联合类型,如 <code>&quot;s&quot; | &quot;m&quot; | &quot;l&quot;</code></>,
      <>同名声明自动合并(declaration merging)</>,
      <>映射类型,如 <code>{"{ [K in Size]: boolean }"}</code></>,
    ],
    correct: [1, 3],
    missHint: (
      <>
        还漏了一个 —— 想想 07 章预告过的「类型编程」语法,
        那一整套只能写在 type 的等号右边。
      </>
    ),
    extraHint: (
      <>
        勾多了 —— 有一项是两边都会的基本功,还有一项恰恰是 interface
        的独门绝技(type 重名只会报 Duplicate identifier)。
      </>
    ),
    why: (
      <>
        对象形状两边都行;merging 是 interface 独有;而「N 选一」的
        union 和批量造字段的映射类型,只有 type 写得出 ——
        这也是类型编程(06/07 章)全在 type 侧展开的原因。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>readonly id: number</code> 的属性,编译成 JavaScript 之后?
      </>
    ),
    opts: [
      <>自动变成 <code>Object.freeze</code> 冻结的属性</>,
      <>变成 getter,只能读不能写</>,
      <>无影无踪 —— readonly 只是编译期检查,运行时想改照样改</>,
      <>保留为注释,供运行时框架读取</>,
    ],
    correct: 2,
    wrong: [
      <>
        Object.freeze 是要你自己调的运行时函数 —— TS
        从不替你往产物里塞行为,类型擦除是铁律。
      </>,
      <>
        getter 是真实的 JS 语法,得自己写 —— readonly
        不生成任何代码,连一个字节都不留。
      </>,
      undefined,
      <>
        编译产物里连注释都不会有 —— 类型信息对运行时完全不可见,
        这正是「类型擦除」的含义。
      </>,
    ],
    why: (
      <>
        readonly 是<b>编译期的君子协定</b>:保存时编译器拦你,运行时没有任何
        防护。想要真冻结用 <code>Object.freeze</code> ——
        但团队协作里,编译期这一拦已经挡掉绝大多数误改。
      </>
    ),
  },
  {
    type: "fill",
    q: (
      <>
        函数类型表达式 <code>(msg: string) =&gt; ____</code>{" "}
        表示「这个回调返回什么我都不看」—— 空格里填哪个类型?
      </>
    ),
    placeholder: "一个类型关键字",
    answers: ["void"],
    hint: (
      <>
        不是 any 也不是 undefined —— 是那个专门表示「返回值不被使用」
        的关键字,forEach 回调的返回值类型就是它。
      </>
    ),
    why: (
      <>
        <code>void</code>:类型位置上的它是一份「免检声明」——
        返回任何值的函数都能匹配,因为调用方承诺不看返回值。
        这就是 <code>forEach</code> 能接收 <code>push</code>{" "}
        这种有返回值的回调的原因。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>f(t?: string)</code> 和 <code>g(t: string | undefined)</code>{" "}
        的真实区别是?
      </>
    ),
    opts: [
      <>完全等价,写哪个都一样</>,
      <>f 可以不传参数调用;g 必须传 —— 哪怕传的是 undefined</>,
      <>g 可以不传参数调用;f 必须传</>,
      <>f 的 t 不允许是 undefined,g 允许</>,
    ],
    correct: 1,
    wrong: [
      <>
        试试就知道:<code>g()</code> 直接报 Expected 1 arguments, but got 0
        —— 两者对「能不能空手调用」的态度完全不同。
      </>,
      undefined,
      <>
        方向反了:带 <code>?</code> 的才是「格子能空着」;
        <code>| undefined</code> 只是拓宽了「格子里能放什么」。
      </>,
      <>
        恰恰相反,f 的 t 在函数体里就是 <code>string | undefined</code>{" "}
        —— 不传的时候它自动是 undefined。
      </>,
    ],
    why: (
      <>
        <code>?</code> 管「这格能不能整个不填」,<code>| undefined</code>{" "}
        管「这格里能填什么」。f() 合法;g() 报错、必须{" "}
        <code>g(undefined)</code> —— 交白卷也得交卷。
      </>
    ),
  },
  {
    type: "choice",
    q: <>团队里为 interface vs type 吵起来了,下面哪个说法站得住脚?</>,
    opts: [
      <>interface 编译性能一定更好,应该全面禁用 type</>,
      <>type 更现代,interface 已被官方废弃</>,
      <>大部分场景随便选、团队统一即可;要 union/映射用 type,要 merging 用 interface</>,
      <>官方强制规定:对象一律 interface,其余一律 type</>,
    ],
    correct: 2,
    wrong: [
      <>
        「性能一定更好」是流传甚广的都市传说 ——
        没有这种绝对结论,官方也从没建议以性能为由禁用 type。
      </>,
      <>
        interface 活得好好的,declaration merging
        这种能力还只有它有 —— 谁也没废弃谁。
      </>,
      undefined,
      <>
        官方 handbook 恰恰<b>没有</b>强制规定 ——
        现行说法就是「按个人与团队偏好选,保持一致」。
      </>,
    ],
    why: (
      <>
        这场战争被夸大了:九成场景两者可互换,选型标准只有两条 ——
        需要的<b>能力</b>(union/映射 → type;merging → interface)
        和团队<b>一致性</b>。剩下的都是口味。
      </>
    ),
  },
];
