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
import { commentOf, offsetRangeOf } from "@/parser/helpers";
import { cn } from "@/utils";
import { useAtomValue } from "jotai";
import { messagesVMByStartAtom } from "@/store/Store";
import { useArrow } from "./useArrow";

export const Statement = (props: {
  context: any;
  origin: string;
  number?: string;
  collapsed?: boolean;
}) => {
  const messagesByStart = useAtomValue(messagesVMByStartAtom);
  const comment = commentOf(props.context) || "";
  const commentObj = new Comment(comment);

  const asyncMessageCtx = props.context?.asyncMessage?.();
  const asyncRange = asyncMessageCtx ? offsetRangeOf(asyncMessageCtx) : null;
  const asyncVM = asyncRange ? messagesByStart[asyncRange[0]] : undefined;
  const asyncSource = asyncVM?.source ?? asyncVM?.from ?? props.origin;
  const asyncTarget = asyncVM?.to ?? asyncSource;
  const asyncArrow = useArrow({
    context: props.context,
    origin: props.origin,
    source: asyncSource ?? props.origin,
    target: asyncTarget ?? props.origin,
  });

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
      return (
        <InteractionAsync
          origin={props.origin}
          comment={comment}
          commentObj={commentObj}
          number={props.number}
          className={subProps.className}
          vm={asyncVM}
          arrow={asyncArrow}
        />
      );
    case Boolean(props.context.divider()):
      return <Divider {...subProps} />;
    case Boolean(props.context.ret()):
      return (
        <Return {...subProps} className="text-left text-sm text-skin-message" />
      );
  }
};
