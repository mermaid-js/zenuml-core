import { useAtomValue } from "jotai";
import { type RefObject, useLayoutEffect, useRef } from "react";
import { writingMotionActiveAtom, writingStrokeAtom } from "@/store/Store";
import { planMotion, type Box, type MotionPlan } from "./motion";

/** FLIP: a kept element eases from its old place in this many ms. */
const GLIDE_MS = 110;
/** A new participant's label is written over this share of D ... */
const LABEL_SHARE = 0.6;
/** ... then a pen traces its border, starting at this share of D, for D. */
const STROKE_AT = 0.4;

const SVG = "http://www.w3.org/2000/svg";

/** Each pen stroke's traced element, so a later frame can follow it. */
const traced = new WeakMap<Element, HTMLElement>();

/** Places a pen stroke over `el`, relative to `root`. */
function place(svg: SVGElement, el: HTMLElement, root: HTMLElement) {
  const origin = root.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  svg.setAttribute("width", String(r.width));
  svg.setAttribute("height", String(r.height));
  svg.style.left = `${r.left - origin.left}px`;
  svg.style.top = `${r.top - origin.top}px`;
  const rect = svg.querySelector("rect");
  const stroke = Number(rect?.getAttribute("stroke-width")) || 1;
  rect?.setAttribute("width", String(Math.max(0, r.width - stroke)));
  rect?.setAttribute("height", String(Math.max(0, r.height - stroke)));
}

/**
 * Traces `el`'s border with a pen stroke over the new frame, then removes the
 * stroke. The real border is hidden from `start` until the stroke ends.
 */
function trace(
  key: string,
  el: HTMLElement,
  root: HTMLElement,
  start: number,
  delay: number,
  duration: number,
) {
  const css = getComputedStyle(el);
  const width = parseFloat(css.borderTopWidth) || 1;
  const color = css.borderTopColor || "currentColor";
  const radius = parseFloat(css.borderTopLeftRadius) || 0;
  const svg = document.createElementNS(SVG, "svg");
  // Tagged with its key, so a later frame can move it (followStrokes).
  svg.setAttribute("data-writing-stroke", key);
  traced.set(svg, el);
  Object.assign(svg.style, {
    position: "absolute",
    overflow: "visible",
    pointerEvents: "none",
    // Above the participant layer, which would hide the stroke's edges.
    zIndex: "50",
  });
  const rect = document.createElementNS(SVG, "rect");
  const half = width / 2;
  rect.setAttribute("x", String(half));
  rect.setAttribute("y", String(half));
  rect.setAttribute("rx", String(radius));
  rect.setAttribute("fill", "none");
  rect.setAttribute("stroke", color);
  rect.setAttribute("stroke-width", String(width));
  rect.setAttribute("pathLength", "1");
  rect.setAttribute("stroke-dasharray", "1");
  rect.setAttribute("stroke-dashoffset", "1");
  svg.appendChild(rect);
  place(svg, el, root);
  root.appendChild(svg);
  const end = delay + duration;
  el.animate([{ borderColor: "transparent" }, { borderColor: "transparent" }], {
    duration: end - start,
    delay: start,
    fill: "backwards",
  });
  const pen =
    typeof rect.animate === "function"
      ? rect.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
          duration,
          delay,
          easing: "ease-in-out",
          fill: "backwards",
        })
      : null;
  const drop = () => svg.remove();
  if (pen) {
    pen.onfinish = drop;
    pen.oncancel = drop;
  } else drop();
}

const PARTICIPANT = "[data-participant-id]";
const STATEMENT = "[data-identity]";

interface Measured {
  boxes: Map<string, Box>;
  elements: Map<string, HTMLElement>;
  sizes: Map<string, { w: number; h: number }>;
}

/** Keyed elements of the diagram and where each one is, relative to `root`. */
export function measure(root: HTMLElement): Measured {
  const origin = root.getBoundingClientRect();
  const boxes = new Map<string, Box>();
  const elements = new Map<string, HTMLElement>();
  const sizes = new Map<string, { w: number; h: number }>();
  const add = (key: string, el: HTMLElement, box: Omit<Box, "x" | "y">) => {
    if (boxes.has(key)) return;
    const r = el.getBoundingClientRect();
    boxes.set(key, { ...box, x: r.left - origin.left, y: r.top - origin.top });
    elements.set(key, el);
    sizes.set(key, { w: r.width, h: r.height });
  };
  root.querySelectorAll<HTMLElement>(PARTICIPANT).forEach((el) => {
    add(`p:${el.dataset.participantId}`, el, {
      kind: "participant",
      parent: null,
    });
  });
  root.querySelectorAll<HTMLElement>(STATEMENT).forEach((el) => {
    const up = el.parentElement?.closest<HTMLElement>(STATEMENT);
    add(`s:${el.dataset.identity}`, el, {
      kind: "statement",
      parent: up && root.contains(up) ? `s:${up.dataset.identity}` : null,
    });
  });
  return { boxes, elements, sizes };
}

