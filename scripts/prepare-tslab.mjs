// 把真实的 TypeScript 编译器搬到 public/tslab/,给浏览器里的实验室用。
//
// 产物:
//   public/tslab/meta.json            编译器版本号(小文件,每次校验;界面显示的版本必须是真的)
//   public/tslab/<版本>/typescript.js 编译器本体(worker 用 importScripts 加载,UMD 暴露全局 ts)
//   public/tslab/<版本>/libs.json     lib.*.d.ts 的传递闭包,键是 "/lib.xxx.d.ts"
//
// 大文件按版本号分目录:路径里带版本,就能让浏览器永久缓存(见 next.config.mjs 的 headers),
// 升级 TypeScript 时路径自动变,不会拿到旧编译器。
//
// 闭包怎么来:从若干入口 lib 出发,顺着文件里的 /// <reference lib="..." /> 一路收集。
// 入口按「实验室里可切的 target」挑:每个 target 对应一个默认 lib(和 tsc 一致)。
// 这些文件是生成物,不进 git —— predev / prebuild 会自动跑。

import { createRequire } from "node:module";
import { mkdir, readFile, writeFile, copyFile, stat } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const TS_LIB_DIR = path.dirname(require.resolve("typescript"));
const OUT_DIR = path.join(process.cwd(), "public", "tslab");

/** 入口 lib:空串是 lib.d.ts(target ES5 的默认 lib),其余对应各 target 的 full 集。 */
const ENTRY_LIBS = [
  "", // lib.d.ts           → ES5
  "es2015.full",
  "es2020.full",
  "es2022.full",
  "esnext.full",
  // TS 5.x 在默认 lib 之外还会隐式带上这两个
  "decorators",
  "decorators.legacy",
];

const libFileName = (lib) => (lib ? `lib.${lib}.d.ts` : "lib.d.ts");
const REFERENCE_RE = /\/\/\/\s*<reference\s+lib\s*=\s*["']([^"']+)["']\s*\/>/g;

/** 从入口出发收集传递闭包,返回 { "/lib.xxx.d.ts": 内容 }。 */
async function collectLibs() {
  const files = {};
  const queue = ENTRY_LIBS.map(libFileName);
  const seen = new Set();

  while (queue.length) {
    const name = queue.shift();
    if (seen.has(name)) continue;
    seen.add(name);

    let text;
    try {
      text = await readFile(path.join(TS_LIB_DIR, name), "utf8");
    } catch {
      // 某个 target 的 full 集在这个 TS 版本里不存在,跳过即可(不是致命错误)
      continue;
    }
    files[`/${name}`] = text;

    for (const m of text.matchAll(REFERENCE_RE)) queue.push(libFileName(m[1]));
  }
  return files;
}

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2) + " MB";

async function main() {
  const { version } = require("typescript");
  const versionDir = path.join(OUT_DIR, version);
  await mkdir(versionDir, { recursive: true });

  // ① 编译器本体
  const compilerOut = path.join(versionDir, "typescript.js");
  await copyFile(path.join(TS_LIB_DIR, "typescript.js"), compilerOut);

  // ② lib 闭包
  const libs = await collectLibs();
  const libsJson = JSON.stringify(libs);
  await writeFile(path.join(versionDir, "libs.json"), libsJson);

  // ③ 版本清单:客户端先读它,再去取带版本号的大文件
  await writeFile(
    path.join(OUT_DIR, "meta.json"),
    JSON.stringify(
      {
        version,
        libCount: Object.keys(libs).length,
        compiler: `/tslab/${version}/typescript.js`,
        libs: `/tslab/${version}/libs.json`,
      },
      null,
      2,
    ) + "\n",
  );

  const compilerSize = (await stat(compilerOut)).size;
  console.log(
    `tslab: TypeScript ${version} → public/tslab/${version}/ ` +
      `(compiler ${mb(compilerSize)}, ${Object.keys(libs).length} lib files ${mb(
        Buffer.byteLength(libsJson),
      )})`,
  );
}

main().catch((err) => {
  console.error("tslab: prepare failed —", err.message);
  process.exit(1);
});
