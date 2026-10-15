import { atom } from "jotai";
import { OrderedParticipants, _STARTER_ } from "@/parser/OrderedParticipants";
import {
  enableDividerInsertionAtom,
  enableMessageInsertionAtom,
  modeAtom,
  RenderMode,
  rootContextAtom,
} from "@/store/Store";

export const FIRST_GAP_CLEARANCE = 12;

const insertableParticipantCountAtom = atom(
  (get) =>
    OrderedParticipants(get(rootContextAtom)).filter(
      (p) => p.name !== _STARTER_,
    ).length,
);

export const configuredMessageCreationAtom = atom(
  (get) =>
    get(enableMessageInsertionAtom) && get(insertableParticipantCountAtom) >= 2,
);

export const gapHandlesShownAtom = atom(
  (get) =>
    get(modeAtom) === RenderMode.Dynamic &&
    (get(configuredMessageCreationAtom) || get(enableDividerInsertionAtom)),
);

// Extra height the first root gap adds above the first statement. The layout
// model does not include it, so anything placed from vertical coordinates
// (a created participant's lifeline) must add it.
export const firstRootGapClearanceAtom = atom((get) =>
  get(gapHandlesShownAtom) ? FIRST_GAP_CLEARANCE : 0,
);
