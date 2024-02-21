<template>
  <div
    class="fragment loop border-skin-fragment rounded"
    :style="fragmentStyle"
  >
    <comment v-if="comment" :comment="comment" :commentObj="commentObj" />
    <div
      class="header text-skin-fragment-header bg-skin-fragment-header text-base leading-4 relative"
    >
      <div
        v-if="numbering"
        class="absolute right-[100%] top-0 pr-1 group-hover:hidden text-gray-500 text-sm font-thin leading-6"
      >
        {{ number }}
      </div>
      <div class="name font-semibold p-1 border-b">
        <collapse-button
          label="Loop"
          :collapsed="collapsed"
          @click="this.toggle"
          :style="commentObj.messageStyle"
          :class="commentObj.messageClassNames"
        />
      </div>
    </div>
    <div :class="{ hidden: collapsed }">
      <div class="segment">
        <div class="text-skin-fragment">
          <label
            class="condition p-1"
            :class="{
              editable: editableMap.get(blockInLoop),
            }"
            :contenteditable="editableMap.get(blockInLoop)"
            @dblclick="handleDblClick(blockInLoop, $event)"
            @blur="handleBlur(blockInLoop, $event)"
            @keydown="handleKeydown($event)"
            @keyup="handleKeyup(blockInLoop, $event)"
          >
            {{
              editableMap.get(blockInLoop)
                ? conditionText
                : `[${conditionText}]`
            }}
          </label>
        </div>
        <block
          :style="{ paddingLeft: `${offsetX}px` }"
          :context="blockInLoop"
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
import { useConditionEdit } from "@/functions/useConditionEdit";

export default {
  name: "fragment-loop",
  props: ["context", "comment", "commentObj", "selfCallIndent", "number"],
  mixins: [fragment],
  setup(props) {
    const store = useStore();
    const numbering = computed(() => store.state.numbering);
    const from = computed(() => props.context.Origin());
    const loop = computed(() => props.context.loop());
    const blockInLoop = computed(() => loop.value?.braceBlock()?.block());
    const condition = computed(() => loop.value?.parExpr()?.condition());
    const conditionText = computed(() =>
      loop.value?.parExpr()?.condition()?.getFormattedText(),
    );

    const {
      editableMap,
      handleDblClick,
      handleBlur,
      handleKeydown,
      handleKeyup,
    } = useConditionEdit({
      blocks: [blockInLoop.value],
      getCondition: () => condition.value,
      getConditionText: () => conditionText.value,
    });

    return {
      numbering,
      from,
      loop,
      blockInLoop,
      conditionText,
      editableMap,
      handleDblClick,
      handleBlur,
      handleKeydown,
      handleKeyup,
    };
  },
};
</script>
<style scoped>
/* We need to do this because tailwind 3.2.4 set border-color to #e5e7eb via '*'. */
* {
  border-color: inherit;
}
.condition.editable {
  padding: 2px 6px;
  margin-left: 4px;
  cursor: text;
}
</style>
