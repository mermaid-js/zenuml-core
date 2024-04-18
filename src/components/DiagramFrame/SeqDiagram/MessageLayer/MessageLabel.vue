<template>
  <label
    title="Double click to edit"
    class="px-1 cursor-text right hover:text-skin-message-hover hover:bg-skin-message-hover"
    :class="{
      'py-1 px-2 ml-1 cursor-text': editing,
      'absolute right-1/2 translate-x-1/2 bottom-0': editing && !isSelfAsync,
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
import { useEditLabel, specialCharRegex } from "@/functions/useEditLabel";

const props = withDefaults(
  defineProps<{
    labelText: string;
    labelPosition: [number, number];
    isAsync?: boolean;
    isSelf?: boolean;
  }>(),
  {
    isAsync: false,
    isSelf: false,
  },
);

const { labelText, labelPosition, isAsync, isSelf } = toRefs(props);
const store = useStore();
const code = computed(() => store.getters.code);
const onContentChange = computed(
  () => store.getters.onContentChange || (() => {}),
);
const isSelfAsync = computed(() => !!isAsync?.value && !!isSelf?.value);

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

  if (newText.includes(" ")) {
    newText = newText.replace(/\s+/g, " "); // remove extra spaces
  }

  // If text has special characters or space, we wrap it with double quotes
  // *NOTE*: We don't wrap the text with double quotes if it's an async message
  if (!isAsync.value && specialCharRegex.test(newText)) {
    newText = newText.replace(/"/g, ""); // remove existing double quotes
    newText = `"${newText}"`;
    specialCharRegex.lastIndex = 0;
  }

  const [start, end] = labelPosition.value;
  if (start === -1 || end === -1) {
    console.warn("labelPosition is not set");
    return;
  }
  console.log({
    newText,
    oldText: target.innerText,
    originalText: labelText.value,
  });
  const newCode =
    code.value.slice(0, start) + newText + code.value.slice(end + 1);
  updateCode(newCode);
}

const { editing, handleDblClick, handleBlur, handleKeydown, handleKeyup } =
  useEditLabel(replaceLabelText);
</script>
