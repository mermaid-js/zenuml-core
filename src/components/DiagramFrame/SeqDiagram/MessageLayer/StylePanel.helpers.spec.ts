import { readStylesAt, applyStylesAt, toggleStyleList } from "./StylePanel.helpers";

describe("StylePanel helpers (analyzeStyleSelection/applyStyleToggle)", () => {
  test("insert comment when none exists, preserve indentation", () => {
    const code = [
      "participant A",
      "  A->B: x()",
      "",
    ].join("\n");
    const start = code.indexOf("A->B");
    const styles = readStylesAt(code, start);
    const updated = applyStylesAt(code, start, toggleStyleList(styles, "italic"));
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
    const styles = readStylesAt(code, start);
    const updated = applyStylesAt(code, start, toggleStyleList(styles, "bold"));
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
    const styles = readStylesAt(code, start);
    expect(styles).toEqual(["bold", "italic"]);
    const updated = applyStylesAt(code, start, toggleStyleList(styles, "italic"));
    const expected = [
      "participant A",
      "  // [bold] custom",
      "  A->B: x()",
      "",
    ].join("\n");
    expect(updated).toBe(expected);
  });
});
