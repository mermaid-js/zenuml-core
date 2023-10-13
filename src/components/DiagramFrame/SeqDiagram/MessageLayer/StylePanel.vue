<template>
  <FloatVirtual
    key="tool"
    @initial="onInitial"
    placement="top"
    :offset="5"
    shift
    :flip="{ padding: flipOffset }"
    zIndex="30"
  >
    <div class="flex bg-white shadow-md z-10 rounded-md p-1">
      <div
        v-for="btn of btns"
        @click="() => onClick(btn.class)"
        :key="btn.name"
      >
        <div
          :class="btn.class"
          class="w-6 mx-1 py-1 rounded-md text-black text-center cursor-pointer hover:bg-gray-200"
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
let onClick: (style: string) => void;

const onInitial = ({ show, reference, floating }: FloatVirtualInitialProps) => {
  store.commit("onMessageClick", (context: any, element: HTMLElement) => {
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
    },
    computed(() => show.value),
  );

  onClick = (style: string) => {
    show.value = false;
    if (!messageContext.value.value) return;
    const start = messageContext.value.value.start.start;
    const lineHead = getLineHead(code.value, start);
    const prevLine = getPrevLine(code.value, start);
    const leadingSpaces = code.value.slice(lineHead).match(/^\s*/)?.[0] || "";
    const prevLineIsComment = prevLine.trim().startsWith("//");
    if (prevLineIsComment) {
      const trimedPrevLine = prevLine.trimStart().slice(2).trimStart();
      const styleStart = trimedPrevLine.indexOf("[");
      const styleEnd = trimedPrevLine.indexOf("]");
      if (styleStart === 0 && styleEnd) {
        const existedStyles = trimedPrevLine.slice(styleStart + 1, styleEnd);
        if (
          !existedStyles
            .split(",")
            .map((s) => s.trim())
            .includes(style)
        ) {
          updateCode(
            code.value.slice(0, getPrevLineHead(code.value, start)) +
              `${leadingSpaces}// [${existedStyles}, ${style}] ${prevLine
                .slice(2)
                .trimStart()}` +
              code.value.slice(lineHead),
          );
        }
      } else {
        updateCode(
          code.value.slice(0, getPrevLineHead(code.value, start)) +
            `${leadingSpaces}// [${style}] ${prevLine.slice(2).trimStart()}` +
            code.value.slice(lineHead),
        );
      }
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
