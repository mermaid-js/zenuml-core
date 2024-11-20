import { Fixture } from "../../test/unit/parser/fixture/Fixture";
import { expect } from "vitest";
import sequenceParser from "@/generated-parser/sequenceParser";

describe("Ancestor", () => {
  it("should return the ancestor path", () => {
    const firstChild = Fixture.firstChild("A.method() { C->C.method }");
    expect(firstChild.getFormattedText()).toBe("C->C.method");

    // @ts-ignore
    function predict(ctx) {
      return ctx instanceof sequenceParser.MessageContext;
    }

    const ancestors = firstChild.getAncestors(predict);
    expect(ancestors.length).toBe(1);
    expect(ancestors[0].getFormattedText()).toBe("A.method() { C->C.method }");
  });
});
