import { IRGroup } from "@/ir/groups";

export interface GroupVM {
  id: string;
  name?: string;
  participantNames: string[];
}

export function buildGroupVM(group: IRGroup): GroupVM {
  return {
    id: group.id,
    name: group.name,
    participantNames: group.participantNames,
  };
}

export function buildGroupsVM(groups: IRGroup[]): GroupVM[] {
  return groups.map(buildGroupVM);
}
