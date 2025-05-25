import { FocusEvent, KeyboardEvent, MouseEvent, useState } from "react";

export const specialCharRegex = /[!@#$%^&*()+-,.?''":{}|<>/\s]/;

export const useEditLabel = (
  replaceTextFn: (e: FocusEvent | KeyboardEvent | MouseEvent) => void,
) => {
  const [editing, setEditing] = useState(false);

  async function handleDblClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditing(true);

    setTimeout(() => {
      const range = document.createRange();

      // select the text and set the cursor at the end
      if (!e.target) return;
      range.selectNodeContents(e.target as Node);
      range.collapse(false);
      const sel = window.getSelection();
      if (!sel) return;
      sel?.removeAllRanges();
      sel?.addRange(range);
    }, 0);
  }

  async function handleBlur(e: FocusEvent) {
    // avoid race condition with keyup event
    setTimeout(() => {
      if (!editing) return;
      setEditing(false);
      replaceTextFn(e);
    }, 0);
  }

  function handleKeydown(e: KeyboardEvent) {
    // prevent new line
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function handleKeyup(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === "Escape" || e.key === "Tab") {
      setEditing(false);
      replaceTextFn(e);
    }
  }

  return {
    editing,
    handleDblClick,
    handleBlur,
    handleKeydown,
    handleKeyup,
  };
};
