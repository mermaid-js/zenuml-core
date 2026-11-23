import { describe, expect, it } from "vitest";
import { measure } from "./useWritingMotion";

describe("measure", () => {
  it("keys participants and statements, and links a statement to its keyed parent", () => {
    const root = document.createElement("div");
    root.innerHTML = `
      <div data-participant-id="A"></div>
      <div data-participant-id="A"></div>
      <div data-identity="f1">
        <div><div data-identity="c1"></div></div>
      </div>
      <div data-identity="m1"></div>`;
    const { boxes } = measure(root);
    expect([...boxes.keys()]).toEqual(["p:A", "s:f1", "s:c1", "s:m1"]);
    expect(boxes.get("p:A")).toMatchObject({
      kind: "participant",
      parent: null,
    });
    expect(boxes.get("s:c1")).toMatchObject({
      kind: "statement",
      parent: "s:f1",
    });
    expect(boxes.get("s:m1")!.parent).toBeNull();
  });
});
