"use client";

// 09 · Modules and declaration files(双语:正文用 <T en zh />,组件 props 用 { en, zh })——
// 模块作用域与 import 携带什么 → .d.ts 本体 → 类型的三个来源 →
// declare 家族与模块扩充 → 实战:给 boba-sdk 写声明 → 动手任务 → 测验 → 要点。
//
// 代码示例:可执行行在两种语言里逐字节相同,只有注释分 en / zh,
// 因此 hl 行号在两种语言下一致。编译器报错原文一律不翻译。
// 所有报错码、报错文案、生成产物与运行时行为均已用 tsc 5.9.3 + Node 22 实测核对:
// TS2451 / TS1484 / TS1205 / TS1259 / TS7016 / TS2307 / TS2669 / TS2665 /
// TS1183 / TS2584 / TS2835 / ERR_MODULE_NOT_FOUND。

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
import { LABS, QUIZ } from "@/lib/modules-data";
import { ManualHero, LibShelf, ErasedImports, TypeQuest } from "./viz";

/* ---------- §01 module scope ---------- */

const S1_SCOPE: Loc<string> = {
  en: `// a.ts — no import, no export, so this file is a script
const TAX = 0.06;

// b.ts — also a script
const TAX = 0.08;
// error TS2451: Cannot redeclare block-scoped variable 'TAX'.
// Both declarations landed in the same global scope.

// b.ts, fixed — one export is enough to make it a module
export {};
const TAX = 0.08;   // this TAX now belongs to b.ts alone`,
  zh: `// a.ts —— 没有 import,没有 export,所以这个文件是脚本
const TAX = 0.06;

// b.ts —— 同样是脚本
const TAX = 0.08;
// error TS2451: Cannot redeclare block-scoped variable 'TAX'.
// 两个声明落在了同一个全局作用域里。

// b.ts,修好之后 —— 一句导出就足以让它成为模块
export {};
const TAX = 0.08;   // 这个 TAX 现在只属于 b.ts`,
};

const S1_ESM: Loc<string> = {
  en: `console.log("main starts");
import "./dep.mjs";         // dep.mjs logs "dep body runs"
console.log("main ends");

// output:
//   dep body runs
//   main starts
//   main ends
// The import was hoisted. dep.mjs ran before
// the first line of this file.`,
  zh: `console.log("main starts");
import "./dep.mjs";         // dep.mjs 会打印 "dep body runs"
console.log("main ends");

// 输出:
//   dep body runs
//   main starts
//   main ends
// import 被提升了。dep.mjs 在这个文件的
// 第一行之前就已经运行完。`,
};

const S1_CJS: Loc<string> = {
  en: `console.log("main starts");
require("./dep.cjs");       // dep.cjs logs "dep body runs"
console.log("main ends");

// output:
//   main starts
//   dep body runs
//   main ends
// require ran at the point where it is
// written, like any other function call.`,
  zh: `console.log("main starts");
require("./dep.cjs");       // dep.cjs 会打印 "dep body runs"
console.log("main ends");

// 输出:
//   main starts
//   dep body runs
//   main ends
// require 在它被写下的位置执行,
// 和任何一次普通函数调用一样。`,
};

const S1_INTEROP: Loc<string> = {
  en: `// legacy-cjs/index.js    module.exports = function stir(times) { … }
// legacy-cjs/index.d.ts  declare function stir(times: number): number;
//                        export = stir;

import stir from "legacy-cjs";

// Without esModuleInterop:
// error TS1259: Module '"…/legacy-cjs/index"' can only be
//   default-imported using the 'esModuleInterop' flag

// With esModuleInterop, the emitted CommonJS is:
//   const legacy_cjs_1 = __importDefault(require("legacy-cjs"));
//   console.log((0, legacy_cjs_1.default)(3));
// __importDefault wraps a non-ESM export in { default: … }.`,
  zh: `// legacy-cjs/index.js    module.exports = function stir(times) { … }
// legacy-cjs/index.d.ts  declare function stir(times: number): number;
//                        export = stir;

import stir from "legacy-cjs";

// 不开 esModuleInterop 时:
// error TS1259: Module '"…/legacy-cjs/index"' can only be
//   default-imported using the 'esModuleInterop' flag

// 开了 esModuleInterop,编译出的 CommonJS 是:
//   const legacy_cjs_1 = __importDefault(require("legacy-cjs"));
//   console.log((0, legacy_cjs_1.default)(3));
// __importDefault 把非 ESM 的导出包成 { default: … }。`,
};

const S1_ORDER: Loc<string> = {
  en: `// ---- order.ts ----
export interface Order {           // a type can be exported too
  id: string;
  size: "small" | "medium" | "large";
  total: number;
}
export const TAX = 0.06;           // a named export, and a value
export default function createOrder(): Order {
  return { id: "MT-1", size: "medium", total: 15 };
}                                  // the default export: one per file

// ---- shop.ts ----
import createOrder, { TAX, type Order } from "./order";

const o: Order = createOrder();    // Order is used as a type
const withTax = o.total * (1 + TAX); // TAX is used as a value`,
  zh: `// ---- order.ts ----
export interface Order {           // 类型也可以导出
  id: string;
  size: "small" | "medium" | "large";
  total: number;
}
export const TAX = 0.06;           // 具名导出,而且是一个值
export default function createOrder(): Order {
  return { id: "MT-1", size: "medium", total: 15 };
}                                  // 默认导出:一个文件只能有一个

// ---- shop.ts ----
import createOrder, { TAX, type Order } from "./order";

const o: Order = createOrder();    // Order 当类型用
const withTax = o.total * (1 + TAX); // TAX 当值用`,
};

const S1_TYPE_FORMS: Loc<string> = {
  en: `// three separate forms, shown together for comparison
import type { Order } from "./order";      // the line carries types only
import { TAX, type Order } from "./order"; // one value and one type
export type { Order } from "./order";      // re-export, types only`,
  zh: `// 三种独立的写法,放在一起对照
import type { Order } from "./order";      // 这一行只带类型
import { TAX, type Order } from "./order"; // 一个值加一个类型
export type { Order } from "./order";      // 转手导出,只出类型`,
};

const S1_CIRCULAR: Loc<string> = {
  en: `// a.js
import { B } from "./b.js";
export const A = "A";

// b.js
import { A } from "./a.js";
export const B = "B";
console.log(A);
// ReferenceError: Cannot access 'A' before initialization
// a.js started first and had not reached its own
// export line yet when b.js read the binding.
// The type checker reports nothing here.`,
  zh: `// a.js
import { B } from "./b.js";
export const A = "A";

// b.js
import { A } from "./a.js";
export const B = "B";
console.log(A);
// ReferenceError: Cannot access 'A' before initialization
// a.js 先开始执行,b.js 读这个绑定的时候,
// a.js 还没走到自己的导出那一行。
// 类型检查在这里什么都不会报。`,
};

/* ---------- §02 .d.ts ---------- */

const S2_SRC: Loc<string> = {
  en: `export const TAX = 0.06;

export interface Order {
  id: string;
  total: number;
}

export function createOrder(
  items: string[],
): { id: string; total: number } {
  const total =
    items.length * 15 * (1 + TAX);
  return {
    id: "MT-" + Date.now(),
    total,
  };
}`,
  zh: `export const TAX = 0.06;

export interface Order {
  id: string;
  total: number;
}

export function createOrder(
  items: string[],
): { id: string; total: number } {
  const total =
    items.length * 15 * (1 + TAX);
  return {
    id: "MT-" + Date.now(),
    total,
  };
}`,
};

const S2_DTS: Loc<string> = {
  en: `export declare const TAX = 0.06;
export interface Order {
    id: string;
    total: number;
}
export declare function createOrder(items: string[]): {
    id: string;
    total: number;
};

// No function body anywhere: only shapes.
// The interface came across unchanged,
// because it was already types only.
// Produced by:
//   npx tsc order.ts --declaration`,
  zh: `export declare const TAX = 0.06;
export interface Order {
    id: string;
    total: number;
}
export declare function createOrder(items: string[]): {
    id: string;
    total: number;
};

// 全文没有一个函数体,只有形状。
// interface 被原样搬了过来,
// 因为它本来就只有类型。
// 生成命令:
//   npx tsc order.ts --declaration`,
};

const S2_LIBDOM = `declare var document: Document;

declare function fetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response>;`;

