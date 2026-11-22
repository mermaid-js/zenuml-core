import { describe, expect, it } from "vitest";
import sequenceParser from "@/generated-parser/sequenceParser";
import { RootContext as langiumRoot } from "@/parser-langium/compat";
import { StatContext as LangiumStat } from "@/parser-langium/facade/nodes";
import { renderToSvg } from "@/svg/renderToSvg";
import { planHeaderRecovery } from "./headerRecovery";
import { parse } from "./index";

// ADR 0007: `return A->B: msg` on one line draws an async return, and `return`
// reads only what is on its own line.

/** The statements of the document, in order, as short labels. */
function statements(root: any, Stat: any): string[] {
  const out: string[] = [];
  const walk = (node: any, isRoot: boolean) => {
    if (node instanceof Stat && !isRoot) {
      const ret = node.ret?.();
      const async = ret?.asyncMessage?.();
      if (async) {
        out.push(
          `async-return ${async.from?.()?.getFormattedText() ?? ""}->${async.to?.()?.getFormattedText() ?? ""}`,
        );
      } else if (ret) {
        out.push(`return ${ret.expr?.()?.getFormattedText() ?? ""}`.trim());
      } else if (node.asyncMessage?.()) {
        out.push("async");
      } else if (node.message?.()) {
        out.push("sync");
      } else {
        out.push("other");
      }
    }
    for (const child of node.children ?? []) walk(child, false);
  };
  walk(root, true);
  return out;
}

const PARSERS = [
  [
    "ANTLR",
    (code: string) => parse(code).rootContext,
    sequenceParser.StatContext,
  ],
  ["Langium", (code: string) => langiumRoot(code), LangiumStat],
] as const;

const inBlock = (...lines: string[]) =>
  `A.m() {\n${lines.map((l) => `  ${l}`).join("\n")}\n}`;

describe.each(PARSERS)("return on one line (%s)", (_name, root, Stat) => {
  const read = (code: string) => statements(root(code), Stat);

  describe("new readings", () => {
    it("return B->A: msg is an async return", () => {
      expect(read(inBlock("return B->A: msg"))).toEqual([
        "sync",
        "async-return B->A",
      ]);
    });

    it("return B->A: msg at the top level is an async return", () => {
      expect(read("return B->A: msg")).toEqual(["async-return B->A"]);
    });

    it("return B->A with no message yet is an async return", () => {
      expect(read(inBlock("return B->A"))).toEqual([
        "sync",
        "async-return B->A",
      ]);
    });

    // ADR 0008 (#722): no caller, like `@return A: msg`.
    it("return A: msg is an async return from the current participant", () => {
      expect(read(inBlock("return C: msg"))).toEqual([
        "sync",
        "async-return ->C",
      ]);
    });

    it("return A: msg at the top level is an async return", () => {
      expect(read("return C: msg")).toEqual(["async-return ->C"]);
    });

    it("return with a quoted target and a message is an async return", () => {
      expect(read(inBlock('return "C c": msg'))).toEqual([
        "sync",
        "async-return ->C c",
      ]);
    });

    it("return at the end of its line does not take the next line", () => {
      expect(read(inBlock("return", "C.c()"))).toEqual([
        "sync",
        "return",
        "sync",
      ]);
    });
  });

  describe("unchanged readings", () => {
    it.each([
      [
        "return + newline + async message",
        inBlock("return", "B->A: msg"),
        ["sync", "return", "async"],
      ],
      [
        "return x + newline + call",
        inBlock("return x", "C.c()"),
        ["sync", "return x", "sync"],
      ],
      ["return + newline + }", inBlock("return"), ["sync", "return"]],
      [
        "@return + newline + message (ADR 0005)",
        inBlock("@return", "B->A: msg"),
        ["sync", "async-return B->A"],
      ],
      [
        "@return on one line",
        inBlock("@return B->A: msg"),
        ["sync", "async-return B->A"],
      ],
      ["return a - b", inBlock("return a - b"), ["sync", "return a - b"]],
      ["return to", inBlock("return to"), ["sync", "return to"]],
      [
        "return x;",
        inBlock("return x;", "C.c()"),
        ["sync", "return x", "sync"],
      ],
    ])("%s", (_label, code, expected) => {
      expect(read(code)).toEqual(expected);
    });

    it("a return value may continue on the next line", () => {
      expect(read(inBlock("return foo(", "  a)"))).toEqual([
        "sync",
        "return foo(a)",
      ]);
    });
  });
});

