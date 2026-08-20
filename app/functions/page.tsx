"use client";

// 第 02 章 · 函数与对象类型(双语:正文用 <T en zh />,组件 props 用 { en, zh })——
// 签名解剖 → 参数三件套 → 函数类型与 void → 哪个函数放得进去(型变)→
// 重载与 this → 对象类型进阶 → interface vs type → 奶茶店实战 → 动手 → 测验。
//
// 代码示例:可执行行在两种语言里逐字节相同,只有注释分 en / zh;
// 因此 hl 行号在两种语言下一致。编译器报错原文一律不翻译。
// 所有报错文案、报错码与推断结果均在 TypeScript 5.9 + strict 下实测过。

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
import { T, type Loc } from "@/lib/i18n";
import { LABS, QUIZ } from "@/lib/functions-data";
import { HeroManifest, SignatureAnatomy, CallCheck } from "./viz";

/* ---------- §01 签名 ---------- */

const S1_JS: Loc<string> = {
  en: `// menu.js - nothing about the shapes is written down
function makeOrder(item, size, toppings) {
  // What is item? Which values may size take?
  // Can toppings be left out? What comes back?
  // The answers are only in the head of whoever wrote this.
}`,
  zh: `// menu.js —— 形状什么都没写下来
function makeOrder(item, size, toppings) {
  // item 是什么?size 能取哪些值?
  // toppings 可以不传吗?返回什么?
  // 答案只在三个月前写它的那个人脑子里。
}`,
};

const S1_TS: Loc<string> = {
  en: `// menu.ts - the same information, written into the signature
function makeOrder(
  item: MenuItem,        // in: one item from the menu
  size: Size,            // in: "small" | "medium" | "large"
  toppings?: Topping[],  // in, may be omitted: the toppings
): Order {               // out: one complete order
  // ...
}`,
  zh: `// menu.ts —— 同样的信息,写进签名里
function makeOrder(
  item: MenuItem,        // 进:菜单上的一项
  size: Size,            // 进:"small" | "medium" | "large"
  toppings?: Topping[],  // 进(可省略):配料清单
): Order {               // 出:一张完整订单
  // ...
}`,
};

const S1_INFER: Loc<string> = {
  en: `function subtotal(prices: number[]) {
  return prices.reduce((sum, p) => sum + p, 0);
}
// Hover subtotal and TypeScript shows:
//   function subtotal(prices: number[]): number
// The return type was not written. It was read from the return statement.`,
  zh: `function subtotal(prices: number[]) {
  return prices.reduce((sum, p) => sum + p, 0);
}
// 悬停 subtotal,TypeScript 显示:
//   function subtotal(prices: number[]): number
// 返回值类型没写,它是从 return 语句读出来的。`,
};

const S1_ANY_LEAK: Loc<string> = {
  en: `// JSON.parse returns any, so the inferred return type is any too.
function loadOrder(json: string) {
  return JSON.parse(json);
}
const order = loadOrder('{"total": 25}');
order.tatol.toFixed(2); // Misspelled. order is any, so nothing is reported.

// Fix: write the return type. any now stops at the function boundary.
function loadOrder2(json: string): Order {
  return JSON.parse(json);
}
const order2 = loadOrder2('{"total": 25}');
order2.tatol;
// Property 'tatol' does not exist on type 'Order'.`,
  zh: `// JSON.parse 返回 any,于是推断出来的返回值类型也是 any。
function loadOrder(json: string) {
  return JSON.parse(json);
}
const order = loadOrder('{"total": 25}');
order.tatol.toFixed(2); // 拼错了。order 是 any,所以这里什么都不报。

// 修法:写出返回值类型,any 就被挡在函数边界之内。
function loadOrder2(json: string): Order {
  return JSON.parse(json);
}
const order2 = loadOrder2('{"total": 25}');
order2.tatol;
// Property 'tatol' does not exist on type 'Order'.`,
};

/* ---------- §02 参数三件套 ---------- */

const S2_TRIO: Loc<string> = {
  en: `// 1. Optional parameter: a ? after the name.
function makeTea(base: string, topping?: string) {
  // Inside the function, topping is string | undefined.
  return topping ? base + " + " + topping : base;
}
makeTea("Oolong");         // ok, the argument is left out
makeTea("Oolong", "boba"); // ok

// 2. Default value: the type is read from the default.
function pourSugar(base: string, sugar = 50) {
  // Inside the function, sugar is number. It is never undefined.
  return base + " (" + sugar + "% sugar)";
}
pourSugar("Milk Green");            // sugar is 50
pourSugar("Milk Green", undefined); // sugar is 50 here as well

// 3. Rest parameter: collects the remaining arguments into an array.
function addToppings(base: string, ...toppings: string[]) {
  return base + " + " + toppings.join(" + ");
}
addToppings("Milk Green", "boba", "coconut jelly", "pudding");`,
  zh: `// ① 可选参数:名字后面加 ?
function makeTea(base: string, topping?: string) {
  // 函数体里,topping 的类型是 string | undefined。
  return topping ? base + " + " + topping : base;
}
makeTea("Oolong");         // ✓ 不传第二个参数
makeTea("Oolong", "boba"); // ✓

// ② 默认值参数:类型从默认值读出来。
function pourSugar(base: string, sugar = 50) {
  // 函数体里,sugar 的类型就是 number,不含 undefined。
  return base + " (" + sugar + "% sugar)";
}
pourSugar("Milk Green");            // sugar 是 50
pourSugar("Milk Green", undefined); // sugar 同样是 50

// ③ rest 参数:把剩下的实参收进一个数组。
function addToppings(base: string, ...toppings: string[]) {
  return base + " + " + toppings.join(" + ");
}
addToppings("Milk Green", "boba", "coconut jelly", "pudding");`,
};

const S2_BAD_ORDER: Loc<string> = {
  en: `function bad(topping?: string, base: string) {}
//                             ~~~~
// A required parameter cannot follow an optional parameter.

// Arguments are matched by position. In the call bad("Oolong")
// there is no way to tell whether "Oolong" is topping or base.`,
  zh: `function bad(topping?: string, base: string) {}
//                             ~~~~
// A required parameter cannot follow an optional parameter.

// 实参是按位置对号入座的。调用 bad("Oolong") 时,
// 没办法说清 "Oolong" 到底算 topping 还是 base。`,
};

const S2_OPT_VS_UNDEF: Loc<string> = {
  en: `function a(topping?: string) {}
function b(topping: string | undefined) {}

a();          // ok - the argument may be left out entirely
b();          // Expected 1 arguments, but got 0.
b(undefined); // ok - the argument is required, undefined is a valid value`,
  zh: `function a(topping?: string) {}
function b(topping: string | undefined) {}

a();          // ✓ 这个实参可以整个不写
b();          // Expected 1 arguments, but got 0.
b(undefined); // ✓ 实参必须写,而 undefined 是一个合法的值`,
};

const S2_TUPLE_REST: Loc<string> = {
  en: `// A rest parameter is typed as an array, or as a tuple.
// A tuple gives the leading positions their own types and names.
function order(...args: [name: string, size: Size, ...extras: string[]]) {
  const [name, size, ...extras] = args;
  return name + " " + size + " +" + extras.length;
}

order("Oolong", "large", "boba"); // ok
order("Oolong", "grande");
// Argument of type '"grande"' is not assignable to parameter of type 'Size'.
order("Oolong");
// Expected at least 2 arguments, but got 1.`,
  zh: `// rest 参数的类型可以是数组,也可以是元组。
// 元组能给前面几个位置各自指定类型和名字。
function order(...args: [name: string, size: Size, ...extras: string[]]) {
  const [name, size, ...extras] = args;
  return name + " " + size + " +" + extras.length;
}

order("Oolong", "large", "boba"); // ✓
order("Oolong", "grande");
// Argument of type '"grande"' is not assignable to parameter of type 'Size'.
order("Oolong");
// Expected at least 2 arguments, but got 1.`,
};

/* ---------- §03 函数类型与 void ---------- */

const S3_FNTYPE: Loc<string> = {
  en: `// A function type expression describes the shape of a function.
type PriceFormatter = (price: number) => string;
//                    ^ takes one number, returns one string

const usd: PriceFormatter = (p) => "$" + p.toFixed(2);
// p carries no annotation, and it is not any. Its type comes from
// PriceFormatter. Reading a type from the surrounding context like
// this is called contextual typing.`,
  zh: `// 函数类型表达式描述「一个函数长什么样」。
type PriceFormatter = (price: number) => string;
//                    ^ 收一个 number,还一个 string

const usd: PriceFormatter = (p) => "$" + p.toFixed(2);
// p 没写注解,但它不是 any —— 它的类型来自 PriceFormatter。
// 这种「从所处的上下文读出类型」的机制叫
// 按上下文定型(contextual typing)。`,
};

