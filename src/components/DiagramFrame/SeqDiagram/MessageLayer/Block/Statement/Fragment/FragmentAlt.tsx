import CommentClass from "@/components/Comment/Comment";
import { blockLength } from "@/utils/Numbering";
import { CollapseButton } from "./CollapseButton";
import { Block } from "../../Block";
import { useFragmentData } from "./useFragmentData";
import { Comment } from "../Comment/Comment";
import { Numbering } from "../../../Numbering";
import { cn } from "@/utils";
import { ConditionLabel } from "./ConditionLabel";
import "./FragmentAlt.css";
import { Fragment, useMemo } from "react";

export const FragmentAlt = (props: {
  context: any;
  origin: string;
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
}) => {
  const alt = props.context.alt();
  const ifBlock = alt?.ifBlock();
  const elseIfBlocks = alt?.elseIfBlock();
  const elseBlock = alt?.elseBlock()?.braceBlock()?.block();
  const blockInIfBlock = alt?.ifBlock()?.braceBlock()?.block();
  const blockLengthAcc = useMemo(() => {
    const acc = [blockLength(blockInIfBlock)];
    if (alt?.elseIfBlock()) {
      alt.elseIfBlock().forEach((block: any) => {
        acc.push(acc[acc.length - 1] + blockLength(blockInElseIfBlock(block)));
      });
    }
    return acc;
  }, [alt, blockInIfBlock]);

  function conditionFromIfElseBlock(block: any) {
    return block?.parExpr()?.condition();
  }

  function blockInElseIfBlock(block: any) {
    return block?.braceBlock()?.block();
  }

  const {
    collapsed,
    toggleCollapse,
    paddingLeft,
    fragmentStyle,
    leftParticipant,
  } = useFragmentData(props.context, props.origin);

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
            <label className="p-0">
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
            <ConditionLabel condition={conditionFromIfElseBlock(ifBlock)} />
          </div>
          {blockInIfBlock && (
            <Block
              origin={leftParticipant}
              style={{ paddingLeft: `${paddingLeft}px` }}
              context={blockInIfBlock}
              number={`${props.number}.1`}
              incremental
            />
          )}
        </div>
        {elseIfBlocks.map((elseIfBlock: any, index: number) => (
          <Fragment key={index}>
            <div
              className="segment mt-2 border-t border-solid"
              key={index + 500}
            >
              <div className="text-skin-fragment" key={index + 1000}>
                <label className="else-if hidden">else if</label>
                <ConditionLabel
                  condition={conditionFromIfElseBlock(elseIfBlock)}
                />
              </div>
              <Block
                origin={leftParticipant}
                style={{ paddingLeft: `${paddingLeft}px` }}
                context={blockInElseIfBlock(elseIfBlock)}
                key={index + 2000}
                number={`${props.number}.${blockLengthAcc[index] + 1}`}
                incremental
              />
            </div>
          </Fragment>
        ))}
        {elseBlock && (
          <>
            <div className="segment mt-2 border-t border-solid">
              <div className="text-skin-fragment">
                <label className="p-1">[else]</label>
              </div>
              <Block
                origin={leftParticipant}
                style={{ paddingLeft: `${paddingLeft}px` }}
                context={elseBlock}
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
