<!--A Interaction-async component is to render:
1. A->B: non-self async message
2. A->A: self async message
-->
<template>
  <div
    class="interaction async"
    v-on:click.stop="onClick"
    :data-signature="signature"
    :class="{
      'to-occurrence': pointingToOccurrenceBar,
      'pointing-to-line': !pointingToOccurrenceBar,
      'left-to-right': !rightToLeft,
      'right-to-left': rightToLeft,
      'from-no-occurrence': !isTailAttachedToOccurrenceBar,
      highlight: isCurrent,
      'inited-from-occurrence': isTailAttachedToOccurrenceBar,
      'self-invocation': isSelf,
    }"
    :style="{
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
      :number="`${number}`"
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

function isNullOrUndefined(value) {
  return value === null || value === undefined;
}

export default {
  name: "interaction-async",
  props: ["context", "comment", "commentObj", "selfCallIndent", "number"],
  computed: {
    ...mapGetters(["distance", "cursor", "onElementClick"]),
    from: function () {
      return this.context.Origin();
    },
    asyncMessage: function () {
      return this.context?.asyncMessage();
    },
    interactionWidth: function () {
      if (this.isSelf) {
        const leftOfMessage = 100;
        const averageWidthOfChar = 10;
        return (
          averageWidthOfChar * (this.signature?.length || 0) + leftOfMessage
        );
      }
      return Math.abs(this.distance(this.target, this.source));
    },
    // Both 'left' and 'translateX' can be used to move the element horizontally.
    // Change it to use translate according to https://stackoverflow.com/a/53892597/529187.
    translateX: function () {
      return this.rightToLeft
        ? this.distance(this.target, this.from)
        : this.distance(this.source, this.from);
    },
    rightToLeft: function () {
      // to suppress  ATTR_FALSE_VALUE warning
      // Details: https://v3-migration.vuejs.org/breaking-changes/attribute-coercion.html
      return this.distance(this.target, this.source) < 0 ? true : null;
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
    providedFrom: function () {
      return this.context?.asyncMessage()?.From();
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
    pointingToOccurrenceBar() {
      return this.parentCtxIncludeMessage(this.asyncMessage);
    },
    isTailAttachedToOccurrenceBar: function () {
      return this.asyncMessage?.isInitedFromOccurrence(this.source);
    },
  },
  methods: {
    onClick() {
      this.onElementClick(CodeRange.from(this.context));
    },
    parentCtxIncludeMessage(current) {
      const target = current.Owner();

      if (!target) {
        return false;
      }

      current = current?.parentCtx;

      while (current) {
        if (current.To) {
          if (current.To() === target) {
            return true;
          }
        }
        current = current.parentCtx;
      }

      return false;
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

.interaction.pointing-to-line.left-to-right {
  border-right-width: 0;
}

.interaction.pointing-to-line.right-to-left {
  border-left-width: 0;
}

.interaction.to-occurrence.left-to-right {
  border-right-width: 7px;
}

.interaction.to-occurrence.right-to-left {
  border-left-width: 7px;
}

.interaction.async :deep(.message) {
  width: 100%;
}
</style>
