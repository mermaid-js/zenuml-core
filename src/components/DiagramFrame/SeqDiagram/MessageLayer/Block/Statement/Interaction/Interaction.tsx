import CommentVM from "@/components/Comment/Comment";
import { cn } from "@/utils";
import { SelfInvocation } from "./SelfInvocation/SelfInvocation";
import { Message } from "../Message";
import { Occurrence } from "./Occurrence/Occurrence";
import { useAtomValue, useSetAtom } from "jotai";
import { cursorAtom, participantMessagesAtom } from "@/store/Store";
import {
  removeParticipantMessage,
  upsertParticipantMessage,
} from "@/store/participantMessages";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { Comment } from "../Comment/Comment";
import { useArrow } from "../useArrow";
import { MESSAGE_HEIGHT, SELF_INVOCATION_SYNC_HEIGHT } from "@/positioning/Constants";
import { useEffect, useMemo } from "react";

export const Interaction = (props: {
  context: any;
  origin: string;
  commentVM?: CommentVM;
  number?: string;
  className?: string;
  top?: number;
}) => {
  const cursor = useAtomValue(cursorAtom);
  const setParticipantMessages = useSetAtom(participantMessagesAtom);
  const messageTextStyle = props.commentVM?.messageStyle;
  const messageClassNames = props.commentVM?.messageClassNames;
  const message = props.context?.message();
  const statements = message?.Statements();
  const assignee = message?.Assignment()?.getText() || "";
  const signature = message?.SignatureText();
  const isCurrent = message?.isCurrent(cursor);
  const source = message?.From() || _STARTER_;
  const target = props.context?.message()?.Owner() || _STARTER_;
  const isSelf = source === target;

  const {
    translateX,
    interactionWidth,
    originLayers,
    sourceLayers,
    targetLayers,
    rightToLeft,
  } = useArrow({
    context: props.context,
    origin: props.origin,
    source,
    target,
  });

  // Calculate accumulated top with comment
  const messageTop = useMemo(() => {
    let top = props.top ?? 0;
    if (props.commentVM) {
      top += props.commentVM.getHeight();
    }
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
        type: "sync",
        top: messageTop,
      }),
    );

    return () =>
      setParticipantMessages((prev) =>
        removeParticipantMessage(prev, target, messageId),
      );
  }, [target, messageTop, messageId, setParticipantMessages]);

  return (
    <div
      className={cn(
        "interaction sync inline-block",
        {
          highlight: isCurrent,
          self: isSelf,
          "right-to-left": rightToLeft,
        },
        props.className,
      )}
      onClick={(e) => e.stopPropagation()}
      data-to={target}
      data-origin={props.origin}
      data-source={source}
      data-target={target}
      data-origin-layers={originLayers}
      data-source-layers={sourceLayers}
      data-target-layers={targetLayers}
      data-type="interaction"
      data-signature={signature}
      style={{
        width: isSelf ? undefined : interactionWidth + "px",
        transform: "translateX(" + translateX + "px)",
      }}
    >
      {props.commentVM?.text && <Comment commentVM={props.commentVM} />}
      {isSelf ? (
        <SelfInvocation
          classNames={messageClassNames}
          textStyle={messageTextStyle}
          context={message}
          number={props.number}
        />
      ) : (
        <Message
          className={cn("text-center", messageClassNames)}
          textStyle={messageTextStyle}
          context={message}
          content={signature}
          rtl={rightToLeft}
          number={props.number}
          type="sync"
        />
      )}
      <Occurrence
        context={message}
        participant={target}
        rtl={rightToLeft}
        number={props.number}
        top={messageTop + (isSelf ? SELF_INVOCATION_SYNC_HEIGHT : MESSAGE_HEIGHT)}
      />
      {assignee && !isSelf && (
        <Message
          className={cn(
            "return transform -translate-y-full",
            messageClassNames,
          )}
          context={message}
          content={assignee}
          rtl={!rightToLeft}
          type="return"
          number={`${props.number}.${statements.length + 1}`}
          textStyle={messageTextStyle}
        />
      )}
    </div>
  );
};
