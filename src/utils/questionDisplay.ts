import type { LocalizedQuestion } from "../types";

/**
 * Produces a random permutation of option indices (e.g. [2, 0, 3, 1] for
 * 4 options). Used to shuffle which position holds the correct answer so
 * it is not always the first option, as several questions in the bank
 * were authored with correctIndex 0.
 */
export function randomOptionOrder(optionCount: number): number[] {
  const indices = Array.from({ length: optionCount }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

/**
 * Reorders a localized question's options according to a precomputed
 * index order, recalculating correctIndex to match the new positions.
 * The same order can be applied to both the English and French
 * localization of a question, since both option arrays are authored
 * index-aligned (option[i] in en corresponds to option[i] in fr).
 *
 * optionAnnotations (see src/types/index.ts), when present, is
 * index-aligned with options the same way and MUST be permuted by the
 * exact same order - forgetting this would leave each annotation
 * pointing at the wrong (pre-shuffle) option once options are shuffled.
 */
export function applyOptionOrder(localized: LocalizedQuestion, order: number[]): LocalizedQuestion {
  const options = order.map((i) => localized.options[i]);
  const correctIndex = order.indexOf(localized.correctIndex);
  const optionAnnotations = localized.optionAnnotations ? order.map((i) => localized.optionAnnotations![i]) : undefined;
  return { ...localized, options, correctIndex, optionAnnotations };
}

/**
 * Same reordering as applyOptionOrder, for the Arabic translation's plain
 * options list (no correctIndex to recompute — the Arabic face is never
 * selectable). Must be applied with the exact same `order` array used for
 * the en/fr options currently on screen, or the translation will point at
 * the wrong letter.
 */
export function applyOptionOrderToArabic(options: string[], order: number[]): string[] {
  return order.map((i) => options[i]);
}
