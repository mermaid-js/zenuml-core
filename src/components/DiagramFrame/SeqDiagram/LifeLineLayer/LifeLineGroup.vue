<template>
  <!-- Merged the outer and middle divs while preserving all functionality -->
  <div
    class="lifeline-group-container absolute flex flex-col flex-grow h-full outline-dashed outline-skin-primary"
    v-if="entities.length > 0"
    :style="{
      left: `${left}px`,
      width: `${right - left}px`,
    }"
  >
    <!-- Group name with icon styling similar to participant icons -->
    <div
      class="z-10 absolute flex items-center justify-center w-full bg-skin-frame"
      v-if="renderParticipants && name"
    >
      <span class="font-semibold text-skin-lifeline-group-name">{{
        name
      }}</span>
    </div>

    <div class="lifeline-group relative flex-grow">
      <life-line
        v-for="entity in entities"
        inGroup="true"
        :key="entity.name"
        :ref="entity.name"
        :entity="entity"
        :group-left="left"
        :render-life-line="renderLifeLine"
        :renderParticipants="renderParticipants"
      />
    </div>
  </div>
</template>

<script>
import { Participants } from "@/parser";
import LifeLine from "./LifeLine.vue";
import { mapGetters } from "vuex";

// Constants
const LIFELINE_GROUP_OUTLINE_MARGIN = 2; // Small margin for group outline positioning

export default {
  name: "lifeline-group",
  props: ["context", "renderParticipants", "renderLifeLine"],
  computed: {
    ...mapGetters(["centerOf", "coordinates"]),
    name() {
      return this.context?.name()?.getFormattedText();
    },
    left() {
      const first = this.entities[0].name;

      const widthOfFirst = this.coordinates.half(first);
      return (
        this.centerOf(first) - widthOfFirst + LIFELINE_GROUP_OUTLINE_MARGIN
      );
    },
    right() {
      const last = this.entities.slice(0).pop().name;

      const widthOfLast = this.coordinates.half(last);
      return this.centerOf(last) + widthOfLast - LIFELINE_GROUP_OUTLINE_MARGIN;
    },
    entities() {
      return Participants(this.context).Array();
    },
  },
  methods: {
    // Helper method to determine if a participant has an icon
    hasParticipantIcon(participantName) {
      // Skip the starter participant
      if (participantName === "_STARTER_") {
        return false;
      }

      // Find the participant in the entities
      const participant = this.entities.find((p) => p.name === participantName);

      // Only participants with a defined type property have icons
      return participant && participant.type !== undefined;
    },
  },
  components: {
    LifeLine,
  },
};
</script>
