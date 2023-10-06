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
          {{ content }}
        </div>
        <div class="absolute right-[100%] top-0 pr-1 group-hover:hidden text-gray-500" v-if="numbering">{{ number }}</div>
      </div>
    </div>
    <point class="flex-shrink-0 transform translate-y-1/2 -my-px" :fill="fill" :rtl="rtl" />
  </div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex';
import Point from './Point/Point.vue';
import { computed, toRefs, ref } from 'vue';
const props = defineProps<{
  context?: any;
  content: string;
  rtl?: string | boolean;
  type?: string;
  textStyle?: Record<string, string | number>;
  classNames?: any;
  number?: string;
}>()
const { context, content, rtl, type, textStyle, classNames, number } = toRefs(props)
const store = useStore()
const messageRef = ref()
const numbering = computed(() => store.state.numbering)
const isAsync = computed(() => type?.value === 'async')
const borderStyle = computed(() => {
  switch (type?.value) {
    case 'sync':
    case 'async':
      return 'solid'
    case 'creation':
    case 'return':
      return 'dashed'
  }
  return ''
})
const fill = computed(() => {
  switch (type?.value) {
    case 'sync':
    case 'async':
      return true
    case 'creation':
    case 'return':
      return false
  }
  return false
})
const onClick = () => {
  store.getters.onMessageClick(context, messageRef.value)
}
</script>