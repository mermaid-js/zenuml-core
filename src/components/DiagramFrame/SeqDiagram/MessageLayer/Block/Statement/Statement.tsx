import { FragmentAlt } from "./Fragment/FragmentAlt";
import { FragmentSingleBlock } from "./Fragment/FragmentSingleBlock";
import { FragmentTryCatchFinally } from "./Fragment/FragmentTryCatchFinally";
import { FragmentRef } from "./Fragment/FragmentRef";
import { Creation } from "./Creation/Creation";
import { Interaction } from "./Interaction/Interaction";
import { InteractionAsync } from "./InteractionAsync/Interaction-async";
import { Divider } from "./Divider/Divider";
import { Return } from "./Return/Return";
import Comment from "../../../../../Comment/Comment";
import { cn } from "@/utils";
import { useMemo } from "react";

export const Statement = (props: {
  context: any;
  origin: string;
  number?: string;
  collapsed?: boolean;
}) => {
  // getComment walks the token stream and Comment parses styling per line;
  // both depend only on the (immutable) context.
  const { comment, commentObj } = useMemo(() => {
    const comment = props.context.getComment() || "";
    return { comment, commentObj: new Comment(comment) };
  }, [props.context]);

  const subProps = {
    className: cn("text-left text-sm text-skin-message", {
      hidden: props.collapsed && !props.context.ret(),
    }),
    context: props.context,
    origin: props.origin,
    comment: comment,
    commentObj: commentObj,
    number: props.number,
  };

  const singleBlockKind = (
    ["loop", "par", "opt", "section", "critical"] as const
  ).find((kind) => props.context[kind]());
  if (singleBlockKind) {
    return <FragmentSingleBlock {...subProps} kind={singleBlockKind} />;
  }

  switch (true) {
    case Boolean(props.context.alt()):
      return <FragmentAlt {...subProps} />;
    case Boolean(props.context.tcf()):
      return <FragmentTryCatchFinally {...subProps} />;
    case Boolean(props.context.ref()):
      return <FragmentRef {...subProps} />;
    case Boolean(props.context.creation()):
      return <Creation {...subProps} />;
    case Boolean(props.context.message()):
      return <Interaction {...subProps} />;
    case Boolean(props.context.asyncMessage()):
      return <InteractionAsync {...subProps} />;
    case Boolean(props.context.divider()):
      return <Divider {...subProps} />;
    case Boolean(props.context.ret()):
      return (
        <Return {...subProps} className="text-left text-sm text-skin-message" />
      );
  }
};
