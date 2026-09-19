import { computeExamTrendPoints } from "../../src/utils/examTrend";
import type { ExamAttempt } from "../../src/services/persistence/progressRepository";

function attempt(overrides: Partial<ExamAttempt>): ExamAttempt {
  return { dateIso: "2026-01-01T00:00:00.000Z", score: 15, total: 20, passed: true, ...overrides };
}

describe("computeExamTrendPoints", () => {
  it("returns an empty array for no attempts", () => {
    expect(computeExamTrendPoints([], 300, 140)).toEqual([]);
  });

  it("returns an empty array for a non-positive width or height", () => {
    expect(computeExamTrendPoints([attempt({})], 0, 140)).toEqual([]);
    expect(computeExamTrendPoints([attempt({})], 300, 0)).toEqual([]);
  });

  it("centers a single attempt horizontally instead of dividing by zero", () => {
    const [point] = computeExamTrendPoints([attempt({})], 300, 140, 10);
    expect(point.x).toBe(10 + (300 - 20) / 2);
    expect(Number.isNaN(point.x)).toBe(false);
  });

  it("places the first attempt at the left padding and the last at the right edge", () => {
    const attempts = [attempt({ score: 10, total: 20 }), attempt({ score: 15, total: 20 }), attempt({ score: 20, total: 20 })];
    const points = computeExamTrendPoints(attempts, 300, 140, 10);

    expect(points[0].x).toBe(10);
    expect(points[points.length - 1].x).toBe(300 - 10);
  });

  it("maps 100% to the top (smallest y, after padding) and 0% to the bottom", () => {
    const attempts = [attempt({ score: 0, total: 20 }), attempt({ score: 20, total: 20 })];
    const points = computeExamTrendPoints(attempts, 300, 140, 10);

    expect(points[0].percent).toBe(0);
    expect(points[0].y).toBe(140 - 10); // bottom, minus padding
    expect(points[1].percent).toBe(100);
    expect(points[1].y).toBe(10); // top, i.e. the padding itself
  });

  it("rounds and clamps percent into [0, 100] and carries `passed` through unchanged", () => {
    const attempts = [attempt({ score: 1, total: 3, passed: false }), attempt({ score: 0, total: 0, passed: false })];
    const points = computeExamTrendPoints(attempts, 300, 140);

    expect(points[0].percent).toBe(33); // round(1/3 * 100)
    expect(points[0].passed).toBe(false);
    expect(points[1].percent).toBe(0); // guards against divide-by-zero on total: 0
  });
});
