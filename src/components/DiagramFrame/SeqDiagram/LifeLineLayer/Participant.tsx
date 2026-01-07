import useDocumentScroll from "@/functions/useDocumentScroll";
import useIntersectionTop from "@/functions/useIntersectionTop";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { PARTICIPANT_HEIGHT } from "@/positioning/Constants";
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
import { getElementDistanceToTop } from "@/utils/dom";
import { useAtomValue, useSetAtom } from "jotai";
import { useMemo, useRef } from "react";
import { ParticipantLabel } from "./ParticipantLabel";
import { AsyncIcon } from "../../Tutorial/AsyncIcon";
// import iconPath from "../../Tutorial/Icons"; // Removed eager import

const INTERSECTION_ERROR_MARGIN = 10;
const PARTICIPANT_DEBUG = Boolean(localStorage.getItem("zenumlDebug"));

export const Participant = (props: {
  entity: Record<string, string>;
  offsetTop2?: number;
}) => {
  // ... (hooks remain same)
  const elRef = useRef<HTMLDivElement>(null);
  const mode = useAtomValue(modeAtom);
  const participants = useAtomValue(participantsAtom);
  const diagramElement = useAtomValue(diagramElementAtom);
  const stickyOffset = useAtomValue(stickyOffsetAtom);
  const selected = useAtomValue(selectedAtom);
  const onSelect = useSetAtom(onSelectAtom);
  const intersectionTop = useIntersectionTop();
  const [scrollTop] = useDocumentScroll();

  const isDefaultStarter = props.entity.name === _STARTER_;

  const labelPositions = Array.from(
    (participants.GetPositions(props.entity.name) as [number, number][]) ?? [],
  ).sort((a, b) => b[0] - a[0]);
  const assigneePositions = Array.from(
    (participants.GetAssigneePositions(props.entity.name) as [
      number,
      number,
    ][]) ?? [],
  ).sort((a, b) => b[0] - a[0]);

  const calcOffset = () => {
    const participantOffsetTop = props.offsetTop2 || 0;
    let top = intersectionTop + scrollTop;
    if (intersectionTop > INTERSECTION_ERROR_MARGIN && stickyOffset)
      top += stickyOffset;
    const diagramHeight = diagramElement?.clientHeight || 0;
    const diagramTop = diagramElement
      ? getElementDistanceToTop(diagramElement)
      : 0;
    if (top < participantOffsetTop + diagramTop) return 0;
    return (
      Math.min(top - diagramTop, diagramHeight - PARTICIPANT_HEIGHT - 50) -
      participantOffsetTop
    );
  };

  const stickyVerticalOffset = mode === RenderMode.Static ? 0 : calcOffset();

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

  // Determine icon key
  const iconKey = isDefaultStarter
    ? "actor"
    : props.entity.type?.toLowerCase();

  return (
    <div
      className={cn(
        "participant bg-skin-participant shadow-participant border-skin-participant text-skin-participant rounded text-base leading-4 flex flex-col justify-center z-10 h-10 top-8",
        { selected: selected.includes(props.entity.name) },
      )}
      ref={elRef}
      style={{
        backgroundColor: isDefaultStarter ? undefined : backgroundColor,
        color: isDefaultStarter ? undefined : color,
        transform: `translateY(${stickyVerticalOffset}px)`,
      }}
      onClick={() => onSelect(props.entity.name)}
      data-participant-id={props.entity.name}
    >
      {PARTICIPANT_DEBUG && (
        <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-8 h-[2px] bg-amber-700">
          <div className="w-full h-full bg-black" />
        </div>
      )}
      <div className="flex items-center justify-center">
        {iconKey && (
          <AsyncIcon
            iconKey={iconKey}
            className="h-6 w-6 mr-1 flex-shrink-0 [&>svg]:w-full [&>svg]:h-full"
            alt={`icon for ${props.entity.name}`}
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
