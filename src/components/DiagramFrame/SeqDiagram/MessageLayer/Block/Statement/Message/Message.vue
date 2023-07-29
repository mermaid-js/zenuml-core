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
    :style="{ 'border-bottom-style': borderStyle }"
  >
    <div
      class="name group flex-grow text-sm hover:whitespace-normal hover:text-skin-message-hover hover:bg-skin-message-hover"
      :style="{ color: color }"
    >
      <div class="inline-block relative min-h-[1em]">
        {{ content }}
        <div class="absolute right-[100%] top-0 pr-1 group-hover:hidden text-gray-500" v-if="numbering">{{ number }}</div>
      </div>
    </div>
    <point class="flex-shrink-0 transform translate-y-1/2 -my-px" :fill="fill" :rtl="rtl" />
  </div>
</template>

<script type="text/babel">
import { mapState } from 'vuex';
import Point from './Point/Point.vue';
// async: open arrow head.
// sync: filled arrow head.
// reply: dashed line with either an open or filled arrow head.
// creation: a dashed line with an open arrow head.
export default {
  name: 'message',
  props: ['content', 'rtl', 'type', 'color', 'number'],
  computed: {
    ...mapState(['numbering']),
    isAsync: function () {
      return this.type === 'async';
    },
    borderStyle() {
      switch (this.type) {
        case 'sync':
        case 'async':
          return 'solid';
        case 'creation':
        case 'return':
          return 'dashed';
      }
      return '';
    },
    fill() {
      switch (this.type) {
        case 'sync':
        case 'async':
          return true;
        case 'creation':
        case 'return':
          return false;
      }
      return false;
    },
  },
  components: {
    Point,
  },
};
</script>