/**
 * Plays a plan with the Web Animations API: paint only, nothing left behind.
 * A removed element fades as a detached copy over the new frame, placed where
 * it was, and is taken out when the fade ends.
 */
export function play(
  plan: MotionPlan,
  elements: Map<string, HTMLElement>,
  root: HTMLElement,
  previous: Measured,
) {
  for (const { key, duration } of plan.removals) {
    const old = previous.elements.get(key);
    const box = previous.boxes.get(key);
    const size = previous.sizes.get(key);
    if (!old || !box || !size || old.isConnected) continue;
    const ghost = old.cloneNode(true) as HTMLElement;
    ghost.setAttribute("data-writing-ghost", "");
    ghost.removeAttribute("data-identity");
    ghost.removeAttribute("data-participant-id");
    Object.assign(ghost.style, {
      position: "absolute",
      left: `${box.x}px`,
      top: `${box.y}px`,
      width: `${size.w}px`,
      height: `${size.h}px`,
      margin: "0",
      pointerEvents: "none",
    });
    root.appendChild(ghost);
    const fade = ghost.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration,
      easing: "linear",
    });
    const drop = () => ghost.remove();
    fade.onfinish = drop;
    fade.oncancel = drop;
  }
  const linesOf = (key: string) => {
    const name = key.slice(2);
    const lines: Element[] = [];
    if (!key.startsWith("p:")) return lines;
    root.querySelectorAll<HTMLElement>("[data-lifeline-id]").forEach((life) => {
      if (life.dataset.lifelineId === name) {
        lines.push(...life.querySelectorAll(".line"));
      }
    });
    return lines;
  };
  for (const { key, dx, dy } of plan.moves) {
    // A participant's lifeline is a separate element: it glides with the box.
    for (const el of [elements.get(key), ...linesOf(key)]) {
      el?.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
        { duration: GLIDE_MS, easing: "ease-out" },
      );
    }
  }
  const wipe = (
    el: Element | null | undefined,
    delay: number,
    duration: number,
  ) =>
    el?.animate(
      [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
      { duration, delay, easing: "linear", fill: "backwards" },
    );
  for (const { key, delay, duration } of plan.reveals) {
    const el = elements.get(key);
    if (!key.startsWith("p:")) {
      if (
        !el ||
        !(
          drawArrow(el, delay, duration) ||
          drawFragment(key, el, root, delay, duration)
        )
      ) {
        wipe(el, delay, duration);
      }
      continue;
    }
    // Like handwriting: the name is written first, then a pen draws the
    // border around it. The label is the box's last child.
    wipe(el?.lastElementChild, delay, Math.round(LABEL_SHARE * duration));
    const strokeAt = delay + Math.round(STROKE_AT * duration);
    if (el) trace(key, el, root, delay, strokeAt, duration);
    // The lifeline draws down from the box once the border is closed.
    for (const line of linesOf(key)) {
      line.animate(
        [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)" }],
        {
          duration,
          delay: strokeAt + duration,
          easing: "ease-out",
          fill: "backwards",
        },
      );
    }
  }
}

const clipFrom = (side: "left" | "right" | "top") => ({
  clipPath:
    side === "left"
      ? "inset(0 100% 0 0)"
      : side === "right"
        ? "inset(0 0 0 100%)"
        : "inset(0 0 100% 0)",
});
const CLIP_NONE = { clipPath: "inset(0 0 0 0)" };

/** Share of D after which a new message's label starts to be written. */
const LABEL_AT = 0.5;
/** Share of D after which the rest of a new interaction fades in. */
const ARRIVE_AT = 0.8;
/** A fragment's pen stroke runs this many times D, after the header. */
const FRAME_TRACE = 1.5;

/**
 * A new message: the line grows from the sender over D and the head rides on
 * its tip; the label is written from half way, and the rest of the
 * interaction (its occurrence, its nested statements) appears as the arrow
 * arrives. The head moves with `translate`, not `transform`, so `settle`
 * does not take it for a glide. Returns false when `el` is not a message.
 */
function drawArrow(el: HTMLElement, delay: number, duration: number) {
  const message = el.querySelector<HTMLElement>(
    ":scope > .interaction > .message",
  );
  const [line, head] = message
    ? [...message.querySelectorAll<SVGElement>(":scope > svg")]
    : [];
  if (!message || !line || !head) return false;
  const toRight = head.classList.contains("right-0");
  const reach = Math.max(0, message.getBoundingClientRect().width - 8);
  const from = toRight ? -reach : reach;
  line.animate([clipFrom(toRight ? "left" : "right"), CLIP_NONE], {
    duration,
    delay,
    easing: "ease-out",
    fill: "backwards",
  });
  head.animate(
    [
      { translate: `${from}px 0px`, opacity: 0, offset: 0 },
      { translate: `${from * 0.9}px 0px`, opacity: 1, offset: 0.1 },
      { translate: "0px 0px", opacity: 1 },
    ],
    { duration, delay, easing: "ease-out", fill: "backwards" },
  );
  message
    .querySelector(":scope > .name")
    ?.animate([clipFrom("left"), CLIP_NONE], {
      duration: Math.round(LABEL_SHARE * duration),
      delay: delay + Math.round(LABEL_AT * duration),
      easing: "linear",
      fill: "backwards",
    });
  message
    .querySelector(":scope > .message-number")
    ?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: Math.round(0.4 * duration),
      delay,
      easing: "linear",
      fill: "backwards",
    });
  message.parentElement
    ?.querySelectorAll(":scope > :not(.message)")
    .forEach((rest) =>
      rest.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: Math.round(0.4 * duration),
        delay: delay + Math.round(ARRIVE_AT * duration),
        easing: "linear",
        fill: "backwards",
      }),
    );
  return true;
}

