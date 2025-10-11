import { modeAtom, progVMAtom, RenderMode } from "@/store/Store";
import { useAtomValue } from "jotai";
import { LifeLine } from "./LifeLine";
import { LifeLineGroup } from "./LifeLineGroup";
import { ParticipantVM } from "@/vm/participants.ts";
import { GroupVM } from "@/vm/groups.ts";

export const LifeLineLayer = (props: {
  leftGap: number;
  renderParticipants?: boolean;
  renderLifeLine?: boolean;
}) => {
  const mode = useAtomValue(modeAtom);
  const progVM = useAtomValue(progVMAtom);
  const participantsVM = progVM.participantsVM || [];
  const groupsVM = progVM.groupsVM || [] as any[];

  return (
    <div
      className="life-line-layer lifeline-layer z-30 absolute h-full flex flex-col top-0 pt-2"
      style={{
        minWidth: mode === RenderMode.Dynamic ? "200px" : "auto",
        width: `calc(100% - ${props.leftGap}px)`,
        pointerEvents: props.renderParticipants ? "none" : "all",
      }}
    >
      <div className="z-lifeline-container relative grow">
        {/* position is decided by vm models */}
        {groupsVM.map((group: GroupVM, index: number) => (
          <LifeLineGroup
            key={`group:${index}:${group.participantNames.join(",")}`}
            vm={group}
            participantsVM={participantsVM}
            renderParticipants={props.renderParticipants}
            renderLifeLine={props.renderLifeLine}
          />
        ))}
        
        {participantsVM
          .filter((p: ParticipantVM) => 
            !groupsVM.some((g: GroupVM) => g.participantNames.includes(p.name))
          )
          .map((entity: ParticipantVM) => (
            <LifeLine
              key={entity.name}
              vm={entity}
              renderParticipants={props.renderParticipants}
              renderLifeLine={props.renderLifeLine}
            />
          ))}
      </div>
    </div>
  );
};
