<template>
  <div
    class="participant bg-skin-participant shadow-participant border-skin-participant text-skin-participant rounded text-base leading-4 flex flex-col justify-center z-10 h-10 top-8"
    :class="{ selected: selected }"
    ref="participant"
    :style="{
      backgroundColor: backgroundColor,
      color: color,
      transform: `translateY(${translate}px)`,
    }"
    @click="onSelect"
  >
    <!-- Set the background and text color with bg-skin-base and text-skin-base.
         Override background color if it is defined in participant declaration (e.g. A #FFFFFF).
         TODO: Add a default .selected style
     -->
    <div
      v-if="!!icon"
      v-html="icon"
      class="absolute bg-skin-participant px-1 left-1/2 transform -translate-x-1/2 -translate-y-full h-8 [&>svg]:w-full [&>svg]:h-full"
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
      <label class="interface leading-4" v-if="stereotype"
        >«{{ stereotype }}»</label
      >
      <ParticipantLabel
        :labelText="labelText"
        :labelPositions="labelPositions"
        :assignee="entity.assignee"
      />
    </div>
  </div>
</template>

<script>
import { brightnessIgnoreAlpha, removeAlpha } from "@/utils/Color";
import iconPath from "../../Tutorial/Icons";
import { computed, ref } from "vue";
import useDocumentScroll from "@/functions/useDocumentScroll";
import useIntersectionTop from "@/functions/useIntersectionTop";
import { useStore } from "vuex";
import { getElementDistanceToTop } from "@/utils/dom";
import { PARTICIPANT_HEIGHT } from "@/positioning/Constants";
import { RenderMode } from "@/store/Store";
import ParticipantLabel from "./ParticipantLabel.vue";

const INTERSECTION_ERROR_MARGIN = 10; // a threshold for judging whether the participant is intersecting with the viewport

export default {
  name: "Participant",
  components: {
    ParticipantLabel,
  },
  setup(props) {
    const store = useStore();
    const participant = ref(null);
    if (store.state.mode === RenderMode.Static) {
      return { translate: 0, participant };
    }

    const labelPositions = computed(() =>
      store.getters.participants.Positions().get(props.entity.name),
    );
    const intersectionTop = useIntersectionTop();
    const [scrollTop] = useDocumentScroll();
    const translate = computed(() => {
      const participantOffsetTop = props.offsetTop || 0;
      let top = intersectionTop.value + scrollTop.value;
      if (
        intersectionTop.value > INTERSECTION_ERROR_MARGIN &&
        store?.state.stickyOffset
      )
        top += store?.state.stickyOffset;
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
    return { translate, participant, labelPositions };
  },
  props: {
    entity: {
      type: Object,
      required: true,
    },
    offsetTop: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      color: undefined,
    };
  },
  mounted() {
    this.updateFontColor();
  },
  updated() {
    this.updateFontColor();
  },
  computed: {
    selected() {
      return this.$store.state.selected.includes(this.entity.name);
    },
    stereotype() {
      return this.entity.stereotype;
    },
    labelText() {
      return this.entity.assignee
        ? this.entity.name.split(":")[1]
        : this.entity.label || this.entity.name;
    },
    comment() {
      return this.entity.comment;
    },
    icon() {
      return iconPath[this.entity.type?.toLowerCase()];
    },
    backgroundColor() {
      // Returning `undefined` so that background-color is not set at all in the style attribute
      try {
        if (!this.entity.color) {
          return undefined;
        }
        // TODO: review this decision later; tinycolor2 should be considered as recommended by openai
        // Remove alpha for such a case:
        // 1. Background color for parent has low brightness (e.g. #000)
        // 2. Alpha is low (e.g. 0.1)
        // 3. Entity background has high brightness (e.g. #fff)
        // If we do not remove alpha, the computed background color will be bright while the perceived brightness is low.
        // This will cause issue when calculating font color.
        return this.entity.color && removeAlpha(this.entity.color);
      } catch (e) {
        return undefined;
      }
    },
  },
  methods: {
    onSelect() {
      this.$store.commit("onSelect", this.entity.name);
    },
    updateFontColor() {
      // Returning `undefined` so that background-color is not set at all in the style attribute
      if (!this.backgroundColor) {
        return undefined;
      }
      let bgColor = window
        .getComputedStyle(this.$refs.participant)
        .getPropertyValue("background-color");
      if (!bgColor) {
        return undefined;
      }
      let b = brightnessIgnoreAlpha(bgColor);
      this.color = b > 128 ? "#000" : "#fff";
    },
  },
};
</script>

<style scoped></style>
