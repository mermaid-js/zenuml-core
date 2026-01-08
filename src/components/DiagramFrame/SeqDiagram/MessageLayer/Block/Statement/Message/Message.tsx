import { modeAtom, onMessageClickAtom, RenderMode } from "@/store/Store";
import { CSSProperties, ReactNode, useRef } from "react";
import { useAtomValue } from "jotai";
import { MessageView } from "./MessageView";
import { cn } from "@/utils.ts";

type Context = any;

export const Message = (props: {
  context?: Context;
  labelPosition?: [number, number];
  readonly?: boolean;
  content?: string;
  rtl?: string | boolean;
  type?: string;
  textStyle?: CSSProperties;
  className?: string;
  style?: CSSProperties;
  number?: string;
  normalizeText?: (text: string) => string;
  children?: ReactNode;
}) => {
  const {
    context,
    labelPosition = [-1, -1],
    readonly,
    content = "",
    rtl,
    type = "",
    textStyle,
    className,
    style,
    number,
    normalizeText,
    children,
  } = props;
  const mode = useAtomValue(modeAtom);
  const onMessageClick = useAtomValue(onMessageClickAtom);
  const messageRef = useRef<HTMLDivElement>(null);
  const editable = !readonly;
  const stylable = mode !== RenderMode.Static;
  const labelText = content || "";

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
      className={cn({"cursor-pointer": stylable}, className)}
      style={style}
      number={number}
      rtl={rtl}
      onClick={onClick}
      messageRef={messageRef}
      children={children}
    />
  );
};
