import { useAtomValue } from "jotai";
import { useRef } from "react";
import { canAtom, interactionAtom } from "./interactionAtom";
import type { Capability } from "./policy";

/**
 * Render gate (ADR 0002, gate A): whether the diagram's current interaction
 * state allows `cap`. Callers still AND their own embedder flag.
 */
export const useCan = (cap: Capability): boolean => useAtomValue(canAtom(cap));

/**
 * `reorder` for one message. While the message menu is open, only the
 * selected message (the one the menu belongs to) can be reordered.
 */
export const useCanReorderMessage = (isSelected: boolean): boolean => {
  const canReorder = useCan("reorder");
  const kind = useAtomValue(interactionAtom).kind;
  return canReorder && (kind !== "messageMenu" || isSelected);
};

/**
 * Gate a click-activated control on the state at the moment of the press.
 *
 * Spread `pressProps` on an element that contains the click target. It
 * declares the capability (`data-cap`) for the input gate (gate B), which
 * consumes a press — and its click — that the primary state does not allow.
 *
 * The press-time record covers the text-edit overlay, which gate B leaves
 * alone: a press outside an active label editor ends the edit on blur,
 * before `click` fires, so checking `can` at click time would let that same
 * press also run the control.
 */
export const useCapClick = (cap: Capability, onClick?: () => void) => {
  const allowed = useCan(cap);
  const pressAllowed = useRef<boolean | null>(null);
  return {
    allowed,
    pressProps: {
      "data-cap": cap,
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
