<template>
  <div style="display: flex; width: 100%; justify-content: space-between;" >
    <label class="p-0 mb-0">{{ label }}</label>
    <svg width="16px" height="16px" :class="{hidden: collapsed}" v-if="this.collapsible" @click="this.onClick(); $emit('click', $event, this.collapsed)" class="cursor-pointer" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="miter"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><line x1="14" y1="10" x2="21" y2="3"></line><polyline points="20 10 14 10 14 4"></polyline><line x1="3" y1="21" x2="10" y2="14"></line><polyline points="4 14 10 14 10 20"></polyline></g></svg>

    <svg width="16px" height="16px" viewBox="0 0 24 24" :class="{hidden: !collapsed}" v-if="this.collapsible" @click="this.onClick(); $emit('click', $event, this.collapsed)" class="cursor-pointer" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title></title> <g id="Complete"> <g id="expand"> <g> <polyline data-name="Right" fill="none" id="Right-2" points="3 17.3 3 21 6.7 21" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></polyline> <line fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" x1="10" x2="3.8" y1="14" y2="20.2"></line> <line fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" x1="14" x2="20.2" y1="10" y2="3.8"></line> <polyline data-name="Right" fill="none" id="Right-3" points="21 6.7 21 3 17.3 3" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></polyline> </g> </g> </g> </g></svg>
  </div>
</template>

<script>

export default {
  props: ['label', 'collapsible'],
  emits: ['click'],
  data: function() {
    return {collapsed: false}
  },
  methods: {
    onClick() {
      this.collapsed = !this.collapsed;
    }
  }
};
</script>
