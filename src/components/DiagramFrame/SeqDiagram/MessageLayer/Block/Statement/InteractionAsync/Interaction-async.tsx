// A Interaction-async component is to render:
// 1. A->B: non-self async message
// 2. A->A: self async message

/**
 * source, target, from, to, provided from, origin
 *
 * # target
 * "Message" is the core concept of the sequence diagram. It is a message that is sent from one participant to another.
 *
 * `target` is the participant that receives the message. When target is not in the DSL, it is not a valid message.
 *
 * # origin/source/from
 *
 * When the `target` receives a sync message, it automatically becomes the `origin` of child messages. By default,
 * the `origin` is the `source` or `from` of the child messages.
 *
 * There are two special cases:
 * a. Messages at root level do not have an `origin` specified in DSL. Their `origin` is always _STARTER_.
 * b. Messages can also have arbitrarily specified `source` in the DSL. This is called "provided from".
 *    This does not change the `origin`. If origin != source, the message is called "out-of-band".
 *
 * `source` and `from` are the same.
 *
 * origin = root ? ownableMessages[0].from || _STARTER_ : passed on from parent # rendering concept
 * source = providedSource || ctx.Origin() || _STARTER_                         # parsing concept
 * target = ctx.to() || ctx.Owner()                                             # parsing concept
 *
 * outOfBand = source != origin
 *
 * ## common cases
 * code                               | source/from    | target/to  | provided source | origin     | out-of-band
 * A.method()                           _STARTER_        A            null            _STARTER_
 * A->B.method()                        A                B            A               A
 * A->B: message                        A                B            A               A
 * A.method() {
 *   B.method()                         A                B            null            A
 * }
 *
 * a()                                 _STARTER_         _STARTER_    null            _STARTER_
 * a() {                               _STARTER_         _STARTER_    null            _STARTER_
 *   b()                               _STARTER_         _STARTER_    null            _STARTER_
 *   A.method()                        _STARTER_         A            null            _STARTER_
 * }
 *
 * if(x) {
 *   a()                               _STARTER_         _STARTER_    null            _STARTER_
 * }
 *
 * A.method() {
 *   self() {
 *     B.method()                         A                B            null           A
 *     B->B.method()                      B                B            B              A            true
 *     B->B: message                      B                B            B              A            true
 *     B->C.method()                      B                C            B              A            true
 *     B->C: message                      B                C            B              A            true
 *   }
 * }
 *
 * The following is a good example that shows `origin` and `out-of-band` are pure rendering time concepts.
 * Those are decided during the mounting phase. So passing origin at component level is proper.
 * if(x) {
 *   A->A.method()
 *   self()                              _STARTER_         _STARTER_    null           A            true
 * }
 *
 */

import { cn } from "@/utils";
import { Comment } from "../Comment/Comment";
import { SelfInvocationAsync } from "./SelfInvocationAsync/SelfInvocationAsync";
import { Message } from "../Message/Message";
import CommentClass from "@/components/Comment/Comment";
import { useAtomValue } from "jotai";
import { cursorAtom, onElementClickAtom } from "@/store/Store";
import { CodeRange } from "@/parser/CodeRange";
import { useArrow } from "../useArrow";
import { asyncMessageNormalizer } from "@/utils/messageNormalizers";

function isNullOrUndefined(value: any) {
  return value === null || value === undefined;
}

export const InteractionAsync = (props: {
  context: any;
  origin: string;
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
}) => {
  const cursor = useAtomValue(cursorAtom);
  const onElementClick = useAtomValue(onElementClickAtom);
  const asyncMessage = props.context?.asyncMessage();
  const signature = asyncMessage?.content()?.getFormattedText();
  const providedSource = asyncMessage?.ProvidedFrom();
  const source = providedSource || props.origin;
  const target = asyncMessage?.to()?.getFormattedText();
  const isSelf = source === target;

  const { translateX, interactionWidth, rightToLeft } = useArrow({
    context: props.context,
    origin: props.origin,
    source,
    target,
  });

  const messageClassNames = props.commentObj?.messageClassNames;
  const messageTextStyle = props.commentObj?.messageStyle;
  const getIsCurrent = () => {
    const start = asyncMessage.start.start;
    const stop = asyncMessage.stop.stop + 1;
    if (
      isNullOrUndefined(cursor) ||
      isNullOrUndefined(start) ||
      isNullOrUndefined(stop)
    )
      return false;
    return cursor! >= start && cursor! <= stop;
  };
  return (
    <div
      data-origin={origin}
      data-to={target}
      data-source={source}
      data-target={target}
      className={cn(
        "interaction async",
        {
          "left-to-right": !rightToLeft,
          "right-to-left": rightToLeft,
          highlight: getIsCurrent(),
          "self-invocation": isSelf,
        },
        props.className,
      )}
      onClick={() => onElementClick(CodeRange.from(props.context))}
      data-signature={signature}
      style={{
        width: interactionWidth + "px",
        transform: "translateX(" + translateX + "px)",
      }}
    >
      {props.comment && <Comment commentObj={props.commentObj} />}
      {isSelf ? (
        <SelfInvocationAsync
          classNames={cn(messageClassNames)}
          textStyle={messageTextStyle}
          context={asyncMessage}
          number={props.number}
        />
      ) : (
        <Message
          className={cn(messageClassNames)}
          textStyle={messageTextStyle}
          context={asyncMessage}
          content={signature}
          rtl={rightToLeft}
          type="async"
          number={props.number}
          normalizeText={asyncMessageNormalizer}
        />
      )}
    </div>
  );
};
