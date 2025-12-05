import { cn } from "@/utils";
import { Message } from "../Message/Message";
import { Occurrence } from "../Interaction/Occurrence/Occurrence";
import { CodeRange } from "@/parser/CodeRange";
import {
  LIFELINE_WIDTH,
  OCCURRENCE_BAR_SIDE_WIDTH,
} from "@/positioning/Constants";
import CommentClass from "@/components/Comment/Comment";
import { useAtomValue } from "jotai";
import { cursorAtom, onElementClickAtom } from "@/store/Store";
import { Comment } from "../Comment/Comment";
import { useEffect, useMemo, useRef, useState } from "react";
import { useArrow } from "../useArrow";
import { EventBus } from "@/EventBus";
import { syncMessageNormalizer } from "@/utils/messageNormalizers";

export const Creation = (props: {
  context: any;
  origin: any;
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
}) => {
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const cursor = useAtomValue(cursorAtom);
  const onElementClick = useAtomValue(onElementClickAtom);
  const [participantWidth, setParticipantWidth] = useState(0);
  const creation = props.context?.creation();
  const target = creation?.Owner();
  const isCurrent = creation?.isCurrent(cursor);
  const signature = creation?.creationBody()?.parameters();
  const [start, stop] = [signature?.start.start, signature?.stop.stop];


  const { translateX, interactionWidth, rightToLeft } = useArrow({
    context: props.context,
    origin: props.origin,
    source: props.origin,
    target: creation?.Owner(),
  });

  const messageTextStyle = props.commentObj?.messageStyle;
  const messageClassNames = props.commentObj?.messageClassNames;

  const assignee = useMemo(() => {
    function safeCodeGetter(context: any) {
      return (context && context.getFormattedText()) || "";
    }
    const assignment = creation?.creationBody().assignment();
    if (!assignment) return "";
    const assignee = safeCodeGetter(assignment.assignee());
    const type = safeCodeGetter(assignment.type());
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
      onClick={() => onElementClick(CodeRange.from(props.context))}
      data-signature={creation?.SignatureText()}
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
          labelPosition1={[start, stop]}
          readonly={!props.context?.creation()?.isParamValid?.()}
          content={creation?.SignatureText()}
          rtl={rightToLeft}
          type="creation"
          number={props.number}
          textStyle={messageTextStyle}
          style={{ width: `calc(100% - ${containerOffset}px)`, translate: 0 }}
          normalizeText={syncMessageNormalizer}
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
          style={{ translate: 0 }}
          textStyle={messageTextStyle}
          context={creation.creationBody().assignment()}
          content={assignee}
          rtl={!rightToLeft}
          type="return"
          number={`${props.number}.${creation.Statements().length + 1}`}
          normalizeText={syncMessageNormalizer}
        />
      )}
    </div>
  );
};
