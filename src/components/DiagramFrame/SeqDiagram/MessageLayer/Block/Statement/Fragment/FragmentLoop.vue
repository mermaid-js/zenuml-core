<template>
  <div class="fragment loop border-skin-fragment rounded" :style="fragmentStyle">
    <comment v-if="comment" :comment="comment" />
    <div class="header text-skin-fragment-header bg-skin-fragment-header text-base leading-4">
      <div class="name font-semibold p-1 border-b">
        <collapse-button label="Loop" :collapsed="collapsed" @click="this.toggle"/>
      </div>
    </div>
    <div :class="{hidden: collapsed}">
      <div class="segment">
        <div class="text-skin-fragment">
          <label class="condition p-1">[{{ condition }}]</label>
        </div>
        <block
          :style="{ paddingLeft: `${offsetX}px` }"
          :context="blockInLoop"
          :selfCallIndent="selfCallIndent"
        ></block>
      </div>
    </div>
  </div>
</template>

<script>
import fragment from './FragmentMixin';

export default {
  name: 'fragment-loop',
  props: ['context', 'comment', 'selfCallIndent'],
  mixins: [fragment],
  computed: {
    from: function () {
      return this.context.Origin();
    },
    loop: function () {
      return this.context.loop();
    },
    blockInLoop: function () {
      return this.loop?.braceBlock()?.block();
    },
    condition: function () {
      return this.loop?.parExpr()?.condition()?.getFormattedText();
    },
  },
};
</script>
<style scoped>
/* We need to do this because tailwind 3.2.4 set border-color to #e5e7eb via '*'. */
* {
  border-color: inherit;
}
</style>
