<template>
  <div class="fragment tcf border-skin-fragment rounded" :style="fragmentStyle">
    <div class="segment">
      <comment v-if="comment" :comment="comment" />
      <div class="header bg-skin-fragment-header text-skin-fragment-header text-base leading-4 rounded-t" >
        <div class="name font-semibold p-1 border-b" style="display: flex; width: 100%; justify-content: space-between;">
          <label class="mb-0">Try</label>
          <collapsible-button :element-id="`collapse-${uuid}`" />
        </div>
      </div>
    </div>
    
    <b-collapse visible :id="`collapse-${uuid}`">
    <div class="segment">
      <!-- fragment-offset set as offsetX - 1 for fragment border     -->
      <block
        v-if="blockInTryBlock"
        :style="{ paddingLeft: `${offsetX}px` }"
        :context="blockInTryBlock"
        :selfCallIndent="selfCallIndent"
      ></block>
    </div>
    <template v-for="(catchBlock, index) in tcf.catchBlock()" :key="index + 500">
      <div class="segment mt-2 border-t border-solid">
        <div class="header text-skin-fragment" :key="index + 1000">
          <label class="keyword catch p-1">catch</label
          ><label class="exception p-1">{{ exception(catchBlock) }}</label>
        </div>
        <block
          :style="{ paddingLeft: `${offsetX}px` }"
          :context="blockInCatchBlock(catchBlock)"
          :selfCallIndent="selfCallIndent"
          :key="index + 2000"
        ></block>
      </div>
    </template>
    <template v-if="finallyBlock">
      <div class="segment mt-2 border-t border-solid">
        <div class="header text-skin-fragment finally">
          <label class="keyword finally p-1">finally</label>
        </div>
        <block
          :style="{ paddingLeft: `${offsetX}px` }"
          :context="finallyBlock"
          :selfCallIndent="selfCallIndent"
        ></block>
      </div>
    </template>
    </b-collapse>
  </div>
</template>

<script>
import CollapsibleButton from './CollapsibleButton.vue';
import fragment from './FragmentMixin';
import { v4 as uuidv4 } from 'uuid';

export default {
  components: { CollapsibleButton },
  name: 'fragment-tcf',
  props: ['context', 'comment', 'selfCallIndent'],
  mixins: [fragment],
  computed: {
    from: function () {
      return this.context.Origin();
    },
    tcf: function () {
      return this.context.tcf();
    },
    blockInTryBlock: function () {
      return this.tcf?.tryBlock()?.braceBlock()?.block();
    },
    finallyBlock: function () {
      return this.tcf?.finallyBlock()?.braceBlock()?.block();
    },
    uuid: function () {
      return uuidv4();
    },
  },
  methods: {
    exception(ctx) {
      return ctx?.invocation()?.parameters().getText();
    },
    blockInCatchBlock(ctx) {
      return ctx?.braceBlock()?.block();
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
