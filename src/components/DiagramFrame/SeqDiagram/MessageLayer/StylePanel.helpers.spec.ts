import { analyzeStyleSelection, applyStyleToggle } from "./StylePanel.helpers";

describe("StylePanel helpers (analyzeStyleSelection/applyStyleToggle)", () => {
  test("insert comment when none exists, preserve indentation", () => {
    const code = [
      "participant A",
      "  A->B: x()",
      "",
    ].join("\n");
    const start = code.indexOf("A->B");
    const { selection } = analyzeStyleSelection(code, start);
    expect(selection.comment.exists).toBe(false);
    expect(selection.comment.leading).toBe("  ");

    const updated = applyStyleToggle(code, selection, "italic");
    const expected = [
      "participant A",
      "  // [italic]",
      "  A->B: x()",
      "",
    ].join("\n");
    expect(updated).toBe(expected);
  });

  test("update plain comment without brackets by adding style and preserving suffix", () => {
    const code = [
      "participant A",
      "  // note here",
      "  A->B: x()",
      "",
    ].join("\n");
    const start = code.indexOf("A->B");
    const { selection } = analyzeStyleSelection(code, start);
    expect(selection.comment.exists).toBe(true);
    expect(selection.comment.hasBrackets).toBe(false);
    expect(selection.comment.suffix).toBe("note here");

    const updated = applyStyleToggle(code, selection, "bold");
    const expected = [
      "participant A",
      "  // [bold] note here",
      "  A->B: x()",
      "",
    ].join("\n");
    expect(updated).toBe(expected);
  });

  test("toggle style within bracketed list and preserve suffix", () => {
    const code = [
      "participant A",
      "  // [bold, italic] custom",
      "  A->B: x()",
      "",
    ].join("\n");
    const start = code.indexOf("A->B");
    const { selection } = analyzeStyleSelection(code, start);
    expect(selection.comment.exists).toBe(true);
    expect(selection.comment.hasBrackets).toBe(true);
    expect(selection.comment.styles).toEqual(["bold", "italic"]);
    expect(selection.comment.suffix).toBe("custom");

    const updated = applyStyleToggle(code, selection, "italic");
    const expected = [
      "participant A",
      "  // [bold] custom",
      "  A->B: x()",
      "",
    ].join("\n");
    expect(updated).toBe(expected);
  });
});
