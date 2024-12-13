<template>
  <div ref="container" class="absolute top-0 left-0 w-full h-full z-1">
    <connection
      v-for="connection in connections"
      :key="connection.id"
      :connection="connection"
      :nodeEdges="nodeEdges"
    />
  </div>
</template>

<script setup lang="ts">
import { ConnectionModel } from "@/parser/SwimLane/types";
import Connection from "./Connection.vue";
import { watch } from "vue";
import { NodeEdges } from "./types";

interface Props {
  connections: ConnectionModel[];
}

const props = defineProps<Props>();

const nodeEdges: NodeEdges = {
  sourceEdges: new Set(),
  targetEdges: new Set(),
};

watch(
  () => props.connections,
  () => {
    nodeEdges.sourceEdges.clear();
    nodeEdges.targetEdges.clear();
  },
);
</script>
