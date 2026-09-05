import { describe, expect, it } from "vitest";
import { parseStyleComment, toggleMessageStyle } from "./messageStyleToggle";

/**
 * StylePanel's inline-comment style toggle (bold/italic/underline/
 * strikethrough) had no unit or E2E coverage. Extracted to a pure function
 * so these three corruption cases — found by reading the offset math, not
 * from a filed bug — can be pinned down.
 */
describe("toggleMessageStyle", () => {
  it("adds brackets to an un-indented plain comment without duplicating the // marker", () => {
    // `(prevLine.match(/\/\/*/)?.index || -2) + 2` treats a match at index 0
    // as no match (0 is falsy), so an un-indented existing comment kept its
    // own "//" and grew a second one in front of it.
    const code = "A\nB\n// existing note\nA->B: m\n";
    const messageStart = code.indexOf("A->B");
    const next = toggleMessageStyle({ code, messageStart, style: "italic" });
    expect(next).toBe("A\nB\n// [italic] existing note\nA->B: m\n");
  });

  it("removes the trailing note, not just the brackets, when the last style is toggled off", () => {
    const code = "A\nB\n// [italic] important note\nA->B: m\n";
    const messageStart = code.indexOf("A->B");
    const next = toggleMessageStyle({ code, messageStart, style: "italic" });
    expect(next).toBe("A\nB\n// important note\nA->B: m\n");
  });

  it("removes the annotation line entirely when no note remains", () => {
    const code = "A\nB\n// [italic]\nA->B: m\n";
    const messageStart = code.indexOf("A->B");
    const next = toggleMessageStyle({ code, messageStart, style: "italic" });
    expect(next).toBe("A\nB\nA->B: m\n");
  });

  it("does not treat an unclosed bracket comment as a style list", () => {
    // `indexOf("]")` returns -1 when absent, which is truthy — an unclosed
    // `[` was read as `hasStyleBrackets: true` off a garbage slice.
    const code = "A\nB\n// [todo unclosed\nA->B: m\n";
    const messageStart = code.indexOf("A->B");
    const parsed = parseStyleComment("// [todo unclosed\n");
    expect(parsed.hasStyleBrackets).toBe(false);

    const next = toggleMessageStyle({ code, messageStart, style: "italic" });
    expect(next).toBe("A\nB\n// [italic] [todo unclosed\nA->B: m\n");
  });
});
