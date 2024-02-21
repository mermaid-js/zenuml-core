import sequenceParser from "@/generated-parser/sequenceParser";
import { computed, nextTick, ref } from "vue";
import { useStore } from "vuex";

type ConditionBlockCtx =
  | typeof sequenceParser.IfBlockContext
  | typeof sequenceParser.ElseIfBlockContext
  | typeof sequenceParser.ElseBlockContext
  | typeof sequenceParser.LoopContext;

export type Condition = {
  start: { start: number };
  stop: { stop: number };
};

type UseConditionEditingProps = {
  blocks: ConditionBlockCtx[];
  getCondition: (block: ConditionBlockCtx) => Condition | null;
  getConditionText: (block: ConditionBlockCtx) => string;
};

export function useConditionEdit({
  blocks,
  getCondition,
  getConditionText,
}: UseConditionEditingProps) {
  const store = useStore();
  const code = computed(() => store.getters.code);
  const onContentChange = computed(
    () => store.getters.onContentChange || (() => {}),
  );
  function updateCode(code: string) {
    store.dispatch("updateCode", { code });
    onContentChange.value(code);
  }

  const editableMap = ref(new Map<ConditionBlockCtx, boolean>());
  blocks.forEach((block) => {
    editableMap.value.set(block, false);
  });

  function toggleEditable(block: ConditionBlockCtx, editable: boolean) {
    editableMap.value.set(block, editable);
  }

  async function handleDblClick(block: ConditionBlockCtx, e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleEditable(block, true);

    await nextTick();
    const range = document.createRange();

    range.selectNodeContents(e.target as Node);
    range.collapse(false);
    const sel = window.getSelection();
    if (!sel) return;
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  async function handleBlur(block: ConditionBlockCtx, e: FocusEvent) {
    // avoid race condition with keyup event
    await nextTick();
    if (!editableMap.value.get(block)) return;
    replaceConditionText(block, e);
  }

  function handleKeydown(e: KeyboardEvent) {
    // prevent new line
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function handleKeyup(block: ConditionBlockCtx, e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === "Escape" || e.key === "Tab") {
      replaceConditionText(block, e);
    }
  }

  function replaceConditionText(
    block: ConditionBlockCtx,
    event: KeyboardEvent | FocusEvent,
  ) {
    toggleEditable(block, false);
    event.preventDefault();
    event.stopPropagation();

    const target = event.target as HTMLElement;
    let newText = target.innerText.trim() ?? "";

    // if text is empty, we need to replace it with the original condition text
    if (newText === "") {
      target.innerText = getConditionText(block);
      return;
    }

    // if text has empty spaces, we need to wrap it with double quotes
    if (newText.includes(" ")) {
      newText = newText.replace(/"/g, "");
      newText = `"${newText}"`;
    }

    const condition = getCondition(block);
    if (!condition) return;
    const [start, end] = [condition?.start?.start, condition?.stop?.stop];
    updateCode(
      code.value.slice(0, start) + newText + code.value.slice(end + 1),
    );
  }

  return {
    editableMap,
    handleDblClick,
    handleBlur,
    handleKeydown,
    handleKeyup,
  };
}
