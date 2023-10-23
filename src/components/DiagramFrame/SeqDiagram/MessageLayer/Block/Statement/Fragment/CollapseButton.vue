<template>
  <div class="collapsible-header">
    <label class="mb-0">{{ label }}</label>
    <Icon
      name="collapse-expanded"
      :icon-class="`w-4 h-4 collapse-button cursor-pointer ${
        !collapsed ? 'expanded' : ''
      }`"
      v-if="!collapsed"
      @icon-click="$emit('click', $event)"
    />
    <Icon
      name="collapse-unexpanded"
      icon-class="w-4 h-4 cursor-pointer"
      v-else
      @icon-click="$emit('click', $event)"
    />
  </div>
</template>

<script>
import Icon from "@/components/Icon/Icon.vue";

export default {
  components: { Icon },
  props: ["label", "collapsed"],
  emits: ["click"],
};
</script>
<style scoped>
.collapsible-header {
  display: flex;
  width: 100%;
  justify-content: space-between;
}
.collapse-button {
  display: none;
}
.fragment:hover .collapsible-header .collapse-button.expanded {
  display: inline-block !important;
}
</style>
