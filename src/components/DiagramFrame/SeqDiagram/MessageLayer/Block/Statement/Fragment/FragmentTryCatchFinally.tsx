import CommentClass from "@/components/Comment/Comment";
import { useFragmentData } from "./useFragmentData";
import { Comment } from "../Comment/Comment";
import { Numbering } from "../../../Numbering";
import { CollapseButton } from "./CollapseButton";
import { cn } from "@/utils";
import { Block } from "../../Block";
import { blockLength } from "@/utils/Numbering";
import "./FragmentTryCatchFinally.css";
import { useMemo } from "react";
import Icon from "@/components/Icon/Icons";

export const FragmentTryCatchFinally = (props: {
  context: any;
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
  } = useFragmentData(props.context, props.origin);

  const exception = (ctx: any) => {
    return ctx?.invocation()?.parameters()?.getFormattedText();
  };
  const blockInCatchBlock = (ctx: any) => {
    return ctx?.braceBlock()?.block();
  };

  const tcf = props.context.tcf();
  const blockInTryBlock = tcf?.tryBlock()?.braceBlock()?.block();
  const finallyBlock = tcf?.finallyBlock()?.braceBlock()?.block();
  const blockLengthAcc = useMemo(() => {
    const acc = [blockLength(blockInTryBlock)];
    if (tcf?.catchBlock()) {
      tcf.catchBlock().forEach((block: any) => {
        acc.push(acc[acc.length - 1] + blockLength(blockInCatchBlock(block)));
      });
    }
    return acc;
  }, [tcf, blockInTryBlock]);

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
            {blockInTryBlock && (
              <Block
                origin={leftParticipant}
                style={{ paddingLeft: `${paddingLeft}px` }}
                context={blockInTryBlock}
                number={`${props.number}.1`}
                incremental
              />
            )}
          </div>
          {tcf.catchBlock().map((catchBlock: any, index: number) => (
            <div
              className="segment mt-2 border-t border-solid"
              key={index + 500}
            >
              <div
                className="header inline-block bg-skin-frame opacity-65"
                key={index + 1000}
              >
                <label className="keyword catch p-1">catch</label>
                <label className="exception p-1">{exception(catchBlock)}</label>
              </div>
              <Block
                origin={leftParticipant}
                style={{ paddingLeft: `${paddingLeft}px` }}
                context={blockInCatchBlock(catchBlock)}
                key={index + 2000}
                number={`${props.number}.${blockLengthAcc[index] + 1}`}
                incremental
              />
            </div>
          ))}
          {finallyBlock && (
            <div className="segment mt-2 border-t border-solid">
              <div className="header flex text-skin-fragment finally">
                <label className="keyword finally bg-skin-frame opacity-65 px-1 inline-block">
                  finally
                </label>
              </div>
              <Block
                origin={leftParticipant}
                style={{ paddingLeft: `${paddingLeft}px` }}
                context={finallyBlock}
                number={`${props.number}.${
                  blockLengthAcc[blockLengthAcc.length - 1] + 1
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
