import { participantNamesInGroup, formattedTextOf } from "@/parser/helpers";
import sequenceParser from "@/generated-parser/sequenceParser";

export interface IRGroup {
  id: string;
  name?: string;
  participantNames: string[];
}

export function buildGroupsModel(rootCtx: any): IRGroup[] {
  if (!rootCtx) return [];
  
  const groups: IRGroup[] = [];
  const head = rootCtx?.head?.();
  if (!head) return groups;
  
  const children = head.children || [];
  
  // Filter for group contexts
  const groupContexts = children.filter(
    (c: any) => c instanceof (sequenceParser as any).GroupContext,
  );
  
  groupContexts.forEach((groupCtx: any, index: number) => {
    const participantNames = participantNamesInGroup(groupCtx);
    const name = formattedTextOf(groupCtx?.name?.());
    
    // Create a unique ID for the group
    const id = `group:${index}:${participantNames.join(",")}`;
    
    groups.push({
      id,
      name,
      participantNames,
    });
  });
  
  return groups;
}
