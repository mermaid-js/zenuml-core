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

// Trial feedback: a new participant should read like handwriting: the name
// is written first, then a pen draws the border around it.
describe("play", () => {
  it("writes a new participant's label, then traces its border", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    root.innerHTML = `<div data-participant-id="A" style="border: 2px solid rgb(10, 20, 30); border-radius: 4px"><div class="label">A</div></div>`;
    const box = root.firstElementChild as HTMLElement;
    const label = box.firstElementChild as HTMLElement;
    box.animate = vi.fn() as never;
    label.animate = vi.fn() as never;
    // happy-dom has no SVG animations; a stand-in keeps the stroke alive.
    const original = Element.prototype.animate;
    const svgAnimate = vi.fn(() => ({}) as Animation);
    Element.prototype.animate = svgAnimate as never;
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
    // The label is written over the first 60% of D.
    expect(label.animate).toHaveBeenCalledWith(
      [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
      { duration: 120, delay: 20, easing: "linear", fill: "backwards" },
    );
    // The real border stays hidden until the pen stroke ends.
    const [frames, timing] = (box.animate as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(frames[0]).toMatchObject({ borderColor: "transparent" });
    expect(timing).toMatchObject({ delay: 20, duration: 280 });
    // A pen stroke traces the border from 40% to 140% of D, then goes away.
    const stroke = root.querySelector("[data-writing-stroke] rect");
    expect(stroke).not.toBeNull();
    expect(stroke!.getAttribute("stroke")).toBe("rgb(10, 20, 30)");
    expect(svgAnimate).toHaveBeenCalledWith(
      [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
      { duration: 200, delay: 100, easing: "ease-in-out", fill: "backwards" },
    );
    Element.prototype.animate = original;
    root.remove();
  });
});
