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
 * keyboard focus it widens into a split box. The icon slot is [icon | x]
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

  const split = filled && showClear;

  const main = (
    <button
      key="main"
      type="button"
      aria-label={label}
      aria-expanded={expanded}
      onClick={onOpen}
      onKeyDown={onKeyDown}
      className={cn(
        "zu-press flex items-center justify-center shrink-0 box-border cursor-pointer bg-white text-gray-700 focus:outline-none",
        !split && "focus-visible:shadow-zu-focus",
        // Split + expanded: the wrapper border carries the highlight, so the
        // whole pill is outlined instead of one clipped half.
        expanded && !split && "ring-1 ring-sky-500",
        split
          ? cn(
              "rounded-none [&>span]:rounded-none [&>span]:border-0",
              isIcon ? "w-[27px] h-[26px]" : "w-[23px] h-[22px]",
            )
          : cn(
              "rounded-zu-md",
              isIcon ? "w-7 h-7" : "w-6 h-6",
              filled
                ? "border border-gray-300 hover:border-sky-500"
                : "border border-dashed border-gray-400 text-gray-400 hover:border-sky-500 hover:text-sky-600",
            ),
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
        "zu-press flex items-center justify-center shrink-0 box-border w-6 rounded-none cursor-pointer text-[14px] leading-none text-red-600 bg-red-100 hover:bg-red-200 border-gray-200 focus:outline-none",
        isIcon ? "h-[26px] border-l" : "h-[22px] border-r",
      )}
    >
      ×
    </button>
  ) : null;

  return (
    <div
      className={cn(
        "inline-flex items-stretch",
        split &&
          cn(
            "box-border rounded-zu-md overflow-hidden border has-[:focus-visible]:shadow-zu-focus",
            expanded ? "border-sky-500" : "border-gray-300",
          ),
        className,
      )}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={(e) => {
        // Only keyboard focus splits the slot; a programmatic focus after a
        // mouse pick must leave it plain.
        let keyboard = true;
        try {
          keyboard = (e.target as Element).matches(":focus-visible");
        } catch {
          // No :focus-visible support: treat every focus as keyboard focus.
        }
        if (keyboard) setFocused(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      {isIcon ? [main, clear] : [clear, main]}
    </div>
  );
}
