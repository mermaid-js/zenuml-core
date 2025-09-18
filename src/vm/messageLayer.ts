import type { Coordinates } from "@/positioning/Coordinates";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { centerOf } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/utils";
import type { MessageVM } from "@/vm/messages";

export interface MessageLayerVM {
  origin: string;
  paddingLeft: number;
}

export function buildMessageLayerVM(
  messagesVM: MessageVM[],
  coordinates: Coordinates,
): MessageLayerVM {
  const origin = messagesVM.length > 0 ? messagesVM[0].from || _STARTER_ : _STARTER_;
  const paddingLeft = centerOf(coordinates, origin) + 1;
  return { origin, paddingLeft };
}

