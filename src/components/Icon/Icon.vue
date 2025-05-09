<template>
  <span
    :class="['flex items-center justify-center', iconClass]"
    @click="$emit('icon-click')"
  >
    <component :is="icon" />
  </span>
</template>

<script setup>
import { computed } from "vue";

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

/**
 * Ensures all icons are immediately available when rendering, fixing issues with fragment icons
 * not displaying in mermaid integration
 * The `import.meta.glob` with `eager: true` loads all SVG files synchronously at build time,
 * ensuring they're bundled and available immediately when needed.
 */
const iconModules = import.meta.glob("./icons/*.svg", { eager: true });

const icon = computed(() => {
  const iconPath = `./icons/${props.name}.svg`;
  return iconModules[iconPath]?.default;
});
</script>