const S3_CALLBACK: Loc<string> = {
  en: `// A parameter can be a function itself. Write down its shape too.
function onEachItem(
  items: MenuItem[],
  cb: (item: MenuItem, index: number) => void,
) {
  items.forEach((it, i) => cb(it, i));
}`,
  zh: `// 参数本身也可以是函数,那就把它的形状一并写清楚。
function onEachItem(
  items: MenuItem[],
  cb: (item: MenuItem, index: number) => void,
) {
  items.forEach((it, i) => cb(it, i));
}`,
};

const S3_VOID: Loc<string> = {
  en: `const collected: number[] = [];

[1, 2, 3].forEach((n) => collected.push(n));
// push returns a number: the new length of the array.
// forEach asks for a callback of type (value, index, array) => void.
// This compiles anyway.`,
  zh: `const collected: number[] = [];

[1, 2, 3].forEach((n) => collected.push(n));
// push 返回一个 number:数组的新长度。
// forEach 要的回调类型是 (value, index, array) => void。
// 这段代码照样编译通过。`,
};

const S3_VOID_STRICT: Loc<string> = {
  en: `// void on a declaration means "this function returns nothing".
function log(msg: string): void {
  return msg.length;
  // Type 'number' is not assignable to type 'void'.
}

// A variable of type void is a third case. Almost nothing fits it.
let nothing: void;
nothing = undefined; // ok
nothing = 1;         // Type 'number' is not assignable to type 'void'.`,
  zh: `// 写在声明上的 void 意思是「这个函数不返回值」。
function log(msg: string): void {
  return msg.length;
  // Type 'number' is not assignable to type 'void'.
}

// 类型为 void 的变量是第三种情况:几乎什么都放不进去。
let nothing: void;
nothing = undefined; // ✓
nothing = 1;         // Type 'number' is not assignable to type 'void'.`,
};

/* ---------- §04 哪个函数放得进去 ---------- */

const S4_RETURN: Loc<string> = {
  en: `interface Animal { name: string }
interface Dog extends Animal { breed: string }

// Return type: a function that returns Dog fits where a function
// returning Animal is expected. Every Dog is already an Animal, so
// the caller still gets everything it was promised.
type MakeAnimal = () => Animal;
const makeDog: MakeAnimal = (): Dog => ({ name: "Rex", breed: "corgi" });`,
  zh: `interface Animal { name: string }
interface Dog extends Animal { breed: string }

// 返回值方向:一个返回 Dog 的函数,
// 可以放在「要求返回 Animal」的位置。因为每个 Dog 本来就是 Animal,
// 调用方拿到的东西不会少于承诺。
type MakeAnimal = () => Animal;
const makeDog: MakeAnimal = (): Dog => ({ name: "Rex", breed: "corgi" });`,
};

const S4_PARAM: Loc<string> = {
  en: `// Parameter type: the opposite direction. Under strictFunctionTypes,
// a function type accepts a parameter that is the same or wider.
type FeedAnimal = (a: Animal) => void;

const feedDog: FeedAnimal = (d: Dog) => console.log(d.breed);
// Type '(d: Dog) => void' is not assignable to type 'FeedAnimal'.
//   Types of parameters 'd' and 'a' are incompatible.
//     Property 'breed' is missing in type 'Animal' but required in type 'Dog'.

// Wider is fine: FeedDog may be called with any Dog, and every Dog
// is an Animal, so a function that accepts any Animal can do the job.
type FeedDog = (d: Dog) => void;
const feedAnimal: FeedDog = (a: Animal) => console.log(a.name);`,
  zh: `// 参数方向正好相反。在 strictFunctionTypes 下,
// 函数类型只接受「一样宽或更宽」的参数。
type FeedAnimal = (a: Animal) => void;

const feedDog: FeedAnimal = (d: Dog) => console.log(d.breed);
// Type '(d: Dog) => void' is not assignable to type 'FeedAnimal'.
//   Types of parameters 'd' and 'a' are incompatible.
//     Property 'breed' is missing in type 'Animal' but required in type 'Dog'.

// 更宽就没问题:FeedDog 只会拿 Dog 来调用,而每个 Dog 都是 Animal,
// 所以一个「什么 Animal 都收」的函数完全能胜任。
type FeedDog = (d: Dog) => void;
const feedAnimal: FeedDog = (a: Animal) => console.log(a.name);`,
};

const S4_BIVARIANT: Loc<string> = {
  en: `// The exception: a member written with method syntax is checked in
// both directions, even under strictFunctionTypes.
interface Feeder { feed(a: Animal): void }
const f: Feeder = { feed(d: Dog) { console.log(d.breed); } }; // no error

// Write the same member as a property and the strict rule applies.
interface Feeder2 { feed: (a: Animal) => void }
const g: Feeder2 = { feed: (d: Dog) => console.log(d.breed) };
// Type '(d: Dog) => void' is not assignable to type '(a: Animal) => void'.

// This is why arrays behave the way they do. Array<T> declares push,
// forEach and the rest with method syntax:
declare const dogs: Dog[];
const animals: Animal[] = dogs;      // accepted
animals.push({ name: "Whiskers" });  // accepted - dogs now holds a non-Dog`,
  zh: `// 例外:用方法语法写的成员,即使开着 strictFunctionTypes,
// 参数也是双向检查的。
interface Feeder { feed(a: Animal): void }
const f: Feeder = { feed(d: Dog) { console.log(d.breed); } }; // 不报错

// 同一个成员改写成属性语法,严格规则就生效了。
interface Feeder2 { feed: (a: Animal) => void }
const g: Feeder2 = { feed: (d: Dog) => console.log(d.breed) };
// Type '(d: Dog) => void' is not assignable to type '(a: Animal) => void'.

// 数组的表现就是这么来的。Array<T> 的 push、forEach 等成员
// 都是用方法语法声明的:
declare const dogs: Dog[];
const animals: Animal[] = dogs;      // 通过
animals.push({ name: "Whiskers" });  // 通过 —— dogs 里从此躺着一个非 Dog`,
};

const S4_ARITY: Loc<string> = {
  en: `// A function with fewer parameters fits where one with more is expected.
[1, 2, 3].map((x) => x * 2);
// map calls the callback with three arguments: value, index, array.
// A callback that declares one parameter simply ignores the other two.
// Plain JavaScript already works this way, so the rule costs nothing.

// The opposite is rejected. Extra parameters would never be filled in:
declare function each(cb: (v: number, i: number, all: number[]) => void): void;
each((v: number, i: number, all: number[], extra: string) => {});
// Target signature provides too few arguments. Expected 4 or more, but got 3.`,
  zh: `// 参数更少的函数,可以放在「要求参数更多」的位置。
[1, 2, 3].map((x) => x * 2);
// map 调用回调时会传三个实参:value、index、array。
// 只声明一个参数的回调,后两个直接忽略掉。
// 原生 JavaScript 本来就是这样,所以这条规则没有额外代价。

// 反过来则被拒绝 —— 多出来的参数永远没人填:
declare function each(cb: (v: number, i: number, all: number[]) => void): void;
each((v: number, i: number, all: number[], extra: string) => {});
// Target signature provides too few arguments. Expected 4 or more, but got 3.`,
};

/* ---------- §05 重载与 this ---------- */

const S5_OVERLOAD: Loc<string> = {
  en: `// Two overload signatures, then one implementation signature.
function price(item: string): number;
function price(items: string[]): number[];
function price(x: string | string[]): number | number[] {
  return Array.isArray(x) ? x.map(() => 10) : 10;
}

const one = price("Oolong");           // number
const many = price(["Oolong", "Tea"]); // number[]

// The implementation signature is not part of the public type.
// A union argument matches neither overload, so this is an error:
declare const mixed: string | string[];
price(mixed);
// No overload matches this call.`,
  zh: `// 两条重载签名,后面跟一条实现签名。
function price(item: string): number;
function price(items: string[]): number[];
function price(x: string | string[]): number | number[] {
  return Array.isArray(x) ? x.map(() => 10) : 10;
}

const one = price("Oolong");           // number
const many = price(["Oolong", "Tea"]); // number[]

// 实现签名不属于对外类型的一部分。
// 一个联合类型的实参两条重载都匹配不上,所以这里报错:
declare const mixed: string | string[];
price(mixed);
// No overload matches this call.`,
};

