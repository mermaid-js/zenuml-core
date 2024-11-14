import { AllMessages } from "@/parser/MessageContextListener";
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder, { Frame } from "@/positioning/FrameBorder";
import { Coordinates } from "@/positioning/Coordinates";
import { FRAGMENT_MIN_WIDTH } from "@/positioning/Constants";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";

export function TotalWidth(ctx: any, coordinates: Coordinates) {
  const allParticipants = coordinates.orderedParticipantNames();
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

function extraWidthDueToSelfMessage(
  ctx: any,
  rightParticipant: string,
  coordinates: Coordinates,
) {
  const allMessages = AllMessages(ctx);
  const widths = allMessages
    .filter((m) => !!m.from && !!m.to)
    .filter((m) => m.from === m.to)
    // 37 is arrow width (30) + half occurrence width(7)
    .map(
      (m) =>
        coordinates.getMessageWidth(m) -
        coordinates.distance(m.from, rightParticipant) -
        coordinates.half(rightParticipant),
    );
  return Math.max.apply(null, [0, ...widths]);
}
