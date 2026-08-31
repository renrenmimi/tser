// The lesson note belongs to the sample a lab ships with. These tests pin the
// rule that it disappears as soon as the learner edits that sample, and that
// the decision is made from the code, not from how many errors came back.

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { TsDiagnostic } from "@/lib/tslab-client";

function diagnostic(code: number, message: string): TsDiagnostic {
  return {
    code,
    severity: "error",
    message,
    start: 0,
    length: 5,
    line: 1,
    col: 1,
    cli: `main.ts(1,1): error TS${code}: ${message}`,
    related: [],
  };
}

/** What the fake compiler answers, chosen by what the source now says. */
function diagnosticsFor(source: string): TsDiagnostic[] {
  if (source.includes('"hello"')) {
    return [diagnostic(2322, "Type 'string' is not assignable to type 'number'.")];
  }
  if (source.includes("clean")) return [];
  if (source.includes("twoProblems")) {
    return [
      diagnostic(2322, "Type 'string' is not assignable to type 'number'."),
      diagnostic(2345, "Argument of type 'string' is not assignable."),
    ];
  }
  // The shipped sample: exactly one error, on the parameter.
  return [diagnostic(7006, "Parameter 'qty' implicitly has an 'any' type.")];
}

const api = {
  status: "ready" as const,
  phase: "" as const,
  version: "5.9.3",
  error: "",
  warm: vi.fn(),
  retry: vi.fn(),
  check: vi.fn(async (source: string) => ({
    diagnostics: diagnosticsFor(source),
    ms: 4,
  })),
  quickInfo: vi.fn(async () => null),
  emit: vi.fn(async () => ({
    js: "",
    dts: "",
    emitSkipped: false,
    diagnostics: [],
    ms: 1,
  })),
};

vi.mock("@/lib/tslab-client", () => ({ useTsLab: () => api }));

const { TsLab } = await import("@/lib/tslab");

const SAMPLE = "function totalFor(qty) {\n  return qty * 4;\n}\n";
const NOTE = "One error, and it is on the parameter.";

function renderLab() {
  return render(
    <TsLab
      code={{ en: SAMPLE, zh: SAMPLE }}
      note={{ en: NOTE, zh: "只有一处报错,在参数上。" }}
      presets={[{ label: { en: "another draft", zh: "另一稿" }, code: "const clean = 1;\n" }]}
    />,
  );
}

const editor = () => screen.getByRole("textbox") as HTMLTextAreaElement;
const noteEl = () => document.querySelector(".tsl-st-note");
const lab = () => document.querySelector(".tsl") as HTMLElement;

beforeEach(() => {
  api.check.mockClear();
});

