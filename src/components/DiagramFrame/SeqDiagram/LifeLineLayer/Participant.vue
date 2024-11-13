<template>
  <div
    v-if="isDefaultStarter"
    class="participant bg-skin-participant shadow-participant border-transparent text-skin-participant rounded text-base leading-4 flex flex-col justify-center z-10 h-10 top-8"
    :class="{ selected: selected }"
    ref="participant"
    :style="{
      transform: `translateY(${translate}px)`,
    }"
    @click="onSelect"
  >
    <div
      v-html="icon"
      class="text-skin-base bg-skin-frame px-1 absolute rounded left-1/2 transform -translate-x-1/2 h-8 [&>svg]:w-full [&>svg]:h-full"
      :aria-description="`icon for ${entity.name}`"
    ></div>
  </div>
  <div v-else>
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
      <div
        v-if="!!icon"
        v-html="icon"
        class="text-skin-base bg-skin-frame px-1 absolute rounded left-1/2 transform -translate-x-1/2 -translate-y-full h-8 [&>svg]:w-full [&>svg]:h-full"
        :aria-description="`icon for ${entity.name}`"
      ></div>
      <!-- Put in a div to give it a fixed height, because stereotype is dynamic. -->
      <div class="h-5 group flex flex-col justify-center">
        <!-- TODO: create a better solution for participant comments -->
        <!--      <span-->
        <!--        v-if="!!comment"-->
        <!--        class="absolute hidden rounded-lg transform -translate-y-8 bg-gray-400 px-2 py-1 text-center text-sm text-white group-hover:flex"-->
        <!--      >-->
        <!--        {{ comment }}-->
        <!--      </span>-->
        <label class="interface leading-4" v-if="stereotype"
          >«{{ stereotype }}»</label
        >
        <ParticipantLabel
          :labelText="labelText"
          :labelPositions="labelPositions"
          :assignee="entity.assignee"
          :assigneePositions="assigneePositions"
        />
      </div>
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
import { _STARTER_ } from "@/parser/OrderedParticipants";

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

    const labelPositions = computed(() => {
      const positions = store.getters.participants.GetPositions(
        props.entity.name,
      );
      // Sort the label positions in descending order to avoid index shifting when updating code
      const positionArray = Array.from(positions ?? []);
      return positionArray.sort((a, b) => b[0] - a[0]);
    });
    const assigneePositions = computed(() => {
      // Sort the label positions in descending order to avoid index shifting when updating code
      const assigneePositions = store.getters.participants.GetAssigneePositions(
        props.entity.name,
      );
      const positionArray = Array.from(assigneePositions ?? []);
      return positionArray.sort((a, b) => b[0] - a[0]);
    });
    const intersectionTop = useIntersectionTop();
    const [scrollTop] = useDocumentScroll();
    const translate = computed(() => {
      const participantOffsetTop = props.offsetTop2 || 0;
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
    return { translate, participant, labelPositions, assigneePositions };
  },
  props: {
    entity: {
      type: Object,
      required: true,
    },
    // offsetTop is a standard HTML property, so we use offsetTop2.
    offsetTop2: {
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
    isDefaultStarter() {
      return this.entity.name === _STARTER_;
    },
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
      if (this.isDefaultStarter) {
        return iconPath["actor"];
      }
      return iconPath[this.entity.type?.toLowerCase()];
    },
    backgroundColor() {
      // Returning `undefined` so that background-color is not set at all in the style attribute
      try {
        if (!this.entity.color) {
          return undefined;
        }
        // removing alpha is a compromise to simplify the logic of determining the background color and font color
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
      let bgColor = window
        .getComputedStyle(this.$refs.participant)
        .getPropertyValue("background-color");
      if (!bgColor) {
        this.color = "inherit";
        return;
      }
      let b = brightnessIgnoreAlpha(bgColor);
      this.color = b > 128 ? "#000" : "#fff";
    },
  },
};
</script>

<style scoped></style>
