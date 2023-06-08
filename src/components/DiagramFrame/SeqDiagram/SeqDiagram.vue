<template>
  <div
    class="zenuml sequence-diagram relative box-border text-left overflow-visible"
    :style="{ paddingLeft: `${paddingLeft}px` }"
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
import { mapGetters } from 'vuex';
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder from "@/positioning/FrameBorder";
import {TotalWidth} from "@/components/DiagramFrame/SeqDiagram/WidthOfContext";

export default {
  name: 'seq-diagram',
  components: {
    LifeLineLayer,
    MessageLayer,
  },
  computed: {
    ...mapGetters(['rootContext', 'coordinates']),
    width() {
      return TotalWidth(this.rootContext, this.coordinates);
    },
    paddingLeft: function () {
      const allParticipants = this.coordinates.orderedParticipantNames();
      let frameBuilder = new FrameBuilder(allParticipants);
      const frame = frameBuilder.getFrame(this.rootContext);
      if (!frame) {
        return 0;
      }
      const border = FrameBorder(frame);

      return border.left + 20;
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
