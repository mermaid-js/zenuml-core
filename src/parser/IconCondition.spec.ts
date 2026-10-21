import { describe, expect, it } from "vitest";
import { RootContext } from "./index";

// Issue #366: an icon token alone as a fragment condition, `if([check]) {...}`,
// used to parse with an empty condition; `check` became a self-call and the
// body fell into a spurious Section fragment. `if([check] someText)` worked.
function parse(code: string) {
  const root = RootContext(code);
  if (!root) throw new Error("parse returned null");
  return root;
}

function treeOf(root: ReturnType<typeof parse>): string {
  return (
    root as { toStringTree(r: unknown, recog: unknown): string }
  ).toStringTree(null, root.parser);
}

describe("icon token as a fragment condition (#366)", () => {
  it("if([check]) keeps the icon as the condition and A.m() as the only body statement", () => {
    const root = parse(`if([check]) {\n  A.m()\n}`);
    const stats = root.block().stat();
    expect(stats.length).toBe(1);
    const ifBlock = stats[0].alt().ifBlock();
    const condition = ifBlock.parExpr().condition();
    expect(condition).not.toBeNull();
    expect(condition.getFormattedText()).toBe("[check]");
    const body = ifBlock.braceBlock().block().stat();
    expect(body.length).toBe(1);
    expect(body[0].message().getFormattedText()).toContain("A.m()");
    expect(body[0].section?.()).toBeFalsy();
    expect(treeOf(root)).not.toContain("section");
    expect(treeOf(root)).not.toContain("missing");
  });

  it("while([check]) keeps the icon as the condition", () => {
    const root = parse(`while([check]) {\n  A.m()\n}`);
    const stats = root.block().stat();
    expect(stats.length).toBe(1);
    const loop = stats[0].loop();
    const condition = loop.parExpr().condition();
    expect(condition).not.toBeNull();
    expect(condition.getFormattedText()).toBe("[check]");
    const body = loop.braceBlock().block().stat();
    expect(body.length).toBe(1);
    expect(body[0].message().getFormattedText()).toContain("A.m()");
    expect(treeOf(root)).not.toContain("section");
  });

  it("if([check] a) keeps its current result", () => {
    const root = parse(`if([check] a) {\n  A.m()\n}`);
    const ifBlock = root.block().stat(0).alt().ifBlock();
    expect(ifBlock.parExpr().condition().getFormattedText()).toBe("[check] a");
    expect(ifBlock.braceBlock().block().stat().length).toBe(1);
    expect(treeOf(root)).not.toContain("section");
  });

  // Also fixes the digit case of #363: a bare number inside free-text.
  it("if(retry 3 times) keeps the free text as the condition", () => {
    const root = parse(`if(retry 3 times) {\n  A.m()\n}`);
    const stats = root.block().stat();
    expect(stats.length).toBe(1);
    const ifBlock = stats[0].alt().ifBlock();
    expect(ifBlock.parExpr().condition().getFormattedText()).toBe(
      "retry 3 times",
    );
    const body = ifBlock.braceBlock().block().stat();
    expect(body.length).toBe(1);
    expect(body[0].message().getFormattedText()).toContain("A.m()");
    expect(treeOf(root)).not.toContain("section");
  });

  it("if(3) stays an atom and if(x > 3) stays an expression", () => {
    const lone = parse(`if(3) {\n  A.m()\n}`);
    const c1 = lone.block().stat(0).alt().ifBlock().parExpr().condition();
    expect(c1.atom()).not.toBeNull();
    expect(c1.textExpr()).toBeNull();
    const cmp = parse(`if(x > 3) {\n  A.m()\n}`);
    const c2 = cmp.block().stat(0).alt().ifBlock().parExpr().condition();
    expect(c2.expr()).not.toBeNull();
    expect(c2.textExpr()).toBeNull();
  });
});
