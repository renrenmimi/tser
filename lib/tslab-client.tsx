"use client";

// 编译器 worker 的主线程一侧 —— 全站单例。
//
// 关键点:这里【不能】import "typescript",否则 8.7 MB 编译器会进页面 bundle。
// 编译器只在 worker 里、只在真的要用时才加载(public/tslab/worker.js)。
// 页面上可能同时有好几个实验室,它们共享同一个 worker、同一份已解析的 lib.d.ts。

import { useCallback, useSyncExternalStore } from "react";

/* ---------------- 类型 ---------------- */

export type TsTarget = "es5" | "es2015" | "es2020" | "es2022" | "esnext";

/** 编译开关:朴素对象,由 worker 翻译成真的 CompilerOptions。 */
export interface TsFlags {
  target?: TsTarget;
  strict?: boolean;
  noImplicitAny?: boolean;
  strictNullChecks?: boolean;
  strictFunctionTypes?: boolean;
  strictBindCallApply?: boolean;
  strictPropertyInitialization?: boolean;
  noImplicitThis?: boolean;
  useUnknownInCatchVariables?: boolean;
  alwaysStrict?: boolean;
  noUncheckedIndexedAccess?: boolean;
  exactOptionalPropertyTypes?: boolean;
  noImplicitReturns?: boolean;
  noFallthroughCasesInSwitch?: boolean;
  erasableSyntaxOnly?: boolean;
  experimentalDecorators?: boolean;
  verbatimModuleSyntax?: boolean;
}

export interface TsRelated {
  message: string;
  line: number | null;
  col: number | null;
  inLib: boolean;
}

/** 一条真实的 tsc 诊断。 */
export interface TsDiagnostic {
  /** 错误码,如 2551 —— 界面上显示成 TS2551 */
  code: number;
  severity: "error" | "warning" | "message";
  message: string;
  /** 字符偏移,用于在编辑器里画波浪线 */
  start: number;
  length: number;
  line: number;
  col: number;
  /** tsc 命令行原样的一行:main.ts(3,7): error TS2551: … */
  cli: string;
  related: TsRelated[];
}

export interface TsQuickInfo {
  /** 悬浮显示的签名,如 `const total: number` */
  text: string;
  docs: string;
  kind: string;
  start: number;
  length: number;
}

export type TsStatus = "idle" | "loading" | "ready" | "error";

interface Meta {
  version: string;
  compiler: string;
  libs: string;
}

/* ---------------- worker 单例 ---------------- */

interface Pending {
  /** The worker instance this request was posted to. */
  gen: number;
  resolve: (v: Record<string, unknown>) => void;
  reject: (e: Error) => void;
}

let worker: Worker | null = null;
let readyPromise: Promise<string> | null = null;
/**
 * Bumped for every worker instance and again whenever one is abandoned, so a
 * late reply from a worker we have given up on can be recognised and dropped.
 */
let generation = 0;
let nextId = 1;
const pending = new Map<number, Pending>();

/** 加载状态是全站共享的,用最小订阅机制推给所有实验室。 */
const state = {
  status: "idle" as TsStatus,
  phase: "" as "" | "compiler" | "libs",
  version: "",
  error: "",
};
const subscribers = new Set<() => void>();

// useSyncExternalStore 需要一个「状态变了才换引用」的快照
type Snapshot = Readonly<typeof state>;
let snapshot: Snapshot = { ...state };
const SERVER_SNAPSHOT: Snapshot = { ...state };

