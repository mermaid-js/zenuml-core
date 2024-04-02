<template>
  <label
    title="Double click to edit"
    class="bg-skin-frame/[0.66] condition px-1 cursor-text hover:text-skin-message-hover hover:bg-skin-message-hover"
    :class="{
      'py-1 px-2 ml-1 cursor-text': editable,
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
import { computed, nextTick, ref } from "vue";
import { useStore } from "vuex";

export default {
  name: "ConditionLabel",
  props: ["block", "getConditionFromBlock"],
  setup(props) {
    const editable = ref(false);
    const store = useStore();
    const code = computed(() => store.getters.code);
    const onContentChange = computed(
      () => store.getters.onContentChange || (() => {}),
    );
    const condition = computed(() => props.getConditionFromBlock(props.block));
    const conditionText = computed(
      () => condition?.value?.getFormattedText() ?? "",
    );

    function setEditable(_editable) {
      editable.value = _editable;
    }

    function updateCode(code) {
      store.dispatch("updateCode", { code });
      onContentChange.value(code);
    }

    async function handleDblClick(e) {
      e.preventDefault();
      e.stopPropagation();
      setEditable(true);

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
      if (!editable.value) return;
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

    function checkSpecialCharacters(text) {
      const regex = /[!@#$%^&*()+-,.?''":{}|<>/\s]/g;
      return regex.test(text);
    }

    function replaceConditionText(e) {
      setEditable(false);
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

      // if text has special characters, we need to wrap it with double quotes
      if (checkSpecialCharacters(newText)) {
        newText = newText.replace(/"/g, ""); // remove existing double quotes
        newText = `"${newText}"`;
      }

      const [start, end] = [
        condition.value?.start?.start,
        condition.value?.stop?.stop,
      ];
      updateCode(
        code.value.slice(0, start) + newText + code.value.slice(end + 1),
      );
    }

    return {
      editable,
      conditionText,
      handleBlur,
      handleDblClick,
      handleKeydown,
      handleKeyup,
    };
  },
};
</script>

<style scoped></style>
