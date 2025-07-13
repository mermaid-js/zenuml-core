import useDocumentScroll from "@/functions/useDocumentScroll";
import useIntersectionTop from "@/functions/useIntersectionTop";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { PARTICIPANT_HEIGHT } from "@/positioning/Constants";
import {
  codeAtom,
  diagramElementAtom,
  dragParticipantAtom,
  modeAtom,
  onContentChangeAtom,
  onSelectAtom,
  participantsAtom,
  RenderMode,
  scaleAtom,
  selectedAtom,
  stickyOffsetAtom,
} from "@/store/Store";
import { cn } from "@/utils";
import { brightnessIgnoreAlpha, removeAlpha } from "@/utils/Color";
import { getElementDistanceToTop } from "@/utils/dom";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useMemo, useRef } from "react";
import { ParticipantLabel } from "./ParticipantLabel";
import iconPath from "../../Tutorial/Icons";

const INTERSECTION_ERROR_MARGIN = 10;

const formatName = (name: string) => (name.includes(" ") ? `"${name}"` : name);

export const Participant = (props: {
  entity: Record<string, string>;
  offsetTop2?: number;
}) => {
  const elRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useAtom(codeAtom);
  const mode = useAtomValue(modeAtom);
  const participants = useAtomValue(participantsAtom);
  const diagramElement = useAtomValue(diagramElementAtom);
  const stickyOffset = useAtomValue(stickyOffsetAtom);
  const selected = useAtomValue(selectedAtom);
  const onSelect = useSetAtom(onSelectAtom);
  const intersectionTop = useIntersectionTop();
  const [scrollTop] = useDocumentScroll();
  const [dragParticipant, setDragParticipant] = useAtom(dragParticipantAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);

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

  // We use this method to simulate sticky behavior. CSS sticky is not working out of an iframe.
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
  const icon = isDefaultStarter
    ? iconPath["actor"]
    : iconPath[props.entity.type?.toLowerCase() as "actor"];
  const scale = useAtomValue(scaleAtom);
  const handleDrag = () => {
    const {
      left = 0,
      top = 0,
      width = 0,
      height = 0,
    } = elRef.current?.getBoundingClientRect() || {};
    const diagramRect = diagramElement?.getBoundingClientRect();
    setDragParticipant({
      name: props.entity.name,
      x: (left + width / 2) / scale - (diagramRect?.left || 0),
      y: (top + height / 2) / scale - (diagramRect?.top || 0),
    });
  };
  const handleDrop = () => {
    if (dragParticipant && dragParticipant.name !== props.entity.name) {
      const isFromStarter = dragParticipant.name === _STARTER_;
      const newCode =
        code +
        (isFromStarter
          ? `\n${formatName(props.entity.name)}.message`
          : `\n${formatName(dragParticipant.name)} -> ${formatName(props.entity.name)}.message`);
      setCode(newCode);
      onContentChange(newCode);
    }
  };

  return (
    <div
      className={cn(
        "hover:shadow-[0_0_3px_2px_#0094D988] hover:shadow-participant-hover transition-shadow duration-200 cursor-pointer rounded",
        dragParticipant &&
          dragParticipant.name !== props.entity.name &&
          "cursor-copy",
      )}
    >
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
        onMouseDown={handleDrag}
        onMouseUp={handleDrop}
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
    </div>
  );
};
