import { describe, expect, it } from "bun:test";
import { reorderMessageInDsl } from "./messageReorderTransform";

describe("messageReorderTransform", () => {
  it("moves one message before another", () => {
    expect(
      reorderMessageInDsl({
        code: "A\nB\nC\nA->B: first\nA->C: second\n",
        sourceRange: [23, 34],
        targetRange: [6, 17],
        place: "before",
      }),
    ).toBe("A\nB\nC\nA->C: second\nA->B: first\n");
  });

  it("moves one message after another", () => {
    expect(
      reorderMessageInDsl({
        code: "A\nB\nC\nA->B: first\nA->C: second\n",
        sourceRange: [6, 17],
        targetRange: [19, 31],
        place: "after",
      }),
    ).toBe("A\nB\nC\nA->C: second\nA->B: first\n");
  });

  it("moves one message after another when the file has no trailing newline", () => {
    expect(
      reorderMessageInDsl({
        code: "A\nB\nC\nA->B: first\nA->C: second",
        sourceRange: [6, 17],
        targetRange: [19, 31],
        place: "after",
      }),
    ).toBe("A\nB\nC\nA->C: second\nA->B: first\n");
  });
});
