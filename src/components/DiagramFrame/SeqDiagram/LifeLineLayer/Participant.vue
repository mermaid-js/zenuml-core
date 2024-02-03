<template>
  <div
    class="participant bg-skin-participant shadow-participant border-skin-participant text-skin-participant rounded text-base leading-4 flex flex-col justify-center z-10 h-10 top-8"
    :class="[
      selected ? 'border-[#120cc9] selected' : '',
      editable
        ? 'cursor-text border-[#120cc9] focus:outline-[#120cc9]'
        : 'cursor-pointer',
    ]"
    ref="participant"
    :style="{
      backgroundColor: backgroundColor,
      color: color,
      transform: `translateY(${translate}px)`,
    }"
    @click="handleSelect"
  >
    <!-- Set the background and text color with bg-skin-base and text-skin-base.
         Override background color if it is defined in participant declaration (e.g. A #FFFFFF).
         TODO: Add a default .selected style
     -->
    <div
      v-if="!!icon"
      v-html="icon"
      class="absolute left-1/2 transform -translate-x-1/2 -translate-y-full h-8 [&>svg]:w-full [&>svg]:h-full"
      :alt="`icon for ${entity.name}`"
    ></div>
    <!-- Put in a div to give it a fixed height, because stereotype is dynamic. -->
    <div class="h-5 group flex flex-col justify-center">
      <span
        v-if="!!comment"
        class="absolute hidden rounded-lg transform -translate-y-8 bg-gray-400 px-2 py-1 text-center text-sm text-white group-hover:flex"
      >
        {{ comment }}
      </span>
      <span
        v-if="!!errorMsg"
        class="absolute rounded-sm block transform left-1/2 translate-y-full -translate-x-1/2 bg-warning p-1 text-center text-xs w-[120px] whitespace-normal drop-shadow"
      >
        {{ errorMsg }}
      </span>
      <label class="interface leading-4" v-if="stereotype"
        >«{{ stereotype }}»</label
      >
      <label
        class="name leading-4 outline-0"
        :contenteditable="editable"
        @dblclick="handleEdit"
        @blur="handleBlur"
        >{{ entity.label || entity.name }}</label
      >
    </div>
  </div>
</template>

<script setup>
import { brightnessIgnoreAlpha, removeAlpha } from "@/utils/Color";
import iconPath from "../../Tutorial/Icons";
import { computed, ref, defineProps, onUpdated, onMounted } from "vue";
import useDocumentScroll from "@/functions/useDocumentScroll";
import useIntersectionTop from "@/functions/useIntersectionTop";
import { useStore } from "vuex";
import { getElementDistanceToTop } from "@/utils/dom";
import { PARTICIPANT_HEIGHT } from "@/positioning/Constants";
import { RenderMode } from "@/store/Store";

const INTERSECTION_ERROR_MARGIN = 10; // a threshold for judging whether the participant is intersecting with the viewport

const props = defineProps({
  offsetTop: Number,
  entity: Object,
  context: Object,
});

const [scrollTop] = useDocumentScroll();
const intersectionTop = useIntersectionTop();

const store = useStore();
const participant = ref(null);
const color = ref("");
const selected = ref(null);
const editable = ref(null);
const errorMsg = ref(null);

const onContentChange = computed(
  () => store.getters.onContentChange || (() => {}),
);

const translate = computed(() => {
  if (store.state.mode === RenderMode.Static) {
    return 0;
  }

  const participantOffsetTop = props.offsetTop || 0;

  let top = intersectionTop.value + scrollTop.value;

  if (
    intersectionTop.value > INTERSECTION_ERROR_MARGIN &&
    store?.state.stickyOffset
  ) {
    top += store?.state.stickyOffset;
  }

  const diagramHeight = store?.state.diagramElement?.clientHeight || 0;
  const diagramTop = store?.state.diagramElement
    ? getElementDistanceToTop(store?.state.diagramElement)
    : 0;
  if (top < participantOffsetTop + diagramTop) return 0;
  return (
    Math.min(top - diagramTop, diagramHeight - PARTICIPANT_HEIGHT) -
    participantOffsetTop
  );
});

const code = computed(() => store.getters.code);
const stereotype = computed(() => props.entity.stereotype);
const comment = computed(() => props.entity.comment);
const icon = computed(() => iconPath[props.entity.type?.toLowerCase()]);

const backgroundColor = computed(() => {
  // Returning `undefined` so that background-color is not set at all in the style attribute
  try {
    if (!props.entity.color) {
      return undefined;
    }
    // TODO: review this decision later; tinycolor2 should be considered as recommended by openai
    // Remove alpha for such a case:
    // 1. Background color for parent has low brightness (e.g. #000)
    // 2. Alpha is low (e.g. 0.1)
    // 3. Entity background has high brightness (e.g. #fff)
    // If we do not remove alpha, the computed background color will be bright while the perceived brightness is low.
    // This will cause issue when calculating font color.
    return props.entity.color && removeAlpha(props.entity.color);
  } catch (e) {
    return undefined;
  }
});

function handleEdit() {
  editable.value = true;
}

function handleSelect() {
  selected.value = !selected.value;
  store.commit("onSelect", props.entity.name);
}

function handleBlur(e) {
  const regex = /^[a-zA-Z][a-zA-Z0-9_\-\s]{0,29}$/;
  if (!regex.test(e.target.innerText)) {
    errorMsg.value = "Please start with a letter, can mix with numbers.";
    return;
  }
  errorMsg.value = null;
  const updatedCode = code.value.replaceAll(
    props.entity.label || props.entity.name,
    e.target.innerText,
  );
  store.dispatch("updateCode", { code: updatedCode });
  onContentChange.value(updatedCode);
}

function updateFontColor() {
  // Returning `undefined` so that background-color is not set at all in the style attribute
  if (!backgroundColor.value) {
    return undefined;
  }

  const bgColor = window
    .getComputedStyle(participant.value)
    .getPropertyValue("background-color");

  if (!bgColor) {
    return undefined;
  }

  const b = brightnessIgnoreAlpha(bgColor);
  color.value = b > 128 ? "#000" : "#fff";
}

onMounted(() => {
  updateFontColor();
});

onUpdated(() => {
  updateFontColor();
});
</script>
