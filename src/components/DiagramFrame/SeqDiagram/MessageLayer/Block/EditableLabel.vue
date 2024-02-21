<template>
  <label
    class="condition px-1"
    :class="{
      editable: editable,
    }"
    :contenteditable="editable"
    @dblclick="handleDblClick"
    @blur="handleBlur"
    @keyup="handleKeyup"
    @keydown="handleKeydown"
  >
    {{ editable ? conditionText : `[${conditionText}]` }}
  </label>
</template>
<script>
import { computed, nextTick } from "vue";
import { useStore } from "vuex";

export default {
  name: "EditableLabel",
  props: ["editable", "block", "toggleEditable", "getConditionFromBlock"],
  setup(props) {
    const store = useStore();
    const code = computed(() => store.getters.code);
    const onContentChange = computed(
      () => store.getters.onContentChange || (() => {}),
    );
    const condition = computed(() => props.getConditionFromBlock(props.block));
    const conditionText = computed(
      () => condition.value.getFormattedText() ?? "",
    );

    function updateCode(code) {
      store.dispatch("updateCode", { code });
      onContentChange.value(code);
    }

    async function handleDblClick(e) {
      e.preventDefault();
      e.stopPropagation();
      props.toggleEditable(true);

      await nextTick();
      const range = document.createRange();

      // select the text and set the cursor at the end
      range.selectNodeContents(e.target);
      range.collapse(false);
      const sel = window.getSelection();
      if (!sel) return;
      sel?.removeAllRanges();
      sel?.addRange(range);
    }

    async function handleBlur(e) {
      // avoid race condition with keyup event
      await nextTick();
      if (!props.editable) return;
      replaceConditionText(e);
    }

    function handleKeydown(e) {
      // prevent new line
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    function handleKeyup(e) {
      if (e.key === "Enter" || e.key === "Escape" || e.key === "Tab") {
        replaceConditionText(e);
      }
    }

    function replaceConditionText(e) {
      props.toggleEditable(false);
      e.preventDefault();
      e.stopPropagation();

      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      let newText = target.innerText.trim() ?? "";

      // if text is empty, we need to replace it with the original condition text
      if (newText === "") {
        target.innerText = conditionText.value;
        return;
      }

      // if text has empty spaces, we need to wrap it with double quotes
      if (newText.includes(" ")) {
        newText = newText.replace(/"/g, "");
        newText = `"${newText}"`;
      }

      const [start, end] = [
        condition.value.start?.start,
        condition.value.stop?.stop,
      ];
      updateCode(
        code.value.slice(0, start) + newText + code.value.slice(end + 1),
      );
    }

    return {
      conditionText,
      handleBlur,
      handleDblClick,
      handleKeydown,
      handleKeyup,
    };
  },
};
</script>

<style scoped>
.condition.editable {
  padding: 2px 6px;
  margin-left: 4px;
  cursor: text;
}
</style>
