// Motion in the labs is decoration. A reader who asked their system for less of
// it must still get a working lab, so the spinner is calmed rather than removed.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");

/** The body of every `@media (prefers-reduced-motion: reduce)` block. */
function reducedMotionBlocks(): string[] {
  const blocks: string[] = [];
  const marker = "@media (prefers-reduced-motion: reduce)";
  let from = css.indexOf(marker);
  while (from !== -1) {
    let depth = 0;
    let i = css.indexOf("{", from);
    const start = i;
    for (; i < css.length; i++) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}" && --depth === 0) break;
    }
    blocks.push(css.slice(start, i));
    from = css.indexOf(marker, i);
  }
  return blocks;
}

describe("reduced motion", () => {
  it("calms the lab spinner", () => {
    const blocks = reducedMotionBlocks();
    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks.some((b) => b.includes(".tsl-spin"))).toBe(true);
  });

  it("keeps the lab itself usable, not hidden", () => {
    for (const block of reducedMotionBlocks()) {
      expect(block).not.toMatch(/\.tsl[^{]*\{[^}]*display:\s*none/);
    }
  });

  it("does not animate the status note that replaces a lesson note", () => {
    const live = css.slice(css.indexOf(".tsl-st-note.tsl-st-live"));
    expect(live.slice(0, live.indexOf("}"))).not.toContain("animation");
  });
});
