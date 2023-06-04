import {AllMessages} from "@/positioning/MessageContextListener";
import WidthProviderOnBrowser from "../../../positioning/WidthProviderFunc";
import {TextType} from "@/positioning/Coordinate";
import {Depth} from "@/parser";
import {
  FRAGMENT_LEFT_BASE_OFFSET,
  FRAGMENT_RIGHT_BASE_OFFSET
} from "./MessageLayer/Block/Statement/Fragment/FragmentMixin";

export function TotalWidth(ctx: any, leftParticipant: string, rightParticipant: string, distance2: Function) {
  const extraWidth = extraWidthDueToSelfMessage(ctx, rightParticipant);
  const depth = Depth(ctx);
  return distance2(leftParticipant, rightParticipant)
    + 20 * depth
    + FRAGMENT_RIGHT_BASE_OFFSET
    + FRAGMENT_LEFT_BASE_OFFSET
    + extraWidth;
}

export function extraWidthDueToSelfMessage(ctx: any, rightParticipant: string) {
  const allMessages = AllMessages(ctx);
  // the messages have a structure like {from, signature, type, to}
  // find all the messages that has from == to == rightParticipant
  const widths = allMessages
    .filter((m) => m.from === m.to && m.from === rightParticipant)
    .map((m) => m.signature)
    .map((s) => WidthProviderOnBrowser(s, TextType.MessageContent));
  return Math.max.apply(null, [0, ...widths]);
}
