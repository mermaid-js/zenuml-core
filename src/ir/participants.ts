import ToCollector from "@/parser/ToCollector";

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
  const names = participants?.Names?.() || [];
  return names.map((name: string) => {
    const p = participants.Get(name) as any;
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

