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
import WidthProviderOnBrowser from "../../../../positioning/WidthProviderFunc";
import { TextType } from "@/positioning/Coordinate";
export default {
  name: "lifeline-group",
  props: ["context", "renderParticipants", "renderLifeLine"],
  computed: {
    ...mapGetters(["centerOf"]),
    name() {
      return this.context?.name()?.getFormattedText();
    },
    left() {
      const first = this.entities[0].name;
      // Check if the participant has an icon
      const hasIcon = first && this.hasParticipantIcon(first);
      const iconWidth = hasIcon ? 24 : 0; // Width of icon (without margin)

      const widthOfFirst = Math.max(
        WidthProviderOnBrowser(first, TextType.ParticipantName) + iconWidth,
        100,
      );
      return this.centerOf(first) - widthOfFirst / 2 + 5;
    },
    right() {
      const last = this.entities.slice(0).pop().name;
      // Check if the participant has an icon
      const hasIcon = last && this.hasParticipantIcon(last);
      const iconWidth = hasIcon ? 24 : 0; // Width of icon (without margin)

      const widthOfLast = Math.max(
        WidthProviderOnBrowser(last, TextType.ParticipantName) + iconWidth,
        100,
      );
      return this.centerOf(last) + widthOfLast / 2 - 5;
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
