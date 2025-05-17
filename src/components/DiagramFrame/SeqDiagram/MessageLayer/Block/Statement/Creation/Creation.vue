<template>
  <div
    :data-origin="origin"
    :data-signature="signature"
    class="interaction creation sync"
    :class="{
      'right-to-left': rightToLeft,
      highlight: isCurrent,
    }"
    :style="{
      transform: 'translateX(' + translateX + 'px)',
      width: interactionWidth + 'px',
    }"
    v-on:click.stop="onClick"
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
        :style="{ width: `calc(100% - ${containerOffset}px)` }"
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
      v-if="assignee"
      class="return transform -translate-y-full pointer-events-auto"
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
import {
  LIFELINE_WIDTH,
  OCCURRENCE_BAR_SIDE_WIDTH,
} from "@/positioning/Constants";
import { DirectionMixin } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/DirectionMixin";

export default {
  name: "creation",
  props: ["context", "comment", "commentObj", "number"],
  mixins: [ArrowMixin, DirectionMixin],
  data() {
    return {
      participantWidth: 0,
    };
  },
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
    containerOffset() {
      return (
        this.participantWidth / 2 - OCCURRENCE_BAR_SIDE_WIDTH - LIFELINE_WIDTH
      );
    },
  },
  mounted() {
    this.updateParticipantWidth();
  },
  updated() {
    this.updateParticipantWidth();
    EventBus.emit("participant_set_top");
    console.log(`Updated message container for ${this.target}`);
  },
  methods: {
    getParticipantElement() {
      return document.querySelector(`[data-participant-id="${this.target}"]`);
    },
    updateParticipantWidth() {
      const participantElement = this.getParticipantElement();

      if (!participantElement) {
        console.error(`Could not find participant element for ${this.target}`);
        this.participantWidth = 0;
        return;
      }

      // Get the actual width from the DOM element
      this.participantWidth = participantElement.getBoundingClientRect().width;
      console.log(
        `Found participant element for ${this.target}, width: ${this.participantWidth}px`,
      );
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
