import ToCollector from "@/parser/ToCollector";
import { buildMessagesModel } from "./messages";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { blankParticipant } from "@/parser/Participants";

export interface IRParticipant {
  name: string;
  label?: string;
  type?: string;
  explicit?: boolean;
  isStarter?: boolean;
  color?: string;
  stereotype?: string;
  groupId?: string | number;
  assignee?: string;
  positions: [number, number][];
  assigneePositions: [number, number][];
}

export function buildParticipantsModel(rootCtx: any): IRParticipant[] {
  if (!rootCtx) return [];
  // @ts-expect-error runtime value from JS listener
  const participants = ToCollector.getParticipants(rootCtx);
  const participantEntries = Array.from(participants.participants.entries());
  
  // Add _STARTER_ participant when needed (same logic as OrderedParticipants)
  const allMessages = buildMessagesModel(rootCtx);
  const emptyContext = allMessages.length === 0 && participantEntries.length === 0;
  const someMessagesMissFrom = allMessages.some((m) => !m.from);
  const needDefaultStarter = emptyContext || someMessagesMissFrom;
  
  if (needDefaultStarter) {
    participantEntries.unshift([
      _STARTER_,
      { ...blankParticipant, name: _STARTER_, isStarter: true },
    ]);
  }
  
  return participantEntries.map(([name, p]: [string, any]) => {
    // positions are stored as Set<[start, end]>
    const positions = Array.from((p?.positions as Set<[number, number]>) || []);
    const assigneePositions = Array.from(
      (p?.assigneePositions as Set<[number, number]>) || [],
    );
    return {
      name: p?.name ?? name,
      label: p?.label,
      type: p?.type,
      explicit: p?.explicit,
      isStarter: p?.isStarter,
      color: p?.color,
      stereotype: p?.stereotype,
      groupId: p?.groupId,
      assignee: p?.assignee,
      positions,
      assigneePositions,
    } as IRParticipant;
  });
}

