import CommentClass from "@/components/Comment/Comment";
import { cn } from "@/utils";
import { SelfInvocation } from "./SelfInvocation/SelfInvocation";
import { Message } from "../Message";
import { Occurrence } from "./Occurrence/Occurrence";
import { useAtomValue } from "jotai";
import { coordinatesAtom, cursorAtom, onMessageClickAtom } from "@/store/Store";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { Comment } from "../Comment/Comment";
import { signatureOf } from "@/parser/helpers";
import type { MessageVM } from "@/vm/messages";
import { useMemo } from "react";
import { buildOccurrenceVM } from "@/vm/occurrence";
import { centerOf } from "../utils";

function isNullOrUndefined(value: any) {
  return value === null || value === undefined;
}

export const Interaction = (props: {
  context: any;
  origin: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
  vm?: MessageVM & {
    arrow?: {
      translateX: number;
      interactionWidth: number;
      rightToLeft: boolean;
      originLayers?: number;
      sourceLayers?: number;
      targetLayers?: number;
    }
  };
}) => {
  const cursor = useAtomValue(cursorAtom);
  const coordinates = useAtomValue(coordinatesAtom);
  const messageTextStyle = props.commentObj?.messageStyle;
  const messageClassNames = props.commentObj?.messageClassNames;
  const message = props.context?.message();
  const statements = message?.Statements();
  const vm = props.vm;
  const assignee = vm?.assignee || "";
  const onMessageClick = useAtomValue(onMessageClickAtom);
  const signature = vm?.signature;
  const from = vm?.from ?? _STARTER_;
  const to = vm?.to ?? _STARTER_;
  const isSelf = vm?.isSelf;
  const range = vm?.range ?? null;
  const getIsCurrent = () => {
    const start = range ? range[0] : undefined;
    const endExclusive = range ? range[1] : undefined;
    if (
      isNullOrUndefined(cursor) ||
      isNullOrUndefined(start) ||
      isNullOrUndefined(endExclusive)
    ) {
      return false;
    }
    return cursor! >= start && cursor! < endExclusive;
  };
  const isCurrent = getIsCurrent();

  // Use arrow geometry from VM only (no parity checks)
  const { translateX, interactionWidth, originLayers, sourceLayers, targetLayers, rightToLeft } = useMemo(() => {
    if (!vm?.arrow) {
      console.warn("[interaction] missing VM arrow; rendering with zero geometry", { signature });
      return {
        translateX: 0,
        interactionWidth: 0,
        originLayers: 0,
        sourceLayers: 0,
        targetLayers: 0,
        rightToLeft: false,
      };
    }
    return {
      translateX: vm.arrow.translateX,
      interactionWidth: vm.arrow.interactionWidth,
      originLayers: vm.arrow.originLayers ?? 0,
      sourceLayers: vm.arrow.sourceLayers ?? 0,
      targetLayers: vm.arrow.targetLayers ?? 0,
      rightToLeft: vm.arrow.rightToLeft,
    };
  }, [vm?.arrow, signature]);

  return (
    <div
      className={cn(
        "interaction sync inline-block",
        {
          highlight: isCurrent,
          self: isSelf,
          "right-to-left": rightToLeft,
        },
        props.className,
      )}
      onClick={(e) => e.stopPropagation()}
      data-to={to}
      data-origin={props.origin}
      data-from={from}
      data-origin-layers={originLayers}
      data-source-layers={sourceLayers}
      data-target-layers={targetLayers}
      data-type="interaction"
      data-signature={signature}
      style={{
        width: isSelf ? undefined : interactionWidth + "px",
        transform: "translateX(" + translateX + "px)",
      }}
    >
      {props.commentObj?.text && <Comment commentObj={props.commentObj} />}
      {isSelf ? (
        <SelfInvocation
          classNames={messageClassNames}
          textStyle={messageTextStyle}
          number={props.number}
          vm={vm!}
        />
      ) : (
        <Message
          className={cn("text-center", messageClassNames)}
          textStyle={messageTextStyle}
          labelText={signature}
          rtl={rightToLeft}
          number={props.number}
          type="sync"
          editable={vm?.canEditLabel ?? true}
          stylable={true}
          labelRange={vm?.labelRange ?? null}
          onOpenStylePanel={(element) => {
            if (!element || !vm?.codeRange) return;
            onMessageClick(vm.codeRange, element);
          }}
        />
      )}
      <Occurrence
        context={message}
        participant={to}
        rtl={rightToLeft}
        number={props.number}
        vm={buildOccurrenceVM(message, to, centerOf(coordinates, to), rightToLeft)}
      />
      {assignee && !isSelf && (
        <Message
          className={cn(
            "return transform -translate-y-full",
            messageClassNames,
          )}
          labelText={assignee}
          rtl={!rightToLeft}
          type="return"
          number={`${props.number}.${statements.length + 1}`}
          textStyle={messageTextStyle}
          editable={false}
          stylable={false}
        />
      )}
    </div>
  );
};
