import { modeAtom, onMessageClickAtom, RenderMode } from "@/store/Store";
import { CSSProperties, useRef } from "react";
import { useAtomValue } from "jotai";
import { MessageView } from "./MessageView";

type Context = any;

export const Message = (props: {
  context?: Context;
  labelPosition: [number, number];
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
    labelPosition,
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
