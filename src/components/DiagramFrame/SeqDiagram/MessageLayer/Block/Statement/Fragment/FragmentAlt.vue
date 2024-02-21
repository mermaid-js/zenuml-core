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
          <label
            class="condition px-1 text-sm inline-block"
            :class="{
              editable: editableMap.get(ifBlock),
            }"
            :contenteditable="editableMap.get(ifBlock)"
            @dblclick="handleDblClick(ifBlock, $event)"
            @blur="handleBlur(ifBlock, $event)"
            @keyup="handleKeyup(ifBlock, $event)"
            @keydown="handleKeydown"
          >
            {{
              editableMap.get(ifBlock)
                ? conditionTextFromIfElseBlock(ifBlock)
                : `[${conditionTextFromIfElseBlock(ifBlock)}]`
            }}
          </label>
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
            <label
              class="condition px-1"
              :class="{
                editable: editableMap.get(elseIfBlock),
              }"
              :contenteditable="editableMap.get(elseIfBlock)"
              @dblclick="handleDblClick(elseIfBlock, $event)"
              @blur="handleBlur(elseIfBlock, $event)"
              @keyup="handleKeyup(elseIfBlock, $event)"
              @keydown="handleKeydown"
            >
              {{
                editableMap.get(elseIfBlock)
                  ? conditionTextFromIfElseBlock(elseIfBlock)
                  : `[${conditionTextFromIfElseBlock(elseIfBlock)}]`
              }}
            </label>
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
import { ref, computed, nextTick } from "vue";
import { useStore } from "vuex";
import fragment from "./FragmentMixin";
import { increaseNumber, blockLength } from "@/utils/Numbering";

export default {
  name: "fragment-alt",
  props: ["context", "comment", "selfCallIndent", "commentObj", "number"],
  mixins: [fragment],
  setup(props) {
    const store = useStore();
    const editableMap = ref(new Map());
    const conditionLabel = ref(null);
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
    const code = computed(() => store.getters.code);
    const onContentChange = computed(
      () => store.getters.onContentChange || (() => {}),
    );

    // Set the initial value of the editableMap
    editableMap.value.set(ifBlock.value, false);

    if (elseIfBlocks.value.length > 0) {
      elseIfBlocks.value.forEach((block) => {
        editableMap.value.set(block, false);
      });
    }

    function toggleEditable(block, editable) {
      editableMap.value.set(block, editable);
    }

    function conditionFromIfElseBlock(ctx) {
      return ctx?.parExpr()?.condition();
    }

    function conditionTextFromIfElseBlock(ctx) {
      return conditionFromIfElseBlock(ctx)?.getFormattedText();
    }

    function blockInElseIfBlock(ctx) {
      return ctx?.braceBlock()?.block();
    }

    function updateCode(code) {
      store.dispatch("updateCode", { code });
      onContentChange.value(code);
    }

    async function handleDblClick(block, e) {
      e.preventDefault();
      e.stopPropagation();
      toggleEditable(block, true);

      await nextTick();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(e.target);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    async function handleBlur(block, e) {
      // avoid race condition with keyup event
      await nextTick();
      if (!editableMap.value.get(block)) return;
      replaceConditionText(block, e);
    }

    function handleKeydown(e) {
      // prevent new line
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    function handleKeyup(block, e) {
      if (e.key === "Enter" || e.key === "Escape" || e.key === "Tab") {
        replaceConditionText(block, e);
      }
    }

    function replaceConditionText(block, event) {
      toggleEditable.call(block, false);
      event.preventDefault();
      event.stopPropagation();

      let newText = event.target.innerText.trim();

      // if text is empty, we need to replace it with the original condition text
      if (newText === "") {
        event.target.innerText = conditionTextFromIfElseBlock(block);
        return;
      }

      // if text has empty spaces, we need to wrap it with double quotes
      if (newText.includes(" ")) {
        newText = newText.replace(/"/g, "");
        newText = `"${newText}"`;
      }

      const condition = conditionFromIfElseBlock(block);
      const [start, end] = [condition?.start?.start, condition?.stop?.stop];
      updateCode(
        code.value.slice(0, start) + newText + code.value.slice(end + 1),
      );
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
      conditionLabel,
      toggleEditable,
      conditionFromIfElseBlock,
      conditionTextFromIfElseBlock,
      blockInElseIfBlock,
      increaseNumber,
      blockLength,
      handleKeydown,
      handleKeyup,
      handleBlur,
      handleDblClick,
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
