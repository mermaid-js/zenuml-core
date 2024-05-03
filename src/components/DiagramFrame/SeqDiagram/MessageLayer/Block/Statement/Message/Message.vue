<template>
  <div
    class="message border-skin-message-arrow border-b-2 flex items-end"
    :class="{
      'flex-row-reverse': rtl,
      return: type === 'return',
      'right-to-left': rtl,
      'text-left': isAsync,
      'text-center': !isAsync,
    }"
    :style="{ 'border-bottom-style': borderStyle || undefined }"
    @click="onClick"
    ref="messageRef"
  >
    <div
      class="name group flex-grow relative text-sm hover:whitespace-normal hover:text-skin-message-hover hover:bg-skin-message-hover"
    >
      <div class="inline-block static min-h-[1em]">
        <div :style="textStyle" :class="classNames">
          <MessageLabel
            v-if="editable"
            :labelText="content"
            :labelPosition="labelPosition"
            :isAsync="isAsync"
          />
          <template v-else>
            {{ content }}
          </template>
        </div>
        <div
          class="absolute right-[100%] top-0 pr-1 group-hover:hidden text-gray-500"
          v-if="numbering"
        >
          {{ number }}
        </div>
      </div>
    </div>
    <point
      class="flex-shrink-0 transform translate-y-1/2 -my-px"
      :fill="fill"
      :rtl="rtl"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs, ref, ComputedRef } from "vue";
import { useStore } from "vuex";
import Point from "./Point/Point.vue";
import MessageLabel from "../../../MessageLabel.vue";
import sequenceParser from "@/generated-parser/sequenceParser";

const props = defineProps<{
  context?: any;
  content: string;
  rtl?: string | boolean;
  type?: string;
  textStyle?: Record<string, string | number>;
  classNames?: any;
  number?: string;
}>();
const { context, content, rtl, type, textStyle, classNames, number } =
  toRefs(props);
const store = useStore();
const messageRef = ref();
const numbering = computed(() => store.state.numbering);
const isAsync = computed(() => type?.value === "async");
const editable = computed(() => {
  switch (type?.value) {
    case "sync":
    case "async":
    case "return":
      return true;
    case "creation":
    default:
      return false;
  }
});
const labelPosition: ComputedRef<[number, number]> = computed(() => {
  let start = -1,
    stop = -1;
  switch (type?.value) {
    case "sync":
      {
        const signature = context?.value?.messageBody().func()?.signature()[0];
        [start, stop] = [signature?.start.start, signature?.stop.stop];
      }
      break;
    case "async":
      {
        const content = context?.value?.content();
        [start, stop] = [content?.start.start, content?.stop.stop];
      }
      break;
    case "return":
      {
        if (context?.value instanceof sequenceParser.MessageContext) {
          const signature = context.value
            .messageBody()
            .func()
            ?.signature()?.[0];
          [start, stop] = [signature?.start.start, signature?.stop.stop];
        } else if (context?.value instanceof sequenceParser.AtomExprContext) {
          const ret = context.value.atom();
          [start, stop] = [ret?.start.start, ret?.stop.stop];
        } else if (context?.value instanceof sequenceParser.ContentContext) {
          [start, stop] = [context.value.start.start, context.value.stop.stop];
        }
      }
      break;
  }
  return [start, stop];
});
const borderStyle = computed(() => {
  switch (type?.value) {
    case "sync":
    case "async":
      return "solid";
    case "creation":
    case "return":
      return "dashed";
  }
  return "";
});
const fill = computed(() => {
  switch (type?.value) {
    case "sync":
    case "async":
      return true;
    case "creation":
    case "return":
      return false;
  }
  return false;
});
const onClick = () => {
  store.getters.onMessageClick(context, messageRef.value);
};
</script>
