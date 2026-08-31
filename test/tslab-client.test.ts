// The compiler client is a module singleton: one worker shared by every lab on
// the page. These tests drive it with a fake Worker and pin what has to happen
// when that worker dies — nothing may be left pending, and nothing from a dead
// worker may answer for its replacement.

import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

interface WorkerMessage {
  id?: number;
  kind?: string;
  [key: string]: unknown;
}

class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  onmessageerror: ((e: unknown) => void) | null = null;
  posted: WorkerMessage[] = [];
  terminateCalls = 0;

  constructor(public url: string) {
    FakeWorker.instances.push(this);
  }
  postMessage(msg: WorkerMessage) {
    this.posted.push(msg);
  }
  terminate() {
    this.terminateCalls += 1;
  }

  /** Deliver a reply as the real worker would. */
  reply(msg: WorkerMessage) {
    this.onmessage?.({ data: msg } as MessageEvent);
  }
  crash() {
    this.onerror?.(new Event("error"));
  }
  garbleMessage() {
    this.onmessageerror?.(new Event("messageerror"));
  }
  sent(kind: string) {
    return this.posted.filter((m) => m.kind === kind);
  }
}

const META = {
  version: "5.9.3",
  compiler: "/tslab/5.9.3/typescript.js",
  libs: "/tslab/5.9.3/libs.json",
};

type Client = typeof import("@/lib/tslab-client");

/** Every test gets its own module instance, because the state is module level. */
async function freshClient(fetchImpl?: () => Promise<unknown>): Promise<Client> {
  vi.resetModules();
  FakeWorker.instances = [];
  (globalThis as unknown as { Worker: unknown }).Worker = FakeWorker;
  globalThis.fetch = vi.fn(
    fetchImpl ??
      (async () => ({ ok: true, status: 200, json: async () => META })),
  ) as unknown as typeof fetch;
  return await import("@/lib/tslab-client");
}

async function boot(client: Client) {
  const hook = renderHook(() => client.useTsLab());
  act(() => hook.result.current.warm());

  await waitFor(() => expect(FakeWorker.instances.length).toBe(1));
  const worker = FakeWorker.instances[0];
  await waitFor(() => expect(worker.sent("init").length).toBe(1));

  act(() => {
    worker.reply({ id: worker.sent("init")[0].id, ok: true, version: "5.9.3" });
  });
  await waitFor(() => expect(hook.result.current.status).toBe("ready"));
  return { hook, worker };
}

const live = () => FakeWorker.instances.filter((w) => w.terminateCalls === 0);

beforeEach(() => {
  FakeWorker.instances = [];
});

describe("normal operation", () => {
  it("starts one worker and shares it across labs", async () => {
    const client = await freshClient();
    const { hook, worker } = await boot(client);

    // A second lab mounting must not bring a second compiler with it.
    const other = renderHook(() => client.useTsLab());
    act(() => other.result.current.warm());

    const a = hook.result.current.check("const a = 1;");
    const b = other.result.current.check("const b = 2;");
    await waitFor(() => expect(worker.sent("check").length).toBe(2));

    for (const msg of worker.sent("check")) {
      act(() => worker.reply({ id: msg.id, ok: true, diagnostics: [], ms: 1 }));
    }
    await expect(a).resolves.toEqual({ diagnostics: [], ms: 1 });
    await expect(b).resolves.toEqual({ diagnostics: [], ms: 1 });
    expect(FakeWorker.instances.length).toBe(1);
  });
});

describe("worker failure", () => {
  it("rejects every request that was still in flight", async () => {
    const client = await freshClient();
    const { hook, worker } = await boot(client);

    const first = hook.result.current.check("const a = 1;");
    const second = hook.result.current.quickInfo("const a = 1;", 6);
    await waitFor(() => expect(worker.posted.length).toBe(3)); // init + 2

    act(() => worker.crash());

    await expect(first).rejects.toThrow(/compiler worker stopped/);
    await expect(second).rejects.toThrow(/compiler worker stopped/);
    expect(worker.terminateCalls).toBe(1);
    await waitFor(() => expect(hook.result.current.status).toBe("error"));
  });

  it("treats an unreadable message the same way", async () => {
    const client = await freshClient();
    const { hook, worker } = await boot(client);

    const pending = hook.result.current.check("const a = 1;");
    await waitFor(() => expect(worker.sent("check").length).toBe(1));

    act(() => worker.garbleMessage());

    await expect(pending).rejects.toThrow(/unreadable message/);
    expect(worker.terminateCalls).toBe(1);
  });

  it("tears down once when a worker reports failure twice", async () => {
    const client = await freshClient();
    const { worker } = await boot(client);

    act(() => worker.crash());
    act(() => worker.crash());
    act(() => worker.garbleMessage());

    expect(worker.terminateCalls).toBe(1);
    expect(FakeWorker.instances.length).toBe(1);
  });

  it("serves work asked for after a crash from one replacement worker", async () => {
    const client = await freshClient();
    const { hook, worker } = await boot(client);

    act(() => worker.crash());
    await waitFor(() => expect(hook.result.current.status).toBe("error"));

    // Recovery is allowed to happen on demand, but it must bring up exactly one
    // worker, and the answer must come from that one.
    const check = hook.result.current.check("const a = 1;");
    await waitFor(() => expect(FakeWorker.instances.length).toBe(2));
    const replacement = FakeWorker.instances[1];
    expect(live()).toEqual([replacement]);

    await waitFor(() => expect(replacement.sent("init").length).toBe(1));
    act(() =>
      replacement.reply({
        id: replacement.sent("init")[0].id,
        ok: true,
        version: "5.9.3",
      }),
    );
    await waitFor(() => expect(replacement.sent("check").length).toBe(1));
    act(() =>
      replacement.reply({
        id: replacement.sent("check")[0].id,
        ok: true,
        diagnostics: [],
        ms: 5,
      }),
    );

    await expect(check).resolves.toEqual({ diagnostics: [], ms: 5 });
    expect(FakeWorker.instances.length).toBe(2);
  });
});

