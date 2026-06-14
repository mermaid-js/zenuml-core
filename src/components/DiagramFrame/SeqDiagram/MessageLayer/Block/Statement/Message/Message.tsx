import {
  modeAtom,
  onMessageClickAtom,
  RenderMode,
  selectedMessageAtom,
} from "@/store/Store";
import { CSSProperties, ReactNode, useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { MessageView } from "./MessageView";
import { cn } from "@/utils.ts";

type Context = any;

export const Message = (props: {
  context?: Context;
  selectionRange?: [number, number];
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
    selectionRange,
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
  const selectedMessage = useAtomValue(selectedMessageAtom);
  const setSelectedMessage = useSetAtom(selectedMessageAtom);
  const messageRef = useRef<HTMLDivElement>(null);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stylable = mode !== RenderMode.Static;
  const [rangeStart, rangeEnd] = selectionRange ?? [
    context?.start?.start,
    context?.stop?.stop,
  ];
  const isSelected =
    selectedMessage?.start === rangeStart && selectedMessage?.end === rangeEnd;

  useEffect(() => () => {
    if (clickTimer.current) clearTimeout(clickTimer.current);
  }, []);

  const selectMessage = () => {
    setSelectedMessage(
      rangeStart != null && rangeEnd != null
        ? { start: rangeStart, end: rangeEnd, token: Date.now() }
        : null,
    );
  };

  const onClick = () => {
    if (!stylable || !messageRef.current) return;
    selectMessage();
    if (clickTimer.current) clearTimeout(clickTimer.current);
    const el = messageRef.current;
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null;
      onMessageClick(context, el);
    }, 200);
  };

  const onDoubleClick = () => {
    if (!stylable || !messageRef.current) return;
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    selectMessage();
    onMessageClick(context, messageRef.current, true);
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
      onDoubleClick={onDoubleClick}
      messageRef={messageRef}
      data-selected={isSelected ? "true" : "false"}
      title={
        !stylable
          ? undefined
          : isSelected
          ? "Double-click to edit · click to select · drag to reorder"
          : "Click to select · double-click to edit · drag to reorder"
      }
      children={children}
    />
  );
};
