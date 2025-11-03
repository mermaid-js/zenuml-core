import { onMessageClickAtom } from "@/store/Store";
import { useAtomValue } from "jotai";
import { CSSProperties, useMemo, useRef } from "react";
import { Numbering } from "../../../../Numbering";
import { MessageLabel } from "../../../../MessageLabel";

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
        <polyline
          className="line stroke-current fill-none stroke-2"
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          points="0,2 28,2 28,15 14,15"
        ></polyline>
        <svg
          className="head stroke-2"
          x="7"
          y="10"
          height="10"
          width="10"
          viewBox="1 0 5 6"
        >
          <path
            d="M0.571662 2.657C0.312726 2.81236 0.312726 3.18764 0.571662 3.343L4.3942 5.63652C4.66081 5.79649 5 5.60444 5 5.29352L5 0.706476C5 0.395559 4.66081 0.203513 4.3942 0.363479L0.571662 2.657Z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      </svg>
    </div>
  );
};
