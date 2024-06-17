<template>
  <!-- style border-width means not to be overridden. -->
  <div class="message self flex items-start flex-col" style="border-width: 0">
    <label
      class="name group px-px hover:text-skin-message-hover hover:bg-skin-message-hover min-h-[1em]"
    >
      <div
        class="absolute right-[100%] top-0 pr-1 group-hover:hidden text-gray-500"
        v-if="numbering"
      >
        {{ number }}
      </div>
      <MessageLabel
        :style="textStyle"
        :class="classNames"
        :labelText="labelText"
        :labelPosition="labelPosition"
        :isAsync="true"
        :isSelf="true"
      />
    </label>
    <svg class="arrow text-skin-message-arrow" width="34" height="34">
      <polyline
        class="stroke-current stroke-2 fill-none"
        points="0,2 28,2 28,25 1,25"
      ></polyline>
      <polyline
        class="head stroke-current stroke-2 fill-none"
        points="11,19 1,25 11,31"
      ></polyline>
      <!--TODO: What is the below line used for?-->
      <!--<polyline class="closed" points="28,32 28,18"></polyline>-->
    </svg>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import { ComputedRef, computed, toRefs } from "vue";
import MessageLabel from "@/components/DiagramFrame/SeqDiagram/MessageLayer/MessageLabel.vue";

const props = defineProps<{
  context?: any;
  number?: string;
  textStyle?: Record<string, string | number>;
  classNames?: any;
}>();
const { context } = toRefs(props);
const store = useStore();
const content = computed(() => context?.value.content());
const numbering = computed(() => store.state.numbering);
const labelPosition: ComputedRef<[number, number]> = computed(() => {
  if (!content.value) return [-1, -1];
  return [content.value.start.start, content.value.stop.stop];
});
const labelText = computed(() => {
  return content.value?.getFormattedText();
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.from-no-occurrence > .message.self {
  transform: translateX(-7px);
}
</style>
