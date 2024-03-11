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
      class="name group flex-grow text-sm hover:whitespace-normal hover:text-skin-message-hover hover:bg-skin-message-hover"
    >
      <div class="inline-block relative min-h-[1em]">
        <div :style="textStyle" :class="classNames">
          <EditableLabel
            v-if="isEditable"
            :labelText="content"
            :labelPosition="labelPosition"
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
import { computed, toRefs, ref } from "vue";
import { useStore } from "vuex";
import Point from "./Point/Point.vue";
import EditableLabel from "../../../EditableLabel.vue";

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
const isEditable = computed(() => {
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
const labelPosition = computed(() => {
  switch (type?.value) {
    case "sync": {
      const signature = context.value?.messageBody()?.func()?.signature()?.[0];
      return [signature?.start.start, signature?.stop.stop];
    }
    case "async": {
      const content = context.value?.content();
      return [content?.start.start, content?.stop.stop];
    }
    case "return": {
      const ret = context.value?.atom();
      return [ret?.start.start, ret?.stop.stop];
    }
    default:
      return [-1, -1];
  }
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
