import { LifeLine } from "./LifeLine";
import { useAtomValue } from "jotai";
import { coordinatesAtom, participantsAtom, participantsVMAtom } from "@/store/Store";
import { cn } from "@/utils";
import { useMemo } from "react";

// Constants
const LIFELINE_GROUP_OUTLINE_MARGIN = 2; // Small margin for group outline positioning

export interface GroupData {
  name?: string;
  participantNames: string[];
}

export const LifeLineGroup = (props: {
  context?: any; // Made optional for backward compatibility
  group?: GroupData; // New VM-driven prop
  renderParticipants: any;
  renderLifeLine: any;
}) => {
  const coordinates = useAtomValue(coordinatesAtom);
  const participantsModel = useAtomValue(participantsAtom);
  const participantsVM = useAtomValue(participantsVMAtom);
  
  // Extract group data from VM or fallback to parser context
  const groupData = useMemo((): GroupData => {
    if (props.group) {
      return props.group;
    }
    
    // Fallback to parser context for backward compatibility
    if (props.context) {
      // Import parser helpers dynamically to avoid circular dependencies
      const { participantNamesInGroup, formattedTextOf } = require("@/parser/helpers");
      const participantNames = participantNamesInGroup(props.context);
      const name = formattedTextOf(props.context?.name?.());
      return { name, participantNames };
    }
    
    return { participantNames: [] };
  }, [props.group, props.context]);
  
  const entities = groupData.participantNames
    .map((n) => participantsModel.find((p) => p.name === n))
    .filter(Boolean) as any[];
  if (entities.length <= 0) return null;
  
  const left =
    coordinates.left(entities[0].name) + LIFELINE_GROUP_OUTLINE_MARGIN;
  const right =
    coordinates.right(entities[entities.length - 1].name) -
    LIFELINE_GROUP_OUTLINE_MARGIN;

  const name = groupData.name;
  // Merged the outer and middle divs while preserving all functionality
  return (
    <div
      className={cn(
        "lifeline-group-container absolute flex flex-col flex-grow h-full",
        { "outline-dashed outline-skin-primary": props.renderLifeLine },
      )}
      style={{
        left: `${left}px`,
        width: `${right - left}px`,
      }}
    >
      {props.renderParticipants && name && (
        <div className="z-10 absolute flex items-center justify-center w-full bg-skin-frame">
          <span className="font-semibold text-skin-lifeline-group-name">
            {name}
          </span>
        </div>
      )}

      <div className="lifeline-group relative flex-grow">
        {entities.map((entity) => {
          const vm = participantsVM.find((p) => p.name === entity.name);
          return (
            <LifeLine
              key={entity.name}
              entity={entity}
              vm={vm}
              groupLeft={left}
              renderLifeLine={props.renderLifeLine}
              renderParticipants={props.renderParticipants}
            />
          );
        })}
      </div>
    </div>
  );
};
