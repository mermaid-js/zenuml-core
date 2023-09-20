<template>
  <div>
    <div class="privacy tooltip bottom whitespace-normal flex items-center"
      data-tooltip="We (the vendor) do not have access to your data. The diagram is generated in this browser.">
      <Icon name="privacy" icon-class="fill-current h-6 w-6 m-auto" />
    </div>
  </div>
</template>

<script>
import Icon from "@/components/Icon/Icon.vue";

export default {
  name: 'Privacy',
  components: {Icon},
};
</script>

<style scoped>
.tooltip {
  cursor: pointer;
  position: relative;
  display: block;
  width: 100%;
  text-align: center;
  z-index: 10;
}

.tooltip:after {
  display: none;
  content: attr(data-tooltip);
  background: #e8e9e9;
  max-width: 500px;
  width: 200px;
  position: absolute;
  left: -200px;
  right: 0;
  margin: auto;
  opacity: 0;
  height: auto;
  font-size: 14px;
  padding: 10px;
  border-radius: 4px;
  color: #111;
  text-align: left;
}

.tooltip.bottom:after {
  top: 80%;
  transition: opacity 0.3s ease 0.3s, top 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.3s;
}
.tooltip.bottom:hover:after {
  display: block;
  top: 130%;
  opacity: 1;
}
</style>