const S5_ORDER: Loc<string> = {
  en: `// TypeScript takes the first overload that matches, in source order.
function fmt(x: unknown): string;
function fmt(x: number): number;
function fmt(x: any): any { return x; }

const a = fmt(1); // string - the unknown signature matched first

// Put the more specific signature first and the result changes.
function fmt2(x: number): number;
function fmt2(x: unknown): string;
function fmt2(x: any): any { return x; }

const b = fmt2(1); // number`,
  zh: `// TypeScript 按书写顺序取第一条匹配上的重载。
function fmt(x: unknown): string;
function fmt(x: number): number;
function fmt(x: any): any { return x; }

const a = fmt(1); // string —— unknown 那条先匹配上了

// 把更具体的那条放到前面,结果就变了。
function fmt2(x: number): number;
function fmt2(x: unknown): string;
function fmt2(x: any): any { return x; }

const b = fmt2(1); // number`,
};

const S5_THIS: Loc<string> = {
  en: `declare const button: HTMLButtonElement;

// A first parameter named this is not a real parameter. It declares
// what this must be when the function runs. It is erased at compile
// time, so it does not exist at runtime and does not shift the other
// parameters: onClick still takes exactly one argument.
function onClick(this: HTMLButtonElement, ev: MouseEvent) {
  console.log(this.disabled, ev.type);
}

button.addEventListener("click", onClick); // ok - this will be the button
onClick(new MouseEvent("click"));
// The 'this' context of type 'void' is not assignable to method's 'this'
// of type 'HTMLButtonElement'.

// An arrow function takes this from the surrounding scope, so it has
// no this of its own to declare:
const arrow = (this: HTMLElement) => {};
// An arrow function cannot have a 'this' parameter.`,
  zh: `declare const button: HTMLButtonElement;

// 名字叫 this 的第一个参数不是真参数。它声明的是
// 「这个函数运行时,this 必须是什么」。它在编译期被擦除,
// 运行时并不存在,也不会挤占其他参数的位置:
// onClick 依然只接收一个实参。
function onClick(this: HTMLButtonElement, ev: MouseEvent) {
  console.log(this.disabled, ev.type);
}

button.addEventListener("click", onClick); // ✓ this 会是那个按钮
onClick(new MouseEvent("click"));
// The 'this' context of type 'void' is not assignable to method's 'this'
// of type 'HTMLButtonElement'.

// 箭头函数的 this 来自外层作用域,
// 它没有自己的 this 可以声明:
const arrow = (this: HTMLElement) => {};
// An arrow function cannot have a 'this' parameter.`,
};

/* ---------- §06 对象类型进阶 ---------- */

const S6_OBJ: Loc<string> = {
  en: `interface MenuItem {
  readonly id: number; // readonly: once listed, the id cannot change
  name: string;
  price: number;
  desc?: string;       // optional property: it may be missing
}

const jasmine: MenuItem = { id: 1, name: "Jasmine Milk Green", price: 16 };

jasmine.price = 18; // ok, prices change
jasmine.id = 2;     // Cannot assign to 'id' because it is
                    // a read-only property.`,
  zh: `interface MenuItem {
  readonly id: number; // readonly:上架之后,货号不许改
  name: string;
  price: number;
  desc?: string;       // 可选属性:这个字段可以没有
}

const jasmine: MenuItem = { id: 1, name: "Jasmine Milk Green", price: 16 };

jasmine.price = 18; // ✓ 涨价可以
jasmine.id = 2;     // Cannot assign to 'id' because it is
                    // a read-only property.`,
};

const S6_INDEX: Loc<string> = {
  en: `// The stock table: which SKUs exist is decided at runtime.
// The shape is fixed: the key is a string, the value is a number.
interface Inventory {
  [sku: string]: number;
}

const stock: Inventory = { "tea-001": 30, "tea-002": 12 };
stock["tea-003"] = 50;    // ok, any new key is allowed
stock["tea-001"] = "many";
// Type 'string' is not assignable to type 'number'.`,
  zh: `// 库存表:有哪些货号,是运行时才定的。
// 形状则是固定的:键是 string,值是 number。
interface Inventory {
  [sku: string]: number;
}

const stock: Inventory = { "tea-001": 30, "tea-002": 12 };
stock["tea-003"] = 50;    // ✓ 新货号随便加
stock["tea-001"] = "many";
// Type 'string' is not assignable to type 'number'.`,
};

/* ---------- §07 interface vs type ---------- */

const S7_IFACE = `interface MenuItem {
  name: string;
  price: number;
}

interface ToppedItem extends MenuItem {
  toppings: string[];
}`;

const S7_TYPE = `type MenuItem = {
  name: string;
  price: number;
};

type ToppedItem = MenuItem & {
  toppings: string[];
};`;

const S7_INTERSECT: Loc<string> = {
  en: `// A & B describes one value that satisfies A and B at the same time.
// The result has every member of both.
type Priced = { price: number };
type Named = { name: string };
type Item = Priced & Named;

const item: Item = { price: 16, name: "Jasmine Milk Green" }; // ok
const half: Item = { price: 16 };
// Property 'name' is missing in type '{ price: number; }' but
// required in type 'Named'.

// & is not | . A union value is one of its members, and you must check
// which one before you use it. An intersection value is all of them at
// once, so no check is needed.`,
  zh: `// A & B 描述的是「同时满足 A 和 B」的一个值。
// 结果类型拥有两边的全部成员。
type Priced = { price: number };
type Named = { name: string };
type Item = Priced & Named;

const item: Item = { price: 16, name: "Jasmine Milk Green" }; // ✓
const half: Item = { price: 16 };
// Property 'name' is missing in type '{ price: number; }' but
// required in type 'Named'.

// & 不是 |。联合类型的值只是其中一个成员,
// 用之前必须先检查是哪一个;交叉类型的值则同时是全部成员,
// 不需要检查。`,
};

const S7_CONFLICT: Loc<string> = {
  en: `// When two sides disagree, extends reports it and & does not.
interface A { price: number }
interface B extends A { price: string }
// Interface 'B' incorrectly extends interface 'A'.
//   Types of property 'price' are incompatible.
//     Type 'string' is not assignable to type 'number'.

type C = { price: number } & { price: string }; // no error here
declare const c: C;
c.price; // the type of price is never, so nothing can be done with it`,
  zh: `// 两边打架时,extends 会报错,& 不会。
interface A { price: number }
interface B extends A { price: string }
// Interface 'B' incorrectly extends interface 'A'.
//   Types of property 'price' are incompatible.
//     Type 'string' is not assignable to type 'number'.

type C = { price: number } & { price: string }; // 这里不报错
declare const c: C;
c.price; // price 的类型是 never,拿它什么也做不了`,
};

const S7_MERGE: Loc<string> = {
  en: `// declaration merging: two interfaces with the same name are combined.
// Only interface can do this.

// One condition: a plain interface declaration only lands in the global
// scope inside a script file, meaning a file with no import and no
// export. Almost every file in a real project is a module, and there the
// declaration below creates a local Window instead:
//   error TS2339: Property 'teaShopVersion' does not exist on
//                 type 'Window & typeof globalThis'.
// Inside a module, wrap it in declare global:
declare global {
  interface Window {
    teaShopVersion: string;
  }
}
// Now it really merges with the built-in Window:
window.teaShopVersion; // ok

// Two type aliases with the same name are an error:
type Size = "small";
type Size = "large"; // Duplicate identifier 'Size'.`,
  zh: `// declaration merging:同名的两个 interface 会被合并。
// 只有 interface 有这个能力。

// 有个前提:一条普通的 interface 声明,只有写在「脚本文件」
// (整个文件没有 import 也没有 export)里才直接落在全局。
// 真实项目里几乎每个文件都是模块,此时下面这样写声明出来的是一个
// 局部的 Window:
//   error TS2339: Property 'teaShopVersion' does not exist on
//                 type 'Window & typeof globalThis'.
// 在模块里要扩全局,必须用 declare global 包起来:
declare global {
  interface Window {
    teaShopVersion: string;
  }
}
// 这样才真的和内置的 Window 合并了:
window.teaShopVersion; // ✓

// 两个同名的 type 别名则直接报错:
type Size = "small";
type Size = "large"; // Duplicate identifier 'Size'.`,
};

const S7_TYPE_ONLY: Loc<string> = {
  en: `// Unions and mapped types can only be written with type.
type Size = "small" | "medium" | "large"; // one of three
type SoldOut = { [K in Size]: boolean };  // a mapped type, chapter 07`,
  zh: `// 联合类型和映射类型只能用 type 写出来。
type Size = "small" | "medium" | "large"; // 三选一
type SoldOut = { [K in Size]: boolean };  // 映射类型,07 章的主角`,
};

/* ---------- §08 奶茶店实战 ---------- */

