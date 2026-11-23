import { describe, expect, it } from "vitest";
import { parse, RootContext } from "@/parser";

/** `[owner, label]` of each statement, in document order. */
function statements(code: string) {
  const stats = RootContext(code).block()?.stat() ?? [];
  return stats.map((stat: any) => {
    const node = stat.getChild(0);
    return [node.Owner?.() ?? null, node.SignatureText?.() ?? node.getText()];
  });
}

/**
 * `in` is a keyword only inside a fragment condition (`forEach(x in xs)`).
 * Anywhere else it is an ordinary word: an argument (`read(in)`, a common
 * Java stream name), a method or a participant name.
 */
describe("`in` outside a fragment condition", () => {
  it.each([
    ["X.read(in)", [["X", "read(in)"]]],
    ["X.read(a, in)", [["X", "read(a,in)"]]],
    ["X.read(in, b)", [["X", "read(in,b)"]]],
    ["X.in()", [["X", "in()"]]],
    ["in.read()", [["in", "read()"]]],
    ["X.read(in) {\n  Y.write()\n}", [["X", "read(in)"]]],
  ])("%j", (code, expected) => {
    expect(statements(code)).toEqual(expected);
    expect(parse(code).pass).toBe(true);
  });

  it("is still the keyword of a forEach condition", () => {
    const stat = RootContext("forEach(x in xs) {\n  A.b()\n}")
      .block()
      .stat()[0];
    expect(stat.loop()).toBeTruthy();
    expect(stat.loop().parExpr().condition().inExpr()).toBeTruthy();
  });

  it("is still the keyword of a loop condition inside a call block", () => {
    const code = "A.b() {\n  loop(x in xs) {\n    C.d()\n  }\n}";
    const inner = RootContext(code)
      .block()
      .stat()[0]
      .message()
      .braceBlock()
      .block()
      .stat()[0];
    expect(inner.loop().parExpr().condition().inExpr()).toBeTruthy();
  });
});
