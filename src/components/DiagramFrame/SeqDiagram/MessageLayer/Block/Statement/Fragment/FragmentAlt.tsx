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
import Icon from "@/components/Icon/Icons";
import { FragmentLayout } from "@/domain/models/DiagramLayout";

export const FragmentAlt = (props: {
  context: any;
  origin: string;
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
  layoutData?: FragmentLayout;
}) => {
  
  // Always call the old hook to maintain hook order
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
  
  // Determine if using new or old architecture
  const isNewArchitecture = !!props.layoutData;
  
  // Extract data based on architecture
  const data = isNewArchitecture
    ? {
        collapsed: props.layoutData!.collapsed,
        toggleCollapse: () => {}, // TODO: Implement collapse functionality in new architecture
        paddingLeft: props.layoutData!.paddingLeft,
        fragmentStyle: props.layoutData!.fragmentStyle,
        leftParticipant: props.layoutData!.leftParticipant,
        ifCondition: props.layoutData!.ifCondition,
        ifBlock: props.layoutData!.ifBlock,
        elseIfBlocks: props.layoutData!.elseIfBlocks || [],
        elseBlock: props.layoutData!.elseBlock,
        blockLengthAcc: props.layoutData!.blockLengthAcc || [],
      }
    : {
        collapsed,
        toggleCollapse,
        paddingLeft,
        fragmentStyle,
        leftParticipant,
        ifCondition: conditionFromIfElseBlock(ifBlock),
        ifBlock: blockInIfBlock,
        elseIfBlocks: elseIfBlocks || [],
        elseBlock,
        blockLengthAcc,
      };
  
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
      style={data.fragmentStyle}
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
                collapsed={data.collapsed}
                onClick={data.toggleCollapse}
                style={props.commentObj?.messageStyle}
                className={cn(props.commentObj?.messageClassNames)}
              />
            </label>
          </div>
        </div>
      </div>

      <div className={data.collapsed ? "hidden" : "block"}>
        <div className="segment">
          <div className="text-skin-fragment flex">
            <ConditionLabel condition={data.ifCondition} />
          </div>
          {data.ifBlock && (
            <Block
              origin={data.leftParticipant}
              style={{ paddingLeft: `${data.paddingLeft}px` }}
              context={data.ifBlock}
              number={`${props.number}.1`}
              incremental
            />
          )}
        </div>
        {data.elseIfBlocks.map((elseIfBlock: any, index: number) => (
          <Fragment key={index}>
            <div
              className="segment mt-2 border-t border-solid"
              key={index + 500}
            >
              <div className="text-skin-fragment" key={index + 1000}>
                <label className="else-if hidden">else if</label>
                <ConditionLabel
                  condition={isNewArchitecture ? elseIfBlock.condition : conditionFromIfElseBlock(elseIfBlock)}
                />
              </div>
              <Block
                origin={data.leftParticipant}
                style={{ paddingLeft: `${data.paddingLeft}px` }}
                context={isNewArchitecture ? elseIfBlock.block : blockInElseIfBlock(elseIfBlock)}
                key={index + 2000}
                number={`${props.number}.${data.blockLengthAcc[index] + 1}`}
                incremental
              />
            </div>
          </Fragment>
        ))}
        {data.elseBlock && (
          <>
            <div className="segment mt-2 border-t border-solid">
              <div className="text-skin-fragment">
                <label className="p-1">[else]</label>
              </div>
              <Block
                origin={data.leftParticipant}
                style={{ paddingLeft: `${data.paddingLeft}px` }}
                context={data.elseBlock}
                number={`${props.number}.${
                  data.blockLengthAcc[data.blockLengthAcc.length - 1] + 1
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
