<!--A Interaction-async component is to render:
1. A->B: non-self async message
2. A->A: self async message
-->
<template>
  <div
    :data-origin="origin"
    :data-out-of-band="outOfBand"
    class="interaction async"
    v-on:click.stop="onClick"
    :data-signature="signature"
    :class="{
      'left-to-right': !rightToLeft,
      'right-to-left': rightToLeft,
      highlight: isCurrent,
      'self-invocation': isSelf,
    }"
    :style="{
      ...borderWidth,
      width: interactionWidth + 'px',
      transform: 'translateX(' + translateX + 'px)',
    }"
  >
    <comment v-if="comment" :commentObj="commentObj" />
    <self-invocation-async
      v-if="isSelf"
      :classNames="messageClassNames"
      :textStyle="messageTextStyle"
      :context="asyncMessage"
      :number="number"
    />
    <message
      v-else
      :classNames="messageClassNames"
      :textStyle="messageTextStyle"
      :context="asyncMessage"
      :content="signature"
      :rtl="rightToLeft"
      type="async"
      :number="number"
    />
  </div>
</template>

<script type="text/babel">
import Comment from "../Comment/Comment.vue";
import SelfInvocationAsync from "./SelfInvocationAsync/SelfInvocation-async.vue";
import Message from "../Message/Message.vue";
import { mapGetters } from "vuex";
import { CodeRange } from "@/parser/CodeRange";
import ArrowMixin from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/ArrowMixin";
import { LIFELINE_WIDTH } from "@/positioning/Constants";

function isNullOrUndefined(value) {
  return value === null || value === undefined;
}

export default {
  name: "interaction-async",
  props: ["context", "comment", "commentObj", "selfCallIndent", "number"],
  mixins: [ArrowMixin],
  computed: {
    ...mapGetters(["distance", "cursor", "onElementClick"]),
    from: function () {
      return this.context.Origin();
    },
    asyncMessage: function () {
      return this.context?.asyncMessage();
    },
    outOfBand: function () {
      return this.source !== this.origin;
    },
    interactionWidth: function () {
      if (this.isSelf) {
        const leftOfMessage = 100;
        const averageWidthOfChar = 10;
        return (
          averageWidthOfChar * (this.signature?.length || 0) + leftOfMessage
        );
      }
      let safeOffset = this.outOfBand ? 0 : this.selfCallIndent || 0;

      return (
        Math.abs(this.distance(this.target, this.source) - safeOffset) -
        LIFELINE_WIDTH
      );
    },
    // Both 'left' and 'translateX' can be used to move the element horizontally.
    // Change it to use translate according to https://stackoverflow.com/a/53892597/529187.
    translateX: function () {
      if (!this.from) {
        return 0;
      }
      let safeOffset = this.outOfBand ? this.selfCallIndent || 0 : 0;
      return this.rightToLeft
        ? this.distance(this.target, this.from)
        : this.distance(this.source, this.from) - safeOffset;
    },
    rightToLeft: function () {
      return this.distance(this.target, this.source) < 0;
    },
    signature: function () {
      return this.asyncMessage?.content()?.getFormattedText();
    },
    source: function () {
      return this.asyncMessage?.from()?.getFormattedText() || this.from;
    },
    target: function () {
      return this.asyncMessage?.to()?.getFormattedText();
    },
    isCurrent: function () {
      const start = this.asyncMessage.start.start;
      const stop = this.asyncMessage.stop.stop + 1;
      if (
        isNullOrUndefined(this.cursor) ||
        isNullOrUndefined(start) ||
        isNullOrUndefined(stop)
      )
        return false;
      return this.cursor >= start && this.cursor <= stop;
    },
    isSelf: function () {
      return this.source === this.target;
    },
    origin: function () {
      return this.context?.Origin();
    },
    messageTextStyle() {
      return this.commentObj?.messageStyle;
    },
    messageClassNames() {
      return this.commentObj?.messageClassNames;
    },
  },
  methods: {
    onClick() {
      this.onElementClick(CodeRange.from(this.context));
    },
  },
  components: {
    Comment,
    SelfInvocationAsync,
    Message,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.interaction .invisible-occurrence {
  height: 20px;
}

.interaction.async :deep(.message) {
  width: 100%;
}
</style>