/* ---------- §03 three sources ---------- */

const S3_PKG = `{
  "name": "boba-ui",
  "version": "3.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  }
}`;

const S3_INSTALL: Loc<string> = {
  en: `# community declarations for lodash
# -D because types are only needed while compiling
npm i -D @types/lodash

# declarations for Node's built-in APIs: fs, path, process…
npm i -D @types/node`,
  zh: `# lodash 的社区声明
# 用 -D,因为类型只在编译期需要
npm i -D @types/lodash

# Node 内置 API 的声明:fs、path、process…
npm i -D @types/node`,
};

const S3_RESOLUTION = `{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler",
    "paths": { "@/*": ["./*"] }
  }
}`;

/* ---------- §04 declare ---------- */

const S4_GLOBALS: Loc<string> = {
  en: `// a global constant injected by the build tool (Vite's define, for example)
declare const BUILD_TIME: string;

// a global function loaded by a <script> tag, such as an analytics script
declare function gtag(
  command: string,
  ...args: unknown[]
): void;

// a whole module that ships no types of its own
declare module "legacy-lib" {
  export function stir(times: number): void;
}`,
  zh: `// 构建工具注入的全局常量(例如 Vite 的 define)
declare const BUILD_TIME: string;

// 由 <script> 标签加载进来的全局函数,比如统计脚本
declare function gtag(
  command: string,
  ...args: unknown[]
): void;

// 一整个自己不带类型的模块
declare module "legacy-lib" {
  export function stir(times: number): void;
}`,
};

const S4_WINDOW: Loc<string> = {
  en: `// One export makes this file a module. declare global needs that.
export {};

declare global {
  interface Window {
    __SHOP_CONFIG__: { city: string; vip: boolean };
  }
}

// From then on, in any file:
//   window.__SHOP_CONFIG__.city   typed, with completion`,
  zh: `// 一句导出让这个文件成为模块。declare global 需要这个前提。
export {};

declare global {
  interface Window {
    __SHOP_CONFIG__: { city: string; vip: boolean };
  }
}

// 从此在任何文件里:
//   window.__SHOP_CONFIG__.city   有类型,有补全`,
};

const S4_AUGMENT: Loc<string> = {
  en: `// boba-ui ships its own types, including: interface Theme { accent: string }
// This file has a top-level import, so it is a module.
// Inside a module, declare module means "add to that module's types".
import "boba-ui";

declare module "boba-ui" {
  interface Theme {
    radius: number;      // added to the library's own Theme
  }
}

// render({ accent: "#0f0", radius: 8 })  now accepted
// Without the augmentation:
// error TS2353: Object literal may only specify known
//   properties, and 'radius' does not exist in type 'Theme'.`,
  zh: `// boba-ui 自带类型,其中有:interface Theme { accent: string }
// 这个文件有顶层 import,所以它是模块。
// 在模块里,declare module 的含义是「往那个模块的类型上追加」。
import "boba-ui";

declare module "boba-ui" {
  interface Theme {
    radius: number;      // 追加到库自己的 Theme 上
  }
}

// render({ accent: "#0f0", radius: 8 })  现在通过
// 不写这段扩充的话:
// error TS2353: Object literal may only specify known
//   properties, and 'radius' does not exist in type 'Theme'.`,
};

/* ---------- §05 boba-sdk ---------- */

const S5_CRASH: Loc<string> = {
  en: `import { fetchMenu, order } from "boba-sdk";
// error TS7016: Could not find a declaration file for
//   module 'boba-sdk'.
//   '…/node_modules/boba-sdk/index.js' implicitly has
//   an 'any' type.
//   Try \`npm i --save-dev @types/boba-sdk\` if it exists
//   or add a new declaration (.d.ts) file containing
//   \`declare module 'boba-sdk';\``,
  zh: `import { fetchMenu, order } from "boba-sdk";
// error TS7016: Could not find a declaration file for
//   module 'boba-sdk'.
//   '…/node_modules/boba-sdk/index.js' implicitly has
//   an 'any' type.
//   Try \`npm i --save-dev @types/boba-sdk\` if it exists
//   or add a new declaration (.d.ts) file containing
//   \`declare module 'boba-sdk';\``,
};

const S5_V0: Loc<string> = {
  en: `declare module "boba-sdk";
// The error is gone, and so is every type. The whole
// module is any now, so nothing about it is checked.
// This is a first step, not a finished job.`,
  zh: `declare module "boba-sdk";
// 报错消失了,类型也一起消失了。整个模块现在是 any,
// 关于它的任何东西都不会被检查。
// 这是第一步,不是终点。`,
};

const S5_V1: Loc<string> = {
  en: `declare module "boba-sdk" {
  export interface MenuItem {
    name: string;
    price: number;
    soldOut?: boolean;
  }

  export function fetchMenu(shopId: string): Promise<MenuItem[]>;

  export function order(
    item: MenuItem,
    size: "small" | "medium" | "large",
  ): Promise<string>;              // resolves to the order id
}`,
  zh: `declare module "boba-sdk" {
  export interface MenuItem {
    name: string;
    price: number;
    soldOut?: boolean;
  }

  export function fetchMenu(shopId: string): Promise<MenuItem[]>;

  export function order(
    item: MenuItem,
    size: "small" | "medium" | "large",
  ): Promise<string>;              // 解析出订单号
}`,
};

const S5_V2 = `declare module "boba-sdk" {
  export type Size = "small" | "medium" | "large";

  export interface MenuItem {
    name: string;
    price: number;
    soldOut?: boolean;
  }

  export interface BobaClient {
    fetchMenu(shopId: string): Promise<MenuItem[]>;
    order(item: MenuItem, size: Size): Promise<string>;
    on(event: "ready" | "error", cb: (msg: string) => void): void;
  }

  export default function createClient(key: string): BobaClient;
}`;

