import CommentVM from "@/components/Comment/Comment";
import Icon from "@/components/Icon/Icons";
import { FRAGMENT_HEADER_HEIGHT, FRAGMENT_BORDER_WIDTH } from "@/positioning/Constants";
import { cn } from "@/utils";
import { Numbering } from "../../../Numbering";
import { Block } from "../../Block";
import { CollapseButton } from "./CollapseButton";
import { useFragmentData } from "./useFragmentData";
import { Comment } from "../Comment/Comment";

export const FragmentOpt = (props: {
  context: any;
  origin: string;
  comment?: string;
  commentVM?: CommentVM;
  number?: string;
  className?: string;
  top?: number;
}) => {
  const opt = props.context.opt();
  const commentHeight = props.commentVM?.getHeight() ?? 0;
  const blockTop =
    (props.top ?? 0) + commentHeight + FRAGMENT_HEADER_HEIGHT;
  const {
    collapsed,
    toggleCollapse,
    paddingLeft,
    fragmentStyle,
    border,
    leftParticipant,
  } = useFragmentData(props.context, props.origin);
  return (
    <div
      data-origin={origin}
      data-left-participant={leftParticipant}
      data-frame-padding-left={border.left}
      data-frame-padding-right={border.right}
      className={cn(
        "group fragment opt border-skin-fragment rounded",
        props.className,
      )}
      style={fragmentStyle}
    >
      {props.commentVM?.text && (
        <Comment comment={props.comment} commentVM={props.commentVM} />
      )}
      <div className="header bg-skin-fragment-header text-skin-fragment-header leading-4 relative">
        <Numbering number={props.number} />
        <div className="name font-semibold p-1 border-b">
          <label className="p-0 flex items-center gap-0.5">
            <Icon name="opt-fragment" />
            <CollapseButton
              label="Opt"
              collapsed={collapsed}
              onClick={toggleCollapse}
              style={props.commentVM?.textStyle}
              className={cn(props.commentVM?.classNames)}
            />
          </label>
        </div>
      </div>
      <Block
        origin={leftParticipant}
        className={cn({ hidden: collapsed })}
        style={{ paddingLeft: `${paddingLeft}px` }}
        context={opt?.braceBlock()?.block()}
        number={`${props.number}.1`}
        incremental
        top={blockTop}
      />
    </div>
  );
};
