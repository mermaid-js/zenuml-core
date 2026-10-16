import {
  modeAtom,
  onMessageClickAtom,
  RenderMode,
  selectedMessageAtom,
  enableMessageReorderAtom,
} from "@/store/Store";
import { useCan, useCanReorderMessage } from "@/store/interaction/useCan";
import { CSSProperties, ReactNode, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { MessageView } from "./MessageView";
import { cn } from "@/utils.ts";
import { MessageReorderHandle } from "./MessageReorderHandle";

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
  allowReorder?: boolean;
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
    allowReorder = true,
    children,
  } = props;
  const mode = useAtomValue(modeAtom);
  const messageReorderEnabled = useAtomValue(enableMessageReorderAtom);
  const onMessageClick = useAtomValue(onMessageClickAtom);
  const selectedMessage = useAtomValue(selectedMessageAtom);
  const setSelectedMessage = useSetAtom(selectedMessageAtom);
  const messageRef = useRef<HTMLDivElement>(null);
  const stylable = mode !== RenderMode.Static;
  const [rangeStart, rangeEnd] = selectionRange ?? [
    context?.start?.start,
    context?.stop?.stop,
  ];
  const isSelected =
    selectedMessage?.start === rangeStart && selectedMessage?.end === rangeEnd;
  const canReorder = useCanReorderMessage(isSelected);
  // ADR 0002: a click selects the message (and opens its menu) only while
  // `select` is allowed; that also covers `RenderMode.Static`.
  const canSelect = useCan("select");
  const reorderEnabled = allowReorder && messageReorderEnabled && canReorder;

  const onClick = () => {
    if (!canSelect || !messageRef.current) return;
    setSelectedMessage(
      rangeStart != null && rangeEnd != null
        ? { start: rangeStart, end: rangeEnd, token: Date.now() }
        : null,
    );
    onMessageClick(context, messageRef.current);
  };

  return (
    <MessageView
      type={type}
      textStyle={textStyle}
      className={cn(
        {
          "cursor-pointer": stylable,
          "message-reorder-disabled": !reorderEnabled,
        },
        className,
      )}
      style={style}
      number={number}
      rtl={rtl}
      onClick={onClick}
      messageRef={messageRef}
      data-selected={isSelected ? "true" : "false"}
      reorderHandle={reorderEnabled ? <MessageReorderHandle /> : undefined}
      title={
        !stylable
          ? undefined
          : `Click label to edit · click arrow to select${reorderEnabled ? " · drag handle to reorder" : ""}`
      }
      children={children}
    />
  );
};
