import { modeAtom, onMessageClickAtom, RenderMode } from "@/store/Store";
import { CSSProperties, ReactNode, useRef } from "react";
import { useAtomValue } from "jotai";
import { MessageView } from "./MessageView";
import { cn } from "@/utils.ts";

type Context = any;

export const Message = (props: {
  context?: Context;
  rtl?: string | boolean;
  type?: string;
  textStyle?: CSSProperties;
  className?: string;
  style?: CSSProperties;
  number?: string;
  children: ReactNode;
}) => {
  const {
    context,
    rtl,
    type = "",
    textStyle,
    className,
    style,
    number,
    children,
  } = props;
  const mode = useAtomValue(modeAtom);
  const onMessageClick = useAtomValue(onMessageClickAtom);
  const messageRef = useRef<HTMLDivElement>(null);
  const stylable = mode !== RenderMode.Static;

  const onClick = () => {
    if (!stylable || !messageRef.current) return;
    onMessageClick(context, messageRef.current);
  };

  return (
    <MessageView
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
