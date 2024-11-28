<template>
  <div
    v-if="numbering"
    class="absolute right-[100%] top-0 pr-1 group-hover:hidden text-gray-500 font-thin leading-6"
  >
    {{ number }}
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";

defineProps<{
  number?: number | string;
}>();

const store = useStore();
// @ts-ignore
const numbering = computed(() => store.state.numbering);
</script>
