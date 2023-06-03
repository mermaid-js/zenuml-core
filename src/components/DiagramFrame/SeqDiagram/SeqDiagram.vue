<template>
  <div
    class="zenuml sequence-diagram relative box-border text-left overflow-visible"
    :style="{ width: `${width}px`, paddingLeft: `${paddingLeft}px` }"
    ref="diagram"
  >
    <!-- .zenuml is used to make sure tailwind css takes effect when naked == true;
         .bg-skin-base is repeated because .zenuml reset it to default theme.
     -->
    <life-line-layer :context="rootContext.head()" />
    <message-layer :context="rootContext.block()" />
  </div>
</template>

<script>
import LifeLineLayer from './LifeLineLayer/LifeLineLayer.vue';
import MessageLayer from './MessageLayer/MessageLayer.vue';
import {mapGetters} from 'vuex';
import {Depth} from '../../../parser';
import {
  FRAGMENT_LEFT_BASE_OFFSET,
  FRAGMENT_RIGHT_BASE_OFFSET,
} from './MessageLayer/Block/Statement/Fragment/FragmentMixin';
import {extraWidthDueToSelfMessage} from "./ExtraWidthDueToSelfMessage";

export default {
  name: 'seq-diagram',
  components: {
    LifeLineLayer,
    MessageLayer,
  },
  computed: {
    ...mapGetters(['rootContext', 'coordinates']),
    rightParticipant: function () {
      const allParticipants = this.coordinates.participantModels.map((p) => p.name);
      return allParticipants.reverse()[0];
    },

    width() {
      let width = extraWidthDueToSelfMessage(this.rootContext, this.rightParticipant);
      return this.coordinates.getWidth() + 10 * (this.depth + 1) + FRAGMENT_RIGHT_BASE_OFFSET + width;
    },
    depth: function () {
      return Depth(this.rootContext);
    },
    paddingLeft: function () {
      return 10 * (this.depth + 1) + FRAGMENT_LEFT_BASE_OFFSET;
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
