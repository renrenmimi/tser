// Runs the worker the site actually ships (public/tslab/worker.js) against the
// compiler the site actually ships, inside a VM context that stands in for the
// Web Worker global. Nothing about the diagnostics is simulated: they come from
// the same LanguageService the browser talks to.

import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
import { resolve } from "node:path";
import type { TsDiagnostic, TsQuickInfo } from "@/lib/tslab-client";

const ROOT = process.cwd();
const fromWebPath = (webPath: string) => resolve(ROOT, "public" + webPath);

interface Reply {
  id?: number;
  ok?: boolean;
  error?: string;
  [key: string]: unknown;
}

export interface CompilerWorker {
  version: string;
  check(
    code: string,
    options?: Record<string, unknown>,
  ): Promise<{ diagnostics: TsDiagnostic[]; ms: number }>;
  quickInfo(
    code: string,
    pos: number,
    options?: Record<string, unknown>,
  ): Promise<{ info: TsQuickInfo | null }>;
  emit(
    code: string,
    options?: Record<string, unknown>,
  ): Promise<{ js: string | null; dts: string | null; emitSkipped: boolean }>;
}

export async function startCompilerWorker(): Promise<CompilerWorker> {
  const meta = JSON.parse(
    readFileSync(resolve(ROOT, "public/tslab/meta.json"), "utf8"),
  ) as { compiler: string; libs: string };

  const listeners = new Set<(msg: Reply) => void>();
  const sandbox: Record<string, unknown> = {
    console,
    setTimeout,
    clearTimeout,
    postMessage: (msg: Reply) => listeners.forEach((l) => l(msg)),
    importScripts: (url: string) => {
      runInContext(readFileSync(fromWebPath(url), "utf8"), context, {
        filename: url,
      });
    },
    fetch: async (url: string) => ({
      ok: true,
      status: 200,
      json: async () => JSON.parse(readFileSync(fromWebPath(url), "utf8")),
    }),
  };
  sandbox.self = sandbox;
  const context = createContext(sandbox);

  runInContext(
    readFileSync(resolve(ROOT, "public/tslab/worker.js"), "utf8"),
    context,
    { filename: "worker.js" },
  );

  let nextId = 1;
  const request = <T>(msg: Record<string, unknown>): Promise<T> => {
    const id = nextId++;
    return new Promise<T>((res, rej) => {
      const listener = (reply: Reply) => {
        if (reply.id !== id) return;
        listeners.delete(listener);
        if (reply.ok) res(reply as T);
        else rej(new Error(reply.error ?? "worker error"));
      };
      listeners.add(listener);
      (sandbox.onmessage as (e: { data: unknown }) => void)({
        data: { ...msg, id },
      });
    });
  };

  const init = await request<{ version: string }>({
    kind: "init",
    compiler: meta.compiler,
    libs: meta.libs,
  });

  return {
    version: init.version,
    check: (code, options = {}) => request({ kind: "check", code, options }),
    quickInfo: (code, pos, options = {}) =>
      request({ kind: "quickinfo", code, pos, options }),
    emit: (code, options = {}) => request({ kind: "emit", code, options }),
  };
}
