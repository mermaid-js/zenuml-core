import { describe, expect, it } from "vitest";
import antlr4 from "antlr4";
import { parse, RootContext } from "./index";

// Regression for mermaid-js/zenuml-core#668: a `{` block that does not parse
// must stay with its owner (`if`, `while`, a message, ...). It must not become
// an anonymous Section next to an owner with an empty body.

type Ctx = any;

function root(code: string): Ctx {
  const tree = RootContext(code);
  if (!tree) throw new Error("parse returned null");
  return tree;
}

function collect(node: Ctx, kind: string, found: Ctx[] = []): Ctx[] {
  if (node instanceof antlr4.ParserRuleContext) {
    if (node.constructor.name === kind) found.push(node);
    for (const child of (node as Ctx).children ?? []) {
      collect(child, kind, found);
    }
  }
  return found;
}

const sections = (tree: Ctx) => collect(tree, "SectionContext");
const signatures = (node: Ctx) =>
  collect(node, "SignatureContext").map((s) => s.getText());
const topStats = (tree: Ctx): Ctx[] => tree.block()?.stat() ?? [];

describe("a `{` block that does not parse stays with its owner (#668)", () => {
  it("two open blocks, as typed: `alt` nests in the message activation", () => {
    const tree = root(`Client
API
Client->API: login
API.validate(token) {
  Auth.check(token)
  if(ok) {
`);
    expect(sections(tree)).toHaveLength(0);
    const stats = topStats(tree);
    expect(stats).toHaveLength(2);
    expect(stats[0].asyncMessage()).not.toBeNull();

    const body = stats[1].message().braceBlock().block().stat();
    expect(body).toHaveLength(2);
    expect(signatures(body[0])).toEqual(["check(token)"]);
    expect(body[1].alt().ifBlock().braceBlock()).not.toBeNull();
  });

  it("a method call with `{` keeps an empty body", () => {
    const tree = root("A.foo() {");
    expect(sections(tree)).toHaveLength(0);
    const stats = topStats(tree);
    expect(stats).toHaveLength(1);
    expect(stats[0].message().braceBlock()).not.toBeNull();
    expect(stats[0].message().braceBlock().block()).toBeNull();
  });

  it("`if` with `{` is one alt", () => {
    const tree = root("if(ok) {");
    expect(sections(tree)).toHaveLength(0);
    const stats = topStats(tree);
    expect(stats).toHaveLength(1);
    expect(stats[0].alt().ifBlock().braceBlock()).not.toBeNull();
  });

  it("a loop body with an unclosed `{` stays in the loop", () => {
    const tree = root("while(x) {\n  A.b();");
    expect(sections(tree)).toHaveLength(0);
    const stats = topStats(tree);
    expect(stats).toHaveLength(1);
    const body = stats[0].loop().braceBlock().block().stat();
    expect(body).toHaveLength(1);
    expect(signatures(body[0])).toEqual(["b()"]);
  });

  it("a closed block with a syntax error stays with its owner", () => {
    const tree = root("if(ok) {\n  P.a()\n  /\n  P.c()\n}\nP.d()");
    expect(sections(tree)).toHaveLength(0);
    const stats = topStats(tree);
    expect(stats).toHaveLength(2);
    const body = stats[0].alt().ifBlock().braceBlock();
    expect(signatures(body)).toEqual(expect.arrayContaining(["a()", "c()"]));
    expect(body.CBRACE().getText()).toBe("}");
    expect(signatures(stats[1])).toEqual(["d()"]);
  });

  it("a syntax error as the first token of a body stays with its owner", () => {
    const tree = root("if(ok) {\n  /\n  P.a()\n}\nP.b()");
    expect(sections(tree)).toHaveLength(0);
    const stats = topStats(tree);
    expect(stats).toHaveLength(2);
    expect(signatures(stats[0].alt().ifBlock())).toEqual(["a()"]);
    expect(signatures(stats[1])).toEqual(["b()"]);
    expect(parse("if(ok) {\n  /\n  P.a()\n}\nP.b()").pass).toBe(false);
  });

  it("a missing `}` before `else` keeps both branches in one alt", () => {
    const tree = root("if(x) {\n  A.b()\nelse {\n  A.c()\n}\nA.d()");
    expect(sections(tree)).toHaveLength(0);
    const stats = topStats(tree);
    expect(stats).toHaveLength(2);
    const alt = stats[0].alt();
    expect(signatures(alt.ifBlock())).toContain("b()");
    expect(signatures(alt.elseBlock())).toEqual(["c()"]);
    expect(signatures(stats[1])).toEqual(["d()"]);
  });

  it("an erroneous body does not leak out of a nested owner", () => {
    const tree = root(
      "A.m() {\n  while(x) {\n    B.c();\n    /\n    B.d();\n  }\n  B.e();\n}\nC.f();",
    );
    expect(sections(tree)).toHaveLength(0);
    const stats = topStats(tree);
    expect(stats).toHaveLength(2);
    const body = stats[0].message().braceBlock().block().stat();
    expect(body).toHaveLength(2);
    expect(signatures(body[0].loop())).toEqual(["c()", "d()"]);
    expect(signatures(body[1])).toEqual(["e()"]);
    expect(signatures(stats[1])).toEqual(["f()"]);
  });

  // Each input has an owner for its `{`, so its body must be that owner's.
  it.each([
    ["while {", (s: Ctx) => s.loop()],
    ["loop {", (s: Ctx) => s.loop()],
    ["for(i in xs) {", (s: Ctx) => s.loop()],
    ["forEach(x) {", (s: Ctx) => s.loop()],
    ["if(x) {} else {", (s: Ctx) => s.alt().elseBlock()],
    ["if(x) {} else if(y) {", (s: Ctx) => s.alt().elseIfBlock(0)],
    ["par {", (s: Ctx) => s.par()],
    ["opt {", (s: Ctx) => s.opt()],
    ["critical {", (s: Ctx) => s.critical()],
    ["A.b{", (s: Ctx) => s.message()],
    ["new B() {", (s: Ctx) => s.creation()],
    ["A->B.m() {", (s: Ctx) => s.message()],
    ["m() {", (s: Ctx) => s.message()],
    ["x = A.m() {", (s: Ctx) => s.message()],
  ])("`%s` keeps the block on its owner", (code, owner) => {
    const tree = root(code);
    expect(sections(tree)).toHaveLength(0);
    const stats = topStats(tree);
    expect(stats).toHaveLength(1);
    expect(owner(stats[0]).braceBlock()).not.toBeNull();
    expect(parse(code).pass).toBe(false);
  });

  it.each(["section {", "section(s) {", "frame(s) {"])(
    "`%s` is one real section that owns the block",
    (code) => {
      const found = sections(root(code));
      expect(found).toHaveLength(1);
      expect(found[0].SECTION()).not.toBeNull();
      expect(found[0].braceBlock()).not.toBeNull();
    },
  );
});

