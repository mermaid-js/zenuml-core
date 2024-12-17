<template>
  <div
    :data-origin="origin"
    :data-left-participant="leftParticipant"
    :data-frame-padding-left="border.left"
    :data-frame-padding-right="border.right"
    class="fragment loop border-skin-fragment rounded"
    :style="fragmentStyle"
  >
    <comment
      v-if="commentObj.text"
      :comment="comment"
      :commentObj="commentObj"
    />
    <div
      class="header text-skin-fragment-header bg-skin-fragment-header leading-4 relative"
    >
      <Numbering :number="number" />
      <div class="name font-semibold p-1 border-b">
        <collapse-button
          label="Loop"
          :collapsed="collapsed"
          @click="this.toggle"
          :style="commentObj.messageStyle"
          :class="commentObj.messageClassNames"
        />
      </div>
    </div>
    <div :class="{ hidden: collapsed }">
      <div class="segment">
        <div class="text-skin-fragment">
          <ConditionLabel :condition="getConditionFromBlock(blockInLoop)" />
        </div>
        <block
          :origin="leftParticipant"
          :style="{ paddingLeft: `${paddingLeft}px` }"
          :context="blockInLoop"
          :number="`${number}.1`"
          incremental
        ></block>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import fragment from "./FragmentMixin";
import ConditionLabel from "./ConditionLabel.vue";
import Numbering from "../../../Numbering.vue";

export default {
  name: "fragment-loop",
  props: ["context", "comment", "commentObj", "number"],
  mixins: [fragment],
  components: {
    ConditionLabel,
    Numbering,
  },
  setup(props) {
    const loop = computed(() => props.context.loop());
    const blockInLoop = computed(() => loop.value?.braceBlock()?.block());

    return {
      loop,
      blockInLoop,
      getConditionFromBlock: () => loop.value?.parExpr()?.condition(),
    };
  },
};
</script>
<style scoped>
/* We need to do this because tailwind 3.2.4 set border-color to #e5e7eb via '*'. */
* {
  border-color: inherit;
}
</style>
