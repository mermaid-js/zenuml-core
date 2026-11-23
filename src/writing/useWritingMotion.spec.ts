import { describe, expect, it, vi } from "vitest";
import { measure, play } from "./useWritingMotion";

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

// Trial feedback: a whole-box wipe did not read as drawing the participant.
// Design note, section 4: the border draws over 0-55% of D, then the label
// wipes in over 45-100%.
describe("play", () => {
  it("draws a new participant's border first, then its label", () => {
    const root = document.createElement("div");
    root.innerHTML = `<div data-participant-id="A"><div class="label">A</div></div>`;
    const box = root.firstElementChild as HTMLElement;
    const label = box.firstElementChild as HTMLElement;
    box.animate = vi.fn() as never;
    label.animate = vi.fn() as never;
    const { elements } = measure(root);
    play(
      {
        moves: [],
        reveals: [{ key: "p:A", delay: 20, duration: 200 }],
        removals: [],
      },
      elements,
      root,
      measure(document.createElement("div")),
    );
    expect(box.animate).toHaveBeenCalledWith(
      [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
      { duration: 110, delay: 20, easing: "linear", fill: "backwards" },
    );
    expect(label.animate).toHaveBeenCalledWith(
      [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
      { duration: 110, delay: 110, easing: "linear", fill: "backwards" },
    );
  });
});
