"use client";

// 序章 · 为什么要 TypeScript —— 全书的样板章 + 全站首页:
// 深夜 NaN 事故 → 两条时间线(逐帧)→ 类型 = 形状说明书 → 第一次 tsc →
// 类型擦除 → 跑起来的三条路 → 三大误区 → 全书地图 → 动手任务 → 测验 → 要点。

import "./home.css";

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
import { LABS, QUIZ } from "@/lib/home-data";
import {
  HeroSquiggle,
  TwoTimelines,
  ErasureViz,
  CourseMap,
} from "./home-viz";

/* ---------- §04 第一次 tsc 的代码样例 ---------- */

const FIRST_JS = `// order.js —— 全程零提示
const order = { drink: "杨枝甘露", total: 22 };

const bill = order.totle * 2; // 拼错了,没人吭声
console.log("合计:¥" + bill); // 合计:¥NaN`;

const FIRST_TS = `// order.ts —— 同样的代码,只改了后缀
const order = { drink: "杨枝甘露", total: 22 };

const bill = order.totle * 2; // 保存那一刻,红线
console.log("合计:¥" + bill);`;

const LOCAL_TSC = `mkdir tea-shop && cd tea-shop
npm i -D typescript      # 把编译器装进项目(它只是个开发工具)
npx tsc --init           # 生成 tsconfig.json —— 第 10 章的主角
# 新建 order.ts,把上面那段代码粘进去,然后:
npx tsc                  # 检查 + 翻译:报出 totle 的错,不放行
npx tsc --noEmit         # 只检查不出产物,CI 里最常用的姿势`;

