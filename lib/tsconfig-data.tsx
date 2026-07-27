"use client";

// 10 · tsconfig 与严格模式 —— 动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "init-and-count",
    title: "军规初签:tsc --init,开关拨一遍",
    d: "easy",
    tags: ["tsc --init", "strict", "本机"],
    task: (
      <>
        <p>
          本机开个新目录,跑 <code>npx tsc --init</code> 生成规则书。
          然后把 §02 调节台里那段「祖传点单代码」存成{" "}
          <code>order.ts</code>(文件顶部自己补一个{" "}
          <code>declare function findOrder(id: string): {"{ total: number }"} | null;</code>{" "}
          和 <code>declare function submit(x: unknown): void;</code>,
          免得报「找不到名字」)。
        </p>
        <p>
          跑 <code>npx tsc --noEmit</code> 数一数报错;把 tsconfig 里的{" "}
          <code>strict</code> 改成 <code>false</code> 再跑一遍,再数一次。
          两个数字的差,就是军规替你挡下的 bug 数。
        </p>
      </>
    ),
    hint: (
      <>
        <code>--noEmit</code> = 只检查不出货,专门用来验类型。tsc --init
        生成的模板默认 strict: true —— 所以第一遍就是「签了军规」的状态。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="bash"
          title="终端"
          code={`mkdir tsconfig-lab && cd tsconfig-lab
npx tsc --init
# 把演示代码存成 order.ts 后:
npx tsc --noEmit
# strict: true  → 4 个错(noImplicitAny / NullChecks /
#                 PropertyInitialization / catch unknown)
# strict: false → 0 个错 —— bug 还在,只是没人查了`}
        />
        <p>
          再加一层:在 tsconfig 里补{" "}
          <code>{`"noUncheckedIndexedAccess": true`}</code> 后重跑 ——
          第 5 个错(<code>sizes[3]</code> 可能是 undefined)才现身。
          亲眼确认:<b>strict 不包含它</b>。
        </p>
      </>
    ),
  },
  {
    id: "ts-check-rescue",
    title: "一行注释救祖传:@ts-check",
    d: "medium",
    tags: ["@ts-check", "JSDoc", "迁移"],
    task: (
      <>
        <p>
          把下面这段「祖传 JS」存成 <code>boss.js</code>,用 VS Code
          打开 —— 此刻编辑器一声不吭。然后在文件第一行加上{" "}
          <code>{"// @ts-check"}</code>,看红线冒出来几处,逐个修掉。
        </p>
        <CodeBlock
          lang="js"
          title="boss.js"
          code={`const menu = [
  { name: "四季春", price: 12 },
  { name: "奶绿", price: 15 },
];

function cheapest(list) {
  let low = list[0];
  for (const it of list) {
    if (it.pirce < low.price) low = it;
  }
  return low;
}

console.log(cheapest(menu).nmae);`}
        />
      </>
    ),
    hint: (
      <>
        应该能抓到两处拼写(pirce、nmae)。cheapest 的参数 list
        推不出类型?给它补一行 JSDoc:
        <code>{"/** @param {{name: string, price: number}[]} list */"}</code>。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="js"
          title="boss.js · 修好"
          hl={[1, 6, 10, 15]}
          code={`// @ts-check
const menu = [
  { name: "四季春", price: 12 },
  { name: "奶绿", price: 15 },
];
/** @param {{name: string, price: number}[]} list */
function cheapest(list) {
  let low = list[0];
  for (const it of list) {
    if (it.price < low.price) low = it;
  }
  return low;
}

console.log(cheapest(menu).name);`}
          note={
            <>
              一个 .ts 文件都没写,两个线上事故已经消失 ——
              这就是迁移第一步的性价比。JSDoc 是迁移期的临时桥,
              等文件改成 .ts,这些注释就升级成真类型注解。
            </>
          }
        />
      </>
    ),
  },
  {
    id: "playground-fish",
    title: "Playground 抓漏网之鱼",
    d: "medium",
    tags: ["Playground", "noUncheckedIndexedAccess"],
    task: (
      <>
        <p>
          打开 typescriptlang.org/play,左上角 <b>TS Config</b> 面板确认
          strict 已开。粘贴:
        </p>
        <CodeBlock
          lang="ts"
          code={`const sizes = ["small", "medium", "large"];
const s = sizes[3];
console.log(s.toUpperCase());`}
        />
        <p>
          鼠标悬停在 <code>s</code> 上记下类型;再到 TS Config 里勾上{" "}
          <code>noUncheckedIndexedAccess</code>,悬停一次,看类型变成了什么,
          然后把报错修掉。
        </p>
      </>
    ),
    hint: (
      <>
        开关前后,<code>s</code> 的类型会差一个 <code>| undefined</code>。
        修法不止一种:可选链、if 判断、或 <code>??</code> 给默认值。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="ts"
          title="开关后的世界"
          code={`const s = sizes[3];
// 开关前:string —— 编译器盲信下标不越界
// 开关后:string | undefined —— 老实了

// 修法任选:
console.log(s?.toUpperCase());          // ① 可选链
if (s !== undefined) s.toUpperCase();   // ② 收窄(第 03 章)
console.log((s ?? "small").toUpperCase()); // ③ 默认值`}
          note={
            <>
              顺手把 <code>exactOptionalPropertyTypes</code> 也勾上试试:
              <code>{"const o: { a?: string } = { a: undefined }"}</code>{" "}
              会从合法变非法。两条漏网之鱼,都得单独签。
            </>
          }
        />
      </>
    ),
  },
  {
    id: "gradual-migration",
    title: "渐进迁移演练:三个 JS 文件的长征",
    d: "hard",
    tags: ["allowJs", "checkJs", "@ts-expect-error"],
    task: (
      <>
        <p>
          本机建一个小项目:三个 .js 文件(随便写点互相 import
          的函数,故意埋两个拼写错误和一个「可能返回 null 没判」)。
          然后按 §05 的路线走完全程,每一步记录{" "}
          <code>npx tsc --noEmit</code> 的报错数:
        </p>
        <p>
          ① <code>tsc --init</code> 后先只开 allowJs(strict 先改
          false)→ ② 加 checkJs,看错冒出来 → ③ 一个个文件改 .ts,
          修不动的用 <code>@ts-expect-error</code> 记账 → ④ strict
          分项开(先 noImplicitAny,再 strictNullChecks)→ ⑤ 最后{" "}
          <code>strict: true</code>,清掉所有 @ts-expect-error。
        </p>
      </>
    ),
    hint: (
      <>
        关键体验在 ⑤:如果某个 @ts-expect-error 压着的错误已经被你顺手修掉,
        tsc 会反过来报「Unused &apos;@ts-expect-error&apos; directive」——
        债清了,帐也自动销了。这是 @ts-ignore 永远给不了你的。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="bash"
          title="每一步的节奏(示意)"
          code={`npx tsc --init          # 生成规则书
# ① allowJs: true, checkJs 注释掉, strict: false
npx tsc --noEmit        # 0 errors(只收留,不检查)
# ② checkJs: true
npx tsc --noEmit        # 冒出一批 —— bug 一直在,今天才点名
# ③ mv order.js order.ts(一次一个,修完再动下一个)
# ④ noImplicitAny: true → 修;strictNullChecks: true → 修
# ⑤ strict: true + noUncheckedIndexedAccess: true
npx tsc --noEmit        # 0 errors —— 「查过了,真没有」`}
          note={
            <>
              全程系统都能跑 —— 这是渐进迁移和「停业装修」的本质区别。
              真实项目的迁移周期以月计,但节奏完全一样。
            </>
          }
        />
      </>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: (
      <>
        签下 <code>{`"strict": true`}</code>,下面哪个检查<b>并没有</b>
        被打开?
      </>
    ),
    opts: [
      <>strictNullChecks</>,
      <>noImplicitAny</>,
      <>noUncheckedIndexedAccess</>,
      <>useUnknownInCatchVariables</>,
    ],
    correct: 2,
    wrong: [
      <>
        strictNullChecks 是 strict 家族的核心成员 —— 十亿美元错误的克星,
        总开关一签它就上岗。
      </>,
      <>
        noImplicitAny 是 strict 家族的第一条军规:推不出类型不许悄悄 any。
      </>,
      undefined,
      <>
        useUnknownInCatchVariables 在家族里 —— strict 下 catch
        到的变量是 unknown,不是 any。
      </>,
    ],
    why: (
      <>
        noUncheckedIndexedAccess(和 exactOptionalPropertyTypes)都在
        strict <b>之外</b>,要单独开 —— 记住那句「strict ≠ 全部检查」。
        新项目建议第一天就把它一并签上。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>findOrder</code> 声明返回 <code>Order | null</code>,你直接写{" "}
        <code>findOrder(id).total</code>。关着 strictNullChecks
        时会发生什么?
      </>
    ),
    opts: [
      <>编译报错,和开着的时候一样</>,
      <>编译静默通过;哪天真返回 null,运行时抛 TypeError</>,
      <>编译器自动帮你插入判空代码</>,
      <>null 会被自动转成空对象,不会出错</>,
    ],
    correct: 1,
    wrong: [
      <>
        可惜不是 —— 关着时 null 可以赋给任何类型,<code>Order | null</code>{" "}
        和 <code>Order</code> 在编译器眼里没区别,红线不会出现。
      </>,
      undefined,
      <>
        编译器从不改你的运行时行为(类型全部擦除)——
        它只能报错提醒,判空代码永远得你自己写。
      </>,
      <>
        JS 里没有这种魔法:null 就是 null,<code>null.total</code>{" "}
        就是 TypeError。「自动兜底」是不存在的安慰。
      </>,
    ],
    why: (
      <>
        关掉 strictNullChecks,null / undefined 可以冒充一切类型 ——
        「可能没有」从类型里消失,检查无从谈起,炸点顺延到凌晨的线上。
        只开一条军规的预算,请开它。
      </>
    ),
  },
  {
    type: "choice",
    q: <>tsconfig 里的 target 选项,管的是哪件事?</>,
    opts: [
      <>类型检查有多严格</>,
      <>输出 JS 用哪个年代的语法(旧 target 会把新语法降级改写)</>,
      <>import 路径按什么规则解析</>,
      <>用哪个版本的 TypeScript 编译器</>,
    ],
    correct: 1,
    wrong: [
      <>
        检查严不严是 strict 家族的事 —— target 拨到 es5,
        检查照样可以最严;两组选项互不干涉。
      </>,
      undefined,
      <>
        那是 module / moduleResolution 的地盘 —— target 只管语法年代,
        不管模块怎么找。
      </>,
      <>
        编译器版本由 package.json 里的 typescript 依赖决定,
        tsconfig 管不了它。
      </>,
    ],
    why: (
      <>
        target = 产物的语法年代:es5 会把箭头函数、解构统统翻译成 2009
        年的老写法;es2022 原样保留、只擦类型。2026 年的基线是{" "}
        <b>es2022 起步</b>,再往下调之前先问一句:真有古董环境要伺候吗?
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        迁移期要临时压住一行报错。为什么该用 <code>@ts-expect-error</code>{" "}
        而不是 <code>@ts-ignore</code>?
      </>
    ),
    opts: [
      <>@ts-expect-error 能压住更多种类的错误</>,
      <>@ts-ignore 已经被官方废弃了</>,
      <>下面那行的错误消失时,@ts-expect-error 自己会报错,提醒你清账</>,
      <>@ts-expect-error 只在开发环境生效,不影响生产构建</>,
    ],
    correct: 2,
    wrong: [
      <>
        两者压制能力相同 —— 都能让下一行的错误闭嘴。差别不在「压多少」,
        在「错误消失之后谁提醒你」。
      </>,
      <>
        没有废弃,@ts-ignore 仍然合法 —— 只是它永远沉默,
        债还清了它也不吭声,所以不推荐日常用。
      </>,
      undefined,
      <>
        两者都是编译期指令,和环境无关 ——
        编译器读到就生效,不区分开发和生产。
      </>,
    ],
    why: (
      <>
        @ts-expect-error = 「我预期这里有错」。哪天下面不再报错,它反过来报
        「Unused &apos;@ts-expect-error&apos; directive」—— 债有帐、帐会催,
        这就是可清理的技术债和地毯下的灰的区别。
      </>
    ),
  },
  {
    type: "fill",
    q: (
      <>
        有个编译选项,开了之后数组下标取值的类型从 <code>T</code> 变成{" "}
        <code>T | undefined</code>,越界访问从此死在编译期 ——
        它<b>不在 strict 里</b>,名字是____。
      </>
    ),
    placeholder: "选项名(英文)",
    answers: ["noUncheckedIndexedAccess", "nouncheckedindexedaccess"],
    hint: (
      <>
        直译它的名字就是答案:「不放过未检查的下标访问」——
        no + Unchecked + Indexed + Access。
      </>
    ),
    why: (
      <>
        noUncheckedIndexedAccess:<code>sizes[3]</code> 的类型带上{" "}
        <code>| undefined</code>,想用先收窄。官方没把它打包进
        strict(对存量代码误伤偏高),新项目建议第一天单独签上。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        2026 年新起一个直接跑在 Node 上的后端项目,module
        这对选项怎么配最合适?
      </>
    ),
    opts: [
      <>
        <code>{`"module": "nodenext"`}</code>
      </>,
      <>
        <code>{`"module": "esnext" + "moduleResolution": "bundler"`}</code>
      </>,
      <>
        <code>{`"module": "commonjs"`}</code>,老配置最稳
      </>,
      <>
        <code>{`"module": "amd"`}</code>
      </>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        bundler 这套是给 Vite / esbuild 项目的 —— 模块交给打包器处理时才用。
        产物直接给 Node 跑,得按 Node 自己的规矩来:nodenext。
      </>,
      <>
        commonjs 能跑,但它不理会 package.json 的 exports 字段和 ESM
        生态 —— 新项目用它等于一出生就穿旧鞋。存量项目维持现状可以,
        新项目直接 nodenext。
      </>,
      <>
        AMD 是浏览器 require.js 时代的化石,和 Node 后端完全不搭 ——
        这个选项留在考古现场就好。
      </>,
    ],
    why: (
      <>
        口诀:<b>Node 直跑选 nodenext;bundler 打包选 esnext +
        moduleResolution: bundler</b>。前者按 Node 的解析规矩来(认 type /
        exports 字段),后者把模块问题整个让给打包器。
      </>
    ),
  },
  {
    type: "multi",
    q: <>关于 tsconfig,下面哪些说法是对的?(多选)</>,
    opts: [
      <>tsconfig 同时约束 tsc 和编辑器的类型服务,两边规则一致</>,
      <>skipLibCheck: true 跳过 node_modules 里 .d.ts 的全量检查,是常见的务实选择</>,
      <>新项目应该先关 strict,等功能写完再统一开</>,
      <>strict 模式下,catch 到的变量类型是 unknown</>,
      <>exactOptionalPropertyTypes 包含在 strict: true 里</>,
    ],
    correct: [0, 1, 3],
    missHint: (
      <>
        漏了一条 —— 想想 strict 家族里那位管 catch 变量的成员,
        它把 e 从 any 改成了什么?
      </>
    ),
    extraHint: (
      <>
        有一项选多了 —— 要么是把「渐进开 strict 是老项目的策略」
        错套在了新项目头上,要么是忘了哪两条检查在 strict 之外。
      </>
    ),
    why: (
      <>
        A:一本规则书两个读者,编辑器红线和 CI 报错永远一致;B:
        库的声明文件有错不归你修,火力留给自己的代码;D:
        useUnknownInCatchVariables 是军规之一。C 反了 ——
        新项目第一天开 strict 成本为零,拖三个月成本翻倍;E 错 ——
        exactOptionalPropertyTypes 和 noUncheckedIndexedAccess
        都在军规之外。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        接手奶茶店九百行的祖传 JS 点单系统,老板要求「系统一天都不能停」。
        第一步该做什么?
      </>
    ),
    opts: [
      <>全部文件一夜改成 .ts,strict 开满,报错修到天亮</>,
      <>
        开 allowJs(+ checkJs 或逐文件 @ts-check),让 TS
        先进场检查,系统照常跑
      </>,
      <>每个文件头上加 @ts-ignore,先让编译过了再说</>,
      <>把 .js 后缀全部改成 .ts,不用改内容,自然就是 TypeScript 了</>,
    ],
    correct: 1,
    wrong: [
      <>
        这叫「停业装修」:四百个报错一起砸下来,修不完就只能回滚 ——
        老板的「一天都不能停」当场破防。渐进才是正解。
      </>,
      undefined,
      <>
        @ts-ignore 是把检查关掉,不是把 bug 修掉 ——
        全文件压制等于 TS 白装了,连「今天才被点名」的那批 bug
        都见不着。
      </>,
      <>
        改后缀只是换了身衣服:祖传代码里的隐式 any、漏判的
        null 一个都不会少,反而立刻冒一堆错打断所有人 ——
        顺序应该是先 allowJs 收留,再逐个迁移。
      </>,
    ],
    why: (
      <>
        渐进迁移的路线:allowJs(收留)→ checkJs / @ts-check(开灯)→
        逐文件改 .ts(修错)→ strict 分项加严 → 全严格。
        每一步系统都在跑,每一步都比上一步严 —— 这是唯一对老板、
        对你自己都负责的走法。
      </>
    ),
  },
];
