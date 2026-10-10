// 每章的服务端 metadata:标题、描述与 canonical 地址。章节页本身是 client component,
// 不能导出 metadata,所以由 app/<章>/layout.tsx 调用这里。标题用英文章名
// (根布局的模板会补上 " · TSer");中文读者的标签页标题由 app/document-title.tsx
// 在客户端改写。

import type { Metadata } from "next";
import { CHAPTERS, type ChapterId } from "@/lib/curriculum";
import type { Loc } from "@/lib/i18n";

const enOf = (v: Loc<string>) => (typeof v === "string" ? v : v.en);

export function chapterMetadata(id: ChapterId): Metadata {
  const ch = CHAPTERS.find((c) => c.id === id)!;
  const title = enOf(ch.title);
  const description = enOf(ch.essence);
  return {
    title,
    description,
    alternates: { canonical: ch.href },
    openGraph: {
      title: `${title} · TSer`,
      description,
      url: ch.href,
      siteName: "TSer",
      type: "article",
    },
  };
}
