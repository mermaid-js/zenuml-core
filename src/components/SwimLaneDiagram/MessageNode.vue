<template>
  <div
    v-if="Object.keys(node).length > 0"
    class="p-2 border w-fit mx-auto bg-white"
    :id="node.id"
  >
    {{ node.name }}
  </div>
</template>

<script setup lang="ts">
import { NodeModel } from "@/parser/SwimLane/types";
import { useNodeRegistration } from "./useNodeRegistration";

interface Props {
  node: NodeModel;
}

const props = defineProps<Props>();

useNodeRegistration(props.node.id);
</script>
