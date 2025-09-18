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
import { centerOf } from "./utils";
import { enhanceMessageVMWithArrow, enhanceReturnVMWithArrow } from "@/vm/messages";
import { buildRefVM } from "@/vm/fragments";

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
  const messageVMWithArrow = messageVM
    ? enhanceMessageVMWithArrow(messageVM, props.context, props.origin, coordinates)
    : undefined;

  const asyncMessageCtx = props.context?.asyncMessage?.();
  const asyncRange = asyncMessageCtx ? offsetRangeOf(asyncMessageCtx) : null;
  const asyncVM = asyncRange ? messagesByStart[asyncRange[0]] : undefined;
  const asyncVMWithArrow = asyncVM
    ? enhanceMessageVMWithArrow(asyncVM, props.context, props.origin, coordinates)
    : undefined;

  const creationCtx = props.context?.creation?.();
  const creationRange = creationCtx ? offsetRangeOf(creationCtx) : null;
  const creationVM = creationRange ? messagesByStart[creationRange[0]] : undefined;
  const creationVMWithArrow = creationVM
    ? enhanceMessageVMWithArrow(creationVM, props.context, props.origin, coordinates)
    : undefined;

  // Divider VM calculation
  const dividerCtx = props.context?.divider?.();
  const dividerNote = dividerCtx?.Note?.() || "";
  let dividerVM;
  if (dividerCtx) {
    const names = coordinates.orderedParticipantNames();
    const rearParticipant = names[names.length - 1];
    const dividerWidth = centerOf(coordinates, rearParticipant) + 10;
    const centerOfOrigin = centerOf(coordinates, props.origin);

    // Parse note for styling
    let parsedNote = dividerNote;
    let styleInfo = {};
    if (dividerNote.trim().indexOf("[") === 0 && dividerNote.indexOf("]") !== -1) {
      const startIndex = dividerNote.indexOf("[");
      const endIndex = dividerNote.indexOf("]");
      const styleStr = dividerNote.slice(startIndex + 1, endIndex);
      parsedNote = dividerNote.slice(endIndex + 1);
      styleInfo = { styles: styleStr.split(",").map((s: string) => s.trim()) };
    }

    dividerVM = {
      note: parsedNote,
      rawNote: dividerNote,
      width: dividerWidth,
      translateX: -1 * centerOfOrigin + 10,
      styling: styleInfo,
    };
  }

  // Return VM calculation via dedicated enhancer (no parity checks in component)
  const retCtx = props.context?.ret?.();
  const retAsync = retCtx?.asyncMessage?.();
  const retKeyRange = retAsync
    ? offsetRangeOf(retAsync)
    : retCtx
    ? offsetRangeOf(retCtx)
    : null;
  const retVM = retKeyRange ? messagesByStart[retKeyRange[0]] : undefined;
  const retVMWithArrow = retVM
    ? enhanceReturnVMWithArrow(retVM, props.context, props.origin, coordinates)
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
      const refVM = buildRefVM(props.context);
      if (!refVM) {
        console.warn("Failed to build RefVM for ref context");
        return null;
      }
      return <FragmentRef {...subProps} vm={refVM} />;
    case Boolean(props.context.creation()):
      return <Creation {...subProps} vm={creationVMWithArrow} />;
    case Boolean(props.context.message()):
      return <Interaction {...subProps} vm={messageVMWithArrow} />;
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
      return <Divider {...subProps} vm={dividerVM} />;
    case Boolean(props.context.ret()):
      return (
        <Return
          {...subProps}
          className="text-left text-sm text-skin-message"
          vm={retVMWithArrow}
        />
      );
  }
};
