import { Fixture } from "../../test/unit/parser/fixture/Fixture";

describe("From", () => {
  it("should parse from of a context: simple statement", () => {
    expect(Fixture.firstStatement("A.method").message().From()).toBeUndefined();
    expect(Fixture.firstStatement("A->B.method").message().From()).toBe("A");
    expect(Fixture.firstStatement("A->B: message").asyncMessage().From()).toBe(
      "A",
    );
    expect(Fixture.firstStatement("new A").creation().From()).toBeUndefined();

    expect(Fixture.firstChild("A.method { method }").message().From()).toBe(
      "A",
    );
    expect(Fixture.firstChild("A.method { B.method }").message().From()).toBe(
      "A",
    );
    expect(
      Fixture.firstChild("A.method { B->C.method }").message().From(),
    ).toBe("B");
    expect(
      Fixture.firstChild("A.method { B->C:method \n}").asyncMessage().From(),
    ).toBe("B");
    expect(Fixture.firstChild("A.method { new B }").creation().From()).toBe(
      "A",
    );
  });
});

describe("Return arrow shortcut (-->)", () => {
  it("should parse A-->B:msg as a return message", () => {
    const ret = Fixture.firstStatement("A-->B:msg").ret();
    expect(ret).toBeTruthy();
    expect(ret.returnAsyncMessage()).toBeTruthy();
    expect(ret.From()).toBe("A");
    expect(ret.ReturnTo()).toBe("B");
    expect(ret.Signature()).toBe("msg");
  });

  it("should work inside a message block", () => {
    const ret = Fixture.firstChild("A->B.method {\n  B-->A: response\n}").ret();
    expect(ret).toBeTruthy();
    expect(ret.ReturnTo()).toBe("A");
    expect(ret.Signature()).toBe(" response");
  });
});

describe("ProvidedFrom for MessageContext Only", () => {
  it("should parse ProvidedFrom for a Message", () => {
    expect(Fixture.firstStatement("A.method").message().ProvidedFrom()).toBe(
      undefined,
    );
    expect(Fixture.firstStatement("A->B.method").message().ProvidedFrom()).toBe(
      "A",
    );
  });
});
