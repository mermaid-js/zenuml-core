<template>
  <div id="swimlane-diagram" ref="diagramRef" class="h-screen">
    <swim-lane-layer :diagramModel="diagramModel" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import SwimLaneLayer from "./SwimLaneLayer.vue";
import {
  EdgeModel,
  NodeModel,
  SwimLaneDiagramModel,
} from "@/parser/SwimLane/types";
import { SwimLaneDiagram } from "@/parser/SwimLane/Diagram";
import { watchEffect } from "vue";

const store = useStore();
const rootContext = computed(() => store.getters.rootContext);

let cachedDiagramModel = ref<SwimLaneDiagramModel | null>(null);

const diagramModel = computed(() => {
  const diagram = new SwimLaneDiagram(rootContext.value);

  let diagramData: {
    nodes: NodeModel[];
    edges: EdgeModel[];
  } = {
    nodes: [],
    edges: [],
  };

  try {
    diagramData = diagram.toJson(); // Attempt to convert to JSON
  } catch (error) {
    console.error("Error converting diagram to JSON:", error);
    // Use cached result if available
    if (cachedDiagramModel.value) {
      console.warn("Using cached diagram data due to error.");
      return {
        name: "test",
        swimLanes: Array.from(diagram.getSwimLanes().values()).map(
          (swimLane) => swimLane.id,
        ),
        nodes: cachedDiagramModel.value.nodes,
        edges: cachedDiagramModel.value.edges,
        maxRank: diagram.getMaxRank(),
      } as SwimLaneDiagramModel;
    }
    // Handle case where there is no cached data
    return {
      name: "test",
      swimLanes: [],
      nodes: [],
      edges: [],
      maxRank: 0,
    } as SwimLaneDiagramModel;
  }

  const swimLanes = Array.from(diagram.getSwimLanes().values()).map(
    (swimLane) => swimLane.id,
  );

  return {
    name: "test",
    swimLanes,
    nodes: diagramData.nodes,
    edges: diagramData.edges,
    maxRank: diagram.getMaxRank(),
  } as SwimLaneDiagramModel;
});

watchEffect(() => {
  if (
    diagramModel.value.edges.length > 0 &&
    diagramModel.value.nodes.length > 0
  ) {
    cachedDiagramModel.value = diagramModel.value;
  }
});
</script>
;