function publish(next: Partial<typeof state>) {
  Object.assign(state, next);
  snapshot = { ...state };
  subscribers.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

/**
 * Abandon the worker of `gen`: reject every request still in flight, forget the
 * pending map, detach the handlers, terminate the thread and clear the
 * singleton so the next attempt starts exactly one clean worker. A call for an
 * older generation is ignored, so an `error` and a `messageerror` arriving
 * together tear down once rather than twice.
 */
function teardown(gen: number, reason: string): void {
  if (gen !== generation) return;

  const failed = worker;
  worker = null;
  readyPromise = null;
  // From here on, anything `failed` still posts belongs to a dead generation.
  generation += 1;

  const err = new Error(reason);
  for (const p of pending.values()) p.reject(err);
  pending.clear();

  if (failed) {
    failed.onmessage = null;
    failed.onerror = null;
    failed.onmessageerror = null;
    try {
      failed.terminate();
    } catch {
      /* the thread is already gone */
    }
  }

  publish({ status: "error", phase: "", error: reason });
}

function send<T extends Record<string, unknown>>(
  payload: Record<string, unknown>,
): Promise<T> {
  const w = worker;
  if (!w) return Promise.reject(new Error("compiler worker not started"));
  const gen = generation;
  const id = nextId++;
  return new Promise<T>((resolve, reject) => {
    pending.set(id, {
      gen,
      resolve: resolve as Pending["resolve"],
      reject,
    });
    try {
      w.postMessage({ ...payload, id });
    } catch (err) {
      pending.delete(id);
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}

/** 启动 worker 并加载编译器;重复调用返回同一个 promise。 */
function ensureReady(): Promise<string> {
  if (readyPromise) return readyPromise;

  generation += 1;
  const myGen = generation;

  const promise = (async () => {
    if (typeof Worker === "undefined") throw new Error("Web Worker unavailable");
    publish({ status: "loading", phase: "compiler", error: "" });

    const w = new Worker("/tslab/worker.js");
    worker = w;

    w.onmessage = (e: MessageEvent) => {
      // A reply from a worker that has already been abandoned must never settle
      // a request belonging to its replacement.
      if (myGen !== generation) return;
      const msg = e.data ?? {};
      if (msg.kind === "progress") {
        publish({ phase: msg.phase });
        return;
      }
      const p = pending.get(msg.id);
      if (!p || p.gen !== myGen) return;
      pending.delete(msg.id);
      if (msg.ok) p.resolve(msg);
      else p.reject(new Error(msg.error ?? "compiler error"));
    };
    w.onerror = () => teardown(myGen, "the compiler worker stopped");
    w.onmessageerror = () =>
      teardown(myGen, "the compiler worker sent an unreadable message");

    const res = await fetch("/tslab/meta.json");
    if (!res.ok) throw new Error(`compiler manifest ${res.status}`);
    const meta: Meta = await res.json();

    const init = await send<{ version: string }>({
      kind: "init",
      compiler: meta.compiler,
      libs: meta.libs,
    });
    if (myGen !== generation) throw new Error("compiler worker was replaced");

    publish({ status: "ready", version: init.version, phase: "" });
    return init.version;
  })();

  readyPromise = promise;

  // A failure while starting up is handled exactly like a crash later on, so a
  // half-started worker is terminated instead of being left running for the
  // next attempt to leak past.
  promise.catch((err: Error) => {
    teardown(myGen, err.message || "the compiler failed to start");
  });

  return promise;
}

/** Discard a failed worker and make one clean attempt to start again. */
function restart(): void {
  teardown(generation, "restarting the compiler");
  publish({ status: "idle", phase: "", error: "" });
  void ensureReady().catch(() => {
    /* teardown has already published the failure */
  });
}

/* ---------------- React 接口 ---------------- */

export interface TsLabApi {
  status: TsStatus;
  /** 加载阶段,用于「正在下载编译器…」这类提示 */
  phase: "" | "compiler" | "libs";
  /** 真实编译器版本,如 "5.9.3" */
  version: string;
  error: string;
  /** 预热:实验室进入视口时调用,把加载提前到用户动手之前 */
  warm: () => void;
  /** Start over after a failure: one new worker, nothing left of the old one. */
  retry: () => void;
  check: (
    code: string,
    flags?: TsFlags,
  ) => Promise<{ diagnostics: TsDiagnostic[]; ms: number }>;
  quickInfo: (
    code: string,
    pos: number,
    flags?: TsFlags,
  ) => Promise<TsQuickInfo | null>;
  emit: (
    code: string,
    flags?: TsFlags,
  ) => Promise<{
    js: string | null;
    dts: string | null;
    emitSkipped: boolean;
    diagnostics: TsDiagnostic[];
    ms: number;
  }>;
}

export function useTsLab(): TsLabApi {
  // 订阅模块级状态。useSyncExternalStore 不会漏掉在渲染与订阅之间发布的变化
  // (用 useEffect 订阅时,这段空档里的 publish 会被错过)。
  const current = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => SERVER_SNAPSHOT,
  );

  const warm = useCallback(() => {
    void ensureReady().catch(() => {
      /* 状态已经发布,这里不用再处理 */
    });
  }, []);

  const retry = useCallback(() => restart(), []);

  const check = useCallback(async (code: string, flags?: TsFlags) => {
    await ensureReady();
    const r = await send<{ diagnostics: TsDiagnostic[]; ms: number }>({
      kind: "check",
      code,
      options: flags ?? {},
    });
    return { diagnostics: r.diagnostics, ms: r.ms };
  }, []);

  const quickInfo = useCallback(
    async (code: string, pos: number, flags?: TsFlags) => {
      await ensureReady();
      const r = await send<{ info: TsQuickInfo | null }>({
        kind: "quickinfo",
        code,
        pos,
        options: flags ?? {},
      });
      return r.info;
    },
    [],
  );

  const emit = useCallback(async (code: string, flags?: TsFlags) => {
    await ensureReady();
    return await send<{
      js: string | null;
      dts: string | null;
      emitSkipped: boolean;
      diagnostics: TsDiagnostic[];
      ms: number;
    }>({ kind: "emit", code, options: flags ?? {} });
  }, []);

  return {
    status: current.status,
    phase: current.phase,
    version: current.version,
    error: current.error,
    warm,
    retry,
    check,
    quickInfo,
    emit,
  };
}
