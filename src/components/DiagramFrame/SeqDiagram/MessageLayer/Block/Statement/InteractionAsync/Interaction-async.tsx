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
import { Message } from "../Message";
import CommentClass from "@/components/Comment/Comment";
import { useAtomValue } from "jotai";
import { cursorAtom, onElementClickAtom } from "@/store/Store";
import { CodeRange } from "@/parser/CodeRange";
import { useArrow } from "../useArrow";
import { InteractionLayout } from "@/domain/models/DiagramLayout";

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
  layoutData?: InteractionLayout;
}) => {
  // Always call hooks to maintain order
  const cursor = useAtomValue(cursorAtom);
  const onElementClick = useAtomValue(onElementClickAtom);
  
  // Determine if using new or old architecture
  const isNewArchitecture = !!props.layoutData;
  
  // Pre-calculate values for useArrow hook (always called to maintain hook order)
  const asyncMessage = props.context?.asyncMessage();
  const signature = asyncMessage?.content()?.getFormattedText();
  const providedSource = asyncMessage?.ProvidedFrom();
  const source = providedSource || props.origin;
  const target = asyncMessage?.to()?.getFormattedText();
  const isSelf = source === target;

  // Always call useArrow hook to maintain hook order
  const arrowData = useArrow({
    context: props.context,
    origin: props.origin,
    source,
    target,
  });

  // For old architecture, calculate all values as before
  let oldArchData = null;
  if (!isNewArchitecture) {
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
    
    oldArchData = {
      asyncMessage,
      signature,
      source,
      target,
      isSelf,
      messageClassNames,
      messageTextStyle,
      isCurrent: getIsCurrent(),
      ...arrowData
    };
  }
  
  // Extract data based on architecture
  const data = isNewArchitecture
    ? {
        asyncMessage: null, // New architecture doesn't need raw context
        signature: props.layoutData!.signature,
        source: props.layoutData!.source,
        target: props.layoutData!.target,
        isSelf: props.layoutData!.isSelf,
        messageClassNames: props.commentObj?.messageClassNames,
        messageTextStyle: props.commentObj?.messageStyle,
        isCurrent: false, // TODO: Handle current state in new architecture
        translateX: props.layoutData!.translateX,
        interactionWidth: props.layoutData!.interactionWidth,
        rightToLeft: props.layoutData!.rightToLeft,
      }
    : oldArchData!;
  return (
    <div
      data-origin={props.origin}
      data-to={data.target}
      data-source={data.source}
      data-target={data.target}
      className={cn(
        "interaction async",
        {
          "left-to-right": !data.rightToLeft,
          "right-to-left": data.rightToLeft,
          highlight: data.isCurrent,
          "self-invocation": data.isSelf,
        },
        props.className,
      )}
      onClick={() => onElementClick(CodeRange.from(props.context))}
      data-signature={data.signature}
      style={{
        width: data.interactionWidth + "px",
        transform: "translateX(" + data.translateX + "px)",
      }}
    >
      {props.comment && <Comment commentObj={props.commentObj} />}
      {data.isSelf ? (
        <SelfInvocationAsync
          classNames={cn(data.messageClassNames)}
          textStyle={data.messageTextStyle}
          context={data.asyncMessage}
          number={props.number}
        />
      ) : (
        <Message
          layoutData={isNewArchitecture ? {
            content: data.signature,
            rtl: data.rightToLeft,
            type: "async",
            textStyle: data.messageTextStyle,
            className: cn(data.messageClassNames),
            number: props.number,
          } : undefined}
          className={cn(data.messageClassNames)}
          textStyle={data.messageTextStyle}
          context={data.asyncMessage}
          content={data.signature}
          rtl={data.rightToLeft}
          type="async"
          number={props.number}
        />
      )}
    </div>
  );
};
