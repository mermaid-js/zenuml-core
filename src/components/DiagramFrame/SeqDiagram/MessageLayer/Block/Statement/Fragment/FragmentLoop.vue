<template>
  <div class="fragment loop border-skin-fragment rounded" :style="fragmentStyle">
    <comment v-if="comment" :comment="comment" :commentObj="commentObj" />
    <div class="header text-skin-fragment-header bg-skin-fragment-header text-base leading-4 relative">
      <div v-if="numbering" class="absolute right-[100%] top-0 pr-1 group-hover:hidden text-gray-500 text-sm font-thin leading-6">
        {{ number }}
      </div>
      <div class="name font-semibold p-1 border-b">
        <collapse-button label="Loop" :collapsed="collapsed" @click="this.toggle" :style="commentObj.textStyle" :class="commentObj.classNames"/>
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
          :number="number"
        ></block>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import fragment from './FragmentMixin';

export default {
  name: 'fragment-loop',
  props: ['context', 'comment', 'commentObj', 'selfCallIndent', 'number'],
  mixins: [fragment],
  computed: {
    ...mapState(['numbering']),
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