describe("return B->A.m() keeps its reading (ANTLR)", () => {
  it("is an empty return, then a call from B", () => {
    const code = inBlock("return B->A.m()");
    expect(
      statements(parse(code).rootContext, sequenceParser.StatContext),
    ).toEqual(["sync", "return", "sync"]);
  });
});

describe("rendering", () => {
  const svg = (code: string) => renderToSvg(code).svg;

  it("return B->A: msg renders the same as @return B->A: msg", () => {
    expect(svg(inBlock("return B->A: msg"))).toBe(
      svg(inBlock("@return B->A: msg")),
    );
  });

  it("return A: msg renders the same as @return A: msg", () => {
    const code = (ret: string) =>
      `A.m() {\n  B.n() {\n    ${ret} A: msg\n  }\n}`;
    expect(svg(code("return"))).toBe(svg(code("@return")));
    expect(parse(code("return")).errorDetails).toEqual([]);
  });

  it("return + newline + call renders the same as return; + newline + call", () => {
    expect(svg(inBlock("return", "C.c()"))).toBe(
      svg(inBlock("return;", "C.c()")),
    );
  });

  it("reports no error for the new form", () => {
    expect(parse(inBlock("return B->A: msg")).errorDetails).toEqual([]);
    expect(parse(inBlock("return", "C.c()")).errorDetails).toEqual([]);
  });
});

describe("planHeaderRecovery: return rules", () => {
  const tok = (kind: string, line: number) => ({ kind, line });

  it("re-types return before name -> on its line", () => {
    const plan = planHeaderRecovery([
      tok("RETURN", 1),
      tok("ID", 1),
      tok("ARROW", 1),
      tok("ID", 1),
      tok("COL", 1),
      tok("EOF", 0),
    ]);
    expect([...plan.retypes]).toEqual([[0, "ANNOTATION_RET"]]);
    expect(plan.errors).toEqual([]);
  });

  it("re-types return before name : on its line", () => {
    const plan = planHeaderRecovery([
      tok("RETURN", 1),
      tok("ID", 1),
      tok("COL", 1),
      tok("ID", 1),
      tok("EOF", 0),
    ]);
    expect([...plan.retypes]).toEqual([[0, "ANNOTATION_RET"]]);
  });

  it("leaves return alone when the : is on the next line", () => {
    const plan = planHeaderRecovery([
      tok("RETURN", 1),
      tok("ID", 1),
      tok("COL", 2),
      tok("EOF", 0),
    ]);
    expect(plan.retypes.size).toBe(0);
  });

  it("ends a return at the end of its line", () => {
    const plan = planHeaderRecovery([
      tok("RETURN", 1),
      tok("ID", 2),
      tok("EOF", 0),
    ]);
    expect([...plan.insertions]).toEqual([[0, ["SCOL"]]]);
    expect(plan.errors).toEqual([]);
  });

  it.each([
    ["}", [tok("RETURN", 1), tok("CBRACE", 2), tok("EOF", 0)]],
    ["EOF", [tok("RETURN", 1), tok("EOF", 0)]],
    [";", [tok("RETURN", 1), tok("SCOL", 1), tok("EOF", 0)]],
    [
      "a value on the same line",
      [tok("RETURN", 1), tok("ID", 1), tok("EOF", 0)],
    ],
  ])("leaves return alone before %s", (_label, tokens) => {
    const plan = planHeaderRecovery(tokens);
    expect(plan.insertions.size).toBe(0);
    expect(plan.retypes.size).toBe(0);
  });
});
