import { describe, expect, it } from "vitest";
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

  it("converts an async message back to a sync message", () => {
    expect(
      transformMessageType({
        line: "A->B: method()",
        currentType: "async",
        targetType: "sync",
        source: "A",
        target: "B",
        signature: "method()",
      }),
    ).toBe("A->B.method()");
  });

  it("converts a return message back to a sync message", () => {
    expect(
      transformMessageType({
        line: "A-->B: method()",
        currentType: "return",
        targetType: "sync",
        source: "A",
        target: "B",
        signature: "method()",
      }),
    ).toBe("A->B.method()");
  });

  it("appends parens when content has no parens for sync conversion", () => {
    expect(
      transformMessageType({
        line: "A->B: doStuff",
        currentType: "async",
        targetType: "sync",
        source: "A",
        target: "B",
        signature: "doStuff",
      }),
    ).toBe("A->B.doStuff()");
  });

  it("preserves indentation on async-to-sync conversion", () => {
    expect(
      transformMessageType({
        line: "  A->B: method()",
        currentType: "async",
        targetType: "sync",
        source: "A",
        target: "B",
        signature: "method()",
      }),
    ).toBe("  A->B.method()");
  });

  it("rejects async-to-sync when content has spaces", () => {
    expect(
      canTransformMessageType({
        line: "D->C: Hello Bob",
        currentType: "async",
        targetType: "sync",
        source: "D",
        target: "C",
        signature: "Hello Bob",
      }),
    ).toBe(false);
  });

  it("roundtrips sync→async→sync for explicit source", () => {
    const original = "A->B.method()";
    const async = transformMessageType({
      line: original,
      currentType: "sync",
      targetType: "async",
      source: "A",
      target: "B",
      signature: "method()",
    });
    expect(async).toBe("A->B: method()");
    const back = transformMessageType({
      line: async!,
      currentType: "async",
      targetType: "sync",
      source: "A",
      target: "B",
      signature: "method()",
    });
    expect(back).toBe(original);
  });

  it("converts a sync call to a creation message", () => {
    const result = transformMessageType({
      line: "A->B.create()",
      currentType: "sync",
      targetType: "creation",
      source: "A",
      target: "B",
      signature: "create()",
    });
    expect(result).toBe("new B(create())");
  });

  it("converts a sync call with indentation to a creation message", () => {
    const result = transformMessageType({
      line: "  A->B.build()",
      currentType: "sync",
      targetType: "creation",
      source: "A",
      target: "B",
      signature: "build()",
    });
    expect(result).toBe("  new B(build())");
  });

  it("rejects sync to creation when there is no signature", () => {
    const result = canTransformMessageType({
      line: "A->B.create()",
      currentType: "sync",
      targetType: "creation",
      source: "A",
      target: "B",
      signature: "",
    });
    expect(result).toBe(false);
  });

  it("converts a creation message to a sync call", () => {
    const result = transformMessageType({
      line: "new B(build)",
      currentType: "creation",
      targetType: "sync",
      source: "A",
      target: "B",
    });
    expect(result).toBe("A->B.build()");
  });

  it("converts an indented creation message to a sync call", () => {
    const result = transformMessageType({
      line: "  new Order(create)",
      currentType: "creation",
      targetType: "sync",
      source: "Client",
      target: "Order",
    });
    expect(result).toBe("  Client->Order.create()");
  });

  it("rejects creation to sync when args contain spaces", () => {
    const result = canTransformMessageType({
      line: "new B(hello world)",
      currentType: "creation",
      targetType: "sync",
      source: "A",
      target: "B",
    });
    expect(result).toBe(false);
  });

  it("rejects creation to sync when source is missing", () => {
    const result = canTransformMessageType({
      line: "new B(build)",
      currentType: "creation",
      targetType: "sync",
      source: undefined,
      target: "B",
    });
    expect(result).toBe(false);
  });
});
