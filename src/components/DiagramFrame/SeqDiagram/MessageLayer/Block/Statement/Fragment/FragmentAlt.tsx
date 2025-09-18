import CommentClass from "@/components/Comment/Comment";
import { CollapseButton } from "./CollapseButton";
import { Block } from "../../Block";
import { useFragmentData } from "./useFragmentData";
import { Comment } from "../Comment/Comment";
import { Numbering } from "../../../Numbering";
import { cn } from "@/utils";
import { ConditionLabel } from "./ConditionLabel";
import "./FragmentAlt.css";
import { Fragment } from "react";
import Icon from "@/components/Icon/Icons";
import type { AltVM } from "@/vm/fragments";

export const FragmentAlt = (props: {
  origin: string;
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
  vm?: AltVM;
}) => {
  // Use VM data exclusively (fail early if missing)
  const vm = props.vm;
  if (!vm) {
    throw new Error("FragmentAlt: Missing VM data - AltVM building not implemented yet");
  }

  // Use VM data exclusively
  const blockLengthAcc = vm.blockLengthAcc || [];

  const {
    collapsed,
    toggleCollapse,
    paddingLeft,
    fragmentStyle,
    leftParticipant,
  } = useFragmentData(null, props.origin); // Pass null since we're VM-only

  return (
    <div
      data-origin={props.origin}
      data-left-participant={props.origin}
      data-frame-padding-left={props.commentObj?.messageStyle?.paddingLeft}
      data-frame-padding-right={props.commentObj?.messageStyle?.paddingRight}
      className={cn(
        "group fragment fragment-alt alt border-skin-fragment rounded",
        props.className,
      )}
      style={fragmentStyle}
    >
      <div className="segment">
        {props.commentObj?.text && (
          <Comment comment={props.comment} commentObj={props.commentObj} />
        )}
        <div className="header bg-skin-fragment-header text-skin-fragment-header leading-4 rounded-t relative">
          <Numbering number={props.number} />
          <div className="name font-semibold p-1 border-b">
            <label className="p-0 flex items-center gap-0.5">
              <Icon name="alt-fragment" />
              <CollapseButton
                label="Alt"
                collapsed={collapsed}
                onClick={toggleCollapse}
                style={props.commentObj?.messageStyle}
                className={cn(props.commentObj?.messageClassNames)}
              />
            </label>
          </div>
        </div>
      </div>

      <div className={collapsed ? "hidden" : "block"}>
        <div className="segment">
          <div className="text-skin-fragment flex">
            {vm.ifConditionVM && (
              <ConditionLabel condition={null} vm={vm.ifConditionVM} />
            )}
          </div>
          {vm.ifBlockVM && (
            <Block
              origin={leftParticipant}
              style={{ paddingLeft: `${paddingLeft}px` }}
              vm={vm.ifBlockVM}
              number={`${props.number}.1`}
              incremental
            />
          )}
        </div>
        {vm.elseIfBlocks?.map((elseIfVM: any, index: number) => (
          <Fragment key={index}>
            <div
              className="segment mt-2 border-t border-solid"
              key={index + 500}
            >
              <div className="text-skin-fragment" key={index + 1000}>
                <label className="else-if hidden">else if</label>
                {elseIfVM.conditionVM && (
                  <ConditionLabel condition={null} vm={elseIfVM.conditionVM} />
                )}
              </div>
              {elseIfVM.blockVM && (
                <Block
                  origin={leftParticipant}
                  style={{ paddingLeft: `${paddingLeft}px` }}
                  vm={elseIfVM.blockVM}
                  key={index + 2000}
                  number={`${props.number}.${blockLengthAcc[index] + 1}`}
                  incremental
                />
              )}
            </div>
          </Fragment>
        ))}
        {vm.elseBlockVM && (
          <>
            <div className="segment mt-2 border-t border-solid">
              <div className="text-skin-fragment">
                <label className="p-1">[else]</label>
              </div>
              <Block
                origin={leftParticipant}
                style={{ paddingLeft: `${paddingLeft}px` }}
                vm={vm.elseBlockVM}
                number={`${props.number}.${
                  blockLengthAcc[blockLengthAcc.length - 1] + 1
                }`}
                incremental
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
