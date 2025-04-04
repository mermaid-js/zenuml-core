<template>
  <label>[</label>
  <label
    title="Double click to edit"
    class="bg-skin-frame opacity-65 condition px-1 cursor-text hover:text-skin-message-hover hover:bg-skin-message-hover"
    :class="{
      'cursor-text': editing,
    }"
    :contenteditable="editing && mode === RenderMode.Dynamic"
    @dblclick="handleDblClick"
    @blur="handleBlur"
    @keyup="handleKeyup"
    @keydown="handleKeydown"
  >
    {{ labelText }}
  </label>
  <label>]</label>
</template>
<script setup lang="ts">
import { computed, toRefs } from "vue";
import { useStore } from "vuex";
import { useEditLabel, specialCharRegex } from "@/functions/useEditLabel";
import { RenderMode } from "@/store/Store";

const equalityRegex = /\b(\w+)\s*==\s*(\w+)\b/g;

const props = defineProps<{
  condition: any;
}>();

const { condition } = toRefs(props);
const store = useStore();
const mode = computed(() => store.state.mode);
const code = computed(() => store.getters.code);
const onContentChange = computed(
  () => store.getters.onContentChange || (() => {}),
);
const labelText = computed(() => condition?.value?.getFormattedText() ?? "");

function updateCode(code: string) {
  store.dispatch("updateCode", { code });
  onContentChange.value(code);
}

function replaceLabelText(e: Event) {
  e.preventDefault();
  e.stopPropagation();

  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  let newText = target.innerText.trim() ?? "";

  // if text is empty, we need to replace it with the original condition text
  if (newText === "") {
    target.innerText = labelText.value;
    return;
  }

  // If text has special characters, not an equalitiy condition, we wrap it with double quotes
  if (specialCharRegex.test(newText) && !equalityRegex.test(newText)) {
    newText = newText.replace(/"/g, ""); // remove existing double quotes
    newText = `"${newText}"`;
  }

  const [start, end] = [
    condition.value?.start?.start,
    condition.value?.stop?.stop,
  ];
  if (start === -1 || end === -1) {
    console.warn("labelPosition is not set");
    return;
  }
  updateCode(code.value.slice(0, start) + newText + code.value.slice(end + 1));
}

const { editing, handleDblClick, handleBlur, handleKeydown, handleKeyup } =
  useEditLabel(replaceLabelText);
</script>

<style scoped></style>
