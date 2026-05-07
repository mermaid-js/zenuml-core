import { describe, expect, it } from "vitest";
import { createSyncMessageInDsl } from "./messageCreateTransform";

describe("messageCreateTransform", () => {
  it("appends a sync message and returns the label range", () => {
    expect(
      createSyncMessageInDsl({
        code: "A\nB",
        from: "A",
        to: "B",
      }),
    ).toEqual({
      code: "A\nB\nA->B.newMessage()",
      labelPosition: [9, 20],
    });
  });
});
