# CLAUDE.md — TSer · 把 TypeScript 讲透

新会话先读完这份文件再动手。

## 这是什么

**TSer(把 TypeScript 讲透)**:面向零基础学习者的交互式 TypeScript 课程网站,
**APIer(~/apier)/ DataData / AlgoAlgo 的姊妹篇**,同一套外壳与设计语言。
承诺:**学完这一套课,TypeScript 就真的会了 —— 不是「会加类型注解」,
是懂类型系统怎么想问题、能读懂报错、能给真实项目设计类型。**

目标受众下限:**会 JavaScript(变量/函数/对象/数组/箭头函数),从没写过 TypeScript**。因此:
- 每个结论必须给「为什么」,不许只给结论;
- 比喻先行,再上术语;术语第一次出现时中文+英文双写(如「收窄(narrowing)」);
- 不假设读者懂编译原理、集合论、其他静态类型语言;
- 代码示例一律 TypeScript(读者会的 JavaScript 是它的子集,看得懂起点)。

**语言:全站纯中文**(与姊妹项目对齐,勿引入 i18n)。英文只出现在:
章节注册表的 en 副标、hero 眉题、代码与术语。

## 文案风格(重要,全站贯穿)

- **陈述,不表演。** 通俗是指「不用术语也能讲明白」,不是「用聊天的口气讲」。
  目标语感:一本写得好的中文技术书,而不是一场直播。
- **禁止出现**:网络用语与俚语(翻车/破防/一把梭/懵掉/背锅/怀疑人生/好得不像话)、
  卖萌语气词(呀/啦/嘛/哦)、装饰性 emoji、插科打诨式自问自答
  (「对吧?」「看明白了吧」「好戏在后头」);
  同样禁止 AI 腔(「值得注意的是」「综上所述」「让我们深入探讨」「赋能」);
- **emoji 只在承载语义时使用**(状态图标 ✓/✕、流程节点标记),
  卡片标题、小节标题、正文一律不加;
- 每章开头用一个生活比喻立住直觉(身份证、安检口、进出货单、模具留洞…),后文反复回扣。
  比喻的检验标准:**每个类比元素都要对应一个技术要件**;
  只为逗趣、不承担解释功能的桥段一律删掉;
- **注意「声音槽位」**:Section 的 desc、Callout 的 title 最容易写飘,
  写完回头单独通读这两处 —— 它们和正文适用同一套标准;
- **报错原文必须是 tsc 的真实输出**,不要凭印象写。拿不准就在 Playground
  或本地 tsc 跑一遍再抄 —— 全书反复要求读者去验证,自己更不能想当然;
- 术语第一次出现时中文+英文双写(如「泛型(generics)」),之后可只用惯用形;
- 别怕句子短。短句有力。

## 课程结构(12 页,由易到难)

`lib/curriculum.ts` 是唯一的章节注册表(路由/编号/标题/色相/阵营/标签)。

- **地基三章(core,蓝青色系)**:序章(/)为什么要 TypeScript(JS 运行时才炸的痛 →
  类型 = 编译期的安检 → 第一次 tsc)→ 01 /types 基础类型与推断(原始类型/数组/对象/
  字面量/注解 vs 推断/any 的诱惑)→ 02 /functions 函数与对象类型(参数/返回值/可选/
  interface vs type/readonly)
- **类型系统三章(type,蓝方)**:03 /narrowing 联合类型与收窄(union/字面量联合/
  typeof·in·instanceof 守卫/可辨识联合/never 穷尽检查)→ 04 /structural 结构化类型
  (鸭子类型/类型兼容/多余属性检查/和 Java 名义类型的对照)→ 05 /generics 泛型
  (为什么需要/泛型函数/extends 约束/泛型接口/常见误区)
- **类型编程两章(meta,粉紫方)**:06 /utility 内置工具类型(Partial/Required/Readonly/
  Pick/Omit/Record/Exclude/Extract/NonNullable/Parameters/ReturnType/Awaited,先会用)→
  07 /type-magic 类型运算(keyof/typeof/索引访问/条件类型/infer/映射类型/模板字面量,
  终点是**亲手重写 06 章用过的工具类型**)
- **工程三章(eng,橙红色系)**:08 /classes 类与接口(成员类型/public·private·protected/
  参数属性/abstract/implements/结构化类型下的 class)→ 09 /modules 模块与声明文件
  (import type/export type/.d.ts/declare/@types/DefinitelyTyped/给 JS 库补类型)→
  10 /tsconfig tsconfig 与严格模式(strict 家族/target·module/noUncheckedIndexedAccess/
  渐进迁移 JS 项目)
- **终章(verdict,金色)**:✦ /mindset 类型思维(satisfies/as const/断言的代价/
  unknown 兜底/何时 any 合理/类型体操入门/总测验)

