// Fonts are self-hosted, English pages never name Noto Sans SC, and the sections stay visible
// when scripting is off.

import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const css = read("app/globals.css");
const layout = read("app/layout.tsx");

/** The declarations of the first rule whose selector is exactly `selector`. */
function rule(selector: string): string {
  const at = css.indexOf(`\n${selector} {`);
  expect(at).toBeGreaterThan(-1);
  return css.slice(css.indexOf("{", at) + 1, css.indexOf("}", at));
}

describe("fonts", () => {
  it("are loaded from app/fonts, never from Google at build time", () => {
    expect(layout).not.toContain("next/font/google");
    for (const f of ["syne-latin", "space-grotesk-latin", "jetbrains-mono-latin"]) {
      expect(layout).toContain(`./fonts/${f}.woff2`);
      expect(existsSync(resolve(process.cwd(), `app/fonts/${f}.woff2`))).toBe(true);
    }
  });

  it("name Noto Sans SC only in the Chinese stacks", () => {
    expect(rule(":root")).not.toMatch(/Noto|noto-sc/);
    expect(rule('html[data-lang="zh"]')).toContain('"Noto Sans SC"');
    expect(css).not.toContain("--font-noto-sc");
  });
});

describe("without JavaScript", () => {
  it("shows every revealed section", () => {
    const at = css.indexOf("@media (scripting: none)");
    expect(at).toBeGreaterThan(-1);
    const block = css.slice(at, css.indexOf("}\n}", at));
    expect(block).toContain(".reveal");
    expect(block).toMatch(/opacity:\s*1/);
  });
});
