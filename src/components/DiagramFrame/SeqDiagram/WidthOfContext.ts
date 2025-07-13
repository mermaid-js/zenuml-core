import { AllMessages } from "@/parser/MessageCollector";
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder, { Frame } from "@/positioning/FrameBorder";
import { Coordinates } from "@/positioning/Coordinates";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";
import { calculateFragmentContextWidth, calculateSelfMessageExtraWidth } from "@/positioning/GeometryUtils";

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
  
  if (leftParticipant === "" || rightParticipant === "") {
    return 0;
  }

  const frameBuilder = new FrameBuilder(allParticipants as string[]);
  const frame = frameBuilder.getFrame(ctx);
  const border = FrameBorder(frame as Frame);
  
  // Calculate extra width due to self messages using new mathematical model
  const allMessages = AllMessages(ctx);
  const selfMessages = allMessages.filter((m) => m.from === m.to);
  const extraWidth = calculateSelfMessageExtraWidth(selfMessages, rightParticipant, coordinates);
  
  // Calculate border depth from border object (border.left should equal border.right)
  const borderDepth = border.left / 10; // FRAGMENT_PADDING_X = 10
  
  // Use new mathematical model for fragment context width calculation
  return calculateFragmentContextWidth(leftParticipant, rightParticipant, borderDepth, extraWidth, coordinates);
}

