"use client";

// 序章 · 为什么要 TypeScript —— 全书的样板章 + 全站首页:
// 深夜 NaN 事故 → 两条时间线(逐帧)→ 类型 = 形状说明书 → 第一次 tsc →
// 类型擦除 → 跑起来的三条路 → 三大误区 → 全书地图 → 动手任务 → 测验 → 要点。

import "./home.css";

import { Hero, Section, Callout, KeyPoints, ChapterFooter } from "@/lib/kit";
import { CodeBlock, CodePair } from "@/lib/code";
import { LabSet } from "@/lib/labs";
import { Quiz } from "@/lib/quiz";
import { T } from "@/lib/i18n";
import { LABS, QUIZ } from "@/lib/home-data";
import { HeroSquiggle, TwoTimelines, ErasureViz, CourseMap } from "./home-viz";

/* ---------- §04 第一次 tsc 的代码样例 ---------- */

const FIRST_JS = {
  en: `// order.js - no warning at any point
const order = { drink: "Jasmine Green", total: 22 };

const bill = order.totle * 2; // typo, and nobody says a word
console.log("Total: $" + bill); // Total: $NaN`,
  zh: `// order.js —— 全程零提示
const order = { drink: "杨枝甘露", total: 22 };

const bill = order.totle * 2; // 拼错了,没人吭声
console.log("合计:¥" + bill); // 合计:¥NaN`,
};

const FIRST_TS = {
  en: `// order.ts - same code, only the file extension changed
const order = { drink: "Jasmine Green", total: 22 };

const bill = order.totle * 2; // red line the moment you save
console.log("Total: $" + bill);`,
  zh: `// order.ts —— 同样的代码,只改了后缀
const order = { drink: "杨枝甘露", total: 22 };

const bill = order.totle * 2; // 保存那一刻,红线
console.log("合计:¥" + bill);`,
};

const LOCAL_TSC = {
  en: `mkdir tea-shop && cd tea-shop
npm i -D typescript      # install the compiler as a dev tool
npx tsc --init           # create tsconfig.json - the subject of chapter 10
# create order.ts, paste the code above into it, then:
npx tsc                  # check and translate: reports totle, produces nothing
npx tsc --noEmit         # check only, no output files - the usual CI command`,
  zh: `mkdir tea-shop && cd tea-shop
npm i -D typescript      # 把编译器装进项目(它只是个开发工具)
npx tsc --init           # 生成 tsconfig.json —— 第 10 章的主角
# 新建 order.ts,把上面那段代码粘进去,然后:
npx tsc                  # 检查 + 翻译:报出 totle 的错,不放行
npx tsc --noEmit         # 只检查不出产物,CI 里最常用的姿势`,
};

