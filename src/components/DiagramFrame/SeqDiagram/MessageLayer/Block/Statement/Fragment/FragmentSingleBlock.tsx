import CommentClass from "@/components/Comment/Comment";
import { cn } from "@/utils";
import { Block } from "../../Block";
import { FragmentFrame } from "./FragmentFrame";
import { ConditionLabel } from "./ConditionLabel";

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
  const fragment = props.context[kind]();
  const label = fragment?.atom?.()?.getFormattedText() ?? labels[kind];
  const block = fragment?.braceBlock()?.block();
  const condition = fragment?.parExpr?.()?.condition?.();
  const isOpt = kind === "opt";
  const isLoop = kind === "loop";
  const isSection = kind === "section";
  const renderBlock = isOpt || isLoop || Boolean(block);

  const content = (
    <FragmentFrame
      context={props.context}
      origin={props.origin}
      label={label}
      icon={`${kind}-fragment`}
      number={props.number}
      comment={props.comment}
      commentObj={props.commentObj}
      className={cn(
        "group fragment border-skin-fragment rounded",
        kind === "opt" ? "opt" : `fragment-${kind} ${kind}`,
        isOpt && props.className,
      )}
      headerClassName={cn("relative", !isOpt && "rounded-t")}
      expandedClassName=""
      collapseStyle={
        isOpt ? props.commentObj?.textStyle : props.commentObj?.messageStyle
      }
      collapseClassName={cn(
        isOpt
          ? props.commentObj?.classNames
          : props.commentObj?.messageClassNames,
      )}
    >
      {({ leftParticipant, paddingLeft }) => (
        <div className="segment">
          {isSection ? (
            <div className="text-skin-fragment flex" />
          ) : (
            condition && (
              <div className="text-skin-fragment">
                <ConditionLabel
                  keyword={
                    isLoop
                      ? fragment.WHILE?.()?.getText?.()
                      : isOpt
                        ? "if"
                        : undefined
                  }
                  condition={condition}
                />
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
      )}
    </FragmentFrame>
  );

  return isOpt ? content : <div className={props.className}>{content}</div>;
};
