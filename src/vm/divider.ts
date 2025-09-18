import type { Coordinates } from "@/positioning/Coordinates";
import { centerOf } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/utils";

export interface DividerVM {
  note: string;
  rawNote: string;
  width: number;
  translateX: number;
  styling: { styles?: string[] };
}

/**
 * Build a DividerVM from divider context, origin and coordinates.
 * Returns null if context is missing.
 */
export function buildDividerVM(
  dividerCtx: any,
  origin: string,
  coordinates: Coordinates,
): DividerVM | null {
  if (!dividerCtx) return null;

  const dividerNote: string = dividerCtx?.Note?.() || "";
  const names = coordinates.orderedParticipantNames();
  const rearParticipant = names[names.length - 1];
  const dividerWidth = centerOf(coordinates, rearParticipant) + 10;
  const centerOfOrigin = centerOf(coordinates, origin);

  // Parse note for styling
  let parsedNote = dividerNote;
  let styleInfo: { styles?: string[] } = {};
  const trimmed = dividerNote.trim();
  const open = trimmed.indexOf("[");
  const close = trimmed.indexOf("]");
  if (open === 0 && close !== -1) {
    const startIndex = dividerNote.indexOf("[");
    const endIndex = dividerNote.indexOf("]");
    const styleStr = dividerNote.slice(startIndex + 1, endIndex);
    parsedNote = dividerNote.slice(endIndex + 1);
    styleInfo = { styles: styleStr.split(",").map((s: string) => s.trim()) };
  }

  return {
    note: parsedNote,
    rawNote: dividerNote,
    width: dividerWidth,
    translateX: -1 * centerOfOrigin + 10,
    styling: styleInfo,
  };
}

