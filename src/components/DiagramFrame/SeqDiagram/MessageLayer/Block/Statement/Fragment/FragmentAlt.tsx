import CommentClass from "@/components/Comment/Comment";
import { CollapseButton } from "./CollapseButton";
import { Block } from "../../Block";
import { Comment } from "../Comment/Comment";
import { Numbering } from "../../../Numbering";
import { cn } from "@/utils";
import { ConditionLabel } from "./ConditionLabel";
import "./FragmentAlt.css";
import { Fragment, useState, useEffect } from "react";
import { DebugLabel } from "../DebugLabel";
import Icon from "@/components/Icon/Icons";
import type { AltVM } from "@/vm/fragment-types";

// Extended AltVM interface that includes positioning data
interface ExtendedAltVM extends AltVM {
  // Positioning data (previously from useFragmentData)
  paddingLeft: number;
  offsetX: number;
  width: number;
}

export const FragmentAlt = (props: {
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
  vm: ExtendedAltVM; // VM data containing both content and positioning
}) => {
  // Use VM data exclusively (fail early if missing)
  const vm = props.vm;

  // Collapse state - manage locally (could be moved to VM later)
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapse = () => setCollapsed(prev => !prev);

  // Reset collapse state when VM changes
  useEffect(() => {
    setCollapsed(false);
  }, [vm]);

  // Extract data from VM
  const paddingLeft = vm.paddingLeft;

  return (
    <div
      data-frame-padding-left={props.commentObj?.messageStyle?.paddingLeft}
      data-frame-padding-right={props.commentObj?.messageStyle?.paddingRight}
      className={cn(
        "group fragment fragment-alt alt border-skin-fragment rounded",
        props.className,
      )}
      style={{
        transform: `translateX(${(vm.offsetX + 1) * -1}px)`,
        width: `${vm.width}px`,
        minWidth: `100px`,
      }}
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
              <DebugLabel 
              />
            </label>
          </div>
        </div>
      </div>

      <div className={collapsed ? "hidden" : "block"}>
        <div className="segment">
          <div className="text-skin-fragment flex">
            {vm.ifBlockVM?.ifConditionVM && <ConditionLabel vm={vm.ifBlockVM.ifConditionVM} />}
          </div>
          {vm.ifBlockVM && (
            <Block
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
                {elseIfVM.conditionVM && <ConditionLabel vm={elseIfVM.conditionVM} />}
              </div>
              {elseIfVM.blockVM && (
                <Block
                  style={{ paddingLeft: `${paddingLeft}px` }}
                  vm={elseIfVM.blockVM}
                  key={index + 2000}
                  number={`${props.number}.${index + 2}`}
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
                style={{ paddingLeft: `${paddingLeft}px` }}
                vm={vm.elseBlockVM}
                number={`${props.number}.${2 + (vm.elseIfBlocks?.length || 0)}`}
                incremental
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
