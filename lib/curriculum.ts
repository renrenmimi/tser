// 课程注册表 —— 全站唯一的章节清单。
// 侧栏、命令面板、章节页脚(上一章/下一章)、进度系统都从这里取数据。
// 新增章节:在 CHAPTERS 里插入一条,并保证 app/<id>/page.tsx 存在,
// 且 globals.css 的 [data-ch=…] 色相注册表里有对应条目。
// 文案字段是 Loc<…> 双语对;消费方用 useL() 解析(本文件保持纯数据,无 "use client")。

import type { Loc } from "@/lib/i18n";

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
  title: Loc<string>;
  /** 副标 —— hero 眉题与侧栏小字 */
  en: Loc<string>;
  /** 一句话本质 */
  essence: Loc<string>;
  /** oklch 色相角,决定整章主题色(与 globals.css 注册表一致) */
  hue: number;
  /** 阵营:core 地基 / type 类型系统 / meta 类型编程 / eng 工程落地 / verdict 终章 */
  camp: "core" | "type" | "meta" | "eng" | "verdict";
  /** 难度 1–5 */
  level: 1 | 2 | 3 | 4 | 5;
  /** 命令面板搜索关键词 */
  tags: Loc<string[]>;
}

export const CHAPTERS: Chapter[] = [
  {
    id: "home",
    href: "/",
    num: "00",
    title: {
      en: "Prologue · Why TypeScript",
      zh: "序章 · 为什么要 TypeScript",
    },
    en: { en: "Compile time vs. runtime", zh: "Why TypeScript" },
    essence: {
      en: "A JavaScript mistake shows up at night, in production. A TypeScript mistake shows up when you save the file.",
      zh: "JavaScript 的错误在半夜的线上炸,TypeScript 的错误在你保存文件时炸。",
    },
    hue: 210,
    camp: "core",
    level: 1,
    tags: {
      en: ["TypeScript", "types", "compile", "tsc", "JavaScript", "undefined"],
      zh: ["TypeScript", "类型", "编译", "tsc", "JavaScript", "undefined"],
    },
  },
  {
    id: "types",
    href: "/types",
    num: "01",
    title: { en: "Basic types and inference", zh: "基础类型与推断" },
    en: { en: "Primitives, literals, inference", zh: "Types & Inference" },
    essence: {
      en: "Every value carries an identity card. Most of the time TypeScript can read it for you.",
      zh: "给每个值一张「身份证」—— 大多数时候,TypeScript 自己就能看出来。",
    },
    hue: 250,
    camp: "core",
    level: 1,
    tags: {
      en: [
        "string",
        "number",
        "boolean",
        "array",
        "inference",
        "any",
        "literal types",
        "as const",
      ],
      zh: [
        "string",
        "number",
        "boolean",
        "数组",
        "推断",
        "inference",
        "any",
        "字面量",
      ],
    },
  },
  {
    id: "functions",
    href: "/functions",
    num: "02",
    title: { en: "Functions and object types", zh: "函数与对象类型" },
    en: {
      en: "Parameters, returns, interfaces",
      zh: "Functions & Object Types",
    },
    essence: {
      en: "Write down the shape that goes in and the shape that comes out. Then every caller knows what to expect.",
      zh: "参数进来是什么形状,返回值出去是什么形状 —— 写清楚,谁调用谁安心。",
    },
    hue: 150,
    camp: "core",
    level: 1,
    tags: {
      en: [
        "function",
        "parameter",
        "return type",
        "optional",
        "interface",
        "type",
        "object type",
        "readonly",
      ],
      zh: [
        "函数",
        "参数",
        "返回值",
        "可选",
        "interface",
        "type",
        "对象类型",
        "readonly",
      ],
    },
  },
  {
    id: "narrowing",
    href: "/narrowing",
    num: "03",
    title: { en: "Unions and narrowing", zh: "联合类型与收窄" },
    en: { en: "typeof, in, discriminated unions", zh: "Unions & Narrowing" },
    essence: {
      en: '"It could be A or it could be B" is not the problem. Using it as A without checking is.',
      zh: "「可能是 A 也可能是 B」不可怕,可怕的是不检查就当 A 用。",
    },
    hue: 196,
    camp: "type",
    level: 2,
    tags: {
      en: [
        "union",
        "narrowing",
        "typeof",
        "in",
        "instanceof",
        "discriminated union",
        "never",
        "type predicate",
      ],
      zh: [
        "union",
        "联合类型",
        "收窄",
        "narrowing",
        "typeof",
        "in",
        "可辨识联合",
        "never",
      ],
    },
  },
  {
    id: "structural",
    href: "/structural",
    num: "04",
    title: { en: "Structural typing", zh: "结构化类型" },
    en: { en: "Shapes, not names", zh: "Structural Typing" },
    essence: {
      en: "TypeScript does not ask what a type is called. It only checks what shape the value has.",
      zh: "TypeScript 不问你「姓什么」,只看你「长什么样」—— 鸭子胜过血统。",
    },
    hue: 230,
    camp: "type",
    level: 2,
    tags: {
      en: [
        "structural typing",
        "duck typing",
        "assignability",
        "excess property check",
        "nominal typing",
      ],
      zh: [
        "结构化",
        "structural",
        "鸭子类型",
        "兼容",
        "多余属性",
        "duck typing",
      ],
    },
  },
  {
    id: "generics",
    href: "/generics",
    num: "05",
    title: { en: "Generics", zh: "泛型" },
    en: { en: "Type parameters and constraints", zh: "Generics" },
    essence: {
      en: "Do not commit to one type yet. Leave a hole, and let the caller fill it in.",
      zh: "先别急着说是什么类型 —— 留一个洞,调用的人来填。",
    },
    hue: 280,
    camp: "type",
    level: 3,
    tags: {
      en: [
        "generics",
        "type parameter",
        "T",
        "extends",
        "constraint",
        "default type parameter",
        "inference",
      ],
      zh: ["泛型", "generic", "T", "extends", "约束", "constraint", "默认类型"],
    },
  },
  {
    id: "utility",
    href: "/utility",
    num: "06",
    title: { en: "Built-in utility types", zh: "内置工具类型" },
    en: { en: "Partial, Pick, Omit, Record", zh: "Utility Types" },
    essence: {
      en: "Partial, Pick, Omit and the rest are a standard toolkit. Learn to use them before you build your own.",
      zh: "Partial、Pick、Omit…… 官方送你一套「类型改锥」,先会用再谈造。",
    },
    hue: 330,
    camp: "meta",
    level: 3,
    tags: {
      en: [
        "Partial",
        "Pick",
        "Omit",
        "Record",
        "ReturnType",
        "Awaited",
        "utility types",
      ],
      zh: [
        "Partial",
        "Pick",
        "Omit",
        "Record",
        "ReturnType",
        "Awaited",
        "工具类型",
      ],
    },
  },
  {
    id: "type-magic",
    href: "/type-magic",
    num: "07",
    title: { en: "Type operators", zh: "类型运算" },
    en: {
      en: "keyof, conditional, mapped",
      zh: "keyof, Conditional & Mapped Types",
    },
    essence: {
      en: "Open up the toolkit from the last chapter: keyof, conditional types, mapped types. Types can compute.",
      zh: "把上一章的改锥拆开看:keyof、条件类型、映射类型 —— 类型也能编程。",
    },
    hue: 300,
    camp: "meta",
    level: 4,
    tags: {
      en: [
        "keyof",
        "typeof",
        "conditional types",
        "infer",
        "mapped types",
        "template literal types",
        "indexed access",
      ],
      zh: [
        "keyof",
        "typeof",
        "条件类型",
        "infer",
        "mapped",
        "映射类型",
        "模板字面量",
      ],
    },
  },
  {
    id: "classes",
    href: "/classes",
    num: "08",
    title: { en: "Classes and interfaces", zh: "类与接口" },
    en: { en: "Modifiers, abstract, implements", zh: "Classes in TypeScript" },
    essence: {
      en: "class is more than syntax. Access modifiers, abstract, and implements each keep a different kind of order.",
      zh: "class 不只是语法糖:访问修饰符、abstract、implements,各管一段秩序。",
    },
    hue: 262,
    camp: "eng",
    level: 3,
    tags: {
      en: [
        "class",
        "private",
        "protected",
        "abstract",
        "implements",
        "inheritance",
        "parameter properties",
      ],
      zh: [
        "class",
        "类",
        "private",
        "protected",
        "abstract",
        "implements",
        "继承",
      ],
    },
  },
  {
    id: "modules",
    href: "/modules",
    num: "09",
    title: { en: "Modules and declaration files", zh: "模块与声明文件" },
    en: { en: "import type, .d.ts, @types", zh: "Modules & Declaration Files" },
    essence: {
      en: "A .d.ts file is the manual the compiler reads. Without it, even a good JavaScript library stays a black box.",
      zh: ".d.ts 是给编译器看的说明书 —— 没有它,再好的 JS 库也是黑盒。",
    },
    hue: 22,
    camp: "eng",
    level: 3,
    tags: {
      en: [
        "module",
        "import",
        "export",
        "d.ts",
        "declare",
        "@types",
        "DefinitelyTyped",
      ],
      zh: [
        "module",
        "import",
        "export",
        "d.ts",
        "declare",
        "@types",
        "DefinitelyTyped",
      ],
    },
  },
  {
    id: "tsconfig",
    href: "/tsconfig",
    num: "10",
    title: { en: "tsconfig and strict mode", zh: "tsconfig 与严格模式" },
    en: { en: "The strict family", zh: "tsconfig & Strict Mode" },
    essence: {
      en: "The same code under different rules gives different answers. strict is the agreement you sign with the compiler.",
      zh: "同一份代码,规则不同结论就不同 —— strict 是你和编译器签的军规。",
    },
    hue: 350,
    camp: "eng",
    level: 4,
    tags: {
      en: [
        "tsconfig",
        "strict",
        "strictNullChecks",
        "noImplicitAny",
        "target",
        "module",
        "compiler options",
      ],
      zh: [
        "tsconfig",
        "strict",
        "strictNullChecks",
        "target",
        "module",
        "编译选项",
      ],
    },
  },
  {
    id: "mindset",
    href: "/mindset",
    num: "✦",
    title: { en: "Finale · Thinking in types", zh: "终章 · 类型思维" },
    en: { en: "satisfies, as const, unknown", zh: "Thinking in Types" },
    essence: {
      en: "Types are not paperwork for the compiler. They turn the agreements in your head into code the compiler can check.",
      zh: "类型不是给编译器交差,是把你脑子里的约定写成代码 —— 这是心法。",
    },
    hue: 55,
    camp: "verdict",
    level: 4,
    tags: {
      en: [
        "satisfies",
        "as const",
        "unknown",
        "type assertion",
        "type challenges",
        "final quiz",
      ],
      zh: [
        "satisfies",
        "as const",
        "unknown",
        "断言",
        "心法",
        "类型体操",
        "总测验",
      ],
    },
  },
];

/** 命令面板用:一条章节的全部可搜索文本(两种语言都能搜到)。 */
export function searchText(c: Chapter): string {
  const flat = (v: Loc<string> | Loc<string[]>): string[] =>
    typeof v === "object" && !Array.isArray(v)
      ? [v.en, v.zh].flat()
      : ([] as string[]).concat(v);
  return [...flat(c.title), ...flat(c.en), ...flat(c.tags), c.num]
    .join(" ")
    .toLowerCase();
}

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
