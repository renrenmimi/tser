"use client";

// 第 05 章 · 泛型 —— 动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "merge-three",
    title: "把三份重复的函数,合成一个泛型",
    d: "easy",
    tags: ["Playground", "泛型函数"],
    task: (
      <p>
        把下面三份函数粘进 TypeScript Playground
        (typescriptlang.org/play):<code>firstString</code>、
        <code>firstNumber</code>、
        <code>firstBoolean</code>,函数体一字不差都是{" "}
        <code>return arr[0]</code>。任务:删掉三份,写一个泛型{" "}
        <code>first</code> 顶替。验收标准:鼠标悬停在{" "}
        <code>first(["三分糖"])</code> 的结果上,类型必须显示{" "}
        <code>string | undefined</code>,不能是 any。
      </p>
    ),
    hint: (
      <>
        函数名后面加 <code>&lt;T&gt;</code> 声明洞,再把签名里所有写死的
        string / number / boolean 换成 T —— 别忘了返回值要带上{" "}
        <code>| undefined</code>(空数组取第一个,拿到的是 undefined)。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="Playground"
          code={`function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const a = first(["三分糖", "七分糖"]); // string | undefined
const b = first([9.9, 19.9]);          // number | undefined
const c = first([true, false]);        // boolean | undefined

// 悬停 a、b、c 逐个验收 —— 三份重复代码,一个类型参数全解决`}
        />
        <p>
          悬停验收是这个练习的重点:能亲眼看到 T
          在每次调用被推断成不同的类型,且输出跟着输入变 ——
          「写一次,类型不丢」不是口号,是悬停可查的事实。
        </p>
      </>
    ),
  },
  {
    id: "paginated-shop",
    title: "给奶茶店写 Paginated<T>",
    d: "medium",
    tags: ["Playground", "泛型接口"],
    task: (
      <p>
        奶茶店后台到处要分页:订单列表、菜单列表、会员列表……
        请在 Playground 里:① 定义泛型类型{" "}
        <code>{"Paginated<T>"}</code>(至少含 list、page、total 三个成员);
        ② 写一个泛型函数{" "}
        <code>{"paginate<T>(all: T[], page: number, size: number): Paginated<T>"}</code>{" "}
        做真切片;③ 分别用 Order 和 MenuItem 数组调用,悬停确认{" "}
        <code>list</code> 的类型跟着变。
      </p>
    ),
    hint: (
      <>
        切片用 <code>all.slice((page - 1) * size, page * size)</code>;
        函数的返回值类型写 <code>{"Paginated<T>"}</code> ——
        函数的洞和容器的洞,是同一个 T。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="Playground"
          hl={[7, 8]}
          code={`type Order = { id: number; item: string };
type MenuItem = { name: string; price: number };

type Paginated<T> = { list: T[]; page: number; total: number };

function paginate<T>(all: T[], page: number, size: number): Paginated<T> {
  return {
    list: all.slice((page - 1) * size, page * size),
    page,
    total: all.length,
  };
}

const orders: Order[] = [{ id: 1, item: "波霸奶茶" }];
const menu: MenuItem[] = [{ name: "四季春", price: 12 }];

const p1 = paginate(orders, 1, 10); // Paginated<Order>
const p2 = paginate(menu, 1, 10);   // Paginated<MenuItem>

p1.list[0].item;  // ✅ 编译器知道 list 里是 Order
// p1.list[0].price; ❌ Order 身上没有 price`}
        />
        <p>
          注意最后两行:同一个 paginate,p1 的 list 里只认 Order 的成员,
          p2 的只认 MenuItem 的 —— 容器是通用的,内容的类型一点没糊。
          这正是「壳子固定、内容百变」结构的标准解法。
        </p>
      </>
    ),
  },
  {
    id: "constraint-lab",
    title: "约束实验:把不合格的挡在门外",
    d: "medium",
    tags: ["Playground", "extends"],
    task: (
      <p>
        在 Playground 里写{" "}
        <code>{"function longest<T extends { length: number }>(a: T, b: T): T"}</code>
        ,函数体返回 length 大的那个。然后依次调用:两个字符串、
        两个数组、<code>longest(10, 100)</code>、
        <code>{"longest({ length: 3 }, { length: 7 })"}</code> ——
        预测每个的结果,再看编译器打分。最后做个实验:
        把约束删掉,看函数体里哪一行先报错。
      </p>
    ),
    hint: (
      <>
        判断「能不能进门」只需要问一句:这个类型的形状里,
        有没有 <code>length: number</code>?—— 上一章的鸭子测试原封不动。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="Playground"
          hl={[5, 6]}
          code={`function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

longest("波霸奶茶", "四季春");           // ✅ T = string
longest([1, 2, 3], [4, 5]);             // ✅ T = number[]
// longest(10, 100);                    // ❌ number 没有 length
longest({ length: 3 }, { length: 7 });  // ✅ 有 length 就行,不问出身

// 实验:删掉 extends { length: number } ——
// 函数体的 a.length 立刻报错:
// Property 'length' does not exist on type 'T'
// 约束不只拦调用方,也是函数体的「胆」`}
        />
        <p>
          最后那个实验是本题的题眼:约束是双向的合同 ——
          对调用方是门规(没 length 别进来),对函数体是保障
          (放进来的必有 length,放心用)。删掉约束,函数体先崩。
        </p>
      </>
    ),
  },
  {
    id: "two-holes",
    title: "双洞模具:swap 与 zip",
    d: "hard",
    tags: ["Playground", "多类型参数"],
    task: (
      <p>
        一个模具可以留多个洞。请在 Playground 里实现两个函数:①{" "}
        <code>{"swap<A, B>(pair: [A, B]): [B, A]"}</code> ——
        交换二元组;② <code>{"zip<A, B>(as: A[], bs: B[]): [A, B][]"}</code>{" "}
        —— 把两个数组按位配对(长度取短的)。验收:
        <code>{'swap(["波霸奶茶", 18])'}</code> 悬停显示{" "}
        <code>[number, string]</code>;zip 配出来的每一对,
        两个位置的类型都不能糊。
      </p>
    ),
    hint: (
      <>
        元组类型 <code>[A, B]</code> 位置敏感 —— swap 的实现就是{" "}
        <code>{"return [pair[1], pair[0]]"}</code>;zip 循环到{" "}
        <code>Math.min(as.length, bs.length)</code> 为止,
        每一步 push 一个 <code>[as[i], bs[i]]</code>。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="Playground"
          hl={[1, 5]}
          code={`function swap<A, B>(pair: [A, B]): [B, A] {
  return [pair[1], pair[0]];
}

function zip<A, B>(as: A[], bs: B[]): [A, B][] {
  const out: [A, B][] = [];
  const n = Math.min(as.length, bs.length);
  for (let i = 0; i < n; i++) {
    out.push([as[i], bs[i]]);
  }
  return out;
}

const s = swap(["波霸奶茶", 18]); // [number, string]

const pairs = zip(["小杯", "大杯"], [12, 18]);
// [string, number][]
pairs[0][0].toUpperCase(); // ✅ 第 0 位保证是 string
pairs[0][1].toFixed(1);    // ✅ 第 1 位保证是 number`}
        />
        <p>
          两个洞 A、B 各自独立推断、各自处处一致:swap
          的输入输出位置互换但类型不乱,zip 配出的每一对都是{" "}
          <code>[A, B]</code>。多洞模具是 06 章{" "}
          <code>{"Record<K, V>"}</code>、<code>{"Map<K, V>"}</code>{" "}
          这些工具的地基。
        </p>
      </>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: <>泛型解决的核心问题,下面哪句说得最准?</>,
    opts: [
      <>让函数能接受任何类型的参数,不再报类型错误</>,
      <>写一份代码通吃多种类型,同时让输入和输出的类型保持联动、不丢失</>,
      <>让代码在运行时根据类型执行不同的分支</>,
      <>减少代码的字符数,让文件更小</>,
    ],
    correct: 1,
    wrong: [
      <>
        「接受任何类型 + 不报错」any 就能做到,而且做得更彻底 ——
        泛型的价值恰恰在于报错:类型不联动时它拦得住。
      </>,
      undefined,
      <>
        泛型是编译期的推理,类型擦除后运行时连 T 都不存在 ——
        想按类型分支,那是上上章「收窄」的活。
      </>,
      <>
        字符数往往还变多了(多了尖括号和约束)——
        省的是「重复的定义」和「丢失的类型」,不是键盘敲击数。
      </>,
    ],
    why: (
      <>
        泛型 = 留个洞的模具:一份代码多种浇法,且同一个洞处处同一种 ——
        输入什么类型,输出就联动什么类型,全程不丢。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>{"function first<T>(arr: T[]): T | undefined"}</code>,调用{" "}
        <code>first([9.9, 19.9])</code> 且没写尖括号 —— T 是什么?
      </>
    ),
    opts: [
      <>any —— 没显式指定,只能按 any 算</>,
      <>unknown —— 没指定时的安全默认</>,
      <>number —— 编译器从实参 number[] 推断出来</>,
      <>报错 —— 泛型函数必须显式传类型实参</>,
    ],
    correct: 2,
    wrong: [
      <>
        不写尖括号不等于放弃 —— 编译器会拿实参当原料做推断,
        推出来是货真价实的 number,悬停可查。
      </>,
      <>
        unknown 是「推断没原料」时也不会出现的答案 ——
        这里原料充足:[9.9, 19.9] 明明白白是 number[]。
      </>,
      undefined,
      <>
        恰恰相反,显式传是少数派 —— 绝大多数泛型调用靠推断,
        这正是泛型用起来毫无负担的原因。
      </>,
    ],
    why: (
      <>
        类型实参推断:编译器拿实参 [9.9, 19.9](number[])对上声明
        arr: T[],解出 T = number —— 推断的原料永远来自实参。
      </>
    ),
  },
  {
    type: "choice",
    q: <>「泛型不就是 any 吗?」—— 最有力的反驳是哪句?</>,
    opts: [
      <>泛型比 any 写起来更长,更正式</>,
      <>
        any 丢类型(进去 string 出来「随便」),泛型保类型
        (T 被解出后,输入输出全程联动、全程受检)
      </>,
      <>泛型在运行时更快,any 在运行时更慢</>,
      <>any 已经被官方废弃了,泛型是它的替代品</>,
    ],
    correct: 1,
    wrong: [
      <>
        「写得长」不是论点 —— 要害在行为:一个把类型丢在门口,
        一个把类型送到终点。
      </>,
      undefined,
      <>
        运行时两者零差别 —— 类型擦除后,泛型和 any 编译出的 JS
        一模一样。差别全在编译期:一个查,一个不查。
      </>,
      <>
        any 没被废弃,它有合法用途(终章会讲何时 any 合理)——
        它和泛型是两个工具,不是新旧版本关系。
      </>,
    ],
    why: (
      <>
        方向相反的两个东西:any 是放弃检查,first(arr: any[]) 返回的 x
        调什么方法都不拦;泛型是保住检查,T = string 之后
        x.toFixed() 编译期就死。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>{"function longest<T extends { length: number }>(a: T, b: T): T"}</code>
        ,下面哪个调用会<b>报错</b>?
      </>
    ),
    opts: [
      <>
        <code>longest("波霸奶茶", "四季春")</code>
      </>,
      <>
        <code>longest([1, 2, 3], [4, 5])</code>
      </>,
      <>
        <code>{"longest({ length: 3 }, { length: 7 })"}</code>
      </>,
      <>
        <code>longest(10, 100)</code>
      </>,
    ],
    correct: 3,
    wrong: [
      <>
        string 自带 .length —— 形状兼容{" "}
        {"{ length: number }"},门开,T = string。
      </>,
      <>
        数组也自带 .length —— 放行,T = number[]。
        约束只问形状,不问你是不是数组。
      </>,
      <>
        这个无名对象恰好有 length: number ——
        鸭子测试通过,约束不要求「出身」,只要求形状。
      </>,
      undefined,
    ],
    why: (
      <>
        number 身上没有 length,过不了{" "}
        <code>{"extends { length: number }"}</code> 这道门 ——
        编译期就拦下,不用等运行时。判定标准就是上一章的结构化兼容。
      </>
    ),
  },
  {
    type: "multi",
    q: <>关于泛型,下面哪些说法是对的?(多选)</>,
    opts: [
      <>类型擦除后,编译产物里不存在 T —— 运行时无法「问 T 是什么」</>,
      <>类型参数可以有默认值,如 {"<T = string>"}</>,
      <>同一次调用里,同一个 T 在签名各处必须是同一个类型</>,
      <>泛型只能用在函数上,interface 和 type 用不了</>,
      <>调用泛型函数必须显式写出尖括号,如 first&lt;string&gt;(…)</>,
    ],
    correct: [0, 1, 2],
    missHint: (
      <>
        还有对的没选全 —— 想想:编译后的 JS 里还有 T 吗?
        <code>{"<T = string>"}</code> 合法吗?「同一个洞处处同一种」
        是不是泛型的核心承诺?
      </>
    ),
    extraHint: (
      <>
        选进了错误说法 —— <code>{"Box<T>"}</code>、
        <code>{"Paginated<T>"}</code> 就是泛型接口/类型别名;
        而绝大多数调用靠推断,尖括号是少数派。
      </>
    ),
    why: (
      <>
        擦除后 T 无影无踪(A 对);默认类型参数是正规语法(B 对);
        「同一个洞处处同一种」是泛型的核心承诺(C 对);
        interface/type/class 都能留洞(D 错);
        显式尖括号只在推断缺原料时才需要(E 错)。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        同事写了{" "}
        <code>{"function log<T>(x: T): void { console.log(x) }"}</code>
        ,请你 review。最中肯的意见是?
      </>
    ),
    opts: [
      <>很好,泛型让这个函数更灵活了</>,
      <>
        T 只出现一次,没联动任何东西 —— 这个洞白留了,改成{" "}
        <code>x: unknown</code> 更诚实
      </>,
      <>应该给 T 加上 extends object 约束</>,
      <>应该显式调用 log&lt;string&gt;(…) 才能用</>,
    ],
    correct: 1,
    wrong: [
      <>
        灵活是幻觉 —— x: unknown 一样能接收任何值,泛型在这里
        没提供 unknown 给不了的任何东西,只多了阅读成本。
      </>,
      undefined,
      <>
        加约束解决不了根本问题:T 依然只出现一次,依然没联动 ——
        问题不是「洞太松」,是「洞根本没用上」。
      </>,
      <>
        能用,推断也能用 —— 但这恰恰暴露了问题:不管 T
        被填成什么,函数的行为和输出没有任何变化。
      </>,
    ],
    why: (
      <>
        类型参数的价值在「联动」:至少出现两次(参数之间,
        或参数与返回值)才值得留洞。只出现一次的 T 什么都不承诺,
        不如直接写 unknown。
      </>
    ),
  },
  {
    type: "fill",
    q: (
      <>
        给类型洞立门规 ——「T 不是什么都能填,得符合某个形状」——
        用的关键字是 ________(填英文关键字)。
      </>
    ),
    placeholder: "关键字…",
    answers: ["extends"],
    hint: (
      <>
        和 class 继承用的是同一个单词,但在泛型约束里读作「符合、兼容」——
        本章 §04 的安检门上就写着它。
      </>
    ),
    why: (
      <>
        <code>{"<T extends { length: number }>"}</code> ——
        extends 在约束位置的含义是「T 的形状必须兼容它」,
        判定标准就是结构化类型的鸭子测试。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>{"function getProp<T, K extends keyof T>(obj: T, key: K): T[K]"}</code>
        ,对 <code>{'const order = { item: "波霸奶茶", price: 18 }'}</code>{" "}
        调用 <code>getProp(order, "topping")</code>,会发生什么?
      </>
    ),
    opts: [
      <>返回 undefined,类型是 any</>,
      <>运行时抛出异常</>,
      <>
        编译期报错 —— "topping" 不在 <code>"item" | "price"</code> 里
      </>,
      <>正常通过,返回值类型是 unknown</>,
    ],
    correct: 2,
    wrong: [
      <>
        「返回 undefined」是纯 JS 的命运 —— 加了 K extends keyof T
        之后,根本轮不到运行时:错的键名过不了编译。
      </>,
      <>
        连运行的机会都没有 —— 这个错误死在编译期,
        这正是把约束写进签名的意义:把运行时的坑提前到保存文件那一刻。
      </>,
      undefined,
      <>
        不会通过 —— K 被约束成「T 的键之一」,而 order 的键只有
        item 和 price,"topping" 不在名单上。
      </>,
    ],
    why: (
      <>
        keyof T 把 order 的键算成字面量联合{" "}
        <code>"item" | "price"</code>,K 必须落在里面 ——
        "topping" 编译期就被拦下。keyof 和 T[K] 的完整手艺,07 章见。
      </>
    ),
  },
];
