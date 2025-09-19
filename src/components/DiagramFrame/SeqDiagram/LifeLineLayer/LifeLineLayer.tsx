import { coordinatesAtom, modeAtom, participantsAtom, participantsVMAtom, groupsVMAtom, RenderMode } from "@/store/Store";
import { useAtomValue } from "jotai";
import { LifeLine } from "./LifeLine";
import { LifeLineGroup } from "./LifeLineGroup";
import { useMemo } from "react";
import { _STARTER_ } from "@/parser/OrderedParticipants";

export const LifeLineLayer = (props: {
  leftGap: number;
  renderParticipants?: boolean;
  renderLifeLine?: boolean;
}) => {
  const mode = useAtomValue(modeAtom);
  const coordinates = useAtomValue(coordinatesAtom);
  const participantsModel = useAtomValue(participantsAtom);
  const participantsVM = useAtomValue(participantsVMAtom);
  const groupsVM = useAtomValue(groupsVMAtom);

  const starterEntity = useMemo(() => {
    return participantsModel.find((p) => p.name === _STARTER_) || null;
  }, [participantsModel]);
  const starterVM = useMemo(() => participantsVM.find(vm => vm.name === _STARTER_), [participantsVM]);
  return (
    <div
      className="life-line-layer lifeline-layer z-30 absolute h-full flex flex-col top-0 pt-2"
      data-participant-names="participantNames"
      style={{
        minWidth: mode === RenderMode.Dynamic ? "200px" : "auto",
        width: `calc(100% - ${props.leftGap}px)`,
        pointerEvents: props.renderParticipants ? "none" : "all",
      }}
    >
      <div className="z-lifeline-container relative grow">
        {starterEntity && !starterEntity.explicit && (
          <LifeLine
            entity={starterEntity}
            vm={starterVM}
            className="starter"
            renderParticipants={props.renderParticipants}
            renderLifeLine={props.renderLifeLine}
          />
        )}
        {/* Render groups using VM data */}
        {groupsVM.map((group, index) => (
          <LifeLineGroup
            key={`group:${index}:${group.participantNames.join(",")}`}
            group={{
              name: group.name,
              participantNames: group.participantNames,
            }}
            renderParticipants={props.renderParticipants}
            renderLifeLine={props.renderLifeLine}
          />
        ))}
        
        {/* Render non-group participants (explicit or implicit), excluding starter already rendered */}
        {(() => {
          const groupMembers = new Set<string>();
          for (const g of groupsVM) {
            for (const n of g.participantNames) groupMembers.add(n);
          }
          const namesInOrder = coordinates.orderedParticipantNames();
          return namesInOrder
            .map((name) => participantsModel.find((p) => p.name === name))
            .filter((p): p is NonNullable<typeof p> => Boolean(p))
            .filter((p) => p.name !== _STARTER_ && !groupMembers.has(p.name))
            .map((entity) => {
              const vm = participantsVM.find((p) => p.name === entity.name);
              return (
                <LifeLine
                  key={entity.name}
                  entity={entity}
                  vm={vm}
                  renderParticipants={props.renderParticipants}
                  renderLifeLine={props.renderLifeLine}
                />
              );
            });
        })()}
      </div>
    </div>
  );
};
