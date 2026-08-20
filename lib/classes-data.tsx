"use client";

// Chapter 08 · Classes and interfaces — practice tasks (LABS) and quiz (QUIZ).

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";
import { T, type Loc } from "@/lib/i18n";

const LAB1_CODE: Loc<string> = {
  en: `class MilkTeaShop {
  public name = "Bloom Tea";
  protected recipe = "tea base first";
  private vaultCode = "8848";
}

class FranchiseShop extends MilkTeaShop {
  peek() {
    this.recipe;     // ✓ a subclass may read a protected member
    this.vaultCode;  // ✕ ts(2341) private and only
                     //   accessible within class 'MilkTeaShop'
  }
}

const shop = new MilkTeaShop();
shop.name;             // ✓ public
shop.recipe;           // ✕ ts(2445) protected ... within class
                       //   'MilkTeaShop' and its subclasses
shop["vaultCode"];     // ✓ no error at all — see §03`,
  zh: `class MilkTeaShop {
  public name = "Bloom Tea";
  protected recipe = "tea base first";
  private vaultCode = "8848";
}

class FranchiseShop extends MilkTeaShop {
  peek() {
    this.recipe;     // ✓ 子类可以读 protected 成员
    this.vaultCode;  // ✕ ts(2341) private and only
                     //   accessible within class 'MilkTeaShop'
  }
}

const shop = new MilkTeaShop();
shop.name;             // ✓ public
shop.recipe;           // ✕ ts(2445) protected ... within class
                       //   'MilkTeaShop' and its subclasses
shop["vaultCode"];     // ✓ 一点错都不报 —— 见 §03`,
};

const LAB2_CODE: Loc<string> = {
  en: `interface PaymentProvider {
  pay(amount: number): Promise<string>;
  refund(txId: string): Promise<void>;
}
interface Named {
  name: string;
}

// Step 1: the incomplete class
class CashPay implements PaymentProvider {
  async pay(amount: number) { return "cash_" + Date.now(); }
}
// ✕ ts(2420): Class 'CashPay' incorrectly implements
//   interface 'PaymentProvider'.
//     Property 'refund' is missing in type 'CashPay'
//     but required in type 'PaymentProvider'.

// Step 2: complete, and checked against two interfaces
class CashPay2 implements PaymentProvider, Named {
  name = "Cash counter";
  async pay(amount: number) { return "cash_" + Date.now(); }
  async refund(txId: string) {}
}`,
  zh: `interface PaymentProvider {
  pay(amount: number): Promise<string>;
  refund(txId: string): Promise<void>;
}
interface Named {
  name: string;
}

// 第一步:没写完的版本
class CashPay implements PaymentProvider {
  async pay(amount: number) { return "cash_" + Date.now(); }
}
// ✕ ts(2420): Class 'CashPay' incorrectly implements
//   interface 'PaymentProvider'.
//     Property 'refund' is missing in type 'CashPay'
//     but required in type 'PaymentProvider'.

// 第二步:补全,并同时接受两个接口的检查
class CashPay2 implements PaymentProvider, Named {
  name = "Cash counter";
  async pay(amount: number) { return "cash_" + Date.now(); }
  async refund(txId: string) {}
}`,
};

const LAB3_CODE: Loc<string> = {
  en: `class ShopA {
  private vaultCode = "8848";
}
class ShopB {
  #vaultCode = "8848";
}

const a = new ShopA();
console.log(a["vaultCode"]);
// "8848" — private is erased, so this is an ordinary property

console.log(JSON.stringify(a));
// {"vaultCode":"8848"}

const b = new ShopB();
console.log((b as any)["#vaultCode"]);
// undefined — there is no property with that name

console.log(JSON.stringify(b));
// {}`,
  zh: `class ShopA {
  private vaultCode = "8848";
}
class ShopB {
  #vaultCode = "8848";
}

const a = new ShopA();
console.log(a["vaultCode"]);
// "8848" —— private 被擦除了,这就是个普通属性

console.log(JSON.stringify(a));
// {"vaultCode":"8848"}

const b = new ShopB();
console.log((b as any)["#vaultCode"]);
// undefined —— 根本没有叫这个名字的属性

console.log(JSON.stringify(b));
// {}`,
};

const LAB4_CODE: Loc<string> = {
  en: `abstract class Staff {
  abstract greet(): string;
  clockIn() {
    console.log(this.greet() + ", clocking in");
  }
}

new Staff();
// 1 ✕ ts(2511): Cannot create an instance of an abstract class.

class Slacker extends Staff {}
// 2 ✕ ts(2515): Non-abstract class 'Slacker' does not
//   implement inherited abstract member greet from class 'Staff'.

class Barista extends Staff {
  greet() { return "I am the barista"; }
}
new Barista().clockIn();   // 3 ✓ "I am the barista, clocking in"`,
  zh: `abstract class Staff {
  abstract greet(): string;
  clockIn() {
    console.log(this.greet() + ", clocking in");
  }
}

new Staff();
// ① ✕ ts(2511): Cannot create an instance of an abstract class.

class Slacker extends Staff {}
// ② ✕ ts(2515): Non-abstract class 'Slacker' does not
//   implement inherited abstract member greet from class 'Staff'.

class Barista extends Staff {
  greet() { return "I am the barista"; }
}
new Barista().clockIn();   // ③ ✓ "I am the barista, clocking in"`,
};

