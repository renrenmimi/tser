"use client";

// 09 · 模块与声明文件 —— 进口商品与说明书:
// 类型的进出口 → .d.ts 本体 → 类型三来源 → declare 家族 →
// 实战:给 boba-sdk 补说明书 → 动手任务 → 测验 → 要点。

import "./chapter.css";

import { Hero, Section, Callout, KeyPoints, ChapterFooter } from "@/lib/kit";
import { CodeBlock, CodePair } from "@/lib/code";
import { LabSet } from "@/lib/labs";
import { Quiz } from "@/lib/quiz";
import { LABS, QUIZ } from "@/lib/modules-data";
import { ManualHero, LibShelf, ErasedImports, TypeQuest } from "./viz";

export default function ModulesPage() {
  return (
    <main className="page" data-ch="modules">
      <Hero
        ch="modules"
        title={
          <>
            模块与<span className="grad">声明文件</span>
          </>
        }
        essence={
          <>
            JS 库是进口商品,类型声明是说明书 —— 没说明书的黑盒,
            编译器只能耸耸肩说 any。这一章讲清:说明书长什么样、
            去哪找、找不到怎么自己写。
          </>
        }
        chips={[
          { id: "esm", n: "01", label: "类型的进出口" },
          { id: "dts", n: "02", label: ".d.ts 本体" },
          { id: "sources", n: "03", label: "三来源" },
          { id: "declare", n: "04", label: "declare 家族" },
          { id: "boba-sdk", n: "05", label: "实战:boba-sdk" },
          { id: "labs", n: "06", label: "动手" },
          { id: "quiz", n: "07", label: "测验" },
        ]}
      >
        <ManualHero />
      </Hero>

      {/* ================= §01 类型的进出口 ================= */}
      <Section
        id="esm"
        index="01"
        title="类型的进出口:import type 是怎么回事"
        desc="import/export 你早就会 —— TS 只是给货单上加了一种新货物:类型。"
      >
        <p className="sec-desc">
          先用 30 秒过一遍你已经会的 ES 模块(ESM):具名出口、默认出口、
          进口。TypeScript 的新料只有一个 —— <b>interface 和 type
          也能上货单</b>:
        </p>

        <CodeBlock
          lang="ts"
          title="order.ts + shop.ts · 货单上的两种货物"
          hl={[2, 13]}
          code={`// ---- order.ts:出口 ----
export interface Order {          // 类型也能出口
  id: string;
  size: "small" | "medium" | "large";
  total: number;
}
export const TAX = 0.06;          // 具名出口(值)
export default function createOrder() {
  /* … */
}                                 // 默认出口,一个文件一个

// ---- shop.ts:进口 ----
import createOrder, { TAX, type Order } from "./order";

const o: Order = createOrder();   // 类型当类型用
const withTax = o.total * (1 + TAX);  // 值当值用`}
        />

        <p className="sec-desc">
          问题来了:类型编译后会<b>全部擦除</b>,那进口它们的 import
          语句何去何从?看台子:
        </p>

        <ErasedImports />

        <Callout tone="deep" title="为什么要显式写 type:转译器猜不了">
          <p>
            tsc 看得到整个项目,能自己分析出「Order 只是类型 → 这句 import
            删掉」。但 Vite / esbuild / SWC 这些转译器<b>一次只看一个文件</b>
            ,根本无从判断 Order 是值还是类型 —— 删错一句 import,
            运行时就炸。
          </p>
          <p>
            所以 TS 5.0 的 <code>verbatimModuleSyntax</code> 把规则钉死:
            <b>带 type 的进口一定删,不带的一字不动</b>。你写得显式,
            工具就不用猜 —— 这也是 2026 年 tsconfig 基线里推荐开它的原因。
          </p>
        </Callout>

        <CodeBlock
          lang="ts"
          title="import type / export type 的几种写法"
          code={`import type { Order } from "./order";   // 整句只进类型
import { TAX, type Order } from "./order"; // 混装:值 + 类型
export type { Order } from "./order";   // 转手出口,只出类型`}
          note={
            <>
              经验法则:<b>只在类型标注里用到的名字,进口时就标 type</b>。
              编辑器的自动导入(auto-import)现在也默认这么干。
            </>
          }
        />
      </Section>

      {/* ================= §02 .d.ts 本体 ================= */}
      <Section
        id="dts"
        index="02"
        title=".d.ts:只有形状,没有实现"
        desc="说明书不含商品本身 —— 它告诉你每个按钮是干嘛的,但按钮不在纸上。"
      >
        <p className="sec-desc">
          <b>声明文件(declaration file,.d.ts)</b>就是模块的说明书:
          把一个模块「对外长什么样」全部写下来,但<b>一行实现都没有</b>。
          它不是手写才有的 —— 编译器自己就会生产:
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title="order.ts · 商品本体"
              code={`export const TAX = 0.06;

export function createOrder(
  items: string[],
): { id: string; total: number } {
  const total =
    items.length * 15 * (1 + TAX);
  return {
    id: "MT-" + Date.now(),
    total,
  };
}`}
            />
          }
          right={
            <CodeBlock
              lang="dts"
              title="order.d.ts · 自动生成的说明书"
              code={`export declare const TAX = 0.06;

export declare function createOrder(
  items: string[],
): { id: string; total: number };
// 函数体没了,只剩形状。
// 生成命令:
// npx tsc order.ts --declaration`}
            />
          }
        />

        <Callout tone="story" title="你以为的「内置」,其实也是声明文件">
          <p>
            <code>document</code>、<code>fetch</code>、<code>Promise</code>{" "}
            这些「天生就有」的东西,类型从哪来?—— 也是 .d.ts。TypeScript
            自带一摞:<b>lib.dom.d.ts</b> 管浏览器世界,
            <b>lib.es2022.d.ts</b> 这类管 JS 语言本身,tsconfig 的{" "}
            <code>lib</code> 选项决定装哪几本。
          </p>
          <p>
            在编辑器里按住 Ctrl/Cmd 点一下 <code>fetch</code>,
            跳进去的就是这本说明书 —— 亲眼看一次,「内置」的神秘感就没了。
          </p>
        </Callout>

        <CodeBlock
          lang="dts"
          title="lib.dom.d.ts(节选)· document 和 fetch 的出处"
          code={`declare var document: Document;

declare function fetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response>;`}
          note={
            <>
              注意 <code>declare</code> 这个词:「实现不在这儿,
              但我保证运行时有」—— §04 专门讲它。
            </>
          }
        />

        <LibShelf />
      </Section>

      {/* ================= §03 三来源 ================= */}
      <Section
        id="sources"
        index="03"
        title="说明书从哪来:三来源"
        desc="npm 上的库分三种命:自带说明书的、有人代写的、三无的。"
      >
        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">SOURCE 1</div>
            <div className="card-title">📦 库自带</div>
            <p>
              TS 写的库编译时顺手 <code>--declaration</code>,
              package.json 用 <code>types</code>(或 exports 里的 types
              条件)指路 —— 装完即有,零操作。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">SOURCE 2</div>
            <div className="card-title">📚 DefinitelyTyped</div>
            <p>
              社区代写说明书的大仓库,发布成 <code>@types/*</code> 包:
              <code>npm i -D @types/lodash</code>。老牌 JS 库几乎全有。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">SOURCE 3</div>
            <div className="card-title">✍️ 自己写</div>
            <p>
              前两条都落空?<code>declare module</code> 自己动手 ——
              §05 手把手带你给一个三无库补出像样的说明书。
            </p>
          </div>
        </div>

        <TypeQuest />

        <p className="sec-desc">
          第一站「库自带」长什么样?打开任何一个 TS 写的库的
          package.json,找这个字段:
        </p>

        <CodeBlock
          lang="json"
          title="node_modules/boba-ui/package.json · 随箱说明书的指路牌"
          hl={[5]}
          code={`{
  "name": "boba-ui",
  "version": "2.1.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}`}
        />

        <CodeBlock
          lang="bash"
          title="第二站:@types 专柜的两笔常见采购"
          code={`# lodash 的社区说明书(注意 -D:类型只在编译期用)
npm i -D @types/lodash

# Node 内置 API(fs、path、process…)的说明书
npm i -D @types/node`}
          note={
            <>
              命名规则死记:npm 包 <code>xxx</code> 的说明书就叫{" "}
              <code>@types/xxx</code>。<b>@types/node 是给 Node 自身 API
              的</b> —— 写 Node 项目没装它,连 <code>fs</code>{" "}
              都 import 不了。
            </>
          }
        />

        <Callout tone="warn" title="误区:@types 版本和库版本漂移">
          <p>
            说明书是志愿者写的,可能比商品慢半拍:装了 lodash 新版、
            @types/lodash 还停在旧版,类型和实际行为就会对不上。
            约定是 <b>@types 的 major.minor 跟随库本体</b> ——
            类型「说谎」时,第一件事查这两个版本号是否对齐。
          </p>
        </Callout>

        <Callout tone="deep" title="skipLibCheck 的务实一句话">
          <p>
            <code>skipLibCheck: true</code> 跳过的是<b>说明书内部</b>
            的体检(.d.ts 文件之间的互相检查),你自己代码对库的调用
            <b>照查不误</b> —— 换来编译提速,还能躲开两份 @types
            打架的无解报错,所以它是 2026 年 tsconfig 基线里的务实默认。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 declare 家族 ================= */}
      <Section
        id="declare"
        index="04"
        title="declare 家族:「我保证运行时有这个东西」"
        desc="declare 不创造任何东西 —— 它只是向编译器打包票。"
      >
        <p className="sec-desc">
          有些东西确实存在于运行时,但编译器看不见:构建工具注入的全局常量、
          <code>&lt;script&gt;</code> 标签带进来的第三方函数、没有类型的
          npm 包…… <b>declare</b> 就是打包票专用章:
          「运行时有,类型是这样,信我」。
        </p>

        <CodeBlock
          lang="dts"
          title="globals.d.ts · 打包票的三种姿势"
          hl={[2, 5, 11]}
          code={`// 构建工具(如 Vite 的 define)注入的全局常量
declare const BUILD_TIME: string;

// <script> 标签带进来的全局函数(比如统计脚本)
declare function gtag(
  command: string,
  ...args: unknown[]
): void;

// 给整个没类型的模块打包票
declare module "legacy-lib" {
  export function stir(times: number): void;
}`}
        />

        <p className="sec-desc">
          最常见的实战需求:<b>往 window 上挂了东西,想让它有类型</b>。
          正确姿势是 <code>declare global</code>:
        </p>

        <CodeBlock
          lang="dts"
          title="window-config.d.ts · 给 window 加字段的正确姿势"
          hl={[2, 4]}
          code={`// 有一句 import/export,这个文件才算「模块」
export {};

declare global {
  interface Window {
    __SHOP_CONFIG__: { city: string; vip: boolean };
  }
}

// 之后在任何文件里:
// window.__SHOP_CONFIG__.city   ✅ 有类型、有补全`}
          note={
            <>
              为什么要 <code>export {"{}"}</code>?declare global
              只能出现在<b>模块</b>里;一个没有任何 import/export
              的文件会被当成全局脚本,这一句空出口就是它的「模块身份证」。
            </>
          }
        />

        <Callout tone="warn" title="误区:声明是承诺,不是魔法">
          <p>
            declare 写得再漂亮,<b>运行时的东西不会因此多出一件</b>。
            declare 了 gtag 但统计脚本没加载?运行时照样{" "}
            <code>gtag is not defined</code>。类型检查过了、一跑就炸,
            先查三件事:脚本真的加载了吗、包真的导出了这个名字吗、
            拼写对了吗。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 实战:boba-sdk ================= */}
      <Section
        id="boba-sdk"
        index="05"
        title="实战:给三无库 boba-sdk 补一本说明书"
        desc="从一句止血,到像样的 .d.ts —— any 的洞是一点点补小的。"
      >
        <div className="md-vroute" aria-hidden>
          <span className="md-vstep">
            <span className="n">v0</span>一句止血
          </span>
          <span className="md-varrow">→</span>
          <span className="md-vstep">
            <span className="n">v1</span>描出形状
          </span>
          <span className="md-varrow">→</span>
          <span className="md-vstep">
            <span className="n">v2</span>顺手打磨
          </span>
        </div>

        <p className="sec-desc">
          设定:奶茶店项目要接一个(假想的)老 JS 包 <b>boba-sdk</b>,
          没类型、@types 也没有。一 import 就撞墙:
        </p>

        <CodeBlock
          lang="ts"
          title="shop.ts · 撞墙现场"
          hl={[1]}
          code={`import { fetchMenu, order } from "boba-sdk";
// ❌ ts(7016): Could not find a declaration file for
//    module 'boba-sdk'. Try \`npm i --save-dev
//    @types/boba-sdk\` if it exists or add a new
//    declaration (.d.ts) file containing
//    \`declare module 'boba-sdk';\``}
        />

        <p className="sec-desc">
          <b>第一步:一句止血。</b>在项目里建个{" "}
          <code>types/boba-sdk.d.ts</code>(放哪都行,只要在 tsconfig 的
          include 范围内):
        </p>

        <CodeBlock
          lang="dts"
          title="types/boba-sdk.d.ts · v0 —— 止血版"
          code={`declare module "boba-sdk";
// 报错消失。代价:整个库 = any,保护也为零。
// 这只是止血带,不是终点。`}
        />

        <p className="sec-desc">
          <b>第二步:把用到的部分描出来。</b>不用一口气写完整个库 ——
          你 import 了什么,就先给什么画形状:
        </p>

        <CodeBlock
          lang="dts"
          title="types/boba-sdk.d.ts · v1 —— 描形状"
          hl={[2, 8, 10]}
          code={`declare module "boba-sdk" {
  export interface MenuItem {
    name: string;
    price: number;
    soldOut?: boolean;
  }

  export function fetchMenu(shopId: string): Promise<MenuItem[]>;

  export function order(
    item: MenuItem,
    size: "small" | "medium" | "large",
  ): Promise<string>;              // 返回订单号
}`}
          note={
            <>
              到这一步,<code>fetchMenu</code> 的返回值能自动补全、
              <code>order</code> 传错杯型会被拦 ——
              这就是从黑盒到白盒的分界线。
            </>
          }
        />

        <p className="sec-desc">
          <b>第三步:顺手打磨。</b>看了眼 boba-sdk 的文档,发现它还有
          默认导出的客户端和事件回调 —— 一并补上:
        </p>

        <CodeBlock
          lang="dts"
          title="types/boba-sdk.d.ts · v2 —— 打磨版"
          hl={[10, 13]}
          code={`declare module "boba-sdk" {
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
}`}
        />

        <Callout tone="win" title="补到哪算够?">
          <p>
            <b>用到多少,描多少</b> —— any 的洞逐次补小,没人规定要一次写完。
            真写出一份完整靠谱的,顺手给 DefinitelyTyped 提个 PR:
            你的 <code>@types/boba-sdk</code> 一发布,
            下一个用这个库的人就不用再遭一遍罪。
          </p>
        </Callout>

        <Callout tone="warn" title="最后一个误区:把说明书当商品">
          <p>
            .d.ts 里<b>没有代码</b>。如果项目里只有{" "}
            <code>helpers.d.ts</code> 而没有对应的 helpers.js,那{" "}
            <code>import {"{ helper }"} from &quot;./helpers&quot;</code>{" "}
            能通过类型检查,一运行就报「模块不存在」——
            编译器读的是说明书,运行时找的是商品,两样得都在。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 动手任务 ================= */}
      <Section
        id="labs"
        index="06"
        title="动手任务"
        desc="四个任务:看说明书怎么生成、装一次 @types、再亲手写一本。"
      >
        <LabSet ch="modules" items={LABS} />
      </Section>

      {/* ================= §07 通关测验 ================= */}
      <Section
        id="quiz"
        index="07"
        title="通关测验"
        desc="九道题,验一验你能不能给任何一个库找到(或写出)说明书。"
      >
        <Quiz ch="modules" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            JS 库是商品,.d.ts 是说明书:只有形状、没有实现 ——
            没说明书的库,编译器只能给 any。
          </>,
          <>
            <code>import type</code> 的进口编译后整句蒸发;
            verbatimModuleSyntax 时代显式写 type,单文件转译器不用猜。
          </>,
          <>
            找说明书三站:库自带(package.json 的 types 字段)→
            @types(DefinitelyTyped)→ 自己 declare module,命中即停;
            全落空 = ts(7016)。
          </>,
          <>
            declare 家族是打包票:declare const/function 补全局、declare
            module 补模块、declare global 给 window 加字段(记得{" "}
            <code>export {"{}"}</code>)。
          </>,
          <>
            声明是承诺不是魔法:declare 得再漂亮,运行时没有照样炸;
            @types 版本要和库本体对齐。
          </>,
          <>
            skipLibCheck 只跳过说明书内部的体检,你的代码照查 ——
            务实默认开。
          </>,
        ]}
      />

      <ChapterFooter ch="modules" />
    </main>
  );
}
