import { cn } from "@/utils";
import { modeAtom, onMessageClickAtom, RenderMode } from "@/store/Store";
import sequenceParser from "@/generated-parser/sequenceParser";
import { CSSProperties, useRef } from "react";
import { useAtomValue } from "jotai";
import { Point } from "./Point";
import { Numbering } from "../../../Numbering";
import { MessageLabel } from "../../../MessageLabel";

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

const getLabelPosition = (context: Context, type: string): [number, number] => {
  let start = -1,
    stop = -1;
  switch (type) {
    case "sync":
      {
        const signature = context?.messageBody().func()?.signature()[0];
        [start, stop] = [signature?.start.start, signature?.stop.stop];
      }
      break;
    case "async":
      {
        const content = context?.content();
        [start, stop] = [content?.start.start, content?.stop.stop];
      }
      break;
    case "creation":
      {
        const signature = context?.creationBody()?.parameters();
        [start, stop] = [signature?.start.start, signature?.stop.stop];
      }
      break;
    case "return":
      {
        if (context instanceof sequenceParser.MessageContext) {
          const signature = context.messageBody().func()?.signature()?.[0];
          [start, stop] = [signature?.start.start, signature?.stop.stop];
        } else if (context instanceof sequenceParser.AtomExprContext) {
          const ret = context.atom();
          [start, stop] = [ret?.start.start, ret?.stop.stop];
        } else if (context instanceof sequenceParser.ContentContext) {
          [start, stop] = [context.start.start, context.stop.stop];
        } else if (context instanceof sequenceParser.AssignmentContext) {
          const assignee = context.assignee();
          [start, stop] = [assignee.start.start, assignee.stop.stop];
        }
      }
      break;
  }
  return [start, stop];
};

/**
 * Message component that supports both old and new architecture
 */
export const Message = (props: {
  // New architecture props
  layoutData?: {
    content: string;
    rtl?: boolean;
    type?: string;
    textStyle?: CSSProperties;
    className?: string;
    style?: CSSProperties;
    number?: string;
    borderStyle?: "solid" | "dashed";
    editable?: boolean;
  };
  // Old architecture props (kept for compatibility)
  context?: Context;
  content?: string;
  rtl?: string | boolean;
  type?: string;
  textStyle?: CSSProperties;
  className?: string;
  style?: CSSProperties;
  number?: string;
}) => {
  const mode = useAtomValue(modeAtom);
  const onMessageClick = useAtomValue(onMessageClickAtom);
  const messageRef = useRef<HTMLDivElement>(null);

  // Determine if using new or old architecture
  const isNewArchitecture = !!props.layoutData;
  
  // Extract data based on architecture
  const data = isNewArchitecture
    ? {
        content: props.layoutData!.content,
        rtl: props.layoutData!.rtl,
        type: props.layoutData!.type || "",
        textStyle: props.layoutData!.textStyle,
        className: props.layoutData!.className,
        style: props.layoutData!.style,
        number: props.layoutData!.number,
        borderStyle: props.layoutData!.borderStyle,
        editable: props.layoutData!.editable,
      }
    : {
        content: props.content || "",
        rtl: props.rtl,
        type: props.type || "",
        textStyle: props.textStyle,
        className: props.className,
        style: props.style,
        number: props.number,
        borderStyle: ({
          sync: "solid",
          async: "solid",
          creation: "dashed",
          return: "dashed",
        }[props.type || ""] as "solid" | "dashed"),
        editable: getEditable(props.context, mode, props.type || ""),
      };

  const isAsync = data.type === "async";
  const stylable =
    mode !== RenderMode.Static &&
    ["sync", "async", "return", "creation"].includes(data.type);
  const labelText =
    data.type === "creation" 
      ? data.content.match(/«([^»]+)»/)?.[1] || "" 
      : data.content || "";
  const labelPosition = isNewArchitecture 
    ? [-1, -1] as [number, number] // New architecture doesn't need label positions for now
    : getLabelPosition(props.context, data.type || "");

  const onClick = () => {
    if (!stylable || !messageRef.current) return;
    // For new architecture, we might not have context, so only call if it exists
    if (props.context) {
      onMessageClick(props.context, messageRef.current);
    }
  };

  return (
    <div
      className={cn(
        "message leading-none border-skin-message-arrow border-b-2 flex items-end",
        {
          "flex-row-reverse": data.rtl,
          return: data.type === "return",
          "right-to-left": data.rtl,
        },
        data.className,
      )}
      style={{ ...data.style, borderBottomStyle: data.borderStyle }}
      onClick={onClick}
      ref={messageRef}
    >
      <div className="name group text-center flex-grow relative hover:text-skin-message-hover hover:bg-skin-message-hover">
        <div className="inline-block static min-h-[1em]">
          <div style={data.textStyle}>
            {data.editable ? (
              <>
                {data.type === "creation" && <span>«</span>}
                <MessageLabel
                  labelText={labelText ?? ""}
                  labelPosition={labelPosition}
                  isAsync={isAsync}
                />
                {data.type === "creation" && <span>»</span>}
              </>
            ) : (
              <>{data.content}</>
            )}
          </div>
        </div>
      </div>
      <Point
        className="flex-shrink-0 transform translate-y-1/2 -my-px"
        fill={data.type === "sync"}
        rtl={Boolean(data.rtl)}
      />
      <Numbering number={data.number} />
    </div>
  );
};
