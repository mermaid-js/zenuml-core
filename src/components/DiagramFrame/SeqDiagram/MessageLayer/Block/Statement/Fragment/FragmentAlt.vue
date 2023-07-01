<template>
  <div class="fragment alt border-skin-fragment rounded" :style="fragmentStyle">
    <div class="segment">
      <comment v-if="comment" :comment="comment" :commentObj="commentObj" />

      <div
        class="header bg-skin-fragment-header text-skin-fragment-header text-base leading-4 rounded-t"
      >
        <div class="name font-semibold p-1 border-b"><label class="p-0">Alt</label></div>
      </div>
      <div class="segment">
        <div class="text-skin-fragment">
          <label class="condition p-1">[{{ condition }}]</label>
        </div>
        <block
          v-if="blockInIfBlock"
          :style="{ paddingLeft: `${offsetX}px` }"
          :context="blockInIfBlock"
          :selfCallIndent="selfCallIndent"
          :order="`${orderPrefix}1`"
        ></block>
      </div>
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
          :order="`${orderPrefix}${altBlockOrder[index + 1]}`"
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
          :order="`${orderPrefix}${altBlockOrder[altBlockOrder.length - 2]}`"
        ></block>
      </div>
    </template>
  </div>
</template>

<script>
import fragment from './FragmentMixin';

export default {
  name: 'fragment-alt',
  props: ['context', 'comment', 'selfCallIndent', 'commentObj', 'order'],
  mixins: [fragment],
  computed: {
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
    orderPrefix() {
      if (this.order) {
        return this.order.split('.').slice(0, -1).join('.') + '.'
      }
      return ''
    },
    altBlockOrder() {
      const orders = [1, this.blockInIfBlock?.stat()?.length + 1]
      this.alt.elseIfBlock()?.forEach?.((block) => {
        orders.push(orders[orders.length - 1] + this.blockInElseIfBlock(block).stat().length)
      })
      orders.push(orders[orders.length - 1] + this.elseBlock.stat().length)

      console.log(orders);
      return orders
    },
  },
  methods: {
    conditionFromIfElseBlock(ctx) {
      return ctx?.parExpr()?.condition()?.getFormattedText();
    },
    blockInElseIfBlock(ctx) {
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
