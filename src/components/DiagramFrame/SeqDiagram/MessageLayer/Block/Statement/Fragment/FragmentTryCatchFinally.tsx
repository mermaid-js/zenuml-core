import CommentClass from "@/components/Comment/Comment";
import { useFragmentData } from "./useFragmentData";
import { Comment } from "../Comment/Comment";
import { Numbering } from "../../../Numbering";
import { CollapseButton } from "./CollapseButton";
import { cn } from "@/utils";
import { Block } from "../../Block";
import { blockLength } from "@/utils/Numbering";
import "./FragmentTryCatchFinally.css";
import Icon from "@/components/Icon/Icons";
import type { FragmentData, TcfVM } from "@/vm/fragments";

export const FragmentTryCatchFinally = (props: {
  fragmentData: FragmentData;
  vm?: TcfVM | null; // VM provides try/catch/finally blocks and labels
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

  const tcfVM = props.vm;

  return (
    <div className={props.className}>
      <div
        data-origin={props.origin}
        data-left-participant={leftParticipant}
        data-frame-padding-left={border.left}
        data-frame-padding-right={border.right}
        className="group fragment fragment-tcf tcf border-skin-fragment rounded"
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
                <Icon name="try-catch-fragment" />
                <CollapseButton
                  label="Try"
                  collapsed={collapsed}
                  onClick={toggleCollapse}
                  style={props.commentObj?.messageStyle}
                  className={cn(props.commentObj?.messageClassNames)}
                />
              </label>
            </div>
          </div>
        </div>
        <div className={collapsed ? "hidden" : ""}>
          <div className="segment">
            {tcfVM?.tryBlockVM && (
              <Block
                origin={leftParticipant}
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
                origin={leftParticipant}
                style={{ paddingLeft: `${paddingLeft}px` }}
                vm={catchBlock.blockVM}
                key={index + 2000}
                number={`${props.number}.${(tcfVM.blockLengthAcc?.[index] ?? 0) + 1}`}
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
                origin={leftParticipant}
                style={{ paddingLeft: `${paddingLeft}px` }}
                vm={tcfVM.finallyBlockVM}
                number={`${props.number}.${
                  (tcfVM.blockLengthAcc?.[tcfVM.blockLengthAcc.length - 1] ?? 0) + 1
                }`}
                incremental
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
