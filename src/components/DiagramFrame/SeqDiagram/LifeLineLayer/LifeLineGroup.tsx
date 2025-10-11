import {LifeLine} from "./LifeLine";
import {cn} from "@/utils";
import { ParticipantVM } from "@/vm/participants.ts";

// Constants
const LIFELINE_GROUP_OUTLINE_MARGIN = 2; // Small margin for group outline positioning

export const LifeLineGroup = (props: {
  vm?: any;
  participantsVM?: any[];
  renderParticipants: any;
  renderLifeLine: any;
}) => {
  const lifelineGroupVm = props.vm; // Alias for clarity in parity check
  
  const entities = lifelineGroupVm.participantNames
    .map((n: string) => props.participantsVM?.find((p) => p.name === n))
    .filter(Boolean) as any[];
  if (entities.length <= 0) return null;
  const left = entities[0]?.layout?.left + LIFELINE_GROUP_OUTLINE_MARGIN;
  const right = entities[entities.length - 1].layout.right - LIFELINE_GROUP_OUTLINE_MARGIN;

  const name = lifelineGroupVm.name;
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
        {entities.map((entity: ParticipantVM) => {
          return (
            <LifeLine
              key={entity.name}
              vm={entity}
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
