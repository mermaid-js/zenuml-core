<template>
  <div
    class="zenuml sequence-diagram relative box-border text-left overflow-visible px-2.5"
    :class="theme"
    ref="diagramRef"
  >
    <!-- .zenuml is used to make sure tailwind css takes effect when naked == true;
         .bg-skin-base is repeated because .zenuml reset it to default theme.
     -->
    <div
      :style="{ paddingLeft: `${frameBorderLeft}px` }"
      class="relative z-container"
    >
      <template v-if="mode === RenderMode.Dynamic">
        <!-- Why do we have two `life-line-layer`s? This is introduced when we add support of
              floating participant. Essentially, the Participant labels must be on the top
              of message layer and the lines of lifelines must be under the message layer.-->
        <life-line-layer
          :leftGap="frameBorderLeft"
          :context="rootContext.head()"
          :renderParticipants="false"
          :renderLifeLine="true"
        />
        <message-layer
          :context="rootContext.block()"
          :style="{ width: `${width}px` }"
        />
        <life-line-layer
          :leftGap="frameBorderLeft"
          :context="rootContext.head()"
          :renderParticipants="true"
          :renderLifeLine="false"
        />
      </template>
      <template v-if="mode === RenderMode.Static">
        <life-line-layer
          :leftGap="frameBorderLeft"
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
import { RenderMode } from "@/store/Store";

const store = useStore();
const theme = computed(() => store.state.theme);
const mode = computed(() => store.state.mode);
const rootContext = computed(() => store.getters.rootContext);
const coordinates = computed(() => store.getters.coordinates);

const width = computed(() => {
  const contextWidth = TotalWidth(rootContext.value, coordinates.value);
  //   [MessageLayer width] <- contextWidth
  //  [Frame width        ]
  // || <- frameBorderLeft extra width provided by container
  return contextWidth - frameBorderLeft.value;
});
const frameBorderLeft = computed(() => {
  const allParticipants = coordinates.value.orderedParticipantNames();
  const frameBuilder = new FrameBuilder(allParticipants);
  const frame = frameBuilder.getFrame(rootContext.value);
  return frame ? FrameBorder(frame).left : 0;
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
  min-width: 80px;
  max-width: 250px;
  text-align: center;
  pointer-events: all;
}
</style>
