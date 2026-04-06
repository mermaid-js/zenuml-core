import { describe, it, expect } from "vitest";
import { insertMessageInDsl } from "./insertMessageInDsl";

const mockBlockContext = (charRanges: [number, number][]) => ({
  stat: () =>
    charRanges.map(([start, stop]) => ({
      start: { start },
      stop: { stop },
    })),
});

describe("insertMessageInDsl", () => {
  it("appends to empty block", () => {
    const result = insertMessageInDsl({
      code: "A\nB",
      from: "A",
      to: "B",
      blockContext: mockBlockContext([]),
      insertIndex: 0,
    });
    expect(result.code).toBe("A\nB\nA->B.newMessage()");
    expect(result.code.slice(result.labelPosition[0], result.labelPosition[1] + 1)).toBe(
      "newMessage()",
    );
  });

  it("inserts before first statement", () => {
    const code = "A\nB\nA->B.hello()";
    const helloStart = code.indexOf("A->B.hello()");
    const helloEnd = helloStart + "A->B.hello()".length - 1;

    const result = insertMessageInDsl({
      code,
      from: "B",
      to: "A",
      blockContext: mockBlockContext([[helloStart, helloEnd]]),
      insertIndex: 0,
    });
    expect(result.code).toBe("A\nB\nB->A.newMessage()\nA->B.hello()");
    expect(
      result.code.slice(result.labelPosition[0], result.labelPosition[1] + 1),
    ).toBe("newMessage()");
  });

  it("inserts after last statement", () => {
    const code = "A\nB\nA->B.hello()";
    const helloStart = code.indexOf("A->B.hello()");
    const helloEnd = helloStart + "A->B.hello()".length - 1;

    const result = insertMessageInDsl({
      code,
      from: "B",
      to: "A",
      blockContext: mockBlockContext([[helloStart, helloEnd]]),
      insertIndex: 1,
    });
    expect(result.code).toBe("A\nB\nA->B.hello()\nB->A.newMessage()");
    expect(
      result.code.slice(result.labelPosition[0], result.labelPosition[1] + 1),
    ).toBe("newMessage()");
  });

  it("inserts between two statements", () => {
    const code = "A\nB\nA->B.hello()\nB->A.world()";
    const helloStart = code.indexOf("A->B.hello()");
    const helloEnd = helloStart + "A->B.hello()".length - 1;
    const worldStart = code.indexOf("B->A.world()");
    const worldEnd = worldStart + "B->A.world()".length - 1;

    const result = insertMessageInDsl({
      code,
      from: "A",
      to: "B",
      signature: "check()",
      blockContext: mockBlockContext([
        [helloStart, helloEnd],
        [worldStart, worldEnd],
      ]),
      insertIndex: 1,
    });
    expect(result.code).toBe(
      "A\nB\nA->B.hello()\nA->B.check()\nB->A.world()",
    );
    expect(
      result.code.slice(result.labelPosition[0], result.labelPosition[1] + 1),
    ).toBe("check()");
  });

  it("uses custom signature", () => {
    const result = insertMessageInDsl({
      code: "A\nB",
      from: "A",
      to: "B",
      signature: "validate()",
      blockContext: mockBlockContext([]),
      insertIndex: 0,
    });
    expect(result.code).toContain("A->B.validate()");
    expect(
      result.code.slice(result.labelPosition[0], result.labelPosition[1] + 1),
    ).toBe("validate()");
  });
});
