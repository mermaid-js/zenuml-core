import { describe, it, expect } from "bun:test";
import { RootContext, Participants } from "./index";
import { renderToSvg } from "@/svg/renderToSvg";

// Issue #696: a `{` with no `}` after a participant name must not blank the
// diagram. This is the state while the user types.

function statements(code: string): any[] {
  return RootContext(code).block?.()?.stat?.() ?? [];
}

function participantNames(code: string): string[] {
  return Participants(RootContext(code)).Names();
}

function svgTexts(code: string): string[] {
  const { svg } = renderToSvg(code);
  return [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
}

describe("an unclosed `{` after a participant name keeps the statements (#696)", () => {
  it.each([
    { name: "name then `{`", code: "A {\nA.b()\nA.c()" },
    { name: "name, stray `else`, then `{`", code: "A\nelse {\nA.b()\nA.c()" },
  ])("$name", ({ code }) => {
    expect(participantNames(code)).toEqual(["A"]);
    const texts = svgTexts(code);
    expect(texts).toContain("A");
    expect(texts).toContain("b()");
    expect(texts).toContain("c()");
  });
});

describe("valid blocks are unchanged", () => {
  it("a closed message block keeps its body", () => {
    const stats = statements("A.b() {\n}");
    expect(stats).toHaveLength(1);
    expect(stats[0].message().braceBlock()).not.toBeNull();
  });

  it("a closed if block keeps its body", () => {
    const stats = statements("if(x) {\n A.b()\n}");
    expect(stats).toHaveLength(1);
    expect(stats[0].alt().ifBlock().braceBlock().block().stat()).toHaveLength(1);
  });

  it("an unclosed message block still keeps its body", () => {
    const texts = svgTexts("A.foo() {\nA.b()\nA.c()");
    expect(texts).toEqual(expect.arrayContaining(["foo()", "b()", "c()"]));
  });
});
