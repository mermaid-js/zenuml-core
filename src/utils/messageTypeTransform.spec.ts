import { describe, expect, it } from "vitest";
import {
  canTransformMessageType,
  type MessageArrowType,
  retypeMessageInDsl,
  transformMessageType,
} from "./messageTypeTransform";

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

// Verbatim copy of the splice and label math that used to live inline in
// StylePanel's handleTypeClick; the oracle that retypeMessageInDsl must equal.
const legacyInlineRetype = (input: {
  code: string;
  lineHead: number;
  line: string;
  currentType: MessageArrowType;
  targetType: MessageArrowType;
  source: string;
  target: string;
  signature: string;
}) => {
  const {
    code,
    lineHead,
    line,
    currentType,
    targetType,
    source,
    target,
    signature,
  } = input;
  if (currentType === targetType) return null;
  if (
    !canTransformMessageType({
      line,
      currentType,
      targetType,
      source,
      target,
      signature,
    })
  )
    return null;
  const nextLine = transformMessageType({
    line,
    currentType,
    targetType,
    source,
    target,
    signature,
  });
  if (!nextLine) return null;
  const lineTail = lineHead + line.length;
  const labelText = signature;
  const labelOffset = labelText ? nextLine.lastIndexOf(labelText) : -1;
  const nextCode = code.slice(0, lineHead) + nextLine + code.slice(lineTail);
  let labelPosition: [number, number] | null = null;
  if (labelOffset >= 0 && labelText) {
    const start = lineHead + labelOffset;
    labelPosition = [start, start + labelText.length - 1];
  }
  return { code: nextCode, line: nextLine, labelPosition };
};

describe("retypeMessageInDsl", () => {
  type Case = {
    name: string;
    code: string;
    line: string;
    currentType: MessageArrowType;
    targetType: MessageArrowType;
    source: string;
    target: string;
    signature: string;
    expected: { code: string; labelPosition: [number, number] | null } | null;
  };
  const cases: Case[] = [
    {
      name: "sync to async in the middle of a diagram",
      code: "A->B.m()\nB->C.go()\nC->D.end()",
      line: "B->C.go()",
      currentType: "sync",
      targetType: "async",
      source: "B",
      target: "C",
      signature: "go()",
      expected: {
        code: "A->B.m()\nB->C: go()\nC->D.end()",
        labelPosition: [15, 18],
      },
    },
    {
      name: "indented line keeps indent and shifts label",
      code: "if(x) {\n  A->B.run()\n}",
      line: "  A->B.run()",
      currentType: "sync",
      targetType: "async",
      source: "A",
      target: "B",
      signature: "run()",
      expected: { code: "if(x) {\n  A->B: run()\n}", labelPosition: [16, 20] },
    },
    {
      name: "last line without trailing newline",
      code: "A->B.m()\nB->C.go()",
      line: "B->C.go()",
      currentType: "sync",
      targetType: "async",
      source: "B",
      target: "C",
      signature: "go()",
      expected: { code: "A->B.m()\nB->C: go()", labelPosition: [15, 18] },
    },
    {
      name: "signature appearing twice: lastIndexOf picks the later occurrence",
      code: "A->B: A",
      line: "A->B: A",
      currentType: "async",
      targetType: "return",
      source: "A",
      target: "B",
      signature: "A",
      expected: { code: "A-->B: A", labelPosition: [7, 7] },
    },
    {
      name: "signature equal to target name inside a creation line",
      code: "A->B.B()",
      line: "A->B.B()",
      currentType: "sync",
      targetType: "creation",
      source: "A",
      target: "B",
      signature: "B()",
      expected: { code: "new B(B())", labelPosition: [6, 8] },
    },
    {
      name: "type change that shortens the line before the label",
      code: "x\nA->B.run()\ny",
      line: "A->B.run()",
      currentType: "sync",
      targetType: "creation",
      source: "A",
      target: "B",
      signature: "run()",
      expected: { code: "x\nnew B(run())\ny", labelPosition: [8, 12] },
    },
    {
      name: "type change that lengthens the line before the label",
      code: "x\nA->B.run()\ny",
      line: "A->B.run()",
      currentType: "sync",
      targetType: "return",
      source: "A",
      target: "B",
      signature: "run()",
      expected: { code: "x\nA-->B: run()\ny", labelPosition: [9, 13] },
    },
    {
      name: "trailing semicolon is preserved",
      code: "A->B.run();\nC->D.x()",
      line: "A->B.run();",
      currentType: "sync",
      targetType: "async",
      source: "A",
      target: "B",
      signature: "run()",
      expected: { code: "A->B: run();\nC->D.x()", labelPosition: [6, 10] },
    },
    {
      name: "async to sync: label text is found in the new line",
      code: "A->B: run",
      line: "A->B: run",
      currentType: "async",
      targetType: "sync",
      source: "A",
      target: "B",
      signature: "run",
      expected: { code: "A->B.run()", labelPosition: [5, 7] },
    },
    {
      name: "empty signature: no label position",
      code: "A->B: run\nB->C: x",
      line: "A->B: run",
      currentType: "async",
      targetType: "sync",
      source: "A",
      target: "B",
      signature: "",
      expected: { code: "A->B.run()\nB->C: x", labelPosition: null },
    },
    {
      name: "signature text absent from the new line: no label position",
      code: "A->B: run",
      line: "A->B: run",
      currentType: "async",
      targetType: "sync",
      source: "A",
      target: "B",
      signature: "other",
      expected: { code: "A->B.run()", labelPosition: null },
    },
    {
      name: "same type returns null",
      code: "A->B.run()",
      line: "A->B.run()",
      currentType: "sync",
      targetType: "sync",
      source: "A",
      target: "B",
      signature: "run()",
      expected: null,
    },
    {
      name: "transform not allowed (sync to return from the starter) returns null",
      code: "B.run()",
      line: "B.run()",
      currentType: "sync",
      targetType: "return",
      source: "_STARTER_",
      target: "B",
      signature: "run()",
      expected: null,
    },
    {
      name: "inline block returns null",
      code: "A->B.run() {",
      line: "A->B.run() {",
      currentType: "sync",
      targetType: "async",
      source: "A",
      target: "B",
      signature: "run()",
      expected: null,
    },
  ];

  it.each(cases)("$name", ({ expected, ...input }) => {
    const result = retypeMessageInDsl({
      ...input,
      lineHead: input.code.indexOf(input.line),
    });
    if (expected === null) {
      expect(result).toBeNull();
    } else {
      expect(result).toMatchObject(expected);
    }
  });

  it.each(cases)("$name: equals the legacy inline logic", (testCase) => {
    const { code, line, currentType, targetType, source, target, signature } =
      testCase;
    const args = {
      code,
      line,
      currentType,
      targetType,
      source,
      target,
      signature,
      lineHead: code.indexOf(line),
    };
    expect(retypeMessageInDsl(args)).toEqual(legacyInlineRetype(args));
  });
});
