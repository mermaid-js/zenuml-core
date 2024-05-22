<template>
  <div class="flex items-center justify-center">
    <template v-if="assignee">
      <label class="name leading-4">{{ assignee }}:</label>
    </template>
    <label
      title="Double click to edit"
      class="name leading-4 cursor-text right hover:text-skin-message-hover hover:bg-skin-message-hover"
      :class="{
        'py-1 px-2 cursor-text': editing,
      }"
      :contenteditable="editing && mode === RenderMode.Dynamic"
      @dblclick="handleDblClick"
      @blur="handleBlur"
      @keyup="handleKeyup"
      @keydown="handleKeydown"
    >
      {{ labelText }}
    </label>
  </div>
</template>
<script setup lang="ts">
import { computed, toRefs } from "vue";
import { useStore } from "vuex";
import { useEditLabel, specialCharRegex } from "@/functions/useEditLabel";
import { RenderMode } from "@/store/Store";

const props = defineProps<{
  labelText: string;
  labelPositions?: Set<string>;
  assignee?: string;
}>();

const { labelText, labelPositions } = toRefs(props);
const store = useStore();
const mode = computed(() => store.state.mode);
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

  // If text is empty or same as the original label text,
  // we replace it with the original label text and bail out early
  if (newText === "" || newText === labelText.value) {
    target.innerText = labelText.value;
    return;
  }

  if (newText.includes(" ")) {
    newText = newText.replace(/\s+/g, " "); // remove extra spaces
  }

  // If text has special characters or space, we wrap it with double quotes
  if (specialCharRegex.test(newText)) {
    newText = newText.replace(/"/g, ""); // remove existing double quotes
    newText = `"${newText}"`;
    specialCharRegex.lastIndex = 0;
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