describe("a `{` that has no owner and no `}` is not a Section (#668)", () => {
  it.each(["{", "{\n", "{ {", "else {", "catch {", "finally {", "return {"])(
    "`%s` renders no fragment and reports an error",
    (code) => {
      expect(sections(root(code))).toHaveLength(0);
      expect(parse(code).pass).toBe(false);
    },
  );

  it("keeps its statements at the enclosing level", () => {
    const tree = root("{\n  A.b()\n  C.d()");
    expect(sections(tree)).toHaveLength(0);
    expect(topStats(tree).map(signatures)).toEqual([["b()"], ["d()"]]);
  });

  it("does not take the `}` of an inner closed block", () => {
    const tree = root("{\n  if(x) {\n    A.b()\n  }\nC.d()");
    expect(sections(tree)).toHaveLength(0);
    const stats = topStats(tree);
    expect(stats).toHaveLength(2);
    expect(signatures(stats[0].alt().ifBlock())).toEqual(["b()"]);
    expect(signatures(stats[1])).toEqual(["d()"]);
  });

  it("stays out of an owner's unclosed body", () => {
    const tree = root("A.m() {\n  {\n  B.c()");
    expect(sections(tree)).toHaveLength(0);
    const stats = topStats(tree);
    expect(stats).toHaveLength(1);
    expect(signatures(stats[0].message().braceBlock())).toEqual(["c()"]);
  });
});

