import { cn } from "@/utils";
import { modeAtom, onMessageClickAtom, RenderMode } from "@/store/Store";
import sequenceParser from "@/generated-parser/sequenceParser";
import { CSSProperties, useRef } from "react";
import { useAtomValue } from "jotai";
import { ArrowHead } from "./ArrowHead";
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

export const Message = (props: {
  context?: Context;
  content: string;
  rtl?: string | boolean;
  type?: string;
  textStyle?: CSSProperties;
  className?: string;
  style?: CSSProperties;
  number?: string;
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
  } = props;
  const mode = useAtomValue(modeAtom);
  const onMessageClick = useAtomValue(onMessageClickAtom);
  const messageRef = useRef<HTMLDivElement>(null);
  const isAsync = type === "async";
  const editable = getEditable(context, mode, type || "");
  const stylable =
    mode !== RenderMode.Static &&
    ["sync", "async", "return", "creation"].includes(type);
  const labelText =
    type === "creation" ? content.match(/«([^»]+)»/)?.[1] || "" : content || "";
  const labelPosition = getLabelPosition(context, type || "");
  const borderStyle: "solid" | "dashed" | undefined = {
    sync: "solid",
    async: "solid",
    creation: "dashed",
    return: "dashed",
  }[type] as "solid";

  const onClick = () => {
    if (!stylable || !messageRef.current) return;
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
      <div
        className={cn(
          "point text-skin-message-arrow translate-y-1/2 -my-px",
        )}
      >
        <ArrowHead fill={type === "sync"} rtl={Boolean(rtl)} />
      </div>
      <Numbering number={number} />
    </div>
  );
};
