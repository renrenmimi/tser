"use client";

// 08 · 类与接口 —— 动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "gate-crash",
    title: "门禁三级,亲手撞一遍",
    d: "easy",
    tags: ["private", "protected", "Playground"],
    task: (
      <p>
        打开 TypeScript Playground(typescriptlang.org/play),写一个带
        public / protected / private 三种成员的 MilkTeaShop,再写一个子类
        FranchiseShop。然后故意从<b>子类里访问 private 成员</b>、从
        <b>外部访问 protected 成员</b> ——
        把两条红波浪线下的报错原文完整读一遍。
      </p>
    ),
    hint: (
      <>
        鼠标悬停在红波浪线上就能看到报错。注意两条报错的措辞差别:一条说
        only accessible within class,另一条多了一句 and its subclasses。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="playground.ts"
          code={`class MilkTeaShop {
  public name = "总店";
  protected recipe = "茶底先放";
  private vaultCode = "8848";
}

class FranchiseShop extends MilkTeaShop {
  peek() {
    this.recipe;     // ✅ 子类持工牌,办公区可进
    this.vaultCode;  // ❌ ts(2341) private and only
                     //    accessible within class 'MilkTeaShop'
  }
}

const shop = new MilkTeaShop();
shop.name;    // ✅
shop.recipe;  // ❌ ts(2445) protected ... within class
              //    'MilkTeaShop' and its subclasses`}
        />
        <p>
          两条报错的差别就是两扇门的差别:protected 的报错里带着 and its
          subclasses(工牌可进),private 的报错只认 within class
          &apos;MilkTeaShop&apos;(本人专属)。读熟这两句,
          以后一眼就知道自己撞的是哪扇门。
        </p>
      </>
    ),
  },
  {
    id: "implements-contract",
    title: "签一份 implements 合同,再故意毁约",
    d: "medium",
    tags: ["implements", "interface", "Playground"],
    task: (
      <p>
        在 Playground 里定义本章的 PaymentProvider 接口(pay + refund),
        写一个 <code>class CashPay implements PaymentProvider</code>{" "}
        但<b>故意漏掉 refund</b>,看编译器怎么讨债;补上之后,
        再给它同时 implements 第二个接口{" "}
        <code>Named {"{ name: string }"}</code>,体会「契约可以签一串」。
      </p>
    ),
    hint: (
      <>
        毁约的报错是 ts(2420) incorrectly implements ——
        注意它连「缺了哪个成员」都告诉你了。多个接口用逗号隔开:
        <code>implements A, B</code>。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="playground.ts"
          code={`interface PaymentProvider {
  pay(amount: number): Promise<string>;
  refund(txId: string): Promise<void>;
}
interface Named {
  name: string;
}

// 第一步:毁约版
class CashPay implements PaymentProvider {
  async pay(amount: number) { return "cash_" + Date.now(); }
}
// ❌ ts(2420): Class 'CashPay' incorrectly implements
//    interface 'PaymentProvider'.
//    Property 'refund' is missing in type 'CashPay'.

// 第二步:履约版 + 两份契约
class CashPay2 implements PaymentProvider, Named {
  name = "现金台";
  async pay(amount: number) { return "cash_" + Date.now(); }
  async refund(txId: string) {}
}`}
        />
        <p>
          注意报错点在 class 名上,而不是散落在使用处 ——
          这正是 implements 的价值:契约没兑现,<b>定义处当场翻脸</b>,
          不用等到别人调用时才发现。
        </p>
      </>
    ),
  },
  {
    id: "private-vs-hash",
    title: "private 改成 #field,看编译产物的差别",
    d: "medium",
    tags: ["#field", "类型擦除", ".JS 面板"],
    task: (
      <p>
        Playground 里写一个 <code>private vaultCode = &quot;8848&quot;</code>{" "}
        的类,点右侧的 <b>.JS 标签页</b>看编译产物;然后把 private 改成{" "}
        <code>#vaultCode</code>,再看一次产物。最后分别用{" "}
        <code>(shop as any)</code> 去试探两个版本,console.log 出结果。
      </p>
    ),
    hint: (
      <>
        对照点只有一个:编译产物里,那个字段前面还剩下什么?一个版本里
        private 无影无踪,另一个版本里 # 原样健在。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="playground.ts"
          code={`class ShopA {
  private vaultCode = "8848";
}
class ShopB {
  #vaultCode = "8848";
}

console.log((new ShopA() as any).vaultCode);
// "8848" —— private 被擦除,运行时是普通属性

console.log((new ShopB() as any)["#vaultCode"]);
// undefined —— #field 是运行时的真私有`}
        />
        <p>
          .JS 面板里,ShopA 的产物只剩 <code>vaultCode = &quot;8848&quot;</code>
          ,private 三个字蒸发了;ShopB 的 <code>#vaultCode</code>{" "}
          原样保留。一句话带走:<b>private 防手滑,#field 防翻墙</b>。
        </p>
      </>
    ),
  },
  {
    id: "abstract-factory",
    title: "abstract 半成品:先 new 一下试试",
    d: "hard",
    tags: ["abstract", "extends", "Playground"],
    task: (
      <p>
        写一个 abstract 类 Staff:抽象方法 <code>greet(): string</code> +
        普通方法 <code>clockIn()</code>(内部调用 this.greet())。依次触发三个
        场景:① 直接 <code>new Staff()</code>;② 子类 Barista{" "}
        <b>不实现 greet</b>;③ 补全后调用 <code>clockIn()</code>。
        三个场景各是什么结果?
      </p>
    ),
    hint: (
      <>
        场景①和②是两条不同的报错:一条 ts(2511) 拦 new,一条 ts(2515)
        讨要没补全的抽象成员。场景③能跑通 ——
        注意 clockIn 里调用的 greet 来自子类。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="playground.ts"
          code={`abstract class Staff {
  abstract greet(): string;
  clockIn() {
    console.log(this.greet() + ",打卡上班");
  }
}

new Staff();
// ① ❌ ts(2511): Cannot create an instance of an abstract class.

class Slacker extends Staff {}
// ② ❌ ts(2515): Non-abstract class 'Slacker' does not
//    implement inherited abstract member greet ...

class Barista extends Staff {
  greet() { return "我是调茶师"; }
}
new Barista().clockIn();   // ③ ✅ "我是调茶师,打卡上班"`}
        />
        <p>
          这就是「半成品模板」的完整生命周期:模板本身禁止出厂(①),
          子类想出厂必须补全空缺(②),补全之后,模板里预装的 clockIn
          白捡(③)—— 父类写流程,子类填细节,经典的模板方法套路。
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
        <code>class Shop {"{ private vaultCode = \"8848\" }"}</code> ——
        编译成 JavaScript 之后,vaultCode 会怎样?
      </>
    ),
    opts: [
      <>变成一个普通属性,运行时谁都能访问</>,
      <>
        自动翻译成 <code>#vaultCode</code>,保持私有
      </>,
      <>运行时访问它会抛出异常</>,
      <>整个字段被删掉,产物里不存在</>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        编译器不会替你换语法 —— private 是类型系统的注解,擦除即止;
        想要 # 的运行时私有,得自己动手写 #。
      </>,
      <>
        不会有任何运行时检查 —— 类型擦除意味着产物里连「private」
        这个信息都不存在,拿什么抛异常?
      </>,
      <>
        删掉的只是 private 这个修饰符;字段本身有值(&quot;8848&quot;),
        是实打实的运行时数据,必须保留。
      </>,
    ],
    why: (
      <>
        private 是编译期门禁:挡得住编译时的同事,挡不住运行时的{" "}
        <code>as any</code>。要运行时也设防,用 JavaScript 原生的 #field。
      </>
    ),
  },
  {
    type: "choice",
    q: <>protected 和 private 的差别,一句话说对的是?</>,
    opts: [
      <>protected 子类可见,private 只有类自己可见</>,
      <>protected 是运行时私有,private 是编译期私有</>,
      <>protected 只能修饰方法,private 只能修饰字段</>,
      <>没有差别,是同一个东西的两种写法</>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        两个都是编译期检查,擦除后都不设防 —— 差别只在「谁能访问」,
        不在「何时检查」。
      </>,
      <>
        字段、方法、getter/setter、参数属性,两个修饰符都能上 ——
        管的是访问范围,不挑成员种类。
      </>,
      <>
        差着一整个「子类」:办公区(protected)对分店开放,
        保险库(private)连分店都进不去 —— 报错编号都不同(2445 vs 2341)。
      </>,
    ],
    why: (
      <>
        门禁口诀:public 大堂谁都进,protected 办公区凭工牌(extends),
        private 保险库只有本人(类内部)。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        strict 模式下 <code>name: string;</code> 报了 ts(2564)
        「有声明没初始化」。下面哪种改法<b>不能</b>让它闭嘴?
      </>
    ),
    opts: [
      <>
        构造器里调 <code>this.init()</code>,在 init 方法里给 name 赋值
      </>,
      <>
        声明时就地初始化:<code>name = &quot;未命名&quot;</code>
      </>,
      <>构造器里直接 <code>this.name = …</code></>,
      <>
        改成 <code>name!: string</code>,自己担保
      </>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        就地初始化是最直接的兑现 —— 声明的同时给值,编译器当场满意。
      </>,
      <>
        构造器里的赋值编译器看得见,这是标准解法之一。
      </>,
      <>
        <code>!</code> 确实能让编译器闭嘴 —— 代价是担保转到你头上,
        但「能不能通过检查」这个问题上,它是有效的。
      </>,
    ],
    why: (
      <>
        编译器<b>不跨方法追踪赋值</b>:init() 里干了什么,它在检查字段
        初始化时不看。要么就地给、要么构造器里直接给、要么 <code>!</code>{" "}
        自己担保 —— 绕道 init 是唯一无效的那条路。
      </>
    ),
  },
  {
    type: "fill",
    q: (
      <>
        想让一个类「禁止直接 new,只能被继承、由子类补全」——
        class 前面该加哪个关键字?
      </>
    ),
    placeholder: "输入关键字…",
    answers: ["abstract"],
    hint: <>中文常译作「抽象」—— 半成品模板,禁止直接出厂。</>,
    why: (
      <>
        abstract 类是半成品模板:abstract 成员只有签名,子类必须补全;
        直接 new 会吃到 ts(2511)。已经装好的普通方法,子类白捡。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>class WeChatPay implements PaymentProvider</code> 里的
        implements,到底干了什么?
      </>
    ),
    opts: [
      <>编译期校验 WeChatPay 的形状符合接口 —— 不提供实现,不留运行时痕迹</>,
      <>把接口里的方法实现自动复制进类</>,
      <>在运行时检查每个实例是否符合接口</>,
      <>让 WeChatPay 继承 PaymentProvider 的全部成员</>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        接口里压根没有实现可抄 —— interface 只有形状。方法体一行不少,
        全得类自己写。
      </>,
      <>
        interface 编译后被整个擦除,运行时连 PaymentProvider
        这个名字都不存在,拿什么检查?
      </>,
      <>
        继承是 extends 的活(还能白捡实现);implements
        只是拿契约来对形状,啥也不给。
      </>,
    ],
    why: (
      <>
        implements = 装修合同的验收环节:只查「该有的都有了没」,
        查完即走。也因此一个类可以 implements 多份契约,
        而 extends 只能有一个。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>
          class CashPay implements PaymentProvider{" "}
          {"{ pay(amount) { … } }"}
        </code>{" "}
        —— 没标类型的参数 amount,类型是什么?
      </>
    ),
    opts: [
      <>
        隐式 <code>any</code>(strict 下直接报错)
      </>,
      <>
        <code>number</code> —— 从接口声明自动推过来
      </>,
      <>
        <code>unknown</code> —— 安全兜底
      </>,
      <>
        <code>string</code> —— 参数默认都是 string
      </>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        最容易踩的坑:implements <b>只校验,不灌注</b> ——
        它拿你写完的形状去对契约,但不会把契约的类型「倒灌」给参数。
      </>,
      <>
        unknown 是 catch 变量在 strict 下的待遇;没标注的函数参数,
        待遇是隐式 any(noImplicitAny 管这个)。
      </>,
      <>
        TypeScript 从不猜「默认类型是 string」——
        没有信息就是 any,strict 下顺手给你标红。
      </>,
    ],
    why: (
      <>
        implements 是单向验收:类 → 契约。参数类型还得自己写{" "}
        <code>pay(amount: number)</code> ——
        写完编译器再拿它去和接口对形状。
      </>
    ),
  },
  {
    type: "multi",
    q: (
      <>
        关于参数属性 <code>constructor(private db: Database) {"{}"}</code>
        ,哪些说法是对的?(多选)
      </>
    ),
    opts: [
      <>等价于「声明字段 + 构造器参数 + 赋值」三步合一</>,
      <>它是不可擦除语法,Node 原生跑 TS(纯类型擦除)时用不了</>,
      <>编译后不留任何运行时痕迹</>,
      <>
        <code>readonly</code> 也能这样用:
        <code>constructor(readonly city: string)</code>
      </>,
    ],
    correct: [0, 1, 3],
    missHint: (
      <>
        有一条你漏了 —— 想想 readonly 算不算修饰符,
        以及「不可擦除」和 Node 原生跑 TS 的关系。
      </>
    ),
    extraHint: (
      <>
        有一项混进来了 —— 参数属性会让编译器<b>生成赋值代码</b>,
        这本身就是运行时痕迹,和「纯类型注解」有本质区别。
      </>
    ),
    why: (
      <>
        参数属性 = 一行顶四行的糖,但这颗糖有运行时产物(自动生成的{" "}
        <code>this.db = db</code>),所以没法被「纯擦除」——
        这正是它和 erasableSyntaxOnly 冲突的原因。public / private /
        protected / readonly 四个修饰符都能触发它。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        PaperCup 和 PlasticCup 成员完全相同,且各自声明了{" "}
        <code>private stock = 0</code>。
        <code>const cup: PaperCup = new PlasticCup()</code> 的结果是?
      </>
    ),
    opts: [
      <>报错 —— private 成员必须来自同一处声明,类变成了「准名义」</>,
      <>通过 —— 结构化类型只看形状,形状完全一致</>,
      <>通过,但有一条警告</>,
      <>报错 —— class 之间从来不能互相赋值</>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        差一步:结构化规则确实是默认,但 private/protected 是明写的例外
        —— Types have separate declarations of a private property
        &apos;stock&apos;,同名也不行。
      </>,
      <>
        TypeScript 没有「警告」这一档 —— 类型检查只有过和不过,
        这里是结结实实的 ts(2322)。
      </>,
      <>
        没有 private 成员的两个同形状类是可以互相赋值的(04 章的规矩)
        —— 翻脸的导火索是 private,不是 class 本身。
      </>,
    ],
    why: (
      <>
        完整版规则:类默认看形状,一旦有 private/protected
        成员就必须<b>同源</b>(同一处声明,继承的算)。
        想恢复兼容,让两个类 extends 同一个基类。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        要存一个「类外部用任何手段都拿不到」的字段,该用哪种写法?
      </>
    ),
    opts: [
      <>
        JavaScript 原生私有字段:<code>#vaultCode = &quot;8848&quot;</code>
      </>,
      <>
        <code>private vaultCode</code> —— private 就是干这个的
      </>,
      <>
        <code>protected vaultCode</code> —— 再收紧一级
      </>,
      <>
        <code>readonly vaultCode</code> —— 只读即安全
      </>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        private 擦除后就是普通属性,<code>as any</code> 一挖就出来 ——
        它防手滑,不防翻墙。
      </>,
      <>
        方向反了:protected 比 private 还宽(子类也能进),
        而且同样是编译期检查,运行时照样裸奔。
      </>,
      <>
        readonly 管的是「能不能改」,不管「能不能看」——
        而且它也是编译期检查。
      </>,
    ],
    why: (
      <>
        「任何手段都拿不到」是运行时级别的要求,只有 JavaScript 原生的
        #field 做得到 —— 它不靠类型系统,擦除之后铁门依旧。
      </>
    ),
  },
];
