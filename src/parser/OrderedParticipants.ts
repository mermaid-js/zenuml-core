import ToCollector from "@/parser/ToCollector";
import { AllMessages } from "@/parser/MessageCollector";
import { blankParticipant } from "@/parser/Participants";
import type { IParticipantModel } from "@/parser/ParticipantListener";

export const _STARTER_ = "_STARTER_";

// Define a class that implements IParticipantModel
class Participant implements IParticipantModel {
  name: string;
  left?: string;
  label?: string;
  type?: string;

  constructor(name: string, left?: string, label?: string, type?: string) {
    this.name = name;
    this.left = left;
    this.label = label;
    this.type = type;
  }

  getDisplayName(): string {
    return this.label || this.name;
  }

  hasIcon(): boolean {
    // Only participants with a defined type property have icons
    return this.type !== undefined;
  }
}

export function OrderedParticipants(rootContext: any): IParticipantModel[] {
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
    const previousName = index > 0 ? entries[index - 1][1].name : "";

    return new Participant(
      participant.name,
      previousName,
      participant.label,
      participant.type,
    );
  });
}
