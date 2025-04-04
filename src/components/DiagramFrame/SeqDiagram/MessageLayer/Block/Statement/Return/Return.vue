<template>
  <!-- .relative to allow left style -->
  <div
    class="interaction return relative"
    v-on:click.stop="onClick"
    data-type="return"
    :data-signature="signature"
    :data-origin="origin"
    :data-to="target"
    :data-source="source"
    :data-target="target"
    :class="{
      'right-to-left': rightToLeft,
      highlight: isCurrent,
    }"
    :style="{
      width: interactionWidth + 'px',
      transform: 'translateX(' + translateX + 'px)',
    }"
  >
    <comment v-if="comment" :commentObj="commentObj" />
    <div v-if="isSelf" class="flex items-center">
      <svg class="w-3 h-3 flex-shrink-0 fill-current m-1" viewBox="0 0 512 512">
        <path
          class="cls-1"
          d="M256 0C114.84 0 0 114.84 0 256s114.84 256 256 256 256-114.84 256-256S397.16 0 256 0Zm0 469.33c-117.63 0-213.33-95.7-213.33-213.33S138.37 42.67 256 42.67 469.33 138.37 469.33 256 373.63 469.33 256 469.33Z"
        />
        <path
          class="cls-1"
          d="M288 192h-87.16l27.58-27.58a21.33 21.33 0 1 0-30.17-30.17l-64 64a21.33 21.33 0 0 0 0 30.17l64 64a21.33 21.33 0 0 0 30.17-30.17l-27.58-27.58H288a53.33 53.33 0 0 1 0 106.67h-32a21.33 21.33 0 0 0 0 42.66h32a96 96 0 0 0 0-192Z"
        />
      </svg>
      <span class="name">{{ signature }}</span>
    </div>
    <Message
      v-if="!isSelf"
      :classNames="messageClassNames"
      :textStyle="messageTextStyle"
      :context="messageContext"
      :content="signature"
      :rtl="rightToLeft"
      type="return"
      :number="number"
    />
  </div>
</template>

<script type="text/babel">
// Return is defined with `RETURN expr? SCOL?` or `ANNOTATION_RET asyncMessage EVENT_END?`.
// It is rare that you need the latter format. Probably only when you have two consecutive returns.
import Comment from "../Comment/Comment.vue";
import Message from "../Message/Message.vue";
import { mapGetters } from "vuex";
import { CodeRange } from "@/parser/CodeRange";
import ArrowMixin from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/ArrowMixin";
import { DirectionMixin } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/DirectionMixin";
import { _STARTER_ } from "@/parser/OrderedParticipants";

export default {
  name: "return",
  props: ["context", "comment", "commentObj", "number"],
  mixins: [ArrowMixin, DirectionMixin],
  computed: {
    ...mapGetters(["cursor", "onElementClick"]),
    /**
     * ret
     *  : RETURN expr? SCOL?
     *  | ANNOTATION_RET asyncMessage EVENT_END?
     *  ;
     */
    ret: function () {
      return this.context?.ret();
    },
    asyncMessage: function () {
      return this.ret?.asyncMessage();
    },
    signature: function () {
      return (
        this.asyncMessage?.content()?.getFormattedText() ||
        this.context?.ret()?.expr()?.getFormattedText()
      );
    },
    source: function () {
      return this.asyncMessage?.From() || this.ret?.From() || _STARTER_;
    },
    target: function () {
      return (
        // TODO: move this logic to the parser (ReturnTo)
        this.asyncMessage?.to()?.getFormattedText() ||
        this.context?.ret()?.ReturnTo() ||
        _STARTER_
      );
    },
    isCurrent: function () {
      return false;
    },
    messageTextStyle() {
      return this.commentObj?.messageStyle;
    },
    messageClassNames() {
      return this.commentObj?.messageClassNames;
    },
    messageContext() {
      return this.asyncMessage?.content() || this.context?.ret()?.expr();
    },
  },
  methods: {
    onClick() {
      this.onElementClick(CodeRange.from(this.context));
    },
  },
  components: {
    Comment,
    Message,
  },
};
</script>

<style scoped>
.occurrence > .block > .statement-container:last-child > .interaction.return {
  /* It pulls up the parent's (.statement-container) bottom margin. */
  margin-bottom: -16px;
  bottom: -2px; /* The width of the border of the Occurrence */
}
</style>
