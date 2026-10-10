// Regression tests for the stylesheet: text and comment colours meet WCAG AA in both themes,
// idle pages run no endless animations the compositor cannot take over, code is shown as
// typed, callouts cannot be pushed off narrow screens, and printing shows every section.

import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const globals = readFileSync(resolve(root, "app/globals.css"), "utf8");
const chapterCss = readdirSync(resolve(root, "app"), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => resolve(root, "app", d.name, "chapter.css"))
  .filter((p) => {
    try {
      readFileSync(p);
      return true;
    } catch {
      return false;
    }
  })
  .map((p) => readFileSync(p, "utf8"));
const allCss = [globals, readFileSync(resolve(root, "app/home.css"), "utf8"), ...chapterCss].join("\n");

/** The body of the first rule whose selector line is exactly `selector`. */
function block(css: string, selector: string): string {
  const at = css.indexOf(`${selector} {`);
  expect(at, selector).toBeGreaterThan(-1);
  return css.slice(css.indexOf("{", at) + 1, css.indexOf("\n}", at));
}

function token(body: string, name: string): string {
  const m = new RegExp(`${name}:\\s*([^;]+);`).exec(body);
  expect(m, name).not.toBeNull();
  return m![1].trim();
}

/** WCAG relative luminance of a #rrggbb colour. */
function lum(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255]
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
}

function contrast(a: string, b: string): number {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const dark = block(globals, ':root,\n[data-theme="dark"]');
const light = block(globals, '[data-theme="light"]');

describe("colour tokens", () => {
  it.each([
    ["dark", dark],
    ["light", light],
  ])("keep tertiary text at 4.5:1 or more on the page and on solid panels (%s)", (_, body) => {
    const text3 = token(body, "--text-3");
    expect(contrast(text3, token(body, "--bg"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(text3, token(body, "--panel-solid"))).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ["dark", dark],
    ["light", light],
  ])("keep code comments at 4.5:1 or more on the code background (%s)", (_, body) => {
    expect(contrast(token(body, "--tk-com"), token(body, "--code-bg"))).toBeGreaterThanOrEqual(4.5);
  });

  it("give the light theme's status colours 4.5:1 on its page background", () => {
    for (const name of ["--ok", "--warn", "--risk", "--info"]) {
      expect(contrast(token(light, name), token(light, "--bg")), name).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("motion on an idle page", () => {
  it("never loops a keyframe that animates anything but transform, translate or opacity", () => {
    const keyframes = new Map<string, string>();
    for (const m of allCss.matchAll(/@keyframes\s+([\w-]+)\s*\{([\s\S]*?)\n\}/g)) keyframes.set(m[1], m[2]);
    const offenders: string[] = [];
    for (const m of allCss.matchAll(/animation:\s*([^;]+);/g)) {
      const decl = m[1];
      if (!/\binfinite\b/.test(decl)) continue;
      const name = decl.split(/\s+/)[0];
      const body = keyframes.get(name) ?? "";
      const props = [...body.matchAll(/([a-z-]+)\s*:/g)].map((p) => p[1]);
      if (props.some((p) => !["transform", "translate", "opacity"].includes(p))) offenders.push(name);
    }
    // These run only while something is happening: the lab spinner while the compiler loads,
    // the probe ring while generics are being probed, and .flow-edge on an active flow step
    expect(offenders.filter((n) => !["tsl-spin", "gn-probe", "dash-flow"].includes(n))).toEqual([]);
  });
});

describe("code and layout", () => {
  it("shows code as typed, without contextual ligatures", () => {
    expect(block(globals, "body,\nbutton,\ninput,\ntextarea,\nselect")).toContain("font-variant-ligatures: no-contextual");
  });

  it("lets a callout's text column shrink below its content", () => {
    expect(block(globals, ".callout")).toMatch(/grid-template-columns:\s*auto minmax\(0, 1fr\)/);
  });

  it("prints every section and leaves the shell out", () => {
    const at = globals.indexOf("@media print");
    expect(at).toBeGreaterThan(-1);
    const print = globals.slice(at, globals.indexOf("\n}\n", globals.indexOf("print-color-adjust", at)));
    expect(print).toMatch(/\.reveal\s*\{[^}]*opacity:\s*1/);
    expect(print).toMatch(/\.sidebar,[\s\S]*display:\s*none/);
  });
});
