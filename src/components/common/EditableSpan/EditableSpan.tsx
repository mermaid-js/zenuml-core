import {
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useLayoutEffect,
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
  onEditingChange?: (editing: boolean) => void;
  ignoreEnterKeyupAfterStart?: boolean;
}

export const EditableSpan = ({
  text,
  isEditable = true,
  className = "",
  onSave,
  title = "Click to edit",
  autoEditToken,
  selectAllOnEdit = false,
  onEditingChange,
  ignoreEnterKeyupAfterStart = false,
}: EditableSpanProps) => {
  const [editing, setEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const originalTextRef = useRef("");
  const spanRef = useRef<HTMLSpanElement>(null);
  const cancelRef = useRef(false);
  const pendingFocusRef = useRef<{ x: number; y: number } | null>(null);
  const ignoreEnterKeyupRef = useRef(false);
  const consumedAutoEditTokenRef = useRef<number | undefined>(undefined);
  const editingRef = useRef(false);
  const onEditingChangeRef = useRef(onEditingChange);
  onEditingChangeRef.current = onEditingChange;

  const changeEditing = (next: boolean) => {
    if (editingRef.current === next) return;
    editingRef.current = next;
    setEditing(next);
    onEditingChangeRef.current?.(next);
  };

  const applyFocus = (clickPoint: { x: number; y: number } | null) => {
    const target = spanRef.current;
    if (!target) return;

    target.focus();

    const selection = window.getSelection();
    if (!selection) return;

    if (!clickPoint) {
      const range = document.createRange();
      range.selectNodeContents(target);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }

    let range = document.caretRangeFromPoint?.(clickPoint.x, clickPoint.y);

    if (!range && (document as any).caretPositionFromPoint) {
      const pos = (document as any).caretPositionFromPoint(
        clickPoint.x,
        clickPoint.y,
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
  };

  // Focus the span synchronously after the DOM is updated with
  // contentEditable=true. Doing this in a layout effect (rather than a
  // setTimeout) guarantees focus is established before any keystrokes can
  // race against it — both for fast typists and for Playwright tests that
  // start typing as soon as they observe contentEditable="true".
  useLayoutEffect(() => {
    if (!editing) return;
    applyFocus(pendingFocusRef.current);
  }, [editing]);

  const startEditing = (e: MouseEvent | KeyboardEvent) => {
    if (!isEditable) return;
    e.preventDefault();
    e.stopPropagation();

    cancelRef.current = false;
    if (ignoreEnterKeyupAfterStart && "key" in e && e.key === "Enter") {
      ignoreEnterKeyupRef.current = true;
    }
    const target = e.target as HTMLElement | null;
    pendingFocusRef.current =
      selectAllOnEdit || !("clientX" in e)
        ? null
        : { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
    if (target) {
      originalTextRef.current = target.innerText ?? "";
    }

    changeEditing(true);
  };

  const handleClick = (e: MouseEvent) => {
    if (editing) {
      e.stopPropagation();
      return;
    }
    if (!isEditable) return;
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

    changeEditing(false);
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

    // Prevent key events from bubbling to parent button elements (e.g. MessageView)
    // while the span is in edit mode. Without this, space would trigger the outer
    // button's click handler instead of being inserted into the editable text.
    e.stopPropagation();

    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      cancelRef.current = true;

      const target = e.target as HTMLElement | null;
      if (target) {
        target.innerText = originalTextRef.current;
      }
      changeEditing(false);
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
    if (e.key === "Enter" && ignoreEnterKeyupRef.current) {
      ignoreEnterKeyupRef.current = false;
      return;
    }
    if (!editing) return;

    if (e.key === "Enter" || e.key === "Tab") {
      // Prevent handleBlur from calling saveText again (stale closure double-save)
      cancelRef.current = true;
      changeEditing(false);
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
    if (
      !autoEditToken ||
      !isEditable ||
      consumedAutoEditTokenRef.current === autoEditToken
    ) {
      return;
    }
    consumedAutoEditTokenRef.current = autoEditToken;
    originalTextRef.current = spanRef.current?.innerText ?? text;
    cancelRef.current = false;
    pendingFocusRef.current = null;
    changeEditing(true);
  }, [autoEditToken, isEditable, text]);

  useEffect(() => {
    if (!isEditable && editingRef.current) {
      changeEditing(false);
    }
  }, [isEditable]);

  useEffect(() => {
    if (editingRef.current) onEditingChangeRef.current?.(true);
    return () => {
      if (editingRef.current) onEditingChangeRef.current?.(false);
    };
  }, []);

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
