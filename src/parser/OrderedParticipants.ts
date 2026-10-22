import ToCollector from "@/parser/ToCollector";
import { AllMessages } from "@/parser/MessageCollector";
import { _STARTER_, blankParticipant } from "@/parser/Participants";
import type { IParticipantModel } from "@/parser/IParticipantModel";

export { _STARTER_ };

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
  const result: IParticipantModel[] = participantEntries.map(
    (entry, index, entries) => ({
      ...entry,
      left: index > 0 ? entries[index - 1].name : "",
    }),
  );
  orderedParticipantsCache.set(rootContext, result);
  return result;
}
