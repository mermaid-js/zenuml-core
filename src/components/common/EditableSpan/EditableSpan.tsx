import {
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  useState,
  useRef,
  CSSProperties,
} from "react";
import "./EditableSpan.css";

export interface EditableSpanProps {
  /**
   * The displayed/editable text (clean, no decoration)
   */
  text: string;

  /**
   * Whether editing is allowed
   * @default true
   */
  isEditable?: boolean;

  /**
   * Show hover indicator for editable elements
   * @default true
   */
  showHoverHint?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Inline styles
   */
  style?: CSSProperties;

  /**
   * Called when editing completes (Enter/Tab/blur)
   */
  onSave: (newText: string) => void;

  /**
   * Called when editing is cancelled (Escape)
   */
  onCancel?: () => void;

  /**
   * Tooltip text
   */
  title?: string;
}

export const EditableSpan = ({
  text,
  isEditable = true,
  showHoverHint = true,
  className = "",
  style,
  onSave,
  onCancel,
  title = "Double-click to edit",
}: EditableSpanProps) => {
  const [editing, setEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const originalTextRef = useRef("");
  const spanRef = useRef<HTMLSpanElement>(null);

  const startEditing = (e: MouseEvent | KeyboardEvent) => {
    if (!isEditable) return;
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement | null;
    const clickPoint =
      "clientX" in e
        ? { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY }
        : null;
    if (target) {
      originalTextRef.current = target.innerText ?? "";
    }

    setEditing(true);

    // Focus after state update; collapse selection near the click location
    setTimeout(() => {
      const target = e.target as HTMLElement;
      if (!target) return;

      target.focus();

      if (clickPoint) {
        const selection = window.getSelection();
        if (!selection) return;

        let range = document.caretRangeFromPoint?.(
          clickPoint.x,
          clickPoint.y
        );

        if (!range && (document as any).caretPositionFromPoint) {
          const pos = (document as any).caretPositionFromPoint(
            clickPoint.x,
            clickPoint.y
          );
          if (pos) {
            range = document.createRange();
            range.setStart(pos.offsetNode, pos.offset);
          }
        }

        if (range) {
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }, 0);
  };

  const handleDoubleClick = (e: MouseEvent) => {
    if (editing || !isEditable) return;
    startEditing(e);
  };

  const handleMouseEnter = () => {
    if (showHoverHint && !editing && isEditable) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const saveText = () => {
    const newText = spanRef.current?.innerText?.trim() ?? "";
    onSave(newText);
  };

  const handleBlur = (e: FocusEvent) => {
    if (!editing) return;
    // Avoid race condition with keyup event
    setTimeout(() => {
      if (!editing) return;
      setEditing(false);
      setIsHovered(false);
      saveText();
    }, 0);
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (!isEditable) return;

    // Prevent new line
    if (editing && e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleKeyup = (e: KeyboardEvent) => {
    if (!isEditable) return;
    if (!editing) return;

    if (e.key === "Escape") {
      const target = e.target as HTMLElement | null;
      if (target) {
        target.innerText = originalTextRef.current;
      }
      setEditing(false);
      setIsHovered(false);
      onCancel?.();
      return;
    }

    if (e.key === "Enter" || e.key === "Tab") {
      setEditing(false);
      setIsHovered(false);
      saveText();
    }
  };

  const getEditableClasses = () => {
    const classes = [className, "editable-span-base"];

    if (editing) {
      classes.push("editable-span-editing");
    } else if (isHovered && showHoverHint) {
      classes.push("editable-span-hover");
    } else if (isEditable) {
      classes.push("cursor-pointer");
    }

    return classes.filter(Boolean).join(" ");
  };

  return (
    <span
      ref={spanRef}
      title={isEditable ? title : undefined}
      className={getEditableClasses()}
      style={style}
      contentEditable={editing && isEditable}
      suppressContentEditableWarning={true}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onBlur={handleBlur}
      onKeyUp={handleKeyup}
      onKeyDown={handleKeydown}
    >
      {text}
    </span>
  );
};

