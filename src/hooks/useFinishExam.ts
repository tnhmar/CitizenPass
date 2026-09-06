import { useRouter } from "expo-router";
import { useExamStore } from "../store/useExamStore";
import { useProgressStore } from "../store/useProgressStore";

/**
 * Submits the exam (scoring it and recording the attempt in progress
 * history) and navigates to the results screen. Extracted out of
 * app/exam/index.tsx so both the question screen (auto-submit when time
 * runs out) and the review screen (app/exam/review.tsx - the user's
 * explicit "Submit Exam" action) share exactly one definition of what
 * "finishing" an exam does, rather than two copies that could drift.
 */
export function useFinishExam(): () => void {
  const router = useRouter();
  const submitExam = useExamStore((state) => state.submitExam);
  const recordExamAttempt = useProgressStore((state) => state.recordExamAttempt);

  return () => {
    const result = submitExam();
    void recordExamAttempt({
      dateIso: new Date().toISOString(),
      score: result.correct,
      total: result.total,
      passed: result.passed,
    });
    router.push("/exam/results");
  };
}
