import { describe, expect, it, vi } from "vitest";
import { followStrokes, measure, play, settle } from "./useWritingMotion";

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

  // Visual review: a new lifeline stood at full length under a blank box.
  // It now draws down from the box once the border is closed.
  it("draws a new participant's lifeline down after its border", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    root.innerHTML = `<div data-participant-id="A"><div>A</div></div><div data-lifeline-id="A"><div class="line"></div></div>`;
    const line = root.querySelector<HTMLElement>(".line")!;
    line.animate = vi.fn() as never;
    const original = Element.prototype.animate;
    Element.prototype.animate = vi.fn(() => ({}) as Animation) as never;
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
    expect(line.animate).toHaveBeenCalledWith(
      [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)" }],
      { duration: 200, delay: 300, easing: "ease-out", fill: "backwards" },
    );
    Element.prototype.animate = original;
    root.remove();
  });

  // Visual review: a moved participant glided, but its lifeline jumped.
  it("glides a moved participant's lifeline with its box", () => {
    const root = document.createElement("div");
    root.innerHTML = `<div data-participant-id="A"><div>A</div></div><div data-lifeline-id="A"><div class="line"></div></div>`;
    const box = root.querySelector<HTMLElement>("[data-participant-id]")!;
    const line = root.querySelector<HTMLElement>(".line")!;
    box.animate = vi.fn() as never;
    line.animate = vi.fn() as never;
    const { elements } = measure(root);
    play(
      { moves: [{ key: "p:A", dx: -40, dy: 0 }], reveals: [], removals: [] },
      elements,
      root,
      measure(document.createElement("div")),
    );
    const glide = [
      [{ transform: "translate(-40px, 0px)" }, { transform: "none" }],
      { duration: 110, easing: "ease-out" },
    ];
    expect(box.animate).toHaveBeenCalledWith(...glide);
    expect(line.animate).toHaveBeenCalledWith(...glide);
  });
});

// Demo feedback: Shop was drawn with no motion. The next keystroke's frame
// came 150-200 ms later and finished every animation, cutting off the 576 ms
// participant draw. A new frame now finishes only glides, which would distort
// the measurement; reveals and pen strokes keep running.
describe("settle", () => {
  const fake = (frame: Keyframe) => ({
    effect: { getKeyframes: () => [frame] },
    finish: vi.fn(),
  });

  it("finishes glides but lets reveals run on", () => {
    const root = document.createElement("div");
    root.innerHTML = `<div data-participant-id="A"></div>`;
    const box = root.firstElementChild as HTMLElement;
    const glide = fake({ transform: "translate(4px, 0)" });
    const reveal = fake({ clipPath: "inset(0 100% 0 0)" });
    box.getAnimations = (() => [glide, reveal]) as never;
    settle(root, new Map([["p:A", box]]));
    expect(glide.finish).toHaveBeenCalled();
    expect(reveal.finish).not.toHaveBeenCalled();
  });

  it("drops fading ghosts but keeps pen strokes", () => {
    const root = document.createElement("div");
    root.innerHTML = `<div data-writing-ghost></div><svg data-writing-stroke="p:A"></svg>`;
    settle(root, new Map());
    expect(root.querySelector("[data-writing-ghost]")).toBeNull();
    expect(root.querySelector("[data-writing-stroke]")).not.toBeNull();
  });
});

describe("followStrokes", () => {
  it("moves a pen stroke to its participant's new place", () => {
    const root = document.createElement("div");
    root.innerHTML = `<svg data-writing-stroke="p:A" style="left: 0px; top: 0px"></svg>`;
    const box = document.createElement("div");
    followStrokes(
      root,
      new Map([["p:A", { kind: "participant", x: 40, y: 8, parent: null }]]),
      new Map([["p:A", box]]),
    );
    const stroke = root.querySelector<SVGElement>("[data-writing-stroke]")!;
    expect(stroke.style.left).toBe("40px");
    expect(stroke.style.top).toBe("8px");
  });

  it("removes a pen stroke whose participant is gone", () => {
    const root = document.createElement("div");
    root.innerHTML = `<svg data-writing-stroke="p:A"></svg>`;
    followStrokes(root, new Map(), new Map());
    expect(root.querySelector("[data-writing-stroke]")).toBeNull();
  });
});
