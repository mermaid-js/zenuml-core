<template>
  <div id="swimlane-diagram" ref="diagramRef" class="h-screen">
    <swim-lane-layer :swimLanes="swimLanes" :maxRank="data.maxRank" />
  </div>
</template>

<script setup lang="ts">
import { SwimLaneDiagram } from "@/parser/SwimLane/Diagram";
import { computed } from "vue";
import { useStore } from "vuex";
import SwimLaneLayer from "./SwimLaneLayer.vue";
import { ref } from "vue";

const store = useStore();
const rootContext = computed(() => store.getters.rootContext);

const data = computed(() => {
  const diagram = new SwimLaneDiagram();
  diagram.parse(rootContext.value);
  return {
    swimLanes: diagram.toJson(),
    maxRank: diagram.getMaxRank(),
  };
});

const swimLanes = computed(() => Object.values(data.value.swimLanes));
</script>
