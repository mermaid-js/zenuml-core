<template>
  <div
    :data-origin="origin"
    :data-left-participant="leftParticipant"
    :data-frame-padding-left="border.left"
    :data-frame-padding-right="border.right"
    class="fragment tcf border-skin-fragment rounded"
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
          <collapse-button
            label="Try"
            :collapsed="collapsed"
            @click="this.toggle"
            :style="commentObj.messageStyle"
            :class="commentObj.messageClassNames"
          />
        </div>
      </div>
    </div>
    <div :class="{ hidden: collapsed }">
      <div class="segment">
        <!-- fragment-offset set as offsetX - 1 for fragment border     -->
        <block
          :origin="origin"
          v-if="blockInTryBlock"
          :style="{ paddingLeft: `${offsetX}px` }"
          :context="blockInTryBlock"
          :number="`${number}.1`"
          incremental
        >
        </block>
      </div>
      <template
        v-for="(catchBlock, index) in tcf.catchBlock()"
        :key="index + 500"
      >
        <div class="segment mt-2 border-t border-solid">
          <div
            class="header inline-block bg-skin-frame/[0.66]"
            :key="index + 1000"
          >
            <label class="keyword catch p-1">catch</label
            ><label class="exception p-1">{{ exception(catchBlock) }}</label>
          </div>
          <block
            :origin="origin"
            :style="{ paddingLeft: `${offsetX}px` }"
            :context="blockInCatchBlock(catchBlock)"
            :key="index + 2000"
            :number="`${number}.${blockLengthAcc[index] + 1}`"
            incremental
          ></block>
        </div>
      </template>
      <template v-if="finallyBlock">
        <div class="segment mt-2 border-t border-solid">
          <div class="header flex text-skin-fragment finally">
            <label
              class="keyword finally bg-skin-frame/[0.66] px-1 inline-block"
              >finally</label
            >
          </div>
          <block
            :origin="origin"
            :style="{ paddingLeft: `${offsetX}px` }"
            :context="finallyBlock"
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
import fragment from "./FragmentMixin";
import { blockLength } from "@/utils/Numbering";
import Numbering from "../../../Numbering.vue";

export default {
  name: "fragment-tcf",
  props: ["context", "comment", "commentObj", "number"],
  mixins: [fragment],
  components: {
    Numbering,
  },
  computed: {
    tcf: function () {
      return this.context.tcf();
    },
    blockInTryBlock: function () {
      return this.tcf?.tryBlock()?.braceBlock()?.block();
    },
    finallyBlock: function () {
      return this.tcf?.finallyBlock()?.braceBlock()?.block();
    },
    blockLengthAcc() {
      const acc = [blockLength(this.blockInTryBlock)];
      if (this.tcf?.catchBlock()) {
        this.tcf.catchBlock().forEach((block) => {
          acc.push(
            acc[acc.length - 1] + blockLength(this.blockInCatchBlock(block)),
          );
        });
      }
      return acc;
    },
  },
  methods: {
    exception(ctx) {
      return ctx?.invocation()?.parameters()?.getFormattedText();
    },
    blockInCatchBlock(ctx) {
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
