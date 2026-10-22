import CommentClass from "@/components/Comment/Comment";
import { cn } from "@/utils";
import { fragmentOf } from "@/parser/fragmentOf";
import { FragmentFrame } from "./FragmentFrame";
import { FragmentSections } from "./FragmentSections";
import { useMemo } from "react";

export const FragmentTryCatchFinally = (props: {
  context: any;
  origin: string;
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
}) => {
  const sections = useMemo(
    () => fragmentOf(props.context)?.sections ?? [],
    [props.context],
  );

  return (
    <div className={props.className}>
      <FragmentFrame
        context={props.context}
        origin={props.origin}
        label="Try"
        icon="try-catch-fragment"
        number={props.number}
        comment={props.comment}
        commentObj={props.commentObj}
        className="group fragment fragment-tcf tcf border-skin-fragment rounded"
        collapseStyle={props.commentObj?.messageStyle}
        collapseClassName={cn(props.commentObj?.messageClassNames)}
        expandedClassName=""
      >
        {(layout) => (
          <FragmentSections
            sections={sections}
            number={props.number}
            layout={layout}
          />
        )}
      </FragmentFrame>
    </div>
  );
};
