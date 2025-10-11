import CommentClass from "@/components/Comment/Comment";
import { Comment } from "../Comment/Comment";
import { Numbering } from "../../../Numbering";
import { CollapseButton } from "./CollapseButton";
import { Block } from "../../Block";
import { capitalize } from "radash";
import { cn } from "@/utils";
import "./FragmentSection.css";
import Icon from "@/components/Icon/Icons";
import type { SectionVM } from "@/vm/fragment-types";
import { useState, useEffect } from "react";
import { DebugLabel } from "../DebugLabel";

// Extended interface for TreeVMBuilder data structure
interface ExtendedSectionVM extends SectionVM {
  paddingLeft: number;
  offsetX: number;
  width: number;
}

export const FragmentSection = (props: {
  vm?: ExtendedSectionVM | null; // VM provides TreeVMBuilder structure
  commentObj?: CommentClass;
  number?: string;
  className?: string;
}) => {
  // Local state management (replaces useFragmentData collapsed state)
  const [collapsed, setCollapsed] = useState(false);
  
  
  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  const sectionVM = props.vm;

  useEffect(() => {
    setCollapsed(false);
  }, [sectionVM]);

  // Get positioning from VM (replaces useFragmentData positioning)
  const paddingLeft = sectionVM?.paddingLeft || 0;
  const offsetX = sectionVM?.offsetX || 0;
  const width = sectionVM?.width || 100;

  const label = sectionVM?.labelText ?? capitalize("section");

  return (
    <div className={props.className}>
      <div
        className="group fragment fragment-section section border-skin-fragment rounded"
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
                <Icon name="section-fragment" />
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
            <div className="text-skin-fragment flex"></div>
            {sectionVM?.blockVM && (
              <Block
                style={{ paddingLeft: `${paddingLeft}px` }}
                vm={sectionVM.blockVM}
                number={props.number}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
