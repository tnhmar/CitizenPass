import type { AppLanguage } from "../types";
import type { ChapterContent, Manifest, ManifestChapterEntry } from "../types/content";

import manifestJson from "./manifests/manifest.json";

import rightsResponsibilitiesEn from "./content/rights-responsibilities.en.json";
import rightsResponsibilitiesFr from "./content/rights-responsibilities.fr.json";
import whoWeAreEn from "./content/who-we-are.en.json";
import whoWeAreFr from "./content/who-we-are.fr.json";
import canadasHistoryEn from "./content/canadas-history.en.json";
import canadasHistoryFr from "./content/canadas-history.fr.json";
import modernCanadaEn from "./content/modern-canada.en.json";
import modernCanadaFr from "./content/modern-canada.fr.json";
import governThemselvesEn from "./content/how-canadians-govern-themselves.en.json";
import governThemselvesFr from "./content/how-canadians-govern-themselves.fr.json";
import federalElectionsEn from "./content/federal-elections.en.json";
import federalElectionsFr from "./content/federal-elections.fr.json";
import justiceSystemEn from "./content/justice-system.en.json";
import justiceSystemFr from "./content/justice-system.fr.json";
import canadianSymbolsEn from "./content/canadian-symbols.en.json";
import canadianSymbolsFr from "./content/canadian-symbols.fr.json";
import canadasRegionsEn from "./content/canadas-regions.en.json";
import canadasRegionsFr from "./content/canadas-regions.fr.json";

const manifest = manifestJson as Manifest;

/**
 * Static (not dynamic) imports are required so Metro can bundle every
 * chapter's JSON offline. Adding a new chapter means adding its two
 * imports here and one entry below — intentionally explicit rather
 * than "clever," so a missing chapter fails at compile time, not at
 * runtime for a user with no network connection to fall back on.
 */
const CONTENT_BY_ID: Record<string, { en: ChapterContent; fr: ChapterContent }> = {
  "rights-responsibilities": {
    en: rightsResponsibilitiesEn as ChapterContent,
    fr: rightsResponsibilitiesFr as ChapterContent,
  },
  "who-we-are": {
    en: whoWeAreEn as ChapterContent,
    fr: whoWeAreFr as ChapterContent,
  },
  "canadas-history": {
    en: canadasHistoryEn as ChapterContent,
    fr: canadasHistoryFr as ChapterContent,
  },
  "modern-canada": {
    en: modernCanadaEn as ChapterContent,
    fr: modernCanadaFr as ChapterContent,
  },
  "how-canadians-govern-themselves": {
    en: governThemselvesEn as ChapterContent,
    fr: governThemselvesFr as ChapterContent,
  },
  "federal-elections": {
    en: federalElectionsEn as ChapterContent,
    fr: federalElectionsFr as ChapterContent,
  },
  "justice-system": {
    en: justiceSystemEn as ChapterContent,
    fr: justiceSystemFr as ChapterContent,
  },
  "canadian-symbols": {
    en: canadianSymbolsEn as ChapterContent,
    fr: canadianSymbolsFr as ChapterContent,
  },
  "canadas-regions": {
    en: canadasRegionsEn as ChapterContent,
    fr: canadasRegionsFr as ChapterContent,
  },
};

export function getChapterList(): ManifestChapterEntry[] {
  return manifest.chapters;
}

export function getChapterManifestEntry(chapterId: string): ManifestChapterEntry | null {
  return manifest.chapters.find((chapter) => chapter.id === chapterId) ?? null;
}

export function getChapterContent(chapterId: string, language: AppLanguage): ChapterContent | null {
  const entry = CONTENT_BY_ID[chapterId];
  if (!entry) return null;
  return entry[language];
}

export function getChapterTitle(entry: ManifestChapterEntry, language: AppLanguage): string {
  return language === "fr" ? entry.fr.title : entry.en.title;
}
