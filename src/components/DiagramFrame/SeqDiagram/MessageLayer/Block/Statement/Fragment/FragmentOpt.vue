<template>
  <div
    :data-origin="origin"
    :data-left-participant="leftParticipant"
    :data-frame-padding-left="border.left"
    :data-frame-padding-right="border.right"
    class="fragment opt border-skin-fragment rounded"
    :style="fragmentStyle"
  >
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
        <label class="p-0 flex items-center">
          <Icon
            name="opt-fragment"
            icon-class="w-5 h-5 mr-1 text-skin-fragment-header"
          />
          <collapse-button
            label="Opt"
            :collapsed="collapsed"
            @click="this.toggle"
            :style="commentObj.textStyle"
            :class="commentObj.classNames"
          />
        </label>
      </div>
    </div>
    <block
      :origin="leftParticipant"
      :class="{ hidden: collapsed }"
      :style="{ paddingLeft: `${paddingLeft}px` }"
      :context="opt?.braceBlock()?.block()"
      :number="`${number}.1`"
      incremental
    ></block>
  </div>
</template>

<script>
import fragment from "./FragmentMixin";
import Numbering from "../../../Numbering.vue";
import Icon from "@/components/Icon/Icon.vue";

export default {
  name: "fragment-opt",
  props: ["context", "comment", "commentObj", "number"],
  mixins: [fragment],
  computed: {
    opt: function () {
      return this.context.opt();
    },
  },
  components: {
    Numbering,
    Icon,
  },
};
</script>

<style scoped>
/* We need to do this because tailwind 3.2.4 set border-color to #e5e7eb via '*'. */
* {
  border-color: inherit;
}
</style>
