<template>
  <div
    class="point text-skin-message-arrow"
    :class="{ filled: fill, open: !fill, 'right-to-left': rtl }"
  >
    <svg v-if="!rtl" class="arrow stroke-2" height="10" width="10">
      <polyline
        class="right head stroke-current"
        points="0,0 10,5 0,10"
        :fill="fill ? 'currentColor' : 'none'"
      ></polyline>
    </svg>
    <svg v-if="rtl" class="arrow stroke-2" height="10" width="10">
      <polyline
        class="left head stroke-current"
        points="10,0 0,5 10,10"
        :fill="fill ? 'currentColor' : 'none'"
      ></polyline>
    </svg>
  </div>
</template>

<script type="text/babel">
export default {
  name: "point",
  props: ["fill", "rtl"],
};
</script>
