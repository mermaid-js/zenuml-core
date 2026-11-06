import { beforeEach, describe, expect, it } from "vitest";
import Parser, { parse, validate } from "@/parser";
import { OrderedParticipants } from "./OrderedParticipants";

function topLevelStatements(code: string): string[] {
  const statements = Parser.RootContext(code).block()?.stat() ?? [];
  return statements.map((stat: any) => stat.getFormattedText());
}

function participantNames(code: string): string[] {
  return OrderedParticipants(Parser.RootContext(code)).map((p) => p.name);
}

// Issue #667: a token the parser cannot place at the top level must not end
// the document.
describe("a stray top-level token keeps the statements after it", () => {
  it.each([
    {
      name: "the first `/` of a comment being typed",
      code: "Q.x()\nP.a()\n/\nP.c()\nP.d()",
      kept: ["Q.x()", "P.c()", "P.d()"],
    },
    {
      name: "the first `=` of a divider being typed",
      code: "A.a()\nA.b()\n=\nA.c()\nA.d()",
      kept: ["A.a()", "A.c()", "A.d()"],
    },
    {
      name: "`else` with no `if`",
      code: "A.a()\nA.b()\nelse\nA.c()\nA.d()",
      kept: ["A.a()", "A.c()", "A.d()"],
    },
    {
      name: "one extra `}` after a fragment",
      code: "if(x) {\n  A.b()\n}\n}\nA.c()\nA.d()",
      kept: ["if(x) { A.b() }", "A.c()", "A.d()"],
    },
  ])("$name", ({ code, kept }) => {
    expect(topLevelStatements(code)).toEqual(expect.arrayContaining(kept));
  });

  it.each([
    "}",
    "(",
    ")",
    "()",
    "]",
    ",",
    ":",
    "->",
    "-",
    "=",
    "==",
    "!",
    "?",
    "#",
    "$",
    "%",
    "&",
    "*",
    "+",
    "|",
    "~",
    "^",
    "\\",
    "@",
    "<",
    ">",
    "<<",
    ">>",
    "/",
    "else",
    "else {",
    "else if",
    "catch",
    "catch(e)",
    "finally",
    "} else",
    "} catch",
    "}}",
    "group",
    "@Starter",
    "@Actor",
    "<<S",
    "->B",
    "= x",
  ])("token %j between two statements", (token) => {
    const code = `P.a()\n${token}\nP.c()\nP.d()`;
    const text = JSON.stringify(topLevelStatements(code));
    expect(text).toContain("c()");
    expect(text).toContain("d()");
  });

  it("several stray tokens on different lines", () => {
    const statements = topLevelStatements("A.a()\n)\nA.b()\n]\nA.c()\n,\nA.d()");
    expect(statements).toEqual(expect.arrayContaining(["A.b()", "A.c()", "A.d()"]));
  });

  it("a stray token before the first statement", () => {
    expect(topLevelStatements(")\n)\nA.a()\nA.b()")).toEqual(["A.a()", "A.b()"]);
  });
});

describe("a stray token in the document head keeps the document", () => {
  it("an extra `}` after a group", () => {
    const code = "group G { A B }}\nA.x()\nB.y()\nA.z()";
    const root = Parser.RootContext(code);
    expect(root.head().group()[0].name().getFormattedText()).toBe("G");
    expect(topLevelStatements(code)).toEqual(["A.x()", "B.y()", "A.z()"]);
    expect(participantNames(code)).toEqual(expect.arrayContaining(["A", "B"]));
  });

  it("a group without its `{`", () => {
    const code = "group G A B}\nA.x()\nB.y()\nA.z()";
    expect(topLevelStatements(code)).toEqual(["A.x()", "B.y()", "A.z()"]);
    expect(participantNames(code)).toEqual(expect.arrayContaining(["A", "B"]));
  });

  it("`@Starter(Client` with later lines already present", () => {
    const code =
      "@Starter(Client\nClient->API.login()\nAPI->DB.query()\nDB->API: rows\nAPI->Client: ok";
    expect(Parser.RootContext(code).Starter()).toBe("Client");
    expect(topLevelStatements(code)).toEqual([
      "Client->API.login()",
      "API->DB.query()",
      "DB->API: rows",
      "API->Client: ok",
    ]);
    expect(participantNames(code)).toEqual(
      expect.arrayContaining(["Client", "API", "DB"]),
    );
  });

  it("an extra `}` in the head of a real document", () => {
    const code = `// comment
title This is a title
@Lambda <<stereotype>> ParticipantName
group "B C" {@EC2 B @ECS C}}
"bg color" #FF0000
@Starter("OptionalStarter")
new B
ReturnType ret = ParticipantName.methodA(a, b) {
  if (condition) {
    B->C: Async Message within fragment
  } else {
    C.method
  }
}
`;
    const control = code.replace("C}}", "C}");
    expect(topLevelStatements(code)).toEqual(topLevelStatements(control));
    expect(participantNames(code)).toEqual(participantNames(control));
    expect(Parser.RootContext(code).title().content()).toBe("This is a title");
    expect(Parser.RootContext(code).Starter()).toBe("OptionalStarter");
  });
});

