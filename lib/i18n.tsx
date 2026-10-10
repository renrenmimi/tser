"use client";

// 双语基础设施 —— English 默认,中文可切换。
//  - Loc<T>:一个值可以按语言给两份;普通值原样透传。
//  - langScript:首帧前跑,设好 <html data-lang> 与 lang。正文由 React 渲染,
//    选了中文的读者在水合前会短暂看到英文的服务端 HTML(English 默认,这是既定取舍)。
//  - LangProvider / useLang:语言状态 + localStorage 持久化。Provider 从 localStorage
//    读回语言,而不是从 <html> 读回:React 放弃水合、在客户端重新渲染根节点时,
//    langScript 写的属性会被丢弃,所以挂载时再写回一次。
//  - useL():把 Loc<T> 解析成当前语言的 T(给 props 用)。
//  - <T en zh />:JSX 里的行内切换(给正文用,可写在模块级常量里)。

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  isValidElement,
  startTransition,
  type ReactNode,
} from "react";

export type Lang = "en" | "zh";

/** A value that may be given per language. Plain values pass through unchanged. */
export type Loc<T> = T | { en: T; zh: T };

const KEY = "tser-lang";

/** Runs before first paint so the page never flashes the wrong language. */
export const langScript = `(function(){var d=document.documentElement;var l="en";try{var s=localStorage.getItem("${KEY}");if(s==="zh")l="zh";}catch(e){}d.dataset.lang=l;d.lang=l==="zh"?"zh-CN":"en";})();`;

type Ctx = { lang: Lang; setLang: (l: Lang) => void };
const LangContext = createContext<Ctx>({ lang: "en", setLang: () => {} });

/** 把语言镜像到 <html>,与 langScript 在首帧前做的一致。 */
function applyLang(l: Lang) {
  const d = document.documentElement;
  d.dataset.lang = l;
  d.lang = l === "zh" ? "zh-CN" : "en";
}

/** 已保存的语言;没有保存或存储被禁用时为 English。 */
function storedLang(): Lang {
  try {
    return window.localStorage.getItem(KEY) === "zh" ? "zh" : "en";
  } catch {
    return "en"; // 隐私模式等存储被禁用的情况
  }
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, set] = useState<Lang>("en");

  useEffect(() => {
    const l = storedLang();
    applyLang(l);
    set(l);
  }, []);

  const setLang = useCallback((l: Lang) => {
    // 切换语言会重新渲染页面上的每一段文案。放进 transition,
    // 点击本身的反馈就不会被这次整页渲染挡住。
    startTransition(() => set(l));
    applyLang(l);
    try {
      window.localStorage.setItem(KEY, l);
    } catch {
      /* private mode */
    }
  }, []);

  return (
    <LangContext.Provider
      value={useMemo(() => ({ lang, setLang }), [lang, setLang])}
    >
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);

/** True for `{ en, zh }` pairs — never for React elements or arrays. */
function isPair<V>(v: Loc<V>): v is { en: V; zh: V } {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    !isValidElement(v) &&
    "en" in v &&
    "zh" in v
  );
}

/** Resolver hook: `const L = useL(); L(node)` picks the current language. */
export function useL() {
  const { lang } = useLang();
  return useCallback(<V,>(v: Loc<V>): V => (isPair(v) ? v[lang] : v), [lang]);
}

/** Inline switch usable anywhere in JSX, including module-level constants. */
export function T({ en, zh }: { en: ReactNode; zh: ReactNode }) {
  const { lang } = useLang();
  return <>{lang === "zh" ? zh : en}</>;
}
