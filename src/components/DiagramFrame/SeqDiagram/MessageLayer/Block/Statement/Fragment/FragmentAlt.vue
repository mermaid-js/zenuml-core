<template>
  <div
    :data-origin="origin"
    :data-left-participant="leftParticipant"
    :data-frame-padding-left="border.left"
    :data-frame-padding-right="border.right"
    class="fragment alt border-skin-fragment rounded"
    :style="fragmentStyle"
  >
    <div class="segment">
      <comment
        v-if="commentObj.text"
        :comment="comment"
        :commentObj="commentObj"
      />
      <div
        class="header bg-skin-fragment-header text-skin-fragment-header leading-4 rounded-t relative"
      >
        <Numbering :number="number" />
        <div class="name font-semibold p-1 border-b">
          <label class="p-0">
            <collapse-button
              label="Alt"
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
          <ConditionLabel :condition="conditionFromIfElseBlock(ifBlock)" />
        </div>
        <block
          :origin="leftParticipant"
          v-if="blockInIfBlock"
          :style="{ paddingLeft: `${paddingLeft}px` }"
          :context="blockInIfBlock"
          :number="`${number}.1`"
          incremental
        ></block>
      </div>
      <template v-for="(elseIfBlock, index) in elseIfBlocks" :key="index + 500">
        <div class="segment mt-2 border-t border-solid">
          <div class="text-skin-fragment" :key="index + 1000">
            <label class="else-if hidden">else if</label>
            <ConditionLabel
              :condition="conditionFromIfElseBlock(elseIfBlock)"
            />
          </div>
          <block
            :origin="leftParticipant"
            :style="{ paddingLeft: `${paddingLeft}px` }"
            :context="blockInElseIfBlock(elseIfBlock)"
            :key="index + 2000"
            :number="`${number}.${blockLengthAcc[index] + 1}`"
            incremental
          ></block>
        </div>
      </template>
      <template v-if="elseBlock">
        <div class="segment mt-2 border-t border-solid">
          <div class="text-skin-fragment">
            <label class="p-1">[else]</label>
          </div>
          <block
            :origin="leftParticipant"
            :style="{ paddingLeft: `${paddingLeft}px` }"
            :context="elseBlock"
            :number="`${number}.${
              blockLengthAcc[blockLengthAcc.length - 1] + 1
            }`"
            incremental
          ></block>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import fragment from "./FragmentMixin";
import { increaseNumber, blockLength } from "@/utils/Numbering";
import ConditionLabel from "./ConditionLabel.vue";
import Numbering from "../../../Numbering.vue";

export default {
  name: "fragment-alt",
  props: ["context", "comment", "commentObj", "number"],
  mixins: [fragment],
  components: {
    ConditionLabel,
    Numbering,
  },
  setup(props) {
    const alt = computed(() => props.context.alt());
    const ifBlock = computed(() => alt.value?.ifBlock());
    const elseIfBlocks = computed(() => alt.value?.elseIfBlock());
    const elseBlock = computed(() =>
      alt.value?.elseBlock()?.braceBlock()?.block(),
    );
    const blockInIfBlock = computed(() =>
      alt.value?.ifBlock()?.braceBlock()?.block(),
    );
    const blockLengthAcc = computed(() => {
      const acc = [blockLength(blockInIfBlock.value)];
      if (alt.value?.elseIfBlock()) {
        alt.value.elseIfBlock().forEach((block) => {
          acc.push(
            acc[acc.length - 1] + blockLength(blockInElseIfBlock(block)),
          );
        });
      }
      return acc;
    });

    function conditionFromIfElseBlock(block) {
      return block?.parExpr()?.condition();
    }

    function blockInElseIfBlock(block) {
      return block?.braceBlock()?.block();
    }

    return {
      alt,
      blockInIfBlock,
      ifBlock,
      elseIfBlocks,
      elseBlock,
      blockLengthAcc,
      conditionFromIfElseBlock,
      blockInElseIfBlock,
      increaseNumber,
      blockLength,
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
