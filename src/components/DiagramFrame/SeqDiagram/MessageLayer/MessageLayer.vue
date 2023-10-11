<!-- pr-24 to give space for the right most participant.
TODO: we may need to consider the width of self message on right most participant. -->
<template>
  <div class="message-layer relative z-30 pt-24 pb-10">
    <block :context="context" :style="{ 'padding-left': paddingLeft + 'px' }" />
    <StylePanel />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUpdated, defineAsyncComponent } from "vue";
import { useStore } from "vuex";
import parentLogger from "../../../../logger/logger";
const StylePanel = defineAsyncComponent(() => import("./StylePanel.vue"));

const logger = parentLogger.child({ name: "MessageLayer" });

defineProps<{
  context: any;
}>();
const store = useStore();
const participants = computed(() => store.getters.participants);
const centerOf = computed(() => store.getters.centerOf);
const paddingLeft = computed(() => {
  if (participants.value.Array().length >= 1) {
    const first = participants.value.Array().slice(0)[0].name;
    return centerOf.value(first);
  }
  return 0;
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

  .interaction.sync {
    /* This border width configuration make sure the content width is
       the same as from the source occurrence's right border to target
       occurrence's left boarder (boarder not inclusive).*/
    border-right-width: 7px;
  }

  .interaction.sync.right-to-left {
    /* This border width configuration make sure the content width is
       the same as from the source occurrence's right border to target
       occurrence's left boarder (boarder not inclusive).*/
    border-right-width: 0;
    border-left-width: 7px;
  }

  .interaction.inited-from-occurrence,
  .interaction.self-invocation {
    border-left-width: 7px;
  }

  .interaction.return {
    border-left-width: 7px;
    border-right-width: 7px;
  }

  .interaction.return-to-start {
    border-left-width: 0;
  }

  .interaction:hover {
    cursor: pointer;
  }

  .message {
    position: relative;
    /* positioning Point */
  }

  .message > .name {
    text-align: center;
  }

  .interaction.right-to-left > .occurrence {
    /* InteractionBorderWidth + (OccurrenceWidth-1)/2 */
    left: -14px;
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
