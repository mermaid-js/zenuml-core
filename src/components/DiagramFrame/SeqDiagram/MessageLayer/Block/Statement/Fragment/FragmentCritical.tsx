import CommentClass from "@/components/Comment/Comment";
import { Comment } from "../Comment/Comment";
import { Numbering } from "../../../Numbering";
import { CollapseButton } from "./CollapseButton";
import { cn } from "@/utils";
import { Block } from "../../Block";
import "./FragmentCritical.css";
import Icon from "@/components/Icon/Icons";
import { DebugLabel } from "../DebugLabel";
import { useState, useEffect } from "react";

// Extended interface for TreeVMBuilder data structure
interface ExtendedCriticalVM {
  blockVM: any;
  paddingLeft: number;
  offsetX: number;
  width: number;
  leftParticipant: string;
  rightParticipant: string;
  condition?: string;
  conditionVM?: {
    labelText: string;
    labelRange: any;
    codeRange: any;
  };
}

export const FragmentCritical = (props: {
  vm?: ExtendedCriticalVM | null; // VM provides TreeVMBuilder structure
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
  const leftParticipant = vm?.leftParticipant;

  const label = vm?.condition ?? "Critical";

  return (
    <div className={props.className}>
      <div
        className="group fragment fragment-critical critical border-skin-fragment rounded"
        style={{
          transform: `translateX(${(offsetX + 1) * -1}px)`,
          width: `${width}px`,
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
                <Icon name="critical-fragment" />
                <CollapseButton
                  label={label}
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
        </div>

        <div className={collapsed ? "hidden" : ""}>
          <div className="segment">
            <div className="text-skin-fragment flex">{/* Value */}</div>
            {vm?.blockVM && (
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
    </div>
  );
};
