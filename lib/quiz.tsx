"use client";

// Quiz 引擎 —— 三种题型:
//  - choice:单选,点击即判,答错给「针对性纠错」(每个错误选项一条,禁止通用文案),
//    同时点亮正确项;计分按第一次点击。
//  - multi:多选,勾选后「检查」;漏选/错选分别提示。
//  - fill:填空,回车或按钮判定;可反复尝试,答对为止(计分按最终是否答对)。
// 全部答完 → 结算面板,成绩写入进度系统(取历史最好成绩,决定章节是否「完成」)。
//
// 填空题比较时忽略大小写、空白与全角/半角差异(NFKC),并把各种引号统一成 ASCII 双引号:
// 'dark'、“dark” 与 "dark" 是同一个答案。输入法正在组字时按下的回车不算提交。
// 可访问性:每道题有一个常驻的 live region,判定出现时会被播报;作答后不禁用获得焦点的控件
// (改用 aria-disabled),键盘焦点留在原处;多选题的「检查」按钮消失后,焦点移到判定区。

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useProgress } from "@/lib/progress";
import { T, useL, type Loc } from "@/lib/i18n";
import type { ChapterId } from "@/lib/curriculum";

export type QuizItem =
  | {
      type: "choice";
      q: Loc<ReactNode>;
      opts: Loc<ReactNode>[];
      correct: number;
      /** 每个选项的针对性纠错(正确项可留 undefined) */
      wrong?: (Loc<ReactNode> | undefined)[];
      why: Loc<ReactNode>;
    }
  | {
      type: "multi";
      q: Loc<ReactNode>;
      opts: Loc<ReactNode>[];
      correct: number[];
      missHint: Loc<ReactNode>;
      extraHint: Loc<ReactNode>;
      why: Loc<ReactNode>;
    }
  | {
      type: "fill";
      q: Loc<ReactNode>;
      placeholder?: Loc<string>;
      /** 允许的答案(比较规则见 normAnswer) */
      answers: string[];
      hint: Loc<ReactNode>;
      why: Loc<ReactNode>;
    };

type ItemState =
  | { phase: "idle" }
  | { phase: "right"; first: boolean }
  | { phase: "wrong"; picked: number | null; tries: number };

const KEYS = "ABCDEFGH";

