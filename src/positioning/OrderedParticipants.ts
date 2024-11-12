import ToCollector from "@/parser/ToCollector";

export function OrderedParticipants(rootContext: any) {
  // @ts-ignore
  const participants = ToCollector.getParticipants(rootContext, true);
  const participantEntries = Array.from(participants.participants.entries());

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
