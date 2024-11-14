<template>
  <!-- .point-events-none allows hover over the participant underneath (from lifeline layer)
       .point-events-auto allows hover over the messages (from message layer, default behaviour) -->
  <div
    :data-origin="origin1"
    class="interaction creation sync text-center transform"
    v-on:click.stop="onClick"
    :data-signature="signature"
    :class="{
      'right-to-left': rightToLeft,
      '-translate-x-full-minus-1': rightToLeft,
      highlight: isCurrent,
    }"
    :style="{ ...borderWidth, width: interactionWidth + 'px' }"
  >
    <comment v-if="comment" :commentObj="commentObj" />
    <!-- flex items-center is an idiom that vertically align items left and right.
     h-10 fixes the height as the same as participant boxes.-->
    <div
      ref="messageContainer"
      data-type="creation"
      class="message-container pointer-events-none flex items-center h-10 relative"
      :class="{ 'flex-row-reverse': rightToLeft }"
      :data-to="target"
    >
      <message
        ref="messageEl"
        class="invocation w-full transform -translate-y-1/2 pointer-events-auto"
        :context="creation"
        :content="signature"
        :rtl="rightToLeft"
        type="creation"
        :number="number"
        :classNames="messageClassNames"
        :textStyle="messageTextStyle"
      />
      <div
        ref="participantPlaceHolder"
        class="invisible right-0 flex flex-col justify-center flex-shrink-0"
      >
        <participant :entity="{ name: target }" />
      </div>
    </div>
    <occurrence
      :context="creation"
      class="pointer-events-auto"
      :participant="target"
      :number="number"
    />
    <message
      class="return transform -translate-y-full pointer-events-auto"
      v-if="assignee"
      :context="creation.creationBody().assignment()"
      :content="assignee"
      :rtl="!rightToLeft"
      type="return"
      :number="`${number}.${
        (creation.braceBlock()?.block().stat().length || 0) + 1
      }`"
      :classNames="messageClassNames"
      :textStyle="messageTextStyle"
    />
  </div>
</template>

<script type="text/babel">
import { mapGetters, mapState } from "vuex";
import Comment from "../Comment/Comment.vue";
import Message from "../Message/Message.vue";
import Occurrence from "../Interaction/Occurrence/Occurrence.vue";
import { CodeRange } from "@/parser/CodeRange";
import Participant from "../../../../../../../components/DiagramFrame/SeqDiagram/LifeLineLayer/Participant.vue";
import ArrowMixin from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/ArrowMixin";
import {
  LIFELINE_WIDTH,
  OCCURRENCE_BAR_SIDE_WIDTH,
} from "@/positioning/Constants";

export default {
  name: "creation",
  props: ["context", "comment", "commentObj", "selfCallIndent", "number"],
  mixins: [ArrowMixin],
  computed: {
    ...mapGetters(["cursor", "onElementClick", "distance2"]),
    ...mapState(["numbering"]),
    origin: function () {
      return this.origin1;
    },
    source() {
      return this.origin;
    },
    target() {
      return this.context?.creation()?.Owner();
    },
    creation() {
      return this.context.creation();
    },
    interactionWidth() {
      let safeOffset = this.selfCallIndent || 0;
      // Explanation of the formula:
      // px: 0 1 2 3 4 5 6 7 8
      // L     a           b
      // gap between a and b is [(b - a) - 1]
      return (
        Math.abs(this.distance2(this.origin, this.target) - safeOffset) -
        LIFELINE_WIDTH
      );
    },
    rightToLeft() {
      return this.distance2(this.origin, this.target) < 0;
    },
    signature() {
      return this.creation.SignatureText(false);
    },
    assignee() {
      function safeCodeGetter(context) {
        return (context && context.getFormattedText()) || "";
      }
      let assignment = this.creation.creationBody().assignment();
      if (!assignment) return "";
      let assignee = safeCodeGetter(assignment.assignee());
      const type = safeCodeGetter(assignment.type());
      return assignee + (type ? ":" + type : "");
    },
    isCurrent() {
      return this.creation.isCurrent(this.cursor);
    },
    messageTextStyle() {
      return this.commentObj?.messageStyle;
    },
    messageClassNames() {
      return this.commentObj?.messageClassNames;
    },
  },
  mounted() {
    this.layoutMessageContainer();
  },
  updated() {
    this.layoutMessageContainer();
  },
  methods: {
    layoutMessageContainer() {
      let _layoutMessageContainer = () => {
        if (!this.$refs.participantPlaceHolder || !this.$refs.messageContainer)
          return;
        const halfWidthOfPlaceholder =
          this.$refs["participantPlaceHolder"].offsetWidth / 2;
        // 100% width does not consider of the borders.
        this.$refs["messageContainer"].style.width = `calc(100% + ${
          halfWidthOfPlaceholder + OCCURRENCE_BAR_SIDE_WIDTH
        }px`;
        if (this.rightToLeft) {
          this.$refs["messageContainer"].style.transform = `translateX( ${-(
            halfWidthOfPlaceholder +
            OCCURRENCE_BAR_SIDE_WIDTH +
            LIFELINE_WIDTH
          )}px`;
        }
      };
      _layoutMessageContainer();
    },
    onClick() {
      this.onElementClick(CodeRange.from(this.context));
    },
  },
  components: {
    Participant,
    Comment,
    Occurrence,
    Message,
  },
};
</script>
<style scoped>
.-translate-x-full-minus-1 {
  transform: translateX(calc(-100% - 1px));
}
</style>
