"use client";

// Chapter 08 · Classes and interfaces:
// fields and initialization → access levels → private vs #field →
// parameter properties and other conveniences → abstract & implements →
// classes under structural typing → practice → quiz → key points.

import "./chapter.css";

import { Hero, Section, Callout, KeyPoints, ChapterFooter } from "@/lib/kit";
import { CodeBlock, CodePair } from "@/lib/code";
import { LabSet } from "@/lib/labs";
import { Quiz } from "@/lib/quiz";
import { LABS, QUIZ } from "@/lib/classes-data";
import { T, type Loc } from "@/lib/i18n";
import {
  GateHero,
  AccessGate,
  ErasureViz,
  ContractBoard,
  StructuralClassFlow,
} from "./viz";

/* ---------- §01 fields ---------- */

const S1_SHOP: Loc<string> = {
  en: `class MilkTeaShop {
  menu: string[] = [];     // declared and initialized in the same line
  name: string;            // declared only, so the constructor must assign it

  constructor(name: string) {
    this.name = name;      // the promise is kept here
  }
}

const shop = new MilkTeaShop("Bloom Tea");
shop.name.toUpperCase();   // safe: name is string, never undefined`,
  zh: `class MilkTeaShop {
  menu: string[] = [];     // 声明的同时就地初始化
  name: string;            // 只声明,所以构造器里必须赋值

  constructor(name: string) {
    this.name = name;      // 承诺在这里兑现
  }
}

const shop = new MilkTeaShop("Bloom Tea");
shop.name.toUpperCase();   // 放心用:name 是 string,不可能是 undefined`,
};

const S1_BAD = `class MilkTeaShop {
  name: string;
  // Property 'name' has no
  // initializer and is not
  // definitely assigned in the
  // constructor. ts(2564)
}`;

const S1_FIX: Loc<string> = {
  en: `class MilkTeaShop {
  name = "Unnamed shop"; // 1. initialize it here
  city: string;
  boss!: string;         // 3. "I promise it is assigned"

  constructor(city: string) {
    this.city = city;    // 2. assign it in the constructor
  }
}`,
  zh: `class MilkTeaShop {
  name = "Unnamed shop"; // ① 就地初始化
  city: string;
  boss!: string;         // ③「我保证它有值」

  constructor(city: string) {
    this.city = city;    // ② 在构造器里赋值
  }
}`,
};

/* ---------- §02 access levels ---------- */

const S2_GATES: Loc<string> = {
  en: `class MilkTeaShop {
  public name = "Bloom Tea";              // public is the default
  protected recipe = "tea base first";    // this class and its subclasses
  private vaultCode = "8848";             // this class only

  intro() {
    // inside the class, all three are readable
    return this.name + " / " + this.recipe + " / " + this.vaultCode;
  }
}

class FranchiseShop extends MilkTeaShop {
  train() {
    return this.recipe;   // ✓ a subclass may read a protected member
    // this.vaultCode;    // ✕ ts(2341): private, this class only
  }
}

const shop = new MilkTeaShop();
shop.name;        // ✓ public
// shop.recipe;   // ✕ ts(2445): protected, not readable from outside`,
  zh: `class MilkTeaShop {
  public name = "Bloom Tea";              // 不写修饰符时默认就是 public
  protected recipe = "tea base first";    // 本类与子类
  private vaultCode = "8848";             // 只有本类

  intro() {
    // 在类内部,三个都能读
    return this.name + " / " + this.recipe + " / " + this.vaultCode;
  }
}

class FranchiseShop extends MilkTeaShop {
  train() {
    return this.recipe;   // ✓ 子类可以读 protected 成员
    // this.vaultCode;    // ✕ ts(2341):private,只有本类
  }
}

const shop = new MilkTeaShop();
shop.name;        // ✓ public
// shop.recipe;   // ✕ ts(2445):protected,类外读不到`,
};

/* ---------- §03 private vs #field ---------- */

const S3_PRIVATE: Loc<string> = {
  en: `class Shop {
  private vaultCode = "8848";
}
const s = new Shop();

s.vaultCode;      // ✕ ts(2341)
s["vaultCode"];   // ✓ "8848" — allowed on purpose
JSON.stringify(s);
// {"vaultCode":"8848"}`,
  zh: `class Shop {
  private vaultCode = "8848";
}
const s = new Shop();

s.vaultCode;      // ✕ ts(2341)
s["vaultCode"];   // ✓ "8848" —— 这是有意留的后门
JSON.stringify(s);
// {"vaultCode":"8848"}`,
};

const S3_HASH: Loc<string> = {
  en: `class Shop {
  #vaultCode = "8848";
}
const s = new Shop();

// s.#vaultCode   ✕ syntax error
s["#vaultCode"];  // undefined
JSON.stringify(s);
// {}`,
  zh: `class Shop {
  #vaultCode = "8848";
}
const s = new Shop();

// s.#vaultCode   ✕ 语法错误
s["#vaultCode"];  // undefined
JSON.stringify(s);
// {}`,
};

/* ---------- §04 conveniences ---------- */

const S4_VERBOSE = `class MilkTeaShop {
  private db: Database;
  readonly city: string;

  constructor(db: Database, city: string) {
    this.db = db;
    this.city = city;
  }
}`;

const S4_PARAM: Loc<string> = {
  en: `class MilkTeaShop {
  constructor(
    private db: Database,
    readonly city: string,
  ) {}
}
// A modifier on a constructor parameter
// declares a field and assigns it.`,
  zh: `class MilkTeaShop {
  constructor(
    private db: Database,
    readonly city: string,
  ) {}
}
// 构造器参数前一旦有修饰符,
// 它就同时声明字段并完成赋值。`,
};

