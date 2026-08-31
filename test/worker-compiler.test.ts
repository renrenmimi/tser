// End-to-end over the real compiler: the shipped worker, the shipped
// typescript.js and the shipped lib.d.ts closure. If any assertion here drifts,
// the course is quoting an error the compiler no longer produces.

import { describe, it, expect, beforeAll } from "vitest";
import { startCompilerWorker, type CompilerWorker } from "./worker-harness";

let tsc: CompilerWorker;

beforeAll(async () => {
  tsc = await startCompilerWorker();
}, 180_000);

const codes = (d: { code: number }[]) => d.map((x) => x.code);

describe("diagnostics", () => {
  it("runs the pinned compiler", () => {
    expect(tsc.version).toBe("5.9.3");
  });

  it("reports TS2322 when a number is given a string", async () => {
    const { diagnostics } = await tsc.check('const x: number = "hello";\n');

    expect(codes(diagnostics)).toEqual([2322]);
    expect(diagnostics[0].message).toBe(
      "Type 'string' is not assignable to type 'number'.",
    );
    expect(diagnostics[0].severity).toBe("error");
    expect(diagnostics[0].line).toBe(1);
    expect(diagnostics[0].col).toBe(7);
    expect(diagnostics[0].cli).toBe(
      "main.ts(1,7): error TS2322: Type 'string' is not assignable to type 'number'.",
    );
  });

  it("says nothing about code that compiles", async () => {
    const { diagnostics } = await tsc.check(
      "const size: string = 'large';\nexport const cups = [size];\n",
    );
    expect(diagnostics).toEqual([]);
  });

  it("lets syntax errors supersede semantic ones", async () => {
    // Both kinds are present: the assignment is wrong *and* the file does not
    // parse. Only the parse errors come back, so the learner fixes those first.
    const broken = 'const x: number = "hello";\nfunction (\n';
    const { diagnostics } = await tsc.check(broken);

    expect(diagnostics.length).toBeGreaterThan(0);
    expect(codes(diagnostics)).not.toContain(2322);
    // 1003 "Identifier expected" and friends are all in the syntactic range.
    expect(codes(diagnostics).every((c) => c < 2000)).toBe(true);
  });

  it("marks the exact range the compiler reported", async () => {
    const code = 'const x: number = "hello";\n';
    const { diagnostics } = await tsc.check(code);
    const d = diagnostics[0];

    expect(code.slice(d.start, d.start + d.length)).toBe("x");
  });
});

describe("compiler flags", () => {
  const implicitAny = "function totalFor(qty) {\n  return qty * 4;\n}\n";

  it("finds an implicit any under strict", async () => {
    const { diagnostics } = await tsc.check(implicitAny);
    expect(codes(diagnostics)).toEqual([7006]);
  });

  it("says nothing about the same code with strict off", async () => {
    const { diagnostics } = await tsc.check(implicitAny, { strict: false });
    expect(diagnostics).toEqual([]);
  });

  it("shows that noUncheckedIndexedAccess sits outside strict", async () => {
    const code = "const menu = [1, 2];\nconst first: number = menu[0];\n";

    expect((await tsc.check(code, { strict: true })).diagnostics).toEqual([]);

    const stricter = await tsc.check(code, {
      strict: true,
      noUncheckedIndexedAccess: true,
    });
    expect(codes(stricter.diagnostics)).toEqual([2322]);
    expect(stricter.diagnostics[0].message).toContain("undefined");
  });
});

describe("inference and output", () => {
  it("answers what type it inferred", async () => {
    const code = "const total = 21;\n";
    const { info } = await tsc.quickInfo(code, code.indexOf("total") + 1);

    expect(info?.text).toBe("const total: 21");
  });

  it("emits JavaScript with the types erased", async () => {
    const { js } = await tsc.emit(
      "const size: string = 'large';\nexport const cups: string[] = [size];\n",
    );

    expect(js).toContain("cups");
    expect(js).not.toContain(": string");
  });

  it("emits a declaration file", async () => {
    const { dts } = await tsc.emit(
      "export function priceOf(cups: number): number {\n  return cups * 4;\n}\n",
    );

    expect(dts).toContain("export declare function priceOf(cups: number): number;");
  });
});
