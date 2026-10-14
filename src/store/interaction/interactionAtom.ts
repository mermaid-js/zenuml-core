import { atom, type Atom } from "jotai";
import {
  createMessageDragAtom,
  enableParticipantStyleEditingAtom,
  messageReorderDragAtom,
  messageReorderPendingAtom,
  modeAtom,
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
 * The diagram's primary interaction state.
 *
 * Drags and the participant editor are derived from the atoms that already
 * hold them (P1). Open menus are stored in `openMenuAtom` (P2). A selected
 * message whose menu is closed is idle. Order matters: an occurrence
 * create-drag also selects its participant, so drags win over selection, and
 * a stored menu yields to any derived state.
 */
export const interactionAtom = atom<InteractionState>((get) => {
  const createDrag = get(createMessageDragAtom);
  if (createDrag) return { kind: "createDrag", source: createDrag.source };

  const reorderKey =
    get(messageReorderDragAtom) ?? get(messageReorderPendingAtom)?.key;
  if (reorderKey) return { kind: "reorderDrag", key: reorderKey };

  const selected = get(selectedAtom);
  if (get(enableParticipantStyleEditingAtom) && selected.length === 1) {
    return { kind: "participantEditor", participant: selected[0] };
  }

  return get(openMenuAtom) ?? { kind: "idle" };
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
