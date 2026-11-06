import { useEffect, useRef } from "react";
import { useInteractionExit } from "@/store/interaction/useInteractionExit";

/**
 * Press-following for the participant editor (ADR 0002): a press on a
 * participant box whose node a commit replaces is turned into a selection on
 * `pointerup`. Returns the `setSelected` the editor uses, which cancels any
 * press being followed first.
 */
export function useFollowPress({
  diagramElement,
  isOpen,
  participantName,
  selected,
  setSelected: setSelectedRaw,
}: {
  diagramElement: HTMLElement | null;
  isOpen: boolean;
  participantName: string | null;
  selected: string[];
  setSelected: (next: string[]) => void;
}) {
  // Outside click on a participant: the panel may re-render the diagram and
  // detach the clicked node before its click event fires, so the reselection
  // is deferred to pointerup and cancelled by any later interaction.
  const interactionTokenRef = useRef(0);
  const cancelPendingRef = useRef<(() => void) | null>(null);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const diagramElementRef = useRef(diagramElement);
  diagramElementRef.current = diagramElement;
  const cancelPending = () => {
    interactionTokenRef.current++;
    cancelPendingRef.current?.();
    cancelPendingRef.current = null;
  };
  const setSelected = (next: string[]) => {
    cancelPending();
    setSelectedRaw(next);
  };
  useEffect(() => () => cancelPendingRef.current?.(), []);

  // A press on a participant box can commit a focused draft (the focus
  // change blurs the field), and the commit can re-render the diagram and
  // replace the node under the pointer, which drops the click that would
  // select it. Follow that one press to its end and select the participant
  // on pointerup when its node was replaced; a node that survived gets its
  // own click, and selecting here too would toggle it back off.
  const followPress = (target: Element | null, hit: string) => {
    cancelPending();
    const token = ++interactionTokenRef.current;
    const onUp = () => {
      const current = interactionTokenRef.current === token;
      cancelPending();
      if (
        current &&
        selectedRef.current[0] !== hit &&
        !target?.isConnected &&
        diagramElementRef.current?.querySelector(
          `[data-participant-id="${hit}"]`,
        )
      ) {
        setSelectedRaw([hit]);
      }
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") cancelPending();
    };
    // These follow one press to its end; they are not click-away or Escape
    // handlers for the editor.
    document.addEventListener("pointerup", onUp, true);
    document.addEventListener("pointercancel", cancelPending, true);
    document.addEventListener("keydown", onKey, true);
    cancelPendingRef.current = () => {
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("pointercancel", cancelPending, true);
      document.removeEventListener("keydown", onKey, true);
    };
  };
  const participantOf = (target: Element | null) =>
    target
      ?.closest?.("[data-participant-id]")
      ?.getAttribute("data-participant-id") ?? null;

  // Click-away and Escape are the interaction state's (ADR 0002, P3): it
  // blurs a focused draft here first, so the draft commits for the
  // participant it belongs to, then clears the selection. A draft that fails
  // validation is discarded: closing the panel resets every draft and error
  // from the committed declaration.
  useInteractionExit((state, cause) => {
    if (state.kind !== "participantEditor" || cause.type !== "press") return;
    cancelPending();
    const hit = participantOf(cause.target);
    if (hit) followPress(cause.target, hit);
  });

  // A press on another participant no longer exits the editor (ADR 0002,
  // 2026-10-20): the click switches it. The press still needs following for
  // the replaced-node case above.
  const participantNameRef = useRef(participantName);
  participantNameRef.current = participantName;
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const hit = participantOf(target);
      if (!hit || hit === participantNameRef.current) return;
      if (!diagramElementRef.current?.contains(target)) return;
      followPress(target, hit);
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
    // followPress reads refs only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return { setSelected };
}
