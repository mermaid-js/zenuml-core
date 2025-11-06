import { CSSProperties } from "react";
import { MessageLabel } from "../../../../MessageLabel";
import { Numbering } from "../../../../Numbering";
import { ArrowHead } from "../../Message/ArrowHead";

export const SelfInvocationAsync = (props: {
  context?: any;
  number?: string;
  textStyle?: CSSProperties;
  classNames?: string;
}) => {
  const content = props.context?.content();
  const labelPosition = (): [number, number] => {
    if (!content) return [-1, -1];
    return [content.start.start, content.stop.stop];
  };

  return (
    <div className="message self flex items-start flex-col !border-none">
      <label className="name group px-px min-h-[1em]">
        <Numbering number={props.number} />
        <MessageLabel
          style={props.textStyle}
          className={props.classNames}
          labelText={content?.getFormattedText()}
          labelPosition={labelPosition()}
          isAsync={true}
          isSelf={true}
        />
      </label>
      <svg className="arrow text-skin-message-arrow" width="34" height="34">
        <polyline className="stroke-current stroke-2 fill-none"
          points="0,2 28,2 28,25 1,25"
        ></polyline>
        <g transform="translate(0, 20)">
          <ArrowHead fill={false} rtl={true} />
        </g>
      </svg>
    </div>
  );
};
