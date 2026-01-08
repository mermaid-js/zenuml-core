import { cn } from "@/utils";
import { CSSProperties, ReactNode, RefObject } from "react";
import { ArrowHead } from "./ArrowHead";
import { Numbering } from "../../../Numbering";
import { MessageLabel } from "../../../MessageLabel";

export type MessageViewProps = {
  editable: boolean;
  labelText: string;
  labelPosition: [number, number];
  normalizeText?: (text: string) => string;
  type?: string;
  textStyle?: CSSProperties;
  className?: string;
  style?: CSSProperties;
  number?: string;
  rtl?: string | boolean;
  onClick?: () => void;
  messageRef?: RefObject<HTMLDivElement>;
  children?: ReactNode;
};

export const MessageView = ({
  editable,
  labelText,
  labelPosition,
  normalizeText,
  type = "",
  textStyle,
  className,
  style,
  number,
  rtl,
  onClick,
  messageRef,
  children,
}: MessageViewProps) => {
  const lineStyle = (type === "creation" || type === "return") ? "dashed" : "solid";

  return (
    <div
      className={cn(
        "message leading-none border-skin-message-arrow border-b-2 flex items-end",
        {
          "flex-row-reverse": rtl,
        },
        className,
      )}
      style={{ ...style, borderBottomStyle: lineStyle }}
      onClick={onClick}
      ref={messageRef}
    >
      <div className="name group text-center flex-grow relative">
        <div className="inline-block static min-h-[1em]">
          <div style={textStyle}>
            {children ? (
              children
            ) : editable ? (
              <>
                <MessageLabel
                  labelText={labelText}
                  labelPosition={labelPosition}
                  normalizeText={normalizeText}
                />
              </>
            ) : (<>{labelText}</>)}
          </div>
        </div>
      </div>
      <div
        className={cn("point text-skin-message-arrow translate-y-1/2 -my-px")}
      >
        <ArrowHead fill={type === "sync"} rtl={Boolean(rtl)} />
      </div>
      <Numbering number={number} />
    </div>
  );
};


