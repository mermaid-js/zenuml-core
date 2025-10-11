import CommentClass from "@/components/Comment/Comment";
import { Comment } from "../Comment/Comment";
import { Numbering } from "../../../Numbering";
import { CollapseButton } from "./CollapseButton";
import { cn } from "@/utils";
import { Block } from "../../Block";
import "./FragmentPar.css";
import Icon from "@/components/Icon/Icons";
import { useState, useEffect } from "react";
import { DebugLabel } from "../DebugLabel";

// Extended ParVM interface that includes positioning data from TreeVMBuilder
interface ExtendedParVM {
  // Core fragment data
  blockVM: any;
  // Positioning data (from TreeVMBuilder)
  paddingLeft: number;
  offsetX: number;
  width: number;
  leftParticipant: string;
  rightParticipant: string;
}

export const FragmentPar = (props: {
  vm?: ExtendedParVM | null; // VM provides block and positioning
  commentObj?: CommentClass;
  number?: string;
  className?: string;
}) => {
  // Local state management (replaces useFragmentData collapsed state)
  const [collapsed, setCollapsed] = useState(false);
  
  
  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  const vm = props.vm;

  useEffect(() => {
    setCollapsed(false);
  }, [vm]);

  // Get positioning from VM (replaces useFragmentData positioning)
  const paddingLeft = vm?.paddingLeft || 0;
  const offsetX = vm?.offsetX || 0;
  const width = vm?.width || 100;

  return (
    <div className={props.className}>
      <div
        className="group fragment fragment-par par border-skin-fragment rounded"
        style={{
          transform: `translateX(${(offsetX + 1) * -1}px)`,
          width: `${width}px`,
          minWidth: `100px`,
        }}
      >
        {props.commentObj?.text && (
          <Comment commentObj={props.commentObj} />
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
              <DebugLabel 
                offsetX={offsetX}
              />
            </label>
          </div>
        </div>
        {vm?.blockVM && (
          <Block
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
