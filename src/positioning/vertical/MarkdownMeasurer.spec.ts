import { describe, expect, it } from "vitest";
import { MarkdownMeasurer } from "./MarkdownMeasurer";
import { COMMENT_LINE_HEIGHT } from "./LayoutMetrics";

const L = COMMENT_LINE_HEIGHT;
const measure = (text: string | null | undefined) =>
  new MarkdownMeasurer().measure(text);

describe("MarkdownMeasurer.measure", () => {
  it("returns 0 for null, undefined, empty and whitespace-only text", () => {
    expect(measure(undefined)).toBe(0);
    expect(measure(null)).toBe(0);
    expect(measure("")).toBe(0);
    expect(measure("  \n \t\n ")).toBe(0);
  });

  it("measures one line of plain text", () => {
    expect(measure("hello")).toBe(L);
    expect(measure("  hello  \n")).toBe(L);
  });

  it("counts every line of multi-line markdown from the raw text", () => {
    expect(measure("line one\nline two\nline three")).toBe(3 * L);
    expect(measure("# Title\n\n- a\n- b\n\n`code`")).toBe(6 * L);
    expect(measure("```js\nconst a = 1;\n```")).toBe(3 * L);
  });

  it("counts the style annotation line when text sits on the same line", () => {
    // Comment strips "[red]" from the last line but the raw line still counts.
    expect(measure("[red] note")).toBe(L);
    expect(measure("first\n[red] second")).toBe(2 * L);
  });

  it("returns 0 when the comment is only a style annotation", () => {
    expect(measure("[red]")).toBe(0);
    expect(measure("<red>")).toBe(0);
  });

  it("keeps the annotation-only last line in the count when earlier lines have text", () => {
    expect(measure("first\n[red]")).toBe(2 * L);
  });

  it("returns 0 for non-blank text that marked lexes to zero tokens", () => {
    // A link reference definition produces no token. The trailing "[red]"
    // line keeps the definition out of the style-annotation parse of the
    // last line, so Comment.text is the bare definition.
    expect(measure("[ref]: http://example.com\n[red]")).toBe(0);
  });
});
