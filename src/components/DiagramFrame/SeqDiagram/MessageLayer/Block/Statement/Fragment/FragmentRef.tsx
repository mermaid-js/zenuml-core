import CommentClass from "@/components/Comment/Comment";
import { useFragmentData } from "./useFragmentData";
import { FragmentNumbering } from "./FragmentNumbering";
import { Comment } from "../Comment/Comment";
import { MessageLabel } from "../../../MessageLabel";
import { syncMessageNormalizer } from "@/utils/messageNormalizers";
import { labelRangeOfRef } from "@/parser/RefContext";

export const FragmentRef = (props: {
  context: any;
  origin: string;
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
}) => {
  const { paddingLeft, fragmentStyle, border, leftParticipant } =
    useFragmentData(props.context, props.origin, {
      label: "Ref",
      number: props.number,
    });
  const refContext = props.context.ref();
  const content = refContext.Content();
  const contentLabel = content?.getFormattedText();
  const contentPosition: [number, number] = labelRangeOfRef(refContext);

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
          {props.commentObj?.text && (
            <Comment
              className="absolute -top-4 left-0"
              comment={props.comment}
              commentObj={props.commentObj}
            />
          )}
          <div className="text-skin-fragment relative min-w-9 w-max h-8 -top-[1px] -left-[1px]">
            <div className="polygon-border absolute inset-0"></div>
            <div className="polygon-content bg-skin-frame text-skin-fragment-header relative m-px flex items-center justify-center">
              <span
                className={`flex items-center justify-center gap-0.5 whitespace-nowrap px-1 h-8 font-normal ${props.commentObj?.messageClassNames || ""}`}
                style={props.commentObj?.messageStyle}
              >
                <FragmentNumbering number={props.number} />
                <span className="fragment-type -translate-y-[1.5px] [font-variant-caps:all-small-caps]">
                  Ref
                </span>
              </span>
            </div>
          </div>
        </div>
        <MessageLabel
          className="text-skin-title mt-3 mb-2"
          labelText={contentLabel}
          labelPosition={contentPosition}
          normalizeText={syncMessageNormalizer}
        />
      </div>
    </div>
  );
};
