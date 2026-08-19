"use client";

// Chapter 04 · Structural typing:
// the duck test → nominal vs structural → the direction of assignability
// (more members can stand in for fewer, plus the set view) → the excess
// property check (the shape matcher, and why the rule exists) → traps that
// come with identical shapes → practice → quiz → key points.

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
import { T, type Loc } from "@/lib/i18n";
import { HeroDuck, CompatPlayground, ShapeMatcher } from "./viz";

/* ---------- §01 the duck test ---------- */

const S1_STAFF: Loc<string> = {
  en: `type Size = "small" | "medium" | "large";

type Staff = {
  name: string;
  makeTea: (size: Size) => void;
};

function startShift(s: Staff) {
  console.log(s.name + " started the shift");
}

// note: this object never mentions Staff
const zhen = {
  name: "Zhen",
  makeTea(size: Size) {
    console.log("making a " + size);
  },
};

startShift(zhen); // ✓ accepted, because the shape matches Staff`,
  zh: `type Size = "small" | "medium" | "large";

type Staff = {
  name: string;
  makeTea: (size: Size) => void;
};

function startShift(s: Staff) {
  console.log(s.name + " started the shift");
}

// 注意:这个对象从头到尾没提过 Staff
const zhen = {
  name: "Zhen",
  makeTea(size: Size) {
    console.log("making a " + size);
  },
};

startShift(zhen); // ✓ 通过,因为形状和 Staff 对得上`,
};

/* ---------- §02 nominal vs structural ---------- */

const S2_JAVA: Loc<string> = {
  en: `class MilkTea {
  String name;
}
class FruitTea {
  String name;
}

// MilkTea a = new MilkTea();
// FruitTea b = a;
// ✕ incompatible types: MilkTea
//   cannot be converted to FruitTea
// The members are identical.
// The names are not, so the two
// classes are unrelated.`,
  zh: `class MilkTea {
  String name;
}
class FruitTea {
  String name;
}

// MilkTea a = new MilkTea();
// FruitTea b = a;
// ✕ incompatible types: MilkTea
//   cannot be converted to FruitTea
// 成员完全一样也没用。
// 名字不同,两个类就毫无关系。`,
};

const S2_TS: Loc<string> = {
  en: `class MilkTea {
  name = "";
}
class FruitTea {
  name = "";
}

const a = new MilkTea();
const b: FruitTea = a;
// ✓ accepted: the shapes match
// Classes take the same test.
// One exception: see chapter 08.`,
  zh: `class MilkTea {
  name = "";
}
class FruitTea {
  name = "";
}

const a = new MilkTea();
const b: FruitTea = a;
// ✓ 通过:两个形状相同
// class 也要过同一道检查。
// 唯一的例外见第 08 章。`,
};

/* ---------- §03 the direction of assignability ---------- */

const S3_COMPAT: Loc<string> = {
  en: `type Staff = { name: string };

const barista = {
  name: "Zhen",
  makeTea: () => {},
  years: 3,
};

// more members ⭢ fewer members: accepted
const s: Staff = barista; // ✓

// fewer members ⭢ more members: rejected
const staff = { name: "New hire" };
// const b: typeof barista = staff;
// ✕ Type '{ name: string; }' is missing the following
//   properties from type '{ name: string; makeTea:
//   () => void; years: number; }': makeTea, years ts(2739)`,
  zh: `type Staff = { name: string };

const barista = {
  name: "Zhen",
  makeTea: () => {},
  years: 3,
};

// 成员多 ⭢ 成员少:通过
const s: Staff = barista; // ✓

// 成员少 ⭢ 成员多:拒绝
const staff = { name: "New hire" };
// const b: typeof barista = staff;
// ✕ Type '{ name: string; }' is missing the following
//   properties from type '{ name: string; makeTea:
//   () => void; years: number; }': makeTea, years ts(2739)`,
};

const S3_OPTIONAL: Loc<string> = {
  en: `type A = { note?: string };            // the key may be absent
type B = { note: string | undefined }; // the key must be there

declare const a: A;
// const b: B = a;
// ✕ Property 'note' is optional in type 'A' but
//   required in type 'B'. ts(2322)

const ok: B = { note: undefined }; // ✓ present, and undefined
const fine: A = {};                // ✓ absent is allowed`,
  zh: `type A = { note?: string };            // 这个键可以不存在
type B = { note: string | undefined }; // 这个键必须存在

declare const a: A;
// const b: B = a;
// ✕ Property 'note' is optional in type 'A' but
//   required in type 'B'. ts(2322)

const ok: B = { note: undefined }; // ✓ 键在,值是 undefined
const fine: A = {};                // ✓ 键不在也允许`,
};

/* ---------- §04 the excess property check ---------- */

