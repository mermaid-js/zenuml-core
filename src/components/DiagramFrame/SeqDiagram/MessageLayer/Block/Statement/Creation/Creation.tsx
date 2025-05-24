import { cn } from "@/utils";
import { Message } from "../Message";
import { Occurrence } from "../Interaction/Occurrence/Occurrence";
import { Participant } from "@/components/DiagramFrame/SeqDiagram/LifeLineLayer/Participant";
import { CodeRange } from "@/parser/CodeRange";
import {
  LIFELINE_WIDTH,
  OCCURRENCE_BAR_SIDE_WIDTH,
} from "@/positioning/Constants";
import CommentClass from "@/components/Comment/Comment";
import { useAtomValue } from "jotai";
import { cursorAtom, onElementClickAtom } from "@/store/Store";
import { Comment } from "../Comment/Comment";
import { useEffect, useMemo, useRef } from "react";
import { useArrow } from "../useArrow";

export const Creation = (props: {
  context: any;
  origin: any;
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
}) => {
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const participantPlaceHolder = useRef<HTMLDivElement>(null);
  const cursor = useAtomValue(cursorAtom);
  const onElementClick = useAtomValue(onElementClickAtom);
  const creation = props.context?.creation();
  const target = creation?.Owner();
  const isCurrent = creation?.isCurrent(cursor);

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

  useEffect(() => {
    if (!participantPlaceHolder.current || !messageContainerRef.current) return;
    const halfWidthOfPlaceholder =
      participantPlaceHolder.current.offsetWidth / 2;
    // 100% width does not consider of the borders.
    messageContainerRef.current.style.width = `calc(100% + ${
      halfWidthOfPlaceholder + OCCURRENCE_BAR_SIDE_WIDTH
    }px)`;
    if (rightToLeft) {
      messageContainerRef.current.style.transform = `translateX( ${-(
        halfWidthOfPlaceholder +
        OCCURRENCE_BAR_SIDE_WIDTH +
        LIFELINE_WIDTH
      )}px`;
    }
  });

  return (
    <div
      data-origin={props.origin}
      className={cn(
        "interaction creation sync text-center transform",
        {
          "right-to-left": rightToLeft,
          "-translate-x-full-minus-1": rightToLeft,
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
          content={creation?.SignatureText()}
          rtl={rightToLeft}
          type="creation"
          number={props.number}
          textStyle={messageTextStyle}
        />
        <div
          ref={participantPlaceHolder}
          className="invisible right-0 flex flex-col justify-center flex-shrink-0"
        >
          <Participant entity={{ name: target }} />
        </div>
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
