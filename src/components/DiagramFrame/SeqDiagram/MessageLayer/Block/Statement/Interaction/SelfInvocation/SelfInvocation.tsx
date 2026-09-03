import { onMessageClickAtom, selectedMessageAtom } from "@/store/Store";
import { useAtomValue, useSetAtom } from "jotai";
import { CSSProperties, useMemo, useRef } from "react";
import { Numbering } from "../../../../Numbering";
import { MessageLabel } from "../../../../MessageLabel";
import { ArrowHead } from "../../Message/ArrowHead";
import {
  asyncMessageNormalizer,
  syncMessageNormalizer,
} from "@/utils/messageNormalizers";

export const SelfInvocation = (props: {
  context?: any;
  number?: string;
  textStyle?: CSSProperties;
  classNames?: any;
  type: "sync" | "async";
}) => {
  // `content()` only exists on async message contexts, and `Assignment()` /
  // `messageBody()` only exist on sync ones (src/parser/ir/contract.ts §6:
  // "method presence is a type discriminator") — every context accessor
  // below must stay behind the matching branch.
  const isAsync = props.type === "async";
  const messageRef = useRef(null);
  const onMessageClick = useAtomValue(onMessageClickAtom);
  const selectedMessage = useAtomValue(selectedMessageAtom);
  const setSelectedMessage = useSetAtom(selectedMessageAtom);

  const content = isAsync ? props.context?.content() : undefined;
  const assignee = isAsync ? "" : props.context?.Assignment()?.getText() || "";

  const labelPosition: [number, number] = useMemo(() => {
    if (isAsync) {
      if (!content) return [-1, -1];
      return [content.start.start, content.stop.stop];
    }
    const func = props.context?.messageBody().func();
    if (!func) return [-1, -1];
    return [func.start.start, func.stop.stop];
  }, [props.context, isAsync, content]);

  const isSelected =
    selectedMessage !== null &&
    selectedMessage.start === labelPosition[0] &&
    selectedMessage.end === labelPosition[1];

  const onClick = () => {
    setSelectedMessage(
      labelPosition[0] !== -1
        ? { start: labelPosition[0], end: labelPosition[1], token: Date.now() }
        : null,
    );
    onMessageClick(props.context, messageRef.current!);
  };

  return (
    <div
      ref={messageRef}
      className={
        isAsync
          ? "message self flex items-start flex-col !border-none"
          : "self-invocation message leading-none self flex items-start flex-col border-none"
      }
      onClick={onClick}
      data-selected={isSelected ? "true" : "false"}
    >
      <label
        className={
          isAsync
            ? "name group px-px min-h-[1em]"
            : "name text-left group px-px relative min-h-[1em] w-full"
        }
      >
        <Numbering number={props.number} />
        <div className="label" style={props.textStyle}>
          {!isAsync && assignee && (
            <span>
              <span className="assignee px-1">{assignee}</span>
              <span>=</span>
            </span>
          )}
          <MessageLabel
            className={props.classNames}
            labelText={
              isAsync
                ? content?.getFormattedText()
                : props.context?.SignatureText()
            }
            labelPosition={labelPosition}
            normalizeText={
              isAsync ? asyncMessageNormalizer : syncMessageNormalizer
            }
          />
        </div>
      </label>
      <svg className="arrow text-skin-message-arrow" width="30" height="24">
        <path
          className="stroke-current stroke-2 fill-none"
          d={
            isAsync
              ? "M0,2 L26,2 Q28,2 28,4 L28,13 Q28,15 26,15 L1,15"
              : "M0,2 L26,2 Q28,2 28,4 L28,13 Q28,15 26,15 L14,15"
          }
        />
        <g transform={isAsync ? "translate(0, 10)" : "translate(7, 10)"}>
          <ArrowHead fill={!isAsync} rtl={true} />
        </g>
      </svg>
    </div>
  );
};
