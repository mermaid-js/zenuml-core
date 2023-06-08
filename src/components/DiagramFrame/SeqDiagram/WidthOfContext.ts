import {AllMessages} from "@/positioning/MessageContextListener";
import WidthProviderOnBrowser from "../../../positioning/WidthProviderFunc";
import {TextType} from "@/positioning/Coordinate";
import {Participants} from "@/parser";
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder, {Frame} from "@/positioning/FrameBorder";
import {Coordinates} from "@/positioning/Coordinates";
import {IParticipantModel} from "@/positioning/ParticipantListener";

export function TotalWidth(ctx: any, coordinates: Coordinates) {
  const allParticipants = coordinates.participantModels.map((p) => p.name);
  const localParticipants = [
    ctx.Origin(),
    ...Participants(ctx)
      .ImplicitArray()
      .map((p: IParticipantModel) => p.name),
  ]
  const leftParticipant = allParticipants.find((p) => localParticipants.includes(p)) || '';
  const rightParticipant = allParticipants.reverse().find((p) => localParticipants.includes(p)) || '';

  let frameBuilder = new FrameBuilder(allParticipants as string[]);
  const frame = frameBuilder.getFrame(ctx);
  const border = FrameBorder(frame as Frame);
  const extraWidth = widthOfContext(ctx, rightParticipant, coordinates);
  return coordinates.distance(leftParticipant, rightParticipant) +
    border.left +
    border.right +
    Coordinates.half(WidthProviderOnBrowser, leftParticipant) +
    Coordinates.half(WidthProviderOnBrowser, rightParticipant) +
    extraWidth;
}

function widthOfContext(ctx: any, rightParticipant: string, coordinates: Coordinates) {
  const allMessages = AllMessages(ctx);
  const widths = allMessages
    .filter((m) => m.from === m.to)
    .map((s) => WidthProviderOnBrowser(s.signature, TextType.MessageContent) - coordinates.distance(s.from, rightParticipant));
  return Math.max.apply(null, [0, ...widths]);
}
