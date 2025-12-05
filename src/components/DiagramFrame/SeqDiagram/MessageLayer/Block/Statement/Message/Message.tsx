import { modeAtom, onMessageClickAtom, RenderMode } from "@/store/Store";
import sequenceParser from "@/generated-parser/sequenceParser";
import { CSSProperties, useRef } from "react";
import { useAtomValue } from "jotai";
import { MessageView } from "./MessageView";

type Context = any;

const getEditable = (context: Context, mode: RenderMode, type: string) => {
  if (mode === RenderMode.Static) return false;
  if (type === "creation") {
    // Avoid editing "«create»" label for invalid creations
    return context?.isParamValid?.() > 0;
  }
  return true;
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
  normalizeText?: (text: string) => string;
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
    normalizeText,
  } = props;
  const mode = useAtomValue(modeAtom);
  const onMessageClick = useAtomValue(onMessageClickAtom);
  const messageRef = useRef<HTMLDivElement>(null);
  const editable = getEditable(context, mode, type || "");
  const stylable = mode !== RenderMode.Static;
  const labelText =
    type === "creation" ? content.match(/«([^»]+)»/)?.[1] || "" : content || "";
  const labelPosition = getLabelPosition(context, type || "");
  const lineStyle = type === "creation" || type === "return" ? "dashed" : "solid";

  const onClick = () => {
    if (!stylable || !messageRef.current) return;
    onMessageClick(context, messageRef.current);
  };

  return (
    <MessageView
      editable={editable}
      labelText={labelText ?? ""}
      labelPosition={labelPosition}
      normalizeText={normalizeText}
      type={type}
      textStyle={textStyle}
      className={className}
      style={style}
      number={number}
      rtl={rtl}
      lineStyle={lineStyle}
      stylable={stylable}
      onClick={onClick}
      messageRef={messageRef}
    />
  );
};
