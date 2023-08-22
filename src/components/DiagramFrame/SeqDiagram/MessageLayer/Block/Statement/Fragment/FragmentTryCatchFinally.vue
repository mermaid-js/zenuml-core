<template>
  <div class="fragment tcf border-skin-fragment rounded" :style="fragmentStyle">
    <div class="segment">
      <comment v-if="comment" :comment="comment" :commentObj="commentObj" />
      <div
        class="header bg-skin-fragment-header text-skin-fragment-header text-base leading-4 rounded-t relative"
      >
        <div v-if="numbering" class="absolute right-[100%] top-0 pr-1 group-hover:hidden text-gray-500 text-sm font-thin leading-6">
          {{ number }}
        </div>
        <div class="name font-semibold p-1 border-b text-sm">
          <collapse-button label="Try" :collapsed="collapsed" @click="this.toggle"/>
        </div>
      </div>
    </div>
    <div :class="{hidden: collapsed}">
      <div class="segment">
        <!-- fragment-offset set as offsetX - 1 for fragment border     -->
        <block
          v-if="blockInTryBlock"
          :style="{ paddingLeft: `${offsetX}px` }"
          :context="blockInTryBlock"
          :selfCallIndent="selfCallIndent"
          :number="`${number}.1`"
          incremental
        >
        </block>
      </div>
      <template v-for="(catchBlock, index) in tcf.catchBlock()" :key="index + 500">
        <div class="segment text-xs mt-2 border-t border-solid">
          <div class="header inline-block text-skin-participant" :key="index + 1000">
            <label class="keyword catch p-1">catch</label
            ><label class="exception p-1">{{ exception(catchBlock) }}</label>
          </div>
          <block
            :style="{ paddingLeft: `${offsetX}px` }"
            :context="blockInCatchBlock(catchBlock)"
            :selfCallIndent="selfCallIndent"
            :key="index + 2000"
            :number="`${number}.${blockLengthAcc[index] + 1}`"
            incremental
          ></block>
        </div>
      </template>
      <template v-if="finallyBlock">
        <div class="segment mt-2 border-t border-solid">
          <div class="header flex text-skin-fragment finally">
            <label class="keyword finally px-1 inline-block text-xs">finally</label>
          </div>
          <block
            :style="{ paddingLeft: `${offsetX}px` }"
            :context="finallyBlock"
            :selfCallIndent="selfCallIndent"
            :number="`${number}.${blockLengthAcc[blockLengthAcc.length - 1] + 1}`"
            incremental
          ></block>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import fragment from './FragmentMixin';
import { blockLength } from '@/utils/Numbering';

export default {
  name: 'fragment-tcf',
  props: ['context', 'comment', 'commentObj', 'selfCallIndent', 'number'],
  mixins: [fragment],
  computed: {
    ...mapState(['numbering']),
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
    blockLengthAcc() {
      const acc = [blockLength(this.blockInTryBlock)]
      if (this.tcf?.catchBlock()) {
        this.tcf.catchBlock().forEach(block => {
          acc.push(acc[acc.length - 1] + blockLength(this.blockInCatchBlock(block)))
        })
      }
      return acc
    }
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
