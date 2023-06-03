import {AllMessages} from "../../../positioning/MessageContextListener";
import WidthProviderOnBrowser from "../../../positioning/WidthProviderFunc";
import {TextType} from "../../../positioning/Coordinate";

export function extraWidthDueToSelfMessage(ctx: any, rightParticipant: string) {
  const allMessages = AllMessages(ctx);
  // the messages have a structure like {from, signature, type, to}
  // find all the messages that has from == to == rightParticipant
  const widths = allMessages
    .filter((m) => m.from === m.to && m.from === rightParticipant)
    .map((m) => m.signature)
    .map((s) => WidthProviderOnBrowser(s, TextType.MessageContent));
  let width = Math.max.apply(null, [0, ...widths])
  return width;
}
