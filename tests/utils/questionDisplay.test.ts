import { randomOptionOrder, applyOptionOrder } from "../../src/utils/questionDisplay";
import type { LocalizedQuestion } from "../../src/types";

describe("randomOptionOrder", () => {
  it("returns a permutation containing every index exactly once", () => {
    const order = randomOptionOrder(4);
    expect(order).toHaveLength(4);
    expect([...order].sort()).toEqual([0, 1, 2, 3]);
  });

  it("produces varied orders across many calls (not always identity)", () => {
    const orders = Array.from({ length: 50 }, () => randomOptionOrder(4).join(","));
    const distinctOrders = new Set(orders);
    expect(distinctOrders.size).toBeGreaterThan(1);
  });
});

describe("applyOptionOrder", () => {
  const base: LocalizedQuestion = {
    question: "Sample?",
    options: ["A-correct", "B", "C", "D"],
    correctIndex: 0,
    explanation: "because",
    source: {
      guide: "Discover Canada",
      language: "en",
      edition: "test",
      sourceUrl: "https://example.com",
      chapter: "Test",
      section: "Test",
      excerpt: "test",
      verifiedAt: "2026-01-01",
      reviewStatus: "verified",
    },
  };

  it("reorders options and recomputes correctIndex to match the new position", () => {
    const order = [2, 0, 3, 1]; // canonical index 0 ("A-correct") moves to display position 1
    const result = applyOptionOrder(base, order);
    expect(result.options).toEqual(["C", "A-correct", "D", "B"]);
    expect(result.correctIndex).toBe(1);
    expect(result.options[result.correctIndex]).toBe("A-correct");
  });

  it("identity order leaves the question unchanged", () => {
    const result = applyOptionOrder(base, [0, 1, 2, 3]);
    expect(result.options).toEqual(base.options);
    expect(result.correctIndex).toBe(base.correctIndex);
  });
});
