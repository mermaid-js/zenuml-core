import { describe, expect, it } from "vitest";
import { parse, RootContext } from "./index";
import ToCollector from "./ToCollector";

// Issue #670: while a fragment header is incomplete, the next line must not be
// read as part of it. Each row keeps `A.c()` and `A.d()` as top-level messages.

type Stat = any;

const FRAGMENT_RULES = [
  "alt",
  "par",
  "opt",
  "critical",
  "section",
  "ref",
  "loop",
  "tcf",
] as const;

function kindOf(stat: Stat): string {
  for (const rule of FRAGMENT_RULES) {
    if (stat[rule]()) return rule;
  }
  if (stat.message()) {
    return `message ${stat.message().messageBody().getText()}`;
  }
  return stat.constructor.name;
}

function statsOf(code: string): Stat[] {
  return RootContext(code).block().stat();
}

function kinds(code: string): string[] {
  return statsOf(code).map(kindOf);
}

function conditionText(stat: Stat): string | undefined {
  const parExpr =
    stat.alt()?.ifBlock().parExpr() ??
    stat.loop()?.parExpr() ??
    stat.opt()?.parExpr() ??
    stat.par()?.parExpr() ??
    stat.critical()?.parExpr();
  return parExpr?.condition()?.getFormattedText();
}

const NEXT_LINES = ["message A.c()", "message A.d()"];

describe("incomplete fragment header leaves the next line alone (#670)", () => {
  it.each([
    ["if", "alt", undefined],
    ["if(a ==", "alt", "a =="],
    ["if(x", "alt", "x"],
    ["while(", "loop", undefined],
    ["opt(", "opt", undefined],
    ["par(", "par", undefined],
    ["critical(", "critical", undefined],
  ])("`%s` + next lines", (header, fragment, condition) => {
    const [first, ...rest] = statsOf(`A.a()\n${header}\nA.c()\nA.d()`);
    expect(kindOf(first)).toBe("message A.a()");
    expect(kindOf(rest[0])).toBe(fragment);
    expect(conditionText(rest[0])).toBe(condition);
    expect(rest.slice(1).map(kindOf)).toEqual(NEXT_LINES);
  });

  it.each([
    ["try", "tcf"],
    ["ref", "ref"],
    ["ref(", "ref"],
    ["ref(x,", "ref"],
    ["section(", "section"],
    ["opt(x)", "opt"],
    ["par(x)", "par"],
    ["critical(x)", "critical"],
    ["section(x)", "section"],
  ])("`%s` + next lines", (header, fragment) => {
    expect(kinds(`A.a()\n${header}\nA.c()\nA.d()`)).toEqual([
      "message A.a()",
      fragment,
      ...NEXT_LINES,
    ]);
  });

  it("`else if` before the `(` stays one alt", () => {
    const [alt, next] = statsOf("if(x) {\n}\nelse if\nA.c()");
    expect(alt.alt().elseIfBlock()).toHaveLength(1);
    expect(kindOf(next)).toBe("message A.c()");
  });

  it("`else if(` stops at the end of its line", () => {
    const [alt, next] = statsOf("if(x) {\n}\nelse if(y\nA.c()");
    const elseIf = alt.alt().elseIfBlock()[0];
    expect(elseIf.parExpr().condition().getFormattedText()).toBe("y");
    expect(kindOf(next)).toBe("message A.c()");
  });

  it.each([["try {\n}\ncatch(\nA.c()"], ["try {\n}\nfinally\nA.c()"]])(
    "`%j` keeps the next line outside the tcf",
    (code) => {
      expect(kinds(code)).toEqual(["tcf", "message A.c()"]);
    },
  );

  it("does not swallow the closing brace of the enclosing block", () => {
    for (const header of ["if", "try", "ref", "opt(", "while(", "ref(x,"]) {
      const [outer, next] = statsOf(`A.m() {\n${header}\n}\nA.c()`);
      expect(outer.message().braceBlock().block().stat()).toHaveLength(1);
      expect(kindOf(next)).toBe("message A.c()");
    }
  });

  it("collects no participant from the swallowed line (`ref(x,`)", () => {
    const participants = ToCollector.getParticipants(
      RootContext("A.a()\nref(x,\nA.c()\nA.d()"),
    );
    // `x` is the ref's label; only later names in the list are participants.
    expect(participants.Names()).toEqual(["A"]);
  });

  it("collects no empty participant from `ref` before the `(`", () => {
    const participants = ToCollector.getParticipants(
      RootContext("A.a()\nref\nA.c()\nA.d()"),
    );
    expect(participants.Names()).toEqual(["A"]);
  });

  it("keeps a comment attached to the statement after the header", () => {
    const [, message] = statsOf("if\n// note\nA.c()");
    expect(message.message().getComment()).toBe(" note");
  });

  it("gives the partial condition the source range of its text", () => {
    const code = "if(a ==\nA.c()";
    const condition = statsOf(code)[0].alt().ifBlock().parExpr().condition();
    expect(code.slice(condition.start.start, condition.stop.stop + 1)).toBe(
      "a ==",
    );
  });
});

