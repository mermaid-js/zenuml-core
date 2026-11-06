import { useCallback, useLayoutEffect, useRef, useState } from "react";

export type PopoverPresenceState = "enter" | "exit";

/**
 * Keeps a conditionally rendered popover mounted while its exit animation
 * plays (ADR 0003, P2).
 *
 * `open` is the intent; render the popover while `mounted` is true and give its
 * root `ref` and `className`. While open the root carries `zu-pop-enter`
 * (200 ms, `--zu-dur-base`); the first render after `open` turns false carries
 * `zu-pop-exit` (120 ms, `--zu-dur-snap`), and the popover unmounts when that
 * animation ends.
 *
 * The exit length is read from the element's computed `--zu-dur-snap`, so a
 * host that zeroes the duration (reduced motion, P3's `data-reduce-motion`)
 * unmounts before the next paint, and jsdom, which resolves no custom
 * property, keeps the synchronous unmount the unit tests rely on.
 */
export function usePopoverPresence(open: boolean) {
  const [mounted, setMounted] = useState(open);
  // Derived during render, so the enter frame and the exit class both land
  // in the same commit as the state change that caused them.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setMounted(true);
  }
  const isMounted = mounted || open;
  const state: PopoverPresenceState = open ? "enter" : "exit";

  const nodeRef = useRef<HTMLElement | null>(null);
  const ref = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node;
  }, []);

  useLayoutEffect(() => {
    if (open || !isMounted) return;
    const node = nodeRef.current;
    const ms = node ? exitDurationMs(node) : 0;
    if (ms <= 0) {
      setMounted(false);
      return;
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setMounted(false);
    };
    // The timer backs up `animationend`, which never fires when the element
    // is hidden or its animation is cancelled by a style change.
    const timer = setTimeout(finish, ms + 50);
    node?.addEventListener("animationend", finish, { once: true });
    return () => {
      clearTimeout(timer);
      node?.removeEventListener("animationend", finish);
    };
  }, [open, isMounted]);

  return {
    mounted: isMounted,
    state,
    ref,
    className: state === "exit" ? "zu-pop-exit" : "zu-pop-enter",
  };
}

/** `--zu-dur-snap` of the element in milliseconds; 0 when unknown. */
export function exitDurationMs(node: Element): number {
  if (typeof getComputedStyle !== "function") return 0;
  const raw = getComputedStyle(node).getPropertyValue("--zu-dur-snap").trim();
  if (!raw) return 0;
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return 0;
  return raw.endsWith("ms") ? n : n * 1000;
}
