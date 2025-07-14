import { CSSProperties } from "react";
import { MessageLabel } from "../../../../MessageLabel";
import { Numbering } from "../../../../Numbering";

export const SelfInvocationAsync = (props: {
  context?: any;
  number?: string;
  textStyle?: CSSProperties;
  classNames?: string;
  layoutData?: {
    content: string;
    labelPosition: [number, number];
    number?: string;
    style?: React.CSSProperties;
  };
}) => {
  // Determine which architecture to use
  const isNewArchitecture = !!props.layoutData;
  
  // Extract unified data
  const content = props.context?.content();
  const labelPosition = (): [number, number] => {
    if (isNewArchitecture) {
      return props.layoutData!.labelPosition;
    }
    if (!content) return [-1, -1];
    return [content.start.start, content.stop.stop];
  };

  const labelText = isNewArchitecture ? props.layoutData!.content : content?.getFormattedText();
  const number = isNewArchitecture ? props.layoutData!.number : props.number;

  return (
    <div 
      className="message self flex items-start flex-col !border-none"
      style={isNewArchitecture ? props.layoutData!.style : undefined}
    >
      <label className="name group px-px hover:text-skin-message-hover hover:bg-skin-message-hover min-h-[1em]">
        <Numbering number={number} />
        <MessageLabel
          style={props.textStyle}
          className={props.classNames}
          labelText={labelText}
          labelPosition={labelPosition()}
          isAsync={true}
          isSelf={true}
        />
      </label>
      <svg className="arrow text-skin-message-arrow" width="34" height="34">
        <polyline
          className="stroke-current stroke-2 fill-none"
          points="0,2 28,2 28,25 1,25"
        ></polyline>
        <polyline
          className="head stroke-current stroke-2 fill-none"
          points="11,19 1,25 11,31"
        ></polyline>
        {/* TODO: What is the below line used for?
        <polyline class="closed" points="28,32 28,18"></polyline> */}
      </svg>
    </div>
  );
};
