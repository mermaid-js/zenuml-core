<template>
  <div
    class="occurrence relative left-full min-h-6 shadow-occurrence border-skin-occurrence bg-skin-occurrence rounded-sm border-2"
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
      :origin="participant"
      v-if="this.context.braceBlock()"
      :context="context.braceBlock().block()"
      :number="number"
      :collapsed="collapsed"
    ></block>
  </div>
</template>

<script type="text/babel">
import { mapState, mapGetters } from "vuex";
import CollapseButton from "./CollapseButton.vue";
import { EventBus } from "@/EventBus";
export default {
  name: "occurrence",
  props: ["context", "participant", "rtl", "number"],
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
      return len === 1 && stats[0]["ret"]() == null;
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
  /* To offset Message's border-bottom width.
  Use margin-top with relative set to save 2px at the bottom of the Occurrence.
  If we use `top: -2px`, the 2px will still be occupied. It would have just shift the occurrence up. */
  margin-top: -2px;
  /* 6 = (OccurrenceWidth(15)+1)/2 - OccurrenceBorderWidth(2)*/
  padding-left: 6px;
}

.right-to-left.occurrence {
  left: -14px;
}
</style>
