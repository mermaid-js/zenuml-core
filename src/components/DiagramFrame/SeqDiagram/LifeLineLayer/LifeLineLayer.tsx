import { coordinatesAtom, modeAtom, participantsAtom, participantsVMAtom, RenderMode } from "@/store/Store";
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
        {((props.context?.children as any[]) || [])
          .filter((c) => isGroupContext(c) || isParticipantContext(c))
          .map((child, index) => (
            <Fragment key={index}>
              {isGroupContext(child) && (
                <LifeLineGroup
                  key={index}
                  context={child}
                  renderParticipants={props.renderParticipants}
                  renderLifeLine={props.renderLifeLine}
                />
              )}
              {isParticipantContext(child) && (() => {
                const name = participantNameOf(child);
                const irEntity = name && participantsModel.find((p) => p.name === name);
                const vm = name && participantsVM.find((p) => p.name === name);
                return irEntity ? (
                  <LifeLine
                    key={index}
                    entity={irEntity}
                    vm={vm}
                    renderParticipants={props.renderParticipants}
                    renderLifeLine={props.renderLifeLine}
                  />
                ) : null;
              })()}
            </Fragment>
          ))}
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
