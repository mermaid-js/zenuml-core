import { cn } from "@/utils";
import { Message } from "../Message";
import { Occurrence } from "../Interaction/Occurrence/Occurrence";
import { CodeRange } from "@/parser/CodeRange";
import {
  LIFELINE_WIDTH,
  OCCURRENCE_BAR_SIDE_WIDTH,
  CREATION_MESSAGE_HEIGHT,
} from "@/positioning/Constants";
import CommentVM from "@/components/Comment/Comment";
import { useAtomValue, useSetAtom } from "jotai";
import {
  cursorAtom,
  onElementClickAtom,
  participantMessagesAtom,
} from "@/store/Store";
import {
  removeParticipantMessage,
  upsertParticipantMessage,
} from "@/store/participantMessages";
import { Comment } from "../Comment/Comment";
import { useEffect, useMemo, useRef, useState } from "react";
import { useArrow } from "../useArrow";
import { _STARTER_ } from "@/parser/OrderedParticipants";

export const Creation = (props: {
  context: any;
  origin: any;
  comment?: string;
  commentVM?: CommentVM;
  number?: string;
  className?: string;
  top?: number;
}) => {
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const cursor = useAtomValue(cursorAtom);
  const onElementClick = useAtomValue(onElementClickAtom);
  const setParticipantMessages = useSetAtom(participantMessagesAtom);
  const [participantWidth, setParticipantWidth] = useState(0);
  const creation = props.context?.creation();
  const target = creation?.Owner();
  const isCurrent = creation?.isCurrent(cursor);

  const { translateX, interactionWidth, rightToLeft } = useArrow({
    context: props.context,
    origin: props.origin,
    source: props.origin,
    target: creation?.Owner(),
  });

  const messageTextStyle = props.commentVM?.messageStyle;
  const messageClassNames = props.commentVM?.messageClassNames;

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

  // Calculate accumulated top with comment
  const messageTop = useMemo(() => {
    console.log("messageTop in creation.tsx1", props.top);
    let top = props.top ?? 0;
    if (props.commentVM) {
      top += props.commentVM.getHeight();
    }
    console.log("messageTop in creation.tsx2", top);
    return top;
  }, [props.top, props.commentVM]);

  const messageId = useMemo(() => {
    if (!target) return undefined;
    return props.number || `${target}-${messageTop}`;
  }, [props.number, target, messageTop]);

  // Record message in store
  useEffect(() => {
    if (!target || target === _STARTER_ || !messageId) return;

    setParticipantMessages((prev) =>
      upsertParticipantMessage(prev, target, {
        id: messageId,
        type: "creation",
        top: messageTop,
      }),
    );

    return () =>
      setParticipantMessages((prev) =>
        removeParticipantMessage(prev, target, messageId),
      );
  }, [target, messageTop, messageId, setParticipantMessages]);

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
      {props.comment && <Comment commentVM={props.commentVM} />}
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
          style={{ width: `calc(100% - ${containerOffset}px)` }}
        />
      </div>
      <Occurrence
        context={creation}
        className="pointer-events-auto"
        participant={target}
        number={props.number}
        top={messageTop + CREATION_MESSAGE_HEIGHT}
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
