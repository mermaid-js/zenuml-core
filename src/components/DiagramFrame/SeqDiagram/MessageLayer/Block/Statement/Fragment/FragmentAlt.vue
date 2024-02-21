<template>
  <div class="fragment alt border-skin-fragment rounded" :style="fragmentStyle">
    <div class="segment">
      <comment v-if="comment" :comment="comment" :commentObj="commentObj" />
      <div
        class="header bg-skin-fragment-header text-skin-fragment-header text-base leading-4 rounded-t relative"
      >
        <div
          v-if="numbering"
          class="absolute right-[100%] top-0 pr-1 group-hover:hidden text-gray-500 text-sm font-thin leading-6"
        >
          {{ number }}
        </div>
        <div class="name font-semibold p-1 border-b text-sm">
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
          <!-- <label class="condition px-1 text-sm inline-block"
            :class="{
              editable: editableMap.get(ifBlock),
            }"
            :contenteditable="editableMap.get(ifBlock)"
            @dblclick="handleDblClick(ifBlock, $event)"
            @blur="handleBlur(ifBlock, $event)"
            @keyup="handleKeyup(ifBlock, $event)"
            @keydown="handleKeydown">
            {{
              editableMap.get(ifBlock)
              ? conditionTextFromIfElseBlock(ifBlock)
              : `[${conditionTextFromIfElseBlock(ifBlock)}]`
            }}
          </label> -->
          <EditableLabel
            :editable="editableMap.get(ifBlock)"
            :toggleEditable="(bool) => toggleEditable(ifBlock, bool)"
            :block="ifBlock"
            :getConditionFromBlock="conditionFromIfElseBlock"
          />
        </div>
        <block
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
            <EditableLabel
              :editable="editableMap.get(elseIfBlock)"
              :toggleEditable="(bool) => toggleEditable(elseIfBlock, bool)"
              :block="elseIfBlock"
              :getConditionFromBlock="conditionFromIfElseBlock"
            />
          </div>
          <block
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
import { computed, ref } from "vue";
import { useStore } from "vuex";
import fragment from "./FragmentMixin";
import { increaseNumber, blockLength } from "@/utils/Numbering";
import EditableLabel from "../../EditableLabel.vue";

export default {
  name: "fragment-alt",
  props: ["context", "comment", "selfCallIndent", "commentObj", "number"],
  mixins: [fragment],
  components: {
    EditableLabel,
  },
  setup(props) {
    const store = useStore();
    const editableMap = ref(new Map());
    const numbering = computed(() => store.state.numbering);
    const from = computed(() => props.context.Origin());
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

    // initialize editableMap
    editableMap.value.set(ifBlock.value, false);
    if (elseIfBlocks.value.length > 0) {
      elseIfBlocks.value.forEach((block) => {
        editableMap.value.set(block, false);
      });
    }

    function conditionFromIfElseBlock(block) {
      return block?.parExpr()?.condition();
    }

    function blockInElseIfBlock(block) {
      return block?.braceBlock()?.block();
    }

    function toggleEditable(block, editable) {
      editableMap.value.set(block, editable);
    }

    return {
      editableMap,
      numbering,
      from,
      alt,
      blockInIfBlock,
      ifBlock,
      elseIfBlocks,
      elseBlock,
      blockLengthAcc,
      toggleEditable,
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

.condition.editable {
  padding: 2px 6px;
  margin-left: 4px;
  cursor: text;
}
</style>
