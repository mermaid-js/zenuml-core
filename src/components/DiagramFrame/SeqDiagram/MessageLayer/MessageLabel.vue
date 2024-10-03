<template>
  <label
    title="Double click to edit"
    class="px-1 cursor-text right hover:text-skin-message-hover hover:bg-skin-message-hover"
    :class="{
      'cursor-text': editing,
    }"
    :contenteditable="editing && mode === RenderMode.Dynamic"
    @dblclick="handleDblClick"
    @blur="handleBlur"
    @keyup="handleKeyup"
    @keydown="handleKeydown"
  >
    {{ fomattedLabelText }}
  </label>
</template>
<script setup lang="ts">
import { computed, toRefs } from "vue";
import { useStore } from "vuex";
import { RenderMode } from "@/store/Store";
import { useEditLabel, specialCharRegex } from "@/functions/useEditLabel";
import { formatText } from "@/utils/StringUtil";

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

const { labelText, labelPosition, isAsync } = toRefs(props);
const store = useStore();
const mode = computed(() => store.state.mode);
const code = computed(() => store.getters.code);
const onContentChange = computed(
  () => store.getters.onContentChange || (() => {}),
);
const fomattedLabelText = computed(() => formatText(labelText.value));

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
  // *NOTE*: We don't wrap the text with  quotes if it's an async message
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

  const newCode =
    code.value.slice(0, start) + newText + code.value.slice(end + 1);
  updateCode(newCode);
}

const { editing, handleDblClick, handleBlur, handleKeydown, handleKeyup } =
  useEditLabel(replaceLabelText);
</script>
