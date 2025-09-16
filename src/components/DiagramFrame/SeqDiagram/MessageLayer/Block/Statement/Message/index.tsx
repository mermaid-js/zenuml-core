import { cn } from "@/utils";
import { modeAtom, onMessageClickAtom, RenderMode } from "@/store/Store";
import { CSSProperties, useRef } from "react";
import { useAtomValue } from "jotai";
import { Point } from "./Point";
import { Numbering } from "../../../Numbering";
import { MessageLabel } from "../../../MessageLabel";
import { labelRangeOfMessage } from "@/parser/helpers";

type Context = any;

const getEditable = (context: Context, mode: RenderMode, type: string) => {
  if (mode === RenderMode.Static) return false;
  switch (type) {
    case "sync":
    case "async":
    case "return":
      return true;
    case "creation": {
      // Avoid editing "«create»" label for invalid creations
      const isValid = context?.isParamValid?.() > 0;
      return isValid;
    }
    default:
      return false;
  }
};


export const Message = (props: {
  context?: Context;
  content: string;
  rtl?: string | boolean;
  type?: string;
  textStyle?: CSSProperties;
  className?: string;
  style?: CSSProperties;
  number?: string;
  labelRangeOverride?: [number, number] | null;
  editableOverride?: boolean;
  stylableOverride?: boolean;
  onMessageClickOverride?: (element: HTMLElement | null) => void;
}) => {
  const {
    context,
    content,
    rtl,
    type = "",
    textStyle,
    className,
    style,
    number,
    labelRangeOverride,
    editableOverride,
    stylableOverride,
    onMessageClickOverride,
  } = props;
  const mode = useAtomValue(modeAtom);
  const onMessageClick = useAtomValue(onMessageClickAtom);
  const messageRef = useRef<HTMLDivElement>(null);
  const isAsync = type === "async";
  const editable =
    editableOverride ?? getEditable(context, mode, type || "");
  const stylable =
    stylableOverride ??
    (mode !== RenderMode.Static &&
      ["sync", "async", "return", "creation"].includes(type));
  const labelText =
    type === "creation" ? content.match(/«([^»]+)»/)?.[1] || "" : content || "";
  const labelPosition =
    labelRangeOverride ?? labelRangeOfMessage(context, (type || "") as any);
  const borderStyle: "solid" | "dashed" | undefined = {
    sync: "solid",
    async: "solid",
    creation: "dashed",
    return: "dashed",
  }[type] as "solid";

  const onClick = () => {
    if (!stylable || !messageRef.current) return;
    if (onMessageClickOverride) {
      onMessageClickOverride(messageRef.current);
      return;
    }
    onMessageClick(context, messageRef.current);
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
            {editable ? (
              <>
                {type === "creation" && <span>«</span>}
                <MessageLabel
                  labelText={labelText ?? ""}
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