describe("a `}` that closes a block still closes it", () => {
  it("keeps the statement after the block outside the block", () => {
    const statements = Parser.RootContext("if(x) {\n  A.b()\n}\nA.c()")
      .block()
      .stat();
    expect(statements).toHaveLength(2);
    expect(statements[0].getFormattedText()).toBe("if(x) { A.b() }");
  });

  it("closes the block and drops only the extra `}`", () => {
    const statements = Parser.RootContext(
      "A.m() {\n  if(x) {\n    B.n()\n  }\n}\n}\nA.c()",
    )
      .block()
      .stat();
    expect(statements).toHaveLength(2);
    expect(statements[0].getFormattedText()).toBe("A.m() { if(x) { B.n() } }");
    expect(statements[1].getFormattedText()).toBe("A.c()");
  });

  it("keeps the block of an `else` that follows an extra `}`", () => {
    const text = topLevelStatements(
      "if(x) {\n  A.b()\n}\n}\nelse {\n  A.c()\n}",
    ).join();
    expect(text).toContain("A.b()");
    expect(text).toContain("A.c()");
  });
});

describe("error reporting for a stray top-level token", () => {
  beforeEach(() => {
    Parser.ErrorDetails.length = 0;
  });

  it("validate() fails and points at the stray token", () => {
    const result = validate("A.a()\nA.b()\n}\nA.c()\nA.d()");
    expect(result.pass).toBe(false);
    expect(result.errorDetails).toEqual([
      { line: 3, column: 0, msg: "mismatched input '}' expecting <EOF>" },
    ]);
  });

  it("parse() fails, reports the error and returns the kept statements", () => {
    const result = parse("group G { A B }}\nA.x()\nB.y()");
    expect(result.pass).toBe(false);
    expect(result.errorDetails).toEqual([
      {
        line: 1,
        column: 15,
        msg: "no viable alternative at input 'group G { A B }}'",
      },
    ]);
    expect(result.rootContext.block().stat()).toHaveLength(2);
  });

  it("reports one error for each stray token, in document order", () => {
    const { errorDetails } = validate("A.a()\n)\nA.b()\n]\nA.c()");
    expect(errorDetails.map(({ line, column }) => [line, column])).toEqual([
      [2, 0],
      [4, 0],
    ]);
  });

  it("reports an error inside a statement together with the stray token", () => {
    const { errorDetails } = validate("A.m() {\n  B.n(1 2 3)\n}\n}\nA.c()");
    expect(errorDetails.length).toBeGreaterThan(1);
    expect(errorDetails.at(-1)?.line).toBe(4);
  });

  it("RootContext reports through the legacy ErrorDetails", () => {
    Parser.RootContext("A.a()\nA.b()\n}\nA.c()");
    expect(Parser.ErrorDetails).toEqual([
      { line: 3, column: 0, msg: "mismatched input '}' expecting <EOF>" },
    ]);
  });

  it("reports the unclosed `@Starter(` as an error", () => {
    const code = "@Starter(Client\nClient->API.login()";
    expect(validate(code).errorDetails).toEqual([
      { line: 2, column: 0, msg: "missing ')' after @Starter" },
    ]);

    // The SLL fast path in RootContext must not hide it.
    Parser.RootContext(code);
    expect(Parser.ErrorDetails).toEqual([
      { line: 2, column: 0, msg: "missing ')' after @Starter" },
    ]);
  });

  it("finds any number of stray tokens between statements", () => {
    const code = `A.a()\n${"]\nA.b()\n".repeat(200)}`;
    const result = parse(code);
    expect(result.errorDetails).toHaveLength(200);
    expect(result.rootContext.block().stat()).toHaveLength(201);
  });

  it("stops at the pass limit for stray tokens in the head, and still reports", () => {
    const code = `group G { A ${") ".repeat(40)} }\nA.x()`;
    const result = validate(code);
    expect(result.pass).toBe(false);
    expect(result.errorDetails.length).toBeGreaterThan(0);
  });
});

// These parse with no error, so they never reach the recovery path. They are
// here to catch a grammar change that alters them.
describe("valid DSL next to the changed rules", () => {
  it.each([
    ["@Starter", null],
    ["@Starter()", null],
    ["@Starter(A)", "A"],
    ['@Starter("A B")', "A B"],
    ["@Starter(A) A.m()", "A"],
    ["@Starter(A)\nA.m()\nB.n()", "A"],
  ])("%j", (code, starter) => {
    expect(validate(code).pass).toBe(true);
    expect(Parser.RootContext(code).Starter() ?? null).toBe(starter);
  });

  it.each([
    "group G { A B }\nA.x()",
    "group G\nA.x()",
    "group { A }\nA.x()",
    "A B\nA.x()",
    "if(x) {\n  A.b()\n} else {\n  A.c()\n}\nA.d()",
    "try {\n  A.b()\n} catch(e) {\n  A.c()\n} finally {\n  A.d()\n}\nA.e()",
    "A.m() {\n  B.n() {\n    C.o()\n  }\n}\nA.p()",
    "{\n  A.m()\n}\nA.n()",
    "== divider ==\nA.m()",
    "// comment\nA.m()",
  ])("%j", (code) => {
    expect(validate(code).pass).toBe(true);
  });
});
