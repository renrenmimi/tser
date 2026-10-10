// A task can be marked as done from the keyboard (the checkbox is a sibling of the row's
// expand button, never inside it), and two open tabs do not overwrite each other's progress.

import { beforeEach, describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { LangProvider } from "@/lib/i18n";
import { ProgressProvider, useProgress } from "@/lib/progress";
import { LabSet, type Lab } from "@/lib/labs";

const KEY = "tser-progress-v1";
const stored = () => JSON.parse(localStorage.getItem(KEY) ?? "null");

const LABS: Lab[] = ["first", "second"].map((id) => ({
  id,
  title: `Task ${id}`,
  d: "easy",
  tags: ["tag"],
  task: `Do ${id}`,
  hint: "hint",
  solution: "solution",
}));

beforeEach(() => localStorage.clear());

describe("the task list", () => {
  it("keeps the checkbox out of the expand control", () => {
    render(
      <LangProvider>
        <ProgressProvider>
          <LabSet ch="types" items={LABS} />
        </ProgressProvider>
      </LangProvider>,
    );
    const boxes = screen.getAllByRole("checkbox");
    expect(boxes).toHaveLength(2);
    for (const box of boxes) {
      expect(box.closest('[role="button"]')).toBeNull();
      expect(box.closest("button.prob-toggle")).toBeNull();
    }
    expect(boxes[0]).toHaveAccessibleName("Mark task 01 as done");

    act(() => boxes[0].click());
    expect(boxes[0]).toHaveAttribute("aria-checked", "true");
    expect(stored().labs).toEqual({ "types/first": 1 });
    // Ticking a task does not open it
    expect(screen.queryByText("Do first")).toBeNull();

    const toggle = screen.getAllByRole("button", { expanded: false })[0];
    act(() => toggle.click());
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Do first").closest(".prob-body")!.id).toBe(
      toggle.getAttribute("aria-controls"),
    );
  });
});

function Tab({ name }: { name: string }) {
  const { toggleLab, totalLabs } = useProgress();
  return (
    <button onClick={() => toggleLab(`${name}/lab`)}>{`${name} ${totalLabs}`}</button>
  );
}

describe("progress in two tabs", () => {
  it("merges with what the other tab stored instead of overwriting it", () => {
    render(
      <>
        <ProgressProvider>
          <Tab name="types" />
        </ProgressProvider>
        <ProgressProvider>
          <Tab name="functions" />
        </ProgressProvider>
      </>,
    );
    // Both "tabs" loaded the empty progress before either wrote anything
    act(() => screen.getByText("types 0").click());
    act(() => screen.getByText("functions 0").click());

    expect(stored().labs).toEqual({ "types/lab": 1, "functions/lab": 1 });
  });

  it("picks up what another tab wrote", () => {
    render(
      <ProgressProvider>
        <Tab name="types" />
      </ProgressProvider>,
    );
    localStorage.setItem(KEY, JSON.stringify({ labs: { "generics/a": 1, "generics/b": 1 }, quiz: {} }));
    act(() => {
      fireEvent(window, new StorageEvent("storage", { key: KEY }));
    });
    expect(screen.getByText("types 2")).toBeInTheDocument();
  });
});
