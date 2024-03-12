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
      <MessageLabel :labelText="labelText" :labelPosition="labelPosition" />
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

<script type="text/babel">
import { mapState } from "vuex";

export default {
  name: "self-invocation-async",
  props: ["content", "number"],
  computed: {
    ...mapState(["numbering"]),
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.message.self {
  /* InteractionBorderWidth */
  transform: translateX(-5px);
}
</style>