/**
 * A new fragment: its header fills from left to right over D, then a pen
 * traces the border over 1.5 D. Its contents appear with the pen. Returns
 * false when `el` is not a fragment.
 */
function drawFragment(
  key: string,
  el: HTMLElement,
  root: HTMLElement,
  delay: number,
  duration: number,
) {
  const frag = el.querySelector<HTMLElement>(":scope > .fragment");
  if (!frag) return false;
  frag
    .querySelector(":scope > .header")
    ?.animate([clipFrom("left"), CLIP_NONE], {
      duration,
      delay,
      easing: "ease-out",
      fill: "backwards",
    });
  frag.querySelectorAll(":scope > :not(.header)").forEach((rest) =>
    rest.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration,
      delay: delay + duration,
      easing: "linear",
      fill: "backwards",
    }),
  );
  trace(
    key,
    frag,
    root,
    delay,
    delay + duration,
    Math.round(FRAME_TRACE * duration),
  );
  return true;
}

const isGlide = (a: Animation) =>
  (a.effect as KeyframeEffect | null)
    ?.getKeyframes?.()
    .some((k) => "transform" in k) ?? false;

/**
 * Before a new frame is measured: finish glides, which would distort the
 * measurement, and drop fading ghosts of removed elements. Reveals and pen
 * strokes are paint only, so they run on: a frame every keystroke must not
 * cut off a participant that is still being drawn.
 */
export function settle(root: HTMLElement, elements: Map<string, HTMLElement>) {
  for (const node of elements.values()) {
    node
      .getAnimations?.({ subtree: true })
      .forEach((a) => isGlide(a) && a.finish());
  }
  root
    .querySelectorAll<HTMLElement>("[data-writing-ghost]")
    .forEach((g) => g.remove());
}

/**
 * After a new frame is measured: a pen stroke still drawing follows its
 * participant to its new place; a stroke whose participant is gone is removed,
 * and the participant's hidden border with it.
 */
export function followStrokes(
  root: HTMLElement,
  boxes: Map<string, Box>,
  elements: Map<string, HTMLElement>,
) {
  root.querySelectorAll<SVGElement>("[data-writing-stroke]").forEach((svg) => {
    const key = svg.getAttribute("data-writing-stroke") ?? "";
    const box = boxes.get(key);
    if (!box || !elements.has(key)) {
      svg.remove();
      return;
    }
    // A fragment's stroke traces the fragment inside its statement: follow
    // that element, size included, while it is still on the page.
    const target = traced.get(svg);
    if (target && key.startsWith("s:")) {
      if (target.isConnected) place(svg, target, root);
      else svg.remove();
      return;
    }
    svg.style.left = `${box.x}px`;
    svg.style.top = `${box.y}px`;
  });
}

const empty = (): Measured => ({
  boxes: new Map(),
  elements: new Map(),
  sizes: new Map(),
});

const reducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Writing-time motion for one diagram (ADR 0009, Decision 4). After each
 * commit of a new frame, kept elements glide from their old place and new
 * ones are revealed. Off unless `writingMotionActiveAtom` holds; reduced
 * motion is read on every frame and skips the motion.
 */
export function useWritingMotion(
  root: RefObject<HTMLElement | null>,
  frame: unknown,
) {
  const active = useAtomValue(writingMotionActiveAtom);
  const stroke = useAtomValue(writingStrokeAtom);
  const last = useRef<Measured>(empty());
  // The first frame after mount (or after motion turns on) is measured only:
  // a diagram that loads is not written. An empty frame after it is real, so
  // what appears on an empty diagram is revealed.
  const primed = useRef(false);

  useLayoutEffect(() => {
    const el = root.current;
    if (!active || !el) {
      last.current = empty();
      primed.current = false;
      return;
    }
    settle(el, last.current.elements);
    const next = measure(el);
    followStrokes(el, next.boxes, next.elements);
    if (
      primed.current &&
      !reducedMotion() &&
      typeof el.animate === "function"
    ) {
      play(
        planMotion(last.current.boxes, next.boxes, stroke),
        next.elements,
        el,
        last.current,
      );
    }
    last.current = next;
    primed.current = true;
    // `frame` is the parse the diagram draws: one plan per committed frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame, active]);
}
