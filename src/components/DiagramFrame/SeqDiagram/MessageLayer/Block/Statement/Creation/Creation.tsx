import { cn } from "@/utils";
import { Message } from "../Message";
import { Occurrence } from "../Interaction/Occurrence/Occurrence";
import {
  LIFELINE_WIDTH,
  OCCURRENCE_BAR_SIDE_WIDTH,
} from "@/positioning/Constants";
import CommentClass from "@/components/Comment/Comment";
import { useAtomValue } from "jotai";
import { coordinatesAtom, cursorAtom, onElementClickAtom, onMessageClickAtom } from "@/store/Store";
import { Comment } from "../Comment/Comment";
import { useEffect, useMemo, useRef, useState } from "react";
import { EventBus } from "@/EventBus";
import type { MessageVM } from "@/vm/messages";
import { buildOccurrenceVM } from "@/vm/occurrence";
import { centerOf, isCursorInRange } from "../utils";

export const Creation = (props: {
  origin: any;
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
  vm?: MessageVM & { arrow?: { translateX: number; interactionWidth: number; rightToLeft: boolean } };
}) => {
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const cursor = useAtomValue(cursorAtom);
  const coordinates = useAtomValue(coordinatesAtom);
  const onElementClick = useAtomValue(onElementClickAtom);
  const onMessageClick = useAtomValue(onMessageClickAtom);
  const [participantWidth, setParticipantWidth] = useState(0);
  const vm = props.vm;

  // Use VM data only
  const to = vm?.to;
  const signature = vm?.signature;
  const isCurrent = isCursorInRange(cursor, vm?.range ?? null);

  // Use arrow geometry from VM only (no parity checks)
  const { translateX, interactionWidth, rightToLeft } = useMemo(() => {
    if (!vm?.arrow) {
      console.warn("[creation] missing VM arrow; rendering with zero geometry", { signature });
      return { translateX: 0, interactionWidth: 0, rightToLeft: false };
    }
    return vm.arrow;
  }, [vm?.arrow, signature]);

  const messageTextStyle = props.commentObj?.messageStyle;
  const messageClassNames = props.commentObj?.messageClassNames;

  // Use assignee from VM (fail early if missing)
  const assignee = vm?.assignee || "";

  // Extract clean label text from VM signature for Message component
  const cleanLabelText = useMemo(() => {
    return vm?.signature?.match(/«([^»]+)»/)?.[1] || "";
  }, [vm?.signature]);

  const containerOffset =
    participantWidth / 2 - OCCURRENCE_BAR_SIDE_WIDTH - LIFELINE_WIDTH;

  useEffect(() => {
    const participantElement = document.querySelector(
      `[data-participant-id="${to}"]`,
    );

    if (!participantElement) {
      console.warn(`Could not find participant element for ${to}`);
      setParticipantWidth(0);
      return;
    }

    // Get the actual width from the DOM element
    setParticipantWidth(participantElement.getBoundingClientRect().width);
    console.debug(
      `Found participant element for ${to}, width: ${participantWidth}px`,
    );

    EventBus.emit("participant_set_top");
    console.debug(`Init or update message container for ${to}`);
  }, [to, participantWidth]);

  return (
    <div
      data-origin={props.origin}
      className={cn(
        "interaction creation sync",
        {
          "right-to-left": rightToLeft,
          highlight: isCurrent,
        },
        props.className,
      )}
      onClick={() => {
        const codeRange = vm?.codeRange;
        if (codeRange) onElementClick(codeRange);
      }}
      data-signature={signature}
      style={{
        transform: "translateX(" + translateX + "px)",
        width: interactionWidth + "px",
      }}
    >
      {props.comment && <Comment commentObj={props.commentObj} />}
      <div
        ref={messageContainerRef}
        data-type="creation"
        className={cn(
          "message-container pointer-events-none flex items-center h-10 relative",
          { "flex-row-reverse": rightToLeft },
        )}
        data-to={to}
      >
        <Message
          className={cn(
            "invocation w-full transform -translate-y-1/2 pointer-events-auto",
            messageClassNames,
          )}
          labelText={cleanLabelText}
          rtl={rightToLeft}
          type="creation"
          number={props.number}
          textStyle={messageTextStyle}
          style={{ width: `calc(100% - ${containerOffset}px)` }}
          labelRangeOverride={vm?.labelRange ?? null}
          editableOverride={vm?.canEditLabel ?? false}
          onOpenStylePanel={(element) => {
            if (!element || !vm?.codeRange) return;
            onMessageClick(vm.codeRange, element);
          }}
        />
      </div>
      {(() => {
        const occurrenceVM = buildOccurrenceVM(vm, to as any, centerOf(coordinates, String(to)), rightToLeft);
        return occurrenceVM ? (
          <Occurrence
            className="pointer-events-auto"
            participant={to}
            number={props.number}
            vm={occurrenceVM}
          />
        ) : null;
      })()}
      {assignee && (
        <Message
          className={cn(
            "return transform -translate-y-full pointer-events-auto",
            messageClassNames,
          )}
          textStyle={messageTextStyle}
          labelText={assignee}
          rtl={!rightToLeft}
          type="return"
          number={`${props.number}.${(vm?.statementsCount ?? 0) + 1}`}
        />
      )}
    </div>
  );
};
