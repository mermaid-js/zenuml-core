<template>
  <div
    :data-origin="origin"
    :data-left-participant="leftParticipant"
    :data-frame-padding-left="border.left"
    :data-frame-padding-right="border.right"
    class="fragment critical border-skin-fragment rounded"
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
          <label class="p-0 flex items-center">
            <Icon
              name="critical-fragment"
              icon-class="w-5 h-5 mr-1 text-skin-fragment-header"
            />
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
          :origin="leftParticipant"
          v-if="blockInCritical"
          :style="{ paddingLeft: `${paddingLeft}px` }"
          :context="blockInCritical"
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
import Numbering from "../../../Numbering.vue";
import Icon from "@/components/Icon/Icon.vue";

export default {
  name: "fragment-critical",
  components: { Numbering, Icon },
  props: ["context", "comment", "commentObj", "number"],
  mixins: [fragment],
  setup(props) {
    const critical = computed(() => props.context.critical());
    const braceBlock = computed(() => critical.value?.braceBlock());
    const atom = computed(() => critical.value?.atom()?.getFormattedText());
    const blockInCritical = computed(() => braceBlock.value?.block());

    const label = computed(() =>
      atom.value ? `Critical:${atom.value}` : "Critical",
    );

    return {
      label,
      braceBlock,
      blockInCritical,
    };
  },
};
</script>

<style scoped>
/* We need to do this because tailwind 3.2.4 set border-color to #e5e7eb via '*'. */
* {
  border-color: inherit;
}

.critical::before {
  position: absolute;
  content: "";
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border: 1px solid;
  pointer-events: none;
}

.critical .header::before {
  position: absolute;
  content: "";
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-bottom: 2px solid;
  pointer-events: none;
}
</style>