describe("reported errors for an incomplete fragment header", () => {
  it.each([
    ["if\nA.c()", "2:0 missing '(' at 'A'"],
    ["try\nA.c()", "2:0 missing '{' at 'A'"],
    ["opt(\nA.c()", "2:0 missing '{' at 'A'"],
    ["opt(x)\nA.c()", "2:0 missing '{' at 'A'"],
    ["ref\nA.c()", "2:0 missing '(' at 'A'"],
    ["ref(x,\nA.c()", "2:0 missing ')' at 'A'"],
  ])("`%j` reports %s", (code, expected) => {
    const { pass, errorDetails } = parse(code);
    expect(pass).toBe(false);
    expect(errorDetails.map((e) => `${e.line}:${e.column} ${e.msg}`)).toEqual([
      expected,
    ]);
  });

  it.each([["if(a ==\nA.c()"], ["while(\nA.c()"], ["if(x\nA.c()"]])(
    "`%j` stays error-free: the grammar tolerates a missing `)` here",
    (code) => {
      expect(parse(code).errorDetails).toEqual([]);
    },
  );

  it("records the same errors in the module list on the RootContext path", async () => {
    const Parser = (await import("./index")).default;
    Parser.ErrorDetails.length = 0;
    RootContext("try\nA.m()");
    expect(Parser.ErrorDetails.map((e) => e.msg)).toEqual([
      "missing '{' at 'A'",
    ]);
    Parser.ErrorDetails.length = 0;
  });
});

