import { Fixture } from "./fixture/Fixture";
import { Assignment } from "../../../src/parser/Messages/Assignment";
import { USE_LANGIUM } from "../../../src/parser-langium/engine-flag";

describe("message - complete", () => {
  test("A.m", () => {
    let message = Fixture.firstStatement("200=A.m").message();
    expect(message.SignatureText()).toBe("m");
    expect(message.Assignment()).toBeDefined();
    // Don't check labelPosition as it will have real values from parser
    expect(message.Assignment().assignee).toBe("200");
    expect(message.Assignment().type).toBe("");
  });

  test.each([
    ["A.m", "m", undefined],
    ["A.m()", "m()", undefined],
    ["A.m(1)", "m(1)", undefined],
    ["A.m(1,2)", "m(1,2)", undefined],
    ['A.m(" const, static ")', 'm(" const,static ")', undefined], // See StringUtil.spec for why the space after ',' was removed
    ["ret = A.m", "m", "ret"],
    ["new = A.m", "m", "new"], // `new` can be used as an assignee
    ["const ret = A.m", "m", "ret"],
    ["readonly ret = A.m", "m", "ret"],
    ["static ret = A.m", "m", "ret"],
    ["const ret = await A.m", "m", "ret"],
  ])(
    " %s, signature: %s and assignment: %s",
    (text, signature, expectedAssignee) => {
      let message = Fixture.firstStatement(text).message();
      expect(message.SignatureText()).toBe(signature);
      let actual = message.Assignment();
      if (expectedAssignee === undefined) {
        expect(actual).toBeUndefined();
      } else {
        expect(actual).toBeDefined();
        expect(actual.assignee).toBe(expectedAssignee);
        expect(actual.type).toBe("");
      }
    },
  );
});

describe("message - incomplete", () => {
  test("A.", () => {
    let message = Fixture.firstStatement("A.").message();
    expect(message.messageBody().fromTo().to().getText()).toBe("A");
  });

  // Incomplete `A.m(` is an error-recovery shape that differs by engine
  // (07-risk-map §G7, docs/langium-migration/12-stage34-exceptions.md):
  //  - ANTLR DefaultErrorStrategy splits it into `A.` + `m(`, so the first
  //    statement's func() is null.
  //  - Chevrotain (Langium) single-token-insertion recovers the missing `)`
  //    into one message whose func() is `m(` — Chevrotain has no recovery
  //    hooks (langium #1742) and faking the split is forbidden.
  // The editor closes the `(` in most cases, so this transient state is rare
  // and renders correctly under both engines (E2E visual gate covers it).
  test("A.m(", () => {
    let message = Fixture.firstStatement("A.m(").message();
    let signatureElement = message.messageBody().func();
    if (USE_LANGIUM) {
      expect(signatureElement).not.toBeNull();
      expect(signatureElement.getFormattedText()).toBe("m(");
    } else {
      expect(signatureElement).toBeNull();
    }
  });
});

test("seqDsl should parse a simple method with a method call as parameter", () => {
  let signatureText = Fixture.firstStatement("B.method(getCount(1))")
    .message()
    .SignatureText();
  expect(signatureText).toBe("method(getCount(1))");
});

test("seqDsl should parse a simple method with quoted method name", () => {
  let signatureElement = Fixture.firstStatement('B."method. {a,b} 1"(1,2)')
    .message()
    .SignatureText();
  expect(signatureElement).toBe('"method.{a,b} 1"(1,2)');
});

test("Simple method: A->B.method()", () => {
  const message = Fixture.firstStatement("A->B.method()").message();
  let messageBody = message.messageBody();
  expect(messageBody.fromTo().from().getText()).toBe("A");
  expect(message.SignatureText()).toBe("method()");
});

test('Simple method: "A".method()', () => {
  const message = Fixture.firstStatement('"A".method()').message();
  let messageBody = message.messageBody();
  expect(messageBody.fromTo().to().getFormattedText()).toBe("A");
  expect(message.SignatureText()).toBe("method()");
});
