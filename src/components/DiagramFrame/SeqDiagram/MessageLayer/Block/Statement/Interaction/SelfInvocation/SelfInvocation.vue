<template>
  <!-- style border-width means not to be overridden. -->
  <div
    class="message self text-sm flex items-start flex-col"
    style="border-width: 0"
    @click="onClick"
    ref="messageRef"
  >
    <label
      class="name group px-px hover:text-skin-message-hover hover:bg-skin-message-hover relative min-h-[1em]"
    >
      <div
        class="absolute right-[100%] top-0 pr-1 group-hover:hidden text-gray-500"
        v-if="numbering"
      >
        {{ number }}
      </div>
      <div :style="textStyle" :class="classNames">
        <MessageLabel :labelText="labelText" :labelPosition="labelPosition" />
      </div>
    </label>
    <svg class="arrow text-skin-message-arrow" width="30" height="24">
      <polyline
        class="line stroke-current fill-none stroke-2"
        points="0,2 28,2 28,15 14,15"
      ></polyline>
      <polyline
        class="head stroke-current fill-current stroke-2"
        points="18,9 8,15 18,21"
      ></polyline>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import { ComputedRef, computed, ref, toRefs } from "vue";
import MessageLabel from "../../../../MessageLabel.vue";

const props = defineProps<{
  context?: any;
  number?: string;
  textStyle?: Record<string, string | number>;
  classNames?: any;
}>();
const { context } = toRefs(props);
const store = useStore();

const numbering = computed(() => store.state.numbering);
const messageRef = ref();
const labelPosition: ComputedRef<[number, number]> = computed(() => {
  const signature = props.context.messageBody();
  return [signature.start.start, signature.stop.stop];
});
const labelText = computed(() => {
  return props.context.messageBody().getFormattedText();
});

const onClick = () => {
  store.getters.onMessageClick(context, messageRef.value);
};
</script>
