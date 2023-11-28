<template>
  <div class="block">
    <div
      class="statement-container mt-1"
      v-for="(stat, index) in statements"
      :key="index"
    >
      <Statement
        :inheritFromOccurrence="inheritFromOccurrence"
        :context="stat"
        :collapsed="collapsed"
        :selfCallIndent="selfCallIndent"
        :number="getNumber(index)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import Statement from "./Statement/Statement.vue";
import { increaseNumber } from "@/utils/Numbering";

const props = defineProps<{
  context?: any;
  selfCallIndent?: number;
  number?: string;
  incremental?: boolean;
  collapsed?: boolean;
  inheritFromOccurrence?: boolean;
}>();
const statements = computed(() => props.context?.stat() || []);
const getNumber = (index: number) => {
  if (props.number) {
    return props.incremental
      ? increaseNumber(props.number, index)
      : `${props.number}.${index + 1}`;
  }
  return String(index + 1);
};
</script>
