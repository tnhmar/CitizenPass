/**
 * Maps each study chapter to a visual identity (icon, emoji, accent
 * color) used across Home, Study, and Progress screens so a chapter is
 * instantly recognizable regardless of which screen it appears on.
 */
export type ChapterVisual = {
  icon: string;
  emoji: string;
  color: string;
};

export const DEFAULT_CHAPTER_VISUAL: ChapterVisual = {
  icon: "book-open-variant",
  emoji: "\ud83d\udcd8",
  color: "#1A3763",
};

export const CHAPTER_VISUALS: Record<string, ChapterVisual> = {
  "rights-responsibilities": { icon: "gavel", emoji: "\u2696\ufe0f", color: "#B10E1E" },
  "who-we-are": { icon: "account-group", emoji: "\ud83c\udf41", color: "#1A3763" },
  "canadas-history": { icon: "book-open-page-variant", emoji: "\ud83d\udcdc", color: "#8B5E34" },
  "modern-canada": { icon: "city-variant", emoji: "\ud83c\udfd9\ufe0f", color: "#2C6E91" },
  "how-canadians-govern-themselves": { icon: "bank", emoji: "\ud83c\udfdb\ufe0f", color: "#5B4B8A" },
  "federal-elections": { icon: "vote", emoji: "\ud83d\uddf3\ufe0f", color: "#C77F1A" },
  "justice-system": { icon: "scale-balance", emoji: "\u2696\ufe0f", color: "#7A2E2E" },
  "canadian-symbols": { icon: "flag-variant", emoji: "\ud83c\udf41", color: "#B10E1E" },
  "canadas-regions": { icon: "map-marker-radius", emoji: "\ud83d\uddfa\ufe0f", color: "#1E8E5A" },
};

export function getChapterVisual(chapterId: string): ChapterVisual {
  return CHAPTER_VISUALS[chapterId] ?? DEFAULT_CHAPTER_VISUAL;
}
