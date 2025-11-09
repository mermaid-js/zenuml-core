import { onMessageClickAtom } from "@/store/Store";
import { useAtomValue } from "jotai";
import { CSSProperties, useMemo, useRef } from "react";
import { Numbering } from "../../../../Numbering";
import { MessageLabel } from "../../../../MessageLabel";
import { ArrowHead } from "../../Message/ArrowHead";

export const SelfInvocation = (props: {
  context?: any;
  number?: string;
  textStyle?: CSSProperties;
  classNames?: any;
}) => {
  const messageRef = useRef(null);
  const onMessageClick = useAtomValue(onMessageClickAtom);

  const assignee = props.context?.Assignment()?.getText() || "";
  const labelPosition: [number, number] = useMemo(() => {
    const func = props.context?.messageBody().func();
    if (!func) return [-1, -1];
    return [func.start.start, func.stop.stop];
  }, [props.context]);

  const onClick = () => {
    onMessageClick(props.context, messageRef.current!);
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
            labelText={props.context?.SignatureText()}
            labelPosition={labelPosition}
            isSelf={true}
          />
        </div>
      </label>
      <svg className="arrow text-skin-message-arrow" width="30" height="24">
        <path
          className="stroke-current stroke-2 fill-none"
          d="M0,2 L26,2 Q28,2 28,4 L28,13 Q28,15 26,15 L14,15"
        />
        <g transform="translate(7, 10)">
          <ArrowHead fill={true} rtl={true} />
        </g>
      </svg>
    </div>
  );
};
