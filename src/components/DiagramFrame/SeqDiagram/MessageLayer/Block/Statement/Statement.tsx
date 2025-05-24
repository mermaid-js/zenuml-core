import { FragmentLoop } from "./Fragment/FragmentLoop";
import { FragmentAlt } from "./Fragment/FragmentAlt";
import { FragmentPar } from "./Fragment/FragmentPar";
import { FragmentOpt } from "./Fragment/FragmentOpt";
import { FragmentSection } from "./Fragment/FragmentSection";
import { FragmentCritical } from "./Fragment/FragmentCritical";
import { FragmentTryCatchFinally } from "./Fragment/FragmentTryCatchFinally";
import { FragmentRef } from "./Fragment/FragmentRef";
import { Creation } from "./Creation/Creation";
import { Interaction } from "./Interaction/Interaction";
import { InteractionAsync } from "./InteractionAsync/Interaction-async";
import { Divider } from "./Divider/Divider";
import { Return } from "./Return/Return";
import Comment from "../../../../../Comment/Comment";
import { cn } from "@/utils";

export const Statement = (props: {
  context: any;
  origin: string;
  number?: string;
  collapsed?: boolean;
}) => {
  const comment = props.context.getComment() || "";
  const commentObj = new Comment(comment);

  const subProps = {
    className: cn("text-left text-sm text-skin-message", {
      hidden: props.collapsed,
    }),
    context: props.context,
    origin: props.origin,
    comment: comment,
    commentObj: commentObj,
    number: props.number,
  };

  switch (true) {
    case Boolean(props.context.loop()):
      return <FragmentLoop {...subProps} />;
    case Boolean(props.context.alt()):
      return <FragmentAlt {...subProps} />;
    case Boolean(props.context.par()):
      return <FragmentPar {...subProps} />;
    case Boolean(props.context.opt()):
      return <FragmentOpt {...subProps} />;
    case Boolean(props.context.section()):
      return <FragmentSection {...subProps} />;
    case Boolean(props.context.critical()):
      return <FragmentCritical {...subProps} />;
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
    case props.context.ret:
      return (
        <Return {...subProps} className="text-left text-sm text-skin-message" />
      );
  }
};
