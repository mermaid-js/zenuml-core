import { atom, type Atom } from "jotai";
import {
  createMessageDragAtom,
  enableParticipantStyleEditingAtom,
  messageReorderDragAtom,
  messageReorderDropAtom,
  messageReorderPendingAtom,
  modeAtom,
  RenderMode,
  selectedAtom,
  textEditingAtom,
} from "@/store/Store";
import {
  can,
  type Capability,
  type InteractionState,
  type MenuState,
} from "./policy";

/**
 * The open menu, stored (ADR 0002, P2). At most one menu is open per
 * diagram: entering a menu replaces whichever menu was open (R1). Write it
 * only through `enterMenuAtom` / `exitMenuAtom`.
 */
export const openMenuAtom = atom<MenuState | null>(null);

/** Open `menu`; the menu that was open, if any, closes (R1). */
export const enterMenuAtom = atom(null, (_get, set, menu: MenuState) => {
  set(openMenuAtom, menu);
});

export type MenuRef = { kind: "messageMenu" } | { kind: "gapMenu"; id: string };

/**
 * Close `menu` if it is the open one. An owner closing a menu that another
 * owner has since replaced must not close the newer menu.
 */
export const exitMenuAtom = atom(null, (get, set, menu: MenuRef) => {
  const open = get(openMenuAtom);
  if (!open || open.kind !== menu.kind) return;
  if (open.kind === "gapMenu" && menu.kind === "gapMenu" && open.id !== menu.id)
    return;
  set(openMenuAtom, null);
});

/**
 * The primary state derived from the atoms that already hold it (P1): drags
 * and the participant editor. `null` when none of them owns the diagram.
 *
 * Order matters: an occurrence create-drag also selects its participant, so
 * drags win over selection.
 */
export const derivedInteractionAtom = atom<InteractionState | null>((get) => {
  const createDrag = get(createMessageDragAtom);
  if (createDrag) return { kind: "createDrag", source: createDrag.source };

  const reorderKey =
    get(messageReorderDragAtom) ?? get(messageReorderPendingAtom)?.key;
  if (reorderKey) return { kind: "reorderDrag", key: reorderKey };

  const selected = get(selectedAtom);
  if (get(enableParticipantStyleEditingAtom) && selected.length === 1) {
    return { kind: "participantEditor", participant: selected[0] };
  }
  return null;
});

/**
 * The diagram's primary interaction state.
 *
 * Drags and the participant editor are derived (`derivedInteractionAtom`).
 * Open menus are stored in `openMenuAtom` (P2). A selected message whose menu
 * is closed is idle. A derived state wins over a stored menu; from P3 the
 * `InteractionController` also drops that menu (`yieldMenuAtom`), so it does
 * not come back when the derived state ends.
 */
export const interactionAtom = atom<InteractionState>(
  (get) => get(derivedInteractionAtom) ?? get(openMenuAtom) ?? { kind: "idle" },
);

/**
 * R1 for derived states (P3): entering a drag or the participant editor exits
 * the stored menu in the model, whichever code path entered it.
 */
export const yieldMenuAtom = atom(null, (get, set) => {
  if (get(derivedInteractionAtom) && get(openMenuAtom)) set(openMenuAtom, null);
});

/**
 * Exit `state` in the model, if it is still the current state. This atom
 * only writes the atoms that hold the state; owners that need side effects
 * on exit (keep a selection, schedule a reselect) register an exit listener
 * with `useInteractionExit`.
 */
export const exitInteractionAtom = atom(
  null,
  (get, set, state: InteractionState) => {
    const current = get(interactionAtom);
    if (current.kind !== state.kind) return;
    switch (current.kind) {
      case "participantEditor":
        set(selectedAtom, []);
        break;
      case "messageMenu":
      case "gapMenu":
        set(openMenuAtom, null);
        break;
      case "createDrag":
        // The drag selected its source participant; cancelling drops both.
        set(createMessageDragAtom, null);
        set(selectedAtom, []);
        break;
      case "reorderDrag":
        set(messageReorderPendingAtom, null);
        set(messageReorderDragAtom, null);
        set(messageReorderDropAtom, null);
        break;
    }
  },
);

/**
 * The state whose own UI shows (P4): the participant editor, a menu or a
 * drag's preview. `null` while idle, in `RenderMode.Static`, and while a text
 * edit overlays the state (the state stays; its UI comes back when the edit
 * ends). A surface reads this instead of combining the atoms itself.
 */
export const activeSurfaceAtom = atom<InteractionState | null>((get) => {
  if (get(modeAtom) !== RenderMode.Dynamic || get(textEditingAtom)) return null;
  const state = get(interactionAtom);
  return state.kind === "idle" ? null : state;
});

const canAtoms = new Map<Capability, Atom<boolean>>();

/** `can(cap)` for the diagram that owns the Jotai store. */
export const canAtom = (cap: Capability): Atom<boolean> => {
  let a = canAtoms.get(cap);
  if (!a) {
    a = atom((get) =>
      can(get(interactionAtom), cap, {
        mode: get(modeAtom),
        textEditing: get(textEditingAtom),
      }),
    );
    canAtoms.set(cap, a);
  }
  return a;
};
