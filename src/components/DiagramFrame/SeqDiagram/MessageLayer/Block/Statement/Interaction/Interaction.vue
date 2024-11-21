<template>
  <div
    class="interaction sync inline-block"
    v-on:click.stop="onClick"
    :data-origin="origin"
    :data-to="target"
    :data-source="source"
    :data-target="target"
    data-type="interaction"
    :data-signature="signature"
    :class="{
      highlight: isCurrent,
      self: isSelf,
      'right-to-left': rightToLeft,
    }"
    :style="{
      ...borderWidth,
      width: isSelf ? undefined : interactionWidth + 'px',
      transform: 'translateX(' + translateX + 'px)',
    }"
  >
    <!--Known limitation: `if(x) { m }` not showing source occurrence. -->
    <div
      v-if="(showStarter && isRootBlock) || outOfBand"
      class="occurrence source border-2"
      :class="{ 'right-to-left': rightToLeft }"
    ></div>
    <comment v-if="hasComment" :commentObj="commentObj" />
    <self-invocation
      v-if="isSelf"
      :classNames="messageClassNames"
      :textStyle="messageTextStyle"
      :context="message"
      :number="number"
    />
    <message
      v-else
      class="text-center"
      :classNames="messageClassNames"
      :textStyle="messageTextStyle"
      :context="message"
      :content="signature"
      :rtl="rightToLeft"
      type="sync"
      :number="number"
    />
    <occurrence
      :context="message"
      :participant="target"
      :rtl="rightToLeft"
      :number="number"
    />
    <message
      v-if="assignee && !isSelf"
      class="return transform -translate-y-full"
      :context="message"
      :content="assignee"
      :rtl="!rightToLeft"
      type="return"
      :number="`${number}.${
        (message.braceBlock()?.block().stat().length || 0) + 1
      }`"
      :classNames="messageClassNames"
      :textStyle="messageTextStyle"
    />
  </div>
</template>

<script type="text/babel">
import Comment from "../Comment/Comment.vue";
import Occurrence from "./Occurrence/Occurrence.vue";
import Message from "../Message/Message.vue";
import { mapGetters } from "vuex";
import SelfInvocation from "./SelfInvocation/SelfInvocation.vue";
import { CodeRange } from "@/parser/CodeRange";
import ArrowMixin from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/ArrowMixin";
import { _STARTER_ } from "@/parser/OrderedParticipants";

import { DirectionMixin } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/DirectionMixin";
import sequenceParser from "@/generated-parser/sequenceParser";
import Anchor from "@/positioning/Anchor";
import { LIFELINE_WIDTH } from "@/positioning/Constants";

export default {
  name: "interaction",
  props: [
    "context",
    "commentObj",
    "number",
    // "inheritFromOccurrence",
  ],
  mixins: [ArrowMixin, DirectionMixin],
  computed: {
    // add tracker to the mapGetters
    ...mapGetters([
      "participants",
      "distance2",
      "cursor",
      "onElementClick",
      "centerOf",
    ]),
    hasComment() {
      return this.commentObj?.text !== "";
    },
    messageTextStyle() {
      return this.commentObj?.messageStyle;
    },
    messageClassNames() {
      return this.commentObj?.messageClassNames;
    },
    message: function () {
      return this.context?.message();
    },
    source: function () {
      return this.message?.From() || _STARTER_;
    },
    target: function () {
      return this.context?.message()?.Owner() || _STARTER_;
    },
    outOfBand: function () {
      return !!this.source && this.source !== this.origin;
    },
    assignee: function () {
      let assignment = this.message?.Assignment();
      if (!assignment) return "";
      return assignment.getText();
    },
    signature: function () {
      return this.message?.SignatureText();
    },
    anchorOrigin: function () {
      return new Anchor(this.centerOf(this.origin), this.originOffset);
    },
    anchorSource: function () {
      return new Anchor(this.centerOf(this.source), this.sourceOffset);
    },
    anchorTarget: function () {
      return new Anchor(this.centerOf(this.target), this.targetOffset);
    },
    translateX: function () {
      const destination = !this.rightToLeft
        ? this.anchorSource
        : this.anchorTarget;
      return this.anchorOrigin.calculateEdgeOffset(destination);
    },
    isCurrent: function () {
      return this.message?.isCurrent(this.cursor);
    },
    showStarter() {
      return this.participants.Starter()?.name !== _STARTER_;
    },
    isRootBlock() {
      return this.borderWidth.borderLeftWidth === "0px";
    },
    /**
     * The offset is to make sure the sub-occurrence bar is not fully layered
     * on top of the main occurrence bar. To achieve this, whenever a participant
     * is re-entered, the offset increases by 7px.
     *
     * There are two ways to re-enter a participant:
     *
     * 1. A.m { s }
     * 2. B A A.m { B->A.m }
     *
     * #1 is the most common case.
     *
     * If each Interaction keeps a stack of participants, we would be able to know
     * the depth of the stack on one given participant. This would allow us to
     * calculate the offset.
     * For example,
     *
     *                          stack       offset S     offset A         offset B
     * A.m                      [A]         0            0                NA
     * A->B.m                   [B]         NA           NA               7
     * A.m { s }                [A A]       0            7                NA
     * A.m { s { s } }          [A A A]     0            14               NA
     * A.m { s { B.m } }        [A A B]     0            14               7
     * A.m { B->A.m }           [A A]       0            14               NA
     * A.m { B.m { A.m } }      [A B A]     0            14               7
     * B A A.m { B->A.m }       [A A]       0            14               NA
     *
     * If offset is NA, it is effectively 0.
     *
     * There are two ways to implement this:
     * 1. Keep a stack of participants in the Interaction component.
     * 2. Calculate the stack depth from the context.
     *
     * The latter is more testable.
     *
     * The API should be like this:
     * const n: number = this.context?.stackDepth(this.source);
     */
    originOffset: function () {
      const length = this.context.getAncestors((ctx) => {
        if (this.isSync(ctx)) {
          return ctx.Owner() === this.origin;
        }
        return false;
      }).length;
      if (length === 0) return 0;
      return (length - 1) * 7;
    },
    sourceOffset: function () {
      const length = this.context.getAncestors((ctx) => {
        if (this.isSync(ctx)) {
          return ctx.Owner() === this.source;
        }
        return false;
      }).length;
      if (length === 0) return 0;
      return (length - 1) * 7;
    },
    targetOffset: function () {
      const length = this.context.getAncestors((ctx) => {
        if (this.isSync(ctx)) {
          return ctx.Owner() === this.target;
        }
        return false;
      }).length;
      return length * 7;
    },
    interactionWidth: function () {
      return (
        Math.abs(this.anchorSource.calculateEdgeOffset(this.anchorTarget)) -
        LIFELINE_WIDTH
      );
    },
    isSelf: function () {
      // this.to === undefined if it is a self interaction and root message.
      return !this.target || this.target === this.source;
    },
  },
  methods: {
    onClick() {
      this.onElementClick(CodeRange.from(this.context));
    },
    isSync(ctx) {
      const isMessageContext = ctx instanceof sequenceParser.MessageContext;
      const isCreationContext = ctx instanceof sequenceParser.CreationContext;
      return isMessageContext || isCreationContext;
    },
  },
  components: {
    Message,
    SelfInvocation,
    Comment,
    Occurrence,
  },
};
</script>
<style scoped>
.interaction .occurrence.source {
  position: absolute;
  height: calc(100% + 14px);
  left: -12px;
  display: none;
}

.interaction .occurrence.source.right-to-left {
  left: unset;
  right: -13px;
}
</style>
