<template>
  <div
    class="life-line-layer lifeline-layer z-30 absolute h-full flex flex-col top-0"
    :style="{
      'min-width': '200px',
      width: `calc(100% - ${leftGap}px)`,
      pointerEvents: renderParticipants ? 'none' : 'all',
    }"
  >
    <!--  header sticky blur effect, DON'T remove, gap + participant height = 72px  -->
    <div
      :style="{
        transform: `translateY(${translate > 0 ? translate - 1 : translate}px)`,
      }"
      class="pt-8 after:bg-gradient-to-b after:from-skin-frame after:via-skin-frame after:to-skin-frame/0 after:block after:absolute after:top-0 after:w-full after:h-[72px]"
    ></div>
    <div class="container relative grow">
      <life-line
        v-if="starterOnTheLeft"
        :entity="starterParticipant"
        class="starter"
        :class="{ invisible: invisibleStarter && !debug }"
        :renderParticipants="renderParticipants"
        :renderLifeLine="renderLifeLine"
      />
      <template v-for="(child, index) in explicitGroupAndParticipants">
        <life-line-group
          :key="index"
          v-if="child instanceof GroupContext"
          :context="child"
          :renderParticipants="renderParticipants"
        />
        <life-line
          :key="index"
          v-if="child instanceof ParticipantContext"
          :entity="getParticipantEntity(child)"
          :renderParticipants="renderParticipants"
          :renderLifeLine="renderLifeLine"
        />
      </template>
      <life-line
        v-for="entity in implicitParticipants"
        :key="entity.name"
        :entity="entity"
        :renderParticipants="renderParticipants"
        :renderLifeLine="renderLifeLine"
      />
    </div>
  </div>
</template>

<script>
import parentLogger from "../../../../logger/logger";
import { GroupContext, ParticipantContext, Participants } from "@/parser";
import { mapGetters, mapMutations, useStore } from "vuex";
import LifeLine from "./LifeLine.vue";
import LifeLineGroup from "./LifeLineGroup.vue";
const logger = parentLogger.child({ name: "LifeLineLayer" });

// TODO: remove the same logic
const PARTICIPANT_HEIGHT = 70;
const INTERSECTION_ERROR_MARGIN = 10; // a threshold for judging whether the participant is intersecting with the viewport
import { computed } from "vue";
import useIntersectionTop from "@/functions/useIntersectionTop";
import useDocumentScroll from "@/functions/useDocumentScroll";
import { getElementDistanceToTop } from "@/utils/dom";

export default {
  name: "life-line-layer",
  props: ["context", "renderParticipants", "renderLifeLine", "leftGap"],
  setup() {
    const participantOffsetTop = 0;
    const store = useStore();
    const intersectionTop = useIntersectionTop();
    const [scrollTop] = useDocumentScroll();
    const translate = computed(() => {
      let top = intersectionTop.value + scrollTop.value;
      if (
        intersectionTop.value > INTERSECTION_ERROR_MARGIN &&
        store?.state.stickyOffset
      )
        top += store?.state.stickyOffset;
      const diagramHeight = store?.state.diagramElement?.clientHeight || 0;
      const diagramTop = store?.state.diagramElement
        ? getElementDistanceToTop(store?.state.diagramElement)
        : 0;
      if (top <= participantOffsetTop + diagramTop) return 0;
      return (
        Math.min(top - diagramTop, diagramHeight - PARTICIPANT_HEIGHT) -
        participantOffsetTop
      );
    });
    return { translate };
  },
  computed: {
    ...mapGetters([
      "participants",
      "GroupContext",
      "ParticipantContext",
      "centerOf",
    ]),
    debug() {
      return !!localStorage.zenumlDebug;
    },
    invisibleStarter() {
      return this.starterParticipant.name === "_STARTER_";
    },
    starterParticipant() {
      return this.participants.Starter();
    },
    starterOnTheLeft() {
      return !this.starterParticipant.explicit;
    },
    implicitParticipants() {
      return this.participants.ImplicitArray();
    },
    explicitGroupAndParticipants() {
      return this.context?.children.filter((c) => {
        const isGroup = c instanceof GroupContext;
        const isParticipant = c instanceof ParticipantContext;
        return isGroup || isParticipant;
      });
    },
  },
  methods: {
    ...mapMutations(["increaseGeneration"]),
    getParticipantEntity(ctx) {
      return Participants(ctx).First();
    },
  },
  updated() {
    logger.debug("LifeLineLayer updated");
  },
  mounted() {
    logger.debug("LifeLineLayer mounted");
  },
  components: {
    LifeLine,
    LifeLineGroup,
  },
};
</script>
