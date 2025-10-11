import CommentClass from "@/components/Comment/Comment";
import { Numbering } from "../../../Numbering";
import { Comment } from "../Comment/Comment";
import { MessageLabel } from "../../../MessageLabel";
import { DebugLabel } from "../DebugLabel";

export const FragmentRef = (props: {
  commentObj?: CommentClass;
  number?: string;
  className?: string;
  vm: any; // Full fragment VM containing refVM and positioning data
}) => {

  // Use VM for all data - positioning and content
  const fragmentVM = props.vm;
  
  // Get positioning from fragment VM
  const paddingLeft = fragmentVM?.paddingLeft || 0;
  const offsetX = fragmentVM?.offsetX || 0;
  const width = fragmentVM?.width || 140;

  // Get content from refVM within the fragment VM
  const contentLabel = fragmentVM?.refVM?.labelText || "";
  const contentPosition: [number, number] = fragmentVM?.refVM?.labelRange ?? [-1, -1];

  return (
    <div className={props.className}>
      <div
        className="group fragment fragment-ref bg-skin-frame border-skin-fragment relative rounded min-w-[140px] w-max py-4 px-2 flex justify-center items-center flex-col"
        style={{ 
          transform: `translateX(${(offsetX + 1) * -1}px)`,
          width: `${width}px`,
          minWidth: `140px`,
          paddingLeft: `${paddingLeft}px` 
        }}
      >
        <div className="header bg-skin-fragment-header text-skin-fragment-header leading-4 rounded-t absolute top-0 left-0">
          <Numbering number={props.number} />
          {props.commentObj && (
            <Comment
              className="absolute -top-4 left-0"
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
        <DebugLabel 
          offsetX={offsetX}
          style="absolute"
        />
      </div>
    </div>
  );
};
