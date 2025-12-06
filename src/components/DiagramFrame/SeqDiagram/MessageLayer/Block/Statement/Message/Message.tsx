import { modeAtom, onMessageClickAtom, RenderMode } from "@/store/Store";
import { CSSProperties, useRef } from "react";
import { useAtomValue } from "jotai";
import { MessageView } from "./MessageView";
import { cn } from "@/utils.ts";

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
  number?: string;
  normalizeText?: (text: string) => string;
}) => {
  const {
    context,
    labelPosition,
    content,
    rtl,
    type = "",
    textStyle,
    className,
    number,
    normalizeText,
  } = props;
  const mode = useAtomValue(modeAtom);
  const onMessageClick = useAtomValue(onMessageClickAtom);
  const messageRef = useRef<HTMLDivElement>(null);
  const stylable = mode !== RenderMode.Static;
  const labelText = content || "";

  const onClick = () => {
    if (!stylable || !messageRef.current) return;
    onMessageClick(context, messageRef.current);
  };

  return (
    <MessageView
      labelText={labelText ?? ""}
      labelPosition={labelPosition}
      normalizeText={normalizeText}
      type={type}
      textStyle={textStyle}
      className={cn({"cursor-pointer": stylable}, className)}
      number={number}
      rtl={rtl}
      onClick={onClick}
      messageRef={messageRef}
    />
  );
};
