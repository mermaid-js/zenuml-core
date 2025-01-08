<template>
  <span
    :class="['flex items-center justify-center', iconClass]"
    @click="$emit('icon-click')"
  >
    <component :is="icon" />
  </span>
</template>

<script setup>
import { defineAsyncComponent } from "vue";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  iconClass: {
    type: String,
    required: false,
  },
});

const icon = defineAsyncComponent(() => import(`./icons/${props.name}.svg`));
</script>
