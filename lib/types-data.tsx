"use client";

// 第 01 章 · 基础类型与推断:动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

/* ================= LABS ================= */

export const LABS: Lab[] = [
  {
    id: "hover-infer",
    title: "hover 大巡查:看推断给每个值发了什么证",
    d: "easy",
    tags: ["Playground", "推断"],
    task: (
      <>
        <p>
          打开{" "}
          <a
            href="https://www.typescriptlang.org/play"
            target="_blank"
            rel="noreferrer"
          >
            typescriptlang.org/play
          </a>
          ,贴入下面的代码(注意:一个注解都没有)。然后把鼠标依次悬停在
          <b>每一个变量名</b>上,把 TS 推断出的类型抄在旁边的注释里 ——
          抄完再对答案。
        </p>
        <CodeBlock
          lang="ts"
          title="贴这段进去"
          code={`const shop = "喜杯奶茶";
let stock = 120;
let open = true;
const flavors = ["茉莉", "四季春", "乌龙"];
const bestSeller = { name: "多肉葡萄", price: 22, hot: true };
const nothing = null;`}
        />
      </>
    ),
    hint: (
      <>
        注意 shop 和 stock 的差别:一个 const 一个 let ——
        证件的「精度」不一样。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="悬停结果"
          code={`const shop: "喜杯奶茶"       // const + 字面量 → 锁死为字面量类型
let stock: number            // let → 拓宽成 number
let open: boolean            // let → 拓宽成 boolean
const flavors: string[]      // const 锁不住数组内容,元素照样拓宽
const bestSeller: {          // 对象属性同理拓宽
  name: string;
  price: number;
  hot: boolean;
}
const nothing: null          // null 的类型就是 null`}
        />
        <p>
          六个变量,零注解,证全发齐了。重点看 flavors 和 bestSeller:
          <b>const 只锁变量名,锁不住内容</b>,所以数组元素和对象属性
          依旧拓宽 —— 这是最容易记错的一处。
        </p>
      </>
    ),
  },
  {
    id: "widen-lab",
    title: "拓宽实验:let 和 const 各推出什么",
    d: "easy",
    tags: ["Playground", "拓宽"],
    task: (
      <>
        <p>
          在 Playground 里逐行输入下面四行,每写一行就 hover
          一次变量名,记下类型;最后回答:哪几行的类型是「字面量」,
          哪几行被拓宽了?为什么?
        </p>
        <CodeBlock
          lang="ts"
          title="逐行输入"
          code={`let a = "small";
const b = "small";
let c = 42;
const d = 42;`}
        />
      </>
    ),
    hint: (
      <>
        问自己一个问题:这个变量<b>以后还能不能被赋新值</b>?能 ——
        TS 就得把证件写宽一点。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="结果与解释"
          code={`let a = "small";   // string  —— let 可再赋值,拓宽
const b = "small"; // "small" —— const 永不再赋值,锁字面量
let c = 42;        // number  —— 同 a
const d = 42;      // 42      —— 同 b`}
        />
        <p>
          规律一句话:<b>let 拓宽,const 锁字面量</b>。再进一步:给 a 赋值{" "}
          <code>a = &quot;mega&quot;</code> 能过(string 随便装),但写{" "}
          <code>let e: &quot;small&quot; | &quot;large&quot; =
          &quot;small&quot;</code> 后再 <code>e = &quot;mega&quot;</code>{" "}
          就会红线 —— 字面量联合的威力,03 章正式开讲。
        </p>
      </>
    ),
  },
  {
    id: "menu-type",
    title: "给奶茶菜单立契约:MenuItem",
    d: "medium",
    tags: ["Playground", "对象类型"],
    task: (
      <>
        <p>
          正式接手奶茶店:在 Playground 里,① 写一个 MenuItem
          对象类型,要求四个字段:name(字符串)、price(数字)、
          sizes(字符串数组)、soldOut(布尔);② 声明{" "}
          <code>const menu: MenuItem[]</code> 并填两三款奶茶;③
          故意把其中一款的 price 拼成 prise,观察报错落在哪一行、说了什么。
        </p>
      </>
    ),
    hint: (
      <>
        对象类型的写法在 §03:花括号里一行一个「字段名: 类型」。
        类型别名用 <code>type MenuItem = {"{ ... }"}</code> 定义。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="参考答案"
          code={`type MenuItem = {
  name: string;
  price: number;
  sizes: string[];
  soldOut: boolean;
};

const menu: MenuItem[] = [
  { name: "多肉葡萄", price: 22, sizes: ["medium", "large"], soldOut: false },
  { name: "四季春", prise: 12, sizes: ["small"], soldOut: false },
  //                ~~~~~ 当场红线:
  // Object literal may only specify known properties,
  // but 'prise' does not exist in type 'MenuItem'.
  // Did you mean to write 'price'?
];`}
        />
        <p>
          注意报错<b>精确落在错字上</b>,还带改法 —— 对比一下把{" "}
          <code>: MenuItem[]</code> 删掉再看:错误消失了(prise
          被推断照单全收),直到下游用 price 时才炸。这就是
          「共享数据立契约」的价值。
        </p>
      </>
    ),
  },
  {
    id: "empty-array",
    title: "空数组的坑:亲眼看 any[] 长出来",
    d: "medium",
    tags: ["Playground", "noImplicitAny"],
    task: (
      <>
        <p>
          Playground 默认开着 strict。贴入下面代码,观察:①
          函数里那个空数组报了什么错?② 给它加上什么注解能修好?③
          修好之后,尝试 <code>cart.push(42)</code>,看看会发生什么。
        </p>
        <CodeBlock
          lang="ts"
          title="贴这段进去"
          code={`function newCart() {
  const cart = [];
  return cart;
}`}
        />
      </>
    ),
    hint: (
      <>空箱子看不出装什么 —— 你得在 <code>= []</code> 前面贴张标签。</>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="修复"
          code={`function newCart() {
  const cart: string[] = []; // 出生就贴标签
  return cart;               // 返回类型自动推断为 string[]
}

const cart = newCart();
cart.push("四季春"); // ✓
cart.push(42);       // ✗ Argument of type 'number' is not
                     //   assignable to parameter of type 'string'.`}
        />
        <p>
          原始报错是{" "}
          <code>
            Variable &apos;cart&apos; implicitly has an &apos;any[]&apos; type
          </code>{" "}
          —— noImplicitAny 拦下了这个「偷偷长出来的 any」。一行注解修好,
          之后 push 错东西全部当场红线。
        </p>
      </>
    ),
  },
  {
    id: "boundary-fn",
    title: "边界注解:给结算函数签合同",
    d: "medium",
    tags: ["Playground", "函数注解"],
    task: (
      <>
        <p>
          写一个结算函数 <code>calcTotal(price, qty)</code>
          ,返回单价乘数量。① 先<b>什么注解都不写</b>
          ,看参数上报什么错;② 给两个参数和返回值补上注解;③ 调用{" "}
          <code>calcTotal(&quot;22&quot;, 2)</code>,确认编译器拦得住。
        </p>
      </>
    ),
    hint: (
      <>
        参数是「外面塞进来的」,推断没有材料 —— 所以 strict 下参数注解
        不是风格问题,是必答题。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="参考答案"
          code={`// ① 不写注解:
// Parameter 'price' implicitly has an 'any' type.
// Parameter 'qty' implicitly has an 'any' type.

// ② 补上注解 —— 参数是义务,返回值是承诺:
function calcTotal(price: number, qty: number): number {
  return price * qty;
}

// ③ 传错类型,当场被拦:
calcTotal("22", 2);
// Argument of type 'string' is not assignable
// to parameter of type 'number'.`}
        />
        <p>
          对比序章那杯 ¥NaN:JS 里 <code>&quot;22&quot; * 2</code>{" "}
          会「碰巧」算出 44,哪天变成{" "}
          <code>&quot;22元&quot;</code> 就是 NaN ——
          TS 直接把「字符串当数字用」这条路封死在编译期。
        </p>
      </>
    ),
  },
];

