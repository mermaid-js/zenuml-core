<template>
  <div
    class="fragment section border-skin-fragment rounded"
    :style="fragmentStyle"
    :data-frame-padding-left="border.left"
    :data-frame-padding-right="border.right"
    :data-left-participant="leftParticipant"
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
          :selfCallIndent="selfCallIndent"
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
import capitalize from "lodash/capitalize";

export default {
  name: "fragment-section",
  props: ["context", "comment", "selfCallIndent", "commentObj", "number"],
  mixins: [fragment],
  setup(props) {
    const store = useStore();
    const numbering = computed(() => store.state.numbering);
    const from = computed(() => props.context.Origin());
    const section = computed(() => props.context.section());
    const braceBlock = computed(() => section.value?.braceBlock());
    const atom = computed(() => section.value?.atom()?.getFormattedText());
    const blockInSection = computed(() => braceBlock.value?.block());

    const label = computed(
      () => atom.value ?? capitalize(section.value.SECTION()),
    );

    return {
      numbering,
      from,
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
