import antlr4 from "antlr4";
import { describe, expect, it } from "vitest";
import { CASES } from "../../e2e/data/compare-cases.js";
import sequenceLexer from "../generated-parser/sequenceLexer";
import sequenceParser from "../generated-parser/sequenceParser";
import { parse, RootContext } from "@/parser";
import { repairIncompleteCalls } from "./repairIncompleteCalls";
import { TREE_CORPUS } from "../../test/unit/parity/tree-corpus";

/** `[owner, label]` of each statement, in document order. */
function statements(code: string) {
  const stats = RootContext(code).block()?.stat() ?? [];
  return stats.map((stat: any) => {
    const node = stat.getChild(0);
    return [node.Owner?.() ?? null, node.SignatureText?.() ?? node.getText()];
  });
}

describe("an unclosed call paren (#671)", () => {
  it.each([
    // The examples in the issue.
    ["A.b(", [["A", "b()"]]],
    ["A.b(x", [["A", "b(x)"]]],
    [
      "A.a()\nB.b(\nA.c()\nA.d()",
      [
        ["A", "a()"],
        ["B", "b()"],
        ["A", "c()"],
        ["A", "d()"],
      ],
    ],
    // The arguments of an unclosed call end with the line.
    [
      "A.a()\nB.b(x\nA.c()\nA.d()",
      [
        ["A", "a()"],
        ["B", "b(x)"],
        ["A", "c()"],
        ["A", "d()"],
      ],
    ],
    [
      "B.b(A.c()\nA.d()",
      [
        ["B", "b(A.c())"],
        ["A", "d()"],
      ],
    ],
    // A line that ends in a comma, or an argument list begun with one, goes on.
    ["A.b(x,", [["A", "b(x)"]]],
    ["A.b(x,\ny", [["A", "b(x,y)"]]],
    [
      "A.b(\n  x,\n  y\nA.c()",
      [
        ["A", "b(x,y)"],
        ["A", "c()"],
      ],
    ],
    // Other call positions.
    ["foo(", [[null, "foo()"]]],
    ["x = A.b(", [["A", "b()"]]],
    ["C->A.b(x", [["A", "b(x)"]]],
    ["A.b(c.d(", [["A", "b(c.d())"]]],
    ["A.b((x", [["A", "b((x))"]]],
    ["A.b(x.", [["A", "b(x)"]]],
    // The next statement survives, whatever it is.
    [
      "B.b(\nA->C.m()",
      [
        ["B", "b()"],
        ["C", "m()"],
      ],
    ],
  ])("%j", (code, expected) => {
    expect(statements(code)).toEqual(expected);
  });

  it("keeps a fragment that follows the call", () => {
    const stats = RootContext("B.b(\nif(x) {\n  A.c()\n}").block().stat();
    expect(stats).toHaveLength(2);
    expect(stats[0].message().SignatureText()).toBe("b()");
    expect(stats[1].alt()).toBeTruthy();
  });

  it("ends the call at the brace that closes its block", () => {
    const stats = RootContext("if(x) {\n  B.b(\n}\nC.d()").block().stat();
    expect(stats).toHaveLength(2);
    const inner = stats[0].alt().ifBlock().braceBlock().block().stat();
    expect(inner).toHaveLength(1);
    expect(inner[0].message().SignatureText()).toBe("b()");
    expect(stats[1].message().SignatureText()).toBe("d()");
  });

  it("keeps a block that opens after the unclosed paren", () => {
    const stats = RootContext("A.b(x {\n  C.d()\n}").block().stat();
    expect(stats).toHaveLength(1);
    expect(stats[0].message().SignatureText()).toBe("b(x)");
    expect(stats[0].message().braceBlock().block().stat()).toHaveLength(1);
  });

  it("`new B(` creates B with no self-call", () => {
    expect(statements("new B(")).toEqual([["B", "«create»"]]);
  });

  it("`new B(x` passes x to the creation", () => {
    expect(statements("new B(x")).toEqual([["B", "«x»"]]);
  });

  it("`new B(` keeps the next statement", () => {
    expect(statements("x = new B(\nA.c()")).toEqual([
      ["x:B", "«create»"],
      ["A", "c()"],
    ]);
  });

  it("still reports the missing paren", () => {
    const result = parse("A.a()\nB.b(x\nA.c()");
    expect(result.pass).toBe(false);
    expect(result.errorDetails).toEqual([
      { line: 2, column: 4, msg: "missing ')' for the '(' of this call" },
    ]);
    expect(result.rootContext.block().stat()).toHaveLength(3);
  });

  it("offsets of the repaired message stop at the last real character", () => {
    const stat = RootContext("A.b(x\nC.d()").block().stat()[0];
    expect(stat.start.start).toBe(0);
    expect(stat.stop.stop).toBe(4);
  });
});

