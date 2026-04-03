import { describe, expect, it } from "vitest";
import { reorderMessageInDsl } from "./messageReorderTransform";

describe("messageReorderTransform", () => {
  const rangeOf = (code: string, text: string): [number, number] => {
    const start = code.indexOf(text);
    return [start, start + text.length - 1];
  };

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

  it("moves a top-level message into a fragment and rewrites indentation", () => {
    const code = `A
B
C
B->A: outside
if(ready) {
  A->B: alpha
  A->C: beta
}
`;
    expect(
      reorderMessageInDsl({
        code,
        sourceRange: rangeOf(code, "B->A: outside"),
        targetRange: rangeOf(code, "A->B: alpha"),
        place: "before",
      }),
    ).toBe(`A
B
C
if(ready) {
  B->A: outside
  A->B: alpha
  A->C: beta
}
`);
  });

  it("moves a fragment message out to the top level and removes indentation", () => {
    const code = `A
B
C
B->A: outside
if(ready) {
  A->B: alpha
  A->C: beta
}
`;
    expect(
      reorderMessageInDsl({
        code,
        sourceRange: rangeOf(code, "A->B: alpha"),
        targetRange: rangeOf(code, "B->A: outside"),
        place: "before",
      }),
    ).toBe(`A
B
C
A->B: alpha
B->A: outside
if(ready) {
  A->C: beta
}
`);
  });
});
