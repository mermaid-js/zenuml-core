import CommentClass from "@/components/Comment/Comment";
import { useFragmentData } from "./useFragmentData";
import { Comment } from "../Comment/Comment";
import { Numbering } from "../../../Numbering";
import { CollapseButton } from "./CollapseButton";
import { cn } from "@/utils";
import { Block } from "../../Block";
import "./FragmentPar.css";

export const FragmentPar = (props: {
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

  const par = props.context.par();

  return (
    <div className={props.className}>
      <div
        data-origin={origin}
        data-left-participant={leftParticipant}
        data-frame-padding-left={border.left}
        data-frame-padding-right={border.right}
        className="group fragment fragment-par par border-skin-fragment rounded"
        style={fragmentStyle}
      >
        {props.commentObj?.text && (
          <Comment comment={props.comment} commentObj={props.commentObj} />
        )}
        <div className="header bg-skin-fragment-header text-skin-fragment-header leading-4 rounded-t relative">
          <Numbering number={props.number} />
          <div className="name font-semibold p-1 border-b">
            <CollapseButton
              label="Par"
              collapsed={collapsed}
              onClick={toggleCollapse} // Assuming 'this.toggle' is accessible or replace with appropriate handler
              style={props.commentObj?.messageStyle}
              className={cn(props.commentObj?.messageClassNames)}
            />
          </div>
        </div>
        {!!par.braceBlock() && (
          <Block
            origin={leftParticipant}
            className={cn(
              "[&>.statement-container:not(:first-child)]",
              collapsed ? "hidden" : "",
            )}
            style={{ paddingLeft: `${paddingLeft}px` }}
            context={par.braceBlock().block()}
            number={`${props.number}.1`}
            incremental
          />
        )}
      </div>
    </div>
  );
};
