/**
 * Refs #667. A stray top-level token (`/`, `=`, `else`, an extra `}` or `)`)
 * used to end the Langium parse: the entry rule stopped at the token and every
 * later statement was dropped, so editor autocomplete lost later participants.
 * The ANTLR parser keeps those statements; Langium must do the same.
 */
import { describe, expect, test } from "vitest";
import type { Block, Prog } from "./generated/ast";
import { collectParticipantNames } from "./lsp/participants";
import { parseZen } from "./services";

function parse(code: string) {
  const result = parseZen(code);
  const prog = result.value as Prog;
  const block = prog.block as Block | undefined;
  return {
    result,
    statements: block?.stats.length ?? 0,
    participants: collectParticipantNames(prog),
  };
}

describe("Langium keeps statements after a stray top-level token (#667)", () => {
  const cases: Array<{
    name: string;
    dsl: string;
    statements: number;
    participants: string[];
  }> = [
    {
      name: "stray /",
      dsl: "Q.x()\nP.a()\n/\nP.c()\nR.d()",
      statements: 4,
      participants: ["P", "Q", "R"],
    },
    {
      name: "stray =",
      dsl: "A.a()\nA.b()\n=\nA.c()\nB.d()",
      statements: 4,
      participants: ["A", "B"],
    },
    {
      name: "stray else",
      dsl: "A.a()\nA.b()\nelse\nA.c()\nB.d()",
      statements: 4,
      participants: ["A", "B"],
    },
    {
      name: "extra } after an if block",
      dsl: "if(x) {\n  A.b()\n}\n}\nA.c()\nB.d()",
      statements: 3,
      participants: ["A", "B"],
    },
    {
      name: "extra } after a group",
      dsl: "group G { A B }}\nA.x()\nB.y()\nA.z()",
      statements: 3,
      participants: ["A", "B", "G"],
    },
    {
      name: "extra )",
      dsl: "P.x()\nA.b())\nB.c()",
      statements: 3,
      participants: ["A", "B", "P"],
    },
    {
      name: "several stray tokens",
      dsl: "A.a()\n/\nB.b()\n=\nC.c()\n)\nD.d()",
      statements: 4,
      participants: ["A", "B", "C", "D"],
    },
  ];

  for (const c of cases) {
    test(c.name, () => {
      const out = parse(c.dsl);
      expect(out.statements).toBe(c.statements);
      expect(out.participants).toEqual(c.participants);
      // The stray token is still reported.
      expect(out.result.parserErrors.length).toBeGreaterThan(0);
    });
  }

  test("valid DSL is parsed in one pass without errors", () => {
    const out = parse("Q.x()\nP.a()\nP.c()\nR.d()");
    expect(out.result.parserErrors).toHaveLength(0);
    expect(out.statements).toBe(4);
  });
});
