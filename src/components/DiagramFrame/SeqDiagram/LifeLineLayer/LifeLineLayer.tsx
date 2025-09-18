import { coordinatesAtom, modeAtom, participantsAtom, participantsVMAtom, groupsVMAtom, RenderMode } from "@/store/Store";
import { useAtomValue } from "jotai";
import { LifeLine } from "./LifeLine";
import { LifeLineGroup } from "./LifeLineGroup";
import { Fragment, useMemo } from "react";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { blankParticipant } from "@/parser/Participants";
import { isGroupContext, isParticipantContext, participantNameOf } from "@/parser/helpers";

export const LifeLineLayer = (props: {
  context: any;
  leftGap: number;
  renderParticipants?: boolean;
  renderLifeLine?: boolean;
}) => {
  const mode = useAtomValue(modeAtom);
  const coordinates = useAtomValue(coordinatesAtom);
  const participantsModel = useAtomValue(participantsAtom);
  const participantsVM = useAtomValue(participantsVMAtom);
  const groupsVM = useAtomValue(groupsVMAtom);

  const starterParticipant = useMemo(() => {
    const names = coordinates.orderedParticipantNames();
    if (names.length === 0) return null;
    const firstName = names[0];
    if (firstName === _STARTER_) {
      return {
        ...blankParticipant,
        name: _STARTER_,
        explicit: false,
        isStarter: true,
      };
    }
    return null;
  }, [coordinates]);

  const starterVM = useMemo(() => {
    return participantsVM.find(vm => vm.name === _STARTER_);
  }, [participantsVM]);
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
        {starterParticipant && !starterParticipant?.explicit && (
          <LifeLine
            entity={starterParticipant}
            vm={starterVM}
            className="starter"
            renderParticipants={props.renderParticipants}
            renderLifeLine={props.renderLifeLine}
          />
        )}
        {/* Render groups using VM data */}
        {groupsVM.map((group, index) => (
          <LifeLineGroup
            key={group.id}
            group={{
              name: group.name,
              participantNames: group.participantNames,
            }}
            renderParticipants={props.renderParticipants}
            renderLifeLine={props.renderLifeLine}
          />
        ))}
        
        {/* Render explicit participants that are not in groups */}
        {((props.context?.children as any[]) || [])
          .filter((c) => isParticipantContext(c))
          .map((child, index) => {
            const name = participantNameOf(child);
            const irEntity = name && participantsModel.find((p) => p.name === name);
            const vm = name && participantsVM.find((p) => p.name === name);
            return irEntity ? (
              <LifeLine
                key={`explicit-${index}`}
                entity={irEntity}
                vm={vm}
                renderParticipants={props.renderParticipants}
                renderLifeLine={props.renderLifeLine}
              />
            ) : null;
          })}
        {participantsModel
          .filter((p: any) => !p.explicit)
          .map((entity: any) => {
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
          })}
      </div>
    </div>
  );
};
