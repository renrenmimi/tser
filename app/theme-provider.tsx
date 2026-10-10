"use client";

// 应用级 client providers。
//  - ThemeProvider:把 data-theme("dark" | "light")镜像到 <html>,localStorage 持久化。
//    首帧前由 <body> 开头的内联脚本(themeScript)设好,不闪错主题。
//  - ShellProvider:工作台 UI 状态(移动端抽屉侧栏 / 桌面折叠 / ⌘K 面板)。
// 两个 Provider 都从 localStorage 读回设置,而不是从 <html> 的属性读回:
// 一旦 React 放弃水合、在客户端重新渲染根节点,内联脚本写在 <html> 上的属性会被丢弃,
// 所以 Provider 在挂载时把它们重新写回去。

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

export type Theme = "dark" | "light";

const THEME_KEY = "tser-theme";
const SIDEBAR_KEY = "tser-sidebar";

// 手机浏览器地址栏的颜色(<meta name="theme-color">),按主题取值。
// 深色与 app/layout.tsx 的 viewport.themeColor 一致,浅色取浅色主题的 --bg。
export const THEME_COLOR: Record<Theme, string> = {
  dark: "#07080f",
  light: "#f1f0f6",
};

/** 读一项已保存的设置;没有保存或存储被禁用时返回 null。 */
function stored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function applyTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLOR[t]);
}

// 首帧前执行:读回主题 + 侧栏折叠状态,避免闪烁;同时让手机地址栏的颜色与主题一致。
// 默认深色 + 展开。
export const themeScript = `(function(){var d=document.documentElement;var t="dark";try{if(localStorage.getItem("${THEME_KEY}")==="light"){t="light";}}catch(e){}d.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m){m.setAttribute("content",t==="light"?"${THEME_COLOR.light}":"${THEME_COLOR.dark}");}try{d.dataset.sidebar=localStorage.getItem("${SIDEBAR_KEY}")==="collapsed"?"collapsed":"expanded";}catch(e){d.dataset.sidebar="expanded";}})();`;

type ThemeCtx = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeCtx>({
  theme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, set] = useState<Theme>("dark");

  useEffect(() => {
    const current: Theme = stored(THEME_KEY) === "light" ? "light" : "dark";
    applyTheme(current);
    set(current);
  }, []);

  const toggleTheme = useCallback(() => {
    set((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light";
      applyTheme(next);
      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

// ---------- Shell UI 状态 ----------

/** 与 globals.css 中抽屉的断点一致:不超过 960px 时侧栏是抽屉。 */
const DRAWER_QUERY = "(max-width: 960px)";

type ShellCtx = {
  sidebarOpen: boolean; // 移动端抽屉(≤960px 遮罩滑入)
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  sidebarCollapsed: boolean; // 桌面端折叠
  toggleSidebarCollapsed: () => void;
  cmdkOpen: boolean;
  setCmdkOpen: Dispatch<SetStateAction<boolean>>;
};

const ShellContext = createContext<ShellCtx>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  sidebarCollapsed: false,
  toggleSidebarCollapsed: () => {},
  cmdkOpen: false,
  setCmdkOpen: () => {},
});

export function ShellProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const collapsed = stored(SIDEBAR_KEY) === "collapsed";
    document.documentElement.dataset.sidebar = collapsed ? "collapsed" : "expanded";
    setSidebarCollapsed(collapsed);
  }, []);

  // 抽屉只存在于窄屏。窗口变宽后抽屉的打开状态不再有意义,
  // 复位它,免得再变窄时抽屉自己出现。
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(DRAWER_QUERY);
    const onChange = () => {
      if (!mq.matches) setSidebarOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      document.documentElement.dataset.sidebar = next ? "collapsed" : "expanded";
      try {
        window.localStorage.setItem(SIDEBAR_KEY, next ? "collapsed" : "expanded");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      sidebarOpen,
      setSidebarOpen,
      sidebarCollapsed,
      toggleSidebarCollapsed,
      cmdkOpen,
      setCmdkOpen,
    }),
    [sidebarOpen, sidebarCollapsed, toggleSidebarCollapsed, cmdkOpen],
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export const useShell = () => useContext(ShellContext);
