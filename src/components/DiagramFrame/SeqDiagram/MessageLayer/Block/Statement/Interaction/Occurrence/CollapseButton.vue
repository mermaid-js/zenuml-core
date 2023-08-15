<template>
  <div class="collapsible-header">
    <svg width="20px" height="20px" 
    :class="{hidden:collapsed,expanded:!collapsed}" 
    @click="$emit('click',$event)" 
    class="collapse-button cursor-pointer" 
    viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg" fill=none stroke="#000000" stroke-width=1 stroke-linecap=round stroke-linejoin=miter ><g id=SVGRepo_bgCarrier stroke-width=0></g><g id=SVGRepo_tracerCarrier stroke-linecap=round stroke-linejoin=round></g><g id=SVGRepo_iconCarrier>
    <line x1=13 y1=2 x2=13 y2=10></line>
    <polyline points="9 7 13 11 17 7"></polyline>
    <line x1=13 y1=23 x2=13 y2=15></line>
    <polyline points="9 19 13 15 17 19"></polyline>
  </g></svg>    
  <svg width="20px" height="20px" :class="{hidden:!collapsed}" @click="$emit('click',$event)" class="cursor-pointer" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg" fill=none stroke="#000000" stroke-width=1 stroke-linecap=round stroke-linejoin=miter ><g id=SVGRepo_bgCarrier stroke-width=0></g><g id=SVGRepo_tracerCarrier stroke-linecap=round stroke-linejoin=round></g><g id=SVGRepo_iconCarrier>
    <line x1=13 y1=1 x2=13 y2=9></line>
    <polyline points="9 5 13 1 17 5"></polyline>
    <line x1=13 y1=13 x2=13 y2=13></line>
    <line x1=13 y1=24 x2=13 y2=17></line>
    <polyline points="9 20 13 24 17 20"></polyline>
  </g></svg>
  </div>
</template>

<script>
export default {
  props: ['collapsed'],
  emits: ['click'],
};
</script>
<style scoped>
.collapsible-header {
   position:absolute; top:1px;left:-5px; 
}
.collapse-button {
  display: none;
}
.occurrence:hover .collapsible-header .collapse-button.expanded {
  display: inline-block !important;
}

</style>