import {
  coordinatesAtom,
  modeAtom,
  participantsAtom,
  RenderMode,
} from "@/store/Store";
import { useAtomValue } from "jotai";
import { LifeLine } from "./LifeLine";
import { LifeLineGroup } from "./LifeLineGroup";
import { Fragment, useMemo } from "react";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { blankParticipant } from "@/parser/Participants";
import { GroupContext, ParticipantContext, Participants } from "@/parser";
import { MessageCreateControls } from "./MessageCreateControls";

export const LifeLineLayer = (props: {
  context: any;
  leftGap: number;
  renderParticipants?: boolean;
  renderLifeLine?: boolean;
}) => {
  const mode = useAtomValue(modeAtom);
  const coordinates = useAtomValue(coordinatesAtom);
  const participants = useAtomValue(participantsAtom);

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
  return (
    <div
      className="life-line-layer lifeline-layer z-30 absolute h-full flex flex-col top-0 pt-2"
      data-participant-names="participantNames"
      style={{
        minWidth: mode === RenderMode.Dynamic ? "200px" : "auto",
        width: `calc(100% - ${props.leftGap}px)`,
        // Always pass through pointer events at the container level.
        // When rendering participant boxes, the boxes themselves opt back in via
        // pointerEvents: "auto" on the Participant component.
        // When rendering lifelines only (decorative dashed lines), no pointer
        // events are needed and passing through lets the EmptyDiagramPrompt
        // and MessageLayer below remain clickable.
        pointerEvents: "none",
      }}
    >
      <div className="z-lifeline-container relative grow">
        {starterParticipant && !starterParticipant?.explicit && (
          <LifeLine
            entity={starterParticipant}
            className="starter"
            renderParticipants={props.renderParticipants}
            renderLifeLine={props.renderLifeLine}
          />
        )}
        {((props.context?.children as any[]) || [])
          .filter(
            (c) => c instanceof GroupContext || c instanceof ParticipantContext,
          )
          .map((child, index) => (
            <Fragment key={index}>
              {child instanceof GroupContext && (
                <LifeLineGroup
                  key={index}
                  context={child}
                  renderParticipants={props.renderParticipants}
                  renderLifeLine={props.renderLifeLine}
                />
              )}
              {child instanceof ParticipantContext && (
                <LifeLine
                  key={index}
                  entity={Participants(child).First()}
                  renderParticipants={props.renderParticipants}
                  renderLifeLine={props.renderLifeLine}
                />
              )}
            </Fragment>
          ))}
        {participants.ImplicitArray().map((entity: any) => (
          <LifeLine
            key={entity.name}
            entity={entity}
            renderParticipants={props.renderParticipants}
            renderLifeLine={props.renderLifeLine}
          />
        ))}
        {props.renderParticipants && <MessageCreateControls />}
      </div>
    </div>
  );
};
