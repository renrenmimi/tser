// If React gives up hydrating the root, it renders it again on the client and drops the
// <html> attributes that the inline scripts wrote before the first paint. The providers must
// then restore the reader's settings from storage, not from those attributes, and write the
// attributes back.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { LangProvider, useLang } from "@/lib/i18n";
import {
  ShellProvider,
  THEME_COLOR,
  ThemeProvider,
  useShell,
  useTheme,
} from "@/app/theme-provider";

function Probe() {
  const { lang } = useLang();
  const { theme } = useTheme();
  const { sidebarCollapsed, sidebarOpen } = useShell();
  return (
    <p>{`${lang} ${theme} ${sidebarCollapsed ? "collapsed" : "expanded"} ${sidebarOpen ? "open" : "shut"}`}</p>
  );
}

function Controls() {
  const { toggleTheme } = useTheme();
  const { setSidebarOpen } = useShell();
  const { setLang } = useLang();
  return (
    <>
      <button onClick={toggleTheme}>theme</button>
      <button onClick={() => setSidebarOpen(true)}>drawer</button>
      <button onClick={() => setLang("zh")}>zh</button>
    </>
  );
}

function renderProviders() {
  render(
    <LangProvider>
      <ThemeProvider>
        <ShellProvider>
          <Probe />
          <Controls />
        </ShellProvider>
      </ThemeProvider>
    </LangProvider>,
  );
}

const html = document.documentElement;

/** A controllable stand-in for window.matchMedia("(max-width: 960px)"). */
function fakeDrawerQuery(narrow: boolean) {
  const listeners = new Set<() => void>();
  const mq = {
    matches: narrow,
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
  };
  vi.spyOn(window, "matchMedia").mockImplementation(() => mq as unknown as MediaQueryList);
  return (next: boolean) => {
    mq.matches = next;
    listeners.forEach((fn) => fn());
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  // The state after React has rendered the root again: only what it declares itself.
  for (const key of ["lang", "theme", "sidebar"]) delete html.dataset[key];
  html.lang = "en";
  document.head.innerHTML = `<meta name="theme-color" content="${THEME_COLOR.dark}">`;
  if (typeof window.matchMedia !== "function") {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    });
  }
});

const themeColor = () =>
  document.querySelector('meta[name="theme-color"]')?.getAttribute("content");

describe("settings after the root is rendered again on the client", () => {
  it("come back from storage and are written back onto <html>", () => {
    localStorage.setItem("tser-lang", "zh");
    localStorage.setItem("tser-theme", "light");
    localStorage.setItem("tser-sidebar", "collapsed");
    renderProviders();

    expect(screen.getByText("zh light collapsed shut")).toBeInTheDocument();
    expect(html.dataset.lang).toBe("zh");
    expect(html.lang).toBe("zh-CN");
    expect(html.dataset.theme).toBe("light");
    expect(html.dataset.sidebar).toBe("collapsed");
    expect(themeColor()).toBe(THEME_COLOR.light);
  });

  it("fall back to the defaults when nothing is stored", () => {
    renderProviders();

    expect(screen.getByText("en dark expanded shut")).toBeInTheDocument();
    expect(html.dataset.lang).toBe("en");
    expect(html.dataset.theme).toBe("dark");
    expect(html.dataset.sidebar).toBe("expanded");
    expect(themeColor()).toBe(THEME_COLOR.dark);
  });

  it("fall back to the defaults when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage is blocked");
    });
    renderProviders();

    expect(screen.getByText("en dark expanded shut")).toBeInTheDocument();
    expect(html.dataset.theme).toBe("dark");
    expect(html.dataset.lang).toBe("en");
  });
});

describe("switching", () => {
  it("the theme updates data-theme, the stored value and the browser chrome colour", () => {
    renderProviders();
    act(() => screen.getByText("theme").click());

    expect(html.dataset.theme).toBe("light");
    expect(localStorage.getItem("tser-theme")).toBe("light");
    expect(themeColor()).toBe(THEME_COLOR.light);
  });

  it("the language updates <html> at once and the copy after the transition", async () => {
    renderProviders();
    await act(async () => screen.getByText("zh").click());

    expect(html.dataset.lang).toBe("zh");
    expect(html.lang).toBe("zh-CN");
    expect(localStorage.getItem("tser-lang")).toBe("zh");
    expect(screen.getByText("zh dark expanded shut")).toBeInTheDocument();
  });
});

describe("the phone drawer", () => {
  it("closes when the window grows past the drawer breakpoint", () => {
    const resize = fakeDrawerQuery(true);
    renderProviders();
    act(() => screen.getByText("drawer").click());
    expect(screen.getByText("en dark expanded open")).toBeInTheDocument();

    act(() => resize(false));
    expect(screen.getByText("en dark expanded shut")).toBeInTheDocument();
  });
});
