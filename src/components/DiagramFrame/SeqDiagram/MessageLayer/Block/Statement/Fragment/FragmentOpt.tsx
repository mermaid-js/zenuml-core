import CommentClass from "@/components/Comment/Comment";
import { Comment } from "../Comment/Comment";
import { Numbering } from "../../../Numbering";
import { CollapseButton } from "./CollapseButton";
import { Block } from "../../Block";
import { cn } from "@/utils";
import Icon from "@/components/Icon/Icons";
import { DebugLabel } from "../DebugLabel";

// Extended interface for TreeVMBuilder data structure
interface ExtendedOptVM {
  blockVM: any;
  paddingLeft: number;
  offsetX: number;
  width: number;
  leftParticipant: string;
  rightParticipant: string;
  condition: string;
  conditionVM: {
    labelText: string;
    labelRange: any;
    codeRange: any;
  };
}
import { useState, useEffect } from "react";

export const FragmentOpt = (props: {
  vm?: ExtendedOptVM | null; // VM provides TreeVMBuilder structure
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
    <div
      className={cn(
        "group fragment opt border-skin-fragment rounded",
        props.className,
      )}
      style={{
        transform: `translateX(${(offsetX + 1) * -1}px)`,
        width: `${width}px`,
        minWidth: `100px`,
      }}
    >
      {props.commentObj?.text && (
        <Comment commentObj={props.commentObj} />
      )}
      <div className="header bg-skin-fragment-header text-skin-fragment-header leading-4 relative">
        <Numbering number={props.number} />
        <div className="name font-semibold p-1 border-b">
          <label className="p-0 flex items-center gap-0.5">
            <Icon name="opt-fragment" />
            <CollapseButton
              label={`Opt${vm?.condition ? ` ${vm.condition}` : ''}`}
              collapsed={collapsed}
              onClick={toggleCollapse}
              style={props.commentObj?.textStyle}
              className={cn(props.commentObj?.classNames)}
            />
            <DebugLabel 
              offsetX={offsetX}
            />
          </label>
        </div>
      </div>
      <Block
        className={cn({ hidden: collapsed })}
        style={{ paddingLeft: `${paddingLeft}px` }}
        vm={vm?.blockVM}
        number={`${props.number}.1`}
        incremental
      />
    </div>
  );
};
