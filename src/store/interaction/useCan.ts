import { useAtomValue } from "jotai";
import { useRef } from "react";
import { canAtom } from "./interactionAtom";
import type { Capability } from "./policy";

/**
 * Render gate (ADR 0002, gate A): whether the diagram's current interaction
 * state allows `cap`. Callers still AND their own embedder flag.
 */
export const useCan = (cap: Capability): boolean => useAtomValue(canAtom(cap));

/**
 * Gate a click-activated control on the state at the moment of the press.
 *
 * A press outside the participant editor closes it on `pointerdown`, before
 * `click` fires; checking `can` at click time would let that same press also
 * run the control. Spread `pressProps` on an element that contains the click
 * target.
 */
export const useCapClick = (cap: Capability, onClick?: () => void) => {
  const allowed = useCan(cap);
  const pressAllowed = useRef<boolean | null>(null);
  return {
    allowed,
    pressProps: {
      onPointerDown: () => {
        pressAllowed.current = allowed;
      },
    },
    onClick: () => {
      const ok = pressAllowed.current ?? allowed;
      pressAllowed.current = null;
      if (ok && allowed) onClick?.();
    },
  };
};
