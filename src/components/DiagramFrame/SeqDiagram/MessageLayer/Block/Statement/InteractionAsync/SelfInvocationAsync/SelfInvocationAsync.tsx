import { CSSProperties } from "react";
import { MessageLabel } from "../../../../MessageLabel";
import { Numbering } from "../../../../Numbering";

export const SelfInvocationAsync = (props: {
  number?: string;
  textStyle?: CSSProperties;
  classNames?: string;
  labelText?: string;
  labelRange?: [number, number] | null;
}) => {
  const labelText = props.labelText ?? "";
  const labelPosition: [number, number] = props.labelRange ?? [-1, -1];

  return (
    <div className="message self flex items-start flex-col !border-none">
      <label className="name group px-px min-h-[1em]">
        <Numbering number={props.number} />
        <MessageLabel
          style={props.textStyle}
          className={props.classNames}
          labelText={labelText}
          labelPosition={labelPosition}
          isAsync={true}
          isSelf={true}
        />
      </label>
      <svg className="arrow text-skin-message-arrow" width="34" height="34">
        <polyline
          className="stroke-current stroke-2 fill-none"
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          points="0,2 28,2 28,25 1,25"
        ></polyline>
        <polyline
          className="head stroke-current stroke-2 fill-current"
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="2"
          points="11,19 1,25 11,31"
        ></polyline>
        {/* TODO: What is the below line used for?
        <polyline class="closed" points="28,32 28,18"></polyline> */}
      </svg>
    </div>
  );
};
