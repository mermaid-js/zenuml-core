import { describe, expect, it } from "vitest";
import { parse, RootContext, validate } from "./index";

// Regression for a complete statement directly before an unrecoverable token.
//
// `A.b()` fits two `messageBody` alternatives: `fromTo func` and `func` (with
// `A` as a first signature). The prediction therefore read past the end of the
// statement, so a bad next token made the whole statement a "no viable
// alternative". Recovery then gave three messages on the starter: "", "A." and
// "b()". The call lost its target and later statements were numbered 2 higher.
type Node = {
  constructor: { name: string };
  children?: Node[] | null;
  SignatureText(): string;
  Owner(): string | undefined;
  getText(): string;
  messageBody(): { fromTo(): unknown };
};

function messagesIn(node: unknown): Node[] {
  const n = node as Node;
  const own = n.constructor.name === "MessageContext" ? [n] : [];
  return own.concat((n.children ?? []).flatMap(messagesIn));
}

// [target, label] of every message, in document order. A split shows up as extra
// entries with an empty label and with no target.
function messages(root: unknown) {
  return messagesIn(root).map((m) => [m.Owner(), m.SignatureText()]);
}

describe("a statement next to a syntax error stays one message", () => {
  it.each([
    [
      "end of document in an unclosed block",
      "opt(x) {\n  Q.b()",
      [["Q", "b()"]],
    ],
    [
      "missing closing brace before catch",
      "try {\n  A.b()\ncatch(e) {\n  A.c()\n}\nA.d()",
      [
        ["A", "b()"],
        ["A", "c()"],
        ["A", "d()"],
      ],
    ],
    [
      "extra closing parenthesis",
      "P.x()\nA.b())\nA.c()",
      [
        ["P", "x()"],
        ["A", "b()"],
      ],
    ],
    [
      "extra closing brace",
      "P.x()\nA.b() }",
      [
        ["P", "x()"],
        ["A", "b()"],
      ],
    ],
    ["bare method name", "opt(x) {\n  Q.b", [["Q", "b"]]],
    ["chained call", "opt(x) {\n  Q.b().c()", [["Q", "b().c()"]]],
    ["explicit source", "opt(x) {\n  P->Q.b()", [["Q", "b()"]]],
    ["assignment in an unclosed block", "opt(x) {\n  r = Q.b()", [["Q", "b()"]]],
    ["assignment before an extra brace", "r = Q.b() }", [["Q", "b()"]]],
    ["emoji before the target", "opt(x) {\n  [rocket] Q.b()", [["Q", "b()"]]],
    [
      "while typing the next line",
      "API.validate(token) {\n  Auth.c",
      [
        ["API", "validate(token)"],
        ["Auth", "c"],
      ],
    ],
  ])("%s", (_name, code, expected) => {
    expect(messages(RootContext(code))).toEqual(expected);
    expect(messages(parse(code).rootContext)).toEqual(expected);
  });
});

describe("valid message forms keep their parse", () => {
  it.each([
    ["A.b()", [["A", "b()"]]],
    ["A.b();", [["A", "b()"]]],
    ["A.b", [["A", "b"]]],
    ["A.b.c", [["A", "b.c"]]],
    ["A.b().c()", [["A", "b().c()"]]],
    ["r = A.b()", [["A", "b()"]]],
    ["r = A.b().c()", [["A", "b().c()"]]],
    ["A->B.m()", [["B", "m()"]]],
    ["r = A->B.m()", [["B", "m()"]]],
    ["[rocket] A.b()", [["A", "b()"]]],
    [
      "A.b() {\n  C.d()\n}",
      [
        ["A", "b()"],
        ["C", "d()"],
      ],
    ],
    [
      "A.b()\nC.d()",
      [
        ["A", "b()"],
        ["C", "d()"],
      ],
    ],
    ["opt(x) {\n  A.b()\n}", [["A", "b()"]]],
    ['"A B".b()', [["A B", "b()"]]],
  ])("%s", (code, expected) => {
    expect(validate(code).pass).toBe(true);
    expect(messages(RootContext(code))).toEqual(expected);
  });

  // `A.` and `r =` are complete messages. When the next tokens can only be a new
  // statement, they stay two statements.
  it.each([
    ["A.\nb->c.d()", ["A", ""], ["c", "d()"]],
    ["A.\nb - c", ["A", ""]],
    ["A.\nb = c()", ["A", ""], [undefined, "c()"]],
    ["A.\nb, c = d()", ["A", ""], [undefined, "d()"]],
    ["A.b: hi", ["A", ""]],
    ["A.b.c: hi", ["A", ""], ["b", ""]],
    ["A.b.c = d()", ["A", ""], ["b", ""], [undefined, "d()"]],
    ["r =\nb: hi", [undefined, ""]],
    ["r =\nb->c: hi", [undefined, ""]],
    ["r =\nb = c()", [undefined, ""], [undefined, "c()"]],
  ])("%s stays separate statements", (code, ...expected) => {
    expect(validate(code).pass).toBe(true);
    expect(messages(RootContext(code))).toEqual(expected);
  });

  // A message with no `name DOT` at the start stays on the bare-func path.
  it.each([
    ["b()", "b()"],
    ["b().c()", "b().c()"],
    ["b().c", "b().c"],
    ["r = b", "b"],
    ["r = b()", "b()"],
    ["r = b().c()", "b().c()"],
    ["[rocket] b()", "[rocket] b()"],
  ])("%s has no target of its own", (code, label) => {
    expect(validate(code).pass).toBe(true);
    const [message] = messagesIn(RootContext(code));
    expect(message.SignatureText()).toBe(label);
    expect(message.messageBody().fromTo()).toBeNull();
  });
});
