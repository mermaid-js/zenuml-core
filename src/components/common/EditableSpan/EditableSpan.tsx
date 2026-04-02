import {
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useState,
  useRef,
} from "react";
import "./EditableSpan.css";

export interface EditableSpanProps {
  text: string;
  isEditable?: boolean;
  className?: string;
  onSave: (newText: string) => void;
  title?: string;
  autoEditToken?: number;
  selectAllOnEdit?: boolean;
}

export const EditableSpan = ({
  text,
  isEditable = true,
  className = "",
  onSave,
  title = "Click to edit",
  autoEditToken,
  selectAllOnEdit = false,
}: EditableSpanProps) => {
  const [editing, setEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const originalTextRef = useRef("");
  const spanRef = useRef<HTMLSpanElement>(null);
  const cancelRef = useRef(false);

  const focusEditable = (clickPoint?: { x: number; y: number } | null) => {
    setTimeout(() => {
      const target = spanRef.current;
      if (!target) return;

      target.focus();

      if (!clickPoint) {
        const selection = window.getSelection();
        if (!selection) return;
        const range = document.createRange();
        range.selectNodeContents(target);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      }

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
    }, 0);
  };

  const startEditing = (e: MouseEvent | KeyboardEvent) => {
    if (!isEditable) return;
    e.preventDefault();
    e.stopPropagation();

    cancelRef.current = false;
    const target = e.target as HTMLElement | null;
    const clickPoint =
      selectAllOnEdit || !("clientX" in e)
        ? null
        : { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
    if (target) {
      originalTextRef.current = target.innerText ?? "";
    }

    setEditing(true);
    focusEditable(clickPoint);
  };

  const handleClick = (e: MouseEvent) => {
    if (editing || !isEditable) return;
    // If inside a message, only start editing when that message is already
    // selected. Otherwise let the click propagate to select it first.
    const message = (e.currentTarget as HTMLElement).closest(".message");
    if (message && message.getAttribute("data-selected") !== "true") {
      return;
    }
    startEditing(e);
  };

  const handleMouseEnter = () => {
    if (!editing && isEditable) {
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

  const handleBlur = () => {
    if (!editing) return;
    if (cancelRef.current) return;
    
    setEditing(false);
    setIsHovered(false);
    saveText();
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (!isEditable) return;
    if (!editing) {
      if (e.key === "Enter" || e.key === " ") {
        startEditing(e);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      cancelRef.current = true;
      
      const target = e.target as HTMLElement | null;
      if (target) {
        target.innerText = originalTextRef.current;
      }
      setEditing(false);
      setIsHovered(false);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleKeyup = (e: KeyboardEvent) => {
    if (!isEditable) return;
    if (!editing) return;

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
    } else if (isHovered) {
      classes.push("editable-span-hover");
    } else if (isEditable) {
      classes.push("cursor-pointer");
    }

    return classes.filter(Boolean).join(" ");
  };

  useEffect(() => {
    if (!autoEditToken || !isEditable) {
      return;
    }
    originalTextRef.current = spanRef.current?.innerText ?? text;
    cancelRef.current = false;
    setEditing(true);
    focusEditable(null);
  }, [autoEditToken, isEditable, text]);

  return (
    <span
      ref={spanRef}
      title={isEditable ? title : undefined}
      className={getEditableClasses()}
      contentEditable={editing && isEditable}
      suppressContentEditableWarning={true}
      tabIndex={isEditable && !editing ? 0 : undefined}
      role={isEditable && !editing ? "button" : undefined}
      onClick={handleClick}
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
