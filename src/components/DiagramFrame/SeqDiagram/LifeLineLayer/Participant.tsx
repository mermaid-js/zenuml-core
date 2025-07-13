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
import iconPath from "../../Tutorial/Icons";
import { ParticipantLayout } from "@/domain/models/DiagramLayout";
import { diagramLayoutAtom, domainModelAtom } from "@/domain/DomainModelStore";

const INTERSECTION_ERROR_MARGIN = 10;

/**
 * Internal component that renders using pre-calculated layout
 */
const ParticipantWithLayout = ({
  layout,
  offsetTop2,
}: {
  layout: ParticipantLayout;
  offsetTop2?: number;
}) => {
  const elRef = useRef<HTMLDivElement>(null);
  const mode = useAtomValue(modeAtom);
  const diagramElement = useAtomValue(diagramElementAtom);
  const stickyOffset = useAtomValue(stickyOffsetAtom);
  const selected = useAtomValue(selectedAtom);
  const onSelect = useSetAtom(onSelectAtom);
  const intersectionTop = useIntersectionTop();
  const [scrollTop] = useDocumentScroll();

  const isDefaultStarter = layout.participantId === _STARTER_;

  const calcOffset = () => {
    const participantOffsetTop = offsetTop2 || 0;
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

  const backgroundColor = layout.style?.backgroundColor;
  const color = useMemo(() => {
    if (!backgroundColor) {
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
  }, [backgroundColor]);
  
  const icon = isDefaultStarter
    ? iconPath["actor"]
    : iconPath[layout.type?.toLowerCase() as "actor"];

  return (
    <div
      className={cn(
        "participant bg-skin-participant shadow-participant border-skin-participant text-skin-participant rounded text-base leading-4 flex flex-col justify-center z-10 h-10 top-8",
        { selected: selected.includes(layout.participantId) },
      )}
      ref={elRef}
      style={{
        backgroundColor: isDefaultStarter ? undefined : backgroundColor,
        color: isDefaultStarter ? undefined : color,
        transform: `translateY(${stickyVerticalOffset}px)`,
      }}
      onClick={() => onSelect(layout.participantId)}
      data-participant-id={layout.participantId}
    >
      <div className="flex items-center justify-center">
        {icon && (
          <div
            className="h-6 w-6 mr-1 flex-shrink-0 [&>svg]:w-full [&>svg]:h-full"
            aria-description={`icon for ${layout.participantId}`}
            dangerouslySetInnerHTML={{
              __html: icon,
            }}
          />
        )}

        {!isDefaultStarter && (
          <div className="h-5 group flex flex-col justify-center">
            {layout.stereotype && (
              <label className="interface leading-4">
                «{layout.stereotype}»
              </label>
            )}
            <ParticipantLabel
              labelText={layout.label}
              labelPositions={layout.labelPositions || []}
              assignee={layout.isAssignee}
              assigneePositions={layout.assigneePositions || []}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const Participant = (props: {
  entity?: Record<string, string>;
  participantId?: string;
  layoutData?: ParticipantLayout;
  offsetTop2?: number;
}) => {
  // If layout data is provided, use the new rendering path
  if (props.layoutData) {
    return <ParticipantWithLayout layout={props.layoutData} offsetTop2={props.offsetTop2} />;
  }
  
  // Try to get layout data from the new architecture if participantId is provided
  if (props.participantId) {
    const diagramLayout = useAtomValue(diagramLayoutAtom);
    const participantLayout = diagramLayout?.participants.find(
      p => p.participantId === props.participantId
    );
    if (participantLayout) {
      return <ParticipantWithLayout layout={participantLayout} offsetTop2={props.offsetTop2} />;
    }
  }
  
  // Otherwise, fall back to the original implementation
  if (!props.entity) {
    console.warn('Participant: Neither layoutData, participantId with valid layout, nor entity provided');
    return null;
  }
  
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
