import CommentVM from "@/components/Comment/Comment";
import Icon from "@/components/Icon/Icons";
import { FRAGMENT_HEADER_HEIGHT, FRAGMENT_BORDER_WIDTH } from "@/positioning/Constants";
import { cn } from "@/utils";
import { Numbering } from "../../../Numbering";
import { Block } from "../../Block";
import { CollapseButton } from "./CollapseButton";
import { useFragmentData } from "./useFragmentData";
import { Comment } from "../Comment/Comment";
import "./FragmentCritical.css";

export const FragmentCritical = (props: {
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

  const critical = props.context.critical();
  const braceBlock = critical?.braceBlock();
  const atom = critical?.atom()?.getFormattedText();
  const blockInCritical = braceBlock?.block();
  const commentHeight = props.commentVM?.getHeight() ?? 0;
  const blockTop =
    (props.top ?? 0) +
    commentHeight +
    FRAGMENT_HEADER_HEIGHT;

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
          {props.commentVM?.text && (
            <Comment comment={props.comment} commentVM={props.commentVM} />
          )}
          <div className="header bg-skin-fragment-header text-skin-fragment-header leading-4 rounded-t relative">
            <Numbering number={props.number} />
            <div className="name font-semibold p-1 border-b">
              <label className="p-0 flex items-center gap-0.5">
                <Icon name="critical-fragment" />
                <CollapseButton
                  label={label}
                  collapsed={collapsed}
                  onClick={toggleCollapse}
                  style={props.commentVM?.messageStyle}
                  className={cn(props.commentVM?.messageClassNames)}
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
                top={blockTop}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
