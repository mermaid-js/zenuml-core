<template>
  <div class="absolute top-0 left-0 w-full h-full z-10">
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
import { watchEffect } from "vue";

interface Props {
  connections: ConnectionModel[];
}

const props = defineProps<Props>();

watchEffect(() => {
  console.log({ connections: props.connections });
});
</script>
