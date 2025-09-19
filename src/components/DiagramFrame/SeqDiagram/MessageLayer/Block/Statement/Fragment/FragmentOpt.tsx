import CommentClass from "@/components/Comment/Comment";
import { useFragmentData } from "./useFragmentData";
import { Comment } from "../Comment/Comment";
import { Numbering } from "../../../Numbering";
import { CollapseButton } from "./CollapseButton";
import { Block } from "../../Block";
import { cn } from "@/utils";
import Icon from "@/components/Icon/Icons";
import type { FragmentData, OptVM } from "@/vm/fragments";

export const FragmentOpt = (props: {
  fragmentData: FragmentData;
  vm?: OptVM | null; // VM provides block
  origin: string;
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
}) => {
  const vm = props.vm;
  const {
    collapsed,
    toggleCollapse,
    paddingLeft,
    fragmentStyle,
    border,
    leftParticipant,
  } = useFragmentData(props.fragmentData, props.origin);
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
      {props.commentObj?.text && (
        <Comment comment={props.comment} commentObj={props.commentObj} />
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
              style={props.commentObj?.textStyle}
              className={cn(props.commentObj?.classNames)}
            />
          </label>
        </div>
      </div>
      <Block
        origin={leftParticipant}
        className={cn({ hidden: collapsed })}
        style={{ paddingLeft: `${paddingLeft}px` }}
        vm={vm?.blockVM}
        number={`${props.number}.1`}
        incremental
      />
    </div>
  );
};
