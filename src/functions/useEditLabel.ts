import { FocusEvent, KeyboardEvent, MouseEvent, useState, useRef } from "react";

export const specialCharRegex = /[!@#$%^&*()+-,.?''":{}|<>/\s]/;

export interface EditLabelOptions {
  /**
   * Enable single-click editing instead of double-click
   * @default false
   */
  singleClick?: boolean;

  /**
   * Delay in ms before enabling editing on single click
   * @default 300
   */
  clickDelay?: number;

  /**
   * Show hover indicator for editable elements
   * @default true
   */
  showHoverHint?: boolean;
}

export const useEditLabelImproved = (
  replaceTextFn: (e: FocusEvent | KeyboardEvent | MouseEvent) => void,
  options: EditLabelOptions = {}
) => {
  const {
    singleClick = false,
    clickDelay = 300,
    showHoverHint = true,
  } = options;

  const [editing, setEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef(0);

  const startEditing = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditing(true);

    // Focus and position cursor at the end
    setTimeout(() => {
      const target = e.target as HTMLElement;
      if (!target) return;

      target.focus();

      // Set cursor to end of text
      const range = document.createRange();
      range.selectNodeContents(target);
      range.collapse(false);

      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }, 0);
  };

  const handleClick = (e: MouseEvent) => {
    if (editing) return;

    if (singleClick) {
      clickCountRef.current++;

      // Clear existing timeout
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }

      // Single click - start editing after delay
      clickTimeoutRef.current = setTimeout(() => {
        if (clickCountRef.current === 1) {
          startEditing(e);
        }
        clickCountRef.current = 0;
      }, clickDelay);
    }
  };

  const handleDoubleClick = (e: MouseEvent) => {
    if (editing) return;

    // Clear single-click timeout if double-click occurs
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickCountRef.current = 0;
    }

    startEditing(e);
  };

  const handleMouseEnter = () => {
    if (showHoverHint && !editing) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleBlur = (e: FocusEvent) => {
    // Avoid race condition with keyup event
    setTimeout(() => {
      if (!editing) return;
      setEditing(false);
      setIsHovered(false);
      replaceTextFn(e);
    }, 0);
  };

  const handleKeydown = (e: KeyboardEvent) => {
    // Prevent new line
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleKeyup = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Escape" || e.key === "Tab") {
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
    handleClick: singleClick ? handleClick : undefined,
    handleDoubleClick,
    handleMouseEnter,
    handleMouseLeave,
    handleBlur,
    handleKeydown,
    handleKeyup,
    getEditableClasses,
  };
};