import { searchContent } from "../../src/data/contentSearch";
import { getAllQuestions } from "../../src/data/questionLoader";

describe("searchContent", () => {
  it("returns nothing for a query shorter than the minimum length", () => {
    expect(searchContent("a", "en")).toEqual([]);
    expect(searchContent(" ", "en")).toEqual([]);
  });

  it("returns nothing when there is no match in either language", () => {
    expect(searchContent("xyznonexistentterm", "en")).toEqual([]);
  });

  it("finds a Study match by chapter content text, case-insensitively", () => {
    const results = searchContent("supreme COURT", "en");
    const hit = results.find((r) => r.type === "study" && r.chapterId === "justice-system");
    expect(hit).toBeDefined();
    expect(hit?.snippet.toLowerCase()).toContain("supreme court");
  });

  it("finds the same Study match in French", () => {
    const results = searchContent("Cour suprême", "fr");
    const hit = results.find((r) => r.type === "study" && r.chapterId === "justice-system");
    expect(hit).toBeDefined();
  });

  it("returns at most one Study result per chapter even if several sections match", () => {
    const results = searchContent("Canada", "en"); // near-guaranteed to appear in most chapters
    const studyChapterIds = results.filter((r) => r.type === "study").map((r) => r.chapterId);
    expect(new Set(studyChapterIds).size).toBe(studyChapterIds.length);
  });

  it("finds a Practice match from a real question's own text", () => {
    const [sample] = getAllQuestions();
    const distinctiveWord = sample.en.question.split(/\s+/).find((word) => word.length > 5) ?? sample.en.question;

    const results = searchContent(distinctiveWord, "en");
    const hit = results.find((r) => r.type === "practice" && r.questionId === sample.id);
    expect(hit).toBeDefined();
    expect(hit?.chapterId).toBe(sample.chapterId);
  });

  it("caps practice results so a very common word doesn't flood the list", () => {
    const results = searchContent("the", "en");
    const practiceHits = results.filter((r) => r.type === "practice");
    expect(practiceHits.length).toBeLessThanOrEqual(20);
  });
});
