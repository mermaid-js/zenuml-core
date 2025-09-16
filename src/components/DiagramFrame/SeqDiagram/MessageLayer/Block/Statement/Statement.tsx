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
import { coordinatesAtom, messagesVMByStartAtom } from "@/store/Store";
import { calculateArrowGeometry } from "./useArrow";

export const Statement = (props: {
  context: any;
  origin: string;
  number?: string;
  collapsed?: boolean;
}) => {
  const messagesByStart = useAtomValue(messagesVMByStartAtom);
  const coordinates = useAtomValue(coordinatesAtom);
  const comment = commentOf(props.context) || "";
  const commentObj = new Comment(comment);

  const messageCtx = props.context?.message?.();
  const messageRange = messageCtx ? offsetRangeOf(messageCtx) : null;
  const messageVM = messageRange ? messagesByStart[messageRange[0]] : undefined;

  const asyncMessageCtx = props.context?.asyncMessage?.();
  const asyncRange = asyncMessageCtx ? offsetRangeOf(asyncMessageCtx) : null;
  const asyncVM = asyncRange ? messagesByStart[asyncRange[0]] : undefined;
  const asyncSource = asyncVM?.source ?? asyncVM?.from ?? props.origin;
  const asyncTarget = asyncVM?.to ?? asyncSource;
  const asyncGeometry = calculateArrowGeometry({
    context: props.context,
    origin: props.origin,
    source: asyncSource ?? props.origin,
    target: asyncTarget ?? props.origin,
    coordinates,
  });
  const asyncVMWithArrow = asyncVM
    ? {
        ...asyncVM,
        arrow: {
          translateX: asyncGeometry.translateX,
          interactionWidth: asyncGeometry.interactionWidth,
          rightToLeft: asyncGeometry.rightToLeft,
        },
      }
    : undefined;

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
      return <Interaction {...subProps} vm={messageVM} />;
    case Boolean(props.context.asyncMessage()):
      return (
        <InteractionAsync
          origin={props.origin}
          comment={comment}
          commentObj={commentObj}
          number={props.number}
          className={subProps.className}
          vm={asyncVMWithArrow}
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
