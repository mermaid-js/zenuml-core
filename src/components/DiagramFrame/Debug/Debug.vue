<template>
  <div v-show="debug">
    <div class="flex flex-nowrap m-2 text-sm">
      <div
        class="ml-4 text-xs inline-flex items-center font-bold leading-sm px-3 py-1 bg-green-200 text-green-700 rounded-sm"
      >
        <Icon name="debug" icon-class="h-4 w-4" />
        <span class="inline-block px-2">{{ gitBranch }}:{{ commitHash }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import Icon from "@/components/Icon/Icon.vue";

const commitHash = 'process.env.VUE_APP_GIT_HASH';
const gitBranch = 'process.env.VUE_APP_GIT_BRANCH';
export default {
  name: 'Debug',
  components: {Icon},
  data() {
    return {
      commitHash,
      gitBranch,
    };
  },
  computed: {
    debug() {
      return !!localStorage.zenumlDebug;
    },
  },
};
</script>
