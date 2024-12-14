<template>
  <div
    :data-origin="origin"
    :data-left-participant="leftParticipant"
    :data-frame-padding-left="border.left"
    :data-frame-padding-right="border.right"
    class="fragment opt border-skin-fragment rounded"
    :style="fragmentStyle"
  >
    <div class="segment">
      <comment
        v-if="commentObj.text"
        :comment="comment"
        :commentObj="commentObj"
      />
      <div
        class="header bg-skin-fragment-header text-skin-fragment-header leading-4 relative"
      >
        <Numbering :number="number" />
        <div class="name font-semibold p-1 border-b">
          <label class="p-0">
            <collapse-button
              label="Opt"
              :collapsed="collapsed"
              @click="this.toggle"
              :style="commentObj.messageStyle"
              :class="commentObj.messageClassNames"
            />
          </label>
        </div>
      </div>
    </div>

    <div :class="{ hidden: collapsed }">
      <div class="segment">
        <div class="text-skin-fragment flex">
          <ConditionLabel :condition="condition" />
        </div>
        <block
          :origin="origin"
          v-if="blockInOpt"
          :style="{ paddingLeft: `${offsetX}px` }"
          :context="blockInOpt"
          :number="number"
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
  name: "fragment-opt",
  components: { ConditionLabel, Numbering },
  props: ["context", "comment", "commentObj", "number"],
  mixins: [fragment],
  setup(props) {
    const opt = computed(() => props.context.opt());
    const braceBlock = computed(() => opt.value?.braceBlock());
    const atom = computed(() => opt.value?.atom());
    const blockInOpt = computed(() => braceBlock.value?.block());

    return {
      braceBlock,
      blockInOpt,
      condition: atom,
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
