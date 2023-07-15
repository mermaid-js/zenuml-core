<template>
  <!-- style border-width means not to be overridden. -->
  <div class="message self text-sm flex items-start flex-col" style="border-width: 0">
    <label class="name group px-px hover:text-skin-message-hover hover:bg-skin-message-hover relative min-h-[1em]">
      <div class="absolute right-[100%] top-0 pr-1 group-hover:hidden text-gray-500" v-if="numbering">{{ number }}</div>
      <span v-if="assignee">{{ assignee }} = </span> {{ content }}
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

<script type="text/babel">
import { mapState } from 'vuex';

export default {
  name: 'self-invocation',
  props: ['content', 'assignee', 'number'],
  computed: {
    ...mapState(['numbering']),
  }
};
</script>
