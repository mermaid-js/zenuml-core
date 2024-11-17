<template>
  <div id="mountNode" ref="diagramRef" class="h-screen">
    <!-- .zenuml is used to make sure tailwind css takes effect when naked == true;
         .bg-skin-base is repeated because .zenuml reset it to default theme.
     -->
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { useStore } from "vuex";
import { Graph, GraphData } from "@antv/g6";
import { ActivityDiagramBuilder } from "@/parser/activity/graphBuilder";

const store = useStore();
const rootContext = computed(() => store.getters.rootContext);

const data = computed(() => {
  const builder = new ActivityDiagramBuilder(rootContext.value);
  builder.build();
  console.log({
    model: builder.getModel(),
  });
  return builder.getGraphData();
});

const renderer = () => {
  let graph: Graph | null;
  return async (data: GraphData) => {
    try {
      if (graph && !graph.destroyed) {
        graph.destroy();
      }
      graph = new Graph({
        container: "mountNode",
        animation: false,
        autoFit: "view",
        layout: {
          type: "antv-dagre",
          nodesep: 10,
          ranksep: 10,
          ranker: "longest-path",
        },
        edge: {
          type: "polyline",
          /* you can configure the global edge style as following lines */
          style: {
            labelAutoRotate: false,
            labelPlacement: "center",
            labelBackgroundOpacity: 1,
          },
        },
        behaviors: ["drag-canvas", "zoom-canvas"],
      });
      graph.setData(data);
      await graph.render();
    } catch (error) {
      console.info(error);
    }
  };
};

const render = renderer();

watchEffect(async () => {
  console.log({
    graph: data.value,
  });
  await render(data.value);
});

const diagramRef = ref(null);
store.commit("diagramElement", diagramRef);
</script>

<style></style>
