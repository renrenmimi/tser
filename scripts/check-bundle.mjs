// Proves the TypeScript compiler is not in the page bundle.
//
// The whole design of the labs rests on this: typescript.js is 8.7 MB and is
// fetched by the worker from /tslab/<version>/, on demand. If anything ever
// imports it from a component, Next would happily inline it into a shared chunk
// and every reader would download it before seeing a word of the course.
//
// Run after `npm run build`.

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

/** Identifiers that only exist inside the TypeScript compiler itself. */
const COMPILER_MARKERS = [
  "createLanguageService",
  "getQuickInfoAtPosition",
  "createDocumentRegistry",
  "flattenDiagnosticMessageText",
];

/** No page chunk should come anywhere near this. The compiler is 8.7 MB. */
const MAX_CHUNK_BYTES = 1_500_000;

function jsFilesIn(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...jsFilesIn(full));
    else if (entry.name.endsWith(".js")) out.push(full);
  }
  return out;
}

export function checkBundle() {
  const chunkDir = resolve(ROOT, ".next/static/chunks");
  if (!existsSync(chunkDir)) {
    throw new Error("no build output found — run `npm run build` first");
  }

  const files = jsFilesIn(chunkDir);
  if (files.length === 0) throw new Error("build output has no chunks");

  const failures = [];
  let biggest = { file: "", bytes: 0 };

  for (const file of files) {
    const bytes = statSync(file).size;
    if (bytes > biggest.bytes) biggest = { file, bytes };

    const text = readFileSync(file, "utf8");
    const hits = COMPILER_MARKERS.filter((marker) => text.includes(marker));
    if (hits.length > 0) {
      failures.push(`${file.replace(ROOT + "/", "")} contains ${hits.join(", ")}`);
    }
    if (bytes > MAX_CHUNK_BYTES) {
      failures.push(
        `${file.replace(ROOT + "/", "")} is ${(bytes / 1e6).toFixed(1)} MB`,
      );
    }
  }

  // The compiler has to be somewhere: as a static asset the worker fetches.
  const meta = resolve(ROOT, "public/tslab/meta.json");
  if (!existsSync(meta)) throw new Error("public/tslab/meta.json is missing");
  const { version, compiler } = JSON.parse(readFileSync(meta, "utf8"));
  const compilerFile = resolve(ROOT, "public" + compiler);
  if (!existsSync(compilerFile)) {
    throw new Error(`compiler asset missing: ${compiler}`);
  }
  const compilerBytes = statSync(compilerFile).size;

  return {
    chunks: files.length,
    biggest: {
      file: biggest.file.replace(ROOT + "/", ""),
      kb: Math.round(biggest.bytes / 1024),
    },
    compiler: {
      version,
      path: compiler,
      mb: +(compilerBytes / 1e6).toFixed(1),
    },
    failures,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = checkBundle();
  console.log(`scanned ${r.chunks} page chunks`);
  console.log(`largest chunk: ${r.biggest.file} (${r.biggest.kb} kB)`);
  console.log(
    `compiler served separately: ${r.compiler.path} (${r.compiler.mb} MB, tsc ${r.compiler.version})`,
  );
  if (r.failures.length > 0) {
    console.error("\nthe compiler leaked into the page bundle:");
    for (const f of r.failures) console.error("  " + f);
    process.exit(1);
  }
  console.log("\nOK — no compiler code in any page chunk.");
}
