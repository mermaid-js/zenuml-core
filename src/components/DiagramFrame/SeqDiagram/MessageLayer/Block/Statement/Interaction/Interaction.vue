<template>
  <div
    class="interaction sync inline-block"
    v-on:click.stop="onClick"
    :data-to="target"
    :data-origin="origin"
    :data-source="source"
    :data-target="target"
    :data-origin-offset="originOffset"
    :data-source-offset="sourceOffset"
    :data-target-offset="targetOffset"
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

export default {
  name: "interaction",
  props: ["context", "commentObj", "number"],
  mixins: [ArrowMixin, DirectionMixin],
  computed: {
    // add tracker to the mapGetters
    ...mapGetters(["participants", "cursor", "onElementClick", "centerOf"]),
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
    targetOffset: function () {
      const length = this.context.getAncestors((ctx) => {
        if (this.isSync(ctx)) {
          return ctx.Owner() === this.target;
        }
        return false;
      }).length;
      return length * 7;
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
      const destination = !this.rightToLeft
        ? this.anchorSource
        : this.anchorTarget;
      return this.anchorOrigin.calculateEdgeOffset(destination);
    },
    isCurrent: function () {
      return this.message?.isCurrent(this.cursor);
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
