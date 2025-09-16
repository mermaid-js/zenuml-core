import { buildMessagesModel } from "@/ir/messages";
import { buildFramesModel } from "@/ir/frames";
import FrameBorder, { Frame } from "@/positioning/FrameBorder";
import { Coordinates } from "@/positioning/Coordinates";
import { FRAGMENT_MIN_WIDTH } from "@/positioning/Constants";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";
import { _STARTER_ } from "@/parser/OrderedParticipants";

export function TotalWidth(
  ctx: any,
  coordinates: Coordinates,
  frameOverride?: Frame | null,
) {
  const allParticipants = coordinates.orderedParticipantNames();
  const localParticipants = getLocalParticipantNames(ctx);
  const leftParticipant =
    allParticipants.find((p) => localParticipants.includes(p)) || "";
  const rightParticipant =
    allParticipants
      .slice()
      .reverse()
      .find((p) => localParticipants.includes(p)) || "";
  const frame =
    frameOverride !== undefined
      ? frameOverride
      : buildFramesModel(ctx, allParticipants as string[]).root;
  const border = FrameBorder(frame as Frame | null);
  const extraWidth = extraWidthDueToSelfMessage(
    ctx,
    rightParticipant,
    coordinates,
  );
  // if (leftParticipant === "" || rightParticipant === "") {
  //   return 0;
  // }
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

function extraWidthDueToSelfMessage(
  ctx: any,
  rightParticipant: string,
  coordinates: Coordinates,
) {
  const allMessages = buildMessagesModel(ctx);
  const widths = allMessages
    .filter((m) => m.from === m.to)
    // 37 is arrow width (30) + half occurrence width(7)
    .map(
      (m) =>
        // m conforms to OwnableMessage shape; cast to any for TS compatibility
        coordinates.getMessageWidth(m as any) -
        coordinates.distance(m.from || _STARTER_, rightParticipant) -
        coordinates.half(rightParticipant),
    );
  return Math.max.apply(null, [0, ...widths]);
}
