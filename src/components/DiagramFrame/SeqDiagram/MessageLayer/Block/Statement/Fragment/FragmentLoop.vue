<template>
  <div class="fragment loop border-skin-fragment rounded" :style="fragmentStyle">
    <comment v-if="comment" :comment="comment" />
    <div class="header text-skin-fragment-header bg-skin-fragment-header text-base leading-4">
      <div class="name font-semibold p-1 border-b" style="display: flex; width: 100%; justify-content: space-between;">
        <label class="p-0 mb-0">Loop</label>
        <collapsible-button :element-id="`collapse-${uuid}`" />
      </div>
    </div>
    <b-collapse visible :id="`collapse-${uuid}`">
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
    </b-collapse>
  </div>
</template>

<script>
import CollapsibleButton from './CollapsibleButton.vue';
import fragment from './FragmentMixin';
import { v4 as uuidv4 } from 'uuid';

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
</style>