describe("a chain that ends in a trailing dot (#671)", () => {
  it.each([
    ["B.b().", [["B", "b()"]]],
    ["B.b(x).", [["B", "b(x)"]]],
    [
      "B.b().\nA->C.m()",
      [
        ["B", "b()"],
        ["C", "m()"],
      ],
    ],
    [
      "B.b().\nA:hi",
      [
        ["B", "b()"],
        ["A", "hi"],
      ],
    ],
    [
      "B.b().\nr = A.c()",
      [
        ["B", "b()"],
        ["A", "c()"],
      ],
    ],
  ])("%j", (code, expected) => {
    expect(statements(code)).toEqual(expected);
  });

  it("keeps a fragment that follows the chain", () => {
    const stats = RootContext("B.b().\nif(x) {\n  A.c()\n}").block().stat();
    expect(stats).toHaveLength(2);
    expect(stats[0].message().SignatureText()).toBe("b()");
    expect(stats[1].alt()).toBeTruthy();
  });

  it("still reports the dot", () => {
    const result = parse("B.b().");
    expect(result.pass).toBe(false);
    expect(result.errorDetails).toEqual([
      { line: 1, column: 5, msg: "extraneous '.' at the end of this call" },
    ]);
  });
});

describe("a trailing dot before a line that starts a new statement (#671)", () => {
  it.each([
    [
      "A.a()\nB.\nA.c()\nA.d()",
      [
        ["A", "a()"],
        ["B", ""],
        ["A", "c()"],
        ["A", "d()"],
      ],
    ],
    [
      "A.a()\nB.b(x).\nA.c()\nA.d()",
      [
        ["A", "a()"],
        ["B", "b(x)"],
        ["A", "c()"],
        ["A", "d()"],
      ],
    ],
    [
      "B.\nc.d()",
      [
        ["B", ""],
        ["c", "d()"],
      ],
    ],
    [
      "B.b(x).\nA.c()",
      [
        ["B", "b(x)"],
        ["A", "c()"],
      ],
    ],
  ])("%j", (code, expected) => {
    expect(statements(code)).toEqual(expected);
  });

  it("keeps a fragment on the next line", () => {
    const stats = RootContext("B.\nif(x) {\n  A.c()\n}").block().stat();
    expect(stats).toHaveLength(2);
  });

  it("reports the dot", () => {
    const result = parse("B.\nA.c()");
    expect(result.pass).toBe(false);
    expect(result.errorDetails).toEqual([
      { line: 1, column: 1, msg: "extraneous '.' at the end of this line" },
    ]);
  });
});

describe("valid multi-line DSL is unchanged (#671)", () => {
  it.each([
    // Multi-line argument lists.
    ["A.b(\n  x,\n  y\n)", [["A", "b(x,y)"]]],
    ["A.b(\n)", [["A", "b()"]]],
    ["A.b(\n).c()", [["A", "b().c()"]]],
    ["B.b(\n  A.c()\n)", [["B", "b(A.c())"]]],
    ["A.b(x,\n  y)", [["A", "b(x,y)"]]],
    ["A.b(c.d(x), y)", [["A", "b(c.d(x),y)"]]],
    ["A.b((x))", [["A", "b((x))"]]],
    ["A.b(\n  c.d(\n    x\n  )\n)", [["A", "b(c.d(x))"]]],
    // Multi-line chains.
    ["A.b()\n.c()", [["A", "b().c()"]]],
    ["A.b().\nc()", [["A", "b().c()"]]],
    ["B.b(x).\nc()", [["B", "b(x).c()"]]],
    ["A.\nb()", [["A", "b()"]]],
    // A name alone on the next line, or a dot on the same line, stays a chain.
    // (`B.` + `name.` on the next line is a new statement: see the describe above.)
    ["B.\nc()", [["B", "c()"]]],
    ["B.c.d()", [["B", "c.d()"]]],
    ["B.b(x).c.d()", [["B", "b(x).c.d()"]]],
    ["A.b(x.\ny.z)", [["A", "b(x.y.z)"]]],
    // A message that ends in a dot without a chain.
    ["B.", [["B", ""]]],
    [
      "B.\nA->C.m()",
      [
        ["B", ""],
        ["C", "m()"],
      ],
    ],
    // Several calls on one line.
    [
      "A.b(x); C.d(y)",
      [
        ["A", "b(x)"],
        ["C", "d(y)"],
      ],
    ],
  ])("%j", (code, expected) => {
    expect(statements(code)).toEqual(expected);
    expect(parse(code).pass).toBe(true);
  });

  it("does not touch the fragment headers that have their own tolerance", () => {
    const stats = RootContext("if(x\nA.c()").block().stat();
    expect(stats).toHaveLength(2);
    expect(stats[0].alt()).toBeTruthy();
    expect(stats[1].message().SignatureText()).toBe("c()");
  });

  const corpus: [string, string][] = [
    ...Object.entries(CASES as Record<string, string>),
    ...TREE_CORPUS.map((c: { id: string; code: string }): [string, string] => [
      c.id,
      c.code,
    ]),
  ];

  it("repairs nothing in a corpus document with no syntax error", () => {
    const repaired = corpus.filter(([, code]) => {
      const plain = createPlainParser(code);
      plain.prog();
      if (plain._syntaxErrors > 0) return false;
      return repairIncompleteCalls(createPlainParser(code).getTokenStream()).length > 0;
    });
    expect(repaired.map(([id]) => id)).toEqual([]);
  });
});

function createPlainParser(code: string): any {
  const lexer = new sequenceLexer(new antlr4.InputStream(code));
  lexer.removeErrorListeners();
  const parser = new sequenceParser(new antlr4.CommonTokenStream(lexer));
  parser.removeErrorListeners();
  return parser;
}