const S4_ORDER: Loc<string> = {
  en: `class Order {
  readonly id: string;        // cannot be assigned again after the constructor
  private _sugar = 50;        // where the value is actually stored

  constructor(id: string) {
    this.id = id;             // the constructor is the last chance to assign it
  }

  get sugar() { return this._sugar; }   // read it like a property
  set sugar(v: number) {                // writing goes through this check
    if (v < 0 || v > 100) throw new Error("sugar must be 0-100");
    this._sugar = v;
  }
}

class OrderId {
  static prefix = "MT";                 // lives on the class, not on instances
  static next(n: number) {
    return OrderId.prefix + "-" + String(n).padStart(4, "0");
  }
}

const o = new Order(OrderId.next(7));   // "MT-0007"
o.sugar = 30;      // ✓ goes through the setter
// o.id = "MT-9";  // ✕ Cannot assign to 'id' because it
                   //   is a read-only property. ts(2540)`,
  zh: `class Order {
  readonly id: string;        // 构造器结束后不能再赋值
  private _sugar = 50;        // 值真正存放的地方

  constructor(id: string) {
    this.id = id;             // 构造器是最后一次赋值机会
  }

  get sugar() { return this._sugar; }   // 读起来像普通属性
  set sugar(v: number) {                // 写要先过这道检查
    if (v < 0 || v > 100) throw new Error("sugar must be 0-100");
    this._sugar = v;
  }
}

class OrderId {
  static prefix = "MT";                 // 挂在类上,不属于任何实例
  static next(n: number) {
    return OrderId.prefix + "-" + String(n).padStart(4, "0");
  }
}

const o = new Order(OrderId.next(7));   // "MT-0007"
o.sugar = 30;      // ✓ 经过 setter
// o.id = "MT-9";  // ✕ Cannot assign to 'id' because it
                   //   is a read-only property. ts(2540)`,
};

/* ---------- §05 abstract & implements ---------- */

const S5_ABSTRACT: Loc<string> = {
  en: `abstract class Staff {
  abstract greet(): string;   // signature only, a subclass must write the body

  clockIn() {                 // already implemented, every subclass inherits it
    console.log(this.greet() + ", clocking in");
  }
}

new Staff();
// ✕ Cannot create an instance of an abstract class. ts(2511)

class Barista extends Staff {
  greet() { return "I am the barista"; }   // the missing piece, supplied
}
new Barista().clockIn();      // "I am the barista, clocking in"`,
  zh: `abstract class Staff {
  abstract greet(): string;   // 只有签名,方法体由子类来写

  clockIn() {                 // 已经实现好了,每个子类都继承得到
    console.log(this.greet() + ", clocking in");
  }
}

new Staff();
// ✕ Cannot create an instance of an abstract class. ts(2511)

class Barista extends Staff {
  greet() { return "I am the barista"; }   // 把缺的那块补上
}
new Barista().clockIn();      // "I am the barista, clocking in"`,
};

const S5_PAYMENT: Loc<string> = {
  en: `interface PaymentProvider {
  pay(amount: number): Promise<string>;   // returns a transaction id
  refund(txId: string): Promise<void>;
}

class WeChatPay implements PaymentProvider {
  async pay(amount: number) {             // the type is written here, not copied
    // call the WeChat SDK here
    return "wx_" + Date.now();
  }
  async refund(txId: string) { /* ... */ }
}

class AliPay implements PaymentProvider {
  async pay(amount: number) { return "ali_" + Date.now(); }
  async refund(txId: string) { /* ... */ }
}`,
  zh: `interface PaymentProvider {
  pay(amount: number): Promise<string>;   // 返回交易号
  refund(txId: string): Promise<void>;
}

class WeChatPay implements PaymentProvider {
  async pay(amount: number) {             // 类型要自己写,不会从接口抄过来
    // 这里调用微信 SDK
    return "wx_" + Date.now();
  }
  async refund(txId: string) { /* ... */ }
}

class AliPay implements PaymentProvider {
  async pay(amount: number) { return "ali_" + Date.now(); }
  async refund(txId: string) { /* ... */ }
}`,
};

const S5_INJECT: Loc<string> = {
  en: `class MilkTeaShop {
  constructor(private payment: PaymentProvider) {}  // any matching class fits

  async checkout(total: number) {
    const txId = await this.payment.pay(total);
    return "Paid. Transaction " + txId;
  }
}

new MilkTeaShop(new WeChatPay());  // today
new MilkTeaShop(new AliPay());     // tomorrow, and the shop code is unchanged`,
  zh: `class MilkTeaShop {
  constructor(private payment: PaymentProvider) {}  // 形状对得上的类都能传

  async checkout(total: number) {
    const txId = await this.payment.pay(total);
    return "Paid. Transaction " + txId;
  }
}

new MilkTeaShop(new WeChatPay());  // 今天用微信
new MilkTeaShop(new AliPay());     // 明天换支付宝,店铺代码一行不改`,
};

/* ---------- §06 structural typing ---------- */

const S6_CUPS = `class PaperCup {
  private stock = 0;
  fill(ml: number) {}
}
class PlasticCup {
  private stock = 0;
  fill(ml: number) {}
}

const cup: PaperCup = new PlasticCup();
// ✕ Type 'PlasticCup' is not assignable to type 'PaperCup'.
//     Types have separate declarations of a private
//     property 'stock'. ts(2322)`;

