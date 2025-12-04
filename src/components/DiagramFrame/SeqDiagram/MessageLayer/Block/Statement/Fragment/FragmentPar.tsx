import CommentClass from "@/components/Comment/Comment";
import { useFragmentData } from "./useFragmentData";
import { Comment } from "../Comment/Comment";
import { Numbering } from "../../../Numbering";
import { CollapseButton } from "./CollapseButton";
import { cn } from "@/utils";
import { Block } from "../../Block";
import { ConditionLabel } from "./ConditionLabel";
import "./FragmentPar.css";
import Icon from "@/components/Icon/Icons";

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
  const condition = par?.parExpr()?.condition();

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
            <label className="p-0 flex items-center gap-0.5">
              <Icon name="par-fragment" />
              <CollapseButton
                label="Par"
                collapsed={collapsed}
                onClick={toggleCollapse} // Assuming 'this.toggle' is accessible or replace with appropriate handler
                style={props.commentObj?.messageStyle}
                className={cn(props.commentObj?.messageClassNames)}
              />
            </label>
          </div>
        </div>
        <div className={cn({ hidden: collapsed })}>
          <div className="segment">
            {condition && (
              <div className="text-skin-fragment">
                <ConditionLabel condition={condition} />
              </div>
            )}
            {!!par.braceBlock() && (
              <Block
                origin={leftParticipant}
                className="[&>.statement-container:not(:first-child)]:border-t"
                style={{ paddingLeft: `${paddingLeft}px` }}
                context={par.braceBlock().block()}
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
