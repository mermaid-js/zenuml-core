import { cn } from "@/utils";
import { CSSProperties, RefObject } from "react";
import { ArrowHead } from "./ArrowHead";
import { Numbering } from "../../../Numbering";
import { MessageLabel } from "../../../MessageLabel";

export type MessageViewProps = {
  content?: string;
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
  borderStyle?: "solid" | "dashed";
  stylable: boolean;
  onClick?: () => void;
  messageRef?: RefObject<HTMLDivElement>;
};

export const MessageView = ({
  content = "",
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
  borderStyle,
  stylable,
  onClick,
  messageRef,
}: MessageViewProps) => {
  const isCreation = type === "creation";

  return (
    <div
      className={cn(
        "message leading-none border-skin-message-arrow border-b-2 flex items-end",
        {
          "flex-row-reverse": rtl,
          "right-to-left": rtl,
          "cursor-pointer": stylable,
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
                {isCreation && <span>«</span>}
                <MessageLabel
                  labelText={labelText ?? ""}
                  labelPosition={labelPosition}
                  normalizeText={normalizeText}
                />
                {isCreation && <span>»</span>}
              </>
            ) : (
              <>{content}</>
            )}
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


