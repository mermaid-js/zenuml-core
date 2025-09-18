import CommentClass from "@/components/Comment/Comment";
import { Comment } from "../Comment/Comment";
import { cn } from "@/utils";
import { Message } from "../Message";
import { useAtomValue } from "jotai";
import { onElementClickAtom, cursorAtom, onMessageClickAtom } from "@/store/Store";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { codeRangeOf, formattedTextOf } from "@/parser/helpers";
import { SyntheticEvent, useMemo } from "react";
import { signatureOf } from "@/parser/helpers";
import type { MessageVM } from "@/vm/messages";

export const Return = (props: {
  context: any;
  origin: string;
  comment?: string;
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
    };
  };
}) => {
  const onElementClick = useAtomValue(onElementClickAtom);
  const onMessageClick = useAtomValue(onMessageClickAtom);
  const cursor = useAtomValue(cursorAtom);

  const ret = props.context?.ret();

  const asyncMessage = ret?.asyncMessage();

  const vm = props.vm;
  const signature = vm?.signature ?? signatureOf(props.context?.ret?.());
  // For return semantics, prefer async/from or ret/from; ignore VM from/to here
  const source = asyncMessage?.From() || ret?.From() || _STARTER_;
  // TODO: move this logic to the parser (ReturnTo)
  const target =
    formattedTextOf(asyncMessage?.to?.()) ||
    props.context?.ret()?.ReturnTo() ||
    _STARTER_;
  asyncMessage?.content() || props.context?.ret()?.expr();
  const range = vm?.range ?? null;
  const getIsCurrent = () => {
    const start = range ? range[0] : undefined;
    const endExclusive = range ? range[1] : undefined;
    if (cursor == null || start == null || endExclusive == null) return false;
    return cursor >= start && cursor < endExclusive;
  };
  const isCurrent = getIsCurrent();

  const { translateX, interactionWidth, rightToLeft, isSelf, originLayers, sourceLayers, targetLayers } = useMemo(() => {
    if (!vm?.arrow) {
      // Rely on VM; no parity or fallback
      console.warn("[return] missing VM arrow; rendering with zero geometry", { signature });
      return {
        translateX: 0,
        interactionWidth: 0,
        rightToLeft: false,
        isSelf: source === target,
        originLayers: 0,
        sourceLayers: 0,
        targetLayers: 0,
      };
    }

    return {
      translateX: vm.arrow.translateX,
      interactionWidth: vm.arrow.interactionWidth,
      rightToLeft: vm.arrow.rightToLeft,
      isSelf: source === target,
      originLayers: vm.arrow.originLayers ?? 0,
      sourceLayers: vm.arrow.sourceLayers ?? 0,
      targetLayers: vm.arrow.targetLayers ?? 0,
    };
  }, [vm?.arrow, source, target, signature]);

  const onClick = (e: SyntheticEvent) => {
    e.stopPropagation();
    const range = codeRangeOf(props.context);
    if (range) onElementClick(range);
  };
  return (
    // .relative to allow left style
    <div
      onClick={onClick}
      data-type="return"
      data-signature={signature}
      data-origin={props.origin}
      data-to={target}
      data-source={source}
      data-target={target}
      data-origin-layers={originLayers}
      data-source-layers={sourceLayers}
      data-target-layers={targetLayers}
      className={cn(
        "interaction return relative",
        {
          "right-to-left": rightToLeft,
          highlight: isCurrent,
        },
        props.className,
      )}
      style={{
        width: interactionWidth + "px",
        transform: "translateX(" + translateX + "px)",
      }}
    >
      {props.comment && <Comment commentObj={props.commentObj} />}
      {isSelf && (
        <div className="flex items-center">
          <svg
            className="w-3 h-3 flex-shrink-0 fill-current m-1"
            viewBox="0 0 512 512"
          >
            <path
              className="cls-1"
              d="M256 0C114.84 0 0 114.84 0 256s114.84 256 256 256 256-114.84 256-256S397.16 0 256 0Zm0 469.33c-117.63 0-213.33-95.7-213.33-213.33S138.37 42.67 256 42.67 469.33 138.37 469.33 256 373.63 469.33 256 469.33Z"
            />
            <path
              className="cls-1"
              d="M288 192h-87.16l27.58-27.58a21.33 21.33 0 1 0-30.17-30.17l-64 64a21.33 21.33 0 0 0 0 30.17l64 64a21.33 21.33 0 0 0 30.17-30.17l-27.58-27.58H288a53.33 53.33 0 0 1 0 106.67h-32a21.33 21.33 0 0 0 0 42.66h32a96 96 0 0 0 0-192Z"
            />
          </svg>
          <span className="name">{signature}</span>
        </div>
      )}
      {!isSelf && (
        <Message
          className={cn(props.commentObj?.messageClassNames)}
          textStyle={props.commentObj?.messageStyle}
          labelText={signature}
          rtl={rightToLeft}
          type="return"
          number={props.number}
          editable={vm?.canEditLabel ?? true}
          stylable={true}
          labelRange={vm?.labelRange ?? null}
          onOpenStylePanel={(element) => {
            if (!element || !vm?.codeRange) return;
            onMessageClick(vm.codeRange, element);
          }}
        />
      )}
    </div>
  );
};
