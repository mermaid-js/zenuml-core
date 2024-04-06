<template>
  <label
    title="Double click to edit"
    class="name leading-4 cursor-text right hover:text-skin-message-hover hover:bg-skin-message-hover"
    :class="{
      'absolute right-1/2 translate-x-1/2 bottom-0  py-1 px-2 ml-1 cursor-text':
        editing,
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

const props = defineProps<{
  labelText: string;
  labelPositions?: Set<string>;
}>();

const { labelText, labelPositions } = toRefs(props);
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

  // If text has special characters or space, we wrap it with double quotes
  if (specialCharRegex.test(newText) || newText.includes(" ")) {
    newText = newText.replace(/[\s"]/g, ""); // remove existing double quotes and empty spaces
    newText = `"${newText}"`;
  }

  if (!labelPositions?.value) return;

  // Sort the label positions in descending order to avoid index shifting
  const labelPositionsArray = Array.from(labelPositions.value);
  const reversedSortedLabelPositions = labelPositionsArray.sort(
    (a, b) => JSON.parse(b)[0] - JSON.parse(a)[0],
  );

  let newCode = code.value;
  for (const labelPosition of reversedSortedLabelPositions) {
    const [start, end] = JSON.parse(labelPosition);
    newCode = newCode.slice(0, start) + newText + newCode.slice(end);
  }
  updateCode(newCode);
}

const { editing, handleDblClick, handleBlur, handleKeydown, handleKeyup } =
  useEditLabel(replaceLabelText);
</script>
