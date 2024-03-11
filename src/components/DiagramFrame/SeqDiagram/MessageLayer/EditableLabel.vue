<template>
  <label
    title="Double click to edit"
    class="condition px-1 cursor-text hover:text-skin-message-hover hover:bg-skin-message-hover"
    :class="{
      'py-1 px-2 ml-1 cursor-text': editable,
    }"
    :contenteditable="editable"
    @dblclick="handleDblClick"
    @blur="handleBlur"
    @keyup="handleKeyup"
    @keydown="handleKeydown"
  >
    {{ labelText }}
  </label>
</template>
<script setup lang="ts">
import { computed, nextTick, ref, toRefs } from "vue";
import { useStore } from "vuex";

const props = defineProps<{
  labelText: string;
  labelPosition: [number, number];
}>();

const { labelText, labelPosition } = toRefs(props);
const editable = ref(false);
const store = useStore();
const code = computed(() => store.getters.code);
const onContentChange = computed(
  () => store.getters.onContentChange || (() => {}),
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
  replaceLabelText(e);
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
    replaceLabelText(e);
  }
}

function checkSpecialCharacters(text) {
  const regex = /[!@#$%^&*+-,.?''":{}|<>/\s]/g;
  return regex.test(text);
}

function replaceLabelText(e) {
  setEditable(false);
  e.preventDefault();
  e.stopPropagation();

  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  let newText = target.innerText.trim() ?? "";

  // if text is empty, we need to replace it with the original label text
  if (newText === "") {
    target.innerText = labelText.value;
    return;
  }

  // if text has special characters, we need to wrap it with double quotes
  if (checkSpecialCharacters(newText)) {
    newText = newText.replace(/"/g, ""); // remove existing double quotes
    newText = `"${newText}"`;
  }

  updateCode(
    code.value.slice(0, labelPosition.value[0]) +
      newText +
      code.value.slice(labelPosition.value[1] + 1),
  );
}
</script>