describe("lesson note", () => {
  it("shows the note while the sample is untouched", async () => {
    renderLab();
    expect(await screen.findByText(NOTE)).toBeInTheDocument();
    expect(lab()).toHaveAttribute("data-dirty", "0");
    await waitFor(() => expect(screen.getByText("TS7006")).toBeInTheDocument());
  });

  it("drops the note once the learner edits the code", async () => {
    renderLab();
    await screen.findByText(NOTE);

    fireEvent.change(editor(), { target: { value: 'const x: number = "hello";\n' } });

    await waitFor(() => expect(screen.getByText("TS2322")).toBeInTheDocument());
    expect(screen.queryByText(NOTE)).not.toBeInTheDocument();
    expect(lab()).toHaveAttribute("data-dirty", "1");
    // Neutral and diagnostic-aware: the code tsc returned, no invented prose.
    expect(noteEl()).toHaveTextContent("edited · TS2322");
    expect(noteEl()).toHaveAttribute("data-live", "1");
  });

  it("is not decided by the number of diagnostics", async () => {
    renderLab();
    await screen.findByText(NOTE);

    // Still exactly one error, and still not the error the note describes.
    fireEvent.change(editor(), { target: { value: 'let y: number = "hello";\n' } });

    await waitFor(() => expect(screen.getByText("TS2322")).toBeInTheDocument());
    expect(screen.queryByText(NOTE)).not.toBeInTheDocument();
  });

  it("marks the lab edited when a preset replaces the code", async () => {
    renderLab();
    await screen.findByText(NOTE);

    fireEvent.click(screen.getByRole("button", { name: "another draft" }));

    await waitFor(() => expect(lab()).toHaveAttribute("data-dirty", "1"));
    expect(screen.queryByText(NOTE)).not.toBeInTheDocument();
  });

  it("restores the note when Reset brings the sample back", async () => {
    renderLab();
    await screen.findByText(NOTE);

    fireEvent.change(editor(), { target: { value: 'const x: number = "hello";\n' } });
    await waitFor(() => expect(screen.queryByText(NOTE)).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(await screen.findByText(NOTE)).toBeInTheDocument();
    expect(lab()).toHaveAttribute("data-dirty", "0");
    expect(editor().value).toBe(SAMPLE);
  });

  it("restores the note when the sample is typed back by hand", async () => {
    renderLab();
    await screen.findByText(NOTE);

    fireEvent.change(editor(), { target: { value: 'const x: number = "hello";\n' } });
    await waitFor(() => expect(screen.queryByText(NOTE)).not.toBeInTheDocument());

    fireEvent.change(editor(), { target: { value: SAMPLE } });

    expect(await screen.findByText(NOTE)).toBeInTheDocument();
  });

  it("names every distinct code once the edit produces several", async () => {
    renderLab();
    await screen.findByText(NOTE);

    fireEvent.change(editor(), { target: { value: "const twoProblems = 1;\n" } });

    await waitFor(() => expect(noteEl()).toHaveTextContent("edited · TS2322, TS2345"));
  });
});

describe("diagnostics panel", () => {
  it("reports a clean compile", async () => {
    renderLab();
    await screen.findByText(NOTE);

    fireEvent.change(editor(), { target: { value: "const clean = 1;\n" } });

    // The panel and the status line both say so, and neither is a leftover.
    await waitFor(() =>
      expect(document.querySelector(".tsl-ok")).toHaveTextContent(
        "No errors. tsc is happy.",
      ),
    );
    expect(document.querySelector(".tsl-st-ok")).toHaveTextContent(
      "No errors. tsc is happy.",
    );
    expect(document.querySelector(".tsl-diag-code")).toBeNull();
    expect(document.querySelector(".tsl-sq")).toBeNull();
    // Edited, but with nothing for the compiler to complain about.
    expect(noteEl()).toHaveTextContent("edited");
  });

  it("keeps a stale answer from overwriting a newer edit", async () => {
    const settle: Array<(v: { diagnostics: TsDiagnostic[]; ms: number }) => void> = [];
    api.check.mockImplementation(
      () =>
        new Promise((resolve) => {
          settle.push(resolve);
        }),
    );

    renderLab();
    await waitFor(() => expect(settle.length).toBe(1));

    fireEvent.change(editor(), { target: { value: 'const x: number = "hello";\n' } });
    await waitFor(() => expect(settle.length).toBe(2));

    // The newer request answers first, then the one it replaced arrives late.
    settle[1]({ diagnostics: diagnosticsFor('"hello"'), ms: 4 });
    await waitFor(() => expect(screen.getByText("TS2322")).toBeInTheDocument());

    settle[0]({ diagnostics: diagnosticsFor(SAMPLE), ms: 99 });
    await new Promise((r) => setTimeout(r, 50));

    expect(screen.getByText("TS2322")).toBeInTheDocument();
    expect(screen.queryByText("TS7006")).not.toBeInTheDocument();

    api.check.mockImplementation(async (source: string) => ({
      diagnostics: diagnosticsFor(source),
      ms: 4,
    }));
  });
});

describe("keyboard", () => {
  it("inserts two spaces for Tab instead of leaving the editor", async () => {
    renderLab();
    await screen.findByText(NOTE);

    const ta = editor();
    ta.focus();
    ta.setSelectionRange(0, 0);
    fireEvent.keyDown(ta, { key: "Tab" });

    await waitFor(() => expect(editor().value).toBe("  " + SAMPLE));
    expect(document.activeElement).toBe(editor());
  });

  it("labels the editor for assistive technology", async () => {
    renderLab();
    expect(
      await screen.findByLabelText("editable TypeScript code"),
    ).toBeInTheDocument();
  });
});
