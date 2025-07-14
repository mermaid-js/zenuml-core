import CommentClass from "@/components/Comment/Comment";
import { Comment } from "../Comment/Comment";
import { cn } from "@/utils";
import { Message } from "../Message";
import { useAtomValue } from "jotai";
import { onElementClickAtom } from "@/store/Store";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { CodeRange } from "@/parser/CodeRange";
import { SyntheticEvent } from "react";
import { useArrow } from "../useArrow";

/**
 * Return component with both old and new architecture support
 */
export const Return = (props: {
  // New architecture props  
  layoutData?: {
    signature: string;
    source: string;
    target: string;
    rightToLeft: boolean;
    isSelf: boolean;
    interactionWidth: number;
    translateX: number;
    comment?: string;
    commentObj?: CommentClass;
    number?: string;
    className?: string;
  };
  // Old architecture props (kept for compatibility)
  context?: any;
  origin?: string;
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
}) => {
  const onElementClick = useAtomValue(onElementClickAtom);

  // Determine if using new or old architecture
  const isNewArchitecture = !!props.layoutData;
  
  // For old architecture, pre-calculate values to pass to useArrow
  const ret = props.context?.ret();
  const asyncMessage = ret?.asyncMessage();
  const source = asyncMessage?.From() || ret?.From() || _STARTER_;
  const target =
    asyncMessage?.to()?.getFormattedText() ||
    props.context?.ret()?.ReturnTo() ||
    _STARTER_;
  
  // Always call useArrow hook to maintain hook order
  const arrowData = useArrow({
    context: props.context,
    origin: props.origin || '',
    source,
    target,
  });
  
  // For old architecture, calculate values as before
  let oldArchData = null;
  if (!isNewArchitecture && props.context && props.origin) {
    const signature =
      asyncMessage?.content()?.getFormattedText() ||
      props.context.ret()?.expr()?.getFormattedText();
    const messageContext = asyncMessage?.content() || props.context.ret()?.expr();
    
    oldArchData = {
      signature,
      source,
      target,
      messageContext,
      ...arrowData
    };
  }
  
  // Extract data based on architecture
  const data = isNewArchitecture
    ? {
        signature: props.layoutData!.signature,
        source: props.layoutData!.source,
        target: props.layoutData!.target,
        rightToLeft: props.layoutData!.rightToLeft,
        isSelf: props.layoutData!.isSelf,
        interactionWidth: props.layoutData!.interactionWidth,
        translateX: props.layoutData!.translateX,
        comment: props.layoutData!.comment,
        commentObj: props.layoutData!.commentObj,
        number: props.layoutData!.number,
        className: props.layoutData!.className,
        messageContext: null, // New architecture doesn't need this
      }
    : {
        signature: oldArchData!.signature,
        source: oldArchData!.source,
        target: oldArchData!.target,
        rightToLeft: oldArchData!.rightToLeft,
        isSelf: oldArchData!.isSelf,
        interactionWidth: oldArchData!.interactionWidth,
        translateX: oldArchData!.translateX,
        comment: props.comment,
        commentObj: props.commentObj,
        number: props.number,
        className: props.className,
        messageContext: oldArchData!.messageContext,
      };

  const onClick = (e: SyntheticEvent) => {
    e.stopPropagation();
    // Only call onElementClick if we have a context (old architecture)
    if (props.context) {
      onElementClick(CodeRange.from(props.context));
    }
  };
  
  return (
    // .relative to allow left style
    <div
      onClick={onClick}
      data-type="return"
      data-signature={data.signature}
      data-origin={props.origin || 'unknown'}
      data-to={data.target}
      data-source={data.source}
      data-target={data.target}
      className={cn(
        "interaction return relative",
        {
          "right-to-left": data.rightToLeft,
          highlight: false,
        },
        data.className,
      )}
      style={{
        width: data.interactionWidth + "px",
        transform: "translateX(" + data.translateX + "px)",
      }}
    >
      {data.comment && <Comment commentObj={data.commentObj} />}
      {data.isSelf && (
        <div className="flex items-center">
          <svg
            className="w-3 h-3 flex-shrink-0 fill-current m-1"
            viewBox="0 0 512 512"
          >
            <path
              className="cls-1"
              d="M256 0C114.84 0 0 114.84 0 256s114.84 256 256 256 256-114.84 256-256S397.16 0 256 0Zm0 469.33c-117.63 0-213.33-95.7-213.33-213.33S138.37 42.67 256 42.67 469.33 138.37 469.33 256 373.63 469.33 256 469.33Z"
            />
            <path
              className="cls-1"
              d="M288 192h-87.16l27.58-27.58a21.33 21.33 0 1 0-30.17-30.17l-64 64a21.33 21.33 0 0 0 0 30.17l64 64a21.33 21.33 0 0 0 30.17-30.17l-27.58-27.58H288a53.33 53.33 0 0 1 0 106.67h-32a21.33 21.33 0 0 0 0 42.66h32a96 96 0 0 0 0-192Z"
            />
          </svg>
          <span className="name">{data.signature}</span>
        </div>
      )}
      {!data.isSelf && (
        <Message
          className={cn(data.commentObj?.messageClassNames)}
          textStyle={data.commentObj?.messageStyle}
          context={data.messageContext}
          content={data.signature}
          rtl={data.rightToLeft}
          type="return"
          number={data.number}
        />
      )}
    </div>
  );
};
