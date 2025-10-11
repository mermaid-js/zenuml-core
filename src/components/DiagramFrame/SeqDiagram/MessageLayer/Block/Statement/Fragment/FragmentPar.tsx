import CommentVM from "@/components/Comment/Comment";
import Icon from "@/components/Icon/Icons";
import {
  FRAGMENT_HEADER_HEIGHT,
  FRAGMENT_BORDER_WIDTH,
} from "@/positioning/Constants";
import { cn } from "@/utils";
import { Numbering } from "../../../Numbering";
import { Block } from "../../Block";
import { CollapseButton } from "./CollapseButton";
import { useFragmentData } from "./useFragmentData";
import { Comment } from "../Comment/Comment";
import "./FragmentPar.css";

export const FragmentPar = (props: {
  context: any;
  origin: string;
  comment?: string;
  commentVM?: CommentVM;
  number?: string;
  className?: string;
  top?: number;
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
  const commentHeight = props.commentVM?.getHeight() ?? 0;
  const blockTop = (props.top ?? 0) + commentHeight + FRAGMENT_HEADER_HEIGHT;

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
        {props.commentVM?.text && (
          <Comment comment={props.comment} commentVM={props.commentVM} />
        )}
        <div className="header bg-skin-fragment-header text-skin-fragment-header leading-4 rounded-t relative">
          <Numbering number={props.number} />
          <div className="name font-semibold p-1 border-b">
            <label className="p-0 flex items-center gap-0.5">
              <Icon name="par-fragment" />
              <CollapseButton
                label="Par"
                collapsed={collapsed}
                onClick={toggleCollapse} // Assuming 'this.toggle' is accessible or replace with appropriate handler
                style={props.commentVM?.messageStyle}
                className={cn(props.commentVM?.messageClassNames)}
              />
            </label>
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
            top={blockTop}
          />
        )}
      </div>
    </div>
  );
};