// 弯引号、全角引号与单引号都折叠成 ASCII 双引号(NFKC 已把全角 ＂＇ 变成 " ')
const QUOTES = /[\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F']/g;

/** 比较填空答案用的规范形式:NFKC、小写、去掉空白、统一引号。 */
export function normAnswer(s: string) {
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(QUOTES, '"');
}

/** 输入的答案是否与某个允许的答案一致。 */
export function answerMatches(typed: string, answers: string[]) {
  const t = normAnswer(typed);
  return t !== "" && answers.some((a) => normAnswer(a) === t);
}

export function Quiz({ ch, items }: { ch: ChapterId; items: QuizItem[] }) {
  const L = useL();
  const { reportQuiz } = useProgress();
  const [states, setStates] = useState<ItemState[]>(() =>
    items.map(() => ({ phase: "idle" })),
  );
  const [multiPicks, setMultiPicks] = useState<Record<number, number[]>>({});
  const [fillText, setFillText] = useState<Record<number, string>>({});
  const [reported, setReported] = useState(false);
  const baseId = useId();
  const quizRef = useRef<HTMLDivElement>(null);

  const answered = states.filter((s) => s.phase !== "idle").length;
  const firstRight = states.filter(
    (s) => s.phase === "right" && s.first,
  ).length;
  const allDone = answered === items.length;

  // 全部答完 → 上报成绩。放在 effect 里而不是 setStates 的更新函数里:
  // 渲染期间去改 ProgressProvider 的状态是 React 反模式,会报
  // "Cannot update a component while rendering a different component"。
  useEffect(() => {
    if (reported || !allDone) return;
    reportQuiz(ch, firstRight, items.length);
    setReported(true);
  }, [allDone, reported, firstRight, ch, items.length, reportQuiz]);

  const setState = (i: number, st: ItemState) => {
    setStates((prev) => {
      const next = [...prev];
      next[i] = st;
      return next;
    });
  };

  const reset = () => {
    setStates(items.map(() => ({ phase: "idle" })));
    setMultiPicks({});
    setFillText({});
    setReported(false);
    // 「重做测验」按钮随结算面板一起消失;把焦点交给第一道题
    requestAnimationFrame(() =>
      quizRef.current?.querySelector<HTMLElement>(".q-opt, .q-input")?.focus(),
    );
  };

  return (
    <div className="quiz" ref={quizRef}>
      {items.map((item, i) => {
        const st = states[i];
        const dataState =
          st.phase === "right" ? "right" : st.phase === "wrong" ? "wrong" : "";
        return (
          <div className="q-item" key={i} data-state={dataState}>
            <div className="q-num">
              <T
                en={`QUESTION ${String(i + 1).padStart(2, "0")} / ${items.length}`}
                zh={`第 ${i + 1} 题 / 共 ${items.length} 题`}
              />
            </div>
            <p className="q-text" id={`${baseId}-q${i}`}>
              {L(item.q)}
            </p>

            {item.type === "choice" && (
              <ChoiceBody
                item={item}
                st={st}
                onPick={(k) => {
                  if (st.phase !== "idle") return;
                  if (k === item.correct)
                    setState(i, { phase: "right", first: true });
                  else setState(i, { phase: "wrong", picked: k, tries: 1 });
                }}
              />
            )}

            {item.type === "multi" && (
              <MultiBody
                item={item}
                st={st}
                picks={multiPicks[i] ?? []}
                onToggle={(k) => {
                  if (st.phase !== "idle") return;
                  setMultiPicks((p) => {
                    const cur = p[i] ?? [];
                    return {
                      ...p,
                      [i]: cur.includes(k)
                        ? cur.filter((x) => x !== k)
                        : [...cur, k],
                    };
                  });
                }}
                onCheck={() => {
                  if (st.phase !== "idle") return;
                  const picks = (multiPicks[i] ?? []).slice().sort();
                  const target = item.correct.slice().sort();
                  const ok =
                    picks.length === target.length &&
                    picks.every((v, j) => v === target[j]);
                  if (ok) setState(i, { phase: "right", first: true });
                  else setState(i, { phase: "wrong", picked: null, tries: 1 });
                }}
              />
            )}

            {item.type === "fill" && (
              <FillBody
                item={item}
                labelId={`${baseId}-q${i}`}
                st={st}
                text={fillText[i] ?? ""}
                setText={(v) => setFillText((p) => ({ ...p, [i]: v }))}
                onSubmit={() => {
                  if (st.phase === "right") return;
                  const typed = fillText[i] ?? "";
                  if (!typed.trim()) return;
                  const ok = answerMatches(typed, item.answers);
                  if (ok)
                    setState(i, {
                      phase: "right",
                      first: st.phase === "idle",
                    });
                  else
                    setState(i, {
                      phase: "wrong",
                      picked: null,
                      tries: st.phase === "wrong" ? st.tries + 1 : 1,
                    });
                }}
              />
            )}
          </div>
        );
      })}

      <div role="status">
        {allDone && (
          <div className="quiz-score">
            <span className="big">
              {firstRight}/{items.length}
            </span>
            <span>
              {firstRight === items.length ? (
                <T
                  en={
                    <>
                      <b>All correct. The chapter is complete,</b> and its dot
                      in the sidebar is now green.
                    </>
                  }
                  zh={
                    <>
                      <b>全部答对,本章已完成。</b>侧栏中本章的标记已经变为绿色。
                    </>
                  }
                />
              ) : (
                <T
                  en={
                    <>
                      {firstRight} correct on the first try. Read the
                      explanations for the ones you missed, then{" "}
                      <b>redo the quiz</b> until you get them all.
                    </>
                  }
                  zh={
                    <>
                      第一次作答答对 {firstRight} 题。请阅读答错题目的解析,然后
                      <b>重做测验</b>,全部答对后本章才算完成。
                    </>
                  }
                />
              )}
            </span>
            <button
              type="button"
              className="btn btn-sm"
              style={{ marginLeft: "auto" }}
              onClick={reset}
            >
              <T en="Redo the quiz" zh="重做测验" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ChoiceBody({
  item,
  st,
  onPick,
}: {
  item: Extract<QuizItem, { type: "choice" }>;
  st: ItemState;
  onPick: (k: number) => void;
}) {
  const L = useL();
  const locked = st.phase !== "idle";
  return (
    <>
      <div className="q-opts" role="group">
        {item.opts.map((opt, k) => {
          let cls = "q-opt";
          if (locked) {
            if (k === item.correct) cls += " right";
            else if (st.phase === "wrong" && st.picked === k) cls += " wrong";
          }
          return (
            <button
              key={k}
              type="button"
              className={cls}
              aria-disabled={locked || undefined}
              onClick={() => onPick(k)}
            >
              <span className="key">{KEYS[k]}</span>
              <span>{L(opt)}</span>
            </button>
          );
        })}
      </div>
      <div role="status">
        {st.phase === "right" && (
          <div className="q-feedback ok">✓ {L(item.why)}</div>
        )}
        {st.phase === "wrong" && st.picked !== null && (
          <div className="q-feedback no">
            ✕ {L(item.wrong?.[st.picked] ?? item.why)}
            <p style={{ marginTop: 6, marginBottom: 0 }}>
              <b>
                <T
                  en={<>The correct answer is {KEYS[item.correct]}: </>}
                  zh={<>正确答案是 {KEYS[item.correct]}:</>}
                />
              </b>
              {L(item.why)}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function MultiBody({
  item,
  st,
  picks,
  onToggle,
  onCheck,
}: {
  item: Extract<QuizItem, { type: "multi" }>;
  st: ItemState;
  picks: number[];
  onToggle: (k: number) => void;
  onCheck: () => void;
}) {
  const L = useL();
  const liveRef = useRef<HTMLDivElement>(null);
  const locked = st.phase !== "idle";
  const missed = item.correct.some((c) => !picks.includes(c));
  const extra = picks.some((p) => !item.correct.includes(p));
  return (
    <>
      <div className="q-opts" role="group">
        {item.opts.map((opt, k) => {
          let cls = "q-opt";
          if (!locked && picks.includes(k)) cls += " picked";
          if (locked) {
            if (item.correct.includes(k)) cls += " right";
            else if (picks.includes(k)) cls += " wrong";
          }
          return (
            <button
              key={k}
              type="button"
              className={cls}
              aria-disabled={locked || undefined}
              aria-pressed={locked ? undefined : picks.includes(k)}
              onClick={() => onToggle(k)}
            >
              <span className="key">{picks.includes(k) ? "✓" : KEYS[k]}</span>
              <span>{L(opt)}</span>
            </button>
          );
        })}
      </div>
      {!locked && (
        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            className="btn btn-sm"
            disabled={picks.length === 0}
            onClick={() => {
              onCheck();
              // 按钮检查后消失;把焦点移到判定区,键盘用户从判定继续
              requestAnimationFrame(() => liveRef.current?.focus());
            }}
          >
            <T en="Check (multiple answers)" zh="检查(多选)" />
          </button>
        </div>
      )}
      <div role="status" ref={liveRef} tabIndex={-1} className="q-live">
        {st.phase === "right" && (
          <div className="q-feedback ok">✓ {L(item.why)}</div>
        )}
        {st.phase === "wrong" && (
          <div className="q-feedback no">
            ✕ {L(extra ? item.extraHint : missed ? item.missHint : item.why)}
            <p style={{ marginTop: 6, marginBottom: 0 }}>
              <b>
                <T en="The correct set is: " zh="正确组合:" />
              </b>
              {item.correct.map((c) => KEYS[c]).join(" + ")} — {L(item.why)}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function FillBody({
  item,
  labelId,
  st,
  text,
  setText,
  onSubmit,
}: {
  item: Extract<QuizItem, { type: "fill" }>;
  /** 题干元素的 id,作为输入框的可访问名称 */
  labelId: string;
  st: ItemState;
  text: string;
  setText: (v: string) => void;
  onSubmit: () => void;
}) {
  const L = useL();
  const solved = st.phase === "right";
  return (
    <>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          className="q-input"
          aria-labelledby={labelId}
          placeholder={L(
            item.placeholder ?? { en: "Type your answer...", zh: "输入答案…" },
          )}
          value={text}
          readOnly={solved}
          aria-disabled={solved || undefined}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            // 输入法组字时的回车是确认候选词,不是提交
            if (e.key === "Enter" && !e.nativeEvent.isComposing) onSubmit();
          }}
        />
        <button
          type="button"
          className="btn btn-sm"
          aria-disabled={solved || !text.trim() || undefined}
          onClick={onSubmit}
        >
          <T en="Submit" zh="确认" />
        </button>
      </div>
      <div role="status">
        {solved && <div className="q-feedback ok">✓ {L(item.why)}</div>}
        {st.phase === "wrong" && (
          <div className="q-feedback no">
            ✕ <T en="Not yet: " zh="还不正确:" />
            {L(item.hint)}
            {st.tries >= 3 && (
              <p style={{ marginTop: 6, marginBottom: 0 }}>
                <b>
                  <T en="Answer: " zh="参考答案:" />
                </b>
                <code>{item.answers[0]}</code>
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
