import CommentClass from "@/components/Comment/Comment";
import { cn } from "@/utils";
import { SelfInvocation } from "./SelfInvocation/SelfInvocation";
import { Message } from "../Message";
import { Occurrence } from "./Occurrence/Occurrence";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { Comment } from "../Comment/Comment";
import { useArrow } from "../useArrow";
import {
  cursorAtom,
  enableCurrentElementHighlightAtom,
  enableCurrentElementScrollIntoViewAtom,
} from "@/store/Store";
import { useEffect, useRef } from "react";
import { useAtomValue } from "jotai";
// import { handleScrollAndHighlight } from "@/parser/IsCurrent";
export const Interaction = (props: {
  context: any;
  origin: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
}) => {
  const messageTextStyle = props.commentObj?.messageStyle;
  const messageClassNames = props.commentObj?.messageClassNames;
  const message = props.context?.message();
  const statements = message?.Statements();
  const assignee = message?.Assignment()?.getText() || "";
  const signature = message?.SignatureText();
  const source = message?.From() || _STARTER_;
  const target = props.context?.message()?.Owner() || _STARTER_;
  const isSelf = source === target;
  const msgRef = useRef<HTMLDivElement>(null);
  const cursor = useAtomValue(cursorAtom);
  const enableCurrentElementHighlight = useAtomValue(
    enableCurrentElementHighlightAtom,
  );
  const enableCurrentElementScrollIntoView = useAtomValue(
    enableCurrentElementScrollIntoViewAtom,
  );
  const isCurrent = message?.isCurrent(cursor);

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

  useEffect(() => {
    // return handleScrollAndHighlight({
    //   ref: msgRef,
    //   isCurrent,
    //   enableCurrentElementScrollIntoView,
    //   enableCurrentElementHighlight,
    // });
  }, [
    isCurrent,
    enableCurrentElementScrollIntoView,
    enableCurrentElementHighlight,
  ]);

  return (
    <div
      className={cn(
        "interaction sync inline-block",
        {
          self: isSelf,
          "right-to-left": rightToLeft,
        },
        props.className,
      )}
      ref={msgRef}
      onClick={(e) => e.stopPropagation()}
      data-to={target}
      data-origin={origin}
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
      {props.commentObj?.text && <Comment commentObj={props.commentObj} />}
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
