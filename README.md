# TSer · 把 TypeScript 讲透

面向零基础学习者的交互式 TypeScript 课程网站。从「为什么要类型」讲起,
把类型系统讲到能读懂报错、能设计类型、能做类型编程。

APIer(把 API 讲透)/ DataData(看得见的数据结构)的姊妹篇,同一套设计语言。

## 课程地图(12 章)

| # | 章节 | 内容 |
|---|------|------|
| 00 | 序章 · 为什么要 TypeScript | JS 运行时才炸的痛 / 类型=编译期安检 / 类型擦除 / 第一次 tsc |
| 01 | 基础类型与推断 | 原始类型 / 数组对象 / 字面量 / 注解 vs 推断 / any 的诱惑 |
| 02 | 函数与对象类型 | 参数返回值 / 可选与默认 / interface vs type / readonly |
| 03 | 联合类型与收窄 | union / typeof·in·instanceof / 可辨识联合 / never 穷尽 |
| 04 | 结构化类型 | 鸭子类型 / 类型兼容 / 多余属性检查 / 名义类型对照 |
| 05 | 泛型 | 泛型函数 / extends 约束 / 泛型接口 / 常见误区 |
| 06 | 内置工具类型 | Partial / Pick / Omit / Record / ReturnType / Awaited |
| 07 | 类型运算 | keyof / typeof / 索引访问 / 条件类型 / infer / 映射类型 |
| 08 | 类与接口 | 访问修饰符 / 参数属性 / abstract / implements |
| 09 | 模块与声明文件 | import type / .d.ts / declare / @types / DefinitelyTyped |
| 10 | tsconfig 与严格模式 | strict 家族 / target·module / 渐进迁移 |
| ✦ | 终章 · 类型思维 | satisfies / as const / unknown 兜底 / 类型体操 / 总测验 |

每章统一节奏:直觉比喻 → 交互可视化 → 能跑的真代码(可粘进 TypeScript
Playground 验证)→ 常见误区 → 动手任务 → 通关测验 → 要点卡。进度存在浏览器本地。

## 跑起来

```bash
# 需要 Node 22(本机默认 16 跑不动)
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
npm install
npm run dev        # 默认 3000;或 npm run dev -- -p 3400
```

技术栈:Next.js 15(App Router)+ React 19 + TypeScript,纯 CSS 无依赖。
顶栏「☾ / ☀」切换深浅主题,⌘K 快速跳转章节。

开发规范与内容事实基准见 [CLAUDE.md](CLAUDE.md)。
