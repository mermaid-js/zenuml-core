import antlr4 from "antlr4";
import { RootContext } from "@/parser";
import sequenceLexer from "@/generated-parser/sequenceLexer";
import sequenceParser from "@/generated-parser/sequenceParser";

// Reference parse: plain full-LL parse, the strategy RootContext used before
// two-stage (SLL-first) parsing was introduced.
function parseWithFullLL(code: string) {
  const chars = new antlr4.InputStream(code);
  const lexer = new sequenceLexer(chars);
  lexer.removeErrorListeners();
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new sequenceParser(tokens);
  parser.removeErrorListeners();
  return parser.prog();
}

describe("RootContext (two-stage parsing)", () => {
  test("produces the same tree as a full LL parse for valid code", () => {
    const samples = [
      "A->B: hello",
      "title Order\n@Actor User\nUser->Service.place(order) { if (ok) { Service->Db.save() } else { return error } }",
      "while (retry) { A->B.poll() }\npar { A->B.x() B->C.y() }",
      "new A\nret = A.method()\nA->B: done",
    ];
    for (const code of samples) {
      const tree = RootContext(code);
      expect(tree).toBeTruthy();
      // toStringTree's ruleNames param is only a fallback for when recog is
      // omitted (see antlr4 Trees.js) — passing recog always overrides it,
      // so [] here is equivalent to the ANTLR-idiomatic `null` at runtime,
      // but @types/antlr4 declares the param as non-nullable string[].
      expect(tree.toStringTree([], tree.parser)).toBe(
        parseWithFullLL(code).toStringTree([], parseWithFullLL(code).parser),
      );
    }
  });

  test("still returns a recovered tree for invalid code", () => {
    const samples = ["if (", "A->B: msg\n}", "<<<>>>", "group {", "A->"];
    for (const code of samples) {
      const tree = RootContext(code);
      expect(tree).toBeTruthy();
    }
  });

  test("memoizes the parse result for identical code", () => {
    const code = "A->B: memoized";
    expect(RootContext(code)).toBe(RootContext(code));
  });

  test("does not memoize across different code", () => {
    expect(RootContext("A->B: one")).not.toBe(RootContext("A->B: two"));
  });
});
