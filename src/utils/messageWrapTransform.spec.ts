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
});
