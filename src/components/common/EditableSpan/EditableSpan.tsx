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
  text: string;
  isEditable?: boolean;
  className?: string;
  style?: CSSProperties;
  onSave: (newText: string) => void;
  title?: string;
}

export const EditableSpan = ({
  text,
  isEditable = true,
  className = "",
  style,
  onSave,
  title = "Double-click to edit",
}: EditableSpanProps) => {
  const [editing, setEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const originalTextRef = useRef("");
  const spanRef = useRef<HTMLSpanElement>(null);
  const cancelRef = useRef(false);

  const startEditing = (e: MouseEvent | KeyboardEvent) => {
    if (!isEditable) return;
    e.preventDefault();
    e.stopPropagation();

    cancelRef.current = false;
    const target = e.target as HTMLElement | null;
    const clickPoint =
      "clientX" in e
        ? { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY }
        : null;
    if (target) {
      originalTextRef.current = target.innerText ?? "";
    }

    setEditing(true);

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

  const handleBlur = (e: FocusEvent) => {
    if (!editing) return;
    if (cancelRef.current) return;
    
    setEditing(false);
    setIsHovered(false);
    saveText();
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (!isEditable) return;
    if (!editing) return;

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
