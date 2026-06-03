import { describe, expect, it } from "vitest";
import { RootContext } from "./index";

// Regression for: `if()` (and `else if()` / `else`) with no brace block while typing.
//
// Before the grammar made `braceBlock` optional in ifBlock/elseIfBlock/elseBlock,
// ANTLR error recovery swallowed the following statement and the enclosing block's
// closing `}` into the if/else body. For:
//
//   BookLibService.Borrow(id) {
//     User = Session.GetUser()
//     if()
//     return receipt
//   }
//
// `return receipt` was nested inside the empty `if`, and the Borrow message lost its
// brace block (re-parsed as a spurious anonymous section). See sequenceParser.g4.
function parse(code: string) {
  const root = RootContext(code);
  if (!root) throw new Error("parse returned null");
  return root;
}

// antlr4's toStringTree(ruleNames, recog) accepts a null ruleNames at runtime
// (it derives them from the recognizer); the type only declares string[].
function treeOf(root: ReturnType<typeof parse>): string {
  return (
    root as { toStringTree(r: unknown, recog: unknown): string }
  ).toStringTree(null, root.parser);
}

describe("if/else without a brace block (incomplete typing)", () => {
  it("keeps `return` as a sibling of an empty `if()`, not swallowed into it", () => {
    const root = parse(`BookLibService.Borrow(id) {
  User = Session.GetUser()
  if()
  return receipt
}`);

    // The Borrow message keeps its own brace block (no spurious anonymous section).
    const borrow = root.block().stat(0).message();
    expect(borrow).not.toBeNull();
    const body = borrow.braceBlock();
    expect(body).not.toBeNull();

    // Borrow body has exactly three sibling statements: GetUser, the if, and the return.
    const stats = body.block().stat();
    expect(stats.length).toBe(3);

    // stat(1) is the empty if: parExpr present but no condition and no brace block.
    const ifBlock = stats[1].alt().ifBlock();
    expect(ifBlock).not.toBeNull();
    expect(ifBlock.parExpr()).not.toBeNull();
    expect(ifBlock.parExpr().condition()).toBeNull();
    expect(ifBlock.braceBlock()).toBeNull();

    // stat(2) is the return — a SIBLING of the if, returning `receipt` from Borrow.
    const ret = stats[2].ret();
    expect(ret).not.toBeNull();
    expect(ret.expr().getText()).toBe("receipt");

    // No error-recovery artifacts left in the tree.
    expect(treeOf(root)).not.toContain("missing");
  });

  it("tolerates `else if()` with no brace block", () => {
    const root = parse(`A.m {
  if(x) { B.foo }
  else if()
  return done
}`);
    const stats = root.block().stat(0).message().braceBlock().block().stat();

    // The alt (if + empty else-if) and the return stay siblings.
    expect(stats.length).toBe(2);
    const alt = stats[0].alt();
    expect(alt.ifBlock().braceBlock()).not.toBeNull(); // braced `if` still attaches its body
    expect(alt.elseIfBlock(0).braceBlock()).toBeNull(); // empty else-if has no body
    expect(stats[1].ret().expr().getText()).toBe("done");
    expect(treeOf(root)).not.toContain("missing");
  });

  it("tolerates `else` with no brace block", () => {
    const root = parse(`A.m {
  if(x) { B.foo }
  else
  return done
}`);
    const stats = root.block().stat(0).message().braceBlock().block().stat();

    expect(stats.length).toBe(2);
    const alt = stats[0].alt();
    expect(alt.elseBlock().braceBlock()).toBeNull(); // empty else has no body
    expect(stats[1].ret().expr().getText()).toBe("done");
    expect(treeOf(root)).not.toContain("missing");
  });

  it("does not regress valid braced if/elseif/else", () => {
    const root = parse(`if(x) { A.foo } else if(y) { A.baz } else { A.bar }`);
    const alt = root.block().stat(0).alt();
    expect(alt.ifBlock().braceBlock()).not.toBeNull();
    expect(alt.elseIfBlock(0).braceBlock()).not.toBeNull();
    expect(alt.elseBlock().braceBlock()).not.toBeNull();
    expect(treeOf(root)).not.toContain("missing");
  });
});
