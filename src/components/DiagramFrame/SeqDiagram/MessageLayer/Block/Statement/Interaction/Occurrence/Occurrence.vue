<template>
  <div
    class="occurrence shadow-occurrence border-skin-occurrence bg-skin-occurrence rounded-sm border-2 relative left-full"
    :class="{ 'right-to-left': rtl }"
    data-el-type="occurrence"
    :data-belongs-to="participant"
    :data-x-offset="center"
    :data-debug-center-of="computedCenter"
  >
    <div
      v-if="debug"
      class="absolute w-full left-0 bg-amber-700 h-3 -top-1 flex justify-center items-center"
    >
      <div class="w-px h-full bg-black"></div>
    </div>
    <div
      v-if="debug"
      class="absolute w-full left-0 bg-amber-700 h-3 -bottom-1 flex justify-center items-center"
    >
      <div class="w-px h-full bg-black"></div>
    </div>
    <collapse-button
      v-if="hasAnyStatementsExceptReturn"
      :collapsed="collapsed"
      @click="this.toggle"
    />
    <block
      v-if="this.context.braceBlock()"
      :context="context.braceBlock().block()"
      :selfCallIndent="selfCallIndent"
      :number="number"
      :collapsed="collapsed"
      :inheritFromOccurrence="true"
    ></block>
  </div>
</template>

<script type="text/babel">
import { mapState, mapGetters } from "vuex";
import CollapseButton from "./CollapseButton.vue";
import { EventBus } from "@/EventBus";
export default {
  name: "occurrence",
  props: ["context", "selfCallIndent", "participant", "rtl", "number"],
  data: function () {
    return {
      center: 0,
      collapsed: false,
    };
  },
  computed: {
    ...mapGetters(["centerOf", "messageLayerLeft"]),
    ...mapState(["code"]),
    debug() {
      return !!localStorage.zenumlDebug;
    },
    computedCenter: function () {
      try {
        return this.centerOf(this.participant);
      } catch (e) {
        console.error(e);
        return 0;
      }
    },
    hasAnyStatementsExceptReturn: function () {
      let braceBlock = this.context.braceBlock();
      if (!braceBlock) return false;
      let stats = braceBlock.block()?.stat() || [];
      let len = stats.length;
      if (len > 1) return true;
      //when the only one statement is not the RetContext
      if (len == 1 && stats[0]["ret"]() == null) return true;
      return false;
    },
  },
  // The following code will cause the Block to be created and mounted AFTER the occurrence (and upto DiagramFrame) is updated.
  // Block must be defined globally to ensure that it is rendered in the same time cycle as the whole diagram.
  // components: {
  //   Block: () => import('../../../Block.vue')
  // },
  methods: {
    toggle() {
      this.collapsed = !this.collapsed;

      //update participant top in this cases: has child and sibling creation statement
      //e.g. : a.call() { b = new B(); b.call() { c = new C() c.call(){return}}}
      EventBus.$emit("participant_set_top");
    },
  },
  components: { CollapseButton },
  watch: {
    context() {
      if (this.collapsed) {
        this.collapsed = false;
      }
    },
  },
};
</script>

<style scoped>
.occurrence {
  width: 15px;
  /* 6 = (OccurrenceWidth(15)+1)/2 - OccurrenceBorderWidth(2)*/
  padding: 16px 0 16px 6px;
}

:deep(> .statement-container:last-child > .interaction.return:last-of-type) {
  margin-bottom: 0;
  border-bottom: 0;
  transform: translateY(1px);
}

:deep(
    > .statement-container:last-child
      > .interaction.return:last-of-type
      > .message
  ) {
  bottom: -17px;
  /* Move the absolutely positioned return message to the bottom. -17 to offset the padding of Occurrence. */
  /* height: 0; */
}

.right-to-left.occurrence {
  left: -14px;
}
</style>

<style>
.occurrence {
  margin-top: -2px;
  /* To offset Message's border-bottom width */
}
</style>
