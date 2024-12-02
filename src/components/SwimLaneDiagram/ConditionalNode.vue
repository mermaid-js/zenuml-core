<template>
  <div
    v-if="Object.keys(node).length > 0"
    :id="node.id"
    class="hexagon-container"
  >
    <svg
      :width="svgWidth"
      :height="height"
      class="hexagon"
      :viewBox="`0 0 ${svgWidth} ${height}`"
    >
      <!-- Background -->
      <path :d="hexagonPath" fill="white" stroke="#e5e7eb" stroke-width="1" />

      <!-- Hidden text element for measurement -->
      <text ref="textRef" x="-1000" y="-1000" class="node-text">
        {{ node.name }}
      </text>

      <!-- Visible text -->
      <text
        :x="svgWidth / 2"
        :y="height / 2"
        text-anchor="middle"
        dominant-baseline="middle"
        class="node-text"
      >
        {{ node.name }}
      </text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { NodeModel } from "@/parser/SwimLane/types";
import { computed, ref, onMounted } from "vue";

interface Props {
  node: NodeModel;
}

defineProps<Props>();

const textRef = ref<SVGTextElement | null>(null);
const textWidth = ref(0);

// Fixed height and minimum width
const height = 36;
const minWidth = 100;
const horizontalPadding = 40; // Padding on each side

// Calculate SVG width based on text width
const svgWidth = computed(() => {
  return Math.max(minWidth, textWidth.value + horizontalPadding * 2);
});

// Calculate hexagon path
const hexagonPath = computed(() => {
  const w = svgWidth.value;
  const h = height;
  const indent = h / 3;

  return `
    M ${indent} 0
    L ${w - indent} 0
    L ${w} ${h / 2}
    L ${w - indent} ${h}
    L ${indent} ${h}
    L 0 ${h / 2}
    Z
  `;
});

// Measure text width on mount
onMounted(() => {
  if (textRef.value) {
    textWidth.value = textRef.value.getBBox().width;
  }
});
</script>

<style scoped>
.hexagon-container {
  display: inline-block;
  margin: 0.5rem;
}

.node-text {
  font-size: 14px;
  fill: black;
  user-select: none;
}
</style>
