import CommentClass from "@/components/Comment/Comment";
import { cn } from "@/utils";
import { SelfInvocation } from "./SelfInvocation/SelfInvocation";
import { Message } from "../Message/Message";
import { Occurrence } from "./Occurrence/Occurrence";
import { useAtomValue } from "jotai";
import { cursorAtom } from "@/store/Store";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { Comment } from "../Comment/Comment";
import { useArrow } from "../useArrow";
import { syncMessageNormalizer } from "@/utils/messageNormalizers";

export const Interaction = (props: {
  context: any;
  origin: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
}) => {
  const cursor = useAtomValue(cursorAtom);
  const messageTextStyle = props.commentObj?.messageStyle;
  const messageClassNames = props.commentObj?.messageClassNames;
  const message = props.context?.message();
  const signature = message?.SignatureText();
  const isCurrent = message?.isCurrent(cursor);
  const source = message?.From() || _STARTER_;
  const target = props.context?.message()?.Owner() || _STARTER_;
  const isSelf = source === target;
  const signatureCtx = message?.messageBody().func()?.signature()[0];
  const [start, stop] = [signatureCtx?.start.start, signatureCtx?.stop.stop];
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
          className={cn(messageClassNames)}
          labelPosition={[start, stop]}
          textStyle={messageTextStyle}
          context={message}
          content={signature}
          rtl={rightToLeft}
          number={props.number}
          type="sync"
          normalizeText={syncMessageNormalizer}
        />
      )}
      <Occurrence
        context={message}
        participant={target}
        rtl={rightToLeft}
        number={props.number}
        textStyle={messageTextStyle}
        messageClassNames={messageClassNames}
        isSelf={isSelf}
        interactionWidth={isSelf ? undefined : interactionWidth}
      />
    </div>
  );
};
