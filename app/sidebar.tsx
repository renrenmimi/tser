"use client";

// 左侧导航栏:品牌 + 全部章节(每章自己的主题色圆点编号)+ 学习进度。
// 章节清单来自 lib/curriculum.ts;进度来自 lib/progress.tsx。
//
// 960px 及以下侧栏是抽屉。侧栏不在屏幕上时(抽屉关闭,或桌面端折叠)设为 inert,
// 其中的链接不再是 Tab 停靠点。抽屉打开时,背后的页面设为 inert 且不滚动,焦点进入抽屉;
// 按 Escape 或点遮罩关闭抽屉,焦点回到工具条的侧栏按钮。
// 最前面的「跳到正文」链接平时不可见,获得键盘焦点时出现。

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CHAPTERS, chapterByPath } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import { T, useL } from "@/lib/i18n";
import { useShell } from "./theme-provider";
import { BrandMark } from "./logo";

/** 与 globals.css 中抽屉的断点一致:不超过 960px 时侧栏是抽屉。 */
export function useNarrowLayout() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 960px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return narrow;
}

/** 英文按数量选单复数:1 task / 2 tasks。 */
const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

/** 「跳到正文」:把焦点移到页面的 <main>,读屏与键盘用户可以略过侧栏和工具条。 */
function skipToContent(e: MouseEvent<HTMLAnchorElement>) {
  const target =
    document.querySelector<HTMLElement>(".shell-content main") ??
    document.querySelector<HTMLElement>(".shell-content");
  if (!target) return;
  e.preventDefault();
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus();
}

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const L = useL();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed } = useShell();
  const { ready, chapterState, totalLabs, data } = useProgress();
  const narrow = useNarrowLayout();
  const asideRef = useRef<HTMLElement>(null);
  const restoreFocus = useRef(false);

  const current = chapterByPath(path);
  const doneCh = ready
    ? CHAPTERS.filter((c) => chapterState(c.id) === "done").length
    : 0;
  const progress = Math.round((doneCh / CHAPTERS.length) * 100);
  const quizCount = ready ? Object.keys(data.quiz).length : 0;

  const drawerOpen = narrow && sidebarOpen;
  const offScreen = narrow ? !sidebarOpen : sidebarCollapsed;

  // 点了链接:只关闭抽屉
  const close = () => setSidebarOpen(false);
  // Escape 或遮罩:关闭抽屉,并把焦点还给侧栏按钮
  const dismiss = () => {
    restoreFocus.current = true;
    setSidebarOpen(false);
  };

  useEffect(() => {
    if (!drawerOpen) {
      if (restoreFocus.current) {
        restoreFocus.current = false;
        document.getElementById("sidebar-toggle")?.focus();
      }
      return;
    }
    const main = document.querySelector<HTMLElement>(".shell-main");
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    main?.setAttribute("inert", "");
    html.style.overflow = "hidden";
    asideRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      main?.removeAttribute("inert");
      html.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // dismiss 只用到 ref 和稳定的 setter,不必列为依赖
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen]);

  // 每页加载后预取全部章节要多下载约 400 KB;改为指向或聚焦某个链接时才预取那一章
  const prefetchOnIntent = (href: string) => ({
    prefetch: false,
    onMouseEnter: () => router.prefetch(href),
    onFocus: () => router.prefetch(href),
  });

  return (
    <>
      <a className="skip-link" href="#main" onClick={skipToContent}>
        {L({ en: "Skip to content", zh: "跳到正文" })}
      </a>
      <aside
        id="sidebar"
        ref={asideRef}
        className={`sidebar${sidebarOpen ? " open" : ""}`}
        aria-label={L({ en: "TSer chapters", zh: "TSer 章节导航" })}
        inert={offScreen}
      >
        <Link
          href="/"
          className="brand"
          onClick={close}
          aria-label="TSer"
          {...prefetchOnIntent("/")}
        >
          <span className="brand-mark" aria-hidden>
            <BrandMark />
          </span>
          <span>
            <span className="brand-name">TSer</span>
            <span className="brand-tagline">
              <T en="TypeScript, explained properly" zh="把 TypeScript 讲透" />
            </span>
          </span>
        </Link>

        <nav className="side-nav" aria-label={L({ en: "Chapters", zh: "章节" })}>
          {CHAPTERS.map((c) => {
            const active = c.id === current.id;
            const state = ready ? chapterState(c.id) : "new";
            return (
              <Link
                key={c.id}
                href={c.href}
                className={`side-link${active ? " active" : ""}`}
                style={{ "--ch-hue": c.hue } as React.CSSProperties}
                aria-current={active ? "page" : undefined}
                onClick={close}
                {...prefetchOnIntent(c.href)}
              >
                <span className="side-num" aria-hidden>
                  {c.num}
                </span>
                <span className="side-title">
                  {L(c.title)}
                  <span className="side-en">{L(c.en)}</span>
                </span>
                <span
                  className={`side-state ${state}`}
                  role="img"
                  aria-label={
                    state === "done"
                      ? L({ en: "Finished", zh: "已完成" })
                      : state === "doing"
                        ? L({ en: "In progress", zh: "进行中" })
                        : L({ en: "Not started", zh: "未开始" })
                  }
                />
              </Link>
            );
          })}
        </nav>

        <div className="side-status">
          <div>
            <T
              en={
                <>
                  <b>{totalLabs}</b> {plural(totalLabs, "task", "tasks")} done ·{" "}
                  <b>{quizCount}</b> {plural(quizCount, "quiz", "quizzes")} ·{" "}
                  <b>{doneCh}</b>/{CHAPTERS.length} chapters finished
                </>
              }
              zh={
                <>
                  完成 <b>{totalLabs}</b> 个动手任务 · <b>{quizCount}</b> 个测验 · 学完 <b>{doneCh}</b>/{CHAPTERS.length} 章
                </>
              }
            />
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label={L({ en: "Course progress", zh: "全书进度" })}
          >
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </aside>

      <div
        className={`scrim${sidebarOpen ? " open" : ""}`}
        aria-hidden
        onClick={dismiss}
      />
    </>
  );
}
