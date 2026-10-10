// 服务端布局:给本章自己的 <title>、描述与 canonical 地址(页面本身是 client component,
// 不能导出 metadata)。

import type { ReactNode } from "react";
import { chapterMetadata } from "@/app/chapter-metadata";

export const metadata = chapterMetadata("functions");

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
