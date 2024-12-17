<template>
  <div
    :data-origin="leftParticipant"
    :data-left-participant="leftParticipant"
    :data-frame-padding-left="border.left"
    :data-frame-padding-right="border.right"
    class="fragment bg-skin-frame border-skin-fragment relative rounded min-w-[140px] w-max py-4 px-2 flex justify-center items-center flex-col"
    :style="{ ...fragmentStyle, paddingLeft: `${paddingLeft}px` }"
  >
    <div
      class="header bg-skin-fragment-header text-skin-fragment-header leading-4 rounded-t absolute top-0 left-0"
    >
      <Numbering :number="number" />
      <comment
        v-if="commentObj.text"
        class="absolute -top-4 left-0"
        :comment="comment"
        :commentObj="commentObj"
      />
      <div class="text-skin-fragment relative w-9 h-8 -top-[1px] -left-[1px]">
        <div class="polygon-border absolute inset-0"></div>
        <div
          class="polygon-content bg-skin-frame text-skin-fragment-header absolute inset-[1px] flex flex-col items-center justify-center"
        >
          <span
            class="flex items-center justify-center font-semibold"
            :style="commentObj.messageStyle"
            :class="commentObj.messageClassNames"
          >
            Ref
          </span>
        </div>
      </div>
    </div>
    <MessageLabel
      class="text-skin-title mt-3 mb-2"
      :labelText="contentLabel"
      :labelPosition="contentPosition"
    />
  </div>
</template>

<script>
import { computed } from "vue";
import fragment from "./FragmentMixin";
import MessageLabel from "../../../MessageLabel.vue";
import Numbering from "../../../Numbering.vue";

export default {
  name: "fragment-section",
  props: ["context", "comment", "commentObj", "number"],
  components: {
    MessageLabel,
    Numbering,
  },
  mixins: [fragment],
  setup(props) {
    const content = computed(() => props.context.ref().Content());
    const contentLabel = computed(() => content.value?.getFormattedText());
    const contentPosition = computed(() => [
      content.value?.start.start,
      content.value?.stop.stop,
    ]);

    return {
      contentLabel,
      contentPosition,
    };
  },
};
</script>

<style scoped>
/* We need to do this because tailwind 3.2.4 set border-color to #e5e7eb via '*'. */
* {
  border-color: inherit;
}

[data-id="ref-label"]::after {
  content: "";
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 0 12px 12px;
  border-color: transparent transparent #ffffff transparent;
}

.polygon-border {
  /* This will be your border color */
  clip-path: polygon(0% 0%, 100% 0%, 100% 66%, 80% 100%, 0% 100%);
  background-color: var(
    --color-border-fragment,
    var(--color-border-frame, var(--color-border-base, #000))
  );
}

.polygon-content {
  /* This creates the border thickness */
  clip-path: polygon(0% 0%, 100% 0%, 100% 66%, 80% 100%, 0% 100%);
}
</style>