const S8_FULL: Loc<string> = {
  en: `type Size = "small" | "medium" | "large";
type Topping = "boba" | "coconut jelly" | "pudding" | "taro balls";

interface MenuItem {
  readonly id: number;
  name: string;
  price: number;
}

interface Order {
  item: MenuItem;
  size: Size;
  toppings: Topping[];
  total: number;
}

function makeOrder(
  item: MenuItem,
  size: Size,
  toppings: Topping[] = [], // default value: no toppings means an empty array
): Order {
  const sizeFee = size === "large" ? 3 : size === "medium" ? 1 : 0;
  const toppingFee = toppings.length * 2;
  return { item, size, toppings, total: item.price + sizeFee + toppingFee };
}`,
  zh: `type Size = "small" | "medium" | "large";
type Topping = "boba" | "coconut jelly" | "pudding" | "taro balls";

interface MenuItem {
  readonly id: number;
  name: string;
  price: number;
}

interface Order {
  item: MenuItem;
  size: Size;
  toppings: Topping[];
  total: number;
}

function makeOrder(
  item: MenuItem,
  size: Size,
  toppings: Topping[] = [], // 默认值:不加料就是一个空数组
): Order {
  const sizeFee = size === "large" ? 3 : size === "medium" ? 1 : 0;
  const toppingFee = toppings.length * 2;
  return { item, size, toppings, total: item.price + sizeFee + toppingFee };
}`,
};

