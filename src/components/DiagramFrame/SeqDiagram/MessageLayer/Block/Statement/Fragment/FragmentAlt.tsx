import CommentClass from "@/components/Comment/Comment";
import { cn } from "@/utils";
import { fragmentOf } from "@/parser/fragmentOf";
import { FragmentFrame } from "./FragmentFrame";
import { FragmentSections } from "./FragmentSections";
import "./FragmentAlt.css";
import { useMemo } from "react";

export const FragmentAlt = (props: {
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
    <FragmentFrame
      context={props.context}
      origin={props.origin}
      label="Alt"
      icon="alt-fragment"
      number={props.number}
      comment={props.comment}
      commentObj={props.commentObj}
      className={cn(
        "group fragment fragment-alt alt border-skin-fragment rounded",
        props.className,
      )}
      collapseStyle={props.commentObj?.messageStyle}
      collapseClassName={cn(props.commentObj?.messageClassNames)}
      expandedClassName="block"
    >
      {(layout) => (
        <FragmentSections
          sections={sections}
          number={props.number}
          layout={layout}
        />
      )}
    </FragmentFrame>
  );
};
