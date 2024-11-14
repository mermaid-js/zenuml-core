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
import { _STARTER_ } from "@/parser/OrderedParticipants";

function isNullOrUndefined(value) {
  return value === null || value === undefined;
}
/**
 * source, target, from, to, provided from, origin
 *
 * # target
 * "Message" is the core concept of the sequence diagram. It is a message that is sent from one participant to another.
 *
 * `target` is the participant that receives the message. When target is not in the DSL, it is not a valid message.
 *
 * # origin/source/from
 *
 * When the `target` receives a sync message, it automatically becomes the `origin` of child messages. By default,
 * the `origin` is the `source` or `from` of the child messages.
 *
 * There are two special cases:
 * a. Messages at root level do not have an `origin` specified in DSL. Their `origin` is always _STARTER_.
 * b. Messages can also have arbitrarily specified `source` in the DSL. This is called "provided from".
 *    This does not change the `origin`. If origin != source, the message is called "out-of-band".
 *
 * `source` and `from` are the same.
 *
 * origin = ctx.Origin() || _STARTER_
 * source = providedSource || origin
 * target = target
 *
 * outOfBand = source != origin
 *
 * ## common cases
 * code                               | source/from    | target/to  | provided source | origin     | out-of-band
 * A.method()                           _STARTER_        A            null            _STARTER_
 * A->B.method()                        A                B            A               A
 * A->B: message                        A                B            A               A
 * A.method() {
 *   B.method()                         A                B            null            A
 * }
 *
 * a()                                 _STARTER_         _STARTER_    null            _STARTER_
 * a() {                               _STARTER_         _STARTER_    null            _STARTER_
 *   b()                               _STARTER_         _STARTER_    null            _STARTER_
 *   A.method()                        _STARTER_         A            null            _STARTER_
 * }
 *
 * if(x) {
 *   a()                               _STARTER_         _STARTER_    null            _STARTER_
 * }
 *
 * A.method() {
 *   self() {
 *     B.method()                         A                B            null           A
 *     B->B.method()                      B                B            B              A            true
 *     B->B: message                      B                B            B              A            true
 *     B->C.method()                      B                C            B              A            true
 *     B->C: message                      B                C            B              A            true
 *   }
 * }
 */

export default {
  name: "interaction-async",
  props: ["context", "comment", "commentObj", "selfCallIndent", "number"],
  mixins: [ArrowMixin],
  computed: {
    ...mapGetters(["distance", "cursor", "onElementClick"]),
    asyncMessage: function () {
      return this.context?.asyncMessage();
    },
    outOfBand: function () {
      return this.source !== this.origin;
    },
    interactionWidth: function () {
      if (this.isSelf) {
        // TODO: do we need to calculate the width of the self call? If we do, we should use WidthProvider.
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
      if (!this.outOfBand && !this.rightToLeft) {
        return 0;
      }
      let safeOffset = this.selfCallIndent || 0;
      return this.rightToLeft
        ? this.distance(this.target, this.origin) - safeOffset
        : this.distance(this.source, this.origin) - safeOffset;
    },
    rightToLeft: function () {
      return this.distance(this.target, this.source) < 0;
    },
    signature: function () {
      return this.asyncMessage?.content()?.getFormattedText();
    },
    origin: function () {
      return this.context?.Origin() || _STARTER_;
    },
    providedSource: function () {
      return this.asyncMessage?.ProvidedFrom();
    },
    source: function () {
      return this.providedSource || this.origin;
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
