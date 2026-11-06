import { describe, expect, it } from "vitest";
import { RootContext } from "@/parser";
import { insertParticipantIntoDsl } from "./participantInsertTransform";

describe("participantInsertTransform", () => {
  it("materializes implicit participants and inserts a new one in the middle", () => {
    const code = "A->C: Ping";

    expect(
      insertParticipantIntoDsl({
        code,
        rootContext: RootContext(code),
        insertIndex: 1,
        name: "B",
        type: "default",
      }),
    ).toBe("A\nB\nC\nA->C: Ping");
  });

  it("preserves title when inserting before the first block statement", () => {
    const code = "title Demo\nA->C: Ping";

    expect(
      insertParticipantIntoDsl({
        code,
        rootContext: RootContext(code),
        insertIndex: 1,
        name: "B",
        type: "Actor",
      }),
    ).toBe("title Demo\nA\n@Actor B\nC\nA->C: Ping");
  });

  it("styles an inferred participant once when materializing its declaration", () => {
    const code = "A->C: Ping";

    expect(
      insertParticipantIntoDsl({
        code,
        rootContext: RootContext(code),
        insertIndex: 0,
        name: "A",
        type: "Actor",
        color: "#ef4444",
        materializeExisting: true,
      }),
    ).toBe("@Actor A #ef4444\nC\nA->C: Ping");
  });
});
