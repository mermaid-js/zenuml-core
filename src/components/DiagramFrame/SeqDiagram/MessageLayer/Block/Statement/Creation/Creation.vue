<template>
  <!-- .point-events-none allows hover over the participant underneath (from lifeline layer)
       .point-events-auto allows hover over the messages (from message layer, default behaviour) -->
  <div
    :data-origin="origin"
    class="interaction creation sync text-center transform"
    v-on:click.stop="onClick"
    :data-signature="signature"
    :class="{
      'right-to-left': rightToLeft,
      '-translate-x-full-minus-1': rightToLeft,
      highlight: isCurrent,
    }"
    :style="{
      transform: 'translateX(' + translateX + 'px)',
      width: interactionWidth + 'px',
    }"
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
      :number="`${number}.${creation.Statements().length + 1}`"
      :classNames="messageClassNames"
      :textStyle="messageTextStyle"
    />
  </div>
</template>

<script type="text/babel">
import { mapGetters, mapState } from "vuex";
import { EventBus } from "@/EventBus";
import Comment from "../Comment/Comment.vue";
import Message from "../Message/Message.vue";
import Occurrence from "../Interaction/Occurrence/Occurrence.vue";
import { CodeRange } from "@/parser/CodeRange";
import ArrowMixin from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/ArrowMixin";
import { OCCURRENCE_BAR_SIDE_WIDTH } from "@/positioning/Constants";
import { DirectionMixin } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/DirectionMixin";

export default {
  name: "creation",
  props: ["context", "comment", "commentObj", "number"],
  mixins: [ArrowMixin, DirectionMixin],
  computed: {
    ...mapGetters([
      "cursor",
      "onElementClick",
      "distance2",
      "centerOf",
      "coordinates",
    ]),
    ...mapState(["numbering"]),
    source() {
      return this.origin;
    },
    target() {
      return this.creation?.Owner();
    },
    creation() {
      return this.context?.creation();
    },
    signature() {
      return this.creation?.SignatureText();
    },
    assignee() {
      function safeCodeGetter(context) {
        return (context && context.getFormattedText()) || "";
      }
      let assignment = this.creation?.creationBody().assignment();
      if (!assignment) return "";
      let assignee = safeCodeGetter(assignment.assignee());
      const type = safeCodeGetter(assignment.type());
      return assignee + (type ? ":" + type : "");
    },
    isCurrent() {
      return this.creation?.isCurrent(this.cursor);
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
    EventBus.emit("participant_set_top");
    console.log(`Updated message container for ${this.target}`);
  },
  methods: {
    layoutMessageContainer() {
      const participantElement = document.querySelector(
        `[data-participant-id="${this.target}"]`,
      );

      if (participantElement) {
        // Get the actual width from the DOM element
        const participantWidth =
          participantElement.getBoundingClientRect().width;
        const halfWidthOfParticipant = participantWidth / 2;
        console.log(
          `Found participant element for ${this.target}, width: ${participantWidth}px`,
        );
        const offset = halfWidthOfParticipant - OCCURRENCE_BAR_SIDE_WIDTH;
        this.$refs["messageContainer"].style.width = `calc(100% - ${offset}px)`;

        if (this.rightToLeft) {
          this.$refs[
            "messageContainer"
          ].style.transform = `translateX( ${offset}px)`;
        } else {
          // A B.m {new A} => A B.m {new A1}
          this.$refs["messageContainer"].style.transform = `translateX(0px)`;
        }
      } else {
        console.error(`Could not find participant element for ${this.target}`);
      }
    },
    onClick() {
      this.onElementClick(CodeRange.from(this.context));
    },
  },
  components: {
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
