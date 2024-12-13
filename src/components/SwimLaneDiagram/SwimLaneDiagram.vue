<template>
  <div id="swimlane-diagram" ref="diagramRef" class="h-screen">
    <swim-lane-layer :diagramModel="diagramModel" />
  </div>
</template>

<script setup lang="ts">
import { SwimLaneDiagram } from "@/parser/SwimLane/Diagram";
import { computed } from "vue";
import { useStore } from "vuex";
import SwimLaneLayer from "./SwimLaneLayer.vue";
import { SwimLaneDiagramModel } from "@/parser/SwimLane/types";

const store = useStore();
const rootContext = computed(() => store.getters.rootContext);

const diagramModel = computed(() => {
  const diagram = new SwimLaneDiagram(rootContext.value);
  const diagramData = diagram.toJson();
  const swimLanes = Array.from(diagram.getSwimLanes().values()).map(
    (swimLane) => {
      return swimLane.id;
    },
  );

  console.log(diagramData);

  return {
    name: "test",
    swimLanes,
    nodes: diagramData.nodes,
    edges: diagramData.edges,
    maxRank: diagram.getMaxRank(),
  } as SwimLaneDiagramModel;
});
</script>
