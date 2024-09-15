<template>
  <div class="flex items-center justify-center">
    <template v-if="assignee">
      <label
        title="Double click to edit"
        class="name leading-4 cursor-text right hover:text-skin-message-hover hover:bg-skin-message-hover"
        :class="{
          'py-1 cursor-text': assigneeLabelHandler.editing,
        }"
        :contenteditable="
          assigneeLabelHandler.editing && mode === RenderMode.Dynamic
        "
        @dblclick="assigneeLabelHandler.handleDblClick"
        @blur="assigneeLabelHandler.handleBlur"
        @keyup="assigneeLabelHandler.handleKeyup"
        @keydown="assigneeLabelHandler.handleKeydown"
        >{{ assignee }}</label
      >
      <span>:</span>
    </template>
    <label
      title="Double click to edit"
      class="name leading-4 cursor-text right hover:text-skin-message-hover hover:bg-skin-message-hover"
      :class="{
        'py-1 cursor-text': participantLabelHandler.editing,
      }"
      :contenteditable="
        participantLabelHandler.editing &&
        mode === RenderMode.Dynamic &&
        UneditableText.indexOf(labelText) === -1
      "
      @dblclick="participantLabelHandler.handleDblClick"
      @blur="participantLabelHandler.handleBlur"
      @keyup="participantLabelHandler.handleKeyup"
      @keydown="participantLabelHandler.handleKeydown"
    >
      {{ labelText }}
    </label>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import { useEditLabel, specialCharRegex } from "@/functions/useEditLabel";
import { RenderMode } from "@/store/Store";
import { Position } from "@/parser/Participants";

const UneditableText = ["Missing Constructor", "ZenUML"];

const props = defineProps<{
  labelText: string;
  labelPositions?: Array<[number, number]>;
  assignee?: string;
  assigneePositions?: Array<[number, number]>;
}>();

const { labelText, labelPositions = [], assigneePositions = [] } = props;
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

function replaceLabelTextWithaPositions(positions: Array<Position>) {
  return function (e: Event) {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    let newText = target.innerText.trim() ?? "";

    // If text is empty or same as the original label text,
    // we replace it with the original label text and bail out early
    if (newText === "" || newText === labelText) {
      target.innerText = labelText;
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

    if (!positions || positions.length === 0) return;

    let newCode = code.value;
    for (const position of positions) {
      const [start, end] = position;
      newCode = newCode.slice(0, start) + newText + newCode.slice(end);
    }
    updateCode(newCode);
  };
}

const participantLabelHandler = useEditLabel(
  replaceLabelTextWithaPositions(labelPositions),
);
const assigneeLabelHandler = useEditLabel(
  replaceLabelTextWithaPositions(assigneePositions),
);
</script>
