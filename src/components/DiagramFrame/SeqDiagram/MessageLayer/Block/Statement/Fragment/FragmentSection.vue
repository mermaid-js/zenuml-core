<template>
  <div
    :data-origin="origin"
    :data-left-participant="leftParticipant"
    :data-frame-padding-left="border.left"
    :data-frame-padding-right="border.right"
    class="fragment section border-skin-fragment rounded"
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
              :label="label"
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
          <!-- Value -->
        </div>
        <block
          :origin="origin"
          v-if="blockInSection"
          :style="{ paddingLeft: `${offsetX}px` }"
          :context="blockInSection"
          :number="number"
        ></block>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import fragment from "./FragmentMixin";
import capitalize from "lodash/capitalize";
import Numbering from "../../../Numbering.vue";

export default {
  name: "fragment-section",
  props: ["context", "comment", "commentObj", "number"],
  mixins: [fragment],
  components: {
    Numbering,
  },
  setup(props) {
    const section = computed(() => props.context.section());
    const braceBlock = computed(() => section.value?.braceBlock());
    const atom = computed(() => section.value?.atom()?.getFormattedText());
    const blockInSection = computed(() => braceBlock.value?.block());

    const label = computed(() => atom.value ?? capitalize("section"));

    return {
      label,
      braceBlock,
      blockInSection,
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
