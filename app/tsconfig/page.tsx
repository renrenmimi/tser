"use client";

// 10 · tsconfig 与严格模式 —— 军规与游戏难度:
// 规则书 → strict 军规逐条签 → 军规之外的漏网之鱼 → 产物设置 →
// 祖传 JS 渐进迁移 → 常见误区 → 动手任务 → 测验 → 要点。

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
import { LABS, QUIZ } from "@/lib/tsconfig-data";
import {
  HeroDifficulty,
  StrictPanel,
  TargetSwitch,
  MigrateStepper,
} from "./viz";

export default function TsconfigPage() {
  return (
    <main className="page" data-ch="tsconfig">
      <Hero
        ch="tsconfig"
        title={
          <>
            tsconfig 与<span className="grad">严格模式</span>
          </>
        }
        essence={
          <>
            同一份代码,在同事电脑上编译报错,在你电脑上一路绿灯 ——
            代码没变,变的是规则。这一章讲那本规则书:tsconfig.json。
            strict 是你和编译器签的军规,签得越严,线上越稳。
          </>
        }
        chips={[
          { id: "rulebook", n: "01", label: "规则书" },
          { id: "strict", n: "02", label: "strict 军规" },
          { id: "beyond", n: "03", label: "漏网之鱼" },
          { id: "output", n: "04", label: "产物设置" },
          { id: "migrate", n: "05", label: "渐进迁移" },
          { id: "pitfalls", n: "06", label: "误区" },
          { id: "labs", n: "07", label: "动手" },
          { id: "quiz", n: "08", label: "测验" },
        ]}
      >
        <HeroDifficulty />
      </Hero>

      {/* ================= §01 规则书 ================= */}
      <Section
        id="rulebook"
        index="01"
        title="tsconfig.json:tsc 和编辑器共用的规则书"
        desc="打游戏先选难度:同一张地图,休闲难度随便浪,地狱难度寸步留神 —— TypeScript 也一样。"
      >
        <Callout tone="story" title="游戏难度选择器">
          <p>
            你玩过的每个游戏都有难度设置:同一关,休闲模式怪不咬人,
            地狱模式走错一步就重来。<b>tsconfig.json 就是 TypeScript
            的难度选择器</b>:同一份代码,规则不同,结论就不同 ——
            「这段代码有没有问题」的答案,一半写在代码里,一半写在这个文件里。
          </p>
          <p>
            它管两个人:命令行里的 <code>tsc</code>,和编辑器里那个
            给你画红线的类型服务 —— 两边读的是<b>同一本规则书</b>,
            所以编辑器里的红线和 CI 里的报错永远一致。生成它只要一句:
          </p>
        </Callout>

        <CodeBlock
          lang="bash"
          title="生成规则书"
          code={`npx tsc --init
# Created a new tsconfig.json`}
          note={
            <>
              生成的文件里全是注释掉的选项加解释,像一本带批注的说明书。
              顺带一提:tsconfig 是 JSONC —— 允许写注释的 JSON,
              放心往里写「为什么开这个」。
            </>
          }
        />

        <CodeBlock
          lang="json"
          title="tsconfig.json · 一份 2026 年的务实基线"
          hl={[3, 4]}
          code={`{
  "compilerOptions": {
    "strict": true,
    "target": "es2022",
    "module": "nodenext",
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src"]
}`}
          note={
            <>
              别急着背 —— 这一章过完,这份文件里每一行你都能说出「为什么」。
              先记一个总纲:compilerOptions 里的选项分三类。
            </>
          }
        />

        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">第一类 · 检查多严</div>
            <div className="card-title">strict 家族</div>
            <p>
              noImplicitAny、strictNullChecks…… 决定编译器揪错揪得多狠。
              这是本章的重头戏,§02 逐条签。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">第二类 · 产物长啥样</div>
            <div className="card-title">target / module</div>
            <p>
              输出的 JS 是哪个年代的语法、用哪种模块格式、放到哪个目录 ——
              §04 拨给你看。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">第三类 · 文件从哪来</div>
            <div className="card-title">include / paths</div>
            <p>
              哪些文件归 TS 管(include/exclude)、import
              的路径别名怎么解析(paths)—— 划定规则书的管辖范围。
            </p>
          </div>
        </div>
      </Section>

      {/* ================= §02 strict 军规 ================= */}
      <Section
        id="strict"
        index="02"
        title="strict 军规:一个总开关,八条纪律"
        desc="strict: true 不是一个检查,是一支检查队 —— 八条军规一次全签。先上调节台亲手拨一遍。"
      >
        <p className="sec-desc">
          <code>{`"strict": true`}</code> 打开的是一整个家族:noImplicitAny、
          strictNullChecks、strictFunctionTypes、strictBindCallApply、
          strictPropertyInitialization、noImplicitThis、alwaysStrict、
          useUnknownInCatchVariables。名字不用背,感觉必须有 ——
          下面这段祖传代码埋了 5 个 bug,开关拨一个,看编译器多看见几个:
        </p>

        <StrictPanel />

        <p className="sec-desc">
          八条军规里,有两条值得单独拎出来敬礼。第一条是{" "}
          <b>noImplicitAny</b> —— 它守的是 TypeScript 的国境线:
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title="关 · 静默放行"
              hl={[1, 4]}
              code={`function total(items) {
  // items 被悄悄推成 any,
  // 编译器从此不看这个函数
  return items.reduce(
    (s, it) => s + it.pirce, 0
  ); // pirce 拼错了,没人吭声
}

total(order.items); // NaN,上线后才发现`}
              note={
                <>
                  推不出类型 → 默认 any → 检查全关。字段拼错、参数传错,
                  编译器全程微笑 —— <b>你以为在写 TS,其实那几行是 JS</b>。
                </>
              }
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title="开 · 当场拦下"
              hl={[1]}
              code={`function total(items) {
//             ~~~~~
// TS7006: Parameter 'items'
// implicitly has an 'any' type.

// 你只好写清楚:
function total2(items: OrderItem[]) {
  return items.reduce(
    (s, it) => s + it.price, 0
  ); // 现在拼错 price 会当场报错
}`}
              note={
                <>
                  「说不清类型就别想编译过」—— 逼你把约定写出来。
                  写出来之后,拼写错误、传参错误全部死在保存那一刻。
                </>
              }
            />
          }
        />

        <p className="sec-desc">
          第二条是 <b>strictNullChecks</b>,它对付的是软件史上最贵的一个发明:
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title="关 · null 冒充一切"
              hl={[4]}
              code={`// findOrder 返回 Order | null
const order = findOrder("A-101");

console.log(order.total);
// 编译:通过 ✓
// 凌晨两点的线上:
// TypeError: Cannot read
// properties of null`}
              note={
                <>
                  关掉时,null 和 undefined 可以赋给<b>任何类型</b> ——
                  Order 的位置上躺着一个 null,编译器看不见。
                </>
              }
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title="开 · 先安检再使用"
              hl={[3, 6]}
              code={`const order = findOrder("A-101");

console.log(order.total);
// TS18047: 'order' is possibly 'null'.

if (order !== null) {
  console.log(order.total); // ✓
}
// 第 03 章的收窄,在这里上岗`}
              note={
                <>
                  「可能没有」被写进类型,想用就得先检查 ——
                  半夜的 TypeError 变成了下午茶时间的红线。
                </>
              }
            />
          }
        />

        <Callout tone="deep" title="十亿美元的错误">
          <p>
            null 引用是 Tony Hoare 在 1965 年发明的,他本人在 2009
            年公开道歉,称之为「我的十亿美元错误(billion-dollar
            mistake)」—— 半个多世纪里,它造成的崩溃、漏洞和损失早已不止
            十亿。strictNullChecks 就是 TypeScript 对这笔账的回答:
            <b>「可能为空」必须写进类型,想用先检查。</b>
            只开一条军规的预算,请开它。
          </p>
        </Callout>

        <p className="sec-desc">剩下几条,一张表过 —— 重点看「关掉会漏什么」:</p>

        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>军规</th>
                <th>管什么</th>
                <th>关掉会漏掉什么</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>strictFunctionTypes</b>
                </td>
                <td>函数类型的参数按更严格的规则比对</td>
                <td>「吃 Animal 的函数」的位置塞进「只吃 Cat 的函数」,喂狗时炸</td>
              </tr>
              <tr>
                <td>
                  <b>strictBindCallApply</b>
                </td>
                <td>bind / call / apply 的参数也要对上原函数</td>
                <td>
                  <code>fn.call(this, 错的参数)</code> 静默通过
                </td>
              </tr>
              <tr>
                <td>
                  <b>strictPropertyInitialization</b>
                </td>
                <td>class 属性声明了就必须初始化</td>
                <td>「回头再赋值」的属性一直是 undefined,用时才炸</td>
              </tr>
              <tr>
                <td>
                  <b>noImplicitThis</b>
                </td>
                <td>this 推不出类型时报错</td>
                <td>回调里的 this 指到天边,取值全是 undefined</td>
              </tr>
              <tr>
                <td>
                  <b>alwaysStrict</b>
                </td>
                <td>产物统一带 &quot;use strict&quot;</td>
                <td>JS 老式松散模式的各种幽灵行为</td>
              </tr>
              <tr>
                <td>
                  <b>useUnknownInCatchVariables</b>
                </td>
                <td>catch 变量是 unknown 不是 any</td>
                <td>
                  <code>e.message</code> 直接用 —— 但 throw
                  出来的未必是 Error,可能是个字符串
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout tone="idea" title="一条军规牵着另一条">
          <p>
            细节一枚:strictPropertyInitialization 要靠 strictNullChecks
            才能生效 —— 「没初始化」本质上就是「值是 undefined」,
            后者不开,前者无从谈起。这也是为什么官方推荐直接{" "}
            <code>strict: true</code> 打包签:军规之间是配套的,拆开签容易漏。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 漏网之鱼 ================= */}
      <Section
        id="beyond"
        index="03"
        title="strict ≠ 全部检查:军规之外的漏网之鱼"
        desc="签完八条军规就高枕无忧?有两条很值钱的检查,strict: true 并不包含。"
      >
        <p className="sec-desc">
          第一条是 <b>noUncheckedIndexedAccess</b>。strict
          全开的情况下,下面左边这段照样编译通过 —— 数组下标越界,
          strictNullChecks 管不到:
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title="关(strict 全开也如此)"
              hl={[3]}
              code={`const sizes =
  ["small", "medium", "large"];
sizes[3].toUpperCase();
// sizes[3] 的类型:string
// 编译:通过 ✓
// 运行:TypeError —— 第 4 杯
// 奶茶不存在`}
              note={
                <>
                  编译器默认相信「下标取出来的都是 string」——
                  可数组只有 3 个元素,<code>sizes[3]</code> 是 undefined。
                </>
              }
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title="开 · 下标取值自带问号"
              hl={[2, 4]}
              code={`const size = sizes[3];
// 类型:string | undefined

sizes[3].toUpperCase();
// TS2532: Object is
// possibly 'undefined'.

sizes[3]?.toUpperCase(); // ✓`}
              note={
                <>
                  下标取值一律变成 <code>T | undefined</code>,
                  想用先收窄 —— 越界这个经典事故,从此死在编译期。
                </>
              }
            />
          }
        />

        <p className="sec-desc">
          第二条是 <b>exactOptionalPropertyTypes</b>:区分「没有这个键」和
          「键在,但值是 undefined」——
        </p>

        <CodeBlock
          lang="ts"
          title="exactOptionalPropertyTypes"
          hl={[6]}
          code={`interface Order {
  topping?: string; // 可选:可以不写这个键
}

// 关:下面这行合法 —— undefined 混了进去
const o: Order = { topping: undefined };
// 开:报错 —— 「可选」是「可以没有」,
// 不是「可以塞个 undefined 进来」
// ("topping" in o) 的答案从此可信`}
          note={
            <>
              听着像抬杠,实则很实用:<code>{`"topping" in o`}</code>、
              <code>Object.keys()</code> 这些运行时判断,
              只有在这条规则下才和类型严格对齐。
            </>
          }
        />

        <Callout tone="warn" title="记住这句:strict ≠ 全部检查">
          <p>
            noUncheckedIndexedAccess 和 exactOptionalPropertyTypes
            都<b>不在 strict 里</b>,要单独开。为什么官方不打包?
            因为它们对存量代码的「误伤率」偏高 —— 每一次数组下标访问都要判空,
            老项目一开可能冒出几百个错。新项目没有这个包袱:
            <b>建议第一天就把 noUncheckedIndexedAccess 签上。</b>
          </p>
        </Callout>
      </Section>

      {/* ================= §04 产物设置 ================= */}
      <Section
        id="output"
        index="04"
        title="产物侧:target、module,和它们的朋友们"
        desc="检查完了总得出货 —— 输出的 JS 长什么样,由这一组选项决定。"
      >
        <p className="sec-desc">
          <b>target</b> 决定输出 JS 的「语法年代」:tsc 会把 target
          之后才出现的语法翻译成老写法。拨一下看看:
        </p>

        <TargetSwitch />

        <Callout tone="idea" title="target 怎么选">
          <p>
            2026 年的答案很简单:<b>es2022 起步</b>,现代浏览器和在维护的
            Node 版本都吃得下。真要伺候古董环境再往下调 ——
            target 不是「越新越好」也不是「越稳越好」,
            它是你对<b>运行环境</b>的承诺,承诺给谁,先看清谁来跑。
          </p>
        </Callout>

        <p className="sec-desc">
          <b>module + moduleResolution</b> 决定模块的格式与找法 ——
          这对选项按「谁消费产物」分两条路,背下来能少踩八成配置坑:
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="json"
              title="Node 直跑的项目"
              hl={[3]}
              code={`{
  "compilerOptions": {
    "module": "nodenext",
    "target": "es2022",
    "strict": true
  }
}`}
              note={
                <>
                  nodenext:按 Node 自己的规矩解析模块(认 package.json 的
                  type 和 exports 字段)。产物给 Node 跑,就选它。
                </>
              }
            />
          }
          right={
            <CodeBlock
              lang="json"
              title="Vite / esbuild 打包的项目"
              hl={[3, 4]}
              code={`{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler",
    "target": "es2022",
    "strict": true
  }
}`}
              note={
                <>
                  bundler:模块留给打包器处理,TS 只管类型 ——
                  解析规则向 Vite/esbuild 的实际行为看齐。前端项目选它。
                </>
              }
            />
          }
        />

        <p className="sec-desc">剩下的产物选项,一句话一个:</p>

        <div className="grid-2">
          <div className="card">
            <div className="card-title">lib</div>
            <p>
              声明运行环境有哪些内置 API:写 <code>{`"dom"`}</code> 才认识
              document,写 <code>{`"es2022"`}</code> 才认识
              Array.prototype.at —— 环境有什么,就声明什么。
            </p>
          </div>
          <div className="card">
            <div className="card-title">outDir / rootDir</div>
            <p>
              产物去哪(<code>dist</code>)、源码在哪(<code>src</code>)——
              不设 outDir,编译出的 .js 会和 .ts 混住一屋,场面很难看。
            </p>
          </div>
          <div className="card">
            <div className="card-title">sourceMap</div>
            <p>
              产物和源码之间的地图:开了它,调试器里断点打在 .ts
              上而不是编译产物上。一句话:开。
            </p>
          </div>
          <div className="card">
            <div className="card-title">✂️ verbatimModuleSyntax</div>
            <p>
              回扣第 09 章:只当类型用的导入必须写{" "}
              <code>import type</code>,否则报错 ——
              编译器不用猜「这个 import 能不能删」,擦除干净利落。
            </p>
          </div>
        </div>

        <Callout tone="deep" title="skipLibCheck:务实的妥协">
          <p>
            <code>skipLibCheck: true</code> 跳过对所有 .d.ts
            文件(主要是 node_modules 里那堆)的全量检查。理论上不够纯洁 ——
            万一某个库的声明文件真有错呢?但现实是:那些错<b>不归你修</b>,
            却能把你的构建拖慢、甚至因为两个库的全局声明打架而编译失败。
            社区的主流选择:开。把检查的火力留给自己的代码。
          </p>
          <p>
            顺带收个伏笔:Node 22.18+ 已经能<b>直接跑 .ts 文件</b>
            (只做类型擦除,不做检查)。但仅限「可擦除语法」——
            enum、namespace、参数属性这些有运行时产物的语法不行,
            tsconfig 里对应的开关叫 <code>erasableSyntaxOnly</code>(TS 5.8+)。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 渐进迁移 ================= */}
      <Section
        id="migrate"
        index="05"
        title="实战:祖传 JS 项目,渐进迁移"
        desc="奶茶店老板的点单系统是三个 JS 文件,九百行,长期没人敢改 —— 现在轮到你动。"
      >
        <p className="sec-desc">
          最忌讳的做法是「停业装修」:全部改成 .ts、strict
          一次开满,然后面对四百个报错无从下手。正确的做法是
          <b>渐进(incremental)</b>:每一步都保持系统能跑,每一步都比上一步严。
          走一遍:
        </p>

        <MigrateStepper />

        <p className="sec-desc">
          第 2 天那步不想动 tsconfig 也行 —— 单个文件头上加一行注释,
          编辑器立刻开始检查这个 JS 文件:
        </p>

        <CodeBlock
          lang="js"
          title="boss.js · 一行注释先开灯"
          hl={[1]}
          code={`// @ts-check
/** @type {{ name: string, price: number }[]} */
const menu = loadMenu();

menu.forEach((it) => {
  console.log(it.name, it.pirce);
  //                      ~~~~~
  // 编辑器:Property 'pirce' does not
  // exist. Did you mean 'price'?
});`}
          note={
            <>
              连 .ts 都还没改,拼写错误已经抓到了。JSDoc 注释(
              <code>@type</code>)能给 JS 补类型 ——
              这是迁移期的临时桥,不是终点。
            </>
          }
        />

        <p className="sec-desc">
          迁移路上总有一时修不动的错。压住它的两个注释,人品天差地别:
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="ts"
              title="@ts-ignore · 无期限沉默"
              hl={[1]}
              code={`// @ts-ignore
legacy.doSomething(order);

// 下面这行哪天修好了,
// @ts-ignore 也不会提醒你 ——
// 它永远沉默,债永远挂着`}
              note={<>盖住错误,顺便盖住「错误已经不存在」这个好消息。</>}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title="@ts-expect-error · 有帐可查的债"
              hl={[1]}
              code={`// @ts-expect-error 等 legacy 补类型
legacy.doSomething(order);

// 哪天下面不再报错,这行注释
// 自己会报错:
// Unused '@ts-expect-error'
// directive. —— 提醒你来清账`}
              note={
                <>
                  「我预期这里有错」—— 错误消失时它反过来报错,
                  逼你把过期的债销掉。<b>迁移期一律用它。</b>
                </>
              }
            />
          }
        />
      </Section>

      {/* ================= §06 误区 ================= */}
      <Section
        id="pitfalls"
        index="06"
        title="三个常见误区"
        desc="配置的坑大多不在「不会配」,在「想当然」。"
      >
        <Callout tone="warn" title="误区一 · 「新项目先不开 strict,跑起来再说」">
          <p>
            顺序反了。strict 的成本随代码量线性增长:第一天开,成本是零 ——
            每个错在你写下它的那一刻就被纠正;三个月后再开,
            迎接你的是几百个报错和「要不算了」的冲动。
            <b>老项目渐进开是策略,新项目不开是欠债</b> ——
            而且这笔债的利息,比你想的高。
          </p>
        </Callout>

        <Callout tone="warn" title="误区二 · 把 @ts-ignore 当日常">
          <p>
            每一个 @ts-ignore 都是一句「编译器你闭嘴」。偶尔为之是战术,
            养成习惯就是把类型系统整个架空 —— 你以为项目有检查,
            实际上到处是免检通道,<b>没有帐的债最后都算在半夜值班的人头上</b>。
            真绕不过去:用 @ts-expect-error 留个案底,写明原因,定期清账。
          </p>
        </Callout>

        <Callout tone="warn" title="误区三 · 「target 当然越新越好」">
          <p>
            target 不是版本号攀比,是对运行环境的承诺。产物要跑在老企业内网的
            浏览器上,target 定 esnext 就是把 TypeError 直接快递到用户桌面 ——
            编译器不会拦你,因为<b>「产物跑在哪」这件事,只有你知道</b>。
            先回答「谁来跑」,再决定「多新」。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 动手任务 ================= */}
      <Section
        id="labs"
        index="07"
        title="动手任务"
        desc="规则书这种东西,读十遍不如亲手签一遍 —— 本地终端和 Playground 都用上。"
      >
        <LabSet ch="tsconfig" items={LABS} />
      </Section>

      {/* ================= §08 通关测验 ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="八道题,验一验军规签得牢不牢。"
      >
        <Quiz ch="tsconfig" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            tsconfig.json 是 tsc 和编辑器共用的规则书:同一份代码,
            规则不同结论就不同。选项分三类:检查多严 / 产物长啥样 / 文件从哪来。
          </>,
          <>
            <code>strict: true</code> 一次签八条军规:noImplicitAny、
            strictNullChecks、strictFunctionTypes、strictBindCallApply、
            strictPropertyInitialization、noImplicitThis、alwaysStrict、
            useUnknownInCatchVariables。新项目第一天就签。
          </>,
          <>
            strict ≠ 全部检查:noUncheckedIndexedAccess(下标取值变{" "}
            <code>T | undefined</code>)和 exactOptionalPropertyTypes
            在军规之外,要单独开。
          </>,
          <>
            产物侧口诀:target 看运行环境(es2022 起步);Node 项目{" "}
            <code>module: nodenext</code>,bundler 项目{" "}
            <code>esnext + moduleResolution: bundler</code>;
            verbatimModuleSyntax 和 skipLibCheck 是务实标配。
          </>,
          <>
            迁移祖传 JS 走渐进路线:allowJs → checkJs(或
            @ts-check)→ 逐文件改 .ts → strict 分项开 ——
            每一步系统都在跑,每一步都比上一步严。
          </>,
          <>
            压错误用 @ts-expect-error 不用 @ts-ignore:前者在错误消失时
            自己报错,是有帐可查、可以清掉的债。
          </>,
        ]}
      />

      <ChapterFooter ch="tsconfig" />
    </main>
  );
}
