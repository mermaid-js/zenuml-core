import ToCollector from "@/parser/ToCollector";
import { AllMessages } from "@/parser/MessageCollector";
import { blankParticipant } from "@/parser/Participants";
import type { IParticipantModel } from "@/parser/IParticipantModel";

export const _STARTER_ = "_STARTER_";

// Define a class that implements IParticipantModel
class Participant implements IParticipantModel {
  name: string;
  left: string;
  label?: string;
  type?: string;
  stereotype?: string;
  color?: string;
  emoji?: string;
  groupId?: string | number;

  constructor(
    name: string,
    left: string,
    label?: string,
    type?: string,
    stereotype?: string,
    color?: string,
    groupId?: string | number,
    emoji?: string,
  ) {
    this.name = name;
    this.left = left;
    this.label = label;
    this.type = type;
    this.stereotype = stereotype;
    this.color = color;
    this.groupId = groupId;
    this.emoji = emoji;
  }

  getDisplayName(): string {
    return this.label || this.name;
  }

  hasIcon(): boolean {
    // Only participants with a defined type property have icons
    return this.type !== undefined;
  }
}

// Pure function of the (immutable) parse tree; consumers only read the models.
const orderedParticipantsCache = new WeakMap<object, IParticipantModel[]>();

export function OrderedParticipants(rootContext: any): IParticipantModel[] {
  if (!rootContext) return [];
  const cached = orderedParticipantsCache.get(rootContext);
  if (cached) return cached;
  const participants = ToCollector.getParticipants(rootContext);
  // ToValue() yields plain data (same shape as blankParticipant below),
  // keeping the real Participants/Participant classes encapsulated.
  const participantEntries = participants.Array().map((p) => p.ToValue());

  const allMessages = AllMessages(rootContext);

  const emptyContext =
    allMessages.length === 0 && participantEntries.length === 0;
  const someMessagesMissFrom = allMessages.some((m) => !m.from);
  const needDefaultStarter = emptyContext || someMessagesMissFrom;
  if (needDefaultStarter) {
    participantEntries.unshift({
      ...blankParticipant,
      name: _STARTER_,
      isStarter: true,
    });
  }
  const result = participantEntries.map((participant, index, entries) => {
    const previousName = index > 0 ? entries[index - 1].name : "";

    return new Participant(
      participant.name,
      previousName,
      participant.label,
      participant.type,
      participant.stereotype,
      participant.color,
      participant.groupId,
      participant.emoji,
    );
  });
  orderedParticipantsCache.set(rootContext, result);
  return result;
}
