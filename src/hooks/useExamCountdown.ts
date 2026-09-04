import { useEffect, useMemo, useState } from "react";
import { useExamStore, getRemainingMs } from "../store/useExamStore";

/**
 * Ticks once a second while an exam is in progress and returns the live
 * remaining time in ms, derived from the store's timing fields (see
 * getRemainingMs). Extracted out of app/exam/index.tsx so the review
 * screen (app/exam/review.tsx) can show the same live countdown - review
 * is still part of taking the exam, so the clock keeps running there too.
 */
export function useExamCountdown(): number {
  const status = useExamStore((state) => state.status);

  // The tick value itself is intentionally unused: each tick causes this
  // hook's consumer to re-render and `examState` below to be recomputed
  // with a new object reference, which is what actually triggers
  // getRemainingMs to re-run via the useMemo dependency.
  const [, setNow] = useState(Date.now());

  useEffect(() => {
    if (status !== "in-progress") return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [status]);

  const examState = useExamStore((state) => ({
    startTimeMs: state.startTimeMs,
    pausedMs: state.pausedMs,
    pausedAt: state.pausedAt,
  }));

  return useMemo(() => getRemainingMs(examState), [examState]);
}
