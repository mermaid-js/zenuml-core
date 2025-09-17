import { onMessageClickAtom } from "@/store/Store";
import { useAtomValue } from "jotai";
import { CSSProperties, useMemo, useRef } from "react";
import { Numbering } from "../../../../Numbering";
import { MessageLabel } from "../../../../MessageLabel";
import { signatureOf, labelRangeOfMessage } from "@/parser/helpers";
import type { MessageVM } from "@/vm/messages";

export const SelfInvocation = (props: {
  context?: any;
  number?: string;
  textStyle?: CSSProperties;
  classNames?: any;
  vm?: MessageVM;
}) => {
  const messageRef = useRef(null);
  const onMessageClick = useAtomValue(onMessageClickAtom);

  const assignee = props.context?.Assignment()?.getText() || "";
  const labelPosition: [number, number] = useMemo(() => {
    return props.vm?.labelRange ?? labelRangeOfMessage(props.context, "sync");
  }, [props.vm?.labelRange, props.context]);

  const onClick = () => {
    onMessageClick(
      { context: props.context, startOffset: props.vm?.range ? props.vm.range[0] : undefined },
      messageRef.current!,
    );
  };

  return (
    <div
      ref={messageRef}
      className="self-invocation message leading-none self flex items-start flex-col border-none"
      onClick={onClick}
    >
      <label className="name text-left group px-px relative min-h-[1em] w-full">
        <Numbering number={props.number} />
        <div className="label">
          {assignee && (
            <span>
              <span className="assignee px-1">{assignee}</span>
              <span>=</span>
            </span>
          )}
          <MessageLabel
            style={props.textStyle}
            className={props.classNames}
            labelText={props.vm?.signature ?? signatureOf(props.context)}
            labelPosition={labelPosition}
            isSelf={true}
          />
        </div>
      </label>
      <svg className="arrow text-skin-message-arrow" width="30" height="24">
        <polyline
          className="line stroke-current fill-none stroke-2"
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          points="0,2 28,2 28,15 14,15"
        ></polyline>
        <polyline
          className="head stroke-current fill-current stroke-2"
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="2"
          points="18,9 8,15 18,21"
        ></polyline>
      </svg>
    </div>
  );
};
