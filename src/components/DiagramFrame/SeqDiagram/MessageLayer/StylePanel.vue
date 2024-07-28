<template>
  <FloatVirtual
    vue-transition
    key="tool"
    @initial="onInitial"
    placement="top"
    :offset="5"
    :flip="{ padding: flipOffset }"
    shift
    zIndex="30"
  >
    <div class="flex bg-white shadow-md z-10 rounded-md p-1">
      <div
        v-for="btn of btns"
        @click="() => onClick(btn.class)"
        :key="btn.name"
      >
        <div
          class="w-6 mx-1 py-1 rounded-md text-black text-center cursor-pointer hover:bg-gray-200"
          :class="[
            btn.class,
            { 'bg-gray-100': existingStyles.includes(btn.class) },
          ]"
        >
          {{ btn.content }}
        </div>
      </div>
    </div>
  </FloatVirtual>
</template>
<script setup lang="ts">
import {
  FloatVirtual,
  FloatVirtualInitialProps,
  useOutsideClick,
} from "@headlessui-float/vue";
import { computed, ref } from "vue";
import { getLineHead, getPrevLine, getPrevLineHead } from "@/utils/StringUtil";
import { useStore } from "vuex";
import { getElementDistanceToTop } from "@/utils/dom";
import { PARTICIPANT_HEIGHT } from "@/positioning/Constants";

const messageContext = ref<{ value: any }>({ value: null });
const store = useStore();
const onContentChange = computed(
  () => store.getters.onContentChange || (() => {}),
);
const flipOffset = computed(
  () =>
    getElementDistanceToTop(store.getters.diagramElement) + PARTICIPANT_HEIGHT,
);
const code = computed(() => store.getters.code);
const updateCode = (code: string) => {
  store.dispatch("updateCode", { code });
  onContentChange.value(code);
};
const existingStyles = ref<string[]>([]);
let onClick: (style: string) => void;

const onInitial = ({ show, reference, floating }: FloatVirtualInitialProps) => {
  let start: number;
  let lineHead: number;
  let prevLine: string;
  let leadingSpaces: string;
  let prevLineIsComment: boolean;
  let hasStyleBrackets: boolean;
  store.commit("onMessageClick", (context: any, element: HTMLElement) => {
    start = context.value.start.start;
    lineHead = getLineHead(code.value, start);
    prevLine = getPrevLine(code.value, start);
    leadingSpaces = code.value.slice(lineHead).match(/^\s*/)?.[0] || "";
    prevLineIsComment = prevLine.trim().startsWith("//");
    if (prevLineIsComment) {
      const trimedPrevLine = prevLine.trimStart().slice(2).trimStart();
      const styleStart = trimedPrevLine.indexOf("[");
      const styleEnd = trimedPrevLine.indexOf("]");
      hasStyleBrackets = Boolean(styleStart === 0 && styleEnd);
      if (hasStyleBrackets) {
        existingStyles.value = trimedPrevLine
          .slice(styleStart + 1, styleEnd)
          .split(",")
          .map((s) => s.trim());
      } else {
        existingStyles.value = [];
      }
    }
    reference.value = {
      getBoundingClientRect: () => element.getBoundingClientRect(),
    };
    messageContext.value = context;
    show.value = true;
  });
  useOutsideClick(
    floating,
    () => {
      show.value = false;
      existingStyles.value = [];
    },
    computed(() => show.value),
  );

  onClick = (style: string) => {
    show.value = false;
    if (!messageContext.value.value) return;
    if (prevLineIsComment) {
      let newComment = "";
      if (hasStyleBrackets) {
        let updatedStyles;

        if (existingStyles.value.includes(style)) {
          updatedStyles = existingStyles.value.filter((s) => s !== style);
        } else {
          updatedStyles = [...existingStyles.value, style];
        }

        newComment = `${leadingSpaces}// [${updatedStyles
          .filter(Boolean)
          .join(", ")}] ${prevLine
          .slice(prevLine.indexOf("]") + 1)
          .trimStart()}`;
      } else {
        newComment = `${leadingSpaces}// [${style}] ${prevLine
          .slice((prevLine.match(/\/\/*/)?.index || -2) + 2)
          .trimStart()}`;
      }
      if (!newComment.endsWith("\n")) newComment += "\n";
      updateCode(
        code.value.slice(0, getPrevLineHead(code.value, start)) +
          newComment +
          code.value.slice(lineHead),
      );
    } else {
      updateCode(
        code.value.slice(0, lineHead) +
          `${leadingSpaces}// [${style}]\n` +
          code.value.slice(lineHead),
      );
    }
  };
};

const btns = [
  {
    name: "bold",
    content: "B",
    class: "font-bold",
  },
  {
    name: "italic",
    content: "I",
    class: "italic",
  },
  {
    name: "underline",
    content: "U",
    class: "underline",
  },
  {
    name: "strikethrough",
    content: "S",
    class: "line-through",
  },
];
</script>