describe("valid or closed multi-line headers keep today's parse", () => {
  it.each([
    ["if(a ==\n  b) {\n}", "alt", "a == b"],
    ["if(a ==\n  A.c()) {\n}", "alt", "a == A.c()"],
    ["if\n(x) {\n}", "alt", "x"],
    ["if(a &&\n  b\n) {\n}", "alt", "a && b"],
    ["while(\n  a\n) {\n}", "loop", "a"],
    ["while(a ==\n  b)", "loop", "a == b"],
    ["opt(\n  a\n) {\n}", "opt", "a"],
    ["par(\n  a\n) {\n}", "par", "a"],
    ["critical(\n  a\n) {\n}", "critical", "a"],
  ])("`%j` -> %s with condition %s", (code, fragment, condition) => {
    const [stat, ...rest] = statsOf(code);
    expect(kindOf(stat)).toBe(fragment);
    expect(conditionText(stat)).toBe(condition);
    expect(rest).toHaveLength(0);
    expect(parse(code).errorDetails).toEqual([]);
  });

  it("a creation block inside a multi-line condition does not end the search for `)`", () => {
    const code = "if(new A(\n) {\n}) {\n  B.c()\n}";
    const [stat, ...rest] = statsOf(code);
    expect(stat.alt().ifBlock().braceBlock().block().stat()).toHaveLength(1);
    expect(rest).toHaveLength(0);
    expect(parse(code).errorDetails).toEqual([]);
  });

  it("`ref(x,\\n  A)` keeps both names", () => {
    const code = "ref(x,\n  A)";
    const ref = statsOf(code)[0].ref();
    expect(ref.name().map((n: any) => n.getText())).toEqual(["x", "A"]);
    expect(parse(code).errorDetails).toEqual([]);
  });

  it("`ref(\\n  x\\n)` keeps its name", () => {
    const code = "ref(\n  x\n)";
    expect(
      statsOf(code)[0]
        .ref()
        .name()
        .map((n: any) => n.getText()),
    ).toEqual(["x"]);
    expect(parse(code).errorDetails).toEqual([]);
  });

  it("`try\\n{\\n}` keeps its block on the next line", () => {
    const code = "try\n{\n  A.c()\n}";
    const tcf = statsOf(code)[0].tcf();
    expect(tcf.tryBlock().braceBlock().block().stat()).toHaveLength(1);
    expect(parse(code).errorDetails).toEqual([]);
  });

  it("`opt(x)\\n{\\n}` keeps its block on the next line", () => {
    const code = "opt(x)\n{\n  A.c()\n}";
    const [stat, ...rest] = statsOf(code);
    expect(stat.opt().braceBlock().block().stat()).toHaveLength(1);
    expect(rest).toHaveLength(0);
    expect(parse(code).errorDetails).toEqual([]);
  });

  it("`if(x\\n{` attaches the block to the header", () => {
    const [stat, ...rest] = statsOf("if(x\n{\n  A.c()\n}");
    expect(conditionText(stat)).toBe("x");
    expect(stat.alt().ifBlock().braceBlock().block().stat()).toHaveLength(1);
    expect(rest).toHaveLength(0);
  });

  it("`if(x {` attaches the block to the header", () => {
    const [stat, ...rest] = statsOf("if(x {\n  A.c()\n}");
    expect(conditionText(stat)).toBe("x");
    expect(stat.alt().ifBlock().braceBlock().block().stat()).toHaveLength(1);
    expect(rest).toHaveLength(0);
  });

  it("`if x {` keeps x as the condition and reports the missing `(`", () => {
    const code = "if x {\n  A.c()\n}";
    const [stat, ...rest] = statsOf(code);
    expect(conditionText(stat)).toBe("x");
    expect(rest).toHaveLength(0);
    expect(parse(code).errorDetails.map((e) => e.msg)).toEqual([
      "missing '(' at 'x'",
    ]);
  });

  it("`par` + statement stays a bare par and a message", () => {
    expect(kinds("par\nA.c()")).toEqual(["par", "message A.c()"]);
    expect(parse("par\nA.c()").errorDetails).toEqual([]);
  });

  it("`if()` + statement stays an empty alt and a message", () => {
    expect(kinds("if()\nA.c()")).toEqual(["alt", "message A.c()"]);
    expect(parse("if()\nA.c()").errorDetails).toEqual([]);
  });

  it.each([
    ["if(x", "alt", "x"],
    ["if(a ==", "alt", undefined],
    ["while(", "loop", undefined],
  ])("`%s` with nothing after it is not repaired", (code, fragment, cond) => {
    const [stat, ...rest] = statsOf(code);
    expect(kindOf(stat)).toBe(fragment);
    if (cond) expect(conditionText(stat)).toBe(cond);
    expect(rest).toHaveLength(0);
  });

  it("a keyword-free parenthesis on a later line does not close the header", () => {
    expect(kinds("if(a\nA.c(1)\nA.d(2)")).toEqual([
      "alt",
      "message A.c(1)",
      "message A.d(2)",
    ]);
  });
});
