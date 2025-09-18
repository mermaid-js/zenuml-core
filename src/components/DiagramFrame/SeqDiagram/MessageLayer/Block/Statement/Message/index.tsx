import { cn } from "@/utils";
import { modeAtom, RenderMode } from "@/store/Store";
import { CSSProperties, useRef } from "react";
import { useAtomValue } from "jotai";
import { Point } from "./Point";
import { Numbering } from "../../../Numbering";
import { MessageLabel } from "../../../MessageLabel";

const getEditableDefault = (mode: RenderMode, type: string) => {
  if (mode === RenderMode.Static) return false;
  if (type === "creation") return false; // rely on override from VM
  return ["sync", "async", "return"].includes(type);
};

export const Message = (props: {
  // Content and display
  content: string;
  labelText?: string; // Processed label text (e.g., for creation: extracted from «...»)
  rtl?: string | boolean;
  type?: string;
  textStyle?: CSSProperties;
  className?: string;
  style?: CSSProperties;
  number?: string;
  
  // VM-driven behavior (new props)
  editable?: boolean; // From vm.canEditLabel
  stylable?: boolean; // From VM logic
  labelRange?: [number, number] | null; // From vm.labelRange
  
  // Legacy props (for backward compatibility)
  labelRangeOverride?: [number, number] | null;
  editableOverride?: boolean;
  stylableOverride?: boolean;
  
  // Callbacks
  onOpenStylePanel?: (element: HTMLElement | null) => void;
}) => {
  const {
    content,
    labelText,
    rtl,
    type = "",
    textStyle,
    className,
    style,
    number,
    editable,
    stylable,
    labelRange,
    labelRangeOverride,
    editableOverride,
    stylableOverride,
    onOpenStylePanel,
  } = props;
  const mode = useAtomValue(modeAtom);
  const messageRef = useRef<HTMLDivElement>(null);
  const isAsync = type === "async";
  
  // Support both new and legacy props
  const finalEditable = editable ?? editableOverride ?? getEditableDefault(mode, type || "");
  const finalStylable = stylable ?? stylableOverride ?? 
    (mode !== RenderMode.Static && ["sync", "async", "return", "creation"].includes(type));
  const finalLabelRange = labelRange ?? labelRangeOverride ?? [-1, -1];
  
  const displayLabelText = type === "creation" ? content.match(/«([^»]+)»/)?.[1] || "" : (labelText ?? content ?? "");
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
            {finalEditable ? (
              <>
                {type === "creation" && <span>«</span>}
                <MessageLabel
                  labelText={displayLabelText}
                  labelPosition={labelPosition}
                  isAsync={isAsync}
                />
                {type === "creation" && <span>»</span>}
              </>
            ) : (
              <>{content}</>
            )}
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
