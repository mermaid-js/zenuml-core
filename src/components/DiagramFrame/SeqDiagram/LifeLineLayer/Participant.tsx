import useStickyOffset from "@/functions/useStickyOffset";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import {
  diagramElementAtom,
  modeAtom,
  onSelectAtom,
  participantsAtom,
  RenderMode,
  selectedAtom,
  stickyOffsetAtom,
} from "@/store/Store";
import { cn } from "@/utils";
import { brightnessIgnoreAlpha, removeAlpha } from "@/utils/Color";
import { useAtomValue, useSetAtom } from "jotai";
import { CSSProperties, useMemo, useRef } from "react";
import { ParticipantLabel } from "./ParticipantLabel";
import iconPath from "../../Tutorial/Icons";
export const Participant = (props: {
  entity: Record<string, string>;
  offsetTop2?: number;
}) => {
  const elRef = useRef<HTMLDivElement>(null);
  const mode = useAtomValue(modeAtom);
  const participants = useAtomValue(participantsAtom);
  const diagramElement = useAtomValue(diagramElementAtom);
  const stickyOffset = useAtomValue(stickyOffsetAtom);
  const selected = useAtomValue(selectedAtom);
  const onSelect = useSetAtom(onSelectAtom);

  const isDefaultStarter = props.entity.name === _STARTER_;

  const labelPositions = Array.from(
    (participants.GetPositions(props.entity.name) as [number, number][]) ?? [],
    // Sort the label positions in descending order to avoid index shifting when updating code
  ).sort((a, b) => b[0] - a[0]);
  const assigneePositions = Array.from(
    (participants.GetAssigneePositions(props.entity.name) as [
      number,
      number,
    ][]) ?? [],
    // Sort the label positions in descending order to avoid index shifting when updating code
  ).sort((a, b) => b[0] - a[0]);

  const stickyVerticalOffset = useStickyOffset({
    diagramEl: diagramElement,
    participantTop: props.offsetTop2 || 0,
    stickyOffset: stickyOffset || 0,
    enabled: mode !== RenderMode.Static,
  });

  const backgroundColor = props.entity.color
    ? removeAlpha(props.entity.color)
    : undefined;
  const color = useMemo(() => {
    if (!props.entity.color) {
      return undefined;
    }
    const bgColor =
      elRef.current &&
      window
        .getComputedStyle(elRef.current)
        .getPropertyValue("background-color");
    if (!bgColor) {
      return undefined;
    }
    return brightnessIgnoreAlpha(bgColor) > 128 ? "#000" : "#fff";
  }, [props.entity.color]);
  const icon = isDefaultStarter
    ? iconPath["actor"]
    : iconPath[props.entity.type?.toLowerCase() as "actor"];

  const isInIframe = useMemo(() => window.self !== window.top, []);
  const style: CSSProperties = {
    backgroundColor: isDefaultStarter ? undefined : backgroundColor,
    color: isDefaultStarter ? undefined : color,
  };
  if (isInIframe) {
    style.transform = `translateY(${stickyVerticalOffset}px)`;
  } else {
    style.position = "sticky";
    style.top = `${stickyOffset}px`;
  }

  return (
    <div
      className={cn(
        "participant bg-skin-participant shadow-participant border-skin-participant text-skin-participant rounded text-base leading-4 flex flex-col justify-center z-10 h-10 top-8",
        { selected: selected.includes(props.entity.name) },
      )}
      ref={elRef}
      style={style}
      onClick={() => onSelect(props.entity.name)}
      data-participant-id={props.entity.name}
    >
      <div className="flex items-center justify-center">
        {icon && (
          <div
            className="h-6 w-6 mr-1 flex-shrink-0 [&>svg]:w-full [&>svg]:h-full"
            aria-description={`icon for ${props.entity.name}`}
            dangerouslySetInnerHTML={{
              __html: icon,
            }}
          />
        )}

        {!isDefaultStarter && (
          <div className="h-5 group flex flex-col justify-center">
            {props.entity.stereotype && (
              <label className="interface leading-4">
                «{props.entity.stereotype}»
              </label>
            )}
            <ParticipantLabel
              labelText={
                props.entity.assignee
                  ? props.entity.name.split(":")[1]
                  : props.entity.label || props.entity.name
              }
              labelPositions={labelPositions}
              assignee={props.entity.assignee}
              assigneePositions={assigneePositions}
            />
          </div>
        )}
      </div>
    </div>
  );
};
