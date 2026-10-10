// The quiz keeps keyboard focus where the learner was, announces each verdict, accepts the
// forms a Chinese input method or another quote style produces, and names its text fields.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { LangProvider } from "@/lib/i18n";
import { ProgressProvider } from "@/lib/progress";
import { Quiz, answerMatches, normAnswer, type QuizItem } from "@/lib/quiz";

const ITEMS: QuizItem[] = [
  { type: "choice", q: "Pick B", opts: ["a", "b"], correct: 1, why: "Because B." },
  { type: "multi", q: "Pick A and B", opts: ["a", "b", "c"], correct: [0, 1], missHint: "missed", extraHint: "extra", why: "A and B." },
  { type: "fill", q: "Type the literal type", answers: ['"dark"', "dark"], hint: "a literal", why: "It is the literal." },
];

function renderQuiz(items = ITEMS) {
  return render(
    <LangProvider>
      <ProgressProvider>
        <Quiz ch="mindset" items={items} />
      </ProgressProvider>
    </LangProvider>,
  );
}

const question = (n: number) => within(document.querySelectorAll<HTMLElement>(".q-item")[n]);

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.lang;
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
    fn(0);
    return 0;
  });
});

describe("answer comparison", () => {
  it("folds case, spaces, full-width forms and every kind of quote", () => {
    expect(normAnswer(" “Dark” ")).toBe('"dark"');
    expect(answerMatches("'dark'", ['"dark"'])).toBe(true);
    expect(answerMatches("＂dark＂", ['"dark"'])).toBe(true);
    expect(answerMatches("'oolong' ｜ 'mango'", ['"oolong" | "mango"'])).toBe(true);
    expect(answerMatches("－？", ["-?"])).toBe(true);
    expect(answerMatches("   ", [""])).toBe(false);
    expect(answerMatches("light", ['"dark"'])).toBe(false);
  });
});

describe("keyboard and screen readers", () => {
  it("keeps focus on the answered option and announces the verdict", () => {
    renderQuiz();
    const b = question(0).getByRole("button", { name: /^B\s*b$/ });
    b.focus();
    act(() => b.click());
    expect(document.activeElement).toBe(b);
    expect(b).toHaveAttribute("aria-disabled", "true");
    expect(b).not.toBeDisabled();
    const live = b.closest(".q-item")!.querySelector('[role="status"]')!;
    expect(live.textContent).toContain("Because B.");
  });

  it("moves focus to the verdict once a multiple-choice question is checked", () => {
    renderQuiz();
    act(() => question(1).getByRole("button", { name: /^A\s*a$/ }).click());
    act(() => question(1).getByRole("button", { name: /^B\s*b$/ }).click());
    act(() => question(1).getByRole("button", { name: /Check/ }).click());
    const live = document.querySelectorAll(".q-item")[1].querySelector('[role="status"]')!;
    expect(document.activeElement).toBe(live);
    expect(live.textContent).toContain("A and B.");
  });

  it("names the text field after the question and ignores Enter while composing", () => {
    renderQuiz();
    const input = screen.getByRole("textbox", { name: "Type the literal type" });
    fireEvent.change(input, { target: { value: "'dark'" } });
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(input.closest(".q-item")).toHaveAttribute("data-state", "");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input.closest(".q-item")).toHaveAttribute("data-state", "right");
    // Solved: read-only, but it keeps focus and stays in the tab order
    expect(input).toHaveAttribute("readonly");
    expect(input).not.toBeDisabled();
  });

  it("shows the question counter in the reader's language", () => {
    // What the pre-paint script leaves behind for a Chinese reader
    localStorage.setItem("tser-lang", "zh");
    document.documentElement.dataset.lang = "zh";
    renderQuiz();
    expect(screen.getByText("第 1 题 / 共 3 题")).toBeInTheDocument();
  });
});
