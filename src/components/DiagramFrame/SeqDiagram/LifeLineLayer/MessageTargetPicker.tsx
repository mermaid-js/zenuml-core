import { cn } from "@/utils";
import { useEffect, useRef, useState } from "react";

/**
 * Chooses the receiver of a message being created. It opens after a click on
 * a create handle, a keyboard start on a message gap, or a drag released away
 * from any participant. A participant on the diagram can be clicked instead;
 * MessageCreateControls handles that press.
 */
export const MessageTargetPicker = (props: {
  source: string;
  participants: string[];
  left: number;
  top: number;
  onHover: (target: string | null) => void;
  onPick: (target: string) => void;
  onCancel: () => void;
}) => {
  const { source, participants, onHover, onPick, onCancel } = props;
  // The first option that is not the source: a self message is a choice, not
  // the default.
  const initial = Math.max(
    0,
    participants.findIndex((name) => name !== source),
  );
  const [active, setActive] = useState(initial);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const onHoverRef = useRef(onHover);
  onHoverRef.current = onHover;

  // The active option holds focus and is previewed on the diagram.
  useEffect(() => {
    optionRefs.current[active]?.focus();
    onHoverRef.current(participants[active] ?? null);
  }, [active, participants]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const last = participants.length - 1;
    const move = (index: number) => {
      event.preventDefault();
      setActive(index);
    };
    switch (event.key) {
      case "ArrowDown":
        return move(active >= last ? 0 : active + 1);
      case "ArrowUp":
        return move(active <= 0 ? last : active - 1);
      case "Home":
        return move(0);
      case "End":
        return move(last);
      case "Enter":
      case " ":
        event.preventDefault();
        event.stopPropagation();
        onPick(participants[active]);
        return;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        onCancel();
        return;
      case "Tab":
        event.preventDefault();
        return;
    }
  };

  return (
    <div
      role="listbox"
      aria-label={`Send a message from ${source} to`}
      data-testid="message-create-target-picker"
      data-interaction-surface="createDrag"
      className="zu-fade-enter absolute z-50 min-w-[120px] max-w-[200px] -translate-x-1/2 rounded-zu-lg border border-slate-200 bg-white p-1 text-xs text-slate-800 shadow-zu-pop"
      style={{ left: props.left, top: props.top + 10, pointerEvents: "auto" }}
      onKeyDown={onKeyDown}
    >
      <div className="px-2 pb-1 pt-0.5 text-[11px] text-slate-500" aria-hidden>
        Send to…
      </div>
      {participants.map((name, index) => (
        <div
          key={name}
          ref={(element) => {
            optionRefs.current[index] = element;
          }}
          role="option"
          aria-selected={index === active}
          tabIndex={index === active ? 0 : -1}
          data-testid={`message-create-target-option-${name}`}
          className={cn(
            "zu-press cursor-pointer truncate rounded-zu-md px-2 py-1 focus:outline-none",
            index === active ? "bg-slate-100" : "hover:bg-slate-100",
          )}
          onPointerEnter={() => setActive(index)}
          onClick={() => onPick(name)}
        >
          {name === source ? `${name} (self)` : name}
        </div>
      ))}
    </div>
  );
};