export default function ClassesPage() {
  return (
    <main className="page" data-ch="classes">
      <Hero
        ch="classes"
        title={{
          en: (
            <>
              Classes and <span className="grad">interfaces</span>
            </>
          ),
          zh: (
            <>
              类与<span className="grad">接口</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              A class describes a shape and produces objects. TypeScript adds
              three access levels, a way to require that a member exists, and a
              way to check a class against an interface. All of it is checked
              while compiling, and almost all of it disappears from the output.
            </>
          ),
          zh: (
            <>
              class 描述形状,也生产对象。TypeScript
              在它之上加了三级访问权限、一套「必须有这个成员」的约束,
              以及一次和 interface 的形状检查。
              这些全部发生在编译期,而且几乎都不会留在产物里。
            </>
          ),
        }}
        chips={[
          {
            id: "fields",
            n: "01",
            label: { en: "Fields", zh: "字段与初始化" },
          },
          {
            id: "modifiers",
            n: "02",
            label: { en: "Access levels", zh: "三级访问权限" },
          },
          { id: "private-hash", n: "03", label: "private vs #field" },
          {
            id: "sugar",
            n: "04",
            label: { en: "Four conveniences", zh: "便利件四样" },
          },
          { id: "abstract-implements", n: "05", label: "abstract & implements" },
          {
            id: "structural",
            n: "06",
            label: { en: "Class compatibility", zh: "类的兼容" },
          },
          { id: "labs", n: "07", label: { en: "Practice", zh: "动手" } },
          { id: "quiz", n: "08", label: { en: "Quiz", zh: "测验" } },
        ]}
      >
        <GateHero />
      </Hero>

      {/* ================= §01 fields ================= */}
      <Section
        id="fields"
        index="01"
        title={{
          en: "Fields: if you declare one, it must exist",
          zh: "字段:说了有,就得真有",
        }}
        desc={{
          en: "A field declaration is a promise about every instance. Under strict mode the compiler checks that you keep it.",
          zh: "字段声明是对每个实例的一句承诺。strict 模式下,编译器会检查你有没有兑现。",
        }}
      >
        <Callout
          tone="story"
          title={{
            en: "What a field declaration promises",
            zh: "字段声明承诺了什么",
          }}
        >
          <p>
            <T
              en={
                <>
                  When you write <code>name: string</code> inside a class, you
                  are telling the compiler that{" "}
                  <b>every object created from this class has a name, and it is
                  a string</b>. Code elsewhere is then allowed to call{" "}
                  <code>shop.name.toUpperCase()</code> without checking for{" "}
                  <code>undefined</code>.
                </>
              }
              zh={
                <>
                  在类里写下 <code>name: string</code>,等于告诉编译器:
                  <b>这个类造出来的每个对象都有 name,而且是 string</b>。
                  于是别处的代码可以直接写{" "}
                  <code>shop.name.toUpperCase()</code>,不必先判断{" "}
                  <code>undefined</code>。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  That promise has to be kept, or the guarantee is worthless. The
                  flag that enforces it is{" "}
                  <b>strictPropertyInitialization</b>, one of the checks turned
                  on by <code>strict</code>. If a declared field is never
                  assigned, the compiler stops you before the code runs.
                </>
              }
              zh={
                <>
                  这句承诺必须兑现,否则那份保证就是空的。负责验收的开关叫{" "}
                  <b>strictPropertyInitialization</b>,是 <code>strict</code>{" "}
                  打开的检查之一:声明了却从没赋值,代码跑起来之前编译器就拦住你。
                </>
              }
            />
          </p>
        </Callout>

        <CodeBlock
          lang="ts"
          title={{
            en: "milk-tea-shop.ts · two ways to keep the promise",
            zh: "milk-tea-shop.ts · 兑现承诺的两种方式",
          }}
          hl={[2, 6]}
          code={S1_SHOP}
        />

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title={{ en: "Never assigned · error", zh: "从未赋值 · 报错" }}
              hl={[2]}
              code={S1_BAD}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title={{ en: "Three ways to fix it", zh: "三种改法" }}
              hl={[2, 4, 7]}
              code={S1_FIX}
            />
          }
        />

        <Callout
          tone="warn"
          title={{
            en: "Two mistakes this check catches",
            zh: "这道检查最常抓到的两件事",
          }}
        >
          <p>
            <T
              en={
                <>
                  <b>Assigning the field from another method.</b> If the
                  constructor calls <code>this.init()</code> and{" "}
                  <code>init</code> assigns the field, you still get ts(2564).
                  The compiler <b>does not follow assignments across methods</b>
                  , because it cannot tell whether that method always runs.
                  Assign the field in the constructor itself.
                </>
              }
              zh={
                <>
                  <b>把赋值挪到别的方法里。</b>构造器里调{" "}
                  <code>this.init()</code>、由 <code>init</code> 给字段赋值 ——
                  照样报 ts(2564)。编译器<b>不跨方法追踪赋值</b>,
                  因为它无法确定那个方法一定会被调用。要么就在构造器里赋值。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <b>
                    Reaching for <code>!</code> too early.
                  </b>{" "}
                  <code>boss!: string</code> is a definite assignment assertion:
                  it moves the guarantee from the compiler to you. The check
                  stops reporting, but nothing is verified. If the value is
                  really <code>undefined</code>, the failure happens at runtime.
                  Use it only where something outside the class is known to
                  assign the field, such as a framework that injects it.
                </>
              }
              zh={
                <>
                  <b>
                    太早搬出 <code>!</code>。
                  </b>
                  <code>boss!: string</code> 是明确赋值断言:
                  它把这份保证从编译器手里转到你手里。检查不再报错,
                  但也没有任何验证。真是 <code>undefined</code>{" "}
                  的话,出问题的时刻挪到了运行时。
                  只在「类外有东西确定会赋值」时用它,比如由框架注入的字段。
                </>
              }
            />
          </p>
        </Callout>

        <Callout
          tone="idea"
          title={{
            en: "A class declaration creates two things",
            zh: "一个 class 声明,同时创建两样东西",
          }}
        >
          <p>
            <T
              en={
                <>
                  <code>class Order {"{}"}</code> creates a <b>type</b> named
                  Order and a <b>value</b> named Order. In a type position,{" "}
                  <code>Order</code> means <i>one instance</i> of the class. The
                  class object itself — the thing you write <code>new</code> in
                  front of — has the type <code>typeof Order</code>. So{" "}
                  <code>let a: Order</code> holds an instance, while{" "}
                  <code>let b: typeof Order = Order</code> holds the class and
                  lets you call <code>new b()</code>. An{" "}
                  <code>interface</code> creates only a type, never a value.
                </>
              }
              zh={
                <>
                  <code>class Order {"{}"}</code> 会同时创建一个叫 Order 的
                  <b>类型</b>和一个叫 Order 的<b>值</b>。在类型位置上,
                  <code>Order</code> 指的是<i>一个实例</i>;而类本身 ——
                  就是你写 <code>new</code> 时放在后面的那个东西 —— 类型是{" "}
                  <code>typeof Order</code>。所以 <code>let a: Order</code>{" "}
                  装的是实例,<code>let b: typeof Order = Order</code>{" "}
                  装的是类,可以 <code>new b()</code>。而 <code>interface</code>{" "}
                  只创建类型,不创建值。
                </>
              }
            />
          </p>
        </Callout>

        <p className="sec-desc">
          <T
            en={
              <>
                Methods need no new rules. A method is a function that lives
                inside a class, and its parameters and return type are annotated
                exactly as chapter 02 described. The new material starts in the
                next section: saying which code is allowed to read a member.
              </>
            }
            zh={
              <>
                方法没有新规则。方法就是写在类里的函数,
                参数和返回值的标注方式和第 02 章完全一样。
                真正的新内容从下一节开始:规定哪些代码可以读某个成员。
              </>
            }
          />
        </p>
      </Section>

      {/* ================= §02 access levels ================= */}
      <Section
        id="modifiers"
        index="02"
        title={{
          en: "Three access levels: public, protected, private",
          zh: "三级访问权限:public、protected、private",
        }}
        desc={{
          en: "Each level says which code may read the member. All three are checked only while compiling.",
          zh: "每一级规定了哪些代码可以读这个成员。三者都只在编译期检查。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                <b>public</b> means any code may read the member. It is the
                default, so writing no modifier is the same as writing{" "}
                <code>public</code>. <b>protected</b> narrows that to the class
                and any class that extends it. <b>private</b> narrows it further,
                to the class body itself. In code:
              </>
            }
            zh={
              <>
                <b>public</b> 表示任何代码都能读这个成员。它是默认值,
                不写修饰符就等于写了 <code>public</code>。<b>protected</b>{" "}
                收紧到「本类,以及任何 extends 它的类」。<b>private</b>{" "}
                再收紧一步,只剩类体自己。写成代码是这样:
              </>
            }
          />
        </p>

        <CodeBlock
          lang="ts"
          title={{
            en: "milk-tea-shop.ts · one class, three levels",
            zh: "milk-tea-shop.ts · 一个类,三种权限",
          }}
          hl={[2, 3, 4]}
          code={S2_GATES}
        />

        <AccessGate />

        <Callout
          tone="warn"
          title={{
            en: "In a subclass constructor, super() comes first",
            zh: "子类构造器:super() 必须在最前面",
          }}
        >
          <p>
            <T
              en={
                <>
                  If a subclass writes its own constructor, it must call{" "}
                  <code>super(...)</code> before it touches <code>this</code>.
                  Forgetting gives ts(2377):{" "}
                  <b>
                    Constructors for derived classes must contain a
                    &apos;super&apos; call.
                  </b>{" "}
                  This rule comes from JavaScript itself; TypeScript only
                  reports it earlier.
                </>
              }
              zh={
                <>
                  子类如果自己写了构造器,就必须在碰 <code>this</code> 之前调用{" "}
                  <code>super(...)</code>。忘了会报 ts(2377):
                  <b>
                    Constructors for derived classes must contain a
                    &apos;super&apos; call.
                  </b>{" "}
                  这条规则来自 JavaScript 本身,TypeScript 只是提前告诉你。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  One consequence is easy to miss. The subclass&apos;s own field
                  initializers run <b>after</b> <code>super()</code> returns. So
                  if a base-class constructor reads a field that the subclass
                  initializes, it reads <code>undefined</code>. Anything the base
                  constructor needs should be passed to it as an argument.
                </>
              }
              zh={
                <>
                  有一个后果很容易忽略:子类自己的字段初始化,是在{" "}
                  <code>super()</code> 返回<b>之后</b>才执行的。
                  所以父类构造器如果去读一个由子类初始化的字段,读到的是{" "}
                  <code>undefined</code>。父类构造器需要的东西,应该以参数形式传给它。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 private vs #field ================= */}
      <Section
        id="private-hash"
        index="03"
        title={{
          en: "private is a compile-time check; #field is a runtime one",
          zh: "private 是编译期检查,#field 是运行时的",
        }}
        desc={{
          en: "private hides nothing once the code runs. This section shows exactly what survives compilation.",
          zh: "代码一旦跑起来,private 什么也藏不住。这一节看清楚编译之后到底剩下什么。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                Chapter 01 said that types are erased when TypeScript compiles.
                Access modifiers are part of the type system, so they are erased
                too. <code>private vaultCode</code> becomes an ordinary property
                in the output, readable by anyone. JavaScript has its own private
                fields, written with a <code>#</code>, and those are a different
                mechanism. Compare the two:
              </>
            }
            zh={
              <>
                第 01 章说过,TypeScript 编译时会把类型全部擦除。
                访问修饰符是类型系统的一部分,所以同样会被擦掉:
                <code>private vaultCode</code>{" "}
                在产物里就是一个普通属性,谁都读得到。
                JavaScript 自己也有私有字段,写作 <code>#</code> 开头 ——
                那是另一套机制。两边对照着看:
              </>
            }
          />
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title={{
                en: "TS private · checked, not hidden",
                zh: "TS private · 只检查,不隐藏",
              }}
              hl={[6, 7]}
              code={S3_PRIVATE}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title={{
                en: "JS #field · actually unreachable",
                zh: "JS #field · 真的拿不到",
              }}
              hl={[6, 7]}
              code={S3_HASH}
            />
          }
        />

        <p className="sec-desc">
          <T
            en={
              <>
                Notice line 7 on the left. <code>s[&quot;vaultCode&quot;]</code>{" "}
                compiles with no error at all — <b>no cast is needed</b>.
                TypeScript allows bracket access to a private member on purpose,
                as an escape hatch for tests and older code. And a plain
                JavaScript file that imports this class sees nothing unusual: it
                reads <code>s.vaultCode</code> directly.
              </>
            }
            zh={
              <>
                注意左边第 7 行。<code>s[&quot;vaultCode&quot;]</code>{" "}
                完全不报错,<b>连断言都不用写</b>:TypeScript
                有意允许用方括号访问私有成员,给测试和老代码留一条路。
                而一个普通 JavaScript 文件引入这个类时更是毫无察觉,
                直接 <code>s.vaultCode</code> 就读到了。
              </>
            }
          />
        </p>

        <ErasureViz />

        <div className="grid-2">
          <div className="card">
            <div className="card-kicker">TS PRIVATE</div>
            <div className="card-title">
              <T en="A compile-time boundary" zh="编译期的边界" />
            </div>
            <p>
              <T
                en={
                  <>
                    No runtime cost, clear error messages, and it takes part in
                    type compatibility (that is what §06 is about). Use it to
                    mark which members are internal, so that other people editing
                    the code do not reach into them by accident. That covers most
                    of what encapsulation is for.
                  </>
                }
                zh={
                  <>
                    没有运行时开销,报错清楚,而且会参与类型兼容判定(§06
                    讲的就是它)。用它来标记哪些成员属于内部实现,
                    让改代码的人不会顺手伸进去。封装的大部分需求,到这里就够了。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">JS #FIELD</div>
            <div className="card-title">
              <T en="A runtime boundary" zh="运行时的边界" />
            </div>
            <p>
              <T
                en={
                  <>
                    A JavaScript language feature, not a TypeScript one. It
                    survives compilation and stays unreachable from outside the
                    class while the program runs. TypeScript still type-checks it
                    fully. Use it when code you do not control must not be able
                    to reach the field, which mostly means libraries.
                  </>
                }
                zh={
                  <>
                    这是 JavaScript 的语言特性,不是 TypeScript 的。
                    它在编译后依然存在,程序运行时类外也确实读不到。
                    TypeScript 对它照样做完整的类型检查。
                    当「你控制不了的代码绝对不能碰到这个字段」时用它 ——
                    主要是写库的场景。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <Callout
          tone="warn"
          title={{
            en: "Common mistake: treating private as a security feature",
            zh: "常见误解:把 private 当成安全措施",
          }}
        >
          <p>
            <T
              en={
                <>
                  A password or a token stored in a <code>private</code> field is
                  not protected. One <code>JSON.stringify(shop)</code> prints it.
                  So does the browser&apos;s DevTools, and so does any log line
                  that serializes the object. <code>#field</code> does keep the
                  value out of those places, but it is still plain text in memory
                  and it is still in your bundle if you hard-coded it. Real
                  secrets belong on a server, not in a field of either kind.
                </>
              }
              zh={
                <>
                  把密码或 token 存进 <code>private</code>{" "}
                  字段并不构成保护。一句 <code>JSON.stringify(shop)</code>{" "}
                  就打印出来了,浏览器 DevTools
                  一样看得见,任何序列化对象的日志也一样。
                  <code>#field</code> 确实能挡住这几处,
                  但值仍然是内存里的明文,如果是硬编码的,它照样在你的打包产物里。
                  真正的机密应该放在服务端,而不是任何一种字段里。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §04 conveniences ================= */}
      <Section
        id="sugar"
        index="04"
        title={{
          en: "Four conveniences: parameter properties, readonly, get/set, static",
          zh: "便利件四样:参数属性、readonly、getter/setter、static",
        }}
        desc={{
          en: "None of these is a new idea. They are four shortcuts that make a class shorter to write.",
          zh: "都不是新概念,是让 class 写起来更省事的四个开关。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                <b>Parameter properties</b> save the most typing. Put an access
                modifier in front of a constructor parameter, and that one line
                declares the field, receives the argument, and assigns it:
              </>
            }
            zh={
              <>
                <b>参数属性(parameter properties)</b>省下的样板最多:
                在构造器参数前面加一个访问修饰符,这一行就同时完成了
                声明字段、接收实参、赋值三件事:
              </>
            }
          />
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title={{
                en: "Written out · four lines of boilerplate",
                zh: "老老实实写 · 四行样板",
              }}
              code={S4_VERBOSE}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title={{
                en: "Parameter properties · one step",
                zh: "参数属性 · 一步到位",
              }}
              hl={[3, 4]}
              code={S4_PARAM}
            />
          }
        />

        <Callout
          tone="deep"
          title={{
            en: "Parameter properties emit code, so they cannot just be erased",
            zh: "参数属性会生成代码,所以没法被单纯擦除",
          }}
        >
          <p>
            <T
              en={
                <>
                  This is the one feature in this chapter with{" "}
                  <b>no JavaScript equivalent</b>. Everything else here is either
                  erased or already JavaScript, but a parameter property makes
                  the compiler <b>generate</b> a <code>this.db = db</code>{" "}
                  statement that is not in your source. Node&apos;s built-in
                  TypeScript support (22.18 and later) only strips types, so it
                  rejects this syntax. The <code>erasableSyntaxOnly</code> flag
                  reports it as ts(1294) if you want the compiler to warn you
                  first. Use parameter properties freely with a normal build
                  step; avoid them if Node must run your <code>.ts</code> files
                  directly.
                </>
              }
              zh={
                <>
                  这是本章唯一一个<b>在 JavaScript 里没有对应写法</b>的特性。
                  这一章其他东西要么被擦除,要么本来就是 JavaScript;
                  而参数属性会让编译器<b>生成</b>一句你源码里没写过的{" "}
                  <code>this.db = db</code>。Node 内置的 TypeScript 支持(22.18
                  起)只做类型剥离,所以会拒绝这种语法。打开{" "}
                  <code>erasableSyntaxOnly</code> 后,编译器会以 ts(1294)
                  提前提醒你。有正常构建步骤时尽管用;
                  但如果要让 Node 直接跑 <code>.ts</code> 文件,就别用它。
                </>
              }
            />
          </p>
        </Callout>

        <p className="sec-desc">
          <T
            en={
              <>
                <b>readonly</b> blocks assignment after initialization.{" "}
                <b>get / set</b> let a pair of methods be used with property
                syntax. <b>static</b> puts a member on the class itself instead
                of on each instance. All three in one example:
              </>
            }
            zh={
              <>
                <b>readonly</b> 禁止初始化之后再赋值。<b>get / set</b>{" "}
                让一对方法可以像属性一样使用。<b>static</b>{" "}
                把成员挂在类本身上,而不是挂在每个实例上。三样放在一个例子里:
              </>
            }
          />
        </p>

        <CodeBlock
          lang="ts"
          title="order.ts · readonly + get/set + static"
          hl={[2, 9, 17]}
          code={S4_ORDER}
          note={
            <T
              en={
                <>
                  <code>readonly</code> is a compile-time check like{" "}
                  <code>private</code>, and it is narrower than it looks: it
                  blocks assignment to <i>the property</i>, not changes to the
                  object the property points at. With{" "}
                  <code>readonly tags: string[]</code>, the line{" "}
                  <code>o.tags = []</code> is an error but{" "}
                  <code>o.tags.push(&quot;x&quot;)</code> is allowed. To stop
                  changes at runtime you need <code>Object.freeze</code>.
                </>
              }
              zh={
                <>
                  <code>readonly</code> 和 <code>private</code>{" "}
                  一样是编译期检查,而且管的范围比看上去窄:
                  它禁止的是给<i>这个属性</i>赋值,不是禁止改属性指向的那个对象。
                  比如 <code>readonly tags: string[]</code>,
                  <code>o.tags = []</code> 会报错,但{" "}
                  <code>o.tags.push(&quot;x&quot;)</code> 完全合法。
                  想在运行时也拦住修改,那是 <code>Object.freeze</code> 的事。
                </>
              }
            />
          }
        />

        <Callout
          tone="idea"
          title={{
            en: "A getter and its setter may have different types",
            zh: "getter 和 setter 的类型可以不同",
          }}
        >
          <p>
            <T
              en={
                <>
                  Since TypeScript 4.3 the setter may accept a wider type than
                  the getter returns, as long as the getter&apos;s type is
                  assignable to the setter&apos;s. That is useful when you want
                  to accept several input forms but always hand back one:{" "}
                  <code>set sugar(v: number | string)</code> together with{" "}
                  <code>get sugar(): number</code> lets callers write{" "}
                  <code>o.sugar = &quot;30&quot;</code> while{" "}
                  <code>o.sugar</code> still reads as a <code>number</code>.
                </>
              }
              zh={
                <>
                  从 TypeScript 4.3 起,setter 接受的类型可以比 getter
                  返回的更宽,只要 getter 的类型能赋给 setter 的类型。
                  当你想接受多种输入形式、却总是返回同一种时很好用:
                  <code>set sugar(v: number | string)</code> 配上{" "}
                  <code>get sugar(): number</code>,调用方可以写{" "}
                  <code>o.sugar = &quot;30&quot;</code>,而读 <code>o.sugar</code>{" "}
                  拿到的仍然是 <code>number</code>。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §05 abstract & implements ================= */}
      <Section
        id="abstract-implements"
        index="05"
        title={{
          en: "abstract and implements: an unfinished class, and a shape check",
          zh: "abstract 与 implements:半成品类,和一次形状检查",
        }}
        desc={{
          en: "One says a subclass must finish the job. The other says a class must match an interface.",
          zh: "一个管「必须由子类补全」,一个管「必须符合这个形状」。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                An <b>abstract class is an unfinished class</b>. Some members are
                implemented; the ones marked <code>abstract</code> have only a
                signature. You cannot create an instance of it, and a concrete
                subclass must implement every abstract member before it can be
                used:
              </>
            }
            zh={
              <>
                <b>abstract 类是一个没写完的类</b>:一部分成员已经实现,
                标了 <code>abstract</code> 的那些只有签名。
                它不能被实例化;子类必须把每一个抽象成员都实现掉,才能拿来用:
              </>
            }
          />
        </p>

        <CodeBlock
          lang="ts"
          title={{
            en: "staff.ts · an unfinished class",
            zh: "staff.ts · 一个没写完的类",
          }}
          hl={[2, 9]}
          code={S5_ABSTRACT}
        />

        <p className="sec-desc">
          <T
            en={
              <>
                <b>implements is a check, not an inheritance</b>. An interface
                lists the members a class must have; <code>implements</code>{" "}
                asks the compiler to verify that the class has them. It adds
                nothing to the class. A checkout counter does not care which
                payment service is behind it, only that the object can{" "}
                <code>pay</code> and <code>refund</code>:
              </>
            }
            zh={
              <>
                <b>implements 是一次检查,不是继承</b>:interface
                列出一个类必须有哪些成员,<code>implements</code>{" "}
                让编译器去核对这个类有没有。它不会给类添加任何东西。
                收银台不关心背后接的是哪家支付服务,只要那个对象能{" "}
                <code>pay</code>、能 <code>refund</code>:
              </>
            }
          />
        </p>

        <CodeBlock
          lang="ts"
          title={{
            en: "payment.ts · the interface lists it, the class supplies it",
            zh: "payment.ts · interface 列出要求,class 逐条满足",
          }}
          hl={[1, 6, 14]}
          code={S5_PAYMENT}
        />

        <ContractBoard />

        <p className="sec-desc">
          <T
            en={
              <>
                The value of the interface shows up at the call site. MilkTeaShop
                takes <i>any</i> object that matches <code>PaymentProvider</code>
                , so swapping the payment service changes nothing inside the
                shop:
              </>
            }
            zh={
              <>
                interface 的价值体现在调用方:MilkTeaShop 接受<i>任何</i>
                符合 <code>PaymentProvider</code> 的对象,
                所以换一家支付服务,店铺内部一行都不用改:
              </>
            }
          />
        </p>

        <CodeBlock
          lang="ts"
          title={{
            en: "milk-tea-shop.ts · depend on the interface, not on one class",
            zh: "milk-tea-shop.ts · 依赖接口,而不是某个具体类",
          }}
          hl={[2, 10, 11]}
          code={S5_INJECT}
        />

        <Callout
          tone="deep"
          title={{
            en: "Three details that are easy to get wrong",
            zh: "三个容易搞错的细节",
          }}
        >
          <p>
            <T
              en={
                <>
                  1. <b>implements does not change the type of the class.</b> It
                  adds no members and it does not annotate anything for you. If
                  you write <code>pay(amount) {"{ … }"}</code> with no type,{" "}
                  <code>amount</code> does not become <code>number</code>; it is
                  an implicit <code>any</code>, which is an error under{" "}
                  <code>strict</code> (ts(7006)). Write the parameter types
                  yourself; the compiler then compares what you wrote against the
                  interface.
                </>
              }
              zh={
                <>
                  ① <b>implements 不会改变类的类型</b>:
                  它不添加成员,也不替你标注任何东西。如果写成{" "}
                  <code>pay(amount) {"{ … }"}</code> 而不标类型,
                  <code>amount</code> 不会变成 <code>number</code>,
                  而是隐式 <code>any</code>,在 <code>strict</code> 下直接报错
                  ts(7006)。参数类型得自己写,
                  编译器再拿你写的去和接口核对。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  2. <b>abstract class vs interface.</b> An interface only
                  describes a shape and is erased at compile time — at runtime
                  the name does not exist. An abstract class is a real class: it
                  exists at runtime, it can hold implemented methods and state,
                  and a subclass inherits them. Use an abstract class when
                  subclasses should inherit working code; use an interface when
                  you only want to describe a shape.
                </>
              }
              zh={
                <>
                  ② <b>abstract class 和 interface 的区别。</b>interface
                  只描述形状,编译期就被擦除 —— 运行时这个名字根本不存在。
                  abstract 类是一个真实的类:它在运行时存在,
                  可以带着已实现的方法和状态,子类会继承这些。
                  想让子类继承可用的代码,用 abstract 类;只想描述形状,用 interface。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  3. <b>One extends, many implements.</b>{" "}
                  <code>
                    class Shop extends Building implements Payable, Refundable{" "}
                    {"{ }"}
                  </code>{" "}
                  is valid. A class has exactly one base class, but it can be
                  checked against any number of interfaces.
                </>
              }
              zh={
                <>
                  ③ <b>extends 只能一个,implements 可以一串。</b>
                  <code>
                    class Shop extends Building implements Payable, Refundable{" "}
                    {"{ }"}
                  </code>{" "}
                  是合法的:一个类只有一个基类,但可以同时接受任意多个接口的检查。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 structural typing ================= */}
      <Section
        id="structural"
        index="06"
        title={{
          en: "Back to chapter 04: classes compare by shape, except for private",
          zh: "回到第 04 章:class 也比形状,唯独 private 认出身",
        }}
        desc={{
          en: "The last missing piece of structural typing.",
          zh: "补完结构化类型的最后一块拼图。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                Chapter 04 said that TypeScript compares types by their shape,
                not by their name. Classes are no exception: two unrelated
                classes with the same members are interchangeable. There is one
                exception, and it appears as soon as a class has a{" "}
                <code>private</code> or <code>protected</code> member. Step
                through it:
              </>
            }
            zh={
              <>
                第 04 章说过,TypeScript 比较类型看的是形状,不是名字。
                class 也不例外:两个毫无关系的类,只要成员一样就可以互换。
                但有一个例外,只要类里出现 <code>private</code> 或{" "}
                <code>protected</code> 成员,它就出现了。逐帧看:
              </>
            }
          />
        </p>

        <StructuralClassFlow />

        <CodeBlock
          lang="ts"
          title={{
            en: "playground.ts · reproduce it yourself",
            zh: "playground.ts · 亲手复现一遍",
          }}
          hl={[10]}
          code={S6_CUPS}
          note={
            <T
              en={
                <>
                  Delete both <code>private stock</code> lines and the assignment
                  compiles. Or keep them and move the declaration to a shared
                  base class that both cups extend — then there is only one
                  declaration, and the two types are compatible again.
                </>
              }
              zh={
                <>
                  把两行 <code>private stock</code> 都删掉,赋值就通过了;
                  或者保留它,把这个声明挪到两个杯子共同 extends
                  的基类里 —— 这样声明只有一处,两个类型重新兼容。
                </>
              }
            />
          }
        />

        <Callout
          tone="win"
          title={{
            en: "The complete rule for structural typing",
            zh: "结构化类型的完整规则",
          }}
        >
          <p>
            <T
              en={
                <>
                  Types are compared by shape, <b>except that two types with
                  private or protected members are compatible only if those
                  members come from the same declaration</b> (inherited from a
                  shared base class counts). This is also how libraries fake
                  nominal typing: give a class one private member, and no
                  same-shaped stranger can be used in its place.
                </>
              }
              zh={
                <>
                  类型按形状比较,<b>但只要涉及 private 或 protected 成员,
                  两个类型必须让这些成员来自同一处声明才兼容</b>
                  (从共同基类继承下来的算)。
                  这也正是一些库模拟名义类型的办法:给类塞一个私有成员,
                  形状相同的路人就再也顶替不了它。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §07 practice ================= */}
      <Section
        id="labs"
        index="07"
        title={{ en: "Practice", zh: "动手任务" }}
        desc={{
          en: "Four tasks in the TypeScript Playground: trigger the access errors, sign a contract, read the compiled output, and finish an abstract class.",
          zh: "四个任务全在 TypeScript Playground 里做:撞出访问检查的报错、签一份合同、读编译产物、补全一个抽象类。",
        }}
      >
        <LabSet ch="classes" items={LABS} />
      </Section>

      {/* ================= §08 quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Nine questions on what the compiler checks, and on what survives compilation.",
          zh: "九道题,考的是编译器到底检查了什么,以及编译之后还剩下什么。",
        }}
      >
        <Quiz ch="classes" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                A declared field must actually be assigned: initialize it where
                you declare it, assign it in the constructor, or take
                responsibility with <code>!</code>.
                strictPropertyInitialization enforces this, and it does not
                follow assignments made in other methods.
              </>
            ),
            zh: (
              <>
                声明了的字段必须真的被赋值:就地初始化、在构造器里赋值,
                或者用 <code>!</code>{" "}
                自己承担。strictPropertyInitialization 负责这项检查,
                而且它不追踪写在其他方法里的赋值。
              </>
            ),
          },
          {
            en: (
              <>
                Three access levels: <code>public</code> is the default,{" "}
                <code>protected</code> adds subclasses, <code>private</code> is
                the class body only. All three are compile-time checks.
              </>
            ),
            zh: (
              <>
                三级访问权限:<code>public</code> 是默认值,
                <code>protected</code> 多出子类,<code>private</code>{" "}
                只剩类体自己。三者都是编译期检查。
              </>
            ),
          },
          {
            en: (
              <>
                <code>private</code> is erased. In the compiled output it is an
                ordinary property, and even in TypeScript{" "}
                <code>s[&quot;field&quot;]</code> reads it without a cast. For a
                field that is unreachable at runtime, use JavaScript&apos;s{" "}
                <code>#field</code>.
              </>
            ),
            zh: (
              <>
                <code>private</code> 会被擦除:编译产物里它就是个普通属性,
                连在 TypeScript 里 <code>s[&quot;field&quot;]</code>{" "}
                都能直接读到,不用断言。要一个运行时也拿不到的字段,
                用 JavaScript 的 <code>#field</code>。
              </>
            ),
          },
          {
            en: (
              <>
                A parameter property replaces four lines with one, but it is the
                only feature here that generates code. A runtime that only
                strips types, such as Node running <code>.ts</code> files
                directly, rejects it.
              </>
            ),
            zh: (
              <>
                参数属性一行顶四行,但它是本章唯一会生成代码的特性。
                只做类型剥离的运行时会拒绝它 —— 比如直接跑{" "}
                <code>.ts</code> 文件的 Node。
              </>
            ),
          },
          {
            en: (
              <>
                <code>abstract</code> marks a class that cannot be instantiated
                and members a subclass must implement.{" "}
                <code>implements</code> only checks the class against an
                interface: it adds no members and infers no parameter types. One
                class can be checked against several interfaces.
              </>
            ),
            zh: (
              <>
                <code>abstract</code>{" "}
                标记的是不能实例化的类,以及子类必须实现的成员。
                <code>implements</code> 只是拿类去和接口核对:
                既不添加成员,也不推断参数类型。一个类可以同时接受多个接口的检查。
              </>
            ),
          },
          {
            en: (
              <>
                Classes are compared by shape, with one exception: once a class
                has a <code>private</code> or <code>protected</code> member,
                those members must come from the same declaration for the two
                types to be compatible.
              </>
            ),
            zh: (
              <>
                class 也按形状比较,只有一个例外:一旦类里有{" "}
                <code>private</code> 或 <code>protected</code> 成员,
                这些成员必须来自同一处声明,两个类型才兼容。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="classes" />
    </main>
  );
}
