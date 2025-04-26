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

export const Return = (props: {
  context: any;
  comment: string;
  commentObj: CommentClass;
  number: string;
  origin: string;
  className?: string;
}) => {
  const onElementClick = useAtomValue(onElementClickAtom);

  const ret = props.context?.ret();

  const asyncMessage = ret?.asyncMessage();

  const signature =
    asyncMessage?.content()?.getFormattedText() ||
    props.context?.ret()?.expr()?.getFormattedText();
  const source = asyncMessage?.From() || ret?.From() || _STARTER_;

  const target =
    // TODO: move this logic to the parser (ReturnTo)
    asyncMessage?.to()?.getFormattedText() ||
    props.context?.ret()?.ReturnTo() ||
    _STARTER_;

  const messageContext =
    asyncMessage?.content() || props.context?.ret()?.expr();

  const { translateX, interactionWidth, rightToLeft, isSelf } = useArrow({
    context: props.context,
    origin: props.origin,
    source,
    target,
  });

  const onClick = (e: SyntheticEvent) => {
    e.stopPropagation();
    onElementClick(CodeRange.from(props.context));
  };
  return (
    // .relative to allow left style
    <div
      onClick={onClick}
      data-type="return"
      data-signature={signature}
      data-origin={origin}
      data-to={target}
      data-source={source}
      data-target={target}
      className={cn(
        "interaction return relative",
        {
          "right-to-left": rightToLeft,
          highlight: false,
        },
        props.className,
      )}
      style={{
        width: interactionWidth + "px",
        transform: "translateX(" + translateX + "px)",
      }}
    >
      {props.comment && <Comment commentObj={props.commentObj} />}
      {isSelf && (
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
          <span className="name">{signature}</span>
        </div>
      )}
      {!isSelf && (
        <Message
          className={cn(props.commentObj?.messageClassNames)}
          textStyle={props.commentObj?.messageStyle}
          context={messageContext}
          content={signature}
          rtl={rightToLeft}
          type="return"
          number={props.number}
        />
      )}
    </div>
  );
};
