import { describe, expect, it } from "bun:test";
import { wrapMessageInFragment } from "./messageWrapTransform";

describe("messageWrapTransform", () => {
  it("wraps a message with an alt fragment and returns the condition range", () => {
    expect(
      wrapMessageInFragment({
        code: "A->B: Ping",
        line: "A->B: Ping",
        lineHead: 0,
        type: "alt",
      }),
    ).toEqual({
      code: "if(condition) {\n  A->B: Ping\n}",
      conditionPosition: [3, 11],
    });
  });

  it("wraps sync message in multi-line DSL without extra characters", () => {
    const code = "A->B: Hello\nD->C.y\nB->C: World";
    const lineHead = 12; // position of 'D'
    const lineTail = code.indexOf("\n", lineHead); // 18
    const line = code.slice(lineHead, lineTail); // "D->C.y"
    const result = wrapMessageInFragment({ code, line, lineHead, type: "alt" });
    expect(result.code).toBe("A->B: Hello\nif(condition) {\n  D->C.y\n}\nB->C: World");
  });

  it("wraps D->C.y as the only line", () => {
    const code = "D->C.y";
    const line = "D->C.y";
    const result = wrapMessageInFragment({ code, line, lineHead: 0, type: "alt" });
    expect(result.code).toBe("if(condition) {\n  D->C.y\n}");
  });
});
