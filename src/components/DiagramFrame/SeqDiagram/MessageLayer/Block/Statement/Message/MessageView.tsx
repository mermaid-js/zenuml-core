import { cn } from "@/utils";
import { CSSProperties, ReactNode, RefObject } from "react";
import { Numbering } from "../../../Numbering";

export type MessageViewProps = {
  type?: string;
  textStyle?: CSSProperties;
  className?: string;
  style?: CSSProperties;
  number?: string;
  rtl?: string | boolean;
  onClick?: () => void;
  messageRef?: RefObject<HTMLDivElement>;
  children: ReactNode;
};

/**
 * Arrowhead paths using original ArrowHead.tsx coordinates exactly.
 * viewBox 0 0 7 9 rendered at 7x10. Filled uses Z (closed path with strokeLinecap round).
 */
const LTR_FILLED = "M1 1.25 L6.15 4.5 L1 7.75 Z";
const LTR_OPEN = "M1 1.25 L6.15 4.5 L1 7.75";
const RTL_FILLED = "M6 1.25 L0.85 4.5 L6 7.75 Z";
const RTL_OPEN = "M6 1.25 L0.85 4.5 L6 7.75";

export const MessageView = ({
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
  const isDashed = type === "creation" || type === "return";
  const isFilled = type === "sync";
  const arrowPath = rtl
    ? (isFilled ? RTL_FILLED : RTL_OPEN)
    : (isFilled ? LTR_FILLED : LTR_OPEN);

  return (
    <div
      className={cn(
        "message leading-none border-b-2 border-transparent flex items-end relative",
        className,
      )}
      style={style}
      onClick={onClick}
      ref={messageRef}
    >
      {/* Line spanning full width */}
      <svg
        className="absolute left-0 w-full text-skin-message-arrow pointer-events-none"
        height="2"
        preserveAspectRatio="none"
        style={{ overflow: "visible", bottom: "-2px" }}
      >
        <line
          x1={rtl ? "100%" : "0"}
          y1="1"
          x2={rtl ? "0" : "100%"}
          y2="1"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={isDashed ? "6,4" : undefined}
          shapeRendering="crispEdges"
        />
      </svg>
      {/* Arrowhead positioned at tip end via CSS */}
      <svg
        className={cn(
          "absolute text-skin-message-arrow pointer-events-none",
          rtl ? "left-0" : "right-0",
        )}
        width="7"
        height="10"
        viewBox="0 0 7 9"
        style={{ overflow: "visible", bottom: "-6px" }}
      >
        <path
          d={arrowPath}
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
          fill={isFilled ? "currentColor" : "none"}
        />
      </svg>
      {/* Label text — padding on tip side reserves space matching old arrowhead div width (7px) */}
      <div
        className="name group text-center flex-grow relative"
        style={{ [rtl ? "paddingLeft" : "paddingRight"]: "7px" }}
      >
        <div className="inline-block static min-h-[1em]">
          <div style={textStyle}>
            {children}
          </div>
        </div>
      </div>
      <Numbering number={number} />
    </div>
  );
};
