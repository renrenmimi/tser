import type { Metadata, Viewport } from "next";
import {
  Syne,
  Space_Grotesk,
  JetBrains_Mono,
  Noto_Sans_SC,
} from "next/font/google";
import "./globals.css";
import {
  ThemeProvider,
  ShellProvider,
  themeScript,
} from "@/app/theme-provider";
import { ProgressProvider } from "@/lib/progress";
import Sidebar from "@/app/sidebar";
import Toolbar from "@/app/toolbar";
import CommandPalette from "@/app/command-palette";

// 三套字体:Syne(超大展示字,几何感强)、Space Grotesk(界面/标题)、
// JetBrains Mono(代码/数字)。中文回落到 PingFang SC / 苹方,globals.css 里拼接。
const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jb",
  display: "swap",
});
// 中文黑体:给标题 900 字重的冲击力(系统 PingFang 最粗仅 600)。
// CJK 字形按 unicode-range 分片,浏览器只下载页面用到的字。
const notoSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sc",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TSer · 把 TypeScript 讲透",
    template: "%s · TSer",
  },
  description:
    "从「为什么要类型」到类型编程全套:基础类型与推断、联合与收窄、结构化类型、泛型、工具类型与类型运算、tsconfig 严格模式,交互可视化 + 能跑的真代码。",
};

export const viewport: Viewport = {
  themeColor: "#07080f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${syne.variable} ${grotesk.variable} ${jetbrains.variable} ${notoSC.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <ShellProvider>
            <ProgressProvider>
              <div className="aurora" aria-hidden>
                <div className="aurora-a" />
                <div className="aurora-b" />
                <div className="aurora-grid" />
              </div>
              <div className="shell">
                <Sidebar />
                <div className="shell-main">
                  <Toolbar />
                  <div className="shell-content">{children}</div>
                </div>
              </div>
              <CommandPalette />
            </ProgressProvider>
          </ShellProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