export const LABS: Lab[] = [
  {
    id: "gate-crash",
    title: {
      en: "Trigger all three access checks yourself",
      zh: "三级访问权限,亲手撞一遍",
    },
    d: "easy",
    tags: ["private", "protected", "Playground"],
    task: (
      <T
        en={
          <p>
            Open the TypeScript Playground (typescriptlang.org/play) and write a{" "}
            <code>MilkTeaShop</code> class with one <code>public</code>, one{" "}
            <code>protected</code>, and one <code>private</code> member, plus a
            subclass <code>FranchiseShop</code>. Now read the{" "}
            <b>private member from inside the subclass</b> and the{" "}
            <b>protected member from outside the class</b>, and read both error
            messages in full. Then add one more line:{" "}
            <code>shop[&quot;vaultCode&quot;]</code>. Does the compiler complain?
          </p>
        }
        zh={
          <p>
            打开 TypeScript Playground(typescriptlang.org/play),写一个带{" "}
            <code>public</code> / <code>protected</code> / <code>private</code>{" "}
            三种成员的 <code>MilkTeaShop</code>,再写一个子类{" "}
            <code>FranchiseShop</code>。然后<b>从子类里读 private 成员</b>、
            <b>从类外读 protected 成员</b>,把两条报错完整读一遍。
            接着再加一行 <code>shop[&quot;vaultCode&quot;]</code> ——
            编译器会说什么吗?
          </p>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            Hover the red underline to see the message. Compare the wording of
            the two: one ends with <code>only accessible within class</code>,
            and the other adds <code>and its subclasses</code>. The bracket line
            is the surprising one.
          </>
        }
        zh={
          <>
            把鼠标停在红波浪线上就能看到报错。对比两条的措辞:
            一条以 <code>only accessible within class</code> 结尾,
            另一条多了 <code>and its subclasses</code>。
            方括号那一行才是最出人意料的。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock lang="ts" title="playground.ts" code={LAB1_CODE} />
        <p>
          <T
            en={
              <>
                The difference between the two errors is the difference between
                the two levels: the <code>protected</code> message ends with{" "}
                <code>and its subclasses</code>, the <code>private</code> one
                stops at <code>within class &apos;MilkTeaShop&apos;</code>. The
                last line is the important one:{" "}
                <code>shop[&quot;vaultCode&quot;]</code> produces no error.
                Bracket access to a private member is allowed on purpose, which
                is a good reminder that <code>private</code> is a check for
                people editing the code, not a lock.
              </>
            }
            zh={
              <>
                两条报错的差别,就是两级权限的差别:<code>protected</code>{" "}
                那条以 <code>and its subclasses</code> 结尾,
                <code>private</code> 那条停在{" "}
                <code>within class &apos;MilkTeaShop&apos;</code>。
                最关键的是最后一行:<code>shop[&quot;vaultCode&quot;]</code>{" "}
                一点错都不报。用方括号访问私有成员是被有意允许的 ——
                这提醒我们,<code>private</code>{" "}
                是给改代码的人看的一道检查,不是一把锁。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "implements-contract",
    title: {
      en: "Fail an implements check, then pass two of them",
      zh: "先让 implements 检查失败,再一次通过两个",
    },
    d: "medium",
    tags: ["implements", "interface", "Playground"],
    task: (
      <T
        en={
          <p>
            In the Playground, define this chapter&apos;s{" "}
            <code>PaymentProvider</code> interface (<code>pay</code> +{" "}
            <code>refund</code>). Write{" "}
            <code>class CashPay implements PaymentProvider</code> but{" "}
            <b>leave out refund</b>, and read what the compiler says. Then add
            it, and have the same class also implement a second interface{" "}
            <code>Named {"{ name: string }"}</code>.
          </p>
        }
        zh={
          <p>
            在 Playground 里定义本章的 <code>PaymentProvider</code> 接口(
            <code>pay</code> + <code>refund</code>),写一个{" "}
            <code>class CashPay implements PaymentProvider</code>,但
            <b>故意漏掉 refund</b>,读一读编译器说了什么。
            然后把它补上,并让同一个类再 implements 第二个接口{" "}
            <code>Named {"{ name: string }"}</code>。
          </p>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            The failure is ts(2420) <code>incorrectly implements</code>, and it
            names the missing member on its second line. Several interfaces are
            separated by commas: <code>implements A, B</code>.
          </>
        }
        zh={
          <>
            失败时报的是 ts(2420) <code>incorrectly implements</code>,
            第二行会点名缺了哪个成员。多个接口用逗号隔开:
            <code>implements A, B</code>。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock lang="ts" title="playground.ts" code={LAB2_CODE} />
        <p>
          <T
            en={
              <>
                Notice where the error appears: on the class name, not at the
                places where the class is used. That is the point of{" "}
                <code>implements</code>. It makes the class say what it is
                supposed to match, so a missing member is reported at the
                definition instead of surfacing later in someone else&apos;s
                code.
              </>
            }
            zh={
              <>
                注意报错出现的位置:在类名上,而不是散落在使用它的地方。
                这正是 <code>implements</code> 的用处 ——
                让类明确写出自己要符合什么,少了成员就在定义处报出来,
                而不是等到别人调用时才暴露。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "private-vs-hash",
    title: {
      en: "Compare the compiled output of private and #field",
      zh: "对比 private 和 #field 的编译产物",
    },
    d: "medium",
    tags: ["#field", "erasure", ".JS panel"],
    task: (
      <T
        en={
          <p>
            In the Playground write a class with{" "}
            <code>private vaultCode = &quot;8848&quot;</code> and open the{" "}
            <b>.JS tab</b> on the right to see the compiled output. Then change{" "}
            <code>private vaultCode</code> to <code>#vaultCode</code> and look
            again. Finally, try to read the field from outside each class, and{" "}
            <code>JSON.stringify</code> an instance of each.
          </p>
        }
        zh={
          <p>
            在 Playground 里写一个带{" "}
            <code>private vaultCode = &quot;8848&quot;</code> 的类,
            点开右侧的 <b>.JS 标签页</b>看编译产物;然后把{" "}
            <code>private vaultCode</code> 改成 <code>#vaultCode</code>,
            再看一次。最后分别从类外读一次这个字段,并对两个实例各做一次{" "}
            <code>JSON.stringify</code>。
          </p>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            There is one thing to compare: what is left in front of the field in
            the compiled output. In one version the word <code>private</code> is
            gone; in the other the <code>#</code> is still there. Set the
            Playground target to ES2022 so the second version is not rewritten
            into a <code>WeakMap</code>.
          </>
        }
        zh={
          <>
            要对比的只有一点:编译产物里,那个字段前面还剩下什么。
            一个版本里 <code>private</code> 消失了,另一个版本里{" "}
            <code>#</code> 原样还在。把 Playground 的 target 设为 ES2022,
            第二个版本就不会被改写成 <code>WeakMap</code>。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock lang="ts" title="playground.ts" code={LAB3_CODE} />
        <p>
          <T
            en={
              <>
                In the .JS panel, <code>ShopA</code> is left with a plain{" "}
                <code>vaultCode = &quot;8848&quot;</code> — the word{" "}
                <code>private</code> is gone. <code>ShopB</code> keeps{" "}
                <code>#vaultCode</code> exactly as written. That is the whole
                difference: <code>private</code> is checked while compiling,{" "}
                <code>#field</code> is enforced while running.
              </>
            }
            zh={
              <>
                .JS 面板里,<code>ShopA</code> 只剩下一个普通的{" "}
                <code>vaultCode = &quot;8848&quot;</code> ——{" "}
                <code>private</code> 这个词不见了;<code>ShopB</code> 的{" "}
                <code>#vaultCode</code> 则原样保留。
                差别就在这里:<code>private</code> 在编译时检查,
                <code>#field</code> 在运行时生效。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "abstract-factory",
    title: {
      en: "An abstract class: try to instantiate it first",
      zh: "abstract 类:先试着直接 new 一下",
    },
    d: "hard",
    tags: ["abstract", "extends", "Playground"],
    task: (
      <T
        en={
          <p>
            Write an abstract class <code>Staff</code> with an abstract method{" "}
            <code>greet(): string</code> and a normal method{" "}
            <code>clockIn()</code> that calls <code>this.greet()</code>. Produce
            three situations in order: (1) call <code>new Staff()</code>; (2)
            declare a subclass <code>Barista</code> that{" "}
            <b>does not implement greet</b>; (3) implement it and call{" "}
            <code>clockIn()</code>. What happens in each?
          </p>
        }
        zh={
          <p>
            写一个 abstract 类 <code>Staff</code>:抽象方法{" "}
            <code>greet(): string</code>,加一个普通方法{" "}
            <code>clockIn()</code>(内部调用 <code>this.greet()</code>)。
            依次制造三种情况:① 直接 <code>new Staff()</code>;② 子类{" "}
            <code>Barista</code> <b>不实现 greet</b>;③ 实现之后调用{" "}
            <code>clockIn()</code>。三种情况各是什么结果?
          </p>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            The first two are two different errors: ts(2511) blocks{" "}
            <code>new</code>, and ts(2515) asks for the abstract member that was
            not implemented. The third one runs — note that the{" "}
            <code>greet</code> called inside <code>clockIn</code> is the
            subclass&apos;s.
          </>
        }
        zh={
          <>
            前两种是两条不同的报错:ts(2511) 拦住 <code>new</code>,ts(2515)
            追问那个没实现的抽象成员。第三种能跑起来 —— 注意{" "}
            <code>clockIn</code> 里调用的 <code>greet</code> 来自子类。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock lang="ts" title="playground.ts" code={LAB4_CODE} />
        <p>
          <T
            en={
              <>
                Those three results are the whole life cycle of an unfinished
                class: the class itself cannot be instantiated (1), a subclass
                cannot be used until it implements every abstract member (2),
                and once it does, it inherits the methods that were already
                written (3). The base class fixes the sequence of steps; each
                subclass supplies the details.
              </>
            }
            zh={
              <>
                这三个结果就是「没写完的类」的完整生命周期:
                类本身不能实例化(①);子类在实现完每一个抽象成员之前不能用(②);
                实现之后,它就继承到了那些已经写好的方法(③)。
                父类固定流程的步骤,子类补上每一步的细节。
              </>
            }
          />
        </p>
      </>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: (
      <T
        en={
          <>
            <code>class Shop {'{ private vaultCode = "8848" }'}</code> — after it
            is compiled to JavaScript, what happens to <code>vaultCode</code>?
          </>
        }
        zh={
          <>
            <code>class Shop {'{ private vaultCode = "8848" }'}</code> ——
            编译成 JavaScript 之后,<code>vaultCode</code> 会变成什么?
          </>
        }
      />
    ),
    opts: [
      <T
        key="a"
        en={<>It becomes an ordinary property that any code can read</>}
        zh={<>变成一个普通属性,任何代码都能读</>}
      />,
      <T
        key="b"
        en={
          <>
            It is translated into <code>#vaultCode</code> and stays private
          </>
        }
        zh={
          <>
            自动翻译成 <code>#vaultCode</code>,继续保持私有
          </>
        }
      />,
      <T
        key="c"
        en={<>Reading it at runtime throws an error</>}
        zh={<>运行时读它会抛出异常</>}
      />,
      <T
        key="d"
        en={<>The whole field is removed and is not in the output</>}
        zh={<>整个字段被删掉,产物里不存在</>}
      />,
    ],
    correct: 0,
    wrong: [
      undefined,
      <T
        key="b"
        en={
          <>
            The compiler does not rewrite one syntax into another.{" "}
            <code>private</code> is a type-system annotation and is simply
            erased. If you want the runtime behavior of <code>#</code>, you
            have to write <code>#</code>.
          </>
        }
        zh={
          <>
            编译器不会把一种语法改写成另一种。<code>private</code>{" "}
            是类型系统的注解,擦掉就没了。想要 <code>#</code>{" "}
            的运行时行为,只能自己写 <code>#</code>。
          </>
        }
      />,
      <T
        key="c"
        en={
          <>
            There is no runtime check at all. After erasure the output does not
            even record that the field was ever <code>private</code>, so there
            is nothing left to throw.
          </>
        }
        zh={
          <>
            运行时根本没有任何检查。擦除之后,产物里连「这个字段曾经是{" "}
            <code>private</code>」这条信息都不存在,拿什么抛异常?
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            Only the modifier is removed. The field holds a value (
            <code>&quot;8848&quot;</code>), which is real runtime data, so it has
            to stay.
          </>
        }
        zh={
          <>
            删掉的只是那个修饰符。字段本身有值(<code>&quot;8848&quot;</code>
            ),那是实打实的运行时数据,必须保留。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            <code>private</code> is a compile-time check. It stops other people
            editing the code from reaching in; it does not stop{" "}
            <code>s[&quot;vaultCode&quot;]</code>,{" "}
            <code>JSON.stringify</code>, DevTools, or plain JavaScript. For a
            field that is unreachable at runtime, use JavaScript&apos;s{" "}
            <code>#field</code>.
          </>
        }
        zh={
          <>
            <code>private</code> 是编译期检查:它挡住的是改代码的人,
            挡不住 <code>s[&quot;vaultCode&quot;]</code>、
            <code>JSON.stringify</code>、DevTools 和普通 JavaScript。
            要一个运行时也拿不到的字段,用 JavaScript 的 <code>#field</code>。
          </>
        }
      />
    ),
  },
  {
    type: "choice",
    q: (
      <T
        en={
          <>
            Which sentence states the difference between <code>protected</code>{" "}
            and <code>private</code> correctly?
          </>
        }
        zh={
          <>
            关于 <code>protected</code> 和 <code>private</code> 的差别,
            哪句话说对了?
          </>
        }
      />
    ),
    opts: [
      <T
        key="a"
        en={
          <>
            <code>protected</code> is readable in subclasses;{" "}
            <code>private</code> only inside the class itself
          </>
        }
        zh={
          <>
            <code>protected</code> 在子类里可读,<code>private</code>{" "}
            只在类自己内部可读
          </>
        }
      />,
      <T
        key="b"
        en={
          <>
            <code>protected</code> is private at runtime;{" "}
            <code>private</code> only at compile time
          </>
        }
        zh={
          <>
            <code>protected</code> 是运行时私有,<code>private</code>{" "}
            是编译期私有
          </>
        }
      />,
      <T
        key="c"
        en={
          <>
            <code>protected</code> works only on methods,{" "}
            <code>private</code> only on fields
          </>
        }
        zh={
          <>
            <code>protected</code> 只能修饰方法,<code>private</code>{" "}
            只能修饰字段
          </>
        }
      />,
      <T
        key="d"
        en={<>There is no difference; they are two spellings of one thing</>}
        zh={<>没有差别,是同一个东西的两种写法</>}
      />,
    ],
    correct: 0,
    wrong: [
      undefined,
      <T
        key="b"
        en={
          <>
            Both are compile-time checks and both are erased. The difference is{" "}
            <i>which code</i> may read the member, not <i>when</i> the check
            happens.
          </>
        }
        zh={
          <>
            两个都是编译期检查,都会被擦除。差别在于<i>哪些代码</i>
            可以读这个成员,而不是<i>什么时候</i>检查。
          </>
        }
      />,
      <T
        key="c"
        en={
          <>
            Both modifiers work on fields, methods, accessors, and parameter
            properties. They control access, not the kind of member.
          </>
        }
        zh={
          <>
            字段、方法、访问器、参数属性,两个修饰符都能用。
            它们管的是访问范围,不挑成员种类。
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            They differ by exactly one group: subclasses.{" "}
            <code>protected</code> lets them in, <code>private</code> does not —
            and the two errors even have different codes, ts(2445) and ts(2341).
          </>
        }
        zh={
          <>
            它们正好差一类代码:子类。<code>protected</code> 放行,
            <code>private</code> 不放行 —— 连报错编号都不同,
            ts(2445) 和 ts(2341)。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            <code>public</code>: any code. <code>protected</code>: the class and
            any class that extends it. <code>private</code>: the class body
            only. All three are checked while compiling.
          </>
        }
        zh={
          <>
            <code>public</code>:任何代码。<code>protected</code>
            :本类,以及任何 extends 它的类。<code>private</code>:只有类体自己。
            三者都在编译期检查。
          </>
        }
      />
    ),
  },
  {
    type: "choice",
    q: (
      <T
        en={
          <>
            Under <code>strict</code>, <code>name: string;</code> reports
            ts(2564): declared but never assigned. Which change does{" "}
            <b>not</b> make the error go away?
          </>
        }
        zh={
          <>
            <code>strict</code> 下 <code>name: string;</code> 报了 ts(2564):
            声明了却从未赋值。下面哪种改法<b>不能</b>消掉这个错误?
          </>
        }
      />
    ),
    opts: [
      <T
        key="a"
        en={
          <>
            Call <code>this.init()</code> in the constructor and assign{" "}
            <code>name</code> inside <code>init</code>
          </>
        }
        zh={
          <>
            构造器里调 <code>this.init()</code>,在 <code>init</code>{" "}
            方法里给 <code>name</code> 赋值
          </>
        }
      />,
      <T
        key="b"
        en={
          <>
            Initialize it where it is declared:{" "}
            <code>name = &quot;Unnamed&quot;</code>
          </>
        }
        zh={
          <>
            就地初始化:<code>name = &quot;Unnamed&quot;</code>
          </>
        }
      />,
      <T
        key="c"
        en={
          <>
            Assign it in the constructor: <code>this.name = …</code>
          </>
        }
        zh={
          <>
            在构造器里直接赋值:<code>this.name = …</code>
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            Change it to <code>name!: string</code> and take responsibility
          </>
        }
        zh={
          <>
            改成 <code>name!: string</code>,自己承担这份保证
          </>
        }
      />,
    ],
    correct: 0,
    wrong: [
      undefined,
      <T
        key="b"
        en={
          <>
            Initializing at the declaration is the most direct fix. The value is
            there before the constructor even runs.
          </>
        }
        zh={
          <>
            就地初始化是最直接的改法 —— 构造器还没跑,值就已经在了。
          </>
        }
      />,
      <T
        key="c"
        en={
          <>
            The compiler does look at assignments made in the constructor
            itself. This is one of the standard fixes.
          </>
        }
        zh={<>构造器自己内部的赋值,编译器是看得见的。这是标准改法之一。</>}
      />,
      <T
        key="d"
        en={
          <>
            <code>!</code> does silence the error. It moves the guarantee from
            the compiler to you, which is a real trade-off — but the question is
            only whether the check passes, and it does.
          </>
        }
        zh={
          <>
            <code>!</code> 确实能消掉报错。
            代价是这份保证从编译器转到了你身上,那是另一回事;
            但就「检查能不能通过」而言,它是有效的。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            The compiler <b>does not follow assignments across methods</b>. It
            cannot tell whether <code>init()</code> always runs, or whether it
            assigns the field on every path. Initialize at the declaration,
            assign in the constructor, or use <code>!</code>. Going through{" "}
            <code>init</code> is the one option that does not work.
          </>
        }
        zh={
          <>
            编译器<b>不跨方法追踪赋值</b>:它无法确定 <code>init()</code>{" "}
            一定会被调用,也无法确定它在每条路径上都赋了值。
            就地初始化、构造器里赋值,或者用 <code>!</code> ——
            绕道 <code>init</code> 是唯一无效的那条路。
          </>
        }
      />
    ),
  },
  {
    type: "fill",
    q: (
      <T
        en={
          <>
            You want a class that cannot be instantiated directly, and whose
            missing members a subclass must implement. Which keyword goes in
            front of <code>class</code>?
          </>
        }
        zh={
          <>
            想要一个不能直接实例化、缺的成员必须由子类实现的类 —— 该在{" "}
            <code>class</code> 前面加哪个关键字?
          </>
        }
      />
    ),
    placeholder: { en: "Type the keyword...", zh: "输入关键字…" },
    answers: ["abstract"],
    hint: (
      <T
        en={
          <>
            The same word marks the class and the members that have only a
            signature.
          </>
        }
        zh={<>同一个词,既标记这个类,也标记那些只有签名的成员。</>}
      />
    ),
    why: (
      <T
        en={
          <>
            An <code>abstract</code> class is a class that is not finished. Its{" "}
            <code>abstract</code> members have a signature and no body, and a
            concrete subclass must implement all of them. Calling{" "}
            <code>new</code> on the abstract class gives ts(2511). The methods
            that are already implemented are inherited as usual.
          </>
        }
        zh={
          <>
            <code>abstract</code> 类是一个没写完的类:标了{" "}
            <code>abstract</code> 的成员只有签名没有方法体,
            子类必须把它们全部实现。直接对它 <code>new</code> 会报 ts(2511)。
            那些已经实现好的方法,子类照常继承。
          </>
        }
      />
    ),
  },
  {
    type: "choice",
    q: (
      <T
        en={
          <>
            In <code>class WeChatPay implements PaymentProvider</code>, what does{" "}
            <code>implements</code> actually do?
          </>
        }
        zh={
          <>
            <code>class WeChatPay implements PaymentProvider</code> 里的{" "}
            <code>implements</code>,到底做了什么?
          </>
        }
      />
    ),
    opts: [
      <T
        key="a"
        en={
          <>
            It checks at compile time that the class has the members the
            interface lists. It provides nothing and leaves no runtime trace
          </>
        }
        zh={
          <>
            编译期核对这个类有没有接口列出的成员。它不提供任何东西,
            也不留下运行时痕迹
          </>
        }
      />,
      <T
        key="b"
        en={<>It copies the interface&apos;s method bodies into the class</>}
        zh={<>把接口里的方法实现复制进这个类</>}
      />,
      <T
        key="c"
        en={<>It checks every instance against the interface at runtime</>}
        zh={<>在运行时检查每个实例是否符合接口</>}
      />,
      <T
        key="d"
        en={
          <>
            It makes <code>WeChatPay</code> inherit all members of{" "}
            <code>PaymentProvider</code>
          </>
        }
        zh={
          <>
            让 <code>WeChatPay</code> 继承 <code>PaymentProvider</code>{" "}
            的全部成员
          </>
        }
      />,
    ],
    correct: 0,
    wrong: [
      undefined,
      <T
        key="b"
        en={
          <>
            There is nothing to copy. An interface only describes a shape; it
            contains no method bodies. The class has to write every one of them.
          </>
        }
        zh={
          <>
            没有东西可复制。interface 只描述形状,里面没有任何方法体,
            每一个都得类自己写。
          </>
        }
      />,
      <T
        key="c"
        en={
          <>
            An interface is erased when the code is compiled. At runtime the
            name <code>PaymentProvider</code> does not exist, so nothing could
            perform such a check.
          </>
        }
        zh={
          <>
            interface 在编译时被擦除,运行时连{" "}
            <code>PaymentProvider</code> 这个名字都不存在,谁来做这个检查?
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            Inheriting is what <code>extends</code> does, and it brings
            implementations with it. <code>implements</code> adds nothing at
            all; it only compares.
          </>
        }
        zh={
          <>
            继承是 <code>extends</code> 的事,而且会连实现一起带过来。
            <code>implements</code> 什么都不添加,它只做比较。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            <code>implements</code> does not change the type of the class in any
            way. It only asks the compiler to confirm that the class matches the
            interface. Because it is only a check, one class can be checked
            against several interfaces, while <code>extends</code> allows exactly
            one base class.
          </>
        }
        zh={
          <>
            <code>implements</code> 不会以任何方式改变类的类型,
            它只是让编译器确认这个类符合接口。
            正因为它只是一次检查,一个类可以同时接受多个接口的检查,
            而 <code>extends</code> 只能有一个基类。
          </>
        }
      />
    ),
  },
  {
    type: "choice",
    q: (
      <T
        en={
          <>
            <code>
              class CashPay implements PaymentProvider{" "}
              {"{ pay(amount) { … } }"}
            </code>{" "}
            — <code>amount</code> has no annotation. What is its type?
          </>
        }
        zh={
          <>
            <code>
              class CashPay implements PaymentProvider{" "}
              {"{ pay(amount) { … } }"}
            </code>{" "}
            —— <code>amount</code> 没有标注类型,它的类型是什么?
          </>
        }
      />
    ),
    opts: [
      <T
        key="a"
        en={
          <>
            An implicit <code>any</code>, which is error ts(7006) under{" "}
            <code>strict</code>
          </>
        }
        zh={
          <>
            隐式 <code>any</code>,在 <code>strict</code> 下是报错 ts(7006)
          </>
        }
      />,
      <T
        key="b"
        en={
          <>
            <code>number</code>, inferred from the interface
          </>
        }
        zh={
          <>
            <code>number</code>,从接口那里推断过来
          </>
        }
      />,
      <T
        key="c"
        en={
          <>
            <code>unknown</code>, the safe default
          </>
        }
        zh={
          <>
            <code>unknown</code>,安全的默认值
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            <code>string</code>, the default for parameters
          </>
        }
        zh={
          <>
            <code>string</code>,参数的默认类型
          </>
        }
      />,
    ],
    correct: 0,
    wrong: [
      undefined,
      <T
        key="b"
        en={
          <>
            This is the most common wrong expectation.{" "}
            <code>implements</code> <b>only checks</b>. It compares the class
            you wrote against the interface; it never pushes the
            interface&apos;s types back into your parameters.
          </>
        }
        zh={
          <>
            这是最常见的错误预期。<code>implements</code> <b>只做检查</b>:
            它拿你写好的类去和接口比对,绝不会把接口的类型倒推回你的参数上。
          </>
        }
      />,
      <T
        key="c"
        en={
          <>
            <code>unknown</code> is what a <code>catch</code> variable gets
            under <code>useUnknownInCatchVariables</code>. An unannotated
            function parameter gets an implicit <code>any</code>, reported by{" "}
            <code>noImplicitAny</code>.
          </>
        }
        zh={
          <>
            <code>unknown</code> 是 <code>useUnknownInCatchVariables</code>{" "}
            下 <code>catch</code> 变量的待遇。没标注的函数参数拿到的是隐式{" "}
            <code>any</code>,由 <code>noImplicitAny</code> 报出来。
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            TypeScript never guesses a default type for a parameter. With no
            information it is <code>any</code>, and <code>strict</code> reports
            it.
          </>
        }
        zh={
          <>
            TypeScript 从不给参数猜一个默认类型。没有信息就是{" "}
            <code>any</code>,<code>strict</code> 会把它报出来。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            The check runs in one direction only: from the class to the
            interface. You still write{" "}
            <code>pay(amount: number)</code> yourself, and the compiler then
            compares what you wrote against{" "}
            <code>PaymentProvider</code>.
          </>
        }
        zh={
          <>
            这个检查只有一个方向:从类到接口。
            <code>pay(amount: number)</code> 还是要自己写,
            编译器再拿你写的去和 <code>PaymentProvider</code> 比对。
          </>
        }
      />
    ),
  },
  {
    type: "multi",
    q: (
      <T
        en={
          <>
            About the parameter property{" "}
            <code>constructor(private db: Database) {"{}"}</code>, which
            statements are correct? (Choose all that apply.)
          </>
        }
        zh={
          <>
            关于参数属性{" "}
            <code>constructor(private db: Database) {"{}"}</code>
            ,哪些说法是对的?(多选)
          </>
        }
      />
    ),
    opts: [
      <T
        key="a"
        en={
          <>
            It combines three steps: declaring the field, receiving the
            argument, and assigning it
          </>
        }
        zh={<>它把「声明字段 + 接收实参 + 赋值」三步合成了一步</>}
      />,
      <T
        key="b"
        en={
          <>
            It cannot be erased, so a runtime that only strips types (such as
            Node running <code>.ts</code> directly) rejects it
          </>
        }
        zh={
          <>
            它不能被单纯擦除,所以只做类型剥离的运行时(比如直接跑{" "}
            <code>.ts</code> 的 Node)会拒绝它
          </>
        }
      />,
      <T
        key="c"
        en={<>It leaves no trace in the compiled output</>}
        zh={<>编译后不留下任何痕迹</>}
      />,
      <T
        key="d"
        en={
          <>
            <code>readonly</code> works the same way:{" "}
            <code>constructor(readonly city: string)</code>
          </>
        }
        zh={
          <>
            <code>readonly</code> 也能这样用:
            <code>constructor(readonly city: string)</code>
          </>
        }
      />,
    ],
    correct: [0, 1, 3],
    missHint: (
      <T
        en={
          <>
            One correct statement is missing. Think about whether{" "}
            <code>readonly</code> counts as a modifier here, and about what a
            runtime that only strips types can do with this syntax.
          </>
        }
        zh={
          <>
            漏了一条。想一想 <code>readonly</code> 在这里算不算修饰符,
            以及一个只做类型剥离的运行时拿这种语法能怎么办。
          </>
        }
      />
    ),
    extraHint: (
      <T
        en={
          <>
            One of your picks is wrong. A parameter property makes the compiler{" "}
            <b>generate an assignment statement</b>, and a generated statement
            is exactly a trace in the output.
          </>
        }
        zh={
          <>
            有一项选错了。参数属性会让编译器<b>生成一条赋值语句</b>,
            而生成的语句正是留在产物里的痕迹。
          </>
        }
      />
    ),
    why: (
      <T
        en={
          <>
            A parameter property replaces four lines with one, but it emits code:
            the compiler writes <code>this.db = db</code> for you. That is why it
            cannot simply be erased and why{" "}
            <code>erasableSyntaxOnly</code> reports it. Any of{" "}
            <code>public</code>, <code>private</code>, <code>protected</code>,
            and <code>readonly</code> on a constructor parameter turns it into
            one.
          </>
        }
        zh={
          <>
            参数属性一行顶四行,但它会生成代码:编译器替你写下{" "}
            <code>this.db = db</code>。
            这就是它不能被单纯擦除、以及 <code>erasableSyntaxOnly</code>{" "}
            会报它的原因。构造器参数前写上 <code>public</code>、
            <code>private</code>、<code>protected</code>、<code>readonly</code>{" "}
            中任意一个,都会形成参数属性。
          </>
        }
      />
    ),
  },
  {
    type: "choice",
    q: (
      <T
        en={
          <>
            <code>PaperCup</code> and <code>PlasticCup</code> have identical
            members, and each declares its own{" "}
            <code>private stock = 0</code>. What does{" "}
            <code>const cup: PaperCup = new PlasticCup()</code> do?
          </>
        }
        zh={
          <>
            <code>PaperCup</code> 和 <code>PlasticCup</code> 成员完全相同,
            且各自声明了一个 <code>private stock = 0</code>。
            <code>const cup: PaperCup = new PlasticCup()</code> 的结果是?
          </>
        }
      />
    ),
    opts: [
      <T
        key="a"
        en={
          <>
            It fails: private members must come from the same declaration, so
            these two classes are compared by identity
          </>
        }
        zh={
          <>
            报错:private 成员必须来自同一处声明,
            所以这两个类是按「出身」比较的
          </>
        }
      />,
      <T
        key="b"
        en={
          <>
            It succeeds: structural typing looks at the shape, and the shapes
            match
          </>
        }
        zh={<>通过:结构化类型只看形状,而形状完全一致</>}
      />,
      <T
        key="c"
        en={<>It succeeds, with a warning</>}
        zh={<>通过,但会有一条警告</>}
      />,
      <T
        key="d"
        en={<>It fails: one class can never be assigned to another</>}
        zh={<>报错:class 之间从来不能互相赋值</>}
      />,
    ],
    correct: 0,
    wrong: [
      undefined,
      <T
        key="b"
        en={
          <>
            One step short. Structural typing is the default, but{" "}
            <code>private</code> and <code>protected</code> are the written
            exception: <i>Types have separate declarations of a private property
            &apos;stock&apos;</i>. The same name is not enough.
          </>
        }
        zh={
          <>
            差一步。结构化确实是默认规则,但 <code>private</code> 和{" "}
            <code>protected</code> 是明写的例外:
            <i>
              Types have separate declarations of a private property
              &apos;stock&apos;
            </i>
            。名字一样也不行。
          </>
        }
      />,
      <T
        key="c"
        en={
          <>
            TypeScript has no warning level for type checking. An assignment
            either type-checks or it does not, and this one is a plain ts(2322).
          </>
        }
        zh={
          <>
            TypeScript 的类型检查没有「警告」这一档,
            赋值要么通过要么不通过 —— 这里是结结实实的 ts(2322)。
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            Two classes with the same shape and <i>no</i> private members are
            assignable to each other; chapter 04 covered that. What breaks it
            here is <code>private</code>, not the fact that these are classes.
          </>
        }
        zh={
          <>
            两个同形状且<i>没有</i>私有成员的类是可以互相赋值的,
            第 04 章讲过。这里出问题的原因是 <code>private</code>,
            而不是「它们是 class」。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            The complete rule: types are compared by shape, except that{" "}
            <code>private</code> and <code>protected</code> members must come
            from the <b>same declaration</b> (inherited from a shared base class
            counts). To make the two compatible again, have both classes extend
            one base class that declares <code>stock</code>.
          </>
        }
        zh={
          <>
            完整规则:类型按形状比较,但 <code>private</code> 和{" "}
            <code>protected</code> 成员必须来自<b>同一处声明</b>
            (从共同基类继承下来的算)。想让它们重新兼容,
            就让两个类 extends 同一个声明了 <code>stock</code> 的基类。
          </>
        }
      />
    ),
  },
  {
    type: "choice",
    q: (
      <T
        en={
          <>
            You need a field that code outside the class cannot read{" "}
            <b>while the program runs</b>. Which one do you use?
          </>
        }
        zh={
          <>
            你需要一个<b>程序运行时</b>类外读不到的字段,该用哪一种写法?
          </>
        }
      />
    ),
    opts: [
      <T
        key="a"
        en={
          <>
            A JavaScript private field:{" "}
            <code>#vaultCode = &quot;8848&quot;</code>
          </>
        }
        zh={
          <>
            JavaScript 的私有字段:<code>#vaultCode = &quot;8848&quot;</code>
          </>
        }
      />,
      <T
        key="b"
        en={
          <>
            <code>private vaultCode</code> — that is what private is for
          </>
        }
        zh={
          <>
            <code>private vaultCode</code> —— private 就是干这个的
          </>
        }
      />,
      <T
        key="c"
        en={
          <>
            <code>protected vaultCode</code> — even stricter
          </>
        }
        zh={
          <>
            <code>protected vaultCode</code> —— 再收紧一级
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            <code>readonly vaultCode</code> — read-only means safe
          </>
        }
        zh={
          <>
            <code>readonly vaultCode</code> —— 只读就等于安全
          </>
        }
      />,
    ],
    correct: 0,
    wrong: [
      undefined,
      <T
        key="b"
        en={
          <>
            <code>private</code> is erased, so at runtime it is an ordinary
            property. Even in TypeScript,{" "}
            <code>s[&quot;vaultCode&quot;]</code> reads it without an error.
          </>
        }
        zh={
          <>
            <code>private</code> 会被擦除,运行时就是个普通属性。
            连在 TypeScript 里,<code>s[&quot;vaultCode&quot;]</code>{" "}
            都能读到而且不报错。
          </>
        }
      />,
      <T
        key="c"
        en={
          <>
            That is the wrong direction: <code>protected</code> is{" "}
            <i>wider</i> than <code>private</code>, because subclasses can read
            it too. It is also a compile-time check, so it protects nothing at
            runtime.
          </>
        }
        zh={
          <>
            方向反了:<code>protected</code> 比 <code>private</code> 还<i>宽</i>
            ,子类也能读。而且它同样是编译期检查,运行时没有任何保护。
          </>
        }
      />,
      <T
        key="d"
        en={
          <>
            <code>readonly</code> is about whether the property can be assigned,
            not about who can read it — and it too is checked only while
            compiling.
          </>
        }
        zh={
          <>
            <code>readonly</code> 管的是这个属性能不能被赋值,
            而不是谁能读它 —— 而且它同样只在编译期检查。
          </>
        }
      />,
    ],
    why: (
      <T
        en={
          <>
            &quot;Unreachable while the program runs&quot; is a runtime
            requirement, and only JavaScript&apos;s <code>#field</code> meets
            it. It is not part of the type system, so erasing types does not
            remove it.
          </>
        }
        zh={
          <>
            「程序运行时读不到」是一个运行时要求,只有 JavaScript 的{" "}
            <code>#field</code> 做得到。
            它不属于类型系统,所以擦除类型不会把它擦掉。
          </>
        }
      />
    ),
  },
];
