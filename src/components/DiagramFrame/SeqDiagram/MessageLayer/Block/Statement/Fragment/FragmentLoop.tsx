import CommentClass from "@/components/Comment/Comment";
import { Comment } from "../Comment/Comment";
import { Numbering } from "../../../Numbering";
import { CollapseButton } from "./CollapseButton";
import { cn } from "@/utils";
import { ConditionLabel } from "./ConditionLabel";
import { Block } from "../../Block";
import "./FragmentLoop.css";
import Icon from "@/components/Icon/Icons";
import { useState, useEffect } from "react";
import { DebugLabel } from "../DebugLabel";
import type { LoopVM } from "@/vm/fragment-types";

// Extended LoopVM interface that includes positioning data
interface ExtendedLoopVM extends LoopVM {
  // Positioning data (previously from useFragmentData)
  paddingLeft: number;
  offsetX: number;
  width: number;
  leftParticipant: string;
}

export const FragmentLoop = (props: {
  commentObj?: CommentClass;
  number?: string;
  className?: string;
  vm: ExtendedLoopVM; // VM data containing both content and positioning
}) => {
  // Use VM data exclusively (fail early if missing)
  const vm = props.vm;
  if (!vm) {
    throw new Error("FragmentLoop: Missing VM data - ExtendedLoopVM required");
  }

  // Collapse state - manage locally (could be moved to VM later)
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapse = () => setCollapsed(prev => !prev);

  // Reset collapse state when VM changes
  useEffect(() => {
    setCollapsed(false);
  }, [vm]);

  // Extract data from VM
  const paddingLeft = vm.paddingLeft;
  const leftParticipant = vm.leftParticipant;

 
  return (
    <div
      className={cn(
        "group fragment fragment-loop loop border-skin-fragment rounded",
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
          <Comment commentObj={props.commentObj} />
        )}
        <div className="header bg-skin-fragment-header text-skin-fragment-header leading-4 rounded-t relative">
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
              <DebugLabel 
                origin={vm.origin}
                leftParticipant={leftParticipant}
                offsetX={vm.offsetX}
              />
            </label>
          </div>
        </div>
      </div>

      <div className={collapsed ? "hidden" : "block"}>
        <div className="segment">
          <div className="text-skin-fragment">
            {vm.conditionVM ? <ConditionLabel vm={vm.conditionVM} /> : null}
          </div>
          {vm.blockVM && (
            <Block
              style={{ paddingLeft: `${paddingLeft}px` }}
              vm={vm.blockVM}
              number={`${props.number}.1`}
              incremental
            />
          )}
        </div>
      </div>
    </div>
  );
};
