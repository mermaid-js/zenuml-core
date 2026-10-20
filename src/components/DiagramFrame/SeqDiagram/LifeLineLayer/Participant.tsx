import { getEmojiUnicode } from "@/emoji/resolveEmoji";
import useDocumentScroll from "@/functions/useDocumentScroll";
import useIntersectionTop from "@/functions/useIntersectionTop";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { PARTICIPANT_HEIGHT } from "@/positioning/Constants";
import {
  diagramElementAtom,
  modeAtom,
  onSelectAtom,
  participantPreviewAtom,
  participantsAtom,
  RenderMode,
  selectedAtom,
  stickyOffsetAtom,
} from "@/store/Store";
import { cn } from "@/utils";
import { participantTextColor, removeAlpha } from "@/utils/Color";
import { getElementDistanceToTop } from "@/utils/dom";
import { useAtomValue, useSetAtom } from "jotai";
import { useMemo, useRef, useState } from "react";
import { useActiveSurface, useCan } from "@/store/interaction/useCan";
import { ParticipantLabel } from "./ParticipantLabel";
import { AsyncIcon } from "../../Tutorial/AsyncIcon";
// import iconPath from "../../Tutorial/Icons"; // Removed eager import

const INTERSECTION_ERROR_MARGIN = 10;
// Read on first use, not at module load: this module is reachable from the
// package entry, which must import in Node (and in a browser that blocks site
// data) without throwing.
let participantDebug: boolean | undefined;
const isParticipantDebug = (): boolean => {
  if (participantDebug === undefined) {
    try {
      participantDebug = Boolean(localStorage.getItem("zenumlDebug"));
    } catch {
      participantDebug = false;
    }
  }
  return participantDebug;
};

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
  const selectParticipant = useSetAtom(onSelectAtom);
  const setSelected = useSetAtom(selectedAtom);
  // ADR 0002: selection is a capability. It is off in `RenderMode.Static`
  // and while another interaction owns the diagram; gate B consumes a press
  // the primary state does not allow before it gets here.
  const canSelect = useCan("select");
  const surface = useActiveSurface();
  const onSelect = (name: string) => {
    if (!canSelect) return;
    // The editor is open on another participant: the click switches it, so
    // the selection is replaced, not extended (a two-participant highlight is
    // not the editor). The press that precedes this click no longer exits
    // the editor, which keeps the mask and the row mounted across the switch.
    if (surface?.kind === "participantEditor") {
      // The open participant stays open; only click-away closes the editor.
      if (surface.participant === name) return;
      setSelected([name]);
      return;
    }
    selectParticipant(name);
  };
  const preview = useAtomValue(participantPreviewAtom);
  const [isEditingName, setIsEditingName] = useState(false);
  const intersectionTop = useIntersectionTop();
  const [scrollTop] = useDocumentScroll();

  const isDefaultStarter = props.entity.name === _STARTER_;

  const labelPositions = Array.from(
    participants.GetPositions(props.entity.name) ?? [],
  ).sort((a, b) => b[0] - a[0]);
  const assigneePositions = Array.from(
    participants.GetAssigneePositions(props.entity.name) ?? [],
  ).sort((a, b) => b[0] - a[0]);

  const calcOffset = () => {
    const participantOffsetTop = props.offsetTop2 || 0;
    let top = intersectionTop + scrollTop;
    if (intersectionTop > INTERSECTION_ERROR_MARGIN && stickyOffset !== false)
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
  const stickyVerticalOffset =
    mode === RenderMode.Static || stickyOffset === false ? 0 : calcOffset();

  const activePreview = preview?.name === props.entity.name ? preview : null;
  const effectiveColor = activePreview?.color ?? props.entity.color;
  const effectiveType = activePreview?.type ?? props.entity.type;

  const backgroundColor = effectiveColor
    ? removeAlpha(effectiveColor)
    : undefined;
  // Derive from the effective colour, not the DOM: during a preview the DOM
  // still shows the previous background when this memo runs.
  const color = useMemo(
    () => (backgroundColor ? participantTextColor(backgroundColor) : undefined),
    [backgroundColor],
  );

  // Determine icon key
  const iconKey = isDefaultStarter ? "actor" : effectiveType?.toLowerCase();

  return (
    <div
      className={cn(
        "participant bg-skin-participant shadow-participant border-skin-participant text-skin-participant rounded text-sm font-normal leading-4 flex flex-col justify-center z-10 h-10 top-8",
        {
          selected: selected.includes(props.entity.name),
          "ring-1 ring-sky-400":
            selected.includes(props.entity.name) && !isEditingName,
          "cursor-pointer": mode === RenderMode.Dynamic && !isDefaultStarter,
        },
      )}
      ref={elRef}
      style={{
        backgroundColor: isDefaultStarter ? undefined : backgroundColor,
        color: isDefaultStarter ? undefined : color,
        transform: `translateY(${stickyVerticalOffset}px)`,
        pointerEvents: "auto",
      }}
      onClick={() => onSelect(props.entity.name)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(props.entity.name);
        }
      }}
      tabIndex={
        mode === RenderMode.Dynamic && !isDefaultStarter ? 0 : undefined
      }
      role={
        mode === RenderMode.Dynamic && !isDefaultStarter ? "button" : undefined
      }
      title={
        mode === RenderMode.Dynamic && !isDefaultStarter
          ? "Click to style participant"
          : undefined
      }
      data-participant-id={props.entity.name}
      data-cap="select"
    >
      {isParticipantDebug() && (
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
          <div className="h-5 group flex flex-col items-center justify-center">
            {props.entity.stereotype && (
              <label className="interface leading-4">
                «{props.entity.stereotype}»
              </label>
            )}
            <div className="flex items-center">
              {props.entity.emoji && (
                <span
                  className="mr-1 flex-shrink-0"
                  data-testid="participant-emoji"
                >
                  {getEmojiUnicode(props.entity.emoji)}
                </span>
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
                onNameEditingChange={setIsEditingName}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
