<template>
  <div
    class="fragment bg-skin-frame border-skin-fragment relative rounded min-w-[140px] w-max py-4 px-2 flex justify-center items-center flex-col"
    :class="fragmentClass"
    :style="fragmentStyle"
  >
    <div
      class="header bg-skin-fragment-header text-skin-fragment-header leading-4 rounded-t absolute top-0 left-0"
    >
      <div
        v-if="numbering"
        class="absolute right-full top-0 pr-1 group-hover:hidden text-gray-500 font-thin leading-6"
      >
        {{ number }}
      </div>
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
      class="text-skin-title"
      :labelText="idLabel"
      :labelPosition="idPosition"
    />
  </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
import fragment from "./FragmentMixin";
import MessageLabel from "../../../MessageLabel.vue";

export default {
  name: "fragment-section",
  props: ["context", "comment", "selfCallIndent", "commentObj", "number"],
  components: {
    MessageLabel,
  },
  mixins: [fragment],
  setup(props) {
    const store = useStore();
    const numbering = computed(() => store.state.numbering);
    const from = computed(() => props.context.Origin());
    const params = computed(() => props.context.ref().ID());
    const id = computed(() => params.value?.[0]);
    const idLabel = computed(() => id.value?.getText() ?? "");
    const idPosition = computed(() => [
      id.value?.symbol.start,
      id.value?.symbol.stop,
    ]);
    const fragmentClass = computed(() => ({
      "pt-7": idLabel.value.length > 7 && params.value.length === 1, // lower the ref label to avoid collision with the header
    }));

    return {
      store,
      numbering,
      from,
      idLabel,
      idPosition,
      fragmentClass,
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
