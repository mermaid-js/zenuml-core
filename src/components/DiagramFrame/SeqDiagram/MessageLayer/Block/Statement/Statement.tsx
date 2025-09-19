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
import { useAtomValue } from "jotai";
import { coordinatesAtom, messagesVMByStartAtom } from "@/store/Store";
import { buildDiscriminatedStatementVM } from "@/vm/statement";
import { useMemo } from "react";

export const Statement = (props: {
  context: any;
  origin: string;
  number?: string;
  collapsed?: boolean;
}) => {
  const messagesByStart = useAtomValue(messagesVMByStartAtom);
  const coordinates = useAtomValue(coordinatesAtom);

  const vmData = useMemo(
    () => buildDiscriminatedStatementVM(props.context, props.origin, coordinates, messagesByStart),
    [props.context, props.origin, coordinates, messagesByStart],
  );

  const comment = vmData.comment || "";
  const commentObj = new Comment(comment);

  const subProps = {
    className: cn("text-left text-sm text-skin-message", {
      hidden: props.collapsed && vmData.kind !== "return",
    }),
    context: props.context,
    origin: props.origin,
    comment: comment,
    commentObj: commentObj,
    number: props.number,
  };

  switch (vmData.kind) {
    case "loop":
      return <FragmentLoop {...subProps} fragmentData={vmData.fragmentData} vm={vmData.loopVM} />;
    case "alt":
      return <FragmentAlt {...subProps} vm={vmData.vm} fragmentData={vmData.fragmentData} context={props.context} />;
    case "par":
      return <FragmentPar {...subProps} fragmentData={vmData.fragmentData} vm={vmData.parVM} />;
    case "opt":
      return <FragmentOpt {...subProps} fragmentData={vmData.fragmentData} vm={vmData.optVM} />;
    case "section":
      return <FragmentSection {...subProps} fragmentData={vmData.fragmentData} vm={vmData.sectionVM} />;
    case "critical":
      return <FragmentCritical {...subProps} fragmentData={vmData.fragmentData} vm={vmData.criticalVM} />;
    case "tcf":
      return <FragmentTryCatchFinally {...subProps} fragmentData={vmData.fragmentData} vm={vmData.tcfVM} />;
    case "ref":
      return <FragmentRef {...subProps} vm={vmData.ref} fragmentData={vmData.fragmentData} />;
    case "creation":
      return <Creation {...subProps} vm={(vmData as any).message} />;
    case "message":
      return <Interaction {...subProps} vm={(vmData as any).message} />;
    case "async":
      return (
        <InteractionAsync
          origin={props.origin}
          comment={comment}
          commentObj={commentObj}
          number={props.number}
          className={subProps.className}
          vm={(vmData as any).message}
        />
      );
    case "divider":
      return <Divider {...subProps} vm={(vmData as any).divider || undefined} />;
    case "return":
      return (
        <Return
          origin={subProps.origin}
          comment={subProps.comment}
          commentObj={subProps.commentObj}
          number={subProps.number}
          className="text-left text-sm text-skin-message"
          vm={(vmData as any).message}
        />
      );
  }
};
