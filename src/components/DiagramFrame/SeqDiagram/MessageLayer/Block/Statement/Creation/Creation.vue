<template>
  <!-- .point-events-none allows hover over the participant underneath (from lifeline layer)
       .point-events-auto allows hover over the messages (from message layer, default behaviour) -->
  <div
    class="interaction creation sync text-center transform"
    v-on:click.stop="onClick"
    :data-signature="signature"
    :class="{
      'right-to-left': rightToLeft,
      '-translate-x-full': rightToLeft,
      highlight: isCurrent,
      'inited-from-occurrence': isInitedFromOccurrence,
    }"
    :style="{ width: interactionWidth + 'px' }"
  >
    <comment v-if="comment" :commentObj="commentObj" />
    <!-- flex items-center is an idiom that vertically align items left and right.
     h-10 fixes the height as the same as participant boxes.-->
    <div
      ref="messageContainer"
      data-type="creation"
      class="message-container pointer-events-none flex items-center h-10 relative"
      :class="{ 'flex-row-reverse': rightToLeft }"
      :data-to="to"
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
        <participant :entity="{ name: to }" />
      </div>
    </div>
    <occurrence :context="creation" class="pointer-events-auto" :participant="to" :number="number" />
    <message
      class="return transform -translate-y-full pointer-events-auto"
      v-if="assignee"
      :context="creation.creationBody().assignment()"
      :content="assignee"
      :rtl="!rightToLeft"
      type="return"
      :number="`${number}.${(creation.braceBlock()?.block().stat().length || 0) + 1}`"
    />
  </div>
</template>

<script type="text/babel">
import parentLogger from '../../../../../../../logger/logger';

import { mapGetters, mapState } from 'vuex';
import Comment from '../Comment/Comment.vue';
import Message from '../Message/Message.vue';
import Occurrence from '../Interaction/Occurrence/Occurrence.vue';
import { CodeRange } from '../../../../../../../parser/CodeRange';
import Participant from '../../../../../../../components/DiagramFrame/SeqDiagram/LifeLineLayer/Participant.vue';

const logger = parentLogger.child({ name: 'Creation' });

export default {
  name: 'creation',
  props: ['context', 'comment', 'commentObj', 'selfCallIndent', 'number'],
  computed: {
    ...mapGetters(['cursor', 'onElementClick', 'distance']),
    ...mapState(['numbering']),
    from() {
      return this.context.Origin();
    },
    creation() {
      return this.context.creation();
    },
    interactionWidth() {
      let distance = Math.abs(this.distance(this.to, this.from));
      let safeOffset = this.selfCallIndent || 0;
      return distance + (this.rightToLeft ? safeOffset : -safeOffset);
    },
    rightToLeft() {
      return this.distance(this.to, this.from) < 0;
    },
    signature() {
      return this.creation.SignatureText();
    },
    assignee() {
      function safeCodeGetter(context) {
        return (context && context.getFormattedText()) || '';
      }
      let assignment = this.creation.creationBody().assignment();
      if (!assignment) return '';
      let assignee = safeCodeGetter(assignment.assignee());
      const type = safeCodeGetter(assignment.type());
      return assignee + (type ? ':' + type : '');
    },
    to() {
      return this.creation.Owner();
    },
    isCurrent() {
      return this.creation.isCurrent(this.cursor);
    },
    isInitedFromOccurrence: function () {
      return this.creation.isInitedFromOccurrence(this.from);
    },
    messageTextStyle() {
      return this.commentObj?.textStyle;
    },
    messageClassNames() {
      return this.commentObj?.classNames;
    },
  },
  mounted() {
    this.layoutMessageContainer();
    logger.log(`mounted for ${this.to}`);
  },
  updated() {
    this.layoutMessageContainer();
    logger.debug(`mounted for ${this.to}`);
  },
  methods: {
    layoutMessageContainer() {
      let _layoutMessageContainer = () => {
        if (!this.$refs.participantPlaceHolder || !this.$refs.messageContainer) return;
        const halfWidthOfPlaceholder = this.$refs['participantPlaceHolder'].offsetWidth / 2;
        this.$refs['messageContainer'].style.width = `calc(100% + ${halfWidthOfPlaceholder + 6}px`;
        if (this.rightToLeft) {
          this.$refs['messageContainer'].style.transform = `translateX( ${-(
            halfWidthOfPlaceholder + 6
          )}px`;
        }
      };
      _layoutMessageContainer();
      // setTimeout(_layoutMessageContainer)
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
