<template>
  <div class="fragment opt border-skin-fragment rounded" :style="fragmentStyle">
    <comment v-if="comment" :comment="comment" :commentObj="commentObj" />
    <div class="header bg-skin-fragment-header text-skin-fragment-header text-base leading-4 relative">
      <div v-if="numbering" class="absolute right-[100%] top-0 pr-1 group-hover:hidden text-gray-500 text-sm font-thin leading-6">
        {{ number }}
      </div>
      <div class="name font-semibold p-1 border-b">
        <collapse-button label="Opt" :collapsed="collapsed" @click="this.toggle" :style="commentObj.textStyle" :class="commentObj.classNames"/>
      </div>
    </div>
    <block :class="{hidden: collapsed}"
      :style="{ paddingLeft: `${offsetX}px` }"
      :context="opt.braceBlock().block()"
      :selfCallIndent="selfCallIndent"
      :number="number"
    ></block>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import fragment from './FragmentMixin';

export default {
  name: 'fragment-opt',
  props: ['context', 'comment', 'commentObj', 'selfCallIndent', 'number'],
  mixins: [fragment],
  computed: {
    ...mapState(['numbering']),
    from: function () {
      return this.context.Origin();
    },
    opt: function () {
      return this.context.opt();
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
