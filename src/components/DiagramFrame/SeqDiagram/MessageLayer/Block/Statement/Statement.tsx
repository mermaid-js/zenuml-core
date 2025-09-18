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
import { commentOf } from "@/parser/helpers";
import { cn } from "@/utils";
import { useAtomValue } from "jotai";
import { coordinatesAtom, messagesVMByStartAtom } from "@/store/Store";
import { buildStatementVM } from "@/vm/statement";
import { useMemo } from "react";

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

  const vmData = useMemo(
    () => buildStatementVM(props.context, props.origin, coordinates, messagesByStart),
    [props.context, props.origin, coordinates, messagesByStart],
  );

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
      if (!vmData.ref) {
        console.warn("Failed to build RefVM for ref context");
        return null;
      }
      return <FragmentRef {...subProps} vm={vmData.ref} />;
    case Boolean(props.context.creation()):
      return <Creation {...subProps} vm={vmData.creation} />;
    case Boolean(props.context.message()):
      return <Interaction {...subProps} vm={vmData.message} />;
    case Boolean(props.context.asyncMessage()):
      return (
        <InteractionAsync
          origin={props.origin}
          comment={comment}
          commentObj={commentObj}
          number={props.number}
          className={subProps.className}
          vm={vmData.asyncMessage}
        />
      );
    case Boolean(props.context.divider()):
      return <Divider {...subProps} vm={vmData.divider || undefined} />;
    case Boolean(props.context.ret()):
      return (
        <Return
          origin={subProps.origin}
          comment={subProps.comment}
          commentObj={subProps.commentObj}
          number={subProps.number}
          className="text-left text-sm text-skin-message"
          vm={vmData.return}
        />
      );
  }
};
