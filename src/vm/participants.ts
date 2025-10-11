import { IRParticipant } from "@/ir/participants";
import { _STARTER_ } from "@/constants";
import iconPath from "@/components/DiagramFrame/Tutorial/Icons";
import { removeAlpha } from "@/utils/Color";

export interface ParticipantLayout {
  order: number;
  left: number;
  center: number;
  right: number;
  width: number;
}

export interface ParticipantStyle {
  icon?: string;
  backgroundColor?: string;
}

export interface ParticipantVM {
  // Core identity
  name: string;
  displayName: string;
  isDefaultStarter: boolean;
  
  // Appearance
  label?: string;
  type?: string;
  stereotype?: string;
  color?: string;
  backgroundColor?: string;
  icon?: string;
  assignee?: string;
  
  // Metadata
  explicit?: boolean;
  isStarter?: boolean;
  groupId?: string | number;
  
  // Position data (sorted by start position desc)
  labelPositions: [number, number][];
  assigneePositions: [number, number][];

  // Layout helper populated by TreeVMBuilder when available
  layout?: ParticipantLayout;

  // Presentation hints reused by React components
  style?: ParticipantStyle;
}

export function buildParticipantVM(participant: IRParticipant): ParticipantVM {
  const isDefaultStarter = participant.name === _STARTER_;
  
  // Calculate display name
  let displayName: string;
  if (participant.assignee) {
    displayName = participant.name.split(":")[1] || participant.name;
  } else {
    displayName = participant.label || participant.name;
  }
  
  // Get icon
  const icon = isDefaultStarter
    ? iconPath["actor"]
    : iconPath[participant.type?.toLowerCase() as "actor"];
  
  // Calculate background color
  const backgroundColor = participant.color
    ? removeAlpha(participant.color)
    : undefined;
  
  // Sort positions by start position descending
  const labelPositions = [...participant.positions].sort((a, b) => b[0] - a[0]);
  const assigneePositions = [...participant.assigneePositions].sort((a, b) => b[0] - a[0]);
  
  return {
    name: participant.name,
    displayName,
    isDefaultStarter,
    label: participant.label,
    type: participant.type,
    stereotype: participant.stereotype,
    color: participant.color,
    backgroundColor,
    icon,
    assignee: participant.assignee,
    explicit: participant.explicit,
    isStarter: participant.isStarter,
    groupId: participant.groupId,
    labelPositions,
    assigneePositions,
    style: {
      icon,
      backgroundColor,
    },
  };
}

export function buildParticipantsVM(participants: IRParticipant[]): ParticipantVM[] {
  return participants.map(buildParticipantVM);
}
