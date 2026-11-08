import { AllMessages, contextOfMessage } from "@/parser/MessageCollector";
import { depthOnParticipant } from "@/parser/depthOnParticipant";
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder, { Frame } from "@/positioning/FrameBorder";
import { Coordinates } from "@/positioning/Coordinates";
import {
  FRAGMENT_MIN_WIDTH,
  OCCURRENCE_BAR_SIDE_WIDTH,
} from "@/positioning/Constants";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import type { OwnableMessage } from "@/parser/OwnableMessage";

export function TotalWidth(ctx: any, coordinates: Coordinates) {
  const allParticipants = coordinates.orderedParticipantNames();
  if (!ctx || allParticipants.length === 0) return 0;
  const localParticipants = getLocalParticipantNames(ctx);
  const leftParticipant =
    allParticipants.find((p) => localParticipants.includes(p)) || "";
  const rightParticipant =
    allParticipants
      .slice()
      .reverse()
      .find((p) => localParticipants.includes(p)) || "";
  const frameBuilder = new FrameBuilder(allParticipants as string[]);
  const frame = frameBuilder.getFrame(ctx);
  const border = FrameBorder(frame as Frame);
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

// Starts from the parent because a message is not its own activation. Walks to
// the root because an activation can enclose the fragment being measured.
function enclosingActivations(message: OwnableMessage) {
  return depthOnParticipant(
    contextOfMessage(message).parentCtx,
    message.from || _STARTER_,
  );
}

function extraWidthDueToSelfMessage(
  ctx: any,
  rightParticipant: string,
  coordinates: Coordinates,
) {
  const allMessages = AllMessages(ctx);
  const widths = allMessages
    .filter((m) => m.from === m.to)
    // A self message starts at the right wall of its innermost activation
    // bar, so each enclosing bar pushes its label right.
    .map(
      (m) =>
        coordinates.getMessageWidth(m) +
        enclosingActivations(m) * OCCURRENCE_BAR_SIDE_WIDTH -
        coordinates.distance(m.from || _STARTER_, rightParticipant) -
        coordinates.half(rightParticipant),
    );
  return Math.max.apply(null, [0, ...widths]);
}
