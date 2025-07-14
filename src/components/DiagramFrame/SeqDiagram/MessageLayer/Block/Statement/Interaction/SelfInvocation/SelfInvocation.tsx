import { onMessageClickAtom } from "@/store/Store";
import { useAtomValue } from "jotai";
import { CSSProperties, useMemo, useRef } from "react";
import { Numbering } from "../../../../Numbering";
import { MessageLabel } from "../../../../MessageLabel";

/**
 * SelfInvocation component with both old and new architecture support
 */
export const SelfInvocation = (props: {
  // New architecture props
  layoutData?: {
    assignee: string;
    signatureText: string;
    labelPosition: [number, number];
    number?: string;
    textStyle?: CSSProperties;
    classNames?: any;
  };
  // Old architecture props (kept for compatibility)
  context?: any;
  number?: string;
  textStyle?: CSSProperties;
  classNames?: any;
}) => {
  const messageRef = useRef(null);
  const onMessageClick = useAtomValue(onMessageClickAtom);

  // Determine if using new or old architecture
  const isNewArchitecture = !!props.layoutData;
  
  // Always call useMemo to maintain hook order
  const labelPosition = useMemo(() => {
    const func = props.context?.messageBody().func();
    if (!func) return [-1, -1] as [number, number];
    return [func.start.start, func.stop.stop] as [number, number];
  }, [props.context]);
  
  // Extract data based on architecture
  const data = isNewArchitecture
    ? {
        assignee: props.layoutData!.assignee,
        signatureText: props.layoutData!.signatureText,
        labelPosition: props.layoutData!.labelPosition,
        number: props.layoutData!.number,
        textStyle: props.layoutData!.textStyle,
        classNames: props.layoutData!.classNames,
      }
    : {
        assignee: props.context?.Assignment()?.getText() || "",
        signatureText: props.context?.SignatureText(),
        labelPosition: labelPosition,
        number: props.number,
        textStyle: props.textStyle,
        classNames: props.classNames,
      };

  const onClick = () => {
    // Only call onMessageClick if we have a context (old architecture)
    if (props.context && messageRef.current) {
      onMessageClick(props.context, messageRef.current);
    }
  };

  return (
    <div
      ref={messageRef}
      className="self-invocation message leading-none self flex items-start flex-col border-none"
      onClick={onClick}
    >
      <label className="name text-left group px-px hover:text-skin-message-hover hover:bg-skin-message-hover relative min-h-[1em] w-full">
        <Numbering number={data.number} />
        <div className="label">
          {data.assignee && (
            <span>
              <span className="assignee px-1">{data.assignee}</span>
              <span>=</span>
            </span>
          )}
          <MessageLabel
            style={data.textStyle}
            className={data.classNames}
            labelText={data.signatureText}
            labelPosition={data.labelPosition}
            isSelf={true}
          />
        </div>
      </label>
      <svg className="arrow text-skin-message-arrow" width="30" height="24">
        <polyline
          className="line stroke-current fill-none stroke-2"
          points="0,2 28,2 28,15 14,15"
        ></polyline>
        <polyline
          className="head stroke-current fill-current stroke-2"
          points="18,9 8,15 18,21"
        ></polyline>
      </svg>
    </div>
  );
};
