import type { ExamAttempt } from "../services/persistence/progressRepository";

export type TrendPoint = {
  x: number;
  y: number;
  percent: number;
  passed: boolean;
  dateIso: string;
};

/**
 * Maps a chronological (oldest-first) list of exam attempts onto pixel
 * coordinates for a simple line chart - x increases with recency, y
 * decreases as score increases (SVG's y axis points down). Kept free of
 * any rendering concerns so the scaling math (including the one-point
 * edge case) can be unit tested without mounting a component.
 */
export function computeExamTrendPoints(
  attempts: ExamAttempt[],
  width: number,
  height: number,
  padding = 12
): TrendPoint[] {
  if (attempts.length === 0 || width <= 0 || height <= 0) return [];

  const usableWidth = Math.max(width - padding * 2, 1);
  const usableHeight = Math.max(height - padding * 2, 1);

  return attempts.map((attempt, index) => {
    const percent = attempt.total > 0 ? Math.min(100, Math.max(0, Math.round((attempt.score / attempt.total) * 100))) : 0;
    // A single attempt has nothing to space out against - center it
    // rather than dividing by (length - 1) === 0.
    const x = attempts.length === 1 ? padding + usableWidth / 2 : padding + (index / (attempts.length - 1)) * usableWidth;
    const y = padding + (1 - percent / 100) * usableHeight;
    return { x, y, percent, passed: attempt.passed, dateIso: attempt.dateIso };
  });
}
