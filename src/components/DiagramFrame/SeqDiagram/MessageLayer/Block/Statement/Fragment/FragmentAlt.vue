<template>
  <div
    :data-origin="origin1"
    :data-from="from"
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
        <div
          v-if="numbering"
          class="absolute right-[100%] top-0 pr-1 group-hover:hidden text-gray-500 font-thin leading-6"
        >
          {{ number }}
        </div>
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
          :origin1="origin1"
          v-if="blockInIfBlock"
          :style="{ paddingLeft: `${offsetX}px` }"
          :context="blockInIfBlock"
          :selfCallIndent="selfCallIndent"
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
            :origin1="origin1"
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
          <div class="text-skin-fragment">
            <label class="p-1">[else]</label>
          </div>
          <block
            :origin1="origin1"
            :style="{ paddingLeft: `${offsetX}px` }"
            :context="elseBlock"
            :selfCallIndent="selfCallIndent"
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
import { useStore } from "vuex";
import fragment from "./FragmentMixin";
import { increaseNumber, blockLength } from "@/utils/Numbering";
import ConditionLabel from "./ConditionLabel.vue";

export default {
  name: "fragment-alt",
  props: ["context", "comment", "selfCallIndent", "commentObj", "number"],
  mixins: [fragment],
  components: {
    ConditionLabel,
  },
  setup(props) {
    const store = useStore();
    const numbering = computed(() => store.state.numbering);
    const from = computed(() => props.origin1);
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
      numbering,
      from,
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