export default function FunctionsPage() {
  return (
    <main className="page" data-ch="functions">
      <Hero
        ch="functions"
        title={{
          en: (
            <>
              A signature says what goes{" "}
              <span className="grad">in and out</span>
            </>
          ),
          zh: (
            <>
              函数签名,写清<span className="grad">进出的形状</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              One line records the shape of every parameter and the shape of
              the result. The person who writes the function does not have to
              explain it, the person who calls it does not have to guess, and
              the compiler checks that both sides keep their side of the deal.
            </>
          ),
          zh: (
            <>
              一行签名就记下了每个参数的形状和返回值的形状。
              写的人不用另作解释,调的人不用猜,
              而编译器会盯着双方各自守约。
            </>
          ),
        }}
        chips={[
          { id: "sign", n: "01", label: { en: "Reading a signature", zh: "签名解剖台" } },
          { id: "params", n: "02", label: { en: "Optional, default, rest", zh: "参数三件套" } },
          { id: "fntype", n: "03", label: { en: "Function types and void", zh: "函数类型与 void" } },
          { id: "fit", n: "04", label: { en: "Which function fits", zh: "哪个函数放得进去" } },
          { id: "more", n: "05", label: { en: "Overloads and this", zh: "重载与 this" } },
          { id: "objects", n: "06", label: { en: "Object types", zh: "对象类型进阶" } },
          { id: "ivt", n: "07", label: { en: "interface vs type", zh: "interface vs type" } },
          { id: "shop", n: "08", label: { en: "Full example", zh: "奶茶店实战" } },
          { id: "labs", n: "09", label: { en: "Practice", zh: "动手" } },
          { id: "quiz", n: "10", label: { en: "Quiz", zh: "测验" } },
        ]}
      >
        <HeroManifest />
      </Hero>

      {/* ================= §01 签名解剖台 ================= */}
      <Section
        id="sign"
        index="01"
        title={{
          en: "Reading a signature: five parts, one line",
          zh: "签名解剖台:一行签名,五个部位",
        }}
        desc={{
          en: "A delivery note lists what arrives and what leaves. A function signature does the same job for a function. Click each part.",
          zh: "一张送货单会写清楚「送来什么、交出什么」。函数签名对函数干的是同一件事 —— 点每一段试试。",
        }}
      >
        <SignatureAnatomy />

        <p className="sec-desc" style={{ marginTop: 18 }}>
          <T
            en={
              <>
                Start from the difference. Here is the same function twice. On
                the left you have to read the body to find out what it wants.
                On the right the first line already says it.
              </>
            }
            zh={
              <>
                先看差距。同一个函数写两遍:左边你得读函数体才知道它想要什么,
                右边第一行就写明白了。
              </>
            }
          />
        </p>
        <CodePair
          left={<CodeBlock lang="js" title="menu.js" code={S1_JS} />}
          right={
            <CodeBlock
              lang="ts"
              title="menu.ts"
              code={S1_TS}
              note={{
                en: (
                  <>
                    This line is <b>documentation</b> for people and a{" "}
                    <b>contract</b> that the compiler enforces. Documentation
                    goes out of date quietly. A contract does not: change the
                    signature without changing the callers and the build fails.
                  </>
                ),
                zh: (
                  <>
                    这一行同时是给人看的<b>文档</b>和编译器负责执行的
                    <b>合同</b>。文档会悄悄过时,合同不会 ——
                    改了签名却不改调用方,构建当场失败。
                  </>
                ),
              }}
            />
          }
        />

        <p className="sec-desc">
          <T
            en={
              <>
                Parameter types are usually required: the compiler has nothing
                to read them from. The return type is usually{" "}
                <b>not</b> required, because the compiler reads it from the{" "}
                <code>return</code> statements.
              </>
            }
            zh={
              <>
                参数类型通常必须写:编译器没有别的材料可以读。
                返回值类型通常<b>不必</b>写,因为编译器会从{" "}
                <code>return</code> 语句里读出来。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title={{ en: "The return type is inferred", zh: "返回值类型是推断出来的" }}
          code={S1_INFER}
        />

        <Callout
          tone="warn"
          title={{
            en: "So when is writing the return type still worth it?",
            zh: "那什么时候还是值得把返回值写出来?",
          }}
        >
          <p>
            <T
              en={
                <>
                  Two situations. The first is a <b>public boundary</b>: a
                  function that other modules, other teams, or a published
                  package will call. There the annotation is the promise, and
                  it stops an accidental change to the body from silently
                  changing the type everyone depends on.
                </>
              }
              zh={
                <>
                  两种情况。第一种是<b>对外边界</b>:会被其他模块、其他团队,
                  或者发布出去的包调用的函数。
                  这时注解就是那份承诺,能挡住「函数体一改,
                  所有人依赖的类型跟着悄悄变了」。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  The second is that the error appears in a better place. With
                  an annotation, a mistake is reported at the{" "}
                  <b>definition</b>, on the line you are editing. Without one,
                  the wrong type flows out and the error appears at some{" "}
                  <b>call site</b> far away, or nowhere at all. The worst case
                  is <code>any</code>:
                </>
              }
              zh={
                <>
                  第二种是报错的位置会更好。写了注解,错误就报在
                  <b>定义处</b>,也就是你正在改的这一行。不写注解,
                  错误的类型会流出去,报错出现在很远的某个<b>调用处</b>,
                  甚至根本不报。最糟的情况是 <code>any</code>:
                </>
              }
            />
          </p>
          <CodeBlock
            lang="ts"
            title={{ en: "How any escapes", zh: "any 是怎么逃出去的" }}
            code={S1_ANY_LEAK}
            hl={[6, 9]}
          />
          <p>
            <T
              en={
                <>
                  Writing <code>: Order</code> puts a gate at the exit. The body
                  may still infer <code>any</code> internally, but callers
                  receive an <code>Order</code>, and a misspelled field is
                  caught immediately.
                </>
              }
              zh={
                <>
                  写上 <code>: Order</code> 相当于在出口装了一道闸。
                  函数体内部仍然可能推断出 <code>any</code>,但调用方拿到的是{" "}
                  <code>Order</code>,写错字段当场被抓。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §02 参数三件套 ================= */}
      <Section
        id="params"
        index="02"
        title={{
          en: "Three ways to make a parameter flexible",
          zh: "参数三件套:可选、默认值、rest",
        }}
        desc={{
          en: "Real functions do not require every argument every time. Optional parameters, default values, and rest parameters each have their own rules.",
          zh: "真实的函数不会每次都要求填满每一格。可选参数、默认值、rest 参数,各有各的规矩。",
        }}
      >
        <CodeBlock lang="ts" title="params.ts" code={S2_TRIO} hl={[2, 10, 18]} />

        <Callout
          tone="idea"
          title={{
            en: "Optional and default are not the same thing",
            zh: "可选和默认值不是一回事",
          }}
        >
          <p>
            <T
              en={
                <>
                  Both let the caller leave the argument out. The difference is
                  what the parameter looks like <b>inside</b> the function.
                  With <code>topping?: string</code> the type is{" "}
                  <code>string | undefined</code>, so you have to check it
                  before using it. With <code>sugar = 50</code> the type is
                  plain <code>number</code>: if the argument is missing, the
                  default runs first, so <code>undefined</code> never reaches
                  the body.
                </>
              }
              zh={
                <>
                  两者都允许调用方不写这个实参。区别在于参数在函数体
                  <b>内部</b>长什么样。写 <code>topping?: string</code>,
                  它的类型是 <code>string | undefined</code>,用之前得先检查。
                  写 <code>sugar = 50</code>,它的类型就是干净的{" "}
                  <code>number</code>:实参没给的时候默认值先跑一遍,
                  <code>undefined</code> 根本进不到函数体里。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Passing <code>undefined</code> explicitly also triggers the
                  default, which is why{" "}
                  <code>pourSugar(&quot;Milk Green&quot;, undefined)</code>{" "}
                  gives 50 too. When a parameter has a sensible default, prefer
                  the default over <code>?</code>: it removes a check from
                  every line of the body.
                </>
              }
              zh={
                <>
                  显式传 <code>undefined</code> 同样会触发默认值,
                  所以{" "}
                  <code>pourSugar(&quot;Milk Green&quot;, undefined)</code>{" "}
                  拿到的也是 50。当一个参数存在合理的默认值时,
                  优先用默认值而不是 <code>?</code> —— 函数体里少一道检查。
                </>
              }
            />
          </p>
        </Callout>

        <Callout
          tone="warn"
          title={{
            en: "An optional parameter cannot be followed by a required one",
            zh: "可选参数后面不能再跟必选参数",
          }}
        >
          <CodeBlock
            lang="ts"
            title={{ en: "Wrong order", zh: "顺序错了" }}
            code={S2_BAD_ORDER}
          />
          <p>
            <T
              en={
                <>
                  Arguments are matched by <b>position</b>. If an optional
                  parameter sits in the middle, every required parameter after
                  it can no longer be identified. The rule is: required first,
                  then optional and defaulted ones.
                </>
              }
              zh={
                <>
                  实参是按<b>位置</b>对号入座的。可选参数一旦插在中间,
                  它后面的必选参数就再也认不出来了。所以规矩是:
                  必选在前,可选和带默认值的在后。
                </>
              }
            />
          </p>
        </Callout>

        <p className="sec-desc">
          <T
            en={
              <>
                A common question: is <code>topping?: string</code> the same as{" "}
                <code>topping: string | undefined</code>? <b>No.</b>
              </>
            }
            zh={
              <>
                一个高频疑问:<code>topping?: string</code> 和{" "}
                <code>topping: string | undefined</code> 是一回事吗?
                <b>不是。</b>
              </>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title={{
            en: "Optional is not the same as | undefined",
            zh: "可选 ≠ | undefined",
          }}
          code={S2_OPT_VS_UNDEF}
          note={{
            en: (
              <>
                <code>?</code> controls whether the argument may be{" "}
                <b>left out</b>. <code>| undefined</code> controls{" "}
                <b>which values</b> the argument may hold. The second one still
                requires you to pass something.
              </>
            ),
            zh: (
              <>
                <code>?</code> 管的是这个实参能不能<b>整个不写</b>;
                <code>| undefined</code> 管的是这个实参能<b>放哪些值</b>。
                后者仍然要求你传点什么进来。
              </>
            ),
          }}
        />

        <p className="sec-desc">
          <T
            en={
              <>
                A rest parameter is typed as an array. It can also be typed as
                a <b>tuple</b>, which fixes the type of each leading position
                while still accepting a variable number of arguments after
                them. This is what makes variadic tuple types useful in
                practice.
              </>
            }
            zh={
              <>
                rest 参数的类型是一个数组。它也可以是一个<b>元组</b> ——
                固定住前面几个位置各自的类型,同时仍然接受后面数量不定的实参。
                变长元组类型的实用价值就在这里。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title={{ en: "A rest parameter typed as a tuple", zh: "元组类型的 rest 参数" }}
          code={S2_TUPLE_REST}
          hl={[3]}
        />
      </Section>

      {/* ================= §03 函数类型与 void ================= */}
      <Section
        id="fntype"
        index="03"
        title={{
          en: "Function types: a function has a shape too",
          zh: "函数类型表达式:函数自己也有形状",
        }}
        desc={{
          en: "Functions are passed around as values, so the type system needs a way to say which functions are acceptable.",
          zh: "函数会作为值被传来传去,所以类型系统需要一种写法,说清「什么样的函数可以接受」。",
        }}
      >
        <CodeBlock
          lang="ts"
          title={{ en: "A function type expression", zh: "函数类型表达式" }}
          code={S3_FNTYPE}
        />
        <CodeBlock
          lang="ts"
          title={{ en: "A callback parameter", zh: "回调参数" }}
          code={S3_CALLBACK}
          hl={[4]}
        />

        <p className="sec-desc">
          <T
            en={
              <>
                Notice that the callback returns <code>void</code>. In a
                function type, <code>void</code> does not mean &quot;you must
                return nothing&quot;. It means{" "}
                <b>&quot;the caller ignores the return value&quot;</b>. A
                function that returns something is therefore still acceptable.
              </>
            }
            zh={
              <>
                注意那个回调的返回值写的是 <code>void</code>。
                在函数类型里,<code>void</code> 的意思不是「你不许返回任何东西」,
                而是<b>「返回什么调用方都不会用」</b>。
                所以一个真的返回了东西的函数,照样可以放进来。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title={{ en: "void accepts a returned value", zh: "void 接受有返回值的函数" }}
          code={S3_VOID}
          note={{
            en: (
              <>
                This is deliberate. A one-line arrow function returns the value
                of its expression whether you want it or not. If{" "}
                <code>(…) =&gt; void</code> rejected that, most{" "}
                <code>forEach</code> callbacks would have to be written with a
                block body just to throw the value away.
              </>
            ),
            zh: (
              <>
                这是有意设计的。单行箭头函数会把表达式的值返回出去,
                不管你要不要。如果 <code>(…) =&gt; void</code> 拒绝这种函数,
                大部分 <code>forEach</code> 回调都得改写成花括号函数体,
                只为了把那个值丢掉。
              </>
            ),
          }}
        />
        <CodeBlock
          lang="ts"
          title={{ en: "The other two meanings of void", zh: "void 的另外两种含义" }}
          code={S3_VOID_STRICT}
          note={{
            en: (
              <>
                Three cases, one keyword. <b>In a function type</b>,{" "}
                <code>void</code> is a promise by the caller not to look.{" "}
                <b>On a declaration</b>, it is a requirement on the function
                itself. <b>On a variable</b>, it is an ordinary type that only{" "}
                <code>undefined</code> satisfies.
              </>
            ),
            zh: (
              <>
                同一个关键字,三种情况。<b>写在函数类型里</b>,
                <code>void</code> 是调用方「我不看返回值」的承诺;
                <b>写在声明上</b>,它是对函数自身的要求;
                <b>写在变量上</b>,它就是一个普通类型,只有{" "}
                <code>undefined</code> 满足它。
              </>
            ),
          }}
        />
      </Section>

      {/* ================= §04 哪个函数放得进去 ================= */}
      <Section
        id="fit"
        index="04"
        title={{
          en: "Which function fits where another is expected",
          zh: "哪个函数放得进「要另一个函数」的位置",
        }}
        desc={{
          en: "Once functions have types, the compiler needs a rule for comparing them. The rule for return types and the rule for parameter types run in opposite directions.",
          zh: "函数有了类型,编译器就需要一套比较它们的规则。返回值方向和参数方向的规则,恰好相反。",
        }}
      >
        <CodeBlock
          lang="ts"
          title={{ en: "Return types: more specific is fine", zh: "返回值:更具体没问题" }}
          code={S4_RETURN}
          hl={[8]}
        />
        <p className="sec-desc">
          <T
            en={
              <>
                That direction is easy to accept: the caller asked for an{" "}
                <code>Animal</code> and got something that is an{" "}
                <code>Animal</code> plus more. Parameters work the other way,
                and this is where people get surprised.
              </>
            }
            zh={
              <>
                这个方向很好接受:调用方要一个 <code>Animal</code>,
                拿到的东西是 <code>Animal</code> 而且还多点别的。
                参数方向则正好反过来 —— 这里最容易让人意外。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title={{ en: "Parameters: more specific is rejected", zh: "参数:更具体会被拒绝" }}
          code={S4_PARAM}
          hl={[5]}
        />
        <p className="sec-desc">
          <T
            en={
              <>
                Read it from the caller&apos;s side. Something holding a{" "}
                <code>FeedAnimal</code> may call it with{" "}
                <i>any</i> animal, including a cat. A function that reads{" "}
                <code>d.breed</code> would then fail. So the compiler rejects
                it. Checking parameters in this reversed direction is called{" "}
                <b>contravariance</b>, and it is switched on by the{" "}
                <code>strictFunctionTypes</code> flag, which{" "}
                <code>strict</code> turns on.
              </>
            }
            zh={
              <>
                从调用方的角度读一遍。持有 <code>FeedAnimal</code> 的那段代码,
                可以拿<i>任意</i>一只动物来调用它,比如一只猫。
                而一个要读 <code>d.breed</code> 的函数这时就会出错,
                所以编译器把它拦下。参数按这种反方向检查,叫做
                <b>逆变(contravariance)</b>,由{" "}
                <code>strictFunctionTypes</code> 开关控制,而{" "}
                <code>strict</code> 会打开它。
              </>
            }
          />
        </p>

        <Callout
          tone="deep"
          title={{
            en: "The exception: methods are still checked in both directions",
            zh: "例外:方法语法仍然是双向检查的",
          }}
        >
          <p>
            <T
              en={
                <>
                  <code>strictFunctionTypes</code> only applies to function{" "}
                  <b>type</b> positions. A member declared with{" "}
                  <b>method syntax</b> — <code>feed(a: Animal): void</code>{" "}
                  rather than <code>feed: (a: Animal) =&gt; void</code> — keeps
                  the older rule, where the parameter may go in either
                  direction. That is called <b>bivariance</b>.
                </>
              }
              zh={
                <>
                  <code>strictFunctionTypes</code> 只作用于函数
                  <b>类型</b>所在的位置。用<b>方法语法</b>声明的成员 ——
                  也就是写成 <code>feed(a: Animal): void</code> 而不是{" "}
                  <code>feed: (a: Animal) =&gt; void</code> ——
                  沿用的还是旧规则:参数往哪个方向都放得进去。
                  这叫<b>双变(bivariance)</b>。
                </>
              }
            />
          </p>
          <CodeBlock
            lang="ts"
            title={{ en: "Method syntax versus property syntax", zh: "方法语法 vs 属性语法" }}
            code={S4_BIVARIANT}
            hl={[4, 8, 15]}
          />
          <p>
            <T
              en={
                <>
                  This is a known and <b>deliberate unsoundness</b>. It is not
                  a rule that happens to be safe. The last two lines above
                  compile and then put a plain <code>Animal</code> into an
                  array that is really a <code>Dog[]</code>. TypeScript accepts
                  it because rejecting it would break{" "}
                  <code>Array&lt;Dog&gt;</code> being usable as{" "}
                  <code>Array&lt;Animal&gt;</code>, along with a large amount
                  of existing JavaScript. The team chose usability over
                  soundness here, and documented the choice.
                </>
              }
              zh={
                <>
                  这是一处已知的、<b>刻意保留的不健全</b>,
                  而不是「恰好安全」的规则。上面最后两行能编译通过,
                  然后把一个普通 <code>Animal</code> 塞进了一个实际上是{" "}
                  <code>Dog[]</code> 的数组里。TypeScript 之所以接受,
                  是因为拒绝它就等于让 <code>Array&lt;Dog&gt;</code>{" "}
                  不能当作 <code>Array&lt;Animal&gt;</code> 使用,
                  同时废掉大量现存的 JavaScript 写法。
                  官方在这里选择了可用性而不是健全性,并且把这个取舍写进了文档。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  What to do with this: if you want the strict check on a
                  member of an interface, declare it with property syntax. If
                  you are wondering why an assignment you expected to fail was
                  accepted, check whether method syntax is involved.
                </>
              }
              zh={
                <>
                  实际怎么用:想让 interface 的某个成员走严格检查,
                  就用属性语法声明它。反过来,当某个你以为会报错的赋值被放行时,
                  先看一眼是不是方法语法。
                </>
              }
            />
          </p>
        </Callout>

        <p className="sec-desc">
          <T
            en={
              <>
                One more rule surprises almost everyone:{" "}
                <b>
                  a function with fewer parameters fits where one with more
                  parameters is expected.
                </b>
              </>
            }
            zh={
              <>
                还有一条几乎人人都觉得意外的规则:
                <b>参数更少的函数,可以放进「要求参数更多」的位置。</b>
              </>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title={{ en: "Fewer parameters is allowed", zh: "参数少反而可以" }}
          code={S4_ARITY}
          hl={[2, 9]}
        />
        <Callout
          tone="idea"
          title={{
            en: "Why array.map(x => x) works",
            zh: "为什么 array.map(x => x) 能通过",
          }}
        >
          <p>
            <T
              en={
                <>
                  <code>map</code> calls its callback with three arguments, but
                  you almost always write a callback that takes one. In
                  JavaScript, extra arguments are simply ignored, so a callback
                  that declares fewer parameters is always safe to call. The
                  type system allows exactly what the language already allows.
                </>
              }
              zh={
                <>
                  <code>map</code> 调用回调时会传三个实参,
                  而你几乎总是只写一个参数的回调。在 JavaScript 里,
                  多余的实参会被直接忽略,所以「声明的参数更少」的回调
                  永远可以安全调用。类型系统允许的,正是语言本来就允许的。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  The reverse is not safe. A callback that declares a fourth
                  parameter would read an argument nobody passes, so the
                  compiler rejects it.
                </>
              }
              zh={
                <>
                  反过来就不安全了。声明了第四个参数的回调,
                  会去读一个根本没人传的实参,所以编译器把它拦下。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §05 重载与 this ================= */}
      <Section
        id="more"
        index="05"
        title={{
          en: "Overloads and the this parameter",
          zh: "重载与 this 参数",
        }}
        desc={{
          en: "Two more things a signature can express. You will meet both while reading the types of third-party libraries.",
          zh: "签名还能表达两件事。读第三方库的类型时,这两样都会撞见。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                Some functions behave differently depending on what you pass:
                give them a string and one thing comes back, give them an array
                and something else comes back. You can describe that with
                several <b>overload signatures</b> followed by one{" "}
                <b>implementation signature</b>.
              </>
            }
            zh={
              <>
                有的函数会根据传进来的东西表现不同:传字符串还回来一种结果,
                传数组还回来另一种。这可以用几条<b>重载签名</b>加一条
                <b>实现签名</b>来描述。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title={{ en: "Overload signatures", zh: "重载签名" }}
          code={S5_OVERLOAD}
          hl={[2, 3, 4]}
        />
        <Callout
          tone="warn"
          title={{
            en: "Two rules people get wrong",
            zh: "两条最容易记错的规则",
          }}
        >
          <p>
            <T
              en={
                <>
                  First: the <b>implementation signature is not callable from
                  outside</b>. It only has to be compatible with every overload
                  above it. In the example, <code>price</code> is implemented
                  for <code>string | string[]</code>, but calling it with a{" "}
                  <code>string | string[]</code> value is an error, because
                  neither overload accepts that type.
                </>
              }
              zh={
                <>
                  第一条:<b>实现签名不能从外部调用</b>。
                  它只需要和上面每一条重载都兼容。例子里 <code>price</code>{" "}
                  的实现接受 <code>string | string[]</code>,
                  但拿一个 <code>string | string[]</code> 的值去调用它却会报错,
                  因为两条重载谁都不接受这个类型。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Second: TypeScript picks the <b>first overload that
                  matches</b>, in the order you wrote them. It does not look
                  for the best match. So overload order is part of the API:
                  write the more specific signatures first.
                </>
              }
              zh={
                <>
                  第二条:TypeScript 按你书写的顺序,取<b>第一条匹配上的重载</b>,
                  而不是去找「最合适的那条」。所以重载的顺序是 API 的一部分:
                  越具体的签名越要写在前面。
                </>
              }
            />
          </p>
          <CodeBlock
            lang="ts"
            title={{ en: "Order changes the result", zh: "顺序会改变结果" }}
            code={S5_ORDER}
            hl={[6, 13]}
          />
        </Callout>

        <p className="sec-desc">
          <T
            en={
              <>
                The other extra is a parameter named <code>this</code>. It is
                not a real parameter. It tells the compiler what{" "}
                <code>this</code> must be when the function runs.
              </>
            }
            zh={
              <>
                另一件事是一个名字叫 <code>this</code> 的参数。
                它不是真的参数,而是告诉编译器:这个函数运行时,
                <code>this</code> 必须是什么。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title={{ en: "The this parameter", zh: "this 参数" }}
          code={S5_THIS}
          hl={[7, 18]}
          note={{
            en: (
              <>
                The <code>this</code> parameter is erased along with every
                other type, so the compiled JavaScript has a one-parameter
                function. It changes nothing at runtime. It only lets the
                compiler reject a call where <code>this</code> would be wrong.
              </>
            ),
            zh: (
              <>
                <code>this</code> 参数和其他类型一起被擦除,
                编译出来的 JavaScript 里是一个单参数函数。
                它在运行时不改变任何东西,只是让编译器能拦下那些{" "}
                <code>this</code> 会出错的调用。
              </>
            ),
          }}
        />

        <Callout
          tone="idea"
          title={{
            en: "A signature can also narrow a type",
            zh: "签名还能用来收窄类型",
          }}
        >
          <p>
            <T
              en={
                <>
                  A return type can be written as{" "}
                  <code>x is Dog</code> or <code>asserts x is Dog</code>. Those
                  are type predicates and assertion signatures: signatures that
                  tell the compiler what a check has proved. They belong with
                  narrowing, so chapter 03 covers them.
                </>
              }
              zh={
                <>
                  返回值类型还可以写成 <code>x is Dog</code> 或{" "}
                  <code>asserts x is Dog</code>。
                  这是类型谓词和断言签名 ——
                  用签名告诉编译器「这次检查证明了什么」。
                  它们属于收窄的范畴,03 章会讲。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 对象类型进阶 ================= */}
      <Section
        id="objects"
        index="06"
        title={{
          en: "Object types: optional, readonly, index signatures",
          zh: "对象类型进阶:可选、readonly、索引签名",
        }}
        desc={{
          en: "Chapter 01 gave objects a basic shape. Three modifiers extend it: which fields may be missing, which may not be changed, and what to do when the keys are not known in advance.",
          zh: "01 章给对象标过基本形状。这里再加三个修饰:哪些字段可以没有、哪些不许改、键事先不知道时怎么办。",
        }}
      >
        <CodeBlock lang="ts" title="menu-item.ts" code={S6_OBJ} hl={[2, 5]} />

        <Callout
          tone="deep"
          title={{
            en: "readonly is a compile-time check, not a lock",
            zh: "readonly 是编译期检查,不是锁",
          }}
        >
          <p>
            <T
              en={
                <>
                  <code>readonly</code> stops you at <b>compile time</b> only.
                  It leaves no trace in the emitted JavaScript, so at runtime
                  the property can still be written. For a real runtime freeze
                  you need <code>Object.freeze</code>. The compile-time check
                  is still worth having: it catches the accidental writes,
                  which are almost all of them.
                </>
              }
              zh={
                <>
                  <code>readonly</code> 只在<b>编译期</b>拦你。
                  它在产出的 JavaScript 里不留任何痕迹,
                  所以运行时这个属性照样能写。想要真正的运行时冻结,
                  得用 <code>Object.freeze</code>。
                  但编译期这道检查依然值得要:误改几乎都被它挡住了。
                </>
              }
            />
          </p>
        </Callout>

        <p className="sec-desc">
          <T
            en={
              <>
                Sometimes you cannot list the <b>keys</b> in advance. A stock
                table may get any SKU tomorrow. An{" "}
                <b>index signature</b> describes only the type of the keys and
                the type of the values.
              </>
            }
            zh={
              <>
                有时候<b>键</b>是事先列不出来的:库存表明天可能上任何一个新货号。
                这时用<b>索引签名(index signature)</b>,
                只约定键的类型和值的类型。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title={{ en: "An index signature", zh: "索引签名" }}
          code={S6_INDEX}
          hl={[4]}
        />
        <Callout
          tone="idea"
          title={{
            en: "When to use an index signature",
            zh: "什么时候该用索引签名",
          }}
        >
          <p>
            <T
              en={
                <>
                  If you can write the field names out, write them out. The
                  compiler then checks your spelling. Use an index signature
                  only when the keys are decided at <b>runtime</b>: SKUs, user
                  input, a dictionary built from data. It is more permissive,
                  and the cost of that is exactly the spelling check you just
                  gave up.
                </>
              }
              zh={
                <>
                  字段名写得全,就老老实实一个个写出来,编译器会帮你查拼写。
                  只有当键是<b>运行时</b>才定的 ——
                  货号、用户输入、由数据拼出来的字典 —— 才用索引签名。
                  它更宽松,代价正是你刚刚放弃的那道拼写检查。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §07 interface vs type ================= */}
      <Section
        id="ivt"
        index="07"
        title={{
          en: "interface vs type: a smaller difference than you have heard",
          zh: "interface vs type:一场被夸大的战争",
        }}
        desc={{
          en: "Both describe the shape of an object, and in most cases they are interchangeable. Here is the syntax side by side, then the abilities that only one of them has.",
          zh: "两者都能描述对象形状,大部分场景可以互换。先看语法对照,再说清各自独有的能力。",
        }}
      >
        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title={{ en: "With interface", zh: "interface 写法" }}
              code={S7_IFACE}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title={{ en: "With type", zh: "type 写法" }}
              code={S7_TYPE}
            />
          }
        />

        <p className="sec-desc">
          <T
            en={
              <>
                The right side uses <code>&amp;</code>, an{" "}
                <b>intersection type</b>. It is worth a closer look, because
                the next chapter contrasts it with unions.
              </>
            }
            zh={
              <>
                右边用的 <code>&amp;</code> 是<b>交叉类型</b>。
                值得单独看一眼,因为下一章会拿它和联合类型作对比。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="ts"
          title={{ en: "Intersection types", zh: "交叉类型" }}
          code={S7_INTERSECT}
          hl={[5]}
        />
        <CodeBlock
          lang="ts"
          title={{
            en: "extends reports a conflict, & does not",
            zh: "冲突时 extends 报错,& 不报",
          }}
          code={S7_CONFLICT}
          note={{
            en: (
              <>
                An intersection of two conflicting property types is reduced to{" "}
                <code>never</code> without an error at the declaration, so the
                problem only shows up later, at the place that tries to use the
                property. That is the practical reason to prefer{" "}
                <code>extends</code> when you are extending an object type.
              </>
            ),
            zh: (
              <>
                两个冲突的属性类型交叉之后会被归约成 <code>never</code>,
                声明处并不报错,问题要到后面真正使用这个属性的地方才暴露。
                这就是「扩展对象类型时优先用 <code>extends</code>」的实际理由。
              </>
            ),
          }}
        />

        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Ability" zh="能力" />
                </th>
                <th>interface</th>
                <th>type</th>
                <th>
                  <T en="Notes" zh="备注" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <T en="Describe an object shape" zh="描述对象形状" />
                </td>
                <td><span className="fn-yes">✓</span></td>
                <td><span className="fn-yes">✓</span></td>
                <td>
                  <T
                    en="Most everyday code. Either one works."
                    zh="日常九成场景,两个都行"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Extend an existing shape" zh="扩展已有形状" />
                </td>
                <td><code>extends</code></td>
                <td>
                  <code>&amp;</code>
                </td>
                <td>
                  <T
                    en="extends reports a conflict at the declaration"
                    zh="extends 会在声明处就报出冲突"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T
                    en="Merge two declarations of the same name"
                    zh="同名声明自动合并"
                  />
                </td>
                <td>
                  <span className="fn-yes">
                    ✓ <T en="only interface" zh="独有" />
                  </span>
                </td>
                <td>
                  <span className="fn-no">
                    ✕ <T en="duplicate identifier" zh="重名报错" />
                  </span>
                </td>
                <td>
                  <T
                    en="declaration merging, used to extend global types"
                    zh="declaration merging,扩全局类型靠它"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Union" zh="联合类型" /> (
                  <code>&quot;s&quot; | &quot;m&quot;</code>)
                </td>
                <td><span className="fn-no">✕</span></td>
                <td>
                  <span className="fn-yes">
                    ✓ <T en="only type" zh="独有" />
                  </span>
                </td>
                <td>
                  <T
                    en="Only type can express one out of several"
                    zh="「N 选一」只有 type 写得出"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T
                    en="Mapped and conditional types"
                    zh="映射类型 / 条件类型"
                  />
                </td>
                <td><span className="fn-no">✕</span></td>
                <td>
                  <span className="fn-yes">
                    ✓ <T en="only type" zh="独有" />
                  </span>
                </td>
                <td>
                  <T
                    en="Type-level programming, chapters 06 and 07"
                    zh="类型编程(06 / 07 章)全在 type 侧"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock
          lang="ts"
          title={{
            en: "Only interface: declaration merging",
            zh: "interface 的独门:declaration merging",
          }}
          code={S7_MERGE}
          hl={[11, 12, 13]}
        />
        <CodeBlock
          lang="ts"
          title={{
            en: "Only type: unions and mapped types",
            zh: "type 的独门:union 与映射类型",
          }}
          code={S7_TYPE_ONLY}
        />

        <Callout
          tone="idea"
          title={{
            en: "So which one should you use?",
            zh: "到底该选哪个?",
          }}
        >
          <p>
            <T
              en={
                <>
                  The current advice in the TypeScript handbook is plain: pick
                  either one and stay consistent within a codebase. If you need
                  a union or a mapped type, only <code>type</code> can express
                  it. If you are writing a library and want users to be able to
                  extend a declaration, use <code>interface</code>. The claim
                  that <code>interface</code> is always faster to compile is
                  not a rule you should base a decision on.
                </>
              }
              zh={
                <>
                  TypeScript handbook 现行的建议很朴素:
                  两个随便挑一个,在同一个代码库里保持一致。
                  需要联合类型或映射类型时,只有 <code>type</code> 写得出来;
                  写库、并且希望使用者能扩展你的声明时,用{" "}
                  <code>interface</code>。至于「<code>interface</code>{" "}
                  编译一定更快」这种说法,不足以作为选型依据。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §08 奶茶店实战 ================= */}
      <Section
        id="shop"
        index="08"
        title={{
          en: "Putting it together: the full makeOrder",
          zh: "奶茶店实战:makeOrder 的完整签名",
        }}
        desc={{
          en: "One function that uses most of this chapter: a literal union, an interface, readonly, a default value, and an explicit return type.",
          zh: "一个函数用上这一章的大部分内容:字面量联合、interface、readonly、默认值、显式返回值类型。",
        }}
      >
        <CodeBlock
          lang="ts"
          title="tea-shop.ts"
          code={S8_FULL}
          hl={[17, 18, 19, 20, 21]}
          note={{
            en: (
              <>
                The highlighted signature is the one from the top of this
                chapter. Note that <code>toppings</code> uses a{" "}
                <b>default value</b> instead of <code>?</code>. Inside the
                body its type is <code>Topping[]</code>, never{" "}
                <code>undefined</code>, so <code>toppings.length</code> needs
                no check.
              </>
            ),
            zh: (
              <>
                高亮的这段签名就是本章开头那一份。注意 <code>toppings</code>{" "}
                这次用的是<b>默认值</b>而不是 <code>?</code>:
                函数体里它的类型就是 <code>Topping[]</code>,不含{" "}
                <code>undefined</code>,所以 <code>toppings.length</code>{" "}
                不需要任何检查。
              </>
            ),
          }}
        />

        <p className="sec-desc">
          <T
            en={
              <>
                The signature is fixed. Now you play the compiler. For each of
                the six calls below, guess whether it compiles, then read what
                the compiler actually says.
              </>
            }
            zh={
              <>
                签名定下来了,现在换你当编译器。下面六种调用,
                先猜「能不能通过」,再看编译器的原话。
              </>
            }
          />
        </p>
        <CallCheck />

        <Callout
          tone="story"
          title={{
            en: "This shop appears again",
            zh: "这家店后面还会出现",
          }}
        >
          <p>
            <T
              en={
                <>
                  In chapter 03 this <code>Order</code> grows a status field:
                  pending, paid, delivered. Written as a discriminated union,
                  it lets the compiler work out which fields exist in each
                  branch on its own.
                </>
              }
              zh={
                <>
                  03 章里,这个 <code>Order</code> 会长出一个状态字段:
                  pending、paid、delivered。
                  写成可辨识联合之后,编译器就能在每个分支里自己算出有哪些字段。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §09 动手任务 ================= */}
      <Section
        id="labs"
        index="09"
        title={{ en: "Practice", zh: "动手任务" }}
        desc={{
          en: "Signatures are learned by writing them and reading the errors. Four tasks, all of which fit in the TypeScript Playground.",
          zh: "签名这东西,看十遍不如亲手写一遍、报错一遍。四个任务,TypeScript Playground 就够。",
        }}
      >
        <LabSet ch="functions" items={LABS} />
      </Section>

      {/* ================= §10 通关测验 ================= */}
      <Section
        id="quiz"
        index="10"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Eleven questions on parameters, void, assignability, overloads, readonly, and interface vs type. A perfect score lights up the sidebar.",
          zh: "十一道题,覆盖参数、void、可赋值性、重载、readonly 和 interface vs type。全对点亮侧栏绿灯。",
        }}
      >
        <Quiz ch="functions" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                Parameter types are usually required, return types are usually
                inferred. Write the return type at a public boundary, and
                whenever you want a mistake reported at the definition instead
                of at some distant call site. It also stops <code>any</code>{" "}
                from leaking out of the function.
              </>
            ),
            zh: (
              <>
                参数类型通常必须写,返回值类型通常靠推断。
                对外边界上要写,想让错误报在定义处而不是很远的调用处时也要写。
                它同时能挡住 <code>any</code> 从函数里漏出去。
              </>
            ),
          },
          {
            en: (
              <>
                <code>?</code> lets the caller leave an argument out, and the
                type inside the function becomes{" "}
                <code>| undefined</code>. A default value also lets the caller
                leave it out, but the type inside the function does{" "}
                <b>not</b> include <code>undefined</code>. Optional parameters
                must come last. A rest parameter is an array, or a tuple.
              </>
            ),
            zh: (
              <>
                <code>?</code> 让调用方可以不写这个实参,
                而函数体里的类型会带上 <code>| undefined</code>。
                默认值同样允许不写,但函数体里的类型<b>不含</b>{" "}
                <code>undefined</code>。可选参数必须排在最后。
                rest 参数是数组,也可以是元组。
              </>
            ),
          },
          {
            en: (
              <>
                <code>void</code> in a function type means the caller ignores
                the return value, so a function that returns something still
                fits. <code>void</code> on a declaration forbids returning a
                value. A variable of type <code>void</code> accepts only{" "}
                <code>undefined</code>.
              </>
            ),
            zh: (
              <>
                函数类型里的 <code>void</code> 表示调用方不看返回值,
                所以真的返回了东西的函数照样放得进去;
                声明上的 <code>void</code> 则禁止返回值;
                类型为 <code>void</code> 的变量只接受 <code>undefined</code>。
              </>
            ),
          },
          {
            en: (
              <>
                Return types are checked covariantly: returning{" "}
                <code>Dog</code> fits where <code>Animal</code> is expected.
                Parameters are checked contravariantly under{" "}
                <code>strictFunctionTypes</code> — except for members written
                with method syntax, which stay bivariant. That exception is a
                deliberate unsoundness, and it is why{" "}
                <code>Array&lt;Dog&gt;</code> is assignable to{" "}
                <code>Array&lt;Animal&gt;</code>.
              </>
            ),
            zh: (
              <>
                返回值按协变检查:返回 <code>Dog</code> 可以放进「要{" "}
                <code>Animal</code>」的位置。参数在{" "}
                <code>strictFunctionTypes</code> 下按逆变检查 ——
                但用方法语法写的成员是例外,仍然双变。
                这个例外是刻意保留的不健全,也正是{" "}
                <code>Array&lt;Dog&gt;</code> 能赋给{" "}
                <code>Array&lt;Animal&gt;</code> 的原因。
              </>
            ),
          },
          {
            en: (
              <>
                A function with fewer parameters fits where one with more is
                expected, because JavaScript ignores extra arguments. That is
                why <code>array.map(x =&gt; x)</code> compiles. Declaring{" "}
                <i>more</i> parameters than the target provides is rejected.
              </>
            ),
            zh: (
              <>
                参数更少的函数可以放进「要求参数更多」的位置,
                因为 JavaScript 本来就会忽略多余的实参 —— 这就是{" "}
                <code>array.map(x =&gt; x)</code> 能编译的原因。
                反过来,声明的参数比目标提供的<i>还多</i>,会被拒绝。
              </>
            ),
          },
          {
            en: (
              <>
                With overloads, the implementation signature cannot be called
                from outside, and TypeScript takes the{" "}
                <b>first matching</b> overload in source order rather than the
                best one. A <code>this</code> parameter is erased at compile
                time; arrow functions cannot have one.
              </>
            ),
            zh: (
              <>
                重载里,实现签名不能从外部调用;
                TypeScript 按书写顺序取<b>第一条匹配</b>的重载,
                而不是最合适的那条。<code>this</code> 参数在编译期被擦除,
                箭头函数不能声明它。
              </>
            ),
          },
          {
            en: (
              <>
                Object types take three modifiers: <code>?</code> for a field
                that may be missing, <code>readonly</code> for a
                compile-time-only write check, and{" "}
                <code>[key: string]: T</code> for keys that are only known at
                runtime.
              </>
            ),
            zh: (
              <>
                对象类型有三个修饰:<code>?</code> 表示字段可以没有,
                <code>readonly</code> 是只在编译期生效的写入检查,
                <code>[key: string]: T</code> 对付「键要到运行时才知道」的场景。
              </>
            ),
          },
          {
            en: (
              <>
                <code>interface</code> and <code>type</code> are
                interchangeable most of the time. Unions and mapped types need{" "}
                <code>type</code>; declaration merging needs{" "}
                <code>interface</code>. <code>A &amp; B</code> is an
                intersection: one value that satisfies both at once.
              </>
            ),
            zh: (
              <>
                <code>interface</code> 和 <code>type</code>{" "}
                大部分时候可以互换。联合类型和映射类型只能用{" "}
                <code>type</code>;declaration merging 只有{" "}
                <code>interface</code> 有。<code>A &amp; B</code> 是交叉类型:
                一个同时满足两边的值。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="functions" />
    </main>
  );
}