const S4_LITERAL: Loc<string> = {
  en: `type Order = {
  item: string;
  sweetness?: string; // optional
};

function makeOrder(o: Order) {}

makeOrder({
  item: "Boba milk tea",
  sweetnes: "half sugar",
});
// ✕ Object literal may only specify
//   known properties, but 'sweetnes'
//   does not exist in type 'Order'.
//   Did you mean to write
//   'sweetness'? ts(2561)`,
  zh: `type Order = {
  item: string;
  sweetness?: string; // 糖度,可选
};

function makeOrder(o: Order) {}

makeOrder({
  item: "Boba milk tea",
  sweetnes: "half sugar",
});
// ✕ Object literal may only specify
//   known properties, but 'sweetnes'
//   does not exist in type 'Order'.
//   Did you mean to write
//   'sweetness'? ts(2561)`,
};

const S4_VARIABLE: Loc<string> = {
  en: `// the same object, stored first
const draft = {
  item: "Boba milk tea",
  sweetnes: "half sugar",
};

makeOrder(draft); // ✓ compiles

// but sweetness was never set,
// so the half sugar is gone`,
  zh: `// 同一个对象,先存进变量
const draft = {
  item: "Boba milk tea",
  sweetnes: "half sugar",
};

makeOrder(draft); // ✓ 编译通过

// 但 sweetness 从没被赋值,
// 顾客要的半糖就这么丢了`,
};

/* ---------- §05 traps that come with identical shapes ---------- */

const S5_COLLISION: Loc<string> = {
  en: `type DeliveryAddress = { phone: string; note: string };
type PickupInfo      = { phone: string; note: string };

function printShippingLabel(addr: DeliveryAddress) {
  // print a courier label...
}

const pickup: PickupInfo = { phone: "138...", note: "less ice, pickup in store" };
printShippingLabel(pickup);
// ✓ compiles, but this order is a pickup and needs no label`,
  zh: `type DeliveryAddress = { phone: string; note: string };
type PickupInfo      = { phone: string; note: string };

function printShippingLabel(addr: DeliveryAddress) {
  // 打印快递面单……
}

const pickup: PickupInfo = { phone: "138...", note: "less ice, pickup in store" };
printShippingLabel(pickup);
// ✓ 编译通过,可这是自取单,根本不该打面单`,
};

const S5_BRANDED: Loc<string> = {
  en: `type UserId = string & { __brand: "user" };
type PostId = string & { __brand: "post" };

declare function getUser(id: UserId): void;
declare const postId: PostId;

// getUser(postId);
// ✕ Argument of type 'PostId' is not assignable to
//   parameter of type 'UserId'. ... Type '"post"' is
//   not assignable to type '"user"'. ts(2345)

// creating one always costs an assertion
const uid = "u_42" as UserId;
getUser(uid); // ✓`,
  zh: `type UserId = string & { __brand: "user" };
type PostId = string & { __brand: "post" };

declare function getUser(id: UserId): void;
declare const postId: PostId;

// getUser(postId);
// ✕ Argument of type 'PostId' is not assignable to
//   parameter of type 'UserId'. ... Type '"post"' is
//   not assignable to type '"user"'. ts(2345)

// 造一个品牌值,总要付出一次断言
const uid = "u_42" as UserId;
getUser(uid); // ✓`,
};

