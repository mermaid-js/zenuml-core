import { atom, type Atom } from "jotai";
import {
  createMessageDragAtom,
  enableParticipantStyleEditingAtom,
  messageReorderDragAtom,
  messageReorderPendingAtom,
  modeAtom,
  selectedAtom,
  selectedMessageAtom,
  textEditingAtom,
} from "@/store/Store";
import { can, type Capability, type InteractionState } from "./policy";

/**
 * The diagram's primary interaction state.
 *
 * P1 (ADR 0002) derives it from the atoms that already hold each piece of
 * state. P2 moves that storage into this atom. Order matters: an occurrence
 * create-drag also selects its participant, so drags win over selection.
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

  const message = get(selectedMessageAtom);
  if (message) {
    return { kind: "messageMenu", start: message.start, end: message.end };
  }

  return { kind: "idle" };
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
