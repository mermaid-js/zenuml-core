<template>
  <div
    class="relative grid gap-0 w-full border"
    :style="{
      gridTemplateColumns: `repeat(${swimLanes.length}, minmax(0, 1fr))`,
    }"
    ref="containerRef"
  >
    <!-- first row -->
    <div
      v-for="swimLane in swimLanes"
      :key="swimLane.name"
      class="text-center min-w-[48px] border-b"
    >
      {{ swimLane.name }}
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
  SwimLaneModel,
  NodePositionModel,
} from "@/parser/SwimLane/types";
import { ref, watchEffect, computed, onUpdated } from "vue";
import ConnectionLayer from "./ConnectionLayer.vue";

interface Props {
  swimLanes: SwimLaneModel[];
  maxRank: number;
}

const props = defineProps<Props>();

const containerRef = ref<HTMLDivElement>();

watchEffect(() => {
  console.log(props.swimLanes);
});

const gridItems = computed(() => {
  if (props.swimLanes.length === 0) {
    return [];
  }

  // Add 1 to maxRank since ranks are 0-based
  const rows = props.maxRank + 1;
  const cols = props.swimLanes.length;

  // Create 2D array using Array.from
  const items = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({}) as NodeModel),
  );

  props.swimLanes.forEach((swimLane, index) => {
    swimLane.nodes.forEach((node) => {
      items[node.rank][index] = node;
    });
  });
  return items;
});

const nodes = computed(() => {
  return props.swimLanes.flatMap((swimLane) => swimLane.nodes);
});

const nodePositions = ref<NodePositionModel[]>([]);

const edges = computed(() => {
  return props.swimLanes.flatMap((swimLane) => swimLane.edges);
});

const connections = computed(() => {
  return edges.value
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
  const nodePositions = nodes.value
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

onUpdated(() => {
  nodePositions.value = getNodePositions();
});

watchEffect(() => {
  console.log({
    swimLanes: props.swimLanes,
    maxRank: props.maxRank,
    gridItems: gridItems.value,
    nodePositions: nodePositions.value,
    connections: connections.value,
  });
});
</script>
