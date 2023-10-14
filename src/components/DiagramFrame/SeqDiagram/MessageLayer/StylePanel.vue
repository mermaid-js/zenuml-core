<template>
  <FloatVirtual
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
  let styleString: string;
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
        styleString = trimedPrevLine.slice(styleStart + 1, styleEnd);
        existingStyles.value = styleString.split(",").map((s) => s.trim());
      } else {
        styleString = "";
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
        if (existingStyles.value.includes(style)) {
          newComment = `${leadingSpaces}// [${existingStyles.value
            .filter((s) => s !== style)
            .join(", ")}] ${prevLine
            .slice(prevLine.indexOf("]") + 1)
            .trimStart()}`;
        } else if (styleString) {
          newComment = `${leadingSpaces}// [${styleString}, ${style}] ${prevLine
            .slice(prevLine.indexOf("]") + 1)
            .trimStart()}`;
        } else {
          newComment = `${leadingSpaces}// [${style}] ${prevLine
            .slice(prevLine.indexOf("]") + 1)
            .trimStart()}`;
        }
      } else {
        newComment = `${leadingSpaces}// [${style}] ${prevLine
          .slice(2)
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
