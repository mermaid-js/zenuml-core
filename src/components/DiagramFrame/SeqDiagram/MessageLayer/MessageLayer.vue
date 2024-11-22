<!-- pr-24 to give space for the right most participant.
TODO: we may need to consider the width of self message on right most participant. -->
<template>
  <div class="message-layer relative z-30 pt-24 pb-10">
    <block
      v-if="!!origin"
      :context="context"
      :style="{ 'padding-left': paddingLeft + 'px' }"
      :origin="origin"
    />
    <StylePanel />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, onUpdated } from "vue";
import { useStore } from "vuex";
import parentLogger from "../../../../logger/logger";
import { AllMessages } from "@/parser/MessageCollector";
import { _STARTER_ } from "@/parser/OrderedParticipants";

// @ts-ignore
const StylePanel = defineAsyncComponent(() => import("./StylePanel.vue"));

const logger = parentLogger.child({ name: "MessageLayer" });
defineProps<{
  context: any;
}>();
const store = useStore();
const centerOf = computed(() => store.getters.centerOf);
const rootContext = computed(() => store.getters.rootContext);
const paddingLeft = computed(() => {
  return centerOf.value(origin.value) + 1;
});

const origin = computed(() => {
  const ownableMessages = AllMessages(rootContext.value);
  if (ownableMessages.length === 0) return null;
  return ownableMessages[0].from || _STARTER_;
});

onMounted(() => {
  logger.debug("MessageLayer mounted");
});
onUpdated(() => {
  logger.debug("MessageLayer updated");
});
</script>

<style lang="scss">
.zenuml {
  /* Avoid moving interaction to the left or right with margins.
  We can always assume that an interaction's border is the lifeline.
  Moving content with padding is OK.
  Don't move this to the Interaction component. This is also used by Interaction-async
   */
  .interaction {
    /*Keep dashed or solid here otherwise no space is given to the border*/
    border: dashed transparent 0;
  }

  .interaction:hover {
    cursor: pointer;
  }

  .message {
    position: relative;
    /* positioning Point */
  }

  .interaction.right-to-left > .occurrence {
    /* InteractionBorderWidth + (OccurrenceWidth-1)/2 */
    left: -15px;
    /* overlay occurrence bar on the existing bar. */
  }

  .interaction.self > .occurrence {
    /* width of InteractionBorderWidth 7px + lifeline center 1px */
    /* overlay occurrence bar on the existing bar. */
    left: -8px;
    margin-top: -10px;
  }

  .fragment {
    border-width: 1px;
    margin: 8px 0 0 0;
    padding-bottom: 10px;
  }

  .fragment .fragment {
    margin: 16px 0 0 0;
  }
}
</style>
