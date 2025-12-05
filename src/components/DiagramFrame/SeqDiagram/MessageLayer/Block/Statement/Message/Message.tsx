import { modeAtom, onMessageClickAtom, RenderMode } from "@/store/Store";
import sequenceParser from "@/generated-parser/sequenceParser";
import { CSSProperties, useRef } from "react";
import { useAtomValue } from "jotai";
import { MessageView } from "./MessageView";

type Context = any;

const getLabelPosition = (context: Context, type: string): [number, number] => {
  let start = -1,
    stop = -1;
  switch (type) {
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
          // const assignee = context.assignee();
          // [start, stop] = [assignee.start.start, assignee.stop.stop];
        }
      }
      break;
  }
  return [start, stop];
};

export const Message = (props: {
  context?: Context;
  labelPosition1: [number, number];
  readonly?: boolean;
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
    labelPosition1,
    readonly,
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
  const editable = !readonly;
  const stylable = mode !== RenderMode.Static;
  const labelText =
    type === "creation" ? content.match(/«([^»]+)»/)?.[1] || "" : content || "";
  console.log('labelPosition1', labelPosition1);
  const labelPosition2 = getLabelPosition(context, type || "");
  console.log('labelPosition2', labelPosition2);
  const labelPosition = labelPosition1 || labelPosition2;
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
