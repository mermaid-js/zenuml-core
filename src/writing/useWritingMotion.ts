import { useAtomValue } from "jotai";
import { type RefObject, useLayoutEffect, useRef } from "react";
import { writingMotionActiveAtom, writingStrokeAtom } from "@/store/Store";
import { planMotion, type Box, type MotionPlan } from "./motion";

/** FLIP: a kept element eases from its old place in this many ms. */
const GLIDE_MS = 110;

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
  for (const { key, dx, dy } of plan.moves) {
    elements
      .get(key)
      ?.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
        { duration: GLIDE_MS, easing: "ease-out" },
      );
  }
  for (const { key, delay, duration } of plan.reveals) {
    elements
      .get(key)
      ?.animate(
        [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
        { duration, delay, easing: "linear", fill: "backwards" },
      );
  }
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

  useLayoutEffect(() => {
    const el = root.current;
    if (!active || !el) {
      last.current = empty();
      return;
    }
    // A new frame ends any motion in progress at its final state.
    for (const node of last.current.elements.values()) {
      node.getAnimations?.().forEach((a) => a.finish());
    }
    el.querySelectorAll<HTMLElement>("[data-writing-ghost]").forEach((g) =>
      g.remove(),
    );
    const next = measure(el);
    if (!reducedMotion() && typeof el.animate === "function") {
      play(
        planMotion(last.current.boxes, next.boxes, stroke),
        next.elements,
        el,
        last.current,
      );
    }
    last.current = next;
    // `frame` is the parse the diagram draws: one plan per committed frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame, active]);
}
