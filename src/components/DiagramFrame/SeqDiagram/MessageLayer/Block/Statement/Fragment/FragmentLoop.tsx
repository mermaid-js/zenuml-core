import CommentClass from "@/components/Comment/Comment";
import { useFragmentData } from "./useFragmentData";
import { Comment } from "../Comment/Comment";
import { Numbering } from "../../../Numbering";
import { CollapseButton } from "./CollapseButton";
import { cn } from "@/utils";
import { ConditionLabel } from "./ConditionLabel";
import { Block } from "../../Block";
import "./FragmentLoop.css";
import Icon from "@/components/Icon/Icons";
import type { FragmentData, LoopVM } from "@/vm/fragments";

export const FragmentLoop = (props: {
  fragmentData: FragmentData;
  vm?: LoopVM | null; // VM provides condition and block (parser-free)
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
  } = useFragmentData(props.fragmentData, props.origin);

  const loopVM = props.vm;

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
        {props.commentObj?.text && (
          <Comment comment={props.comment} commentObj={props.commentObj} />
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
                style={props.commentObj?.messageStyle}
                className={cn(props.commentObj?.messageClassNames)}
              />
            </label>
          </div>
        </div>
        <div className={cn({ hidden: collapsed })}>
          <div className="segment">
            <div className="text-skin-fragment">
              {loopVM?.conditionVM ? (
                <ConditionLabel condition={null} vm={loopVM.conditionVM} />
              ) : null}
            </div>
            <Block
              origin={leftParticipant}
              style={{ paddingLeft: `${paddingLeft}px` }}
              vm={loopVM?.blockVM}
              number={`${props.number}.1`}
              incremental
            />
          </div>
        </div>
      </div>
    </div>
  );
};
