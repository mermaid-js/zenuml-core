<template>
  <div
    class="zenuml sequence-diagram relative box-border text-left overflow-visible"
    :style="{ padding: `0 ${paddingX}px` }"
    ref="diagram"
  >
    <!-- .zenuml is used to make sure tailwind css takes effect when naked == true;
         .bg-skin-base is repeated because .zenuml reset it to default theme.
     -->
    <life-line-layer :context="rootContext.head()" />
    <message-layer :context="rootContext.block()" :style="{width: `${width}px`}"/>
  </div>
</template>

<script>
import LifeLineLayer from './LifeLineLayer/LifeLineLayer.vue';
import MessageLayer from './MessageLayer/MessageLayer.vue';
import {mapGetters} from 'vuex';
import {Depth} from '@/parser';
import {TotalWidth} from "./ExtraWidthDueToSelfMessage";

export default {
  name: 'seq-diagram',
  components: {
    LifeLineLayer,
    MessageLayer,
  },
  computed: {
    ...mapGetters(['rootContext', 'coordinates', 'distance2']),
    rightParticipant: function () {
      const allParticipants = this.coordinates.participantModels.map((p) => p.name);
      return allParticipants.reverse()[0];
    },
    leftParticipant: function () {
      const allParticipants = this.coordinates.participantModels.map((p) => p.name);
      return allParticipants[0];
    },
    width() {
      const ctx = this.rootContext;
      return TotalWidth(ctx, this.coordinates);
    },
    depth: function () {
      return Depth(this.rootContext);
    },
    paddingX: function () {
      return 10 * (this.depth);
    },
  },
};
</script>

<style>
.sequence-diagram * {
  box-sizing: inherit;
}

.sequence-diagram {
  line-height: normal; /* Reset line-height for the diagram */
}

/* .participant is shared by MessageLayer and LifeLineLayer */
.participant {
  border-width: 2px; /* don't override */
  padding: 8px 4px;
  min-width: 88px;
  max-width: 250px;
  text-align: center;
}
</style>