export default function ModulesPage() {
  return (
    <main className="page" data-ch="modules">
      <Hero
        ch="modules"
        title={{
          en: (
            <>
              Modules and <span className="grad">declaration files</span>
            </>
          ),
          zh: (
            <>
              模块与<span className="grad">声明文件</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              A module keeps its top-level names to itself. A declaration file
              describes what a module exports and contains none of the code.
              This chapter covers both: what makes a file a module, what an
              import actually carries, and where the types for a JavaScript
              library come from when the library has none of its own.
            </>
          ),
          zh: (
            <>
              模块把自己的顶层名字留在自己手里;
              声明文件描述一个模块导出了什么,而不包含任何代码。
              这一章讲这几件事:什么让一个文件成为模块、一行 import
              到底带着什么,以及当一个 JavaScript 库自己没有类型时,
              它的类型从哪里来。
            </>
          ),
        }}
        chips={[
          {
            id: "esm",
            n: "01",
            label: { en: "Module scope", zh: "模块作用域" },
          },
          { id: "dts", n: "02", label: { en: "What a .d.ts is", zh: ".d.ts 本体" } },
          {
            id: "sources",
            n: "03",
            label: { en: "Three sources", zh: "三个来源" },
          },
          { id: "declare", n: "04", label: { en: "declare", zh: "declare 家族" } },
          {
            id: "boba-sdk",
            n: "05",
            label: { en: "Practice: boba-sdk", zh: "实战:boba-sdk" },
          },
          { id: "labs", n: "06", label: { en: "Practice", zh: "动手" } },
          { id: "quiz", n: "07", label: { en: "Quiz", zh: "测验" } },
        ]}
      >
        <ManualHero />
      </Hero>

      {/* ================= §01 module scope ================= */}
      <Section
        id="esm"
        index="01"
        title={{
          en: "Module scope, and what an import carries",
          zh: "模块作用域,以及一行 import 带着什么",
        }}
        desc={{
          en: "You already know import and export. Two things are worth being exact about: which files are modules at all, and which imports survive compilation.",
          zh: "import 和 export 你早就会。有两件事值得说准:哪些文件才算模块,以及哪些 import 能活到编译之后。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                Start with the rule everything else rests on. A file is a{" "}
                <b>module</b> only if it has a top-level <code>import</code> or a
                top-level <code>export</code>. A file with neither is a{" "}
                <b>script</b>, and its top-level declarations go into the{" "}
                <b>global scope</b> that every script in the program shares.
                That is why two files can collide on a name they never shared
                deliberately.
              </>
            }
            zh={
              <>
                先说其他一切都建立在上面的那条规则。一个文件只有在顶层写了{" "}
                <code>import</code> 或 <code>export</code> 时,才是<b>模块</b>;
                两者都没有的文件是<b>脚本</b>,它的顶层声明会进入
                <b>全局作用域</b> —— 而程序里所有脚本共用这一个作用域。
                这就是为什么两个从没打算共享名字的文件会撞车。
              </>
            }
          />
        </p>

        <CodeBlock
          lang="ts"
          title={{
            en: "scope.ts · the same const in two files",
            zh: "scope.ts · 两个文件里的同一个 const",
          }}
          hl={[10]}
          code={S1_SCOPE}
          note={
            <T
              en={
                <>
                  <code>export {"{}"}</code> exports nothing. Its only job is to
                  give the file module scope. You will see it again in{" "}
                  <b>§04</b>, where <code>declare global</code> requires it.
                </>
              }
              zh={
                <>
                  <code>export {"{}"}</code> 什么都不导出,
                  它唯一的作用就是让这个文件获得模块作用域。
                  <b>§04</b> 还会再见到它 —— <code>declare global</code>{" "}
                  需要这个前提。
                </>
              }
            />
          }
        />

        <Callout
          tone="warn"
          title={{
            en: "The file decides this, not tsconfig.json",
            zh: "这件事由文件决定,不是 tsconfig.json",
          }}
        >
          <T
            en={
              <>
                <p>
                  The <code>module</code> option in{" "}
                  <code>tsconfig.json</code> chooses the <i>output format</i>:{" "}
                  <code>esnext</code>, <code>commonjs</code>, and so on. It does
                  not decide whether a given file is a module. Only the file
                  itself does that, by having a top-level import or export.
                </p>
                <p>
                  This matters most in <code>.d.ts</code> files, where it is easy
                  to have neither. The same <code>declare module</code> block
                  means two different things depending on which kind of file it
                  sits in. §04 shows both.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  <code>tsconfig.json</code> 里的 <code>module</code>{" "}
                  选的是<i>输出格式</i>:<code>esnext</code>、
                  <code>commonjs</code> 之类。
                  它不决定某个文件是不是模块 ——
                  只有文件自己能决定,靠顶层的 import 或 export。
                </p>
                <p>
                  这一点在 <code>.d.ts</code> 里最要紧,
                  因为那种文件很容易两者都没有。同一段{" "}
                  <code>declare module</code> 放在哪种文件里,
                  含义完全不同。§04 会把两种都演一遍。
                </p>
              </>
            }
          />
        </Callout>

        <p className="sec-desc">
          <T
            en={
              <>
                Next: the two module systems you will meet. <b>ES modules</b>{" "}
                (ESM) use <code>import</code> and <code>export</code>. Their
                imports are <b>hoisted</b> — every imported module is loaded and
                run before the importing file&apos;s first statement — and the
                list of imports can be read without running any code.{" "}
                <b>CommonJS</b> (CJS) uses <code>require</code>, which is an
                ordinary function call and runs where it is written.
              </>
            }
            zh={
              <>
                接下来是你会遇到的两套模块系统。<b>ES 模块</b>(ESM)用{" "}
                <code>import</code> 和 <code>export</code>,
                它的导入会被<b>提升</b> ——
                所有被导入的模块都在当前文件第一条语句之前加载并执行完 ——
                而且导入清单不需要运行任何代码就能读出来。<b>CommonJS</b>
                (CJS)用 <code>require</code>,那是一次普通的函数调用,
                写在哪里就在哪里执行。
              </>
            }
          />
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="js"
              title={{ en: "main.mjs · ESM", zh: "main.mjs · ESM" }}
              hl={[2]}
              code={S1_ESM}
            />
          }
          right={
            <CodeBlock
              lang="js"
              title={{ en: "main.cjs · CommonJS", zh: "main.cjs · CommonJS" }}
              hl={[2]}
              code={S1_CJS}
            />
          }
        />

        <Callout
          tone="deep"
          title={{
            en: "Why static imports allow tree shaking",
            zh: "为什么静态导入能做 tree shaking",
          }}
        >
          <T
            en={
              <>
                <p>
                  Because ESM import and export declarations must appear at the
                  top level and their names are fixed, a bundler can work out
                  which exports are used without running the program. Unused
                  exports can then be left out of the output. That removal is
                  called <b>tree shaking</b>.
                </p>
                <p>
                  <code>require</code> gives no such guarantee. It can sit inside
                  an <code>if</code>, take a computed path, and return a
                  different object each time. So a bundler generally has to keep
                  the whole module.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  ESM 的 import / export 声明必须写在顶层,名字也是固定的,
                  所以打包器不运行程序就能算出哪些导出被用到,
                  再把没用到的导出从产物里去掉。这种去除叫{" "}
                  <b>tree shaking</b>。
                </p>
                <p>
                  <code>require</code> 给不了这个保证:
                  它可以写在 <code>if</code> 里面,可以接一个算出来的路径,
                  每次还可能返回不同的对象。所以打包器通常只能把整个模块留下。
                </p>
              </>
            }
          />
        </Callout>

        <Callout
          tone="warn"
          title={{
            en: "export default and module.exports = are not the same thing",
            zh: "export default 和 module.exports = 不是一回事",
          }}
        >
          <T
            en={
              <>
                <p>
                  <code>export default x</code> creates one named export called{" "}
                  <code>default</code> on an ES module.{" "}
                  <code>module.exports = x</code> replaces the whole exports
                  object of a CommonJS module. So a CommonJS module that assigns
                  a function to <code>module.exports</code> has no{" "}
                  <code>default</code> property for an ESM default import to
                  read.
                </p>
                <p>
                  <code>esModuleInterop</code> is what bridges the two. It makes
                  the compiler emit a small helper, <code>__importDefault</code>,
                  which wraps a non-ESM export as{" "}
                  <code>{"{ default: … }"}</code> so the default import finds
                  something. It also changes the type rules to match: without
                  the flag, the default import is rejected outright.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  <code>export default x</code> 在 ES 模块上创建一个名叫{" "}
                  <code>default</code> 的具名导出;
                  <code>module.exports = x</code>{" "}
                  则是把 CommonJS 模块的整个导出对象换掉。
                  所以一个把函数赋给 <code>module.exports</code> 的 CommonJS
                  模块,并没有一个 <code>default</code> 属性给 ESM
                  的默认导入去读。
                </p>
                <p>
                  <code>esModuleInterop</code> 就是搭在这两者之间的桥:
                  它让编译器产出一个小助手 <code>__importDefault</code>,
                  把非 ESM 的导出包成 <code>{"{ default: … }"}</code>,
                  默认导入这才有东西可拿。它同时也改了类型规则 ——
                  不开这个开关,那句默认导入会直接被拒绝。
                </p>
              </>
            }
          />
        </Callout>

        <CodeBlock
          lang="ts"
          title={{
            en: "interop.ts · a default import from a CommonJS package",
            zh: "interop.ts · 从 CommonJS 包做默认导入",
          }}
          hl={[5]}
          code={S1_INTEROP}
        />

        <p className="sec-desc">
          <T
            en={
              <>
                Now the part TypeScript adds. Alongside values, an{" "}
                <code>export</code> list can carry <b>types</b>:
              </>
            }
            zh={
              <>
                现在说 TypeScript 加进来的那部分:除了值,一份{" "}
                <code>export</code> 清单还可以带上<b>类型</b>:
              </>
            }
          />
        </p>

        <CodeBlock
          lang="ts"
          title={{
            en: "order.ts + shop.ts · values and types on the same list",
            zh: "order.ts + shop.ts · 同一份清单上的值与类型",
          }}
          hl={[2, 13]}
          code={S1_ORDER}
        />

        <p className="sec-desc">
          <T
            en={
              <>
                Types are erased when the code is compiled. So what happens to
                the <code>import</code> line that brought a type in? Switch the
                panel below from source to output.
              </>
            }
            zh={
              <>
                编译时类型会被擦除。那么,把类型带进来的那行{" "}
                <code>import</code> 会怎么样?
                把下面的面板从「编译前」切到「编译后」看看。
              </>
            }
          />
        </p>

        <ErasedImports />

        <Callout
          tone="deep"
          title={{
            en: "Why you should mark type-only imports yourself",
            zh: "为什么该由你自己标出纯类型导入",
          }}
        >
          <T
            en={
              <>
                <p>
                  <code>tsc</code> sees the whole project, so it can work out on
                  its own that <code>Order</code> is only a type and that the
                  import can go. Vite, esbuild, and SWC transpile{" "}
                  <b>one file at a time</b>. They cannot tell whether{" "}
                  <code>Order</code> is a value or a type, and dropping the wrong
                  import breaks the program at run time.
                </p>
                <p>
                  <code>verbatimModuleSyntax</code> (TypeScript 5.0) removes the
                  guesswork: an import or export statement is emitted exactly as
                  written, and a type imported without <code>type</code> is
                  reported as <code>ts(1484)</code>, &quot;&apos;Order&apos; is a
                  type and must be imported using a type-only import when
                  &apos;verbatimModuleSyntax&apos; is enabled.&quot; Re-exporting
                  a type without <code>export type</code> gives the matching{" "}
                  <code>ts(1205)</code>.
                </p>
                <p>
                  There is a second reason, independent of tooling. A{" "}
                  <code>.js</code> module can run code when it is loaded. A
                  type-only import that survives into the output would load that
                  module at run time for no benefit at all.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  <code>tsc</code> 看得到整个项目,所以它自己就能算出{" "}
                  <code>Order</code> 只是类型、这行导入可以删。
                  而 Vite、esbuild、SWC <b>一次只转译一个文件</b>,
                  它们分不清 <code>Order</code> 是值还是类型 ——
                  删错一行导入,程序会在运行时坏掉。
                </p>
                <p>
                  <code>verbatimModuleSyntax</code>(TypeScript 5.0)
                  把「猜」这一步去掉了:import / export
                  语句会被原样输出,导入类型时不写 <code>type</code> 会报{" "}
                  <code>ts(1484)</code>,&quot;&apos;Order&apos; is a type and
                  must be imported using a type-only import when
                  &apos;verbatimModuleSyntax&apos; is enabled.&quot;;
                  转手导出类型时不写 <code>export type</code> 则报对应的{" "}
                  <code>ts(1205)</code>。
                </p>
                <p>
                  还有第二个理由,和工具链无关:<code>.js</code>{" "}
                  模块被加载时可以执行代码。
                  一行纯类型导入如果活到了产物里,
                  就会在运行时白白加载那个模块一次。
                </p>
              </>
            }
          />
        </Callout>

        <CodeBlock
          lang="ts"
          title={{
            en: "the three type-only forms",
            zh: "三种只走类型的写法",
          }}
          code={S1_TYPE_FORMS}
          note={
            <T
              en={
                <>
                  A useful habit: if a name appears only in type positions, mark
                  it <code>type</code> when you import it. Editor auto-import
                  does this by default now.
                </>
              }
              zh={
                <>
                  一个好习惯:某个名字只出现在类型位置上,
                  导入时就给它标上 <code>type</code>。
                  编辑器的自动导入现在默认就是这么做的。
                </>
              }
            />
          }
        />

        <Callout
          tone="warn"
          title={{
            en: "Circular imports are allowed, but a binding can be unset",
            zh: "循环导入是允许的,但绑定可能还没有值",
          }}
        >
          <T
            en={
              <>
                <p>
                  Two ES modules may import each other. The specification allows
                  it and the type checker reports nothing. What can still fail is
                  the <i>order</i>: the modules run one after another, and if one
                  reads a binding from the other before that module has reached
                  the line that initialises it, the read throws{" "}
                  <code>ReferenceError</code>.
                </p>
                <p>
                  Reading such a binding later — inside a function that is called
                  after both modules have finished — is fine. The practical fix
                  is to move the shared declaration into a third module that both
                  import.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  两个 ES 模块可以互相导入,规范允许,
                  类型检查也不会报任何东西。仍然可能出问题的是<i>顺序</i>:
                  模块是一个接一个执行的,
                  如果一方在另一方还没走到初始化那一行时就去读它的绑定,
                  这次读取会抛 <code>ReferenceError</code>。
                </p>
                <p>
                  晚一点再读没问题 ——
                  比如放在两个模块都执行完之后才被调用的函数里。
                  实际的解法是把共享的声明挪到第三个模块,两边都从那里导入。
                </p>
              </>
            }
          />
        </Callout>

        <CodeBlock
          lang="js"
          title={{
            en: "a.js + b.js · legal, and still able to fail",
            zh: "a.js + b.js · 合法,但仍然会失败",
          }}
          hl={[8]}
          code={S1_CIRCULAR}
        />
      </Section>

      {/* ================= §02 .d.ts ================= */}
      <Section
        id="dts"
        index="02"
        title={{
          en: ".d.ts: shapes only, no implementation",
          zh: ".d.ts:只有形状,没有实现",
        }}
        desc={{
          en: "A declaration file lists everything a module exports and how each export is shaped. It emits nothing, and it cannot contain code.",
          zh: "声明文件列出一个模块导出了什么、每个导出是什么形状。它不产出任何东西,也不能包含代码。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                A <b>declaration file</b> (<code>.d.ts</code>) describes the
                public shape of a module: every export, with its type, and
                nothing else. You do not have to write one by hand. The compiler
                generates one from your source when you ask it to:
              </>
            }
            zh={
              <>
                <b>声明文件</b>(<code>.d.ts</code>)描述一个模块对外的形状:
                每个导出,连带它的类型,除此之外什么都没有。
                这种文件不一定要手写 —— 你让编译器生成,它就会从源码里生成:
              </>
            }
          />
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title={{ en: "order.ts · the source", zh: "order.ts · 源码" }}
              code={S2_SRC}
            />
          }
          right={
            <CodeBlock
              lang="dts"
              title={{
                en: "order.d.ts · generated by tsc",
                zh: "order.d.ts · tsc 生成的",
              }}
              code={S2_DTS}
            />
          }
        />

        <Callout
          tone="warn"
          title={{
            en: "A declaration file cannot hold code",
            zh: "声明文件里放不了代码",
          }}
        >
          <T
            en={
              <>
                <p>
                  Everything in a <code>.d.ts</code> is an ambient declaration: a
                  statement about something that exists elsewhere. Write a
                  function body in one and you get{" "}
                  <code>
                    error TS1183: An implementation cannot be declared in ambient
                    contexts.
                  </code>
                </p>
                <p>
                  This is also why a <code>.d.ts</code> can describe a library
                  that was never written in TypeScript. Describing a shape does
                  not require touching the code.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  <code>.d.ts</code> 里的一切都是环境声明(ambient
                  declaration):关于「别处存在某样东西」的陈述。
                  在里面写一个函数体,你会得到{" "}
                  <code>
                    error TS1183: An implementation cannot be declared in ambient
                    contexts.
                  </code>
                </p>
                <p>
                  这也是 <code>.d.ts</code> 能描述一个从来不是用 TypeScript
                  写的库的原因:描述形状,不需要动那份代码。
                </p>
              </>
            }
          />
        </Callout>

        <Callout
          tone="story"
          title={{
            en: "The built-ins come from declaration files too",
            zh: "那些「内置」的东西也来自声明文件",
          }}
        >
          <T
            en={
              <>
                <p>
                  Where do the types for <code>document</code>,{" "}
                  <code>fetch</code>, and <code>Promise</code> come from? The
                  same place: <code>.d.ts</code> files. TypeScript ships a set of
                  them. <b>lib.dom.d.ts</b> covers what the browser provides.
                  Files such as <b>lib.es2022.d.ts</b> cover the JavaScript
                  language itself. The <code>lib</code> option in{" "}
                  <code>tsconfig.json</code> decides which ones are loaded.
                </p>
                <p>
                  In your editor, hold Ctrl or Cmd and click{" "}
                  <code>fetch</code>. You land inside{" "}
                  <code>lib.dom.d.ts</code>. Seeing it once is enough to make
                  &quot;built-in&quot; stop feeling like a special case.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  <code>document</code>、<code>fetch</code>、
                  <code>Promise</code> 的类型是哪来的?同一个地方:
                  <code>.d.ts</code> 文件。TypeScript 自带一批:
                  <b>lib.dom.d.ts</b> 管浏览器提供的东西,
                  <b>lib.es2022.d.ts</b> 这类管 JavaScript 语言本身;
                  <code>tsconfig.json</code> 的 <code>lib</code>{" "}
                  选项决定加载哪几本。
                </p>
                <p>
                  在编辑器里按住 Ctrl 或 Cmd 点一下 <code>fetch</code>,
                  你会跳进 <code>lib.dom.d.ts</code>。
                  亲眼看一次,「内置」就不再像是什么特殊情况了。
                </p>
              </>
            }
          />
        </Callout>

        <CodeBlock
          lang="dts"
          title={{
            en: "lib.dom.d.ts (excerpt) · where document and fetch come from",
            zh: "lib.dom.d.ts(节选)· document 和 fetch 的出处",
          }}
          code={S2_LIBDOM}
          note={
            <T
              en={
                <>
                  Note the word <code>declare</code>: the implementation is not
                  here, but it will exist at run time. <b>§04</b> is about that
                  word.
                </>
              }
              zh={
                <>
                  注意 <code>declare</code> 这个词:实现不在这里,
                  但运行时它会存在。<b>§04</b> 专门讲这个词。
                </>
              }
            />
          }
        />

        <LibShelf />
      </Section>

      {/* ================= §03 three sources ================= */}
      <Section
        id="sources"
        index="03"
        title={{
          en: "Where a library's types come from",
          zh: "一个库的类型从哪里来",
        }}
        desc={{
          en: "Three places, checked in order. The compiler stops at the first one that answers.",
          zh: "三个地方,按顺序查。哪一个先有结果,编译器就停在那里。",
        }}
      >
        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">SOURCE 1</div>
            <div className="card-title">
              <T en="Bundled with the package" zh="包自己带的" />
            </div>
            <p>
              <T
                en={
                  <>
                    A library written in TypeScript builds with{" "}
                    <code>--declaration</code> and points at the result with the{" "}
                    <code>types</code> field in <code>package.json</code>, or a{" "}
                    <code>types</code> condition inside <code>exports</code>.
                    Install it and the types are there.
                  </>
                }
                zh={
                  <>
                    用 TypeScript 写的库,编译时开 <code>--declaration</code>,
                    再用 <code>package.json</code> 的 <code>types</code>{" "}
                    字段(或 <code>exports</code> 里的 <code>types</code>{" "}
                    条件)指向产物。装完就有类型。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">SOURCE 2</div>
            <div className="card-title">DefinitelyTyped</div>
            <p>
              <T
                en={
                  <>
                    A community repository of declarations for libraries that
                    ship none, published as <code>@types/*</code> packages:{" "}
                    <code>npm i -D @types/lodash</code>. Nearly every
                    established JavaScript library is covered.
                  </>
                }
                zh={
                  <>
                    一个社区仓库,为自己不带类型的库写声明,
                    发布成 <code>@types/*</code> 包:
                    <code>npm i -D @types/lodash</code>。
                    几乎所有老牌 JavaScript 库都被收录了。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">SOURCE 3</div>
            <div className="card-title">
              <T en="✍️ You write it" zh="✍️ 你自己写" />
            </div>
            <p>
              <T
                en={
                  <>
                    Neither of the first two has anything?{" "}
                    <code>declare module</code> in your own project.{" "}
                    <b>§05</b> builds one up step by step for a library with no
                    types at all.
                  </>
                }
                zh={
                  <>
                    前两个都没有?在你自己的项目里写{" "}
                    <code>declare module</code>。<b>§05</b>{" "}
                    会为一个完全没有类型的库一步步写出一份。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <TypeQuest />

        <p className="sec-desc">
          <T
            en={
              <>
                What does source 1 look like? Open the{" "}
                <code>package.json</code> of any library written in TypeScript
                and look for these fields:
              </>
            }
            zh={
              <>
                第一个来源长什么样?打开任何一个用 TypeScript 写的库的{" "}
                <code>package.json</code>,找这几个字段:
              </>
            }
          />
        </p>

        <CodeBlock
          lang="json"
          title={{
            en: "node_modules/boba-ui/package.json · pointing at the types",
            zh: "node_modules/boba-ui/package.json · 指向类型的字段",
          }}
          hl={[5, 8]}
          code={S3_PKG}
          note={
            <T
              en={
                <>
                  Both forms appear in the wild. The top-level{" "}
                  <code>types</code> field is the older one. The{" "}
                  <code>types</code> condition inside <code>exports</code> is
                  read by the newer resolution modes and can differ per subpath,
                  which is why a package can offer different types for its ESM
                  and CommonJS entry points.
                </>
              }
              zh={
                <>
                  两种写法在真实项目里都常见。顶层的 <code>types</code>{" "}
                  字段是较早的写法;<code>exports</code> 里的{" "}
                  <code>types</code> 条件由较新的解析模式读取,
                  而且可以按子路径分别指定 ——
                  所以一个包能为它的 ESM 入口和 CommonJS
                  入口提供不同的类型。
                </>
              }
            />
          }
        />

        <CodeBlock
          lang="bash"
          title={{
            en: "source 2 · two installs you will do often",
            zh: "第二个来源 · 两笔常做的安装",
          }}
          code={S3_INSTALL}
          note={
            <T
              en={
                <>
                  The naming rule is fixed: the declarations for npm package{" "}
                  <code>xxx</code> are published as <code>@types/xxx</code>.{" "}
                  <b>
                    <code>@types/node</code> covers Node&apos;s own APIs
                  </b>{" "}
                  — without it, a Node project cannot even import{" "}
                  <code>fs</code>.
                </>
              }
              zh={
                <>
                  命名规则是固定的:npm 包 <code>xxx</code> 的声明发布成{" "}
                  <code>@types/xxx</code>。
                  <b>
                    <code>@types/node</code> 管的是 Node 自己的 API
                  </b>
                  —— 不装它,Node 项目连 <code>fs</code> 都导入不了。
                </>
              }
            />
          }
        />

        <Callout
          tone="warn"
          title={{
            en: "@types versions drift away from the library",
            zh: "@types 的版本会和库本体脱节",
          }}
        >
          <T
            en={
              <>
                <p>
                  Declarations in DefinitelyTyped are written by volunteers, so
                  they can lag behind the library. Install a new major version of
                  lodash while <code>@types/lodash</code> stays on the old one,
                  and the types will describe behaviour the library no longer
                  has.
                </p>
                <p>
                  The convention is that the <b>major and minor version of the
                  @types package match the library</b>. When a type looks wrong,
                  compare those two version numbers first.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  DefinitelyTyped 里的声明是志愿者写的,可能落后于库本体。
                  你装了新的大版本 lodash,而 <code>@types/lodash</code>{" "}
                  还停在旧版,类型描述的就会是库已经不再有的行为。
                </p>
                <p>
                  约定是 <b>@types 包的 major 和 minor 版本跟随库本体</b>。
                  类型看起来不对的时候,先比这两个版本号。
                </p>
              </>
            }
          />
        </Callout>

        <Callout
          tone="deep"
          title={{
            en: "Resolution is a compile-time answer only",
            zh: "解析只是编译期的答案",
          }}
        >
          <T
            en={
              <>
                <p>
                  Finding a declaration file is <b>module resolution</b>, and{" "}
                  <code>moduleResolution</code> selects the rules.{" "}
                  <code>node10</code> is the legacy Node algorithm: it walks up
                  through <code>node_modules</code>, reads <code>main</code> and{" "}
                  <code>types</code>, and <b>ignores</b> the{" "}
                  <code>exports</code> field.{" "}
                  <code>node16</code> and <code>nodenext</code> follow what
                  modern Node actually does: they honour <code>exports</code>,
                  and in an ESM file they require the file extension in a
                  relative import (leaving it out is <code>ts(2835)</code>).{" "}
                  <code>bundler</code> matches what bundlers do: it honours{" "}
                  <code>exports</code> but allows extensionless imports. None of
                  these is correct everywhere. The right one is the one that
                  matches whatever loads your code.
                </p>
                <p>
                  <code>paths</code> is narrower still. It is a{" "}
                  <b>compile-time mapping only</b>. <code>tsc</code> does not
                  rewrite the specifier, so{" "}
                  <code>import {"{ TAX }"} from &quot;@/tax&quot;</code> is still
                  written that way in the output. Node then reports{" "}
                  <code>Cannot find package &apos;@/tax&apos;</code>. Next.js,
                  Vite, and webpack read these paths or have an equivalent alias
                  option, which is why aliases work in an app and break the
                  first time you run plain <code>node</code> on the output.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  找到声明文件这件事叫<b>模块解析</b>,规则由{" "}
                  <code>moduleResolution</code> 选择。<code>node10</code>{" "}
                  是旧的 Node 算法:沿着 <code>node_modules</code> 往上找,
                  读 <code>main</code> 和 <code>types</code>,并且
                  <b>忽略</b> <code>exports</code> 字段。<code>node16</code>{" "}
                  和 <code>nodenext</code> 按现代 Node 的真实行为来:
                  认 <code>exports</code>,而且在 ESM 文件里,
                  相对导入必须写文件扩展名(不写会报 <code>ts(2835)</code>)。
                  <code>bundler</code> 对应打包器的行为:认{" "}
                  <code>exports</code>,但允许省略扩展名。
                  这几种没有哪一种放到哪里都对 ——
                  正确的那一个,是和真正加载你代码的那一方对得上的那个。
                </p>
                <p>
                  <code>paths</code> 的范围更窄,它<b>只是编译期的映射</b>。
                  <code>tsc</code> 不会改写模块标识,所以{" "}
                  <code>import {"{ TAX }"} from &quot;@/tax&quot;</code>{" "}
                  在产物里还是这么写着,Node 于是报{" "}
                  <code>Cannot find package &apos;@/tax&apos;</code>。
                  Next.js、Vite、webpack 会读这些 paths,
                  或者提供等价的别名选项 ——
                  这就是为什么别名在应用里好用,
                  却在你第一次用纯 <code>node</code> 跑产物时失败。
                </p>
              </>
            }
          />
        </Callout>

        <CodeBlock
          lang="json"
          title={{
            en: "tsconfig.json · the options that decide how a module is found",
            zh: "tsconfig.json · 决定「怎么找到一个模块」的几个选项",
          }}
          hl={[4, 5]}
          code={S3_RESOLUTION}
          note={
            <T
              en={
                <>
                  This project uses <code>bundler</code> because Next.js loads
                  the code. A library published to npm usually wants{" "}
                  <code>nodenext</code>, so that the declarations it emits match
                  what Node will do with them.
                </>
              }
              zh={
                <>
                  这个项目用 <code>bundler</code>,因为代码是 Next.js 加载的。
                  一个要发布到 npm 的库通常想要 <code>nodenext</code>,
                  这样它产出的声明才和 Node 实际的处理方式对得上。
                </>
              }
            />
          }
        />

        <Callout
          tone="deep"
          title={{
            en: "What skipLibCheck actually skips",
            zh: "skipLibCheck 到底跳过了什么",
          }}
        >
          <T
            en={
              <>
                <p>
                  <code>skipLibCheck: true</code> skips type checking{" "}
                  <b>inside</b> <code>.d.ts</code> files, including the checks
                  between them. Your own calls into those libraries are still
                  checked in full.
                </p>
                <p>
                  It buys faster compilation and avoids errors you cannot fix,
                  such as two <code>@types</code> packages declaring the same
                  global with different types. The cost is that a genuine mistake
                  inside a declaration file goes unreported.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  <code>skipLibCheck: true</code> 跳过的是{" "}
                  <code>.d.ts</code> 文件<b>内部</b>的类型检查,
                  包括它们之间的互相检查。
                  你自己代码对这些库的调用,照样完整检查。
                </p>
                <p>
                  换来的是更快的编译,以及躲开你根本改不了的报错 ——
                  比如两个 <code>@types</code>{" "}
                  包用不同的类型声明了同一个全局变量。
                  代价是声明文件内部真有错时不会被报出来。
                </p>
              </>
            }
          />
        </Callout>
      </Section>

      {/* ================= §04 declare ================= */}
      <Section
        id="declare"
        index="04"
        title={{
          en: "declare: stating that something exists at run time",
          zh: "declare:声明「运行时存在某样东西」",
        }}
        desc={{
          en: "declare creates nothing. It tells the compiler the type of something the compiler cannot see for itself.",
          zh: "declare 不创造任何东西。它告诉编译器某样它自己看不到的东西是什么类型。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                Some things really are present at run time but invisible to the
                compiler: a global constant injected by the build tool, a
                function loaded by a <code>&lt;script&gt;</code> tag, an npm
                package with no types. <b>declare</b> is how you state their
                types: it exists, this is its shape, take my word for it.
              </>
            }
            zh={
              <>
                有些东西运行时确实存在,但编译器看不见:
                构建工具注入的全局常量、由 <code>&lt;script&gt;</code>{" "}
                标签加载进来的函数、没有类型的 npm 包。<b>declare</b>{" "}
                就是你陈述它们类型的方式:它存在,形状是这样,请采信我。
              </>
            }
          />
        </p>

        <CodeBlock
          lang="dts"
          title={{
            en: "globals.d.ts · three things you can declare",
            zh: "globals.d.ts · 可以声明的三种东西",
          }}
          hl={[2, 5, 11]}
          code={S4_GLOBALS}
        />

        <p className="sec-desc">
          <T
            en={
              <>
                The most common real need: something was attached to{" "}
                <code>window</code> and you want it typed. From inside a module,
                that requires <code>declare global</code>.
              </>
            }
            zh={
              <>
                最常见的真实需求:有东西被挂到了 <code>window</code> 上,
                你希望它有类型。在模块内部,这需要 <code>declare global</code>。
              </>
            }
          />
        </p>

        <CodeBlock
          lang="dts"
          title={{
            en: "window-config.d.ts · adding a field to window",
            zh: "window-config.d.ts · 给 window 加一个字段",
          }}
          hl={[2, 4]}
          code={S4_WINDOW}
          note={
            <T
              en={
                <>
                  Why the <code>export {"{}"}</code>? <code>declare global</code>{" "}
                  is only allowed inside a module, and a file with no top-level
                  import or export is a script. Put it in a script and you get{" "}
                  <code>
                    error TS2669: Augmentations for the global scope can only be
                    directly nested in external modules or ambient module
                    declarations.
                  </code>
                </>
              }
              zh={
                <>
                  为什么要写 <code>export {"{}"}</code>?
                  <code>declare global</code> 只允许出现在模块里,
                  而顶层没有 import / export 的文件是脚本。
                  写在脚本里会得到{" "}
                  <code>
                    error TS2669: Augmentations for the global scope can only be
                    directly nested in external modules or ambient module
                    declarations.
                  </code>
                </>
              }
            />
          }
        />

        <Callout
          tone="deep"
          title={{
            en: "Two jobs, one keyword: declaring a module vs augmenting one",
            zh: "同一个关键字,两件事:声明一个模块,还是扩充一个模块",
          }}
        >
          <T
            en={
              <>
                <p>
                  <code>declare module &quot;x&quot;</code> in a{" "}
                  <b>script</b> file — no top-level import or export — is an{" "}
                  <b>ambient module declaration</b>. It says: the module{" "}
                  <code>&quot;x&quot;</code> exists and here are its types. Use
                  it for a package that has no types of its own.
                </p>
                <p>
                  The same block in a <b>module</b> file is a{" "}
                  <b>module augmentation</b>. It says: the module{" "}
                  <code>&quot;x&quot;</code> already has types, add these to
                  them. Use it to extend a typed library, for example to add a
                  field to a theme interface.
                </p>
                <p>
                  Getting this backwards produces a confusing error. Put{" "}
                  <code>export {"{}"}</code> in a file whose{" "}
                  <code>declare module</code> was meant to describe an untyped
                  package, and the compiler treats it as an augmentation with
                  nothing to augment:{" "}
                  <code>
                    error TS2665: Invalid module name in augmentation. Module
                    &apos;boba-sdk&apos; resolves to an untyped module …, which
                    cannot be augmented.
                  </code>
                </p>
              </>
            }
            zh={
              <>
                <p>
                  写在<b>脚本</b>文件里(顶层没有 import / export)的{" "}
                  <code>declare module &quot;x&quot;</code>{" "}
                  是<b>环境模块声明</b>,含义是:模块{" "}
                  <code>&quot;x&quot;</code> 存在,类型是这些。
                  用于自己没有类型的包。
                </p>
                <p>
                  同样一段写在<b>模块</b>文件里,就是<b>模块扩充</b>,
                  含义是:模块 <code>&quot;x&quot;</code>{" "}
                  已经有类型了,把这些追加进去。用于扩展一个有类型的库,
                  比如给某个 theme 接口加一个字段。
                </p>
                <p>
                  两者搞反会得到一个令人困惑的报错。
                  某个文件里的 <code>declare module</code>{" "}
                  本意是描述一个没有类型的包,你却给它加了{" "}
                  <code>export {"{}"}</code>,
                  编译器就会把它当成扩充,而那里没有东西可扩充:
                  <code>
                    error TS2665: Invalid module name in augmentation. Module
                    &apos;boba-sdk&apos; resolves to an untyped module …, which
                    cannot be augmented.
                  </code>
                </p>
              </>
            }
          />
        </Callout>

        <CodeBlock
          lang="dts"
          title={{
            en: "boba-ui-theme.d.ts · augmenting a library that already has types",
            zh: "boba-ui-theme.d.ts · 扩充一个已经有类型的库",
          }}
          hl={[4, 6]}
          code={S4_AUGMENT}
        />

        <Callout
          tone="warn"
          title={{
            en: "A declaration is a claim, and claims can be wrong",
            zh: "声明是一种断言,而断言可能是错的",
          }}
        >
          <T
            en={
              <>
                <p>
                  However carefully you write it, <code>declare</code> does not
                  add anything to the run time. Declare <code>gtag</code> but
                  never load the analytics script, and the program still fails
                  with <code>gtag is not defined</code>.
                </p>
                <p>
                  When the type check passes and the program fails immediately,
                  check three things: was the script actually loaded, does the
                  package really export that name, and is the name spelled
                  correctly?
                </p>
              </>
            }
            zh={
              <>
                <p>
                  不管写得多仔细,<code>declare</code>{" "}
                  都不会给运行时增加任何东西。声明了 <code>gtag</code>{" "}
                  但统计脚本从没加载,程序照样会因为{" "}
                  <code>gtag is not defined</code> 失败。
                </p>
                <p>
                  类型检查通过、一运行就失败时,查三件事:
                  脚本真的加载了吗?那个包真的导出了这个名字吗?
                  名字拼对了吗?
                </p>
              </>
            }
          />
        </Callout>

        <Callout
          tone="story"
          title={{
            en: "A note on namespace",
            zh: "关于 namespace 的一点说明",
          }}
        >
          <T
            en={
              <>
                <p>
                  You will see <code>declare namespace</code> in older
                  declaration files. <code>namespace</code> predates ES modules:
                  it was TypeScript&apos;s own way of grouping names before the
                  language had modules of its own. It still works, and it is
                  still the natural way to describe a library that puts
                  everything on one global object.
                </p>
                <p>
                  For new code, modules are the recommendation. A module already
                  gives you a private scope and an explicit list of exports,
                  which is what <code>namespace</code> was for.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  在较早的声明文件里你会看到 <code>declare namespace</code>。
                  <code>namespace</code> 早于 ES 模块 ——
                  在 JavaScript 还没有自己的模块之前,
                  它是 TypeScript 自己的名字分组方式。它现在依然有效,
                  而且描述「把所有东西挂在一个全局对象上」的库时依然最自然。
                </p>
                <p>
                  新写的代码则推荐用模块。
                  模块本身就给了你一个私有作用域和一份明确的导出清单 ——
                  那正是 <code>namespace</code> 当年要解决的事。
                </p>
              </>
            }
          />
        </Callout>
      </Section>

      {/* ================= §05 boba-sdk ================= */}
      <Section
        id="boba-sdk"
        index="05"
        title={{
          en: "Practice: writing declarations for an untyped library",
          zh: "实战:给一个没有类型的库写声明",
        }}
        desc={{
          en: "From one line that makes it compile to a declaration worth keeping. You close the any-shaped hole a bit at a time.",
          zh: "从「先能编译」的一行,到一份值得留下的声明 —— any 的洞是一点点补小的。",
        }}
      >
        <div className="md-vroute" aria-hidden>
          <span className="md-vstep">
            <span className="n">v0</span>
            <T en="make it compile" zh="先能编译" />
          </span>
          <span className="md-varrow">→</span>
          <span className="md-vstep">
            <span className="n">v1</span>
            <T en="describe what you use" zh="描出你用到的部分" />
          </span>
          <span className="md-varrow">→</span>
          <span className="md-vstep">
            <span className="n">v2</span>
            <T en="fill in the rest" zh="补齐其余部分" />
          </span>
        </div>

        <p className="sec-desc">
          <T
            en={
              <>
                The setup: a project needs an old (imaginary) JavaScript package,{" "}
                <b>boba-sdk</b>. It has no types, and no{" "}
                <code>@types/boba-sdk</code> exists either. The first import
                fails:
              </>
            }
            zh={
              <>
                设定:项目要接一个(假想的)老 JavaScript 包 <b>boba-sdk</b>,
                它没有类型,<code>@types/boba-sdk</code> 也不存在。
                第一次 import 就失败:
              </>
            }
          />
        </p>

        <CodeBlock
          lang="ts"
          title={{ en: "shop.ts · the first import", zh: "shop.ts · 第一次导入" }}
          hl={[1]}
          code={S5_CRASH}
        />

        <p className="sec-desc">
          <T
            en={
              <>
                <b>Step one: make it compile.</b> Create{" "}
                <code>types/boba-sdk.d.ts</code>. The location does not matter as
                long as it is inside the <code>include</code> range in{" "}
                <code>tsconfig.json</code>.
              </>
            }
            zh={
              <>
                <b>第一步:先让它能编译。</b>建一个{" "}
                <code>types/boba-sdk.d.ts</code>。放在哪里都行,
                只要在 <code>tsconfig.json</code> 的 <code>include</code>{" "}
                范围内。
              </>
            }
          />
        </p>

        <CodeBlock
          lang="dts"
          title={{
            en: "types/boba-sdk.d.ts · v0",
            zh: "types/boba-sdk.d.ts · v0",
          }}
          code={S5_V0}
          note={
            <T
              en={
                <>
                  This short form declares that the module exists and says
                  nothing about its contents, so every import from it is{" "}
                  <code>any</code>. Keep this file a script: no top-level{" "}
                  <code>export</code>, or the block becomes an augmentation and
                  fails with <code>ts(2665)</code>.
                </>
              }
              zh={
                <>
                  这种简写只声明模块存在,不说它的内容,
                  所以从它导入的一切都是 <code>any</code>。
                  让这个文件保持脚本身份:不要写顶层的{" "}
                  <code>export</code>,否则这段会变成模块扩充,
                  报 <code>ts(2665)</code>。
                </>
              }
            />
          }
        />

        <p className="sec-desc">
          <T
            en={
              <>
                <b>Step two: describe the parts you use.</b> You do not have to
                cover the whole library. Give a shape to what you actually
                imported:
              </>
            }
            zh={
              <>
                <b>第二步:把你用到的部分描出来。</b>
                不必覆盖整个库,先给你真正导入的那些东西一个形状:
              </>
            }
          />
        </p>

        <CodeBlock
          lang="dts"
          title={{
            en: "types/boba-sdk.d.ts · v1",
            zh: "types/boba-sdk.d.ts · v1",
          }}
          hl={[2, 8, 10]}
          code={S5_V1}
          note={
            <T
              en={
                <>
                  From here on, <code>fetchMenu</code> has a real return type and
                  passing the wrong size to <code>order</code> is an error. That
                  is the line between an unchecked import and a checked one.
                </>
              }
              zh={
                <>
                  从这一步开始,<code>fetchMenu</code>{" "}
                  有了真实的返回类型,给 <code>order</code>{" "}
                  传错杯型会报错 —— 这就是「不受检查的导入」和
                  「受检查的导入」的分界线。
                </>
              }
            />
          }
        />

        <p className="sec-desc">
          <T
            en={
              <>
                <b>Step three: fill in the rest.</b> The boba-sdk documentation
                also mentions a default-exported client and an event callback, so
                add those too:
              </>
            }
            zh={
              <>
                <b>第三步:补齐其余部分。</b>boba-sdk
                的文档里还提到一个默认导出的客户端和一个事件回调,
                一并补上:
              </>
            }
          />
        </p>

        <CodeBlock
          lang="dts"
          title={{
            en: "types/boba-sdk.d.ts · v2",
            zh: "types/boba-sdk.d.ts · v2",
          }}
          hl={[10, 16]}
          code={S5_V2}
        />

        <Callout
          tone="win"
          title={{ en: "How much is enough?", zh: "补到什么程度算够?" }}
        >
          <T
            en={
              <>
                <p>
                  <b>Describe what you use.</b> The <code>any</code>-shaped hole
                  gets smaller each time you come back to it, and nobody expects
                  a complete declaration on the first pass.
                </p>
                <p>
                  If you do end up writing a complete and reliable one, send it
                  to DefinitelyTyped. Once <code>@types/boba-sdk</code> is
                  published, the next person to use this library does not have to
                  do any of this.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  <b>用到多少,描多少。</b>每回来一次,<code>any</code>{" "}
                  的洞就小一点,没人要求第一遍就写完整。
                </p>
                <p>
                  如果你真写出了一份完整可靠的,把它提给 DefinitelyTyped。
                  <code>@types/boba-sdk</code> 一发布,
                  下一个用这个库的人就完全不用再做这些事了。
                </p>
              </>
            }
          />
        </Callout>

        <Callout
          tone="warn"
          title={{
            en: "A declaration file is not a replacement for the module",
            zh: "声明文件不能替代模块本身",
          }}
        >
          <T
            en={
              <>
                <p>
                  A <code>.d.ts</code> contains no code. If a project has{" "}
                  <code>helpers.d.ts</code> but no <code>helpers.js</code>, then{" "}
                  <code>
                    import {"{ helper }"} from &quot;./helpers&quot;
                  </code>{" "}
                  passes the type check and fails at run time with{" "}
                  <code>Cannot find module</code>.
                </p>
                <p>
                  The compiler reads declarations. The run time looks for real
                  files. Both have to exist.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  <code>.d.ts</code> 里没有代码。如果项目里有{" "}
                  <code>helpers.d.ts</code> 却没有 <code>helpers.js</code>,那{" "}
                  <code>
                    import {"{ helper }"} from &quot;./helpers&quot;
                  </code>{" "}
                  会通过类型检查,而在运行时以{" "}
                  <code>Cannot find module</code> 失败。
                </p>
                <p>
                  编译器读声明,运行时找真实文件 —— 两样都得在。
                </p>
              </>
            }
          />
        </Callout>
      </Section>

      {/* ================= §06 practice ================= */}
      <Section
        id="labs"
        index="06"
        title={{ en: "Practice", zh: "动手任务" }}
        desc={{
          en: "Five tasks: watch module scope appear, watch a declaration file get generated, install @types once, and write a declaration by hand.",
          zh: "五个任务:看模块作用域出现、看声明文件被生成、装一次 @types、再亲手写一份声明。",
        }}
      >
        <LabSet ch="modules" items={LABS} />
      </Section>

      {/* ================= §07 quiz ================= */}
      <Section
        id="quiz"
        index="07"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Eleven questions on module scope, type-only imports, and where a library's types come from.",
          zh: "十一道题,考模块作用域、纯类型导入,以及一个库的类型从哪里来。",
        }}
      >
        <Quiz ch="modules" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                A file with no top-level <code>import</code> or{" "}
                <code>export</code> is a <b>script</b>, and its top-level
                declarations go into the global scope, which is why two files can
                collide on a name: <code>ts(2451)</code>. One{" "}
                <code>export {"{}"}</code> gives the file module scope.
              </>
            ),
            zh: (
              <>
                顶层没有 <code>import</code> 也没有 <code>export</code>{" "}
                的文件是<b>脚本</b>,它的顶层声明进入全局作用域 ——
                所以两个文件会撞名:<code>ts(2451)</code>。一句{" "}
                <code>export {"{}"}</code> 就能让文件获得模块作用域。
              </>
            ),
          },
          {
            en: (
              <>
                ESM imports are hoisted and can be read without running the
                program, which is what makes tree shaking possible;{" "}
                <code>require</code> runs where it is written.{" "}
                <code>export default</code> and{" "}
                <code>module.exports =</code> are different things, and{" "}
                <code>esModuleInterop</code> emits the{" "}
                <code>__importDefault</code> wrapper that lets a default import
                read a CommonJS export.
              </>
            ),
            zh: (
              <>
                ESM 的导入会被提升,而且不运行程序就能读出来 ——
                这正是 tree shaking 成立的前提;<code>require</code>{" "}
                写在哪里就在哪里执行。<code>export default</code> 和{" "}
                <code>module.exports =</code> 是两回事,
                <code>esModuleInterop</code> 会产出{" "}
                <code>__importDefault</code> 包装,
                让默认导入能读到 CommonJS 的导出。
              </>
            ),
          },
          {
            en: (
              <>
                <code>import type</code> and <code>export type</code> mark a line
                as types only, so the line is removed and no module is loaded at
                run time. <code>verbatimModuleSyntax</code> makes the marking
                required: <code>ts(1484)</code> on import,{" "}
                <code>ts(1205)</code> on re-export.
              </>
            ),
            zh: (
              <>
                <code>import type</code> 和 <code>export type</code>{" "}
                把一行标为「只有类型」,于是整行被删除,
                运行时不会加载任何模块。<code>verbatimModuleSyntax</code>{" "}
                把这个标注变成必需:导入报 <code>ts(1484)</code>,
                转手导出报 <code>ts(1205)</code>。
              </>
            ),
          },
          {
            en: (
              <>
                A <code>.d.ts</code> file describes exports and emits nothing. It
                cannot hold an implementation: <code>ts(1183)</code>. And it does
                not replace the module — a declaration with no matching{" "}
                <code>.js</code> passes the type check and fails at run time.
              </>
            ),
            zh: (
              <>
                <code>.d.ts</code> 描述导出,不产出任何东西,
                也放不了实现:<code>ts(1183)</code>。
                它同样不能替代模块本身 —— 有声明而没有对应的{" "}
                <code>.js</code>,类型检查会通过,运行时会失败。
              </>
            ),
          },
          {
            en: (
              <>
                Three sources for a library&apos;s types, checked in order: the
                package&apos;s own <code>types</code> (or the{" "}
                <code>types</code> condition in <code>exports</code>), then{" "}
                <code>@types</code> from DefinitelyTyped, then a declaration you
                write. All three empty means <code>ts(7016)</code>. Keep the{" "}
                <code>@types</code> major and minor version aligned with the
                library.
              </>
            ),
            zh: (
              <>
                一个库的类型有三个来源,按顺序查:包自带的{" "}
                <code>types</code>(或 <code>exports</code> 里的{" "}
                <code>types</code> 条件)→ DefinitelyTyped 的{" "}
                <code>@types</code> → 你自己写的声明。三个都空就是{" "}
                <code>ts(7016)</code>。<code>@types</code> 的 major 和 minor
                版本要和库本体对齐。
              </>
            ),
          },
          {
            en: (
              <>
                <code>declare</code> states a type and produces no code, so a
                wrong claim fails at run time. <code>declare global</code> is how
                a module reaches the global scope (<code>ts(2669)</code>{" "}
                elsewhere). In a script file <code>declare module &quot;x&quot;</code>{" "}
                declares a module that has no types; in a module file it augments
                one that does, and augmenting an untyped module is{" "}
                <code>ts(2665)</code>.
              </>
            ),
            zh: (
              <>
                <code>declare</code> 只陈述类型、不产出代码,
                所以断言错了会在运行时失败。<code>declare global</code>{" "}
                是模块触及全局作用域的方式(写在别处报{" "}
                <code>ts(2669)</code>)。<code>declare module &quot;x&quot;</code>{" "}
                写在脚本文件里是声明一个没有类型的模块,
                写在模块文件里是扩充一个已有类型的模块;
                去扩充一个没有类型的模块会报 <code>ts(2665)</code>。
              </>
            ),
          },
          {
            en: (
              <>
                Resolution happens at compile time only.{" "}
                <code>moduleResolution</code> decides whether{" "}
                <code>exports</code> and file extensions are honoured, and{" "}
                <code>paths</code> does not change the specifier in the output.
                Whatever runs your code needs its own matching configuration.
              </>
            ),
            zh: (
              <>
                解析只发生在编译期。<code>moduleResolution</code> 决定是否遵守{" "}
                <code>exports</code> 和文件扩展名规则,而 <code>paths</code>{" "}
                不会改动产物里的模块标识。
                真正运行你代码的那一方,需要一份自己的对应配置。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="modules" />
    </main>
  );
}
