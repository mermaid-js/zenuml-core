import { describe, it, expect } from "bun:test";
import { RootContext } from "@/parser";
import { parseZen } from "@/parser-langium/services";

// Issue #402: block `/* … */`, hash `# …`, and PlantUML `'` comments must be
// ignored (skipped) like `//`, instead of triggering parse errors.

function tree(code: string): string {
  const t = RootContext(code) as any;
  return t.toStringTree(null, t.parser);
}

describe("extra comment styles are ignored (#402)", () => {
  const bare = tree("A.m");

  it("block comment `/* … */` is skipped", () => {
    expect(tree("/* note */\nA.m")).toBe(bare);
  });

  it("multi-line block comment is skipped", () => {
    expect(tree("/* line1\nline2 */\nA.m")).toBe(bare);
  });

  it("hash `# …` comment is skipped", () => {
    expect(tree("# note\nA.m")).toBe(bare);
  });

  it("PlantUML `'` comment at line start is skipped", () => {
    expect(tree("'note\nA.m")).toBe(bare);
  });

  it("does NOT break inline `#RRGGBB` colors", () => {
    // `A #fff` must still lex the color, not a hash comment.
    expect(() => RootContext("A #fff\nA.m")).not.toThrow();
    // The color value survives on the participant (it is not eaten as a comment).
    expect(tree("A #fff\nA.m")).toContain("#fff");
  });

  it("the Langium side-car parser agrees (no lexer/parser errors)", () => {
    for (const code of [
      "/* note */\nA.m",
      "/* a\nb */\nA.m",
      "# note\nA.m",
      "'note\nA.m",
    ]) {
      const r = parseZen(code) as any;
      expect(r.lexerErrors).toHaveLength(0);
      expect(r.parserErrors).toHaveLength(0);
    }
  });
});
