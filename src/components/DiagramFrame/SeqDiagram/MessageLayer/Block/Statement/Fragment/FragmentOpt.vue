<template>
  <div class="fragment opt border-skin-fragment rounded" :style="fragmentStyle">
    <comment v-if="comment" :comment="comment" />
    <div class="header bg-skin-fragment-header text-skin-fragment-header text-base leading-4">
      <div class="name font-semibold p-1 border-b" style="display: flex; width: 100%; justify-content: space-between;">
        <label class="mb-0">Opt</label>
        <collapsible-button :element-id="`collapse-${uuid}`" />
      </div>
    </div>
    <b-collapse visible :id="`collapse-${uuid}`">
      <block
        :style="{ paddingLeft: `${offsetX}px` }"
        :context="opt.braceBlock().block()"
        :selfCallIndent="selfCallIndent"
      ></block>
    </b-collapse>
  </div>
</template>

<script>
import CollapsibleButton from './CollapsibleButton.vue';
import fragment from './FragmentMixin';
import { v4 as uuidv4 } from 'uuid';

export default {
  name: 'fragment-opt',
  props: ['context', 'comment', 'selfCallIndent'],
  mixins: [fragment],
  computed: {
    from: function () {
      return this.context.Origin();
    },
    opt: function () {
      return this.context.opt();
    },
    uuid: function () {
      return uuidv4();
    },
  },
  components: { CollapsibleButton },
};
</script>

<style scoped>
/* We need to do this because tailwind 3.2.4 set border-color to #e5e7eb via '*'. */
* {
  border-color: inherit;
}
.collapsing {
  position: relative;
  height: 0;
  overflow: hidden;
  transition: height 0.35s ease;
}
</style>
