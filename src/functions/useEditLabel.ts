import {
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  useState,
  useRef
} from "react";

export const specialCharRegex = /[!@#$%^&*()+-,.?''":{}|<>/\s]/;

export interface EditLabelOptions {
  /**
   * Show hover indicator for editable elements
   * @default true
   */
  showHoverHint?: boolean;

  /**
   * Whether the label should enter edit mode
   * @default true
   */
  isEditable?: boolean;
}

export const useEditLabelImproved = (
  replaceTextFn: (e: FocusEvent | KeyboardEvent | MouseEvent) => void,
  options: EditLabelOptions = {}
) => {
  const {
    showHoverHint = true,
    isEditable = true
  } = options;

  const [editing, setEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const originalTextRef = useRef("");

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

  const handleBlur = (e: FocusEvent) => {
    if (!editing) return;
    // Avoid race condition with keyup event
    setTimeout(() => {
      if (!editing) return;
      setEditing(false);
      setIsHovered(false);
      replaceTextFn(e);
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
      return;
    }

    if (e.key === "Enter" || e.key === "Tab") {
      setEditing(false);
      setIsHovered(false);
      replaceTextFn(e);
    }
  };

  // Generate improved CSS classes
  const getEditableClasses = (baseClasses = "") => {
    const classes = [baseClasses, "editable-label-base"];

    if (editing) {
      classes.push("editable-label-editing");
    } else if (isHovered && showHoverHint) {
      classes.push("editable-label-hover");
    } else {
      classes.push("cursor-pointer");
    }

    return classes.filter(Boolean).join(" ");
  };

  return {
    editing,
    isHovered,
    handleDoubleClick,
    handleMouseEnter,
    handleMouseLeave,
    handleBlur,
    handleKeydown,
    handleKeyup,
    getEditableClasses,
  };
};
