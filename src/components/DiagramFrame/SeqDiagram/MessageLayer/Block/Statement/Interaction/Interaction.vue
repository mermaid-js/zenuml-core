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
      :selfCallIndent="passOnOffset"
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

import { DirectionMixin } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/directionMixin";

export default {
  name: "interaction",
  props: [
    "context",
    "selfCallIndent",
    "commentObj",
    "number",
    // "inheritFromOccurrence",
  ],
  mixins: [ArrowMixin, DirectionMixin],
  computed: {
    // add tracker to the mapGetters
    ...mapGetters(["participants", "distance2", "cursor", "onElementClick"]),
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
    translateX: function () {
      // Normal flow
      if (!this.rightToLeft && !this.outOfBand) {
        return 0;
      }

      // ** Starting point is always the center of 'origin' **
      const moveTo = !this.rightToLeft ? this.source : this.target;
      const dist = this.distance2(this.origin, moveTo);
      const indent = this.selfCallIndent || 0;
      return dist - indent;
    },
    isCurrent: function () {
      return this.message?.isCurrent(this.cursor);
    },
    showStarter() {
      return this.participants.Starter()?.name !== _STARTER_;
    },
    isRootBlock() {
      // TODO: Add support for nested brace structures like { b { c.m() } }.
      return this.target === _STARTER_;
    },
    passOnOffset: function () {
      // selfCallIndent is introduced for sync self interaction. Each time we enter a self sync interaction the selfCallIndent
      // increases by 6px (half of the width of an execution bar). However, we set the selfCallIndent back to 0 when
      // it enters a non-self sync interaction.
      return this.isSelf && !this.isRootBlock
        ? (this.selfCallIndent || 0) + 7
        : 0;
    },
    interactionWidth: function () {
      if (this.context && this.isSelf) {
        return 0;
      }

      let safeOffset = this.outOfBand ? 0 : this.selfCallIndent || 0;
      return (
        Math.abs(this.distance2(this.source, this.target) - safeOffset) - 1
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
