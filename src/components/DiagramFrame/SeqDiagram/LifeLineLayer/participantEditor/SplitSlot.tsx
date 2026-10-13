import { cn } from "@/utils";
import { useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";

export interface SplitSlotProps {
  kind: "icon" | "color";
  filled: boolean;
  /** aria-label of the main button, e.g. "Set icon (Database)". */
  label: string;
  /** aria-label of the clear button: "Remove type" | "Remove colour". */
  clearLabel: string;
  expanded?: boolean;
  onOpen: () => void;
  onClear: () => void;
  /** Slot content: the icon or the colour square. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * A participant editor slot. Empty: one dashed button. Filled: on hover or
 * focus-within it widens into a split box. The icon slot is [icon | x]
 * (widens right); the colour slot is [x | colour] (widens left).
 */
export function SplitSlot({
  kind,
  filled,
  label,
  clearLabel,
  expanded,
  onOpen,
  onClear,
  children,
  className,
  style,
}: SplitSlotProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const showClear = filled && (hovered || focused);
  const isIcon = kind === "icon";

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!filled) return;
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      e.stopPropagation();
      onClear();
    }
  };

  const main = (
    <button
      key="main"
      type="button"
      aria-label={label}
      aria-expanded={expanded}
      onClick={onOpen}
      onKeyDown={onKeyDown}
      className={cn(
        "flex items-center justify-center shrink-0 box-border cursor-pointer bg-white text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
        isIcon ? "w-7 h-7" : "w-6 h-6",
        filled
          ? "border border-gray-300 hover:border-sky-500"
          : "border border-dashed border-gray-400 text-gray-400 hover:border-sky-500 hover:text-sky-600",
        filled && showClear
          ? isIcon
            ? "rounded-l-md rounded-r-none"
            : "rounded-r-md rounded-l-none"
          : "rounded-md",
      )}
    >
      {children}
    </button>
  );

  const clear = showClear ? (
    <button
      key="clear"
      type="button"
      aria-label={clearLabel}
      title={`${clearLabel} ⌫`}
      onClick={onClear}
      className={cn(
        "flex items-center justify-center shrink-0 box-border w-6 cursor-pointer text-[14px] leading-none text-red-600 bg-red-100 hover:bg-red-200 border border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
        isIcon ? "h-7 rounded-r-md border-l-0" : "h-6 rounded-l-md border-r-0",
      )}
    >
      ×
    </button>
  ) : null;

  return (
    <div
      className={cn("inline-flex items-stretch", className)}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      {isIcon ? [main, clear] : [clear, main]}
    </div>
  );
}
