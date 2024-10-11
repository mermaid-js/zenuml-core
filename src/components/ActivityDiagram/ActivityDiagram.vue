<template>
  <div id="mountNode" ref="diagramRef">
    <!-- .zenuml is used to make sure tailwind css takes effect when naked == true;
         .bg-skin-base is repeated because .zenuml reset it to default theme.
     -->
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { useStore } from "vuex";
import { Graph, GraphData } from "@antv/g6";
import { GraphListener } from "@/parser/activity/graphListener";

const store = useStore();
const rootContext = computed(() => store.getters.rootContext);
const graphListener = new GraphListener();

const data = computed(() => graphListener.parse(rootContext.value));

const renderer = () => {
  let graph: Graph | null;
  return async (data: GraphData) => {
    try {
      if (graph && !graph.destroyed) {
        graph.destroy();
      }
      console.log(data);
      graph = new Graph({
        container: "mountNode",
        animation: false,
        autoFit: "view",
        layout: {
          type: "antv-dagre",
          nodesep: 50,
          ranksep: 50,
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
  await render(data.value);
});

const diagramRef = ref(null);
store.commit("diagramElement", diagramRef);
</script>

<style></style>
