"use client";

// 让浏览器标签页的标题跟随读者的语言。服务端按各路由的 metadata 渲染英文标题,
// Next.js 在 metadata 水合时(晚于本组件的第一次 effect)以及每次导航提交时还会再写一次,
// 所以只要 <title> 的内容在底下被改动,就重新写上当前语言的标题。
// 本组件只在根布局里渲染一次。

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { useLang, type Lang, type Loc } from "@/lib/i18n";
import { chapterByPath } from "@/lib/curriculum";

/** 序章(/)的标签页标题;英文与根布局 metadata 的默认标题一致。 */
export const SITE_TITLE: Record<Lang, string> = {
  en: "TSer - an interactive TypeScript course",
  zh: "TSer - 交互式 TypeScript 课程",
};

/** 某个路径在某种语言下的标签页标题。 */
export function titleFor(path: string, lang: Lang): string {
  const page = chapterByPath(path);
  if (page.id === "home") return SITE_TITLE[lang];
  const name: Loc<string> = page.title;
  return `${typeof name === "string" ? name : name[lang]} · TSer`;
}

export function DocumentTitle() {
  const path = usePathname();
  const { lang } = useLang();
  const text = titleFor(path, lang);

  useLayoutEffect(() => {
    const apply = () => {
      if (document.title !== text) document.title = text;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, {
      subtree: true,
      childList: true,
      characterData: true,
    });
    return () => observer.disconnect();
  }, [text]);

  return null;
}