describe("retry", () => {
  it("creates exactly one clean worker", async () => {
    const client = await freshClient();
    const { hook, worker } = await boot(client);

    act(() => worker.crash());
    await waitFor(() => expect(hook.result.current.status).toBe("error"));

    act(() => hook.result.current.retry());

    await waitFor(() => expect(FakeWorker.instances.length).toBe(2));
    const replacement = FakeWorker.instances[1];
    await waitFor(() => expect(replacement.sent("init").length).toBe(1));
    expect(live()).toEqual([replacement]);

    act(() => {
      replacement.reply({
        id: replacement.sent("init")[0].id,
        ok: true,
        version: "5.9.3",
      });
    });
    await waitFor(() => expect(hook.result.current.status).toBe("ready"));

    const check = hook.result.current.check("const a = 1;");
    await waitFor(() => expect(replacement.sent("check").length).toBe(1));
    act(() =>
      replacement.reply({
        id: replacement.sent("check")[0].id,
        ok: true,
        diagnostics: [],
        ms: 2,
      }),
    );
    await expect(check).resolves.toEqual({ diagnostics: [], ms: 2 });
  });

  it("does not let a dead worker answer for its replacement", async () => {
    const client = await freshClient();
    const { hook, worker } = await boot(client);

    // Keep the handler the dead worker was using: a message already in the
    // channel when it died would still arrive through it.
    const staleHandler = worker.onmessage!;

    act(() => worker.crash());
    act(() => hook.result.current.retry());
    await waitFor(() => expect(FakeWorker.instances.length).toBe(2));

    const replacement = FakeWorker.instances[1];
    act(() =>
      replacement.reply({
        id: replacement.sent("init")[0].id,
        ok: true,
        version: "5.9.3",
      }),
    );
    await waitFor(() => expect(hook.result.current.status).toBe("ready"));

    let settled: string | null = null;
    const check = hook.result.current
      .check("const a = 1;")
      .then(() => (settled = "resolved"))
      .catch(() => (settled = "rejected"));
    await waitFor(() => expect(replacement.sent("check").length).toBe(1));
    const id = replacement.sent("check")[0].id as number;

    // The dead worker answers with the id the live worker is waiting on.
    act(() =>
      staleHandler({
        data: { id, ok: true, diagnostics: [{ code: 9999 }], ms: 1 },
      } as MessageEvent),
    );
    await new Promise((r) => setTimeout(r, 20));
    expect(settled).toBeNull();

    // The real worker still owns the answer.
    act(() =>
      replacement.reply({ id, ok: true, diagnostics: [], ms: 3 }),
    );
    await check;
    expect(settled).toBe("resolved");
  });

  it("leaves no live worker behind when start-up keeps failing", async () => {
    const client = await freshClient(async () => {
      throw new Error("offline");
    });
    const hook = renderHook(() => client.useTsLab());

    for (let attempt = 0; attempt < 3; attempt++) {
      act(() => hook.result.current.retry());
      await waitFor(() => expect(hook.result.current.status).toBe("error"));
      expect(live()).toHaveLength(0);
    }

    expect(FakeWorker.instances.length).toBeGreaterThan(0);
    expect(FakeWorker.instances.every((w) => w.terminateCalls === 1)).toBe(true);
  });

  it("reports a manifest that cannot be read", async () => {
    const client = await freshClient(async () => ({
      ok: false,
      status: 404,
      json: async () => ({}),
    }));
    const hook = renderHook(() => client.useTsLab());

    act(() => hook.result.current.warm());

    await waitFor(() => expect(hook.result.current.status).toBe("error"));
    expect(hook.result.current.error).toMatch(/manifest 404/);
    expect(live()).toHaveLength(0);
  });
});
