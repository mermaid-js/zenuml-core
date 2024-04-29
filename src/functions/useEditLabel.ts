import { ref, nextTick } from "vue";

export const specialCharRegex = /[!@#$%^&*()+-,.?''":{}|<>/\s]/;

export const useEditLabel = (replaceTextFn: (e: Event) => void) => {
  const editing = ref(false);

  function setEditing(_editing: boolean) {
    editing.value = _editing;
  }

  async function handleDblClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditing(true);

    await nextTick();
    const range = document.createRange();

    // select the text and set the cursor at the end
    if (!e.target) return;
    range.selectNodeContents(e.target as Node);
    range.collapse(false);
    const sel = window.getSelection();
    if (!sel) return;
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  async function handleBlur(e: FocusEvent) {
    // avoid race condition with keyup event
    await nextTick();
    if (!editing.value) return;
    setEditing(false);
    replaceTextFn(e);
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
