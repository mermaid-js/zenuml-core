<template>
  <div class="fragment alt border-skin-fragment rounded" :style="fragmentStyle">
    <div class="segment">
      <comment v-if="comment" :comment="comment" :commentObj="commentObj" />
      <div class="header bg-skin-fragment-header text-skin-fragment-header text-base leading-4 rounded-t relative">
        <div v-if="numbering" class="absolute right-[100%] top-0 pr-1 group-hover:hidden text-gray-500 text-sm font-thin leading-6">
          {{ number }}
        </div>
        <div class="name font-semibold p-1 border-b">
          <label class="p-0">
            <collapse-button label="Alt" :collapsed="collapsed" @click="this.toggle"/>
          </label>
        </div>
      </div>
    </div>

    <div :class="{hidden: collapsed}">
      <div class="segment">
        <div class="text-skin-fragment">
          <label class="condition p-1">[{{ condition }}]</label>
        </div>
        <block
          v-if="blockInIfBlock"
          :style="{ paddingLeft: `${offsetX}px` }"
          :context="blockInIfBlock"
          :selfCallIndent="selfCallIndent"
          :number="`${number}.1`"
          incremental
        ></block>
      </div>
      <template v-for="(elseIfBlock, index) in alt.elseIfBlock()" :key="index + 500">
        <div class="segment mt-2 border-t border-solid">
          <div class="text-skin-fragment" :key="index + 1000">
            <label class="else-if hidden">else if</label>
            <label class="condition p-1">[{{ conditionFromIfElseBlock(elseIfBlock) }}]</label>
          </div>
          <block
            :style="{ paddingLeft: `${offsetX}px` }"
            :context="blockInElseIfBlock(elseIfBlock)"
            :selfCallIndent="selfCallIndent"
            :key="index + 2000"
            :number="`${number}.${blockLengthAcc[index] + 1}`"
            incremental
          ></block>
        </div>
      </template>
      <template v-if="elseBlock">
        <div class="segment mt-2 border-t border-solid">
          <div class="text-skin-fragment"><label class="p-1">[else]</label></div>
          <block
            :style="{ paddingLeft: `${offsetX}px` }"
            :context="elseBlock"
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
import {increaseNumber, blockLength} from '@/utils/Numbering'

export default {
  name: 'fragment-alt',
  props: ['context', 'comment', 'selfCallIndent', 'commentObj', 'number'],
  mixins: [fragment],
  computed: {
    ...mapState(['numbering']),
    from: function () {
      return this.context.Origin();
    },
    alt: function () {
      return this.context.alt();
    },
    blockInIfBlock: function () {
      return this.alt?.ifBlock()?.braceBlock()?.block();
    },
    condition: function () {
      return this.conditionFromIfElseBlock(this.alt?.ifBlock());
    },
    elseBlock: function () {
      return this.alt?.elseBlock()?.braceBlock()?.block();
    },
    blockLengthAcc() {
      const acc = [blockLength(this.blockInIfBlock)]
      if (this.alt?.elseIfBlock()) {
        this.alt.elseIfBlock().forEach(block => {
          acc.push(acc[acc.length - 1] + blockLength(this.blockInElseIfBlock(block)))
        })
      }
      return acc
    }
  },
  methods: {
    conditionFromIfElseBlock(ctx) {
      return ctx?.parExpr()?.condition()?.getFormattedText();
    },
    blockInElseIfBlock(ctx) {
      return ctx?.braceBlock()?.block();
    },
    increaseNumber: increaseNumber,
    blockLength: blockLength,
  },
};
</script>

<style scoped>
/* We need to do this because tailwind 3.2.4 set border-color to #e5e7eb via '*'. */
* {
  border-color: inherit;
}
</style>
