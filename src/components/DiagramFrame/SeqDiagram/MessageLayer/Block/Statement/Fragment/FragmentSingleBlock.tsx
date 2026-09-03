import CommentClass from "@/components/Comment/Comment";
import Icon from "@/components/Icon/Icons";
import { cn } from "@/utils";
import { Block } from "../../Block";
import { Numbering } from "../../../Numbering";
import { Comment } from "../Comment/Comment";
import { CollapseButton } from "./CollapseButton";
import { ConditionLabel } from "./ConditionLabel";
import { useFragmentData } from "./useFragmentData";
import "./FragmentCritical.css";
import "./FragmentLoop.css";
import "./FragmentPar.css";
import "./FragmentSection.css";

import type { SingleBlockFragmentKind } from "@/positioning/vertical/StatementTypes";

export type { SingleBlockFragmentKind };

interface FragmentSingleBlockProps {
  kind: SingleBlockFragmentKind;
  context: any;
  origin: string;
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
}

const labels: Record<SingleBlockFragmentKind, string> = {
  critical: "Critical",
  loop: "Loop",
  opt: "Opt",
  par: "Par",
  section: "Section",
};

export const FragmentSingleBlock = (props: FragmentSingleBlockProps) => {
  const { kind } = props;
  const {
    collapsed,
    toggleCollapse,
    paddingLeft,
    fragmentStyle,
    border,
    leftParticipant,
  } = useFragmentData(props.context, props.origin);
  const fragment = props.context[kind]();
  const block = fragment?.braceBlock()?.block();
  const condition = fragment?.parExpr?.()?.condition?.();
  const label = fragment?.atom?.()?.getFormattedText() ?? labels[kind];
  const isOpt = kind === "opt";
  const isLoop = kind === "loop";
  const isSection = kind === "section";
  const renderBlock = isOpt || isLoop || Boolean(block);

  const content = (
    <div
      data-origin={props.origin}
      data-left-participant={leftParticipant}
      data-frame-padding-left={border.left}
      data-frame-padding-right={border.right}
      className={cn(
        "group fragment border-skin-fragment rounded",
        kind === "opt" ? "opt" : `fragment-${kind} ${kind}`,
        isOpt && props.className,
      )}
      style={fragmentStyle}
    >
      {props.commentObj?.text && (
        <Comment comment={props.comment} commentObj={props.commentObj} />
      )}
      <div
        className={cn(
          "header bg-skin-fragment-header text-skin-fragment-header leading-4 relative",
          !isOpt && "rounded-t",
        )}
      >
        <Numbering number={props.number} />
        <div className="name font-semibold p-1 border-b">
          <label className="p-0 flex items-center gap-0.5">
            <Icon name={`${kind}-fragment`} />
            <CollapseButton
              label={label}
              collapsed={collapsed}
              onClick={toggleCollapse}
              style={
                isOpt
                  ? props.commentObj?.textStyle
                  : props.commentObj?.messageStyle
              }
              className={cn(
                isOpt
                  ? props.commentObj?.classNames
                  : props.commentObj?.messageClassNames,
              )}
            />
          </label>
        </div>
      </div>
      <div className={cn({ hidden: collapsed })}>
        <div className="segment">
          {isSection ? (
            <div className="text-skin-fragment flex" />
          ) : (
            (isLoop || condition) && (
              <div className="text-skin-fragment">
                <ConditionLabel condition={condition} />
              </div>
            )
          )}
          {renderBlock && (
            <Block
              origin={leftParticipant}
              className={
                kind === "par"
                  ? "[&>.statement-container:not(:first-child)]:border-t"
                  : undefined
              }
              style={{ paddingLeft: `${paddingLeft}px` }}
              context={block}
              number={isSection ? props.number : `${props.number}.1`}
              incremental={!isSection}
            />
          )}
        </div>
      </div>
    </div>
  );

  return isOpt ? content : <div className={props.className}>{content}</div>;
};
