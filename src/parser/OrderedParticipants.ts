import ToCollector from "@/parser/ToCollector";
import { AllMessages } from "@/parser/MessageContextListener";
import { blankParticipant } from "@/parser/Participants";

export function OrderedParticipants(rootContext: any) {
  // @ts-ignore
  const participants = ToCollector.getParticipants(rootContext, true);
  const allMessages = AllMessages(rootContext);

  // allMessages is empty or one of the messages has no from, we need to add a default starter participant(_STARTER_)
  const needDefaultStarter =
    allMessages.length === 0 || allMessages.some((m) => !m.from);

  const participantEntries = Array.from(participants.participants.entries());
  if (needDefaultStarter) {
    participantEntries.unshift([
      "_STARTER_",
      { ...blankParticipant, name: "_STARTER_", isStarter: true },
    ]);
  }
  return participantEntries.map((entry, index) => {
    // @ts-ignore
    const [_, participant] = entry;

    // @ts-ignore
    // Get the previous participant's name or empty string if it's the first item
    const previousName = index > 0 ? participantEntries[index - 1][1].name : "";

    return {
      name: participant.name || _,
      left: previousName,
      label: participant.label,
    };
  });
}