export default function StructuralPage() {
  return (
    <main className="page" data-ch="structural">
      <Hero
        ch="structural"
        title={{
          en: (
            <>
              Structural <span className="grad">typing</span>
            </>
          ),
          zh: (
            <>
              结构化<span className="grad">类型</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              TypeScript never asks what a type is called. It compares the
              members a value actually has against the members the target
              requires. This chapter explains that rule, and then takes apart
              the one exception that confuses almost every beginner: the excess
              property check.
            </>
          ),
          zh: (
            <>
              TypeScript 从不问一个类型叫什么名字,
              它只把值实际拥有的成员和目标要求的成员比一遍。
              这一章讲透这条贯穿全书的地基规则,
              再拆掉几乎每个新手都会撞上的那个例外:多余属性检查。
            </>
          ),
        }}
        chips={[
          { id: "duck", n: "01", label: { en: "Shape, not name", zh: "鸭子测试" } },
          {
            id: "nominal",
            n: "02",
            label: { en: "Nominal vs structural", zh: "名义 vs 结构" },
          },
          {
            id: "compat",
            n: "03",
            label: { en: "Direction", zh: "兼容规则" },
          },
          {
            id: "excess",
            n: "04",
            label: { en: "Excess properties", zh: "多余属性检查" },
          },
          {
            id: "traps",
            n: "05",
            label: { en: "Same-shape traps", zh: "同形状的坑" },
          },
          { id: "labs", n: "06", label: { en: "Practice", zh: "动手" } },
          { id: "quiz", n: "07", label: { en: "Quiz", zh: "测验" } },
        ]}
      >
        <HeroDuck />
      </Hero>

      {/* ================= §01 the duck test ================= */}
      <Section
        id="duck"
        index="01"
        title={{
          en: "The duck test: shape decides, not the name",
          zh: "鸭子测试:看形状,不看名字",
        }}
        desc={{
          en: "A milk tea shop is hiring. The owner does not read diplomas. The only question is whether you can make tea. TypeScript judges types the same way.",
          zh: "一家奶茶店招人:老板不看学历证书,只看你会不会做奶茶 —— TypeScript 判断类型用的就是这套标准。",
        }}
      >
        <Callout
          tone="story"
          title={{
            en: "An interview with no paperwork",
            zh: "一场只考实操的面试",
          }}
        >
          <T
            en={
              <>
                <p>
                  The shop needs staff. The posting says: <b>has a name, can
                  make tea</b>. Someone shows up with no certificate at all. The
                  owner does not care. Name? Yes. Make tea? Made one on the
                  spot. Hired. Whether that person used to be called a
                  &quot;full-time employee&quot; or &quot;the shop next
                  door&apos;s staff&quot; is <b>never asked</b>.
                </p>
                <p>
                  That is the whole idea of structural typing. Whether a value
                  belongs to a type depends on{" "}
                  <b>which members the value has</b>, not on what the value ever
                  declared itself to be. The same idea has an older name: the
                  duck test. If it walks like a duck and quacks like a duck,
                  treat it as a duck.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  奶茶店缺人,老板贴出要求:<b>有名字,会做茶</b>。
                  来了个应聘者,没带任何证书 —— 老板不在乎。名字?有。做茶?
                  当场做了一杯。录用。至于这人以前叫「正式工」还是
                  「隔壁店员工」,<b>没人问</b>。
                </p>
                <p>
                  这就是结构化类型(structural typing)的全部内容:
                  一个值属不属于某个类型,<b>只取决于它有哪些成员</b>,
                  而不取决于它曾经声明过自己是谁。
                  这个想法还有一个更早的名字:鸭子测试(duck test)——
                  走路像鸭子、叫声像鸭子,那就当它是鸭子。
                </p>
              </>
            }
          />
        </Callout>

        <CodeBlock
          lang="ts"
          title={{
            en: "structural.ts · an object that never claimed to be Staff",
            zh: "structural.ts · 从没「自称 Staff」的对象,照样上岗",
          }}
          hl={[20]}
          code={S1_STAFF}
          note={
            <T
              en={
                <>
                  There is no declared link between <b>zhen</b> and{" "}
                  <code>Staff</code>. The compiler compared the members of{" "}
                  <code>zhen</code> with the members <code>Staff</code>{" "}
                  requires, found all of them, and allowed the call.
                </>
              }
              zh={
                <>
                  <b>zhen</b> 和 <code>Staff</code> 之间没有任何声明过的关系。
                  编译器把 <code>zhen</code> 的成员和 <code>Staff</code>{" "}
                  要求的成员比了一遍,全都找到了,于是放行。
                </>
              }
            />
          }
        />

        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">
              <T en="The name" zh="名字 name" />
            </div>
            <div className="card-title">
              <T en="Only a label" zh="只是标签" />
            </div>
            <p>
              <T
                en={
                  <>
                    <code>Staff</code> is a label you attached to a shape so
                    that people can read the code. When the compiler compares
                    types, the label is not part of the comparison.
                  </>
                }
                zh={
                  <>
                    <code>Staff</code> 是你给某个形状贴的标签,方便人读代码。
                    编译器比较类型时,标签不参与比较。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="The shape" zh="形状 shape" />
            </div>
            <div className="card-title">
              <T en="The type itself" zh="才是类型本体" />
            </div>
            <p>
              <T
                en={
                  <>
                    Which members exist, and the type of each member. That list
                    is what the compiler treats as the type. Two types with the
                    same list are two names for one thing.
                  </>
                }
                zh={
                  <>
                    有哪些成员、每个成员是什么类型 ——
                    这份清单才是编译器眼里的类型。
                    清单相同的两个类型,是同一样东西的两个名字。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="The duck test" zh="鸭子测试 duck test" />
            </div>
            <div className="card-title">
              <T en="How the check runs" zh="判定方式" />
            </div>
            <p>
              <T
                en={
                  <>
                    Every member the target requires is present, and each one
                    has a compatible type. The check passes. No declaration is
                    needed, because compatibility is computed rather than
                    registered.
                  </>
                }
                zh={
                  <>
                    目标要求的成员你都有,而且类型也对得上,检查就通过。
                    不需要任何声明 —— 兼容关系是算出来的,不是登记出来的。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <Callout
          tone="warn"
          title={{
            en: "Common mistake: “A new interface name means a new type”",
            zh: "误区:「我 interface 起了个新名字,就是新类型了」",
          }}
        >
          <p>
            <T
              en={
                <>
                  It does not. <code>interface A {"{ x: number }"}</code> and{" "}
                  <code>interface B {"{ x: number }"}</code> are assignable to
                  each other in both directions. The name is a label, and the
                  shapes are the same. <code>type</code> behaves exactly like{" "}
                  <code>interface</code> here: neither one creates a separate
                  type just by having a separate name. If you need two
                  same-shaped types to stay apart, §05 shows the standard way.
                </>
              }
              zh={
                <>
                  不是。<code>interface A {"{ x: number }"}</code> 和{" "}
                  <code>interface B {"{ x: number }"}</code>{" "}
                  可以互相赋值,两个方向都行 —— 名字只是标签,形状相同。
                  <code>type</code> 在这里和 <code>interface</code> 表现完全一致:
                  两者都不会仅仅因为名字不同就造出一个独立的类型。
                  真要让同形状的两个类型互不相通,§05 会给出标准做法。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §02 nominal vs structural ================= */}
      <Section
        id="nominal"
        index="02"
        title={{
          en: "Two designs: compare declarations, or compare members",
          zh: "两种设计:比声明,还是比成员",
        }}
        desc={{
          en: "Java and C# take the other road. They use nominal typing, and they give the opposite answer for the same code.",
          zh: "Java、C# 走的是另一条路:名义类型(nominal typing)—— 同一段代码,两边给出相反的判决。",
        }}
      >
        <CodePair
          left={
            <CodeBlock
              lang="js"
              title={{
                en: "Java · nominal: the declared name decides",
                zh: "Java · 名义类型:看声明的名字",
              }}
              hl={[9]}
              code={S2_JAVA}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title={{
                en: "TypeScript · structural: the members decide",
                zh: "TypeScript · 结构化类型:看成员",
              }}
              hl={[9]}
              code={S2_TS}
            />
          }
        />

        <p className="sec-desc">
          <T
            en={
              <>
                A nominal type system compares <b>declarations</b>. Two types
                are related only if one of them says so, with{" "}
                <code>extends</code> or <code>implements</code>. A structural
                type system compares <b>members</b>. Nothing has to be declared.
                Look at the right-hand example again: in TypeScript,{" "}
                <b>even classes are compared by shape</b>. That is the rule
                developers coming from Java run into first. There is exactly one
                exception, and it needs a <code>private</code> or{" "}
                <code>protected</code> member to appear. Chapter 08 covers it.
              </>
            }
            zh={
              <>
                名义类型系统比较的是<b>声明</b>:两个类型有关系,
                必须有一方用 <code>extends</code> 或 <code>implements</code>{" "}
                说出来。结构化类型系统比较的是<b>成员</b>,什么都不用声明。
                再看一眼右边:在 TypeScript 里,<b>连 class 都按形状比</b> ——
                这是从 Java 转过来的人最先撞上的一条。
                例外只有一个,而且要类里出现 <code>private</code> 或{" "}
                <code>protected</code> 成员才会触发,第 08 章会讲。
              </>
            }
          />
        </p>

        <Callout
          tone="deep"
          title={{
            en: "Why TypeScript chose structural typing",
            zh: "为什么 TypeScript 选了结构化类型",
          }}
        >
          <p>
            <T
              en={
                <>
                  Because its job is to describe JavaScript that already exists.
                  Think about what ordinary JavaScript values look like: an
                  object literal written on the spot, a result returned by{" "}
                  <code>JSON.parse</code>, an object assembled from a few
                  functions. <b>None of those declared anything.</b> If
                  compatibility required a declaration, every existing
                  JavaScript file would have to be rewritten before TypeScript
                  could type it, and nobody would do that. Structural typing
                  lets TypeScript describe JavaScript as it is written, which is
                  what makes the &quot;superset of JavaScript&quot; claim
                  possible.
                </>
              }
              zh={
                <>
                  因为它的任务是描述已经存在的 JavaScript。
                  想想日常的 JS 值长什么样:随手写下的对象字面量、
                  <code>JSON.parse</code> 返回的数据、
                  几个函数拼出来的对象 —— <b>它们谁都没有声明过什么</b>。
                  如果兼容必须先有声明,那所有现存的 JS 文件都得先改写一遍
                  才能被 TypeScript 标注,没人会这么干。
                  结构化类型让 TypeScript 能按 JS 本来的写法去描述它,
                  这正是「JavaScript 超集」这句承诺的技术前提。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 direction of assignability ================= */}
      <Section
        id="compat"
        index="03"
        title={{
          en: "Direction: more members can stand in for fewer",
          zh: "兼容方向:多的可以当少的用",
        }}
        desc={{
          en: "The duck test has a direction. Someone with twenty skills can do a job that asks for three. The reverse does not work.",
          zh: "鸭子测试是有方向的:会二十项技能的老手,能干「只要求三项」的活;反过来不行。",
        }}
      >
        <CompatPlayground />

        <CodeBlock
          lang="ts"
          title={{
            en: "compat.ts · the same two directions, written out",
            zh: "compat.ts · 上面两个方向的代码版",
          }}
          hl={[10]}
          code={S3_COMPAT}
        />

        <Callout
          tone="deep"
          title={{
            en: "The set view: more members, smaller set",
            zh: "集合观:成员越多,集合越小",
          }}
        >
          <T
            en={
              <>
                <p>
                  One more way to see it, and it is the one that stays
                  reliable: <b>a type is a set of values</b>.{" "}
                  <code>{"{ name: string }"}</code> describes a large set,
                  because every object with a name belongs to it.{" "}
                  <code>
                    {"{ name: string; makeTea: () => void; years: number }"}
                  </code>{" "}
                  describes a much smaller set, because more requirements means
                  fewer values qualify.
                </p>
                <p>
                  So &quot;more members&quot; means &quot;more specific&quot;,
                  which means &quot;smaller set&quot;. Every value in the
                  smaller set is also in the larger one, so a{" "}
                  <code>Barista</code> can always be used where a{" "}
                  <code>Staff</code> is expected. The reverse is not true. This
                  direction is the same one that unions in chapter 03 and
                  generic constraints in chapter 05 depend on.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  换一个角度看,直觉会更稳:<b>一个类型就是一个值的集合</b>。
                  <code>{"{ name: string }"}</code> 描述的集合很大 ——
                  凡是有名字的对象都属于它;
                  <code>
                    {"{ name: string; makeTea: () => void; years: number }"}
                  </code>{" "}
                  描述的集合小得多 —— 要求越多,合格的值越少。
                </p>
                <p>
                  所以「成员多」=「更具体」=「集合更小」。
                  小集合里的每个值同时也在大集合里,所以 <code>Barista</code>{" "}
                  总能用在要 <code>Staff</code> 的位置,反过来不行。
                  第 03 章的联合类型、第 05 章的泛型约束,靠的都是这同一个方向。
                </p>
              </>
            }
          />
        </Callout>

        <Callout
          tone="warn"
          title={{
            en: "Optional member vs a member that may be undefined",
            zh: "可选成员,和「值可能是 undefined」的成员",
          }}
        >
          <p>
            <T
              en={
                <>
                  These two look similar and are not the same shape.{" "}
                  <code>{"{ note?: string }"}</code> says the key may be
                  missing. <code>{"{ note: string | undefined }"}</code> says
                  the key must be present, and its value may be{" "}
                  <code>undefined</code>. Because the second one requires a
                  member that the first one does not, the first is not
                  assignable to the second.
                </>
              }
              zh={
                <>
                  这两种写法很像,形状却不同。
                  <code>{"{ note?: string }"}</code> 表示这个键可以不存在;
                  <code>{"{ note: string | undefined }"}</code>{" "}
                  表示这个键必须存在,只是它的值可以是 <code>undefined</code>。
                  后者要求了一个前者并不要求的成员,所以前者不能赋给后者。
                </>
              }
            />
          </p>
        </Callout>

        <CodeBlock
          lang="ts"
          title={{
            en: "optional.ts · “may be absent” is not “may be undefined”",
            zh: "optional.ts ·「可以不存在」不等于「值可以是 undefined」",
          }}
          hl={[5, 6, 7]}
          code={S3_OPTIONAL}
        />

        <p className="sec-desc">
          <T
            en={
              <>
                Members that are functions follow the same shape comparison, but
                their parameters are checked in the opposite direction from
                their return types. Chapter 02 covers that in full, including
                the <code>strictFunctionTypes</code> flag and the exception for
                method syntax.
              </>
            }
            zh={
              <>
                成员是函数时同样按形状比较,只是它的参数和返回值方向相反。
                这部分第 02 章已经讲全了,包括{" "}
                <code>strictFunctionTypes</code> 开关,以及方法语法的例外。
              </>
            }
          />
        </p>
      </Section>

      {/* ================= §04 excess property check ================= */}
      <Section
        id="excess"
        index="04"
        title={{
          en: "The excess property check: object literals are treated differently",
          zh: "多余属性检查:对象字面量的特殊待遇",
        }}
        desc={{
          en: "§03 just said extra members are fine. Now the compiler appears to say the opposite. This is the point where most beginners get stuck, so this section takes it apart.",
          zh: "§03 刚说完「多余的成员不碍事」,编译器马上像是给出了相反的答案 —— 这一节把这个矛盾拆开。",
        }}
      >
        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title={{
                en: "Literal at the call site · error",
                zh: "字面量写在调用处 · 报错",
              }}
              hl={[10]}
              code={S4_LITERAL}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title={{
                en: "Stored in a variable first · accepted",
                zh: "先存进变量 · 通过",
              }}
              hl={[7]}
              code={S4_VARIABLE}
            />
          }
        />

        <p className="sec-desc">
          <T
            en={
              <>
                The object is identical in both cases. Written at the call site
                it is an error. Stored in a variable first it compiles. This is
                not a bug. It is a separate, stricter check called the{" "}
                <b>excess property check</b>. It runs only on a{" "}
                <b>fresh object literal</b>, which means a literal written
                directly where a type is expected. It is deliberately{" "}
                <b>not</b> part of the assignability rule, which is exactly why
                storing the object first makes it disappear. The reason for the
                design is the difference between these two situations:
              </>
            }
            zh={
              <>
                两边的对象一模一样。写在调用处报错,先存进变量就通过。
                这不是 bug,而是一道独立的、更严格的检查:
                <b>多余属性检查(excess property check)</b>。
                它只对<b>新鲜的对象字面量</b>生效 ——
                也就是直接写在「需要某个类型」的位置上的字面量。
                它<b>不属于</b>可赋值性规则本身,这正是先存进变量它就消失的原因。
                这样设计的理由,是下面两种情形的区别:
              </>
            }
          />
        </p>

        <div className="grid-2">
          <div className="card">
            <div className="card-kicker">
              <T en="Literal at the call site" zh="字面量写在调用处" />
            </div>
            <div className="card-title">
              <T en="Written for this one call" zh="只为这一次调用而写" />
            </div>
            <p>
              <T
                en={
                  <>
                    This object was written on the spot and handed over
                    immediately. It has no second use. So an unexpected property
                    can only mean one of two things: <b>a typo</b> (
                    <code>sweetnes</code>), or <b>a misunderstanding of the
                    type</b>. Both are bugs, so the compiler reports it. That is
                    how the half sugar on the left was saved.
                  </>
                }
                zh={
                  <>
                    这个对象是当场写出来、当场交出去的,没有第二个用途。
                    所以多出来的属性只有两种可能:<b>拼错了</b>(
                    <code>sweetnes</code>),或者<b>误解了类型</b>。
                    两种都是 bug,编译器于是报出来 ——
                    左边那杯半糖就是这么被救回来的。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Stored in a variable" zh="先存进变量" />
            </div>
            <div className="card-title">
              <T
                en="May have another legitimate use"
                zh="别处可能另有正当用途"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    An object held in a variable may be used elsewhere for a{" "}
                    <b>perfectly valid reason</b>. It might really be a richer{" "}
                    <code>Barista</code> that is also being used as{" "}
                    <code>Staff</code>. §03 allows that, so the compiler allows
                    it. The cost is that a misspelled property passes through
                    unnoticed, which is how the half sugar on the right was
                    lost.
                  </>
                }
                zh={
                  <>
                    存在变量里的对象,可能在别处有<b>完全正当的用途</b>:
                    它也许本来就是信息更全的 <code>Barista</code>,
                    顺带被当成 <code>Staff</code> 用。§03 允许这件事,
                    编译器就允许。代价是拼错的属性会一路混过去 ——
                    右边那杯半糖就是这么丢的。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <ShapeMatcher />

        <Callout
          tone="warn"
          title={{
            en: "Silencing the check with as does not fix anything",
            zh: "用 as 压掉报错,并没有修好任何东西",
          }}
        >
          <p>
            <T
              en={
                <>
                  <code>
                    {'makeOrder({ item: "Boba milk tea", sweetnes: "half sugar" } as Order)'}
                  </code>{" "}
                  does make the error go away. The typo is still there, and the
                  half sugar is still lost. <code>as</code> tells the compiler
                  to stop checking; it does not change the object. The fix is
                  always the same: read the property name in the error message
                  and correct the spelling.
                </>
              }
              zh={
                <>
                  <code>
                    {'makeOrder({ item: "Boba milk tea", sweetnes: "half sugar" } as Order)'}
                  </code>{" "}
                  确实能让报错消失。但错字还在,半糖照样丢。
                  <code>as</code> 只是让编译器别再检查,它不会改变这个对象。
                  正确的修法永远是同一个:看清报错里的属性名,把拼写改对。
                </>
              }
            />
          </p>
        </Callout>

        <Callout
          tone="win"
          title={{
            en: "How to read the two error messages",
            zh: "两条报错怎么读",
          }}
        >
          <T
            en={
              <>
                <p>
                  When the extra property looks like a misspelling of a real
                  one, TypeScript names the fix:{" "}
                  <code>
                    Object literal may only specify known properties, but
                    &apos;sweetnes&apos; does not exist in type &apos;Order&apos;.
                    Did you mean to write &apos;sweetness&apos;? ts(2561)
                  </code>
                </p>
                <p>
                  When the extra property resembles nothing in the target, there
                  is no suggestion and the code is different:{" "}
                  <code>
                    Object literal may only specify known properties, and
                    &apos;cup&apos; does not exist in type &apos;Order&apos;.
                    ts(2353)
                  </code>
                </p>
                <p>
                  Both say the same thing: an object literal may only contain
                  properties the target type knows about. Seeing{" "}
                  <b>ts(2561)</b> is good news, because the compiler already
                  worked out the correct spelling for you.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  当多出来的属性看起来像某个真实属性的拼写错误时,
                  TypeScript 会直接告诉你怎么改:
                  <code>
                    Object literal may only specify known properties, but
                    &apos;sweetnes&apos; does not exist in type &apos;Order&apos;.
                    Did you mean to write &apos;sweetness&apos;? ts(2561)
                  </code>
                </p>
                <p>
                  当多出来的属性和目标类型里的任何成员都不像时,
                  就没有建议,错误码也不同:
                  <code>
                    Object literal may only specify known properties, and
                    &apos;cup&apos; does not exist in type &apos;Order&apos;.
                    ts(2353)
                  </code>
                </p>
                <p>
                  两条说的是同一件事:对象字面量只能写目标类型认识的属性。
                  看到 <b>ts(2561)</b> 反而是好事 ——
                  编译器已经替你算出了正确的拼写。
                </p>
              </>
            }
          />
        </Callout>
      </Section>

      {/* ================= §05 same-shape traps ================= */}
      <Section
        id="traps"
        index="05"
        title={{
          en: "When identical shapes are a problem",
          zh: "同形状的坑:长得一样,不代表是一回事",
        }}
        desc={{
          en: "Two types that mean completely different things can be swapped freely, as long as their members happen to line up.",
          zh: "两个语义上毫不相干的类型,只要成员恰好对上,就能随便互换。",
        }}
      >
        <Callout
          tone="story"
          title={{
            en: "A pickup order got a courier label",
            zh: "奶茶店事故:自取单打出了快递面单",
          }}
        >
          <p>
            <T
              en={
                <>
                  The shop has two types: <code>DeliveryAddress</code> for the
                  delivery platform, and <code>PickupInfo</code> for orders
                  collected in store. Two people defined them separately, and
                  both ended up as a phone number plus a note. One day someone
                  passed a pickup order to the function that prints courier
                  labels. The compiler <b>said nothing</b>, because the members
                  lined up and it had no reason to object. That evening a
                  courier followed the note on the label and went to the shop to
                  collect a delivery that did not exist.
                </>
              }
              zh={
                <>
                  店里有两个类型:外卖平台用的 <code>DeliveryAddress</code>,
                  和到店自取用的 <code>PickupInfo</code>。
                  两拨人分头定义,结果都是一个电话加一句备注。
                  某天有人把自取单传给了打快递面单的函数,
                  编译器<b>一声没吭</b> —— 成员对得上,它没有理由拦。
                  当晚,骑手照着面单上的备注,
                  去店里取了一单根本不存在的外卖。
                </>
              }
            />
          </p>
        </Callout>

        <CodeBlock
          lang="ts"
          title={{
            en: "collision.ts · the compiler is right, the difference was never written down",
            zh: "collision.ts · 编译器没判错,是我们没把「不同」写进类型",
          }}
          hl={[9]}
          code={S5_COLLISION}
          note={
            <T
              en={
                <>
                  Structural typing gave the correct answer: the two types have
                  the same members. The problem is that the difference between
                  &quot;delivery&quot; and &quot;pickup&quot;{" "}
                  <b>existed only in our heads</b>. It was never written into
                  the shape, and the compiler only reads the shape.
                </>
              }
              zh={
                <>
                  结构化类型的判断完全正确:两个类型的成员相同。
                  问题在于「外卖」和「自取」的区别<b>只存在于我们脑子里</b>,
                  从没写进形状 —— 而编译器只读形状。
                </>
              }
            />
          }
        />

        <p className="sec-desc">
          <T
            en={
              <>
                The version you will meet more often is mixed-up identifiers.{" "}
                <code>UserId</code> and <code>PostId</code> are both{" "}
                <code>string</code>, so looking up a user by a post id compiles
                without a word. There is only one real fix:{" "}
                <b>write the difference into the shape</b>. If only shapes are
                compared, then make the shapes differ.
              </>
            }
            zh={
              <>
                更常见的版本是 ID 混用:<code>UserId</code> 和{" "}
                <code>PostId</code> 都是 <code>string</code>,
                于是「拿帖子 ID 去查用户」全程编译通过。
                真正的解法只有一个:<b>把区别写进形状</b> ——
                既然只比形状,那就让形状不同。
              </>
            }
          />
        </p>

        <CodeBlock
          lang="ts"
          title={{
            en: "branded.ts · branded types, the standard workaround",
            zh: "branded.ts · 品牌类型(branded types):标准做法",
          }}
          hl={[1, 2]}
          code={S5_BRANDED}
          note={
            <T
              en={
                <>
                  Intersecting each type with an object type that carries a
                  marker member makes the two shapes different, so the two
                  strings are no longer interchangeable. <code>__brand</code>{" "}
                  exists only at compile time and costs nothing at run time. Be
                  honest about the price: a plain <code>string</code> is not
                  assignable to <code>UserId</code>, so creating one always
                  needs an assertion. The usual discipline is to write a single{" "}
                  <code>toUserId(s: string)</code> function that performs that
                  assertion, call it only where data enters the system, and
                  never write <code>as UserId</code> anywhere else. Lab 3 in
                  §06 walks through it.
                </>
              }
              zh={
                <>
                  让每个类型和一个带标记成员的对象类型求交集,
                  两个形状就不一样了,两个 string 也就不再能互换。
                  <code>__brand</code> 只存在于编译期,运行时没有任何开销。
                  代价也要说清楚:普通 <code>string</code> 不能赋给{" "}
                  <code>UserId</code>,所以造一个出来总得断言一次。
                  通常的做法是只写一个 <code>toUserId(s: string)</code>{" "}
                  函数来做这次断言,只在数据进入系统的入口调用它,
                  别处一律不写 <code>as UserId</code>。§06 的第 3
                  个任务会带你走一遍。
                </>
              }
            />
          }
        />

        <Callout
          tone="warn"
          title={{
            en: <>One more trap: the empty object type {"{}"}</>,
            zh: <>还有一个常见陷阱:空对象类型 {"{}"}</>,
          }}
        >
          <p>
            <T
              en={
                <>
                  Take the duck test to its limit. <code>{"{}"}</code> requires{" "}
                  <b>zero members</b>, and almost every value satisfies a list
                  of zero requirements. <code>42</code>,{" "}
                  <code>&quot;tea&quot;</code>, <code>true</code>, a function,
                  an array, and any object are all assignable to{" "}
                  <code>{"{}"}</code>. Only <code>null</code> and{" "}
                  <code>undefined</code> are rejected, and only because{" "}
                  <code>strictNullChecks</code> is on. So write{" "}
                  <code>object</code> when you mean any object, and{" "}
                  <code>unknown</code> when you mean any value at all and you
                  will narrow it before use. <code>{"{}"}</code> looks like a
                  requirement and is not one.
                </>
              }
              zh={
                <>
                  把鸭子测试推到极限:<code>{"{}"}</code> 要求
                  <b>零个成员</b>,而一份空要求几乎人人满足。
                  <code>42</code>、<code>&quot;tea&quot;</code>、
                  <code>true</code>、函数、数组、任何对象,
                  统统能赋给 <code>{"{}"}</code>。只有 <code>null</code> 和{" "}
                  <code>undefined</code> 进不来,而且这还是靠{" "}
                  <code>strictNullChecks</code> 开着。所以:
                  想表达「任意对象」写 <code>object</code>;
                  想表达「什么值都可能、用之前先收窄」写{" "}
                  <code>unknown</code>。<code>{"{}"}</code>{" "}
                  看着像一条要求,其实什么都没要求。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 practice ================= */}
      <Section
        id="labs"
        index="06"
        title={{ en: "Practice", zh: "动手任务" }}
        desc={{
          en: "Four tasks, all of which run in the TypeScript Playground (typescriptlang.org/play): trigger both faces of the excess property check, then reproduce a same-shape accident and block it.",
          zh: "四个任务,全都能在 TypeScript Playground(typescriptlang.org/play)里做:亲手触发多余属性检查的两副面孔,再复刻一次同形状事故并把它堵上。",
        }}
      >
        <LabSet ch="structural" items={LABS} />
      </Section>

      {/* ================= §07 quiz ================= */}
      <Section
        id="quiz"
        index="07"
        title={{ en: "Chapter quiz", zh: "通关测验" }}
        desc={{
          en: "Eight questions. After this chapter you should be able to answer “how does TypeScript decide that two types are compatible” from shapes, to sets, to the special treatment of object literals.",
          zh: "八道题。答完这一章,「TypeScript 怎么判断两个类型兼容」这个问题,你能从形状讲到集合,再讲到对象字面量的特殊待遇。",
        }}
      >
        <Quiz ch="structural" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                TypeScript uses <b>structural typing</b>: compatibility depends
                on the members, not on the name. The name is a label; the member
                list is the type. Classes are compared the same way.
              </>
            ),
            zh: (
              <>
                TypeScript 用的是<b>结构化类型</b>:兼容取决于成员,不取决于名字。
                名字是标签,成员清单才是类型本体。class 也按同一套规则比较。
              </>
            ),
          },
          {
            en: (
              <>
                Direction matters: <b>a type with more members is assignable to
                one with fewer</b>, never the other way round. The set view is
                the easiest way to remember it. More requirements means a
                smaller set, and a smaller set is contained in the larger one.
              </>
            ),
            zh: (
              <>
                方向很重要:<b>成员多的类型可以赋给成员少的</b>,反过来不行。
                用集合观最好记 —— 要求越多,集合越小,小集合被包含在大集合里。
              </>
            ),
          },
          {
            en: (
              <>
                The excess property check applies only to a <b>fresh object
                literal</b>: written at the call site it is an error, stored in
                a variable first it is allowed. It is an extra check layered on
                top of assignability, aimed at typos, not a general rule.
              </>
            ),
            zh: (
              <>
                多余属性检查只对<b>新鲜的对象字面量</b>生效:
                写在调用处报错,先存进变量就放行。
                它是叠加在可赋值性之上的一道额外检查,目标是抓拼写错误,
                不是一条通用规则。
              </>
            ),
          },
          {
            en: (
              <>
                Silencing that error with <code>as</code> hides the typo instead
                of fixing it. Read the property name in the message and correct
                the spelling. <b>ts(2561)</b> even tells you the correct name;{" "}
                <b>ts(2353)</b> is the same error without a suggestion.
              </>
            ),
            zh: (
              <>
                用 <code>as</code> 压掉这个报错,只是把错字藏起来,并没有修好。
                读报错里的属性名,把拼写改对。<b>ts(2561)</b>{" "}
                连正确的名字都告诉你了,<b>ts(2353)</b> 是同一个错误,只是没有建议。
              </>
            ),
          },
          {
            en: (
              <>
                Identical shapes are interchangeable even when they mean
                different things. For accidents like <code>UserId</code> mixed
                with <code>PostId</code>, use a branded type to write the
                difference into the shape. And note that{" "}
                <code>{"{ a?: number }"}</code> is not{" "}
                <code>{"{ a: number | undefined }"}</code>, and that{" "}
                <code>{"{}"}</code> requires nothing at all: write{" "}
                <code>object</code> when you mean any object.
              </>
            ),
            zh: (
              <>
                形状相同就能互换,哪怕两者的含义毫不相干。
                <code>UserId</code> 混 <code>PostId</code> 这类事故,
                用品牌类型把区别写进形状。另外记住:
                <code>{"{ a?: number }"}</code> 不等于{" "}
                <code>{"{ a: number | undefined }"}</code>;<code>{"{}"}</code>{" "}
                什么都不要求 —— 想说「任意对象」请写 <code>object</code>。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="structural" />
    </main>
  );
}
