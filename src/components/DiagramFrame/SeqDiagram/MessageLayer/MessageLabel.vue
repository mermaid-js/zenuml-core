<template>
  <label
    title="Double click to edit"
    class="px-1 cursor-text hover:text-skin-message-hover hover:bg-skin-message-hover"
    :class="{
      'py-1 px-2 ml-1 cursor-text': editing,
    }"
    :contenteditable="editing"
    @dblclick="handleDblClick"
    @blur="handleBlur"
    @keyup="handleKeyup"
    @keydown="handleKeydown"
  >
    {{ labelText }}
  </label>
</template>
<script setup lang="ts">
import { computed, toRefs } from "vue";
import { useStore } from "vuex";
import { useEditLabel } from "@/functions/useEditLabel";

const props = defineProps<{
  labelText: string;
  labelPosition: [number, number];
}>();

const { labelText, labelPosition } = toRefs(props);
const store = useStore();
const code = computed(() => store.getters.code);
const onContentChange = computed(
  () => store.getters.onContentChange || (() => {}),
);

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

  // if text is empty, we need to replace it with the original label text
  if (newText === "") {
    target.innerText = labelText.value;
    return;
  }

  const [start, end] = labelPosition.value;
  if (start === -1 || end === -1) {
    console.warn("labelPosition is not set");
    return;
  }
  updateCode(code.value.slice(0, start) + newText + code.value.slice(end + 1));
}

const { editing, handleDblClick, handleBlur, handleKeydown, handleKeyup } =
  useEditLabel(replaceLabelText);
</script>
