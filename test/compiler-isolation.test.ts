// The course is readable because the compiler is not in the bundle. These tests
// guard the source-level rule; scripts/check-bundle.mjs proves the same thing
// against real build output after `npm run build`.

import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...sourceFiles(full));
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe("the compiler stays out of the page bundle", () => {
  it("is never imported by anything the pages pull in", () => {
    const offenders = [
      ...sourceFiles(resolve(ROOT, "app")),
      ...sourceFiles(resolve(ROOT, "lib")),
    ].filter((file) => {
      const text = readFileSync(file, "utf8");
      return (
        /from\s+["']typescript["']/.test(text) ||
        /require\(\s*["']typescript["']\s*\)/.test(text) ||
        /import\(\s*["']typescript["']\s*\)/.test(text)
      );
    });

    expect(offenders).toEqual([]);
  });

  it("reaches the worker by URL, so the bundler never follows it", () => {
    const client = readFileSync(resolve(ROOT, "lib/tslab-client.tsx"), "utf8");
    expect(client).toContain('new Worker("/tslab/worker.js")');
    expect(client).not.toMatch(/new Worker\(\s*new URL/);
  });

  it("ships the compiler as a versioned static asset instead", () => {
    const meta = JSON.parse(
      readFileSync(resolve(ROOT, "public/tslab/meta.json"), "utf8"),
    );
    expect(meta.version).toBe("5.9.3");
    expect(meta.compiler).toBe("/tslab/5.9.3/typescript.js");
    expect(existsSync(resolve(ROOT, "public" + meta.compiler))).toBe(true);
    expect(existsSync(resolve(ROOT, "public" + meta.libs))).toBe(true);
  });
});
