// Interface definition only - no implementation needed

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


