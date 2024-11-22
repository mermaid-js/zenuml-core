<template>
  <div class="absolute top-0 left-0 w-full h-full z-1">
    <connection
      v-for="connection in connections"
      :key="connection.id"
      :connection="connection"
    />
  </div>
</template>

<script setup lang="ts">
import { ConnectionModel } from "@/parser/SwimLane/types";
import Connection from "./Connection.vue";

interface Props {
  connections: ConnectionModel[];
}

defineProps<Props>();
</script>
