import ToCollector from "@/parser/ToCollector";
import { AllMessages } from "@/parser/MessageCollector";
import { blankParticipant } from "@/parser/Participants";

export const _STARTER_ = "_STARTER_";
export function OrderedParticipants(rootContext: any) {
  // @ts-ignore
  const participants = ToCollector.getParticipants(rootContext);
  const participantEntries = Array.from(participants.participants.entries());

  const allMessages = AllMessages(rootContext);

  const emptyContext =
    allMessages.length === 0 && participantEntries.length === 0;
  const someMessagesMissFrom = allMessages.some((m) => !m.from);
  const needDefaultStarter = emptyContext || someMessagesMissFrom;
  if (needDefaultStarter) {
    participantEntries.unshift([
      _STARTER_,
      { ...blankParticipant, name: _STARTER_, isStarter: true },
    ]);
  }
  return participantEntries.map((entry: any, index: number, entries: any) => {
    const participant = entry[1];

    // Get the previous participant's name or empty string if it's the first item
    const previousName = index > 0 ? entries[index - 1][1].name : "";

    return {
      name: participant.name,
      left: previousName,
      label: participant.label,
      type: participant.type,
    };
  });
}