叙事主线:**类型是「约定的形状」**。贯穿案例:一家奶茶店的点单系统
(菜单 MenuItem、订单 Order、杯型 Size = "small" | "medium" | "large"、糖度、配料),
01 章给它标类型,03 章用可辨识联合表达订单状态,05 章用泛型写通用容器,
06/07 章用工具类型造订单变体(草稿单 Partial<Order>…),终章用它做综合演练 ——
全书一个世界观。

## 技术栈与命令

- Next.js 15(App Router)+ React 19 + TypeScript,**纯 CSS 无 Tailwind**。
- **本机默认 Node 16 跑不动**,一切命令加:
  `export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"`
- 构建验证:`npm run build`;并行写章节时**不要各自跑 build**(.next 冲突),
  用 `npx tsc --noEmit --incremental false` 做类型检查。
- 预览:`.claude/launch.json` 已配置(autoPort,基准端口 3400)。

## 文件布局与所有权

```
app/globals.css        全站设计系统 —— 章节作者【禁止改】
app/layout.tsx         外壳(sidebar/toolbar/cmdk/aurora)—— 禁止改
lib/kit.tsx lib/code.tsx lib/quiz.tsx lib/labs.tsx lib/stepper.tsx
lib/highlight.tsx lib/progress.tsx lib/curriculum.ts   共享库 —— 禁止改
app/<ch>/page.tsx      章节主页面("use client",数据+组合)
app/<ch>/viz.tsx       本章专属可视化组件
app/<ch>/chapter.css   本章专属样式(page.tsx 里【必须】import "./chapter.css",
                       漏了会导致整章样式静默失效 —— DataData 踩过的坑;
                       所有类名带本章前缀,如 narrowing 章用 nr-,防止跨章冲突)
lib/<ch>-data.tsx      本章动手任务 LABS + 测验 QUIZ 数据
```

每章配色由 `<main className="page" data-ch="<章节id>">` 自动生效
(色相注册在 globals.css 的 `[data-ch=…]` 段,已全部就位,勿动)。

## 数据文件约定

- `lib/<ch>-data.tsx` 直接导出常量:`export const LABS: Lab[] = […]`、
  `export const QUIZ: QuizItem[] = […]`(顶部 `"use client";`,可 import CodeBlock)。
- 术语不翻译:TypeScript、interface、union、narrowing、tsconfig 这些保持英文;
  中文正文里第一次出现时「中文(English)」双写。

## 组件契约(共享库 API,按此使用)

### lib/kit.tsx
- `<Hero ch="narrowing" title={<>…<span className="grad">…</span></>} essence={…} chips={[{id,n,label},…]} />`
- `<Section id="guards" index="03" title desc badge>{children}</Section>`(自带滚动淡入)
- `<Callout tone="idea|warn|deep|story|win" title>{<p>…</p>}</Callout>`
- `<Method m="GET" />` 徽章(本项目少用);`<Status code={404} text="Not Found" />`(少用)
- `<KeyPoints points={[…]} />`、`<ChapterFooter ch="narrowing" />`、`<Reveal delay={120}>`

### lib/code.tsx + lib/highlight.tsx
- `<CodeBlock lang="ts|js|json|bash|http|dts" code={string} title? hl?={[行号]} note?={ReactNode} />`
  ts 高亮支持类型关键字(interface/keyof/infer/satisfies…)与内置类型(string/never…);
  dts 与 ts 同规则,窗口标签显示「声明文件 .d.ts」。
- `<CodePair left={<CodeBlock…/>} right={<CodeBlock…/>} />` 双窗对照
  (本书招牌排版:**JS 的写法 vs TS 的写法**、**报错代码 vs 修好代码**)。

### lib/stepper.tsx(逐帧慢放)
- `useStepper(total)` + `<StepControls stepper={s} step={s.step} total={n} />`
- `<FlowStepper title frames={[{stage: ReactNode, msg: ReactNode},…]} />`
  舞台里用 globals.css 的 `.flow / .flow-node(.lit)/ .flow-mid / .flow-line / .flow-packet(.back)`。
- 自由形态动画自建组件,复用 `.viz/.viz-stage/.viz-msg/.viz-ctl` 样式。
- **悬浮气泡防裁剪**:`.viz-scroll` 是 `overflow-y: hidden`、`.viz` 是 `overflow: hidden`;
  要在节点上方/下方挂气泡(如首页 `.hm-tl-tag`),必须在滚动内容自身预留
  `padding-top/bottom`(参考 `.hm-tl` 的 32px)。气泡一律加指向箭头 + 阴影,
  别让它悬空(参考 `.hm-squig-tip`/`.hm-tl-tag` 的 `::before/::after` 写法)。

### lib/quiz.tsx
- `<Quiz ch="narrowing" items={QuizItem[]} />`;题型 choice/multi/fill。
  **禁止通用文案**(「答案不正确」不合格),每个错误选项要有针对性纠错。

### lib/labs.tsx(动手任务)
- `<LabSet ch="narrowing" items={Lab[]} />`
- `Lab = { id(稳定别改), title, d:"easy|medium|hard", tags, task(去哪做/做什么), hint, solution }`
- 任务要真的可做:**首选 TypeScript Playground(typescriptlang.org/play,免注册,
  能看实时报错和 .d.ts 输出)**;也可以是本机 `npm create vite` / `npx tsc --init` 实操。
  solution 给完整可粘贴代码。