export default function HomePage() {
  return (
    <main className="page" data-ch="home">
      <Hero
        ch="home"
        title={
          <>
            为什么要 <span className="grad">TypeScript</span>
          </>
        }
        essence={
          <>
            你会写 JavaScript,也被它坑过:属性拼错不报错、undefined
            一路传染、页面上冒出 NaN。这一章讲清楚 TS 到底解决什么问题 ——
            以及为什么它值得你学完这一整套课。
          </>
        }
        chips={[
          { id: "story", n: "01", label: "深夜的 NaN" },
          { id: "timeline", n: "02", label: "两条时间线" },
          { id: "shape", n: "03", label: "类型 = 形状" },
          { id: "first", n: "04", label: "第一次 tsc" },
          { id: "erase", n: "05", label: "类型擦除" },
          { id: "run", n: "06", label: "三条路" },
          { id: "myth", n: "07", label: "三大误区" },
          { id: "map", n: "08", label: "全书地图" },
          { id: "labs", n: "09", label: "动手" },
          { id: "quiz", n: "10", label: "测验" },
        ]}
      >
        <HeroSquiggle />
      </Hero>

      {/* ================= §01 深夜的 NaN ================= */}
      <Section
        id="story"
        index="01"
        title="从一杯 ¥NaN 的奶茶说起"
        desc="整门课最重要的一个故事。它每天都在世界各地的 JS 项目里重演。"
      >
        <Callout tone="story" title="奶茶店小程序上线第三天">
          <p>
            你给一家奶茶店写了点单小程序。菜单、购物车、结算,全用 JavaScript
            写的,测试跑通,顺利上线。代码里有这么一行:
            <code>const bill = order.totle * 2</code> ——
            「双杯优惠」的计价。眼尖的你已经看到了:<b>total 拼成了 totle</b>。
          </p>
          <p>
            但 JavaScript 没看到。读一个不存在的属性?它不报错,安静地给你
            undefined。undefined 乘 2?也不报错,算出 NaN。NaN
            拼进字符串?照样不报错。于是深夜 1:47,一位买两杯四季春的用户,
            看到了「合计:¥NaN」—— 截图、发群、@客服。你凌晨三点爬起来,
            对着日志一行行 console.log,两小时后才找到那 5 个字母。
          </p>
          <p>
            同一段代码,如果文件后缀是 .ts —— 在你<b>保存文件的那一刻</b>,
            编辑器就画出红线:「没有 totle,你是不是想写 total?」
            连改法都替你想好了。
          </p>
        </Callout>

        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">第一步</div>
            <div className="card-title">拼错,不吭声</div>
            <p>
              JS 读不存在的属性不报错,给你一个 undefined ——
              错误诞生的现场,一点动静都没有。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">第二步</div>
            <div className="card-title">undefined 传染</div>
            <p>
              undefined 参与运算变 NaN,NaN 再传给下游 ——
              错误像滴进水里的墨,越漂越远。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">第三步</div>
            <div className="card-title">在用户面前引爆</div>
            <p>
              等它终于露面,案发现场已经离出错那行十万八千里 ——
              你只能从爆炸点往回逐行倒查。
            </p>
          </div>
        </div>
      </Section>

      {/* ================= §02 两条时间线 ================= */}
      <Section
        id="timeline"
        index="02"
        title="两条时间线:错误在哪炸,你说了算"
        desc="同一个拼写错误,JS 和 TS 两种命运。用播放器一帧一帧看。"
      >
        <TwoTimelines />
        <Callout tone="idea" title="把类型检查想成机场安检">
          <p>
            危险品免不了有人带 —— 问题是<b>在登机口拦下,还是在天上发现</b>。
            TypeScript 就是把安检口设在「保存文件」这一刻:所有拼错的属性、
            传错的参数、想不到的 undefined,都在代码起飞前拦住。
            安检慢三秒,好过空中冒烟。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 类型 = 形状说明书 ================= */}
      <Section
        id="shape"
        index="03"
        title="类型到底是什么:一份「值的形状说明书」"
        desc="别被「类型系统」四个字吓住。它的本质是一句大白话:先说好每个值长什么样。"
      >
        <p className="sec-desc">
          <code>{"{ drink: string; total: number }"}</code> 翻译成人话就是:
          「凡是订单,必须带一个字符串的 drink 和一个数字的 total」。
          这就是<b>类型(type)</b>:对一个值的形状,事先立下的<b>约定</b>。
          有了约定,编译器才有依据替你把关 —— 你写 order.totle,它翻一眼
          说明书:约定里没有 totle 这一栏,红线伺候。
        </p>
        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">约定</div>
            <div className="card-title">类型是说明书</div>
            <p>
              写清楚这个值有哪些字段、各是什么。就像奶茶店进货
              单上写明:珍珠、袋装、5kg —— 不用开箱也知道内容。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">检查</div>
            <div className="card-title">编译器是验货员</div>
            <p>
              每次你用一个值,tsc 都对照说明书验一遍:字段存在吗?
              类型对得上吗?对不上,当场打回。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">起步</div>
            <div className="card-title">TS 是 JS 的超集</div>
            <p>
              超集(superset)= JS 全部保留,再往上加一层类型。你会的每一行
              JS 都算数,把 .js 改成 .ts 就能开始。
            </p>
          </div>
        </div>
        <Callout tone="deep" title="「超集」意味着什么?">
          <p>
            意味着 TypeScript <b>不是一门要从头学的新语言</b>。变量、函数、
            数组、箭头函数……全都是你认识的 JS。TS 加的那一层 ——
            类型注解、interface、泛型 —— 是「描述」而不是「逻辑」:
            描述你的数据长什么样、你的函数收什么吐什么。这门课接下来的
            十一章,教的全是这层「描述」怎么写、怎么想。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 第一次 tsc ================= */}
      <Section
        id="first"
        index="04"
        title="第一次 tsc:亲眼看红线长什么样"
        desc="左边 JS 静默出 NaN,右边 TS 当场翻脸 —— 这一对窗口,是全书的招牌排版。"
      >
        <CodePair
          left={
            <CodeBlock
              lang="js"
              title="order.js · 静默事故"
              code={FIRST_JS}
              note={
                <>
                  JS 的逻辑:totle 不存在?那就是 undefined。undefined 乘
                  2?那就是 NaN。<b>全程零报错,炸给用户看。</b>
                </>
              }
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title="order.ts · 保存即报错"
              code={FIRST_TS}
              hl={[4]}
              note={
                <>
                  报错原文:<code>Property &apos;totle&apos; does not exist on
                  type &apos;{"{ drink: string; total: number; }"}&apos;. Did
                  you mean &apos;total&apos;?</code> —— 「totle
                  不存在,你是不是想写 total?」注意:这段代码
                  <b>一个类型注解都没写</b>,TS 自己看懂了 order
                  的形状。这手本事叫推断,01 章整章讲它。
                </>
              }
            />
          }
        />

        <p className="sec-desc" style={{ marginTop: 18 }}>
          想现在就试?最快的路是 <b>TypeScript Playground</b>:打开{" "}
          <a href="https://www.typescriptlang.org/play" target="_blank" rel="noreferrer">
            typescriptlang.org/play
          </a>
          ,免注册。左边贴代码,红线立刻出现;鼠标悬停变量能看类型;
          右侧 .JS 标签是编译产物;还能一键分享链接 ——
          全书的动手任务都在这打。
        </p>
        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">STEP 1</div>
            <div className="card-title">贴进去</div>
            <p>
              把右窗那段 order.ts 粘进 Playground 左侧编辑器,
              totle 底下的红波浪线一秒钟就冒出来。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">STEP 2</div>
            <div className="card-title">读报错</div>
            <p>
              鼠标移到红线上,完整报错弹出来。别怕英文,句式很固定,
              读三遍就熟 —— Labs 里专门练这个。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">STEP 3</div>
            <div className="card-title">看产物</div>
            <p>
              右侧面板的 .JS 标签就是编译结果 —— 你会发现类型全没了。
              这就是 §05 要讲的「类型擦除」。
            </p>
          </div>
        </div>

        <p className="sec-desc" style={{ marginTop: 18 }}>
          想在自己电脑上来一遍正式的?三条命令,五分钟:
        </p>
        <CodeBlock
          lang="bash"
          title="terminal · 本地路线"
          code={LOCAL_TSC}
          note={
            <>
              <b>tsc 只干两件事:检查 + 翻译。</b>检查:对照类型说明书找错,
              有错就报;翻译:把 .ts 擦掉类型变成 .js。两件事可以分开干 ——
              <code>--noEmit</code> 就是「只安检,不放行产物」。
            </>
          }
        />
      </Section>

      {/* ================= §05 类型擦除 ================= */}
      <Section
        id="erase"
        index="05"
        title="类型擦除:编译完,类型一个都不剩"
        desc="这是 TS 最容易被误解的一件事,也是最值得早点想通的一件事。"
      >
        <p className="sec-desc">
          很多人以为 TS 会把类型「带进」运行时,替你在线上把关。恰恰相反:
          <b>编译后,类型全部消失(type erasure)</b>,产物就是普通 JS,
          运行时行为和你手写 JS 一模一样。点下面三个按钮,亲眼看一遍:
        </p>
        <ErasureViz />
        <Callout tone="warn" title="所以:类型不是运行时的保镖">
          <p>
            类型检查的对象是<b>你写的代码</b>,不是<b>运行时闯进来的数据</b>。
            接口返回的 JSON 长歪了、用户输入了奇怪的东西 ——
            这些发生在类型被擦掉之后,TS 管不着。运行时的保护要靠真正的校验代码
            (亲手写 if 判断,或用 zod 这类校验库)。这个伏笔埋在这,
            <b>终章「类型思维」回收</b>。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 三条路 ================= */}
      <Section
        id="run"
        index="06"
        title="TS 代码怎么跑起来:三条路"
        desc="不管走哪条,殊途同归 —— 真正被执行的,永远是擦掉类型之后的 JS。"
      >
        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">路线一 · 经典</div>
            <div className="card-title">tsc 编译</div>
            <p>
              <code>npx tsc</code> 检查 + 翻译,产出 .js 文件,交给 Node
              或浏览器跑。最正统,也最能看清「TS 只是编译期工具」这件事。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">路线二 · 日常</div>
            <div className="card-title">bundler 转译</div>
            <p>
              Vite、esbuild 这类构建工具<b>只擦类型、不做检查</b>
              (图快)。类型检查交给编辑器实时画红线,CI 里再跑一遍{" "}
              <code>tsc --noEmit</code> 兜底 —— 前端项目的日常配置。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">路线三 · 新潮</div>
            <div className="card-title">直接跑</div>
            <p>
              Node 22.18+ 能原生「边擦边跑」.ts 文件(仅限可擦除语法,enum
              这类有运行时产物的不行);Deno、Bun 生来就支持。省了编译步骤,
              擦除依然发生。
            </p>
          </div>
        </div>
        <Callout tone="idea" title="怎么选?现在先不用选">
          <p>
            学习阶段,<b>Playground 就是你的主场</b>:免装、免配、实时报错。
            等第 10 章讲 tsconfig 时,再回来认真配一条自己的生产路线。
            现在只要记住一件事:三条路的终点都是 JS。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 三大误区 ================= */}
      <Section
        id="myth"
        index="07"
        title="三个流传最广的误区"
        desc="现在破除,省得它们在后面十一章里反复捣乱。"
      >
        <Callout tone="warn" title="误区一:「TS 是另一门要重学的语言」">
          <p>
            不是。TS 是 JS 的超集:你写过的每一行 JS 在 TS
            里原样有效,改个后缀就是起点。要新学的只有「类型」这一层描述,
            而且可以渐进 —— 今天给一个函数标注,明天给一个对象定形,
            不需要推倒重来。
          </p>
        </Callout>
        <Callout tone="warn" title="误区二:「加了类型,运行时就安全了」">
          <p>
            类型在编译后<b>全部擦除</b>,运行时没有任何检查发生。TS
            保证的是「你的代码内部自洽」,保证不了「外面进来的数据规矩」。
            接口数据、用户输入,该校验还得校验 —— 终章教你怎么把两层防线接起来。
          </p>
        </Callout>
        <Callout tone="warn" title="误区三:「TS 代码跑得更快」">
          <p>
            不会。编译产物就是普通 JS,引擎看不到任何类型,谈不上按类型优化。
            TS 提速的不是程序,是<b>你</b>:重构敢下手、补全真的准、
            半夜不用起来查 NaN —— 快在开发,不在运行。
          </p>
        </Callout>
      </Section>

      {/* ================= §08 全书地图 ================= */}
      <Section
        id="map"
        index="08"
        title="全书地图:十二章,一家奶茶店"
        desc="从「会 JS」到「懂类型系统」的完整路线。侧栏的小绿灯会记录你的战绩。"
      >
        <p className="sec-desc">
          整本书共用一个世界观:那家奶茶店。01 章给它的菜单标类型,03
          章用可辨识联合表达订单状态,05 章用泛型写通用容器,06、07
          章用工具类型造订单变体,终章拿它做综合演练 ——
          学到后面,你会亲手把这家店的类型系统从零搭到能上线。
        </p>
        <CourseMap />
      </Section>

      {/* ================= §09 动手任务 ================= */}
      <Section
        id="labs"
        index="09"
        title="动手任务"
        desc="看会了不算会。四个任务,今天就把「第一次被 TS 救下」这件事办了。"
      >
        <LabSet ch="home" items={LABS} />
      </Section>

      {/* ================= §10 通关测验 ================= */}
      <Section
        id="quiz"
        index="10"
        title="通关测验"
        desc="七道题,全对点亮侧栏绿灯。答错不丢人,每个错误选项都有针对性的解释。"
      >
        <Quiz ch="home" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            JS 的错误在半夜的线上炸,TS 的错误在你保存文件时炸 ——
            错误免不了,但你可以选它在哪炸。
          </>,
          <>
            类型 = 值的形状说明书,一份事先立下的<b>约定</b>;
            编译器拿着说明书,替你验每一次取值和传参。
          </>,
          <>
            TS 是 JS 的<b>超集</b>:JS 全部保留,改后缀就能起步 ——
            你会的每一行 JS 都没白学。
          </>,
          <>
            编译后类型<b>全部擦除</b>,产物就是普通 JS:运行时不多一分保护,
            也不多一分开销 —— 外部数据的校验要另外写。
          </>,
          <>
            tsc = 检查 + 翻译;跑 TS 三条路(tsc / bundler / 直接跑),
            终点都是 JS。学习阶段,Playground 是你的主场。
          </>,
        ]}
      />

      <ChapterFooter ch="home" />
    </main>
  );
}