/* ================= QUIZ ================= */

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: (
      <>
        <code>let price = 22;</code> —— price 的类型是什么?
      </>
    ),
    opts: [
      <>any,因为没写注解</>,
      <>number,推断自动得出</>,
      <>22,字面量类型</>,
      <>unknown,等待收窄</>,
    ],
    correct: 1,
    wrong: [
      <>
        只有 TS 完全看不出来时才落到 any(比如没注解的函数参数)。
        这里右边明晃晃一个 22,推断直接给 number。
      </>,
      undefined,
      <>
        字面量 22 是 const 的待遇 —— let 意味着以后可能换值,TS
        会拓宽(widening)成 number。
      </>,
      <>
        unknown 不会凭空出现 —— 它是你主动写的「安全版 any」,03
        章才登场。
      </>,
    ],
    why: (
      <>
        推断 = 编译器自己看得出来。let + 初始值,证件当场发好,
        一个冒号都不用写 —— 这正是「TS 要写一堆注解」是误解的原因。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>const size = &quot;small&quot;;</code> —— size 的类型是什么?
      </>
    ),
    opts: [
      <>string</>,
      <>&quot;small&quot;(字面量类型)</>,
      <>any</>,
      <>Size</>,
    ],
    correct: 1,
    wrong: [
      <>
        string 是 let 的待遇。const 变量永不再赋值,TS
        敢把类型收到最窄 —— 就是 &quot;small&quot; 这个字面量本身。
      </>,
      undefined,
      <>有初始值就轮不到 any —— 推断从不缺席。</>,
      <>
        TS 不会自动把值关联到你定义过的类型别名 —— 除非你亲手写{" "}
        <code>const size: Size = &quot;small&quot;</code>。
      </>,
    ],
    why: (
      <>
        const = 一辈子不变 → 类型就是字面量本身。字面量类型是 03
        章联合类型的地基:&quot;small&quot; | &quot;medium&quot; |
        &quot;large&quot; 就是三个字面量拼起来的。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>: String</code>(大写)和 <code>: string</code>
        (小写),什么关系?
      </>
    ),
    opts: [
      <>一样的,大小写随意</>,
      <>
        不一样:string 是原始类型,String 是包装对象类型 ——
        注解永远用小写
      </>,
      <>String 更正式,官方推荐</>,
      <>string 是旧版写法,已废弃</>,
    ],
    correct: 1,
    wrong: [
      <>
        在这里大小写是两个类型:小写 string 是原始字符串;大写 String 是{" "}
        <code>new String()</code> 那个包装对象 —— 几乎永远不是你想要的。
      </>,
      undefined,
      <>
        恰恰相反 —— 官方和社区一致约定注解用小写原始类型;大写包装对象
        是历史遗留,专门用来踩坑的。
      </>,
      <>
        小写才是正统且现行的写法,没有废弃一说 —— 该进博物馆的是大写那位。
      </>,
    ],
    why: (
      <>
        口诀:<b>注解一律小写</b> —— string、number、boolean。
        看到大写 String / Number / Boolean 出现在注解里,直接改。
      </>
    ),
  },
  {
    type: "multi",
    q: <>哪些地方值得(或必须)亲手写类型注解?(多选)</>,
    opts: [
      <>函数的参数和返回值</>,
      <>先声明、后赋值的变量</>,
      <>
        <code>let count = 0</code> 这样的局部变量
      </>,
      <>对外导出的公共 API / 全项目共享的数据结构</>,
    ],
    correct: [0, 1, 3],
    missHint: (
      <>
        想想「边界」两个字 —— 凡是别人要用的、或者声明时右边没有值的,
        你还漏了。
      </>
    ),
    extraHint: (
      <>
        有一项 TS 看一眼初始值就知道 —— 给它写注解不算错,但属于噪音,
        §08 的坑二说的就是它。
      </>
    ),
    why: (
      <>
        注解是承诺,推断是观察。承诺写在边界上:参数(strict
        下是必答题)、返回值、公共契约、先声明后赋值;
        局部变量让推断干活,代码更清爽,契约更醒目。
      </>
    ),
  },
  {
    type: "choice",
    q: <>关于 any,哪个说法是对的?</>,
    opts: [
      <>any 只关掉当前这一行的类型检查</>,
      <>
        any 关掉这个值的所有检查,而且会顺着赋值和运算传染给下游
      </>,
      <>any 和 unknown 是同义词</>,
      <>用了 any,代码会在运行时报更多错</>,
    ],
    correct: 1,
    wrong: [
      <>
        不止一行 —— 从 any 值上取的属性、算出的结果、传进的回调,
        统统变成 any,像一滴墨掉进水杯。
      </>,
      undefined,
      <>
        方向相反:any 是「谁都能碰」,unknown 是「谁都不能碰,
        先验明正身(收窄)才许用」—— unknown 是 any 的安全版,03 章见。
      </>,
      <>
        any 本身不制造运行时错误 —— 问题是它把<b>本该编译期报的错</b>
        放行到了运行时,和裸写 JS 一个待遇。
      </>,
    ],
    why: (
      <>
        any = 「编译器你闭嘴」。救急可以,常驻等于把 TS 卸载了。strict
        家族的 noImplicitAny,就是防它从没注解的参数里偷偷溜进来。
      </>
    ),
  },
  {
    type: "fill",
    q: (
      <>
        「元素都是 number 的数组」,用方括号写法,类型写作____。
      </>
    ),
    placeholder: "输入类型…",
    answers: ["number[]"],
    hint: <>元素类型在前,一对空方括号在后。</>,
    why: (
      <>
        <code>number[]</code> 与 <code>Array&lt;number&gt;</code>{" "}
        完全等价 —— 简单类型社区习惯前者;后者的尖括号是泛型语法,05
        章正式拆解。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>const toppings = [];</code> —— 这行代码有什么问题?
      </>
    ),
    opts: [
      <>没问题,TS 知道它是 string[]</>,
      <>
        空数组看不出装什么,TS 只能记 any[];strict 下跨函数使用会直接报错
        —— 出生就注解最稳
      </>,
      <>空数组是 never[],什么都塞不进去</>,
      <>空数组必须用 new Array() 创建</>,
    ],
    correct: 1,
    wrong: [
      <>
        它还没装过任何东西,TS 不是先知 —— 元素类型无从推起,
        只能先记 any[]。
      </>,
      undefined,
      <>
        never[] 是另一些场景的产物(比如某些推断边角);普通空数组落的是
        any[],还能靠后续 push「演化」,但靠不住。
      </>,
      <>
        <code>new Array()</code> 一样看不出元素类型 ——
        写法不背这个锅,缺的是那张标签。
      </>,
    ],
    why: (
      <>
        空箱子先贴标签:<code>const toppings: string[] = []</code>。
        一行注解,之后 push 错任何东西都当场红线。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>let size = &quot;small&quot;</code> 推断成了
        string,但你想让 size 只能取三种杯型。最对路的做法是?
      </>
    ),
    opts: [
      <>
        改成 <code>let size: string = &quot;small&quot;</code>
      </>,
      <>
        定义字面量联合 <code>type Size = &quot;small&quot; |
        &quot;medium&quot; | &quot;large&quot;</code>,再{" "}
        <code>let size: Size = &quot;small&quot;</code>
      </>,
      <>改成 const,让它锁成字面量</>,
      <>TS 做不到「只能取几个值」这种限制</>,
    ],
    correct: 1,
    wrong: [
      <>
        <code>: string</code> 跟不写一样宽 —— &quot;mega&quot;、
        &quot;超大桶&quot; 全都合法,限制等于没加。
      </>,
      undefined,
      <>
        const 锁的是「不能再赋值」,不是「只能取这三种」——
        而且订单里的杯型本来就要换,const 直接把路堵死了。
      </>,
      <>
        做得到,而且是 TS 最招牌的能力 —— 把「合法值名单」写进类型,
        名单外的值编译期直接拒收。
      </>,
    ],
    why: (
      <>
        字面量联合 = 把「只能是这几个」写成类型。这正是奶茶店案例在 03
        章的升级方向:Size、糖度、订单状态,全靠这一招守住。
      </>
    ),
  },
];
