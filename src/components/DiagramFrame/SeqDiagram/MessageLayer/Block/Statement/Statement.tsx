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
  const comment = commentOf(props.context) || "";
  const commentObj = new Comment(comment);

  const vmData = useMemo(
    () => buildDiscriminatedStatementVM(props.context, props.origin, coordinates, messagesByStart),
    [props.context, props.origin, coordinates, messagesByStart],
  );

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
      return <FragmentLoop {...subProps} />;
    case "alt":
      return <FragmentAlt {...subProps} />;
    case "par":
      return <FragmentPar {...subProps} />;
    case "opt":
      return <FragmentOpt {...subProps} />;
    case "section":
      return <FragmentSection {...subProps} />;
    case "critical":
      return <FragmentCritical {...subProps} />;
    case "tcf":
      return <FragmentTryCatchFinally {...subProps} />;
    case "ref":
      if (!('ref' in vmData) || !vmData.ref) {
        console.warn("Failed to build RefVM for ref context");
        return null;
      }
      return <FragmentRef {...subProps} vm={vmData.ref} />;
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
