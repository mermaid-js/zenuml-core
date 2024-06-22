<template>
  <div
    class="fragment critical border-skin-fragment rounded relative"
    :style="fragmentStyle"
  >
    <div class="segment">
      <comment v-if="comment" :comment="comment" :commentObj="commentObj" />
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
          v-if="blockInCritical"
          :style="{ paddingLeft: `${offsetX}px` }"
          :context="blockInCritical"
          :selfCallIndent="selfCallIndent"
          :number="`number`"
        ></block>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
import fragment from "./FragmentMixin";

export default {
  name: "fragment-section",
  props: ["context", "comment", "selfCallIndent", "commentObj", "number"],
  mixins: [fragment],
  setup(props) {
    const store = useStore();
    const numbering = computed(() => store.state.numbering);
    const from = computed(() => props.context.Origin());
    const critical = computed(() => props.context.critical());
    const braceBlock = computed(() => critical.value?.braceBlock());
    const atom = computed(() => critical.value?.atom()?.getText());
    const blockInCritical = computed(() => braceBlock.value?.block());

    const label = computed(() =>
      atom.value ? `Critical:${atom.value}` : "Critical",
    );

    return {
      numbering,
      from,
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
}

.critical .header::before {
  position: absolute;
  content: "";
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-bottom: 2px solid;
}
</style>
