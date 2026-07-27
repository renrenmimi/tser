// 课程注册表 —— 全站唯一的章节清单。
// 侧栏、命令面板、章节页脚(上一章/下一章)、进度系统都从这里取数据。
// 新增章节:在 CHAPTERS 里插入一条,并保证 app/<id>/page.tsx 存在,
// 且 globals.css 的 [data-ch=…] 色相注册表里有对应条目。

export type ChapterId =
  | "home"
  | "types"
  | "functions"
  | "narrowing"
  | "structural"
  | "generics"
  | "utility"
  | "type-magic"
  | "classes"
  | "modules"
  | "tsconfig"
  | "mindset";

export interface Chapter {
  id: ChapterId;
  href: string;
  /** 章节编号展示:00–10,终章用 ✦ */
  num: string;
  title: string;
  /** 英文副标 —— hero 眉题与侧栏小字 */
  en: string;
  /** 一句话本质 */
  essence: string;
  /** oklch 色相角,决定整章主题色(与 globals.css 注册表一致) */
  hue: number;
  /** 阵营:core 地基 / type 类型系统 / meta 类型编程 / eng 工程落地 / verdict 终章 */
  camp: "core" | "type" | "meta" | "eng" | "verdict";
  /** 难度 1–5 */
  level: 1 | 2 | 3 | 4 | 5;
  /** 命令面板搜索关键词 */
  tags: string[];
}

export const CHAPTERS: Chapter[] = [
  {
    id: "home",
    href: "/",
    num: "00",
    title: "序章 · 为什么要 TypeScript",
    en: "Why TypeScript",
    essence: "JavaScript 的错误在半夜的线上炸,TypeScript 的错误在你保存文件时炸。",
    hue: 210,
    camp: "core",
    level: 1,
    tags: ["TypeScript", "类型", "编译", "tsc", "JavaScript", "undefined"],
  },
  {
    id: "types",
    href: "/types",
    num: "01",
    title: "基础类型与推断",
    en: "Types & Inference",
    essence: "给每个值一张「身份证」—— 大多数时候,TypeScript 自己就能看出来。",
    hue: 250,
    camp: "core",
    level: 1,
    tags: ["string", "number", "boolean", "数组", "推断", "inference", "any", "字面量"],
  },
  {
    id: "functions",
    href: "/functions",
    num: "02",
    title: "函数与对象类型",
    en: "Functions & Object Types",
    essence: "参数进来是什么形状,返回值出去是什么形状 —— 写清楚,谁调用谁安心。",
    hue: 150,
    camp: "core",
    level: 1,
    tags: ["函数", "参数", "返回值", "可选", "interface", "type", "对象类型", "readonly"],
  },
  {
    id: "narrowing",
    href: "/narrowing",
    num: "03",
    title: "联合类型与收窄",
    en: "Unions & Narrowing",
    essence: "「可能是 A 也可能是 B」不可怕,可怕的是不检查就当 A 用。",
    hue: 196,
    camp: "type",
    level: 2,
    tags: ["union", "联合类型", "收窄", "narrowing", "typeof", "in", "可辨识联合", "never"],
  },
  {
    id: "structural",
    href: "/structural",
    num: "04",
    title: "结构化类型",
    en: "Structural Typing",
    essence: "TypeScript 不问你「姓什么」,只看你「长什么样」—— 鸭子胜过血统。",
    hue: 230,
    camp: "type",
    level: 2,
    tags: ["结构化", "structural", "鸭子类型", "兼容", "多余属性", "duck typing"],
  },
  {
    id: "generics",
    href: "/generics",
    num: "05",
    title: "泛型",
    en: "Generics",
    essence: "先别急着说是什么类型 —— 留一个洞,调用的人来填。",
    hue: 280,
    camp: "type",
    level: 3,
    tags: ["泛型", "generic", "T", "extends", "约束", "constraint", "默认类型"],
  },
  {
    id: "utility",
    href: "/utility",
    num: "06",
    title: "内置工具类型",
    en: "Utility Types",
    essence: "Partial、Pick、Omit…… 官方送你一套「类型改锥」,先会用再谈造。",
    hue: 330,
    camp: "meta",
    level: 3,
    tags: ["Partial", "Pick", "Omit", "Record", "ReturnType", "Awaited", "工具类型"],
  },
  {
    id: "type-magic",
    href: "/type-magic",
    num: "07",
    title: "类型运算",
    en: "keyof, Conditional & Mapped Types",
    essence: "把上一章的改锥拆开看:keyof、条件类型、映射类型 —— 类型也能编程。",
    hue: 300,
    camp: "meta",
    level: 4,
    tags: ["keyof", "typeof", "条件类型", "infer", "mapped", "映射类型", "模板字面量"],
  },
  {
    id: "classes",
    href: "/classes",
    num: "08",
    title: "类与接口",
    en: "Classes in TypeScript",
    essence: "class 不只是语法糖:访问修饰符、abstract、implements,各管一段秩序。",
    hue: 262,
    camp: "eng",
    level: 3,
    tags: ["class", "类", "private", "protected", "abstract", "implements", "继承"],
  },
  {
    id: "modules",
    href: "/modules",
    num: "09",
    title: "模块与声明文件",
    en: "Modules & Declaration Files",
    essence: ".d.ts 是给编译器看的说明书 —— 没有它,再好的 JS 库也是黑盒。",
    hue: 22,
    camp: "eng",
    level: 3,
    tags: ["module", "import", "export", "d.ts", "declare", "@types", "DefinitelyTyped"],
  },
  {
    id: "tsconfig",
    href: "/tsconfig",
    num: "10",
    title: "tsconfig 与严格模式",
    en: "tsconfig & Strict Mode",
    essence: "同一份代码,规则不同结论就不同 —— strict 是你和编译器签的军规。",
    hue: 350,
    camp: "eng",
    level: 4,
    tags: ["tsconfig", "strict", "strictNullChecks", "target", "module", "编译选项"],
  },
  {
    id: "mindset",
    href: "/mindset",
    num: "✦",
    title: "终章 · 类型思维",
    en: "Thinking in Types",
    essence: "类型不是给编译器交差,是把你脑子里的约定写成代码 —— 这是心法。",
    hue: 55,
    camp: "verdict",
    level: 4,
    tags: ["satisfies", "as const", "unknown", "断言", "心法", "类型体操", "总测验"],
  },
];

export function chapterByPath(path: string): Chapter {
  if (path === "/") return CHAPTERS[0];
  const hit = CHAPTERS.find(
    (c) => c.href !== "/" && (path === c.href || path.startsWith(c.href + "/")),
  );
  return hit ?? CHAPTERS[0];
}

export function prevNext(id: ChapterId): { prev?: Chapter; next?: Chapter } {
  const i = CHAPTERS.findIndex((c) => c.id === id);
  return {
    prev: i > 0 ? CHAPTERS[i - 1] : undefined,
    next: i >= 0 && i < CHAPTERS.length - 1 ? CHAPTERS[i + 1] : undefined,
  };
}
