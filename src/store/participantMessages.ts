import { MessageRecord, ParticipantMessagesMap } from "./Store";

const sortMessages = (records: MessageRecord[]) =>
  records.sort((a, b) => {
    if (a.top === b.top) {
      if (!a.id || !b.id) return 0;
      return a.id.localeCompare(b.id);
    }
    return a.top - b.top;
  });

export const upsertParticipantMessage = (
  map: ParticipantMessagesMap,
  participantId: string,
  record: MessageRecord,
): ParticipantMessagesMap => {
  const existing = map[participantId] || [];
  const filtered = existing.filter((entry) => entry.id !== record.id);
  const updated = [...filtered, record];
  sortMessages(updated);

  return {
    ...map,
    [participantId]: updated,
  };
};

export const resetParticipantMessages = (): ParticipantMessagesMap => ({}) as ParticipantMessagesMap;

export const removeParticipantMessage = (
  map: ParticipantMessagesMap,
  participantId: string,
  messageId?: string,
): ParticipantMessagesMap => {
  if (!participantId || !messageId) return map;
  const existing = map[participantId];
  if (!existing) return map;

  const filtered = existing.filter((entry) => entry.id !== messageId);
  if (filtered.length === existing.length) return map;

  const next: ParticipantMessagesMap = { ...map };
  if (filtered.length === 0) {
    delete next[participantId];
  } else {
    next[participantId] = filtered;
  }
  return next;
};
