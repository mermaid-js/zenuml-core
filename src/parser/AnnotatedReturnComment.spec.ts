import { describe, expect, it } from "vitest";
import sequenceParser from "@/generated-parser/sequenceParser";
import { RootContext as langiumRoot } from "@/parser-langium/compat";
import { StatContext as LangiumStat } from "@/parser-langium/facade/nodes";
import { parse } from "./index";

// #713 / ADR 0005: an annotation may stand on the line above its message. A comment
// written between that annotation line and the message belongs to the statement,
// exactly like a comment written above the annotation.
const PARSERS = [
  ["ANTLR", (code: string) => parse(code).rootContext, sequenceParser.StatContext],
  ["Langium", (code: string) => langiumRoot(code), LangiumStat],
] as const;

describe.each(PARSERS)("comment on an annotated return (%s)", (_name, root, Stat) => {
  const returnStatComment = (code: string): string | null | undefined => {
    const find = (node: any): any => {
      if (node instanceof (Stat as any) && node.ret?.()) return node;
      for (const child of node.children ?? []) {
        const found = find(child);
        if (found) return found;
      }
      return null;
    };
    return find(root(code))?.getComment();
  };

  it.each([
    ["above the annotation", "A.m() {\n  // note\n  @return B->A: reply\n}", " note"],
    ["between the annotation and its message", "A.m() {\n  @return\n  // note\n  B->A: reply\n}", " note"],
    ["between, with the @reply alias", "A.m() {\n  @reply\n  // note\n  B->A: reply\n}", " note"],
    ["between, at the top level", "@return\n// note\nB->A: reply", " note"],
    [
      "both above and between, in source order",
      "A.m() {\n  // first\n  @return\n  // second\n  B->A: reply\n}",
      " first\n second",
    ],
    [
      "several lines between",
      "A.m() {\n  @return\n  // one\n  // two\n  B->A: reply\n}",
      " one\n two",
    ],
  ])("keeps a comment %s", (_label, code, expected) => {
    expect(returnStatComment(code)).toBe(expected);
  });

  it("does not take a comment that follows the message", () => {
    const code = "A.m() {\n  @return B->A: reply\n  // later\n}";
    expect(returnStatComment(code) || "").toBe("");
  });

  it("keeps a comment on a plain return", () => {
    expect(returnStatComment("A.m() {\n  // note\n  return x\n}")).toBe(" note");
  });
});
