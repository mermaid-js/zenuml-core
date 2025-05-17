import CommentClass from "@/components/Comment/Comment";
import { useFragmentData } from "./useFragmentData";
import { Numbering } from "../../../Numbering";
import { Comment } from "../Comment/Comment";
import { MessageLabel } from "../../../MessageLabel";

export const FragmentRef = (props: {
  context: any;
  origin: string;
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
}) => {
  const { paddingLeft, fragmentStyle, border, leftParticipant } =
    useFragmentData(props.context, props.origin);
  const content = props.context.ref().Content();
  const contentLabel = content.value?.getFormattedText();
  const contentPosition: [number, number] = [
    content.value?.start.start,
    content.value?.stop.stop,
  ];

  return (
    <div className={props.className}>
      <div
        data-origin={leftParticipant}
        data-left-participant={leftParticipant}
        data-frame-padding-left={border.left}
        data-frame-padding-right={border.right}
        className="group fragment fragment-ref bg-skin-frame border-skin-fragment relative rounded min-w-[140px] w-max py-4 px-2 flex justify-center items-center flex-col"
        style={{ ...fragmentStyle, paddingLeft: `${paddingLeft}px` }}
      >
        <div className="header bg-skin-fragment-header text-skin-fragment-header leading-4 rounded-t absolute top-0 left-0">
          <Numbering number={props.number} />
          {props.commentObj?.text && (
            <Comment
              className="absolute -top-4 left-0"
              comment={props.comment}
              commentObj={props.commentObj}
            />
          )}
          <div className="text-skin-fragment relative w-9 h-8 -top-[1px] -left-[1px]">
            <div className="polygon-border absolute inset-0"></div>
            <div className="polygon-content bg-skin-frame text-skin-fragment-header absolute inset-[1px] flex flex-col items-center justify-center">
              <span
                className={`flex items-center justify-center font-semibold ${props.commentObj?.messageClassNames || ""}`}
                style={props.commentObj?.messageStyle}
              >
                Ref
              </span>
            </div>
          </div>
        </div>
        <MessageLabel
          className="text-skin-title mt-3 mb-2"
          labelText={contentLabel}
          labelPosition={contentPosition}
        />
      </div>
    </div>
  );
};
