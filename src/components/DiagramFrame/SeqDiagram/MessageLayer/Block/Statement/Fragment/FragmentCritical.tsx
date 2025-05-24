import CommentClass from "@/components/Comment/Comment";
import { useFragmentData } from "./useFragmentData";
import { Comment } from "../Comment/Comment";
import { Numbering } from "../../../Numbering";
import { CollapseButton } from "./CollapseButton";
import { cn } from "@/utils";
import { Block } from "../../Block";
import "./FragmentCritical.css";

export const FragmentCritical = (props: {
  context: any;
  origin: string;
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
}) => {
  const {
    collapsed,
    toggleCollapse,
    paddingLeft,
    fragmentStyle,
    border,
    leftParticipant,
  } = useFragmentData(props.context, props.origin);

  const critical = props.context.critical();
  const braceBlock = critical?.braceBlock();
  const atom = critical?.atom()?.getFormattedText();
  const blockInCritical = braceBlock?.block();

  const label = atom ? `Critical:${atom}` : "Critical";

  return (
    <div className={props.className}>
      <div
        data-origin={origin}
        data-left-participant={leftParticipant}
        data-frame-padding-left={border.left}
        data-frame-padding-right={border.right}
        className="group fragment fragment-critical critical border-skin-fragment rounded"
        style={fragmentStyle}
      >
        <div className="segment">
          {props.commentObj?.text && (
            <Comment comment={props.comment} commentObj={props.commentObj} />
          )}
          <div className="header bg-skin-fragment-header text-skin-fragment-header leading-4 rounded-t relative">
            <Numbering number={props.number} />
            <div className="name font-semibold p-1 border-b">
              <label className="p-0">
                <CollapseButton
                  label={label}
                  collapsed={collapsed}
                  onClick={toggleCollapse}
                  style={props.commentObj?.messageStyle}
                  className={cn(props.commentObj?.messageClassNames)}
                />
              </label>
            </div>
          </div>
        </div>

        <div className={collapsed ? "hidden" : ""}>
          <div className="segment">
            <div className="text-skin-fragment flex">{/* Value */}</div>
            {blockInCritical && (
              <Block
                origin={leftParticipant}
                style={{ paddingLeft: `${paddingLeft}px` }}
                context={blockInCritical}
                number={`${props.number}.1`}
                incremental
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
