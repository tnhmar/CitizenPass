import { useEffect } from "react";
import { useExamStore } from "../store/useExamStore";

/**
 * Keeps the exam timer correctly paused whenever neither exam screen (the
 * question view, app/exam/index.tsx, or the review list,
 * app/exam/review.tsx) is on screen - regardless of *how* the user left:
 * the explicit "Exit Exam" action, the OS back gesture/hardware back
 * button, a deep link away, or anything else that unmounts the screen
 * without going through an explicit handler.
 *
 * Call this from both exam screens. Navigating between those two screens
 * unmounts one and mounts the other in the same tick, so the unmount's
 * pause() and the new mount's resume() net out to virtually no paused
 * time - the clock keeps running while the user stays anywhere in the
 * exam flow. Actually leaving the flow entirely (to another tab, to Home,
 * backgrounding the app) unmounts the current screen with nothing to
 * immediately resume it, so it stays correctly paused until the user
 * comes back to either exam screen - which is what fixes "quit exam and
 * come back later - the timer had kept running/reset instead of picking
 * up where it left off."
 *
 * This is deliberately separate from the AppState-based pause/resume
 * (still set up individually in each screen): that listener handles the
 * app itself being backgrounded while a screen stays mounted (e.g. a
 * phone call), which this mount/unmount effect can't see since the
 * component never unmounts for that case.
 */
export function useExamSessionLifecycle(): void {
  const resume = useExamStore((state) => state.resume);
  const pause = useExamStore((state) => state.pause);

  useEffect(() => {
    if (useExamStore.getState().status === "in-progress") {
      resume();
    }
    return () => {
      if (useExamStore.getState().status === "in-progress") {
        pause();
      }
    };
    // Mount/unmount only, by design - see the doc comment above. Reading
    // status via getState() here (rather than a reactive selector) is
    // what keeps this effect from re-firing on every status change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
