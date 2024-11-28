<template>
  <!-- style border-width means not to be overridden. -->
  <div
    class="self-invocation message self flex items-start flex-col"
    style="border-width: 0"
    @click="onClick"
    ref="messageRef"
  >
    <label
      class="name text-left group px-px hover:text-skin-message-hover hover:bg-skin-message-hover relative min-h-[1em] w-full"
    >
      <Numbering :number="number" />
      <div class="label">
        <span v-if="assignee">
          <span class="assignee px-1">{{ assignee }}</span>
          <span>=</span>
        </span>
        <MessageLabel
          :style="textStyle"
          :class="classNames"
          :labelText="signature"
          :labelPosition="labelPosition"
          :isSelf="true"
        />
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
import Numbering from "../../../../Numbering.vue";

const props = defineProps<{
  context?: any;
  number?: string;
  textStyle?: Record<string, string | number>;
  classNames?: any;
}>();
const { context } = toRefs(props);
const store = useStore();

const messageRef = ref();
const labelPosition: ComputedRef<[number, number]> = computed(() => {
  // do not use .signature(). Multiple signatures are allowed, e.g. method().method1().method2()
  const func = context?.value.messageBody().func();
  if (!func) return [-1, -1];
  return [func.start.start, func.stop.stop];
});

const assignee = computed(() => {
  let assignment = context?.value.Assignment();
  if (!assignment) return "";
  return assignment.getText();
});
const signature = computed(() => {
  return context?.value.SignatureText();
});
const onClick = () => {
  store.getters.onMessageClick(context, messageRef.value);
};
</script>
