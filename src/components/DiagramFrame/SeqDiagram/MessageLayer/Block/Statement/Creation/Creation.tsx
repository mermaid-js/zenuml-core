import { cn } from "@/utils";
import { Message } from "../Message";
import { Occurrence } from "../Interaction/Occurrence/Occurrence";
import { codeRangeOf, formattedTextOf } from "@/parser/helpers";
import {
  LIFELINE_WIDTH,
  OCCURRENCE_BAR_SIDE_WIDTH,
} from "@/positioning/Constants";
import CommentClass from "@/components/Comment/Comment";
import { useAtomValue } from "jotai";
import { cursorAtom, onElementClickAtom, coordinatesAtom } from "@/store/Store";
import { Comment } from "../Comment/Comment";
import { useEffect, useMemo, useRef, useState } from "react";
import { EventBus } from "@/EventBus";
import type { MessageVM } from "@/vm/messages";
import { calculateArrowGeometry } from "../arrowGeometry";

export const Creation = (props: {
  context: any;
  origin: any;
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
  vm?: MessageVM & { arrow?: { translateX: number; interactionWidth: number; rightToLeft: boolean } };
}) => {
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const cursor = useAtomValue(cursorAtom);
  const onElementClick = useAtomValue(onElementClickAtom);
  const coordinates = useAtomValue(coordinatesAtom);
  const [participantWidth, setParticipantWidth] = useState(0);
  const creation = props.context?.creation();
  const vm = props.vm;

  // Use VM data if available, fallback to parser context
  const target = vm?.to ?? creation?.Owner();
  const signature = vm?.signature ?? creation?.SignatureText();
  const range = vm?.range ?? null;

  // Calculate isCurrent using range from VM
  const getIsCurrent = () => {
    const start = range ? range[0] : undefined;
    const endExclusive = range ? range[1] : undefined;
    if (
      cursor == null ||
      start == null ||
      endExclusive == null
    ) {
      return false;
    }
    return cursor >= start && cursor < endExclusive;
  };
  const isCurrent = getIsCurrent();

  // Use arrow geometry from VM with parity checking
  const { translateX, interactionWidth, rightToLeft } = useMemo(() => {
    if (vm?.arrow) {
      // Check parity with fallback calculation
      const fallbackCandidate = calculateArrowGeometry({
        context: props.context,
        origin: props.origin,
        source: props.origin,
        target: target,
        coordinates,
      });

      const translateXDiff = Math.abs(vm.arrow.translateX - fallbackCandidate.translateX);
      const widthDiff = Math.abs(vm.arrow.interactionWidth - fallbackCandidate.interactionWidth);
      const rtlMatch = vm.arrow.rightToLeft === fallbackCandidate.rightToLeft;

      if (translateXDiff > 0.1 || widthDiff > 0.1 || !rtlMatch) {
        console.warn("[creation] arrow geometry mismatch", {
          signature,
          vm: {
            translateX: vm.arrow.translateX,
            interactionWidth: vm.arrow.interactionWidth,
            rightToLeft: vm.arrow.rightToLeft,
          },
          fallback: {
            translateX: fallbackCandidate.translateX,
            interactionWidth: fallbackCandidate.interactionWidth,
            rightToLeft: fallbackCandidate.rightToLeft,
          },
          diffs: { translateXDiff, widthDiff, rtlMatch },
        });
      } else {
        console.log("[creation] arrow geometry parity ✓", {
          signature,
          translateX: vm.arrow.translateX,
          interactionWidth: vm.arrow.interactionWidth,
          rightToLeft: vm.arrow.rightToLeft,
        });
      }

      return vm.arrow;
    }

    // Fallback calculation
    const fallbackCandidate = calculateArrowGeometry({
      context: props.context,
      origin: props.origin,
      source: props.origin,
      target: target,
      coordinates,
    });

    return {
      translateX: fallbackCandidate.translateX,
      interactionWidth: fallbackCandidate.interactionWidth,
      rightToLeft: fallbackCandidate.rightToLeft,
    };
  }, [vm?.arrow, props.context, props.origin, target, coordinates, signature]);

  const messageTextStyle = props.commentObj?.messageStyle;
  const messageClassNames = props.commentObj?.messageClassNames;

  const assignee = useMemo(() => {
    const assignment = creation?.creationBody().assignment();
    if (!assignment) return "";
    const assignee = formattedTextOf(assignment.assignee?.());
    const type = formattedTextOf(assignment.type?.());
    return assignee + (type ? ":" + type : "");
  }, [creation]);

  const containerOffset =
    participantWidth / 2 - OCCURRENCE_BAR_SIDE_WIDTH - LIFELINE_WIDTH;

  useEffect(() => {
    const participantElement = document.querySelector(
      `[data-participant-id="${target}"]`,
    );

    if (!participantElement) {
      console.warn(`Could not find participant element for ${target}`);
      setParticipantWidth(0);
      return;
    }

    // Get the actual width from the DOM element
    setParticipantWidth(participantElement.getBoundingClientRect().width);
    console.debug(
      `Found participant element for ${target}, width: ${participantWidth}px`,
    );

    EventBus.emit("participant_set_top");
    console.debug(`Init or update message container for ${target}`);
  }, [target, participantWidth]);

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
        const codeRange = vm?.codeRange ?? codeRangeOf(props.context);
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
        data-to={target}
      >
        <Message
          className={cn(
            "invocation w-full transform -translate-y-1/2 pointer-events-auto",
            messageClassNames,
          )}
          context={creation}
          content={signature}
          rtl={rightToLeft}
          type="creation"
          number={props.number}
          textStyle={messageTextStyle}
          style={{ width: `calc(100% - ${containerOffset}px)` }}
          labelRangeOverride={vm?.labelRange ?? null}
        />
      </div>
      <Occurrence
        context={creation}
        className="pointer-events-auto"
        participant={target}
        number={props.number}
      />
      {assignee && (
        <Message
          className={cn(
            "return transform -translate-y-full pointer-events-auto",
            messageClassNames,
          )}
          textStyle={messageTextStyle}
          context={creation.creationBody().assignment()}
          content={assignee}
          rtl={!rightToLeft}
          type="return"
          number={`${props.number}.${creation.Statements().length + 1}`}
        />
      )}
    </div>
  );
};
