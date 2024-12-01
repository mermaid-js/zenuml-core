<template>
  <div
    class="relative grid gap-0 w-full border"
    :style="{
      gridTemplateColumns: `repeat(${diagramModel.swimLanes.length}, minmax(0, 1fr))`,
    }"
    ref="containerRef"
  >
    <!-- first row -->
    <div
      v-for="swimLane in diagramModel.swimLanes"
      :key="swimLane"
      class="text-center min-w-[48px] border-b"
    >
      {{ swimLane }}
    </div>
    <template v-for="(row, rowIndex) in gridItems" :key="rowIndex">
      <template v-for="(item, colIndex) in row" :key="colIndex">
        <div class="border-r p-4 z-10">
          <div
            v-if="Object.keys(item).length > 0"
            class="p-2 border w-fit mx-auto"
            :id="item.id"
          >
            {{ item.name }}
          </div>
        </div>
      </template>
    </template>

    <connection-layer :connections="connections" />
  </div>
</template>

<script setup lang="ts">
import {
  ConnectionModel,
  NodeModel,
  SwimLaneDiagramModel,
  NodePositionModel,
} from "@/parser/SwimLane/types";
import { ref, watchEffect, computed, onMounted, onBeforeUnmount } from "vue";
import ConnectionLayer from "./ConnectionLayer.vue";
import { debounce } from "lodash";
import { watch } from "vue";

interface Props {
  diagramModel: SwimLaneDiagramModel;
}

const props = defineProps<Props>();

const containerRef = ref<HTMLDivElement>();
const resizeObserver = ref<ResizeObserver>();

watchEffect(() => {
  // console.log(props.diagramModel);
});

const gridItems = computed(() => {
  if (props.diagramModel.swimLanes.length === 0) {
    return [];
  }

  // Add 1 to maxRank since ranks are 0-based
  const rows = props.diagramModel.maxRank + 1;
  const cols = props.diagramModel.swimLanes.length;

  // Create 2D array using Array.from
  const items = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({}) as NodeModel),
  );

  props.diagramModel.nodes.forEach((node) => {
    const swimLaneIndex = props.diagramModel.swimLanes.indexOf(node.swimLane);
    items[node.rank][swimLaneIndex] = node;
  });

  return items;
});

const nodePositions = ref<NodePositionModel[]>([]);

const connections = computed(() => {
  console.log({
    nodePositions: nodePositions.value,
    edges: props.diagramModel.edges,
  });
  return props.diagramModel.edges
    .map((edge) => ({
      id: edge.id,
      source: nodePositions.value.find((node) => node.id === edge.source),
      target: nodePositions.value.find((node) => node.id === edge.target),
    }))
    .filter(
      (connection) => connection.source && connection.target,
    ) as ConnectionModel[];
});

const getNodePositions = () => {
  if (!containerRef.value) {
    return [];
  }
  const nodePositions = props.diagramModel.nodes
    .map((node) => {
      const element = document.getElementById(node.id);
      if (!element) {
        return null;
      }
      const rect = element.getBoundingClientRect();
      const domRect = new DOMRect(
        rect.left - containerRef.value!.offsetLeft,
        rect.top - containerRef.value!.offsetTop,
        rect.width,
        rect.height,
      );
      return {
        id: node.id,
        rect: domRect,
        rank: node.rank,
        swimLane: node.swimLane,
      };
    })
    .filter((position) => position !== null);

  return nodePositions;
};

// Debounced version of position update
const updateNodePositions = debounce(() => {
  nodePositions.value = getNodePositions();
}, 100);

// Set up resize observer
onMounted(() => {
  if (containerRef.value) {
    resizeObserver.value = new ResizeObserver(updateNodePositions);
    resizeObserver.value.observe(containerRef.value);
  }
});

// Clean up
onBeforeUnmount(() => {
  resizeObserver.value?.disconnect();
});

// // Keep existing onUpdated hook
// onUpdated(() => {
//   updateNodePositions();
// });

watch(props.diagramModel, () => {
  updateNodePositions();
});

// watchEffect(() => {
//   console.log({
//     swimLanes: props.diagramModel.swimLanes,
//     maxRank: props.diagramModel.maxRank,
//     gridItems: gridItems.value,
//     nodePositions: nodePositions.value,
//     connections: connections.value,
//   });
// });
</script>
