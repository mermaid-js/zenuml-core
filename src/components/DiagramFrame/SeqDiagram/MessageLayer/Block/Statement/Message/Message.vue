<template>
  <div
    class="message border-skin-message-arrow border-b-2 flex items-end"
    :class="{
      'flex-row-reverse': rtl,
      return: type === 'return',
      'right-to-left': rtl,
    }"
    :style="{ 'border-bottom-style': borderStyle || undefined }"
    @click="onClick"
    ref="messageRef"
  >
    <div
      class="name group text-center flex-grow relative hover:text-skin-message-hover hover:bg-skin-message-hover"
    >
      <div class="inline-block static min-h-[1em]">
        <div :style="textStyle" :class="classNames">
          <template v-if="editable">
            <span v-show="type === 'creation'">«</span>
            <MessageLabel
              :labelText="labelText ?? ''"
              :labelPosition="labelPosition"
              :isAsync="isAsync"
            />
            <span v-show="type === 'creation'">»</span>
          </template>
          <template v-else>
            {{ content }}
          </template>
        </div>
        <Numbering :number="number" />
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
import { RenderMode } from "@/store/Store";
import Point from "./Point/Point.vue";
import MessageLabel from "../../../MessageLabel.vue";
import Numbering from "../../../Numbering.vue";
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
const isAsync = computed(() => type?.value === "async");
const mode = computed(() => store.state.mode);
const editable = computed(() => {
  if (mode.value === RenderMode.Static) return false;
  switch (type?.value) {
    case "sync":
    case "async":
    case "return":
      return true;
    case "creation": {
      // Avoid editing "«create»" label for invalid creations
      const isValid = context?.value?.isParamValid() > 0;
      return isValid;
    }
    default:
      return false;
  }
});
const stylable = computed(() => {
  if (mode.value === RenderMode.Static) return false;
  switch (type?.value) {
    case "sync":
    case "async":
    case "return":
    case "creation":
      return true;
    default:
      return false;
  }
});
const creationRegex = /«([^»]+)»/;
const labelText = computed(() => {
  switch (type?.value) {
    case "creation":
      // Extract the creation name from the content
      return content?.value.match(creationRegex)?.[1] || "";
    case "sync":
    case "async":
    case "return":
    default:
      return content?.value || "";
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
    case "creation":
      {
        const signature = context?.value?.creationBody()?.parameters();
        [start, stop] = [signature?.start.start, signature?.stop.stop];
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
        } else if (context?.value instanceof sequenceParser.AssignmentContext) {
          const assignee = context.value.assignee();
          [start, stop] = [assignee.start.start, assignee.stop.stop];
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
      return true;
    case "async":
    case "creation":
    case "return":
    default:
      return false;
  }
});
const onClick = () => {
  if (!stylable.value) return;
  store.getters.onMessageClick(context, messageRef.value);
};
</script>
