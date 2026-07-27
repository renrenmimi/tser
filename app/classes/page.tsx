"use client";

// 08 · 类与接口 —— 门禁等级:
// 字段与初始化 → 访问修饰符 → private vs #field → 参数属性等便利件 →
// abstract & implements → 结构化类型下的 class → 动手任务 → 测验 → 要点。

import "./chapter.css";

import { Hero, Section, Callout, KeyPoints, ChapterFooter } from "@/lib/kit";
import { CodeBlock, CodePair } from "@/lib/code";
import { LabSet } from "@/lib/labs";
import { Quiz } from "@/lib/quiz";
import { LABS, QUIZ } from "@/lib/classes-data";
import {
  GateHero,
  AccessGate,
  ErasureViz,
  ContractBoard,
  StructuralClassFlow,
} from "./viz";

export default function ClassesPage() {
  return (
    <main className="page" data-ch="classes">
      <Hero
        ch="classes"
        title={
          <>
            类与<span className="grad">接口</span>
          </>
        }
        essence={
          <>
            把类想成一栋楼:大堂谁都能进,办公区要工牌,保险库只有本人能开。
            TypeScript 给 class 装的,就是这一整套门禁 ——
            外加一份「必须兑现」的装修合同。
          </>
        }
        chips={[
          { id: "fields", n: "01", label: "字段与初始化" },
          { id: "modifiers", n: "02", label: "门禁三级" },
          { id: "private-hash", n: "03", label: "private vs #field" },
          { id: "sugar", n: "04", label: "便利件四样" },
          { id: "abstract-implements", n: "05", label: "abstract & implements" },
          { id: "structural", n: "06", label: "类的兼容" },
          { id: "labs", n: "07", label: "动手" },
          { id: "quiz", n: "08", label: "测验" },
        ]}
      >
        <GateHero />
      </Hero>

      {/* ================= §01 字段与初始化 ================= */}
      <Section
        id="fields"
        index="01"
        title="字段:说了有,就得真有"
        desc="class 的字段声明是一句承诺 —— strict 模式下,编译器会盯着你兑现。"
      >
        <Callout tone="story" title="开店先报备">
          <p>
            开一家奶茶店,先去工商局报备:「本店有店名、有菜单」。
            报备完就得真有 —— 开业那天店名还空着,监管立刻找上门。
          </p>
          <p>
            class 的字段声明就是这份报备:你写下 <code>name: string</code>,
            等于承诺「每个 new 出来的实例,都有一个 string 类型的
            name」。<b>strictPropertyInitialization</b>(strict 全家桶的一员)
            负责验收:承诺了却没赋值,编译期就拦下。
          </p>
        </Callout>

        <CodeBlock
          lang="ts"
          title="milk-tea-shop.ts · 字段的两种兑现方式"
          hl={[2, 6]}
          code={`class MilkTeaShop {
  menu: string[] = [];     // ① 声明 + 就地初始化
  name: string;            // 只声明 —— 那就必须在构造器里给

  constructor(name: string) {
    this.name = name;      // ② 构造器里赋值,承诺兑现
  }
}

const shop = new MilkTeaShop("杭州店");
shop.name.toUpperCase();   // 放心用 —— 编译器担保它一定有值`}
        />

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title="空头支票 · 报错"
              hl={[2]}
              code={`class MilkTeaShop {
  name: string;
  // ❌ Property 'name' has no
  //    initializer and is not
  //    definitely assigned in the
  //    constructor. ts(2564)
}`}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title="三种兑现姿势"
              hl={[2, 4, 7]}
              code={`class MilkTeaShop {
  name = "未命名门店";  // ① 就地给
  city: string;
  boss!: string;        // ③「!」我发誓有

  constructor(city: string) {
    this.city = city;   // ② 构造器里给
  }
}`}
            />
          }
        />

        <Callout tone="warn" title="两个绕不过去的坑">
          <p>
            <b>坑一:想在别的方法里赋值蒙混过关。</b>在 constructor 里调{" "}
            <code>this.init()</code>、init 里给字段赋值 —— 编译器
            <b>不跨方法追踪</b>,照样报 ts(2564)。要么回到构造器,要么用{" "}
            <code>!</code>。
          </p>
          <p>
            <b>坑二:把 <code>!</code> 当万金油。</b>
            <code>boss!: string</code> 的意思是「担保从编译器手里转到我手里」
            —— 它闭嘴了,但真是 undefined 的话,运行时炸的是你。
            只在「框架保证会注入」这类你确知的场景用。
          </p>
        </Callout>

        <p className="sec-desc">
          方法呢?方法就是「住在 class 里的函数」—— 参数、返回值的标注规则和第
          02 章一模一样,没有新知识。真正的新知识在下一节:
          给成员分门禁等级。
        </p>
      </Section>

      {/* ================= §02 门禁三级 ================= */}
      <Section
        id="modifiers"
        index="02"
        title="门禁三级:public、protected、private"
        desc="同一栋楼,三种门 —— 谁能进哪扇门,编译器替你把关。"
      >
        <p className="sec-desc">
          回到那栋楼:<b>大堂(public)</b>谁都能进;<b>办公区(protected)
          </b>要工牌,员工和分店(子类)可以;<b>保险库(private)</b>
          只有本人 —— 也就是类自己的方法里 —— 能开。写在代码里长这样:
        </p>

        <CodeBlock
          lang="ts"
          title="milk-tea-shop.ts · 一栋楼的三扇门"
          hl={[2, 3, 4]}
          code={`class MilkTeaShop {
  public name = "总店";       // 大堂:不写修饰符,默认就是 public
  protected recipe = "茶底先放,半糖去冰";  // 办公区:子类可见
  private vaultCode = "8848"; // 保险库:只有类内部

  intro() {
    // 类内部 = 本人:三扇门全开
    return this.name + " / " + this.recipe + " / " + this.vaultCode;
  }
}

class FranchiseShop extends MilkTeaShop {
  train() {
    return this.recipe;   // ✅ extends 就是工牌,办公区可进
    // this.vaultCode;    // ❌ ts(2341) 保险库免谈
  }
}

const shop = new MilkTeaShop();
shop.name;        // ✅ 大堂
// shop.recipe;   // ❌ ts(2445) 散客进不了办公区`}
        />

        <AccessGate />

        <Callout tone="warn" title="子类构造器的规矩:先叫楼上">
          <p>
            子类一旦自己写了 constructor,第一件事必须是{" "}
            <code>super(…)</code> —— 先把父类的地基打好,才能动{" "}
            <code>this</code>。忘了会吃到 ts(2377):
            <b>
              Constructors for derived classes must contain a &apos;super&apos;
              call.
            </b>{" "}
            这不是 TS 挑剔,是 JavaScript 本身的规矩,TS 只是提前告诉你。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 private vs #field ================= */}
      <Section
        id="private-hash"
        index="03"
        title="编译期门禁 vs 运行时门禁:private 与 #field"
        desc="先泼一盆冷水:TS 的 private,擦除后运行时不设防。"
      >
        <p className="sec-desc">
          还记得全书第一课吗 —— <b>类型在编译后全部擦除</b>。private
          也是类型系统的一部分,所以它同样会被擦掉。你以为锁进保险库的东西,
          编译产物里就摆在桌面上。JavaScript 自己倒是有一套真门禁:
          <b>#私有字段(#field)</b>。两边对照着看:
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title="TS private · 防手滑"
              hl={[6, 7]}
              code={`class Shop {
  private vaultCode = "8848";
}
const s = new Shop();

s.vaultCode;          // ❌ ts(2341)
(s as any).vaultCode; // 😈 "8848"
// 编译期拦得住同事,
// 拦不住运行时的 as any`}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title="JS #field · 防翻墙"
              hl={[6, 7]}
              code={`class Shop {
  #vaultCode = "8848";
}
const s = new Shop();

// s.#vaultCode        ❌ 语法级拒绝
(s as any)["#vaultCode"];
// undefined —— 运行时真拿不到
// 擦除之后,铁门依然是铁门`}
            />
          }
        />

        <ErasureViz />

        <div className="grid-2">
          <div className="card">
            <div className="card-kicker">TS PRIVATE</div>
            <div className="card-title">🚧 编译期围栏</div>
            <p>
              零运行时开销、报错信息友好、能参与类型系统的兼容判定
              (§06 的「准名义」就靠它)。适合挡的是<b>队友的手滑</b>:
              99% 的封装需求到这就够了。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">JS #FIELD</div>
            <div className="card-title">🔒 运行时铁门</div>
            <p>
              JavaScript 原生语法,擦除后依然生效,类外
              <b>任何手段都拿不到</b>。TS 对它照样做完整类型检查。
              要防的是「故意翻墙的外人」—— 写库、藏真机密时用它。
            </p>
          </div>
        </div>

        <Callout tone="warn" title="误区:以为 private 运行时也保密">
          <p>
            把密码、token 存进 private 字段就觉得安全?
            <code>JSON.stringify(shop)</code> 一下,保险库全文直播。
            记住口诀:<b>private 防手滑,#field 防翻墙</b> ——
            真要保密的东西,别指望任何一种「字段」,那是加密的活。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 便利件四样 ================= */}
      <Section
        id="sugar"
        index="04"
        title="便利件四样:参数属性、readonly、getter/setter、static"
        desc="都不是新概念,是让 class 写着顺手的四个开关。"
      >
        <p className="sec-desc">
          <b>参数属性(parameter properties)</b>是最省事的一件:
          在构造器参数前面写个修饰符,声明、接收、赋值三步并成一步 ——
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title="老老实实写 · 四行样板"
              code={`class MilkTeaShop {
  private db: Database;
  readonly city: string;

  constructor(db: Database, city: string) {
    this.db = db;
    this.city = city;
  }
}`}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title="参数属性 · 一步到位"
              hl={[3, 4]}
              code={`class MilkTeaShop {
  constructor(
    private db: Database,
    readonly city: string,
  ) {}
}
// 参数前一有修饰符,
// 它就自动变成同名字段并赋值`}
            />
          }
        />

        <Callout tone="deep" title="一句话提醒:它是「不可擦除语法」">
          <p>
            参数属性不只是类型 —— 编译器要为它<b>生成赋值代码</b>,
            所以它没法被「纯擦除」。Node 22.18+ 原生跑 .ts
            走的正是纯擦除路线,遇到它直接罢工(tsconfig 的{" "}
            <code>erasableSyntaxOnly</code> 会把它标红)。爱用没问题,
            但打算让 Node 直接跑 TS 的项目得戒掉它。
          </p>
        </Callout>

        <p className="sec-desc">
          <b>readonly</b>:出单之后不许改 —— 构造器里是唯一的赋值机会;
          <b>getter/setter</b>:读起来像属性,写进去先过安检;
          <b>static</b>:挂在类本身上,不属于任何实例。三样一起看:
        </p>

        <CodeBlock
          lang="ts"
          title="order.ts · readonly + getter/setter + static"
          hl={[2, 9, 17]}
          code={`class Order {
  readonly id: string;        // 出单后不许改
  private _sugar = 50;        // 真数据锁在保险库

  constructor(id: string) {
    this.id = id;             // 构造器:唯一的赋值机会
  }

  get sugar() { return this._sugar; }   // 读:像属性一样点
  set sugar(v: number) {                // 写:先过安检
    if (v < 0 || v > 100) throw new Error("糖度只能 0-100");
    this._sugar = v;
  }
}

class OrderId {
  static prefix = "MT";                 // 挂在类上,不用 new
  static next(n: number) {
    return OrderId.prefix + "-" + String(n).padStart(4, "0");
  }
}

const o = new Order(OrderId.next(7));   // "MT-0007"
o.sugar = 30;      // ✅ 走 set,合法
// o.id = "MT-9";  // ❌ Cannot assign to 'id' because it
                   //    is a read-only property. ts(2540)`}
          note={
            <>
              注意 readonly 和 private 一样是<b>编译期检查</b>:擦除后运行时改
              <code>o.id</code> 没人拦。想要运行时也冻住,那是{" "}
              <code>Object.freeze</code> 的活。
            </>
          }
        />
      </Section>

      {/* ================= §05 abstract & implements ================= */}
      <Section
        id="abstract-implements"
        index="05"
        title="abstract 与 implements:半成品模板和装修合同"
        desc="一个管「必须继承才能用」,一个管「必须长这个形状」。"
      >
        <p className="sec-desc">
          <b>abstract 类是半成品模板</b>:一部分方法已经装好,
          另一部分只留了签名 —— 所以禁止直接 new,子类必须把空缺补全才能出厂:
        </p>

        <CodeBlock
          lang="ts"
          title="staff.ts · 半成品模板"
          hl={[2, 9]}
          code={`abstract class Staff {
  abstract greet(): string;   // 半成品:只有签名,子类必须补

  clockIn() {                 // 完成品:子类白捡
    console.log(this.greet() + ",打卡上班");
  }
}

new Staff();
// ❌ Cannot create an instance of an abstract class. ts(2511)

class Barista extends Staff {
  greet() { return "我是调茶师"; }   // 补全,合法出厂
}
new Barista().clockIn();      // "我是调茶师,打卡上班"`}
        />

        <p className="sec-desc">
          <b>implements 则是一份装修合同</b>:interface 定契约,class 来兑现。
          它<b>只查形状,不给实现</b> —— 奶茶店的收银台不关心背后是微信还是
          支付宝,只认「能 pay、能 refund」这份契约:
        </p>

        <CodeBlock
          lang="ts"
          title="payment.ts · interface 定契约,class 兑现"
          hl={[1, 6, 14]}
          code={`interface PaymentProvider {
  pay(amount: number): Promise<string>;   // 付款,返回交易号
  refund(txId: string): Promise<void>;    // 退款
}

class WeChatPay implements PaymentProvider {
  async pay(amount: number) {
    // …这里调微信 SDK
    return "wx_" + Date.now();
  }
  async refund(txId: string) { /* … */ }
}

class AliPay implements PaymentProvider {
  async pay(amount: number) { return "ali_" + Date.now(); }
  async refund(txId: string) { /* … */ }
}`}
        />

        <ContractBoard />

        <p className="sec-desc">
          契约的价值在调用方:MilkTeaShop 用参数属性把「任何一个兑现了契约的
          支付渠道」注入进来 —— 换渠道,店面代码一行不改:
        </p>

        <CodeBlock
          lang="ts"
          title="milk-tea-shop.ts · 面向契约,不面向具体类"
          hl={[2, 10, 11]}
          code={`class MilkTeaShop {
  constructor(private payment: PaymentProvider) {}  // 注入契约

  async checkout(total: number) {
    const txId = await this.payment.pay(total);
    return "支付成功,交易号 " + txId;
  }
}

new MilkTeaShop(new WeChatPay());  // 今天走微信
new MilkTeaShop(new AliPay());     // 明天换支付宝 —— 店面无感`}
        />

        <Callout tone="deep" title="三个容易混的细节">
          <p>
            ① <b>implements 只校验,不灌注</b>:写{" "}
            <code>pay(amount) {"{ … }"}</code> 不标类型,amount 不会自动变成
            number,而是隐式 any(strict 下报错)—— 参数类型还得自己写。
          </p>
          <p>
            ② <b>abstract class vs interface</b>:interface 只有形状;abstract
            类可以带着一半实现。要「送子类现成方法」用 abstract,
            只定形状用 interface。
          </p>
          <p>
            ③ <b>extends 只能一个,implements 可以一串</b>:
            <code>
              class Shop extends Building implements Payable, Refundable{" "}
              {"{ }"}
            </code>{" "}
            —— 血统单继承,契约随便签。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 类的兼容 ================= */}
      <Section
        id="structural"
        index="06"
        title="回扣第 04 章:class 也看形状,唯独 private 认出身"
        desc="补完结构化类型的最后一块拼图。"
      >
        <p className="sec-desc">
          第 04 章说过,TypeScript 不问姓什么、只看长什么样 —— class
          也不例外:两个类形状相同就互相兼容,哪怕八竿子打不着。
          但一旦有了 private / protected 成员,规则就变了。逐帧看:
        </p>

        <StructuralClassFlow />

        <CodeBlock
          lang="ts"
          title="playground.ts · 亲手复现这次翻脸"
          hl={[10]}
          code={`class PaperCup {
  private stock = 0;
  fill(ml: number) {}
}
class PlasticCup {
  private stock = 0;
  fill(ml: number) {}
}

const cup: PaperCup = new PlasticCup();
// ❌ Type 'PlasticCup' is not assignable to type 'PaperCup'.
//    Types have separate declarations of a private
//    property 'stock'. ts(2322)`}
        />

        <Callout tone="win" title="04 章世界观,就此补完">
          <p>
            结构化类型的完整版规则:<b>一切看形状 ——
            除非涉及 private / protected 成员,那就必须同源</b>
            (来自同一处声明,继承下来的算)。顺便,这也是社区模拟
            「名义类型」的原理:给类塞一个 private 成员,
            它就没法被同形状的路人冒充了。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 动手任务 ================= */}
      <Section
        id="labs"
        index="07"
        title="动手任务"
        desc="四个任务全在 TypeScript Playground 里做:撞门禁、签合同、看产物、验半成品。"
      >
        <LabSet ch="classes" items={LABS} />
      </Section>

      {/* ================= §08 通关测验 ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="九道题,验一验这栋楼的门禁你摸熟了没有。"
      >
        <Quiz ch="classes" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            字段「说了有就得真有」:就地初始化、构造器赋值,或{" "}
            <code>!</code> 自己担保 —— strictPropertyInitialization
            盯着,且不跨方法追踪。
          </>,
          <>
            门禁三级:public 大堂(默认)、protected 办公区(子类可进)、
            private 保险库(类内专属)—— 全是编译期门禁。
          </>,
          <>
            private 防手滑,#field 防翻墙:TS 的 private 擦除后运行时不设防;
            要真隐藏用 JavaScript 原生的 # 私有字段。
          </>,
          <>
            参数属性一行顶四行,但属于不可擦除语法 —— Node 原生跑 TS
            的项目用不了它。
          </>,
          <>
            abstract 是禁止直接 new 的半成品模板;implements
            只查形状不给实现,一个类可以兑现多份契约 ——
            interface 定契约、class 来兑现,换实现不改调用方。
          </>,
          <>
            类也走结构化类型,唯一例外:有 private / protected
            成员后变「准名义」,必须同源才兼容。
          </>,
        ]}
      />

      <ChapterFooter ch="classes" />
    </main>
  );
}
