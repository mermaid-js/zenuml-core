import { Fixture } from "../../test/unit/parser/fixture/Fixture";

/**
 * message -> messageBody -> func -> signature (DOT signature)*
 * "A.method1().method2()" should produce signature "method1().method2()"
 */
describe("Message", () => {
  it("produces signatureText", () => {
    const message = Fixture.firstStatement("A.m1.m2").message();
    expect(message.SignatureText()).toBe("m1.m2");
  });
});
