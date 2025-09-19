import CommentClass from "@/components/Comment/Comment";
import { useFragmentData } from "./useFragmentData";
import { Comment } from "../Comment/Comment";
import { Numbering } from "../../../Numbering";
import { CollapseButton } from "./CollapseButton";
import { cn } from "@/utils";
import { Block } from "../../Block";
import "./FragmentPar.css";
import Icon from "@/components/Icon/Icons";
import type { FragmentData, ParVM } from "@/vm/fragments";

export const FragmentPar = (props: {
  fragmentData: FragmentData;
  vm?: ParVM | null; // VM provides block
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

  const vm = props.vm;

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
                onClick={toggleCollapse}
                style={props.commentObj?.messageStyle}
                className={cn(props.commentObj?.messageClassNames)}
              />
            </label>
          </div>
        </div>
        {vm?.blockVM && (
          <Block
            origin={leftParticipant}
            className={cn(
              "[&>.statement-container:not(:first-child)]",
              collapsed ? "hidden" : "",
            )}
            style={{ paddingLeft: `${paddingLeft}px` }}
            vm={vm.blockVM}
            number={`${props.number}.1`}
            incremental
          />
        )}
      </div>
    </div>
  );
};
