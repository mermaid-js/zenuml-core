<template>
  <div class="min-w-[48px] border">
    <div class="text-sm font-bold text-center border-b">
      {{ swimLane.name }}
    </div>
    <div class="p-4">
      <div
        v-for="node in nodes"
        :key="node.id"
        class="border text-center w-fit mx-auto mt-2 mb-8 px-2 py-1"
      >
        {{ node.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SwimLaneModel } from "@/parser/SwimLane/types";
import { computed } from "vue";

interface Props {
  swimLane: SwimLaneModel;
}

const props = defineProps<Props>();
const nodes = computed(() => props.swimLane.nodes);
</script>
