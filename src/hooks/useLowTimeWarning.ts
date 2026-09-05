import { useEffect } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useExamStore } from "../store/useExamStore";

const LOW_TIME_THRESHOLD_MS = 5 * 60 * 1000;

/**
 * Fires a one-time alert the moment the exam timer first drops under 5
 * minutes remaining. The "already warned" flag lives in the store
 * (`lowTimeWarningShown`, see useExamStore.ts), not in local state here,
 * specifically so navigating between the question screen and the review
 * screen - or exiting and coming back - never re-fires it. Call this once
 * from each exam screen, alongside useExamCountdown().
 */
export function useLowTimeWarning(remainingMs: number): void {
  const { t } = useTranslation();
  const status = useExamStore((state) => state.status);
  const lowTimeWarningShown = useExamStore((state) => state.lowTimeWarningShown);
  const markLowTimeWarningShown = useExamStore((state) => state.markLowTimeWarningShown);

  useEffect(() => {
    if (status !== "in-progress" || lowTimeWarningShown) return;
    if (remainingMs < LOW_TIME_THRESHOLD_MS) {
      markLowTimeWarningShown();
      Alert.alert(t("exam.fiveMinuteWarningTitle"), t("exam.fiveMinuteWarningBody"));
    }
  }, [remainingMs, status, lowTimeWarningShown, markLowTimeWarningShown, t]);
}
