import { atom } from "jotai";

// Hover preview from the participant editor: lets a participant box show a
// colour / type before it is committed to the code.
export type ParticipantPreview = {
  name: string;
  color?: string;
  type?: string;
};

export const participantPreviewAtom = atom<ParticipantPreview | null>(null);
