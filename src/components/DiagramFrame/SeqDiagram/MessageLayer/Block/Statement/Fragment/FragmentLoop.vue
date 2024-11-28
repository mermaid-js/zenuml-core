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
      <div
        v-if="numbering"
        class="absolute right-[100%] top-0 pr-1 group-hover:hidden text-gray-500 font-thin leading-6"
      >
        {{ number }}
      </div>
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
          :origin="origin"
          :style="{ paddingLeft: `${offsetX}px` }"
          :context="blockInLoop"
          :number="number"
        ></block>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
import fragment from "./FragmentMixin";
import ConditionLabel from "./ConditionLabel.vue";

export default {
  name: "fragment-loop",
  props: ["context", "comment", "commentObj", "number"],
  mixins: [fragment],
  components: {
    ConditionLabel,
  },
  setup(props) {
    const store = useStore();
    const numbering = computed(() => store.state.numbering);
    const from = computed(() => props.context.Origin());
    const loop = computed(() => props.context.loop());
    const blockInLoop = computed(() => loop.value?.braceBlock()?.block());

    return {
      numbering,
      from,
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
