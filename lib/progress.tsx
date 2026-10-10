"use client";

// 全站学习进度 —— localStorage 持久化。
// 两类事实:① 勾掉的动手任务("first-call/poke-height" 这种 `${章节}/${labId}` 键);
// ② 每章 Quiz 的最好成绩。章节状态由此推导:new(没动过)/ doing(动过)/ done(测验全对)。
// 所有组件(侧栏、LabSet、Quiz、终章总表)共用这一个 context,别自己另存一份。
// 同时打开几个标签页时,每次写入都以存储中的最新数据为基础,并监听其他标签页触发的
// storage 事件,所以一个标签页的记录不会被另一个标签页内存里的旧对象整体覆盖。

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { ChapterId } from "@/lib/curriculum";

const KEY = "tser-progress-v1";

export interface ProgressData {
  labs: Record<string, 1>;
  quiz: Partial<Record<ChapterId, { right: number; total: number }>>;
}

const EMPTY: ProgressData = { labs: {}, quiz: {} };

interface Ctx {
  ready: boolean;
  data: ProgressData;
  isDone: (pid: string) => boolean;
  toggleLab: (pid: string) => void;
  reportQuiz: (ch: ChapterId, right: number, total: number) => void;
  chapterState: (ch: ChapterId) => "new" | "doing" | "done";
  labCount: (ch: ChapterId) => number;
  totalLabs: number;
  reset: () => void;
}

const ProgressContext = createContext<Ctx>({
  ready: false,
  data: EMPTY,
  isDone: () => false,
  toggleLab: () => {},
  reportQuiz: () => {},
  chapterState: () => "new",
  labCount: () => 0,
  totalLabs: 0,
  reset: () => {},
});

/** 存储中的进度;没有记录时为 EMPTY,存储不可用或内容损坏时为 null。 */
function readStored(): ProgressData | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return {
      labs: parsed?.labs ?? {},
      quiz: parsed?.quiz ?? {},
    };
  } catch {
    return null;
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProgressData>(EMPTY);
  const [ready, setReady] = useState(false);
  // 最新的进度,供写入时在存储不可用的情况下兜底
  const latest = useRef<ProgressData>(EMPTY);

  const show = useCallback((next: ProgressData) => {
    latest.current = next;
    setData(next);
  }, []);

  useEffect(() => {
    show(readStored() ?? EMPTY);
    setReady(true);
    // 其他标签页写入进度时同步过来(key 为 null 表示存储被整体清空)
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY || e.key === null) show(readStored() ?? EMPTY);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [show]);

  const persist = useCallback(
    (next: ProgressData) => {
      show(next);
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* 私密模式等写入失败:仅内存态 */
      }
    },
    [show],
  );

  /** 以存储中的最新数据为基础计算下一份进度;change 返回 null 表示不写入。 */
  const update = useCallback(
    (change: (base: ProgressData) => ProgressData | null) => {
      const base = readStored() ?? latest.current;
      const next = change(base);
      if (next) persist(next);
      else show(base);
    },
    [persist, show],
  );

  const isDone = useCallback((pid: string) => !!data.labs[pid], [data]);

  const toggleLab = useCallback(
    (pid: string) =>
      update((base) => {
        const labs = { ...base.labs };
        if (labs[pid]) delete labs[pid];
        else labs[pid] = 1;
        return { ...base, labs };
      }),
    [update],
  );

  const reportQuiz = useCallback(
    (ch: ChapterId, right: number, total: number) =>
      update((base) => {
        const prev = base.quiz[ch];
        // 只保留最好成绩
        if (prev && prev.right / prev.total >= right / total) return null;
        return { ...base, quiz: { ...base.quiz, [ch]: { right, total } } };
      }),
    [update],
  );

  const chapterState = useCallback(
    (ch: ChapterId): "new" | "doing" | "done" => {
      const q = data.quiz[ch];
      if (q && q.total > 0 && q.right === q.total) return "done";
      if (q) return "doing";
      if (Object.keys(data.labs).some((k) => k.startsWith(ch + "/")))
        return "doing";
      return "new";
    },
    [data],
  );

  const labCount = useCallback(
    (ch: ChapterId) =>
      Object.keys(data.labs).filter((k) => k.startsWith(ch + "/")).length,
    [data],
  );

  const reset = useCallback(() => persist(EMPTY), [persist]);

  return (
    <ProgressContext.Provider
      value={{
        ready,
        data,
        isDone,
        toggleLab,
        reportQuiz,
        chapterState,
        labCount,
        totalLabs: Object.keys(data.labs).length,
        reset,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export const useProgress = () => useContext(ProgressContext);
