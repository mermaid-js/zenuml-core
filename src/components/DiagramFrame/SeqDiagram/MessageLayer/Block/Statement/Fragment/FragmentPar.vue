<template>
  <div
    :data-origin="origin"
    :data-left-participant="leftParticipant"
    :data-frame-padding-left="border.left"
    :data-frame-padding-right="border.right"
    class="fragment par border-skin-fragment rounded"
    :style="fragmentStyle"
  >
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
            name="par-fragment"
            icon-class="w-5 h-5 mr-1 text-skin-fragment-header"
          />
          <collapse-button
            label="Par"
            :collapsed="collapsed"
            @click="this.toggle"
            :style="commentObj.messageStyle"
            :class="commentObj.messageClassNames"
          />
        </label>
      </div>
    </div>
    <block
      v-if="!!par.braceBlock()"
      :origin="leftParticipant"
      :class="{ hidden: collapsed }"
      :style="{ paddingLeft: `${paddingLeft}px` }"
      :context="par.braceBlock().block()"
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
  name: "fragment-par",
  props: ["context", "comment", "commentObj", "number"],
  mixins: [fragment],
  computed: {
    par: function () {
      return this.context.par();
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
<style>
/* Knowledge: Shortcut version `border-top: 1px solid` will reset border-top-color to not specified.
   Then according to the spec, it will use text color for border-top-color.
   https://stackoverflow.com/a/8663547/529187
 */
.fragment.par > .block > .statement-container:not(:first-child) {
  border-top-color: inherit;
  border-top-width: 1px;
  border-top-style: solid;
}
</style>
