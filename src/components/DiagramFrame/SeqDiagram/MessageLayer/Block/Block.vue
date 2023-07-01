<template>
  <div class="block">
    <div class="statement-container mt-1" v-for="(stat, index) in statements" :key="index">
      <statement :context="stat" :selfCallIndent="selfCallIndent" :order="getOrder(index)" />
    </div>
  </div>
</template>

<script lang="ts">
import { getAssignment, getContextType, getIsSelfInteraction } from '@/utils/Context';
import Statement from './Statement/Statement.vue';
import { mapState } from 'vuex';

export default {
  name: 'block',
  props: ['context', 'selfCallIndent', 'order'],
  computed: {
    ...mapState(['displayOrderNumber']),
    statements() {
      return this.context?.stat();
    },
    statementOrders() {
      const orders = [0]
      this.context?.stat()?.forEach((statement: any) => {
        const type = getContextType(statement)
        let length = 1
        switch (type) {
          case 'Interaction':
            if (getIsSelfInteraction(statement)) length++
            break;
          case 'FragmentAlt':
            length = statement.alt().ifBlock()?.braceBlock()?.block?.()?.stat?.()?.length || 0
            if (statement.alt().elseIfBlock()) {
              length += statement.alt().elseIfBlock().reduce((pre: number, cur: any) => {
                return pre + (cur.braceBlock()?.block()?.stat?.()?.length || 0)
              }, 0)
            }
            length += statement.alt().elseBlock()?.braceBlock()?.block?.()?.stat?.()?.length || 0
            break;
          case 'FragmentLoop':
            length += statement.loop()?.braceBlock()?.block()?.stat()?.length - 1
            break;
          default: break;
        }
        orders.push(orders[orders.length - 1] + length)
      })
      return orders
    }
  },
  components: {
    Statement,
  },
  methods: {
    getOrder(index: number): string {
      const statOrder = this.statementOrders[index]
      if (this.statements.length > 1) {
        return this.increaseOrder(statOrder)
      } else {
        return this.order || '1'
      }
    },
    increaseOrder(value: number): string {
      if (this.order) {
        const arr = this.order.split('.')
        arr[arr.length - 1] = Number(arr[arr.length - 1]) + value
        return arr.join('.')
      } else {
        return String(value + 1)
      }
    }
  },
};
</script>
