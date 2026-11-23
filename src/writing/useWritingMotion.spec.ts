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

// Prototype review (writing-motion-proto.html): an arrow grows from its
// sender to its receiver, and a fragment fills its header, then a pen draws
// its border.
describe("play: statements", () => {
  const reveal = (key: string) => ({
    moves: [],
    reveals: [{ key, delay: 20, duration: 200 }],
    removals: [],
  });

  it("grows a new message's arrow from the sender, then writes its label", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    root.innerHTML = `
      <div data-identity="m1"><div class="interaction">
        <div class="message">
          <svg class="line"></svg><svg class="head right-0"></svg>
          <div class="name">m()</div><div class="message-number">1</div>
        </div>
        <div class="occurrence"></div>
      </div></div>`;
    const q = (s: string) => root.querySelector<HTMLElement>(s)!;
    for (const s of [
      ".line",
      ".head",
      ".name",
      ".message-number",
      ".occurrence",
    ])
      q(s).animate = vi.fn() as never;
    const { elements } = measure(root);
    play(
      reveal("s:m1"),
      elements,
      root,
      measure(document.createElement("div")),
    );
    // Left to right: the line is uncovered from its left end over D.
    expect(q(".line").animate).toHaveBeenCalledWith(
      [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
      { duration: 200, delay: 20, easing: "ease-out", fill: "backwards" },
    );
    // The head rides on the tip: it starts at the sender's end.
    const [headFrames, headTiming] = (
      q(".head").animate as ReturnType<typeof vi.fn>
    ).mock.calls[0];
    expect(headFrames[0].translate).toMatch(/^-\d|^0px/);
    expect(headFrames.at(-1)).toMatchObject({ translate: "0px 0px" });
    expect(headTiming).toMatchObject({ duration: 200, delay: 20 });
    // The label is written once the arrow is half way.
    expect(q(".name").animate).toHaveBeenCalledWith(
      [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
      { duration: 120, delay: 120, easing: "linear", fill: "backwards" },
    );
    expect(q(".message-number").animate).toHaveBeenCalled();
    // The rest of the interaction appears as the arrow arrives.
    expect(q(".occurrence").animate).toHaveBeenCalledWith(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 80, delay: 180, easing: "linear", fill: "backwards" },
    );
    root.remove();
  });

  it("grows a right-to-left arrow from its right end", () => {
    const root = document.createElement("div");
    root.innerHTML = `<div data-identity="m1"><div class="interaction"><div class="message"><svg class="line"></svg><svg class="head left-0"></svg></div></div></div>`;
    const line = root.querySelector<HTMLElement>(".line")!;
    line.animate = vi.fn() as never;
    root.querySelector<HTMLElement>(".head")!.animate = vi.fn() as never;
    const { elements } = measure(root);
    play(
      reveal("s:m1"),
      elements,
      root,
      measure(document.createElement("div")),
    );
    expect(
      (line.animate as ReturnType<typeof vi.fn>).mock.calls[0][0][0],
    ).toEqual({
      clipPath: "inset(0 0 0 100%)",
    });
  });

  it("fills a new fragment's header, then traces its border", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    root.innerHTML = `
      <div data-identity="f1"><div class="fragment" style="border: 1px solid rgb(1, 2, 3)">
        <div class="header">alt</div><div class="block"></div>
      </div></div>`;
    const frag = root.querySelector<HTMLElement>(".fragment")!;
    const header = root.querySelector<HTMLElement>(".header")!;
    const block = root.querySelector<HTMLElement>(".block")!;
    frag.animate = vi.fn() as never;
    header.animate = vi.fn() as never;
    block.animate = vi.fn() as never;
    const original = Element.prototype.animate;
    const svgAnimate = vi.fn(() => ({}) as Animation);
    Element.prototype.animate = svgAnimate as never;
    const { elements } = measure(root);
    play(
      reveal("s:f1"),
      elements,
      root,
      measure(document.createElement("div")),
    );
    // The header fills from left to right over D.
    expect(header.animate).toHaveBeenCalledWith(
      [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
      { duration: 200, delay: 20, easing: "ease-out", fill: "backwards" },
    );
    // Then a pen traces the border over 1.5 D; the real border is hidden
    // from the start until the pen is done.
    expect(svgAnimate).toHaveBeenCalledWith(
      [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
      { duration: 300, delay: 220, easing: "ease-in-out", fill: "backwards" },
    );
    const [frames, timing] = (frag.animate as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(frames[0]).toMatchObject({ borderColor: "transparent" });
    expect(timing).toMatchObject({ delay: 20, duration: 500 });
    expect(root.querySelector('[data-writing-stroke="s:f1"]')).not.toBeNull();
    Element.prototype.animate = original;
    root.remove();
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

  it("lets an arrow head ride on to its receiver", () => {
    const root = document.createElement("div");
    root.innerHTML = `<div data-identity="m1"></div>`;
    const el = root.firstElementChild as HTMLElement;
    const head = fake({ translate: "-80px 0px" });
    el.getAnimations = (() => [head]) as never;
    settle(root, new Map([["s:m1", el]]));
    expect(head.finish).not.toHaveBeenCalled();
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

  it("follows a fragment's stroke to the fragment's new place and size", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    root.innerHTML = `<div data-identity="f1"><div class="fragment" style="border: 1px solid red"><div class="header"></div></div></div>`;
    const frag = root.querySelector<HTMLElement>(".fragment")!;
    const original = Element.prototype.animate;
    Element.prototype.animate = vi.fn(() => ({}) as Animation) as never;
    const { elements } = measure(root);
    play(
      {
        moves: [],
        reveals: [{ key: "s:f1", delay: 0, duration: 200 }],
        removals: [],
      },
      elements,
      root,
      measure(document.createElement("div")),
    );
    frag.getBoundingClientRect = () =>
      ({ left: 30, top: 50, width: 120, height: 60 }) as DOMRect;
    const next = measure(root);
    followStrokes(root, next.boxes, next.elements);
    const stroke = root.querySelector<SVGElement>("[data-writing-stroke]")!;
    expect(stroke.style.left).toBe("30px");
    expect(stroke.style.top).toBe("50px");
    expect(stroke.getAttribute("width")).toBe("120");
    expect(stroke.querySelector("rect")!.getAttribute("height")).toBe("59");
    Element.prototype.animate = original;
    root.remove();
  });

  it("removes a pen stroke whose participant is gone", () => {
    const root = document.createElement("div");
    root.innerHTML = `<svg data-writing-stroke="p:A"></svg>`;
    followStrokes(root, new Map(), new Map());
    expect(root.querySelector("[data-writing-stroke]")).toBeNull();
  });
});
