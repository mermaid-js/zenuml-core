import CommentClass from "@/components/Comment/Comment";
import { cn } from "@/utils";
import { SelfInvocation } from "./SelfInvocation/SelfInvocation";
import { Message } from "../Message";
import { Occurrence } from "./Occurrence/Occurrence";
import { useAtomValue } from "jotai";
import { cursorAtom, coordinatesAtom } from "@/store/Store";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { Comment } from "../Comment/Comment";
import { signatureOf } from "@/parser/helpers";
import type { MessageVM } from "@/vm/messages";
import { calculateArrowGeometry } from "../useArrow";
import { useMemo } from "react";

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
  const assignee = message?.Assignment()?.getText() || "";
  const vm = props.vm;
  const signature = vm?.signature ?? signatureOf(message);
  const source = vm?.source ?? vm?.from ?? message?.From?.() ?? _STARTER_;
  const target = vm?.to ?? message?.Owner?.() ?? _STARTER_;
  const isSelf = vm?.isSelf ?? source === target;
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

  // Use arrow geometry from VM with parity checking
  const {
    translateX,
    interactionWidth,
    originLayers,
    sourceLayers,
    targetLayers,
    rightToLeft,
  } = useMemo(() => {
    if (vm?.arrow) {
      // Check parity with fallback calculation
      const fallbackCandidate = calculateArrowGeometry({
        context: props.context,
        origin: props.origin,
        source: source,
        target: target,
        coordinates,
      });

      const translateXDiff = Math.abs(vm.arrow.translateX - fallbackCandidate.translateX);
      const widthDiff = Math.abs(vm.arrow.interactionWidth - fallbackCandidate.interactionWidth);
      const rtlMatch = vm.arrow.rightToLeft === fallbackCandidate.rightToLeft;
      const originLayersMatch = (vm.arrow.originLayers ?? 0) === (fallbackCandidate.originLayers ?? 0);
      const sourceLayersMatch = (vm.arrow.sourceLayers ?? 0) === (fallbackCandidate.sourceLayers ?? 0);
      const targetLayersMatch = (vm.arrow.targetLayers ?? 0) === (fallbackCandidate.targetLayers ?? 0);

      if (translateXDiff > 0.1 || widthDiff > 0.1 || !rtlMatch || !originLayersMatch || !sourceLayersMatch || !targetLayersMatch) {
        console.warn("[interaction] arrow geometry mismatch", {
          signature,
          vm: {
            translateX: vm.arrow.translateX,
            interactionWidth: vm.arrow.interactionWidth,
            rightToLeft: vm.arrow.rightToLeft,
            originLayers: vm.arrow.originLayers,
            sourceLayers: vm.arrow.sourceLayers,
            targetLayers: vm.arrow.targetLayers,
          },
          fallback: {
            translateX: fallbackCandidate.translateX,
            interactionWidth: fallbackCandidate.interactionWidth,
            rightToLeft: fallbackCandidate.rightToLeft,
            originLayers: fallbackCandidate.originLayers,
            sourceLayers: fallbackCandidate.sourceLayers,
            targetLayers: fallbackCandidate.targetLayers,
          },
          diffs: {
            translateXDiff,
            widthDiff,
            rtlMatch,
            originLayersMatch,
            sourceLayersMatch,
            targetLayersMatch
          },
        });
      } else {
        console.log("[interaction] arrow geometry parity ✓", {
          signature,
          translateX: vm.arrow.translateX,
          interactionWidth: vm.arrow.interactionWidth,
          rightToLeft: vm.arrow.rightToLeft,
          originLayers: vm.arrow.originLayers,
          sourceLayers: vm.arrow.sourceLayers,
          targetLayers: vm.arrow.targetLayers,
        });
      }

      return {
        translateX: vm.arrow.translateX,
        interactionWidth: vm.arrow.interactionWidth,
        originLayers: vm.arrow.originLayers ?? 0,
        sourceLayers: vm.arrow.sourceLayers ?? 0,
        targetLayers: vm.arrow.targetLayers ?? 0,
        rightToLeft: vm.arrow.rightToLeft,
      };
    }

    // Fallback calculation
    const fallbackCandidate = calculateArrowGeometry({
      context: props.context,
      origin: props.origin,
      source: source,
      target: target,
      coordinates,
    });

    return {
      translateX: fallbackCandidate.translateX,
      interactionWidth: fallbackCandidate.interactionWidth,
      originLayers: fallbackCandidate.originLayers ?? 0,
      sourceLayers: fallbackCandidate.sourceLayers ?? 0,
      targetLayers: fallbackCandidate.targetLayers ?? 0,
      rightToLeft: fallbackCandidate.rightToLeft,
    };
  }, [vm?.arrow, props.context, props.origin, source, target, coordinates, signature]);

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
      data-to={target}
      data-origin={props.origin}
      data-source={source}
      data-target={target}
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
          context={message}
          number={props.number}
        />
      ) : (
        <Message
          className={cn("text-center", messageClassNames)}
          textStyle={messageTextStyle}
          context={message}
          content={signature}
          rtl={rightToLeft}
          number={props.number}
          type="sync"
          labelRangeOverride={vm?.labelRange ?? null}
        />
      )}
      <Occurrence
        context={message}
        participant={target}
        rtl={rightToLeft}
        number={props.number}
      />
      {assignee && !isSelf && (
        <Message
          className={cn(
            "return transform -translate-y-full",
            messageClassNames,
          )}
          context={message}
          content={assignee}
          rtl={!rightToLeft}
          type="return"
          number={`${props.number}.${statements.length + 1}`}
          textStyle={messageTextStyle}
        />
      )}
    </div>
  );
};
