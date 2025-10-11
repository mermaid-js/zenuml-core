import CommentVM from "@/components/Comment/Comment";
import Icon from "@/components/Icon/Icons";
import {
  FRAGMENT_BORDER_WIDTH,
  FRAGMENT_HEADER_HEIGHT,
  MESSAGE_HEIGHT,
} from "@/positioning/Constants";
import { cn } from "@/utils";
import { Numbering } from "../../../Numbering";
import { Block } from "../../Block";
import { CollapseButton } from "./CollapseButton";
import { ConditionLabel } from "./ConditionLabel";
import { useFragmentData } from "./useFragmentData";
import { Comment } from "../Comment/Comment";
import "./FragmentLoop.css";

export const FragmentLoop = (props: {
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

  const loop = props.context.loop();
  const blockInLoop = loop?.braceBlock()?.block();
  const condition = loop?.parExpr()?.condition();
  const commentHeight = props.commentVM?.getHeight() ?? 0;
  const conditionHeight = condition ? MESSAGE_HEIGHT : 0;
  const blockTop =
    (props.top ?? 0) +
    commentHeight +
    FRAGMENT_HEADER_HEIGHT +
    conditionHeight;

  return (
    <div className={props.className}>
      <div
        data-origin={origin}
        data-left-participant={leftParticipant}
        data-frame-padding-left={border.left}
        data-frame-padding-right={border.right}
        className="group fragment fragment-loop loop border-skin-fragment rounded"
        style={fragmentStyle}
      >
        {props.commentVM?.text && (
          <Comment comment={props.comment} commentVM={props.commentVM} />
        )}
        <div className="header text-skin-fragment-header bg-skin-fragment-header leading-4 relative rounded-t">
          <Numbering number={props.number} />
          <div className="name font-semibold p-1 border-b">
            <label className="p-0 flex items-center gap-0.5">
              <Icon name="loop-fragment" />
              <CollapseButton
                label="Loop"
                collapsed={collapsed}
                onClick={toggleCollapse}
                style={props.commentVM?.messageStyle}
                className={cn(props.commentVM?.messageClassNames)}
              />
            </label>
          </div>
        </div>
        <div className={cn({ hidden: collapsed })}>
          <div className="segment">
            <div className="text-skin-fragment">
              <ConditionLabel condition={condition} />
            </div>
            <Block
              origin={leftParticipant}
              style={{ paddingLeft: `${paddingLeft}px` }}
              context={blockInLoop}
              number={`${props.number}.1`}
              incremental
              top={blockTop}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
