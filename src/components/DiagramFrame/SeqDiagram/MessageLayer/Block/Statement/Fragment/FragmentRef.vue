<template>
  <div
    class="fragment bg-skin-frame border-skin-fragment relative rounded min-w-[140px] w-max py-4 px-2 flex justify-center items-center"
    :class="fragmentClass"
    :style="fragmentStyle"
  >
    <comment v-if="comment" :comment="comment" :commentObj="commentObj" />
    <div
      class="header bg-skin-fragment-header text-skin-fragment-header leading-4 rounded-t absolute top-0 left-0"
    >
      <div
        v-if="numbering"
        class="absolute right-full top-0 pr-1 group-hover:hidden text-gray-500 font-thin leading-6"
      >
        {{ number }}
      </div>
      <div class="text-skin-fragment w-12 absolute -top-[1px] -left-[1px]">
        <svg viewBox="0 0 51 31" xmlns="http://www.w3.org/2000/svg">
          <polygon
            points="0,0 50.5,0 50.5,20.5 40.5,30.5 0,30.5"
            fill="transparent"
            stroke="currentColor"
            stroke-width="1"
          />
          <text
            x="25"
            y="15"
            font-family="Arial, sans-serif"
            font-size="14"
            font-weight="bold"
            text-anchor="middle"
            dominant-baseline="middle"
            fill="currentColor"
          >
            Ref
          </text>
        </svg>
      </div>
    </div>
    <!-- <label class="text-skin-title">{{ label }}</label> -->
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
    const ref = computed(() => props.context.ref());
    const params = computed(() => ref.value.ID());
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
</style>
