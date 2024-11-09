<template>
  <!-- #207 adding pl-5 to push the _STARTER_ participant to the right, so we can render the root level self messages.  -->
  <div
    class="zenuml sequence-diagram relative box-border text-left overflow-visible px-5"
    :class="theme"
    ref="diagramRef"
  >
    <!-- .zenuml is used to make sure tailwind css takes effect when naked == true;
     -->
    <div :style="{ paddingLeft: `${paddingLeft}px` }" class="relative">
      <template v-if="mode === RenderMode.Dynamic">
        <life-line-layer
          :leftGap="paddingLeft"
          :context="rootContext.head()"
          :renderParticipants="false"
          :renderLifeLine="true"
        />
        <message-layer
          :context="rootContext.block()"
          :style="{ width: `${width}px` }"
        />
        <life-line-layer
          :leftGap="paddingLeft"
          :context="rootContext.head()"
          :renderParticipants="true"
          :renderLifeLine="false"
        />
      </template>
      <template v-if="mode === RenderMode.Static">
        <life-line-layer
          :leftGap="paddingLeft"
          :context="rootContext.head()"
          :renderParticipants="true"
          :renderLifeLine="true"
        />
        <message-layer
          :context="rootContext.block()"
          :style="{ width: `${width}px` }"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useStore } from "vuex";
import LifeLineLayer from "./LifeLineLayer/LifeLineLayer.vue";
import MessageLayer from "./MessageLayer/MessageLayer.vue";
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder from "@/positioning/FrameBorder";
import { TotalWidth } from "@/components/DiagramFrame/SeqDiagram/WidthOfContext";
import { MARGIN } from "@/positioning/Constants";
import { RenderMode } from "@/store/Store";

const store = useStore();
const theme = computed(() => store.state.theme);
const mode = computed(() => store.state.mode);
const rootContext = computed(() => store.getters.rootContext);
const coordinates = computed(() => store.getters.coordinates);
const width = computed(() => TotalWidth(rootContext.value, coordinates.value));
const paddingLeft = computed(() => {
  const allParticipants = coordinates.value.orderedParticipantNames();
  let frameBuilder = new FrameBuilder(allParticipants);
  const frame = frameBuilder.getFrame(rootContext.value);
  if (!frame) {
    return 0;
  }
  const border = FrameBorder(frame);
  return border.left + MARGIN + 20;
});

const diagramRef = ref(null);
store.commit("diagramElement", diagramRef);
</script>

<style>
.zenuml .sequence-diagram * {
  box-sizing: inherit;
}

.zenuml .sequence-diagram {
  /* Reset line-height for the diagram */
  line-height: normal;
}

/* .participant is shared by MessageLayer and LifeLineLayer */
.zenuml .participant {
  /* don't override */
  border-width: 2px;
  padding: 0 4px;
  min-width: 88px;
  max-width: 250px;
  text-align: center;
  pointer-events: all;
}
</style>
