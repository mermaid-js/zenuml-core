import useDocumentScroll from "@/functions/useDocumentScroll";
import useIntersectionTop from "@/functions/useIntersectionTop";
import { PARTICIPANT_HEIGHT } from "@/positioning/Constants";
import {
  diagramElementAtom,
  modeAtom,
  onSelectAtom,
  RenderMode,
  selectedAtom,
  stickyOffsetAtom,
} from "@/store/Store";
import { cn } from "@/utils";
import { brightnessIgnoreAlpha } from "@/utils/Color";
import { getElementDistanceToTop } from "@/utils/dom";
import { useAtomValue, useSetAtom } from "jotai";
import { useMemo, useRef } from "react";
import { ParticipantLabel } from "./ParticipantLabel";
import type { ParticipantVM } from "@/vm/participants";

const INTERSECTION_ERROR_MARGIN = 10;

export const Participant = (props: {
  vm: ParticipantVM;
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

  const color = useMemo(() => {
    if (!props.vm.color) {
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
  }, [props.vm.color]);

  return (
    <div
      className={cn(
        "participant bg-skin-participant shadow-participant border-skin-participant text-skin-participant rounded text-base leading-4 flex flex-col justify-center z-10 h-10 top-8",
        { selected: selected.includes(props.vm.name) },
      )}
      ref={elRef}
      style={{
        backgroundColor: props.vm.isDefaultStarter ? undefined : props.vm.backgroundColor,
        color: props.vm.isDefaultStarter ? undefined : color,
        transform: `translateY(${stickyVerticalOffset}px)`,
      }}
      onClick={() => onSelect(props.vm.name)}
      data-participant-id={props.vm.name}
    >
      <div className="flex items-center justify-center">
        {props.vm.icon && (
          <div
            className="h-6 w-6 mr-1 flex-shrink-0 [&>svg]:w-full [&>svg]:h-full"
            aria-description={`icon for ${props.vm.name}`}
            dangerouslySetInnerHTML={{
              __html: props.vm.icon,
            }}
          />
        )}

        {!props.vm.isDefaultStarter && (
          <div className="h-5 group flex flex-col justify-center">
            {props.vm.stereotype && (
              <label className="interface leading-4">
                «{props.vm.stereotype}»
              </label>
            )}
            <ParticipantLabel
              labelText={props.vm.displayName}
              labelPositions={props.vm.labelPositions}
              assignee={props.vm.assignee}
              assigneePositions={props.vm.assigneePositions}
            />
          </div>
        )}
      </div>
    </div>
  );
};
