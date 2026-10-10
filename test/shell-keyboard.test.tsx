// The sidebar, the drawer and the command palette must be usable from the keyboard: hidden
// links are not tab stops, the drawer and the palette take focus and give it back, and the
// palette keeps focus inside itself.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { LangProvider } from "@/lib/i18n";
import { ProgressProvider } from "@/lib/progress";
import { ShellProvider, ThemeProvider } from "@/app/theme-provider";

const prefetch = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/types",
  useRouter: () => ({ prefetch, push: vi.fn() }),
}));

import Sidebar from "@/app/sidebar";
import Toolbar from "@/app/toolbar";
import CommandPalette from "@/app/command-palette";

let narrow = false;
beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.sidebar;
  prefetch.mockClear();
  narrow = false;
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: () => ({ matches: narrow, addEventListener() {}, removeEventListener() {} }),
  });
  Element.prototype.scrollIntoView = vi.fn();
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
    fn(0);
    return 0;
  });
});

function renderShell() {
  return render(
    <LangProvider>
      <ThemeProvider>
        <ShellProvider>
          <ProgressProvider>
            <Sidebar />
            <div className="shell-main">
              <Toolbar />
              <div className="shell-content">
                <main>content</main>
              </div>
            </div>
            <CommandPalette />
          </ProgressProvider>
        </ShellProvider>
      </ThemeProvider>
    </LangProvider>,
  );
}

const aside = () => document.getElementById("sidebar")!;
const toggle = () => document.getElementById("sidebar-toggle")!;

describe("the sidebar", () => {
  it("is inert while collapsed on a wide screen", () => {
    // What the pre-paint script leaves behind for a reader who collapsed the sidebar
    localStorage.setItem("tser-sidebar", "collapsed");
    document.documentElement.dataset.sidebar = "collapsed";
    renderShell();
    expect(aside()).toHaveAttribute("inert");
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
  });

  it("is a tab stop again when expanded", () => {
    renderShell();
    expect(aside()).not.toHaveAttribute("inert");
    expect(toggle()).toHaveAttribute("aria-controls", "sidebar");
    expect(toggle()).toHaveAttribute("aria-expanded", "true");
  });

  it("prefetches a chapter only when the reader points at its link", () => {
    renderShell();
    expect(prefetch).not.toHaveBeenCalled();
    fireEvent.mouseEnter(screen.getAllByRole("link", { name: /Generics/ })[0]);
    expect(prefetch).toHaveBeenCalledWith("/generics");
  });

  it("states each chapter's progress as an image with a name", () => {
    renderShell();
    expect(screen.getAllByRole("img", { name: "Not started" }).length).toBe(12);
  });

  it("counts in the singular and the plural", () => {
    localStorage.setItem("tser-progress-v1", JSON.stringify({ labs: { "types/hover-infer": 1 }, quiz: {} }));
    renderShell();
    expect(document.querySelector(".side-status")!.textContent).toContain("1 task done · 0 quizzes");
  });
});

describe("the phone drawer", () => {
  it("is inert while closed, takes focus when opened, and gives it back on Escape", () => {
    narrow = true;
    renderShell();
    expect(aside()).toHaveAttribute("inert");

    act(() => toggle().click());
    expect(aside()).not.toHaveAttribute("inert");
    expect(document.querySelector(".shell-main")).toHaveAttribute("inert");
    expect(aside().contains(document.activeElement)).toBe(true);

    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });
    expect(aside()).toHaveAttribute("inert");
    expect(document.querySelector(".shell-main")).not.toHaveAttribute("inert");
    expect(document.activeElement).toBe(toggle());
  });
});

describe("the skip link", () => {
  it("moves focus to the page content", () => {
    renderShell();
    const link = screen.getByRole("link", { name: "Skip to content" });
    act(() => link.click());
    expect(document.activeElement).toBe(document.querySelector("main"));
  });
});

describe("the command palette", () => {
  it("is a modal combobox that keeps focus and returns it to the opener", () => {
    renderShell();
    const opener = screen.getByRole("button", { name: /command palette/ });
    opener.focus();
    act(() => opener.click());

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    const input = screen.getByRole("combobox");
    expect(document.activeElement).toBe(input);
    expect(screen.getAllByRole("option").length).toBe(12);

    fireEvent.keyDown(input, { key: "ArrowDown" });
    const selected = screen.getAllByRole("option").find((o) => o.getAttribute("aria-selected") === "true")!;
    expect(input).toHaveAttribute("aria-activedescendant", selected.id);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();

    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(document.activeElement).toBe(input);

    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it("shows the shortcut of the reader's platform", () => {
    vi.spyOn(navigator, "platform", "get").mockReturnValue("Win32");
    renderShell();
    expect(screen.getByRole("button", { name: /command palette/ }).textContent).toContain("Ctrl K");
  });
});

describe("the theme button", () => {
  it("says what it will do", () => {
    renderShell();
    expect(screen.getByRole("button", { name: "Switch to the light theme" })).toBeInTheDocument();
  });
});
