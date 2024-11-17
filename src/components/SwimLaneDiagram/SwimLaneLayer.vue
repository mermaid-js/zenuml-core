<template>
  <div
    class="grid gap-0 w-full border"
    :style="{
      gridTemplateColumns: `repeat(${swimLanes.length}, minmax(0, 1fr))`,
    }"
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
        <div class="border-r p-4">
          <div
            v-if="Object.keys(item).length > 0"
            class="p-2 border w-fit mx-auto"
          >
            {{ item.name }}
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { NodeModel, SwimLaneModel } from "@/parser/SwimLane/types";
import { watchEffect } from "vue";
import { computed } from "vue";

interface Props {
  swimLanes: SwimLaneModel[];
  maxRank: number;
}

const props = defineProps<Props>();

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

  console.log(items);

  props.swimLanes.forEach((swimLane, index) => {
    swimLane.nodes.forEach((node) => {
      items[node.rank][index] = node;
    });
  });
  return items;
});

watchEffect(() => {
  console.log({
    swimLanes: props.swimLanes,
    maxRank: props.maxRank,
    gridItems: gridItems.value,
  });
});
</script>
