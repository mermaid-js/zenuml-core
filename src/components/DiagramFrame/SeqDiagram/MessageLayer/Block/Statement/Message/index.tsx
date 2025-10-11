import { cn } from "@/utils";
import { modeAtom, RenderMode } from "@/store/Store";
import { CSSProperties, useRef } from "react";
import { useAtomValue } from "jotai";
import { Point } from "./Point";
import { Numbering } from "../../../Numbering";
import { MessageLabel } from "../../../MessageLabel";

const getEditableDefault = (mode: RenderMode, type: string, labelText?: string) => {
  // 1. If mode is static, not editable
  if (mode === RenderMode.Static) return false;
  
  // 2. If type is 'creation' and labelText is '«create»' (default value), not editable
  if (type === "creation" && labelText === "create") return false;
  
  // 3. Otherwise editable
  return ["sync", "async", "return", "creation"].includes(type);
};

export const Message = (props: {
  // Content and display
  labelText?: string; // Clean display text (preferred), falls back to content
  rtl?: string | boolean;
  type?: string;
  textStyle?: CSSProperties;
  className?: string;
  style?: CSSProperties;
  number?: string;
  
  // VM-driven behavior
  stylable?: boolean; // From VM logic
  labelRange?: [number, number] | null; // From vm.labelRange
  
  // Callbacks
  onOpenStylePanel?: (element: HTMLElement | null) => void;
}) => {
  const {
    labelText,
    rtl,
    type = "",
    textStyle,
    className,
    style,
    number,
    stylable,
    labelRange,
    onOpenStylePanel,
  } = props;
  const mode = useAtomValue(modeAtom);
  const messageRef = useRef<HTMLDivElement>(null);
  const isAsync = type === "async";
  
  // Calculate editable logic inside component
  const finalEditable = getEditableDefault(mode, type || "", labelText);
  const finalStylable = stylable ?? 
    (mode !== RenderMode.Static && ["sync", "async", "return", "creation"].includes(type));
  const finalLabelRange = labelRange ?? [-1, -1];
  
  const displayLabelText = labelText ?? "";
  const labelPosition = finalLabelRange;
  const borderStyle: "solid" | "dashed" | undefined = {
    sync: "solid",
    async: "solid",
    creation: "dashed",
    return: "dashed",
  }[type] as "solid";

  const onClick = () => {
    if (!finalStylable || !messageRef.current) return;
    if (onOpenStylePanel) {
      onOpenStylePanel(messageRef.current);
    } else {
      console.warn("[message] onOpenStylePanel not provided; style panel not opened");
    }
  };

  return (
    <div
      className={cn(
        "message leading-none border-skin-message-arrow border-b-2 flex items-end",
        {
          "flex-row-reverse": rtl,
          return: type === "return",
          "right-to-left": rtl,
        },
        className,
      )}
      style={{ ...style, borderBottomStyle: borderStyle }}
      onClick={onClick}
      ref={messageRef}
    >
      <div className="name group text-center flex-grow relative">
        <div className="inline-block static min-h-[1em]">
          <div style={textStyle}>
            <>
              {type === "creation" && <span>«</span>}
              {finalEditable ? (
                <MessageLabel
                  labelText={displayLabelText}
                  labelPosition={labelPosition}
                  isAsync={isAsync}
                />
              ) : (
                <label
                  className={cn("editable-label-base")}>
                  {displayLabelText}
                </label>
              )}
              {type === "creation" && <span>»</span>}
            </>
          </div>
        </div>
      </div>
      <Point
        className="flex-shrink-0 transform translate-y-1/2 -my-px"
        fill={type === "sync"}
        rtl={Boolean(rtl)}
      />
      <Numbering number={number} />
    </div>
  );
};
