import antlr4 from "antlr4";
import { ParticipantListener } from "./ParticipantListener";

export function OrderedParticipants(rootContext: any) {
  const listener = new ParticipantListener();
  const walker = antlr4.tree.ParseTreeWalker.DEFAULT;
  walker.walk(listener, rootContext);
  return listener.result();
}
