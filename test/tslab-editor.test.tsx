// The lab editor is not a keyboard trap, never draws stale squiggles, keeps the code readable
// when the compiler cannot load, and speaks the reader's language in its presets.

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { TsDiagnostic } from "@/lib/tslab-client";
import { LangProvider } from "@/lib/i18n";

function diagnostic(start: number, length: number): TsDiagnostic {
  return {
    code: 7006,
    severity: "error",
    message: "Parameter 'qty' implicitly has an 'any' type.",
    start,
    length,
    line: 1,
    col: start + 1,
    cli: "main.ts(1,1): error TS7006",
    related: [],
  };
}

const api = {
  status: "ready" as "idle" | "loading" | "ready" | "error",
  phase: "" as const,
  version: "5.9.3",
  error: "",
  warm: vi.fn(),
  retry: vi.fn(),
  check: vi.fn(async (source: string) => ({
    diagnostics: source.includes("qty") ? [diagnostic(source.indexOf("qty"), 3)] : [],
    ms: 3,
  })),
  quickInfo: vi.fn(async () => null),
  emit: vi.fn(async () => ({ js: "x;\n", dts: "", emitSkipped: false, diagnostics: [], ms: 1 })),
};

vi.mock("@/lib/tslab-client", () => ({ useTsLab: () => api }));

const { TsLab, playgroundUrl } = await import("@/lib/tslab");

const SAMPLE = "function totalFor(qty) {\n  return qty * 4;\n}\n";
const editor = () => screen.getByRole("textbox") as HTMLTextAreaElement;

beforeEach(() => {
  api.status = "ready";
  api.check.mockClear();
  delete document.documentElement.dataset.lang;
  localStorage.clear();
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
    fn(0);
    return 0;
  });
});

describe("the editor and the Tab key", () => {
  it("indents with Tab, and lets Tab move focus right after Escape", () => {
    render(<TsLab code={SAMPLE} />);
    const ta = editor();
    ta.setSelectionRange(0, 0);
    expect(fireEvent.keyDown(ta, { key: "Tab" })).toBe(false); // handled: two spaces
    expect(ta.value.startsWith("  function")).toBe(true);

    fireEvent.keyDown(ta, { key: "Escape" });
    const before = ta.value;
    expect(fireEvent.keyDown(ta, { key: "Tab" })).toBe(true); // not prevented: focus may leave
    expect(ta.value).toBe(before);
    expect(fireEvent.keyDown(ta, { key: "Tab" })).toBe(false); // the escape lasts one press
  });

  it("outdents with Shift+Tab and never inserts spaces with it", () => {
    render(<TsLab code={SAMPLE} />);
    const ta = editor();
    const second = SAMPLE.indexOf("  return");
    ta.setSelectionRange(second + 4, second + 4);
    fireEvent.keyDown(ta, { key: "Tab", shiftKey: true });
    expect(ta.value).toContain("\nreturn qty * 4;");

    ta.setSelectionRange(0, 0);
    const before = ta.value;
    fireEvent.keyDown(ta, { key: "Tab", shiftKey: true });
    expect(ta.value).toBe(before);
  });

  it("indents every selected line instead of replacing the selection", () => {
    render(<TsLab code={SAMPLE} />);
    const ta = editor();
    // A selection that ends at the start of a line leaves that line alone, as editors do
    ta.setSelectionRange(0, SAMPLE.indexOf("}"));
    fireEvent.keyDown(ta, { key: "Tab" });
    expect(ta.value).toBe("  function totalFor(qty) {\n    return qty * 4;\n}\n");
  });

  it("tells the reader how to leave the editor", () => {
    render(<TsLab code={SAMPLE} />);
    const hint = document.getElementById(editor().getAttribute("aria-describedby")!);
    expect(hint).toHaveTextContent("Esc, then Tab, leaves the editor");
  });
});

describe("diagnostics", () => {
  it("are not drawn over text they were not computed for", async () => {
    render(<TsLab code={SAMPLE} />);
    await waitFor(() => expect(document.querySelector(".tsl-sq")).not.toBeNull());

    fireEvent.change(editor(), { target: { value: "  " + SAMPLE } });
    expect(document.querySelector(".tsl-sq")).toBeNull();
    expect(document.querySelector('.tsl-diags[data-stale="1"]')).not.toBeNull();

    await waitFor(() => expect(document.querySelector(".tsl-sq")?.textContent).toBe("qty"));
  });

  it("are summarised once for screen readers, not read out as a whole list", async () => {
    render(<TsLab code={SAMPLE} />);
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("1 error"));
    expect(document.querySelector(".tsl-diags")).not.toHaveAttribute("aria-live");
  });
});

describe("when the compiler cannot load", () => {
  it("keeps the code readable and links to a Playground with the same code", () => {
    api.status = "error";
    render(<TsLab code={SAMPLE} />);
    expect(document.querySelector(".tsl-overlay")).toBeNull();
    expect(document.querySelector(".tsl-banner")).not.toBeNull();
    const link = screen.getByRole("link", { name: /Open in Playground/ });
    expect(link).toHaveAttribute("href", playgroundUrl(SAMPLE));
    expect(link.getAttribute("href")).toContain("#src=" + encodeURIComponent(SAMPLE));
    expect(screen.getByText("The compiler is not running, so no types can be shown.")).toBeInTheDocument();
    expect(screen.getByText("compiler not running")).toBeInTheDocument();
  });
});

describe("tabs", () => {
  it("follow the WAI-ARIA tabs pattern", () => {
    render(<TsLab code={SAMPLE} emit="both" />);
    const tabs = screen.getAllByRole("tab");
    const panel = screen.getByRole("tabpanel");
    expect(tabs).toHaveLength(3);
    for (const t of tabs) expect(t).toHaveAttribute("aria-controls", panel.id);
    expect(tabs.map((t) => t.tabIndex)).toEqual([0, -1, -1]);

    act(() => tabs[0].focus());
    fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(document.activeElement).toBe(tabs[1]);
    expect(panel).toHaveAttribute("aria-labelledby", tabs[1].id);
  });
});

describe("presets and switches", () => {
  it("load the preset in the reader's language", () => {
    document.documentElement.dataset.lang = "zh";
    localStorage.setItem("tser-lang", "zh");
    render(
      <LangProvider>
        <TsLab
          code={SAMPLE}
          presets={[{ label: { en: "draft", zh: "另一稿" }, code: { en: "// en\n", zh: "// 中文\n" } }]}
        />
      </LangProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "另一稿" }));
    expect(editor().value).toBe("// 中文\n");
  });

  it("show strict as on when it is not given, as the worker treats it", () => {
    render(<TsLab code={SAMPLE} toggles={["strict"]} />);
    expect(screen.getByRole("button", { name: /strict/ })).toHaveAttribute("aria-pressed", "true");
  });
});
