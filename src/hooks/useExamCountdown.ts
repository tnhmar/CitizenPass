import { useEffect, useMemo, useState } from "react";
import { useExamStore, getRemainingMs } from "../store/useExamStore";

/**
 * Ticks once a second while an exam is in progress and returns the live
 * remaining time in ms. Matches the official IRCC test: the clock never
 * pauses, so this is a pure countdown from `startTimeMs` - no paused-time
 * bookkeeping to account for (see useExamStore.ts). Extracted out of
 * app/exam/index.tsx so the Grid/List navigator (app/exam/review.tsx) can
 * show the same live countdown.
 */
export function useExamCountdown(): number {
  const status = useExamStore((state) => state.status);
  const startTimeMs = useExamStore((state) => state.startTimeMs);

  // `now` is what actually drives the tick: since startTimeMs itself only
  // changes when a new exam starts, useMemo below needs `now` as its own
  // explicit dependency to recompute every second.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (status !== "in-progress") return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [status]);

  return useMemo(() => getRemainingMs(startTimeMs, now), [startTimeMs, now]);
}