describe("valid DSL parses as before (#668)", () => {
  it.each([
    ["{ A.b() }", 1],
    ["{}", 1],
    ["{ A.b() }\nC.d()", 1],
    ["ref(x) { m1 }", 1],
    ["A.b;{ C.d() }", 1],
    ["A.b();\n{ C.d() }", 1],
    ["if(x) { A.b() } { C.d() }", 1],
    ["while(x) { A.b() } { C.d() }", 1],
    ["A.m() { { B.c() } }", 1],
    ["{ { A.b() } }", 2],
  ])("`%s` keeps its complete anonymous block", (code, count) => {
    expect(parse(code).pass).toBe(true);
    const found = sections(root(code));
    expect(found).toHaveLength(count);
    expect(found.every((s) => s.SECTION() === null)).toBe(true);
    expect(found.every((s) => s.braceBlock() !== null)).toBe(true);
  });

  it.each([
    ["section(x) { A.b() }", "x"],
    ["frame(x) { A.b() }", "x"],
    ["section { A.b() }", null],
    ["frame { A.b() }", null],
    ["section() { A.b() }", null],
  ])("`%s` is a real section", (code, name) => {
    expect(parse(code).pass).toBe(true);
    const found = sections(root(code));
    expect(found).toHaveLength(1);
    expect(found[0].SECTION()).not.toBeNull();
    expect(found[0].atom()?.getText() ?? null).toBe(name);
    expect(signatures(found[0])).toEqual(["b()"]);
  });

  it.each(["section", "frame", "par", "opt", "critical"])(
    "bare `%s` stays tolerated",
    (code) => {
      expect(parse(code).pass).toBe(true);
      expect(topStats(root(code))).toHaveLength(1);
    },
  );

  it.each([
    ["par { A.b() }", (s: Ctx) => s.par()],
    ["par(x) { A.b() }", (s: Ctx) => s.par()],
    ["opt { A.b() }", (s: Ctx) => s.opt()],
    ["opt(x) { A.b() }", (s: Ctx) => s.opt()],
    ["critical { A.b() }", (s: Ctx) => s.critical()],
    ["critical(x) { A.b() }", (s: Ctx) => s.critical()],
    ["while(x)\n{ A.b() }", (s: Ctx) => s.loop()],
    ["A.m()\n{ A.b() }", (s: Ctx) => s.message()],
    ["new M()\n{ A.b() }", (s: Ctx) => s.creation()],
  ])("`%s` owns its block", (code, owner) => {
    expect(parse(code).pass).toBe(true);
    const stats = topStats(root(code));
    expect(stats).toHaveLength(1);
    expect(signatures(owner(stats[0]).braceBlock())).toEqual(["b()"]);
    expect(sections(root(code))).toHaveLength(0);
  });

  it("keeps complete blocks when a later line has an error", () => {
    const tree = root(
      "section(s) { A.b() }\nif(x) { A.c() } { A.d() }\nwhile(y) { A.e() }\nA.f(",
    );
    const found = sections(tree);
    expect(found).toHaveLength(2);
    expect(found[0].SECTION()).not.toBeNull();
    expect(signatures(found[0])).toEqual(["b()"]);
    expect(found[1].SECTION()).toBeNull();
    expect(signatures(found[1])).toEqual(["d()"]);
    const stats = topStats(tree);
    expect(signatures(stats[1].alt().ifBlock())).toEqual(["c()"]);
    expect(signatures(stats[3].loop())).toEqual(["e()"]);
  });

  it("keeps an unbraced `if` as a sibling of the next statement", () => {
    const stats = topStats(root("if(x)\nA.b()"));
    expect(stats).toHaveLength(2);
    expect(stats[0].alt().ifBlock().braceBlock()).toBeNull();
    expect(signatures(stats[1])).toEqual(["b()"]);
  });
});
