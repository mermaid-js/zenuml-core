import CommentClass from "@/components/Comment/Comment";
import { Comment } from "../Comment/Comment";
import { Numbering } from "../../../Numbering";
import { CollapseButton } from "./CollapseButton";
import { cn } from "@/utils";
import { Block } from "../../Block";
import "./FragmentTryCatchFinally.css";
import Icon from "@/components/Icon/Icons";
import { useState, useEffect } from "react";
import { DebugLabel } from "../DebugLabel";

// Extended interface for TreeVMBuilder data structure
interface ExtendedTcfVM {
  tryBlockVM: any;
  catchBlocks: Array<{ exceptionText: string; blockVM: any }>;
  finallyBlockVM: any;
  paddingLeft: number;
  offsetX: number;
  width: number;
}

export const FragmentTryCatchFinally = (props: {
  vm?: ExtendedTcfVM | null; // VM provides TreeVMBuilder structure
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

  const tcfVM = vm;

  return (
    <div className={props.className}>
      <div
        className="group fragment fragment-tcf tcf border-skin-fragment rounded"
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
                <Icon name="try-catch-fragment" />
                <CollapseButton
                  label="Try"
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
        <div className={collapsed ? "hidden" : ""}>
          <div className="segment">
            {tcfVM?.tryBlockVM && (
              <Block
                style={{ paddingLeft: `${paddingLeft}px` }}
                vm={tcfVM.tryBlockVM}
                number={`${props.number}.1`}
                incremental
              />
            )}
          </div>
          {tcfVM?.catchBlocks?.map((catchBlock: any, index: number) => (
            <div
              className="segment mt-2 border-t border-solid"
              key={index + 500}
            >
              <div
                className="header inline-block bg-skin-frame opacity-65"
                key={index + 1000}
              >
                <label className="keyword catch p-1">catch</label>
                <label className="exception p-1">{catchBlock.exceptionText}</label>
              </div>
              <Block
                style={{ paddingLeft: `${paddingLeft}px` }}
                vm={catchBlock.blockVM}
                key={index + 2000}
                number={`${props.number}.${index + 2}`}
                incremental
              />
            </div>
          ))}
          {tcfVM?.finallyBlockVM && (
            <div className="segment mt-2 border-t border-solid">
              <div className="header flex text-skin-fragment finally">
                <label className="keyword finally bg-skin-frame opacity-65 px-1 inline-block">
                  finally
                </label>
              </div>
              <Block
                style={{ paddingLeft: `${paddingLeft}px` }}
                vm={tcfVM.finallyBlockVM}
                number={`${props.number}.${2 + (tcfVM?.catchBlocks?.length || 0)}`}
                incremental
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
