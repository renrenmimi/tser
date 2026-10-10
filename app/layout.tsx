import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./fonts/noto-sans-sc.css";
import "./globals.css";
import {
  ThemeProvider,
  ShellProvider,
  themeScript,
} from "@/app/theme-provider";
import { ProgressProvider } from "@/lib/progress";
import { LangProvider, langScript } from "@/lib/i18n";
import Sidebar from "@/app/sidebar";
import Toolbar from "@/app/toolbar";
import CommandPalette from "@/app/command-palette";
import { DocumentTitle } from "@/app/document-title";

// 三套西文字体:Syne(超大展示字,几何感强)、Space Grotesk(界面/标题)、
// JetBrains Mono(代码/数字),用 next/font/local 从 app/fonts 自托管,构建时不再联网下载。
// 中文页面另加 Noto Sans SC(上面以普通 @font-face 引入,按 unicode-range 分片),
// 只有 globals.css 里 html[data-lang="zh"] 的字体栈用到它,英文页面一个分片都不下载。
// 详见 app/fonts/README.md。
const syne = localFont({
  src: "./fonts/syne-latin.woff2",
  weight: "600 800",
  variable: "--font-syne",
  display: "swap",
});
const grotesk = localFont({
  src: "./fonts/space-grotesk-latin.woff2",
  weight: "400 700",
  variable: "--font-grotesk",
  display: "swap",
});
const jetbrains = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  weight: "400 700",
  variable: "--font-jb",
  display: "swap",
});

export const metadata: Metadata = {
  // 各章 layout 设置的 canonical 与 Open Graph 地址以此为基准
  metadataBase: new URL("https://tser.vercel.app"),
  title: {
    default: "TSer - an interactive TypeScript course",
    template: "%s · TSer",
  },
  description:
    "Learn TypeScript from the ground up: types and inference, unions and narrowing, structural typing, generics, utility types, type operators, and strict mode in tsconfig. Interactive visualizations and code you can run. English and Chinese.",
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
      lang="en"
      suppressHydrationWarning
      className={`${syne.variable} ${grotesk.variable} ${jetbrains.variable}`}
    >
      <body>
        {/* 这两段脚本在首帧前执行。它们放在 <body> 开头,而不是 <head>:水合期间
            webpack 运行时会把已加载完的 chunk <script> 从 <head> 中移除,如果这恰好发生在
            React 还在比对 <head> 里手写的节点时,水合就会失败(React error #418),
            整个根节点改在客户端重新渲染。 */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: langScript }} />
        <LangProvider>
          <DocumentTitle />
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
        </LangProvider>
      </body>
    </html>
  );
}
