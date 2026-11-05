import { Fixture } from "./fixture/Fixture";
import { Assignment } from "../../../src/parser/Messages/Assignment";

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
  ])(" %s, signature: %s and assignment: %s", (text, signature, expectedAssignee) => {
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
  });

});

describe("message - incomplete", () => {
  test("A.", () => {
    let message = Fixture.firstStatement("A.").message();
  expect(message.messageBody().fromTo().to().getText()).toBe("A");
  });

  // The grammar alone parses this as two statements, `A.` and `m(`. The parser
  // closes an unclosed call first; see repairIncompleteCalls.
  test("A.m(", () => {
    let message = Fixture.firstStatement("A.m(").message();
    expect(message.messageBody().fromTo().to().getText()).toBe("A");
    expect(message.SignatureText()).toBe("m()");
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
