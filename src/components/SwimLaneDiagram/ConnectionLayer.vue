<template>
  <div class="absolute top-0 left-0 w-full h-full z-1">
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
import { ref, watch } from "vue";
import { NodeEdges } from "./types";

interface Props {
  connections: ConnectionModel[];
}

const props = defineProps<Props>();

const nodeEdges = ref<NodeEdges>({
  sourceEdges: new Set(),
  targetEdges: new Set(),
});

watch(props.connections, () => {
  nodeEdges.value.sourceEdges.clear();
  nodeEdges.value.targetEdges.clear();
});
</script>
