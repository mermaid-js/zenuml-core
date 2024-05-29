<template>
  <!-- pb-2 to show the shadow -->
  <div
    class="container absolute flex flex-col h-full"
    v-if="entities.length > 0"
    :style="{ left: `${left}px`, width: `${right - left}px` }"
  >
    <div
      class="flex flex-col flex-grow"
      :class="{
        shadow: !renderParticipants,
        'shadow-slate-500/50': !renderParticipants,
      }"
    >
      <!-- TODO: add group name back later.  -->
      <!--      <div class="h-14 absolute" :class="{'-mt-12': !!name}">-->
      <!--        <label class="block text-center font-semibold">{{name}}</label>-->
      <!--      </div>-->
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
  </div>
</template>

<script>
import { Participants } from "@/parser";
import LifeLine from "./LifeLine.vue";
import { mapGetters } from "vuex";
import WidthProviderOnBrowser from "../../../../positioning/WidthProviderFunc";
import { TextType } from "@/positioning/Coordinate";
const PARTICIPANT_MARGIN = 8;
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
      const widthOfFirst = Math.max(
        WidthProviderOnBrowser(first, TextType.ParticipantName),
        100,
      );
      return this.centerOf(first) - widthOfFirst / 2 - PARTICIPANT_MARGIN;
    },
    right() {
      const last = this.entities.slice(0).pop().name;
      const widthOfLast = Math.max(
        WidthProviderOnBrowser(last, TextType.ParticipantName),
        100,
      );
      return this.centerOf(last) + widthOfLast / 2 + PARTICIPANT_MARGIN;
    },
    entities() {
      return Participants(this.context).Array();
    },
  },
  components: {
    LifeLine,
  },
};
</script>

<style scoped></style>
