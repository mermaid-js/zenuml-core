import { canTransformMessageType, transformMessageType } from "./messageTypeTransform";

describe("messageTypeTransform", () => {
  it("converts an explicit sync call into an async message", () => {
    expect(
      transformMessageType({
        line: "A->B.method()",
        currentType: "sync",
        targetType: "async",
        source: "A",
        target: "B",
        signature: "method()",
      }),
    ).toBe("A->B: method()");
  });

  it("converts an implicit sync call into an async message", () => {
    expect(
      transformMessageType({
        line: "  B.method()",
        currentType: "sync",
        targetType: "async",
        source: "_STARTER_",
        target: "B",
        signature: "method()",
      }),
    ).toBe("  B: method()");
  });

  it("converts an async message into a return message while preserving content", () => {
    expect(
      transformMessageType({
        line: "D->C: Hello Bob",
        currentType: "async",
        targetType: "return",
        source: "D",
        target: "C",
      }),
    ).toBe("D-->C: Hello Bob");
  });

  it("converts a return message back into an async message", () => {
    expect(
      transformMessageType({
        line: "D-->C: response payload",
        currentType: "return",
        targetType: "async",
        source: "D",
        target: "C",
      }),
    ).toBe("D->C: response payload");
  });

  it("rejects sync to return when there is no explicit source", () => {
    expect(
      canTransformMessageType({
        line: "A.method()",
        currentType: "sync",
        targetType: "return",
        source: "_STARTER_",
        target: "A",
        signature: "method()",
      }),
    ).toBe(false);
  });

  it("rejects conversions for statements with inline blocks", () => {
    expect(
      canTransformMessageType({
        line: "A->B.method() {",
        currentType: "sync",
        targetType: "async",
        source: "A",
        target: "B",
        signature: "method()",
      }),
    ).toBe(false);
  });
});