### lib/progress.tsx
- 全站进度 context:`toggleLab(pid)`、`reportQuiz(ch, right, total)`、
  `chapterState(ch)`。localStorage 键统一 `tser-*` 前缀。

## 章节页节奏(每章同一个骨架)

直觉比喻(hero + 开场故事)→ 概念拆解(交互可视化/逐帧动画)→
真代码(CodeBlock,可粘进 Playground 验证)→ 常见误区(Callout warn)→
动手任务(LabSet)→ 通关测验(Quiz,6–10 题)→ 要点卡(KeyPoints)→ ChapterFooter。

## 内容事实基准(写作时对齐,别写错)

- TypeScript:微软 2012-10 发布(Anders Hejlsberg 主导),开源,**JS 的超集**;
  类型在编译后**全部擦除**(type erasure),不改变运行时行为。现行版本 5.x;
  官方已宣布用 Go 重写的原生编译器(对外叫 TypeScript 7 计划,快一个数量级),
  写「编译器正在原生化」即可,别编造发布日期。
- 运行 TS 的三条路:① tsc 编译成 JS;② bundler(Vite/esbuild)转译;
  ③ 直接跑:Node 22.18+/23.6+ 原生「类型擦除」运行 .ts(仅限可擦除语法,
  enum/namespace/参数属性不行,对应 tsconfig 的 erasableSyntaxOnly,TS 5.8+),
  Deno/Bun 原生支持。
- `strict: true` 打开的检查族:noImplicitAny、strictNullChecks、strictFunctionTypes、
  strictBindCallApply、strictPropertyInitialization、noImplicitThis、alwaysStrict、
  useUnknownInCatchVariables。**noUncheckedIndexedAccess 和 exactOptionalPropertyTypes
  不在 strict 里**,要单独开。
- interface vs type:能力大部分重叠;interface 独有 declaration merging、
  extends 报错更友好;type 独有 union/条件类型/映射类型。官方 handbook 现行建议:
  随便选,团队一致即可;需要 type 的能力时用 type。别写「interface 性能一定更好」的绝对结论。
- 结构化类型(structural typing):兼容看形状不看名字;对象字面量**直接赋值/传参时**
  有多余属性检查(excess property check / freshness),先存变量再传则不查 —— 这是新手第一大惑,04 章核心。
- 收窄手段:typeof(注意 typeof null === "object")、真值、相等、in、instanceof、
  可辨识联合(discriminated union)、类型谓词 `x is T`、asserts 断言函数;
  TS 5.5 起简单情况能**自动推断类型谓词**(filter(Boolean) 场景)。
- any 关闭检查且会传染;unknown 是类型安全的 any(先收窄才能用);
  never 是空集(穷尽检查用)。catch 变量在 strict 下是 unknown。
- 枚举:enum 有运行时产物且和「可擦除语法」冲突,现代社区更偏
  字面量联合(`type Size = "s" | "m" | "l"`)或 `as const` 对象 —— 讲清取舍,别一刀切说 enum 废弃。
- satisfies(TS 4.9):校验形状但**不改写推断类型**;as const:收窄到字面量并 readonly。
- 常用内置工具类型:Partial/Required/Readonly/Record/Pick/Omit/Exclude/Extract/
  NonNullable/Parameters/ReturnType/InstanceType/ConstructorParameters/Awaited(4.5)/
  NoInfer(5.4)/字符串四件套 Uppercase·Lowercase·Capitalize·Uncapitalize。
- 版本里程碑(写「哪个版本引入」时对齐):3.0 unknown;4.1 模板字面量类型 & 映射键重映射 as;
  4.5 Awaited;4.9 satisfies;5.0 const 类型参数 & 标准装饰器 & verbatimModuleSyntax;
  5.4 NoInfer;5.5 推断类型谓词;5.8 erasableSyntaxOnly。
- 声明文件:.d.ts 只有类型没有实现;第三方类型三来源:库自带(package.json types/exports)、
  DefinitelyTyped(@types/xxx)、自己写 declare module。@types/node 是给 Node API 的。
- tsconfig 现代基线(2026):`"strict": true`、`"target": "es2022"`(或更高)、
  Node 项目 `"module": "nodenext"`,bundler 项目 `"module": "esnext" + "moduleResolution": "bundler"`、
  `"verbatimModuleSyntax": true`、`"skipLibCheck": true` 是常见务实选择。
- 练手环境:TypeScript Playground(typescriptlang.org/play)免注册、可分享链接、
  能切换 TS 版本、能看编译产物和报错 —— 全书动手任务的主场。

## 调研与扩展

写章节前先翻本文件对应小节;拿不准的版本号/行为,在 Playground 或本地 tsc 验证后再写,
宁可少写一个版本号,不写错一个。