export default function HomePage() {
  return (
    <main className="page" data-ch="home">
      <Hero
        ch="home"
        title={{
          en: (
            <>
              Why <span className="grad">TypeScript</span>
            </>
          ),
          zh: (
            <>
              为什么要 <span className="grad">TypeScript</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              You already write JavaScript, and it has cost you time: a
              misspelled property that never reports an error, an undefined that
              spreads, a NaN on the page. This chapter explains what TypeScript
              actually solves, and why the rest of the course is worth your time.
            </>
          ),
          zh: (
            <>
              你会写 JavaScript,也被它坑过:属性拼错不报错、undefined
              一路传染、页面上冒出 NaN。这一章讲清楚 TS 到底解决什么问题 ——
              以及为什么它值得你学完这一整套课。
            </>
          ),
        }}
        chips={[
          { id: "story", n: "01", label: { en: "A $NaN bill", zh: "深夜的 NaN" } },
          {
            id: "timeline",
            n: "02",
            label: { en: "Two timelines", zh: "两条时间线" },
          },
          {
            id: "shape",
            n: "03",
            label: { en: "Types are shapes", zh: "类型 = 形状" },
          },
          { id: "first", n: "04", label: { en: "Your first tsc", zh: "第一次 tsc" } },
          { id: "erase", n: "05", label: { en: "Type erasure", zh: "类型擦除" } },
          { id: "run", n: "06", label: { en: "Three ways to run", zh: "三条路" } },
          {
            id: "myth",
            n: "07",
            label: { en: "Three misconceptions", zh: "三大误区" },
          },
          { id: "map", n: "08", label: { en: "Course map", zh: "全书地图" } },
          { id: "labs", n: "09", label: { en: "Tasks", zh: "动手" } },
          { id: "quiz", n: "10", label: { en: "Quiz", zh: "测验" } },
        ]}
      >
        <HeroSquiggle />
      </Hero>

      {/* ================= §01 深夜的 NaN ================= */}
      <Section
        id="story"
        index="01"
        title={{
          en: "It starts with a bill that says $NaN",
          zh: "从一杯 ¥NaN 的奶茶说起",
        }}
        desc={{
          en: "The most important story in this course. Some version of it happens every day in JavaScript projects.",
          zh: "整门课最重要的一个故事。它每天都在世界各地的 JS 项目里重演。",
        }}
      >
        <Callout
          tone="story"
          title={{
            en: "Day three after the tea shop app went live",
            zh: "奶茶店小程序上线第三天",
          }}
        >
          <T
            en={
              <>
                <p>
                  You wrote an ordering app for a bubble tea shop. Menu, cart,
                  checkout, all in JavaScript. The tests passed and it went live.
                  One line calculates the two-cup discount:{" "}
                  <code>const bill = order.totle * 2</code>. You have probably
                  already spotted it: <b>total is spelled totle</b>.
                </p>
                <p>
                  JavaScript did not spot it. Reading a property that does not
                  exist is not an error in JavaScript. It quietly returns
                  undefined. undefined times 2 is not an error either. It returns
                  NaN. Putting NaN into a string is still not an error. So at
                  1:47 a.m., a customer buying two cups saw &quot;Total:
                  $NaN&quot;, took a screenshot, and sent it to support. You got
                  up at 3 a.m. and read log lines for two hours before you found
                  five letters.
                </p>
                <p>
                  The same code in a .ts file behaves differently. The{" "}
                  <b>moment you save the file</b>, the editor underlines it:
                  there is no totle here, did you mean total? It even suggests the
                  fix.
                </p>
              </>
            }
            zh={
              <>
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
              </>
            }
          />
        </Callout>

        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">
              <T en="STEP 1" zh="第一步" />
            </div>
            <div className="card-title">
              <T en="The typo is silent" zh="拼错,不吭声" />
            </div>
            <p>
              <T
                en="Reading a missing property is legal JavaScript. You get undefined and no warning, so the place where the bug is born produces no signal at all."
                zh="JS 读不存在的属性不报错,给你一个 undefined —— 错误诞生的现场,一点动静都没有。"
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="STEP 2" zh="第二步" />
            </div>
            <div className="card-title">
              <T en="undefined spreads" zh="undefined 传染" />
            </div>
            <p>
              <T
                en="undefined in an arithmetic expression becomes NaN, and NaN is passed on to whatever comes next. The bad value travels far from where it started."
                zh="undefined 参与运算变 NaN,NaN 再传给下游 —— 错误像滴进水里的墨,越漂越远。"
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="STEP 3" zh="第三步" />
            </div>
            <div className="card-title">
              <T en="It surfaces in front of a user" zh="在用户面前引爆" />
            </div>
            <p>
              <T
                en="By the time you see the problem, you are far away from the line that caused it. You have to trace backwards from the symptom."
                zh="等它终于露面,案发现场已经离出错那行十万八千里 —— 你只能从爆炸点往回逐行倒查。"
              />
            </p>
          </div>
        </div>
      </Section>

      {/* ================= §02 两条时间线 ================= */}
      <Section
        id="timeline"
        index="02"
        title={{
          en: "Two timelines: you choose where the error appears",
          zh: "两条时间线:错误在哪炸,你说了算",
        }}
        desc={{
          en: "The same typo, two outcomes. Step through it one frame at a time.",
          zh: "同一个拼写错误,JS 和 TS 两种命运。用播放器一帧一帧看。",
        }}
      >
        <TwoTimelines />
        <Callout
          tone="idea"
          title={{
            en: "Type checking is like security screening at an airport",
            zh: "把类型检查想成机场安检",
          }}
        >
          <T
            en={
              <p>
                Someone will always try to carry something dangerous. The
                question is <b>whether it is found at the gate or in the air</b>.
                TypeScript puts the check at the moment you save the file:
                misspelled properties, wrong arguments, and values that might be
                undefined are stopped before the code takes off. A few seconds at
                the gate is cheaper than an incident later.
              </p>
            }
            zh={
              <p>
                危险品免不了有人带 —— 问题是<b>在登机口拦下,还是在天上发现</b>。
                TypeScript 就是把安检口设在「保存文件」这一刻:所有拼错的属性、
                传错的参数、想不到的 undefined,都在代码起飞前拦住。
                安检慢三秒,好过空中冒烟。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §03 类型 = 形状说明书 ================= */}
      <Section
        id="shape"
        index="03"
        title={{
          en: "What a type is: a description of a value's shape",
          zh: "类型到底是什么:一份「值的形状说明书」",
        }}
        desc={{
          en: 'Do not let the phrase "type system" put you off. The idea is simple: agree in advance what each value looks like.',
          zh: "别被「类型系统」四个字吓住。它的本质是一句大白话:先说好每个值长什么样。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                <code>{"{ drink: string; total: number }"}</code> means: every
                order must have a drink that is a string and a total that is a
                number. That is a <b>type</b>: an agreement, written down before
                the code runs, about the shape of a value. With the agreement in
                place, the compiler has something to check against. When you write
                order.totle, it looks at the agreement, finds no totle, and
                reports it.
              </>
            }
            zh={
              <>
                <code>{"{ drink: string; total: number }"}</code> 翻译成人话就是:
                「凡是订单,必须带一个字符串的 drink 和一个数字的 total」。
                这就是<b>类型(type)</b>:对一个值的形状,事先立下的<b>约定</b>。
                有了约定,编译器才有依据替你把关 —— 你写 order.totle,它翻一眼
                说明书:约定里没有 totle 这一栏,红线伺候。
              </>
            }
          />
        </p>
        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">
              <T en="AGREEMENT" zh="约定" />
            </div>
            <div className="card-title">
              <T en="A type is a description" zh="类型是说明书" />
            </div>
            <p>
              <T
                en="It states which fields a value has and what each one holds. Like a delivery note on a box: tapioca pearls, bagged, 5 kg. You know the contents without opening it."
                zh="写清楚这个值有哪些字段、各是什么。就像奶茶店进货单上写明:珍珠、袋装、5kg —— 不用开箱也知道内容。"
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="CHECK" zh="检查" />
            </div>
            <div className="card-title">
              <T en="The compiler checks it" zh="编译器是验货员" />
            </div>
            <p>
              <T
                en="Every time you use a value, tsc compares it with the description. Does the field exist? Does the type match? If not, it reports the line."
                zh="每次你用一个值,tsc 都对照说明书验一遍:字段存在吗?类型对得上吗?对不上,当场打回。"
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="START" zh="起步" />
            </div>
            <div className="card-title">
              <T en="TypeScript is a superset of JavaScript" zh="TS 是 JS 的超集" />
            </div>
            <p>
              <T
                en="A superset keeps all of JavaScript and adds a layer of types on top. Every line of JavaScript you know still counts. Rename .js to .ts and you have started."
                zh="超集(superset)= JS 全部保留,再往上加一层类型。你会的每一行 JS 都算数,把 .js 改成 .ts 就能开始。"
              />
            </p>
          </div>
        </div>
        <Callout
          tone="deep"
          title={{
            en: 'What "superset" means for you',
            zh: "「超集」意味着什么?",
          }}
        >
          <T
            en={
              <p>
                It means TypeScript is <b>not a new language to learn from
                scratch</b>. Variables, functions, arrays, arrow functions are all
                the JavaScript you already know. The layer TypeScript adds -
                annotations, interface, generics - is <i>description</i>, not
                logic. It describes what your data looks like and what your
                functions take and return. The remaining eleven chapters teach you
                how to write and think about that description.
              </p>
            }
            zh={
              <p>
                意味着 TypeScript <b>不是一门要从头学的新语言</b>。变量、函数、
                数组、箭头函数……全都是你认识的 JS。TS 加的那一层 ——
                类型注解、interface、泛型 —— 是「描述」而不是「逻辑」:
                描述你的数据长什么样、你的函数收什么吐什么。这门课接下来的
                十一章,教的全是这层「描述」怎么写、怎么想。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §04 第一次 tsc ================= */}
      <Section
        id="first"
        index="04"
        title={{
          en: "Your first tsc: see the red line yourself",
          zh: "第一次 tsc:亲眼看红线长什么样",
        }}
        desc={{
          en: "On the left, JavaScript quietly produces NaN. On the right, TypeScript reports the line. This pair of windows is used throughout the course.",
          zh: "左边 JS 静默出 NaN,右边 TS 当场翻脸 —— 这一对窗口,是全书的招牌排版。",
        }}
      >
        <CodePair
          left={
            <CodeBlock
              lang="js"
              title={{
                en: "order.js · silent failure",
                zh: "order.js · 静默事故",
              }}
              code={FIRST_JS}
              note={{
                en: (
                  <>
                    JavaScript reasons like this: totle does not exist, so it is
                    undefined. undefined times 2 is NaN.{" "}
                    <b>No error anywhere, and the user sees the result.</b>
                  </>
                ),
                zh: (
                  <>
                    JS 的逻辑:totle 不存在?那就是 undefined。undefined 乘 2?
                    那就是 NaN。<b>全程零报错,炸给用户看。</b>
                  </>
                ),
              }}
            />
          }
          right={
            <CodeBlock
              lang="ts"
              title={{
                en: "order.ts · error on save",
                zh: "order.ts · 保存即报错",
              }}
              code={FIRST_TS}
              hl={[4]}
              note={{
                en: (
                  <>
                    The exact compiler output:{" "}
                    <code>
                      Property &apos;totle&apos; does not exist on type &apos;
                      {"{ drink: string; total: number; }"}&apos;. Did you mean
                      &apos;total&apos;?
                    </code>{" "}
                    Notice that this code has <b>no type annotations at all</b>.
                    TypeScript worked out the shape of order by itself. That
                    ability is called inference, and chapter 01 is about it.
                  </>
                ),
                zh: (
                  <>
                    报错原文:
                    <code>
                      Property &apos;totle&apos; does not exist on type &apos;
                      {"{ drink: string; total: number; }"}&apos;. Did you mean
                      &apos;total&apos;?
                    </code>{" "}
                    —— 「totle 不存在,你是不是想写 total?」注意:这段代码
                    <b>一个类型注解都没写</b>,TS 自己看懂了 order
                    的形状。这手本事叫推断,01 章整章讲它。
                  </>
                ),
              }}
            />
          }
        />

        <p className="sec-desc" style={{ marginTop: 18 }}>
          <T
            en={
              <>
                Want to try it right now? The fastest way is the{" "}
                <b>TypeScript Playground</b>. Open{" "}
                <a
                  href="https://www.typescriptlang.org/play"
                  target="_blank"
                  rel="noreferrer"
                >
                  typescriptlang.org/play
                </a>{" "}
                - no account needed. Paste code on the left and the red line
                appears immediately. Hover over a variable to see its type. The
                .JS tab on the right shows the compiled output, and you can share
                a link. Every hands-on task in this course can be done there.
              </>
            }
            zh={
              <>
                想现在就试?最快的路是 <b>TypeScript Playground</b>:打开{" "}
                <a
                  href="https://www.typescriptlang.org/play"
                  target="_blank"
                  rel="noreferrer"
                >
                  typescriptlang.org/play
                </a>
                ,免注册。左边贴代码,红线立刻出现;鼠标悬停变量能看类型;
                右侧 .JS 标签是编译产物;还能一键分享链接 ——
                全书的动手任务都在这打。
              </>
            }
          />
        </p>
        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">STEP 1</div>
            <div className="card-title">
              <T en="Paste it in" zh="贴进去" />
            </div>
            <p>
              <T
                en="Paste the order.ts code from the right-hand window into the Playground editor. A red underline appears under totle within a second."
                zh="把右窗那段 order.ts 粘进 Playground 左侧编辑器,totle 底下的红波浪线一秒钟就冒出来。"
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">STEP 2</div>
            <div className="card-title">
              <T en="Read the error" zh="读报错" />
            </div>
            <p>
              <T
                en="Hover over the red line and the full message appears. Compiler messages follow a small number of fixed patterns, so they get easy quickly. The tasks below practise reading them."
                zh="鼠标移到红线上,完整报错弹出来。别怕英文,句式很固定,读三遍就熟 —— Labs 里专门练这个。"
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">STEP 3</div>
            <div className="card-title">
              <T en="Look at the output" zh="看产物" />
            </div>
            <p>
              <T
                en="The .JS tab on the right is the compiled result. You will see that the types are gone. That is type erasure, the subject of §05."
                zh="右侧面板的 .JS 标签就是编译结果 —— 你会发现类型全没了。这就是 §05 要讲的「类型擦除」。"
              />
            </p>
          </div>
        </div>

        <p className="sec-desc" style={{ marginTop: 18 }}>
          <T
            en="Prefer to run it on your own machine? Three commands, five minutes:"
            zh="想在自己电脑上来一遍正式的?三条命令,五分钟:"
          />
        </p>
        <CodeBlock
          lang="bash"
          title={{ en: "terminal · local setup", zh: "terminal · 本地路线" }}
          code={LOCAL_TSC}
          note={{
            en: (
              <>
                <b>tsc does two things: it checks, and it translates.</b> Checking
                means comparing your code against the types and reporting what
                does not match. Translating means removing the types and writing
                .js files. You can ask for the two separately:{" "}
                <code>--noEmit</code> means check only, write nothing.
              </>
            ),
            zh: (
              <>
                <b>tsc 只干两件事:检查 + 翻译。</b>检查:对照类型说明书找错,
                有错就报;翻译:把 .ts 擦掉类型变成 .js。两件事可以分开干 ——
                <code>--noEmit</code> 就是「只安检,不放行产物」。
              </>
            ),
          }}
        />
      </Section>

      {/* ================= §05 类型擦除 ================= */}
      <Section
        id="erase"
        index="05"
        title={{
          en: "Type erasure: after compiling, no type is left",
          zh: "类型擦除:编译完,类型一个都不剩",
        }}
        desc={{
          en: "This is the part of TypeScript that is misunderstood most often, and the part worth understanding early.",
          zh: "这是 TS 最容易被误解的一件事,也是最值得早点想通的一件事。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                Many people assume TypeScript carries the types into the running
                program and keeps checking there. It does the opposite.{" "}
                <b>After compilation every type is removed (type erasure)</b>, the
                output is ordinary JavaScript, and it behaves exactly like
                JavaScript you wrote by hand. Use the three buttons below to see
                it:
              </>
            }
            zh={
              <>
                很多人以为 TS 会把类型「带进」运行时,替你在线上把关。恰恰相反:
                <b>编译后,类型全部消失(type erasure)</b>,产物就是普通 JS,
                运行时行为和你手写 JS 一模一样。点下面三个按钮,亲眼看一遍:
              </>
            }
          />
        </p>
        <ErasureViz />
        <Callout
          tone="warn"
          title={{
            en: "So types do not guard the running program",
            zh: "所以:类型不是运行时的保镖",
          }}
        >
          <T
            en={
              <p>
                Type checking applies to <b>the code you write</b>, not to{" "}
                <b>the data that arrives while the program runs</b>. A JSON
                response with the wrong shape, or strange user input, arrives
                after the types have been erased, so TypeScript cannot help there.
                Runtime protection needs real validation code: an if statement you
                write yourself, or a validation library such as zod. The finale
                comes back to this and shows how the two layers fit together.
              </p>
            }
            zh={
              <p>
                类型检查的对象是<b>你写的代码</b>,不是<b>运行时闯进来的数据</b>。
                接口返回的 JSON 长歪了、用户输入了奇怪的东西 ——
                这些发生在类型被擦掉之后,TS 管不着。运行时的保护要靠真正的校验代码
                (亲手写 if 判断,或用 zod 这类校验库)。这个伏笔埋在这,
                <b>终章「类型思维」回收</b>。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §06 三条路 ================= */}
      <Section
        id="run"
        index="06"
        title={{
          en: "Three ways to run TypeScript code",
          zh: "TS 代码怎么跑起来:三条路",
        }}
        desc={{
          en: "All three end in the same place: what actually executes is JavaScript with the types removed.",
          zh: "不管走哪条,殊途同归 —— 真正被执行的,永远是擦掉类型之后的 JS。",
        }}
      >
        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">
              <T en="OPTION 1 · CLASSIC" zh="路线一 · 经典" />
            </div>
            <div className="card-title">
              <T en="Compile with tsc" zh="tsc 编译" />
            </div>
            <p>
              <T
                en={
                  <>
                    <code>npx tsc</code> checks and translates, producing .js
                    files that Node or the browser runs. This is the most direct
                    way to see that TypeScript is only a compile-time tool.
                  </>
                }
                zh={
                  <>
                    <code>npx tsc</code> 检查 + 翻译,产出 .js 文件,交给 Node
                    或浏览器跑。最正统,也最能看清「TS 只是编译期工具」这件事。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="OPTION 2 · EVERYDAY" zh="路线二 · 日常" />
            </div>
            <div className="card-title">
              <T en="A bundler transpiles" zh="bundler 转译" />
            </div>
            <p>
              <T
                en={
                  <>
                    Build tools such as Vite and esbuild{" "}
                    <b>remove the types without checking them</b>, because that is
                    much faster. Checking is left to your editor while you type,
                    and to <code>tsc --noEmit</code> in CI. This is the usual
                    setup for front-end projects.
                  </>
                }
                zh={
                  <>
                    Vite、esbuild 这类构建工具<b>只擦类型、不做检查</b>
                    (图快)。类型检查交给编辑器实时画红线,CI 里再跑一遍{" "}
                    <code>tsc --noEmit</code> 兜底 —— 前端项目的日常配置。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="OPTION 3 · RECENT" zh="路线三 · 新潮" />
            </div>
            <div className="card-title">
              <T en="Run the .ts file directly" zh="直接跑" />
            </div>
            <p>
              <T
                en="Node 22.18 and later can run a .ts file by stripping the types as it loads, as long as the file uses only erasable syntax (enum, for example, produces runtime code and is not allowed). Deno and Bun have supported this from the start. You skip the build step, but the erasure still happens."
                zh="Node 22.18+ 能原生「边擦边跑」.ts 文件(仅限可擦除语法,enum 这类有运行时产物的不行);Deno、Bun 生来就支持。省了编译步骤,擦除依然发生。"
              />
            </p>
          </div>
        </div>
        <Callout
          tone="idea"
          title={{
            en: "Which one should you pick? Not yet",
            zh: "怎么选?现在先不用选",
          }}
        >
          <T
            en={
              <p>
                While you are learning, <b>the Playground is enough</b>: nothing
                to install, nothing to configure, errors as you type. Chapter 10
                covers tsconfig, and that is the point where you set up a real
                project. For now, remember one thing: all three paths end in
                JavaScript.
              </p>
            }
            zh={
              <p>
                学习阶段,<b>Playground 就是你的主场</b>:免装、免配、实时报错。
                等第 10 章讲 tsconfig 时,再回来认真配一条自己的生产路线。
                现在只要记住一件事:三条路的终点都是 JS。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §07 三大误区 ================= */}
      <Section
        id="myth"
        index="07"
        title={{
          en: "Three common misconceptions",
          zh: "三个流传最广的误区",
        }}
        desc={{
          en: "Clear them up now, so they do not get in the way for the next eleven chapters.",
          zh: "现在破除,省得它们在后面十一章里反复捣乱。",
        }}
      >
        <Callout
          tone="warn"
          title={{
            en: 'Misconception 1: "TypeScript is a different language I have to learn again"',
            zh: "误区一:「TS 是另一门要重学的语言」",
          }}
        >
          <T
            en={
              <p>
                It is not. TypeScript is a superset of JavaScript: every line of
                JavaScript you have written is still valid, and renaming the file
                is a real starting point. The only new part is the layer of types,
                and you can add it gradually. Annotate one function today, describe
                one object tomorrow. Nothing has to be rewritten.
              </p>
            }
            zh={
              <p>
                不是。TS 是 JS 的超集:你写过的每一行 JS 在 TS
                里原样有效,改个后缀就是起点。要新学的只有「类型」这一层描述,
                而且可以渐进 —— 今天给一个函数标注,明天给一个对象定形,
                不需要推倒重来。
              </p>
            }
          />
        </Callout>
        <Callout
          tone="warn"
          title={{
            en: 'Misconception 2: "With types, the running program is safe"',
            zh: "误区二:「加了类型,运行时就安全了」",
          }}
        >
          <T
            en={
              <p>
                Types are <b>erased during compilation</b>, so no check happens
                while the program runs. TypeScript guarantees that your code is
                consistent with itself. It cannot guarantee that data coming from
                outside has the shape you expect. API responses and user input
                still need validation. The finale shows how to connect the two
                layers.
              </p>
            }
            zh={
              <p>
                类型在编译后<b>全部擦除</b>,运行时没有任何检查发生。TS
                保证的是「你的代码内部自洽」,保证不了「外面进来的数据规矩」。
                接口数据、用户输入,该校验还得校验 —— 终章教你怎么把两层防线接起来。
              </p>
            }
          />
        </Callout>
        <Callout
          tone="warn"
          title={{
            en: 'Misconception 3: "TypeScript code runs faster"',
            zh: "误区三:「TS 代码跑得更快」",
          }}
        >
          <T
            en={
              <p>
                It does not. The output is ordinary JavaScript, the engine never
                sees a type, and there is no type-based optimization. What
                TypeScript speeds up is <b>your work</b>: refactoring is safer,
                autocompletion is accurate, and you do not spend a night looking
                for a NaN. The gain is in development, not at runtime.
              </p>
            }
            zh={
              <p>
                不会。编译产物就是普通 JS,引擎看不到任何类型,谈不上按类型优化。
                TS 提速的不是程序,是<b>你</b>:重构敢下手、补全真的准、
                半夜不用起来查 NaN —— 快在开发,不在运行。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §08 全书地图 ================= */}
      <Section
        id="map"
        index="08"
        title={{
          en: "Course map: twelve chapters, one tea shop",
          zh: "全书地图:十二章,一家奶茶店",
        }}
        desc={{
          en: "The full route from writing JavaScript to understanding the type system. The dots in the sidebar record your progress.",
          zh: "从「会 JS」到「懂类型系统」的完整路线。侧栏的小绿灯会记录你的战绩。",
        }}
      >
        <p className="sec-desc">
          <T
            en="The whole course uses one example: the tea shop. Chapter 01 gives its menu types, chapter 03 models order state with a discriminated union, chapter 05 writes a generic container for it, chapters 06 and 07 build order variants with utility types, and the finale puts everything together. By the end you will have built the shop's type system from nothing to something you could ship."
            zh="整本书共用一个世界观:那家奶茶店。01 章给它的菜单标类型,03 章用可辨识联合表达订单状态,05 章用泛型写通用容器,06、07 章用工具类型造订单变体,终章拿它做综合演练 —— 学到后面,你会亲手把这家店的类型系统从零搭到能上线。"
          />
        </p>
        <CourseMap />
      </Section>

      {/* ================= §09 动手任务 ================= */}
      <Section
        id="labs"
        index="09"
        title={{ en: "Hands-on tasks", zh: "动手任务" }}
        desc={{
          en: "Reading is not the same as knowing. Four tasks, so that today is the day TypeScript catches something for you.",
          zh: "看会了不算会。四个任务,今天就把「第一次被 TS 救下」这件事办了。",
        }}
      >
        <LabSet ch="home" items={LABS} />
      </Section>

      {/* ================= §10 通关测验 ================= */}
      <Section
        id="quiz"
        index="10"
        title={{ en: "Chapter quiz", zh: "通关测验" }}
        desc={{
          en: "Seven questions. Get them all right to light up the dot in the sidebar. Every wrong option has its own explanation.",
          zh: "七道题,全对点亮侧栏绿灯。答错不丢人,每个错误选项都有针对性的解释。",
        }}
      >
        <Quiz ch="home" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                A JavaScript mistake shows up at night in production. A TypeScript
                mistake shows up when you save the file. You cannot avoid
                mistakes, but you can choose where they appear.
              </>
            ),
            zh: (
              <>
                JS 的错误在半夜的线上炸,TS 的错误在你保存文件时炸 ——
                错误免不了,但你可以选它在哪炸。
              </>
            ),
          },
          {
            en: (
              <>
                A type describes the shape of a value. It is an <b>agreement</b>{" "}
                written in advance, and the compiler uses it to check every access
                and every argument.
              </>
            ),
            zh: (
              <>
                类型 = 值的形状说明书,一份事先立下的<b>约定</b>;
                编译器拿着说明书,替你验每一次取值和传参。
              </>
            ),
          },
          {
            en: (
              <>
                TypeScript is a <b>superset</b> of JavaScript. All of JavaScript
                stays, and renaming the file is a real starting point. Nothing you
                already know is wasted.
              </>
            ),
            zh: (
              <>
                TS 是 JS 的<b>超集</b>:JS 全部保留,改后缀就能起步 ——
                你会的每一行 JS 都没白学。
              </>
            ),
          },
          {
            en: (
              <>
                After compilation the types are <b>completely erased</b> and the
                output is ordinary JavaScript. There is no extra protection and no
                extra cost at runtime, so data from outside still needs its own
                validation.
              </>
            ),
            zh: (
              <>
                编译后类型<b>全部擦除</b>,产物就是普通 JS:运行时不多一分保护,
                也不多一分开销 —— 外部数据的校验要另外写。
              </>
            ),
          },
          {
            en: (
              <>
                tsc checks and translates. There are three ways to run TypeScript
                (tsc, a bundler, or directly), and all of them end in JavaScript.
                While you are learning, the Playground is enough.
              </>
            ),
            zh: (
              <>
                tsc = 检查 + 翻译;跑 TS 三条路(tsc / bundler / 直接跑),
                终点都是 JS。学习阶段,Playground 是你的主场。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="home" />
    </main>
  );
}
