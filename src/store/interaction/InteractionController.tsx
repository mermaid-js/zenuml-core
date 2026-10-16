import {
  diagramElementAtom,
  modeAtom,
  selectedAtom,
  selectedMessageAtom,
  textEditingAtom,
} from "@/store/Store";
import { useStore } from "jotai";
import { useEffect } from "react";
import {
  derivedInteractionAtom,
  exitInteractionAtom,
  interactionAtom,
  yieldMenuAtom,
} from "./interactionAtom";
import {
  CAPABILITIES,
  can,
  type Capability,
  type InteractionState,
} from "./policy";
import { type ExitCause, exitListenersOf } from "./useInteractionExit";

/** States a press can leave. A drag holds the pointer; only Escape ends it. */
const PRESS_EXITS: ReadonlySet<InteractionState["kind"]> = new Set([
  "participantEditor",
  "messageMenu",
  "gapMenu",
]);

const isCapability = (value: string | null): value is Capability =>
  !!value && (CAPABILITIES as readonly string[]).includes(value);

const surfaceSelector = (state: InteractionState) =>
  `[data-interaction-surface="${state.kind}"]`;

/**
 * A consumed press must not act through its follow-up events either:
 * `preventDefault` on `pointerdown` does not cancel `click` or `contextmenu`.
 * Swallow them until the press ends.
 */
const swallowFollowUps = () => {
  const swallow = (event: Event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.type === "click") cleanup();
  };
  const afterPointerUp = () => window.setTimeout(cleanup, 0);
  const cleanup = () => {
    document.removeEventListener("click", swallow, true);
    document.removeEventListener("contextmenu", swallow, true);
    window.removeEventListener("pointerup", afterPointerUp, true);
    window.removeEventListener("pointercancel", cleanup, true);
  };
  document.addEventListener("click", swallow, true);
  document.addEventListener("contextmenu", swallow, true);
  window.addEventListener("pointerup", afterPointerUp, {
    capture: true,
    once: true,
  });
  window.addEventListener("pointercancel", cleanup, {
    capture: true,
    once: true,
  });
};

/**
 * The interaction state's input handling (ADR 0002, P3). Mount once per
 * diagram, inside its Jotai `Provider`.
 *
 * - **Gate B and click-away.** One capture-phase `pointerdown` listener on
 *   `document`. A press inside the active surface of the current state does
 *   nothing here. Any other press exits the state. When the press lands in
 *   the diagram on a target whose `data-cap` the state does not allow, it is
 *   also consumed (R2): the target does not act on this press.
 * - **Escape.** One bubble-phase `keydown` listener on `document`, so an
 *   inner handler that stops the event (a picker, a text editor) keeps it.
 * - **R1 for derived states.** A drag or the participant editor drops a
 *   stored menu (`yieldMenuAtom`).
 */
export const InteractionController = () => {
  const store = useStore();

  useEffect(() => {
    const exit = (state: InteractionState, cause: ExitCause) => {
      for (const listener of [...exitListenersOf(store)])
        listener(state, cause);
      store.set(exitInteractionAtom, state);
    };

    // A selected message outlives its closed menu. A press anywhere but on
    // that message or in its menu clears it; a press on the message keeps it
    // so that its label can take the click into editing.
    const clearMessageSelectionOutside = (target: Element | null) => {
      if (!store.get(selectedMessageAtom)) return;
      if (target?.closest('[data-interaction-surface="messageMenu"]')) return;
      const message = target?.closest(".message[data-selected='true']");
      if (message && store.get(diagramElementAtom)?.contains(message)) return;
      store.set(selectedMessageAtom, null);
    };

    // A participant highlight that is not the participant editor (the editor
    // flag is off, or several participants are highlighted) is not a primary
    // state. A press on the diagram outside participants and messages clears
    // it. The editor's exit and a drag own their selection, so they are left
    // alone. This replaces `SeqDiagram`'s root `onClick` (P4).
    const clearParticipantHighlightOutside = (target: Element | null) => {
      if (store.get(selectedAtom).length === 0) return;
      if (store.get(derivedInteractionAtom)) return;
      if (!target || !store.get(diagramElementAtom)?.contains(target)) return;
      if (target.closest(".participant, .interaction")) return;
      store.set(selectedAtom, []);
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      clearMessageSelectionOutside(target);
      clearParticipantHighlightOutside(target);
      // A text edit nests inside the state: the press ends the edit (blur)
      // and nothing else.
      if (store.get(textEditingAtom)) return;
      const state = store.get(interactionAtom);
      if (!PRESS_EXITS.has(state.kind)) return;
      if (target?.closest(surfaceSelector(state))) return;

      const diagram = store.get(diagramElementAtom);
      const capTarget = target?.closest("[data-cap]");
      const cap =
        capTarget && diagram?.contains(capTarget)
          ? capTarget.getAttribute("data-cap")
          : null;
      // The text-edit overlay is not gated here: ending an edit needs the
      // focus change that a consumed press would prevent.
      if (
        isCapability(cap) &&
        !can(state, cap, { mode: store.get(modeAtom), textEditing: false })
      ) {
        event.preventDefault();
        event.stopPropagation();
        swallowFollowUps();
      }

      // Commit a focused draft in the closing surface while its owner still
      // sees the state; a consumed press would not move the focus.
      const active = document.activeElement;
      if (
        active instanceof HTMLElement &&
        active.closest(surfaceSelector(state))
      )
        active.blur();

      exit(state, { type: "press", target });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // The text editor owns Escape while it is active.
      if (store.get(textEditingAtom)) return;
      const state = store.get(interactionAtom);
      if (state.kind !== "idle") exit(state, { type: "escape" });
      // A selected message outlives its closed menu; Escape clears it.
      if (store.get(selectedMessageAtom)) store.set(selectedMessageAtom, null);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    store.set(yieldMenuAtom);
    const unsubscribe = store.sub(derivedInteractionAtom, () =>
      store.set(yieldMenuAtom),
    );
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
      unsubscribe();
    };
  }, [store]);

  return null;
};
