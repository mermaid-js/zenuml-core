import FrameBorder from "@/positioning/FrameBorder";
import { Coordinates } from "@/positioning/Coordinates";
import { FRAGMENT_MIN_WIDTH } from "@/positioning/Constants";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import type { IRMessage } from "@/ir/messages";
import type { FrameIRNode } from "@/ir/frames";

/**
 * Compute total width for a context using IR messages and coordinates.
 * - If a frame is provided, its left/right determine participant span and its border contributes to width.
 * - Extra width from self messages is derived from IR (optionally scoped to the frame's range via its id).
 */
export function TotalWidth(
  coordinates: Coordinates,
  messages: IRMessage[],
  frameOverride?: FrameIRNode | null,
) {
  const allParticipants = coordinates.orderedParticipantNames();

  // Determine left/right participants globally from messages (MessageLayer spans all participants)
  let leftParticipant = "";
  let rightParticipant = "";

  const localSet = new Set<string>();
  for (const m of messages) {
    const from = m.from || _STARTER_;
    const to = m.to || "";
    if (from) localSet.add(from);
    if (to) localSet.add(to);
  }
  leftParticipant = allParticipants.find((p) => localSet.has(p)) || "";
  rightParticipant =
    allParticipants.slice().reverse().find((p) => localSet.has(p)) || "";

  // Fallback: if frame/messages did not yield valid participants, use extremes
  if (!leftParticipant || !rightParticipant) {
    leftParticipant = allParticipants[0] || "";
    rightParticipant = allParticipants[allParticipants.length - 1] || "";
  }

  const border = FrameBorder(frameOverride ?? null);

  const extraWidth = extraWidthDueToSelfMessageIR(
    messages,
    rightParticipant,
    coordinates,
  );

  const participantWidth =
    coordinates.distance(leftParticipant, rightParticipant) +
    coordinates.half(leftParticipant) +
    coordinates.half(rightParticipant);

  return (
    Math.max(participantWidth, FRAGMENT_MIN_WIDTH) +
    border.left +
    border.right +
    extraWidth
  );
}

function extraWidthDueToSelfMessageIR(
  messages: IRMessage[],
  rightParticipant: string,
  coordinates: Coordinates,
) {
  const widths = messages
    .filter((m) => m.from === m.to)
    // 37 is arrow width (30) + half occurrence width(7)
    .map(
      (m) =>
        // m conforms to OwnableMessage shape; cast to any for TS compatibility
        coordinates.getMessageWidth(m as any) -
        coordinates.distance((m.from as string) || _STARTER_, rightParticipant) -
        coordinates.half(rightParticipant),
    );
  return Math.max.apply(null, [0, ...widths]);
}
