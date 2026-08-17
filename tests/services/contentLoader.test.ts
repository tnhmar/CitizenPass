import { getChapterList, getChapterContent, getChapterTitle, getChapterManifestEntry } from "../../src/data/contentLoader";

describe("contentLoader", () => {
  it("returns all 9 chapters from the manifest", () => {
    const chapters = getChapterList();
    expect(chapters.length).toBe(9);
  });

  it("returns bilingual content for a known chapter", () => {
    const en = getChapterContent("rights-responsibilities", "en");
    const fr = getChapterContent("rights-responsibilities", "fr");

    expect(en).not.toBeNull();
    expect(fr).not.toBeNull();
    expect(en?.chapterId).toBe("rights-responsibilities");
    expect(fr?.chapterId).toBe("rights-responsibilities");
    expect(en?.sections.length).toBeGreaterThan(0);
    expect(en?.title).not.toEqual(fr?.title);
  });

  it("returns null for an unknown chapter id", () => {
    expect(getChapterContent("does-not-exist", "en")).toBeNull();
  });

  it("resolves the chapter title in the requested language via the manifest entry", () => {
    const entry = getChapterManifestEntry("canadas-regions");
    expect(entry).not.toBeNull();
    if (entry) {
      expect(getChapterTitle(entry, "en")).toBe("Canada's Regions");
      expect(getChapterTitle(entry, "fr")).toBe("Les régions du Canada");
    }
  });
});
