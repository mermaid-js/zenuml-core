import { defineComponent } from "vue";
import sequenceParser from "@/generated-parser/sequenceParser";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { LIFELINE_WIDTH } from "@/positioning/Constants";
import Anchor from "@/positioning/Anchor";
// Define interfaces for your properties
interface BorderWidthStyle {
  borderLeftWidth: string;
  borderRightWidth: string;
}

// Define the context type
interface Context {
  message?: () => MessageContext;
  creation?: () => CreationContext;
  Owner?: () => any;
  parentCtx: Context | null;
}

interface MessageContext extends Context {
  Owner: () => any;
}

interface CreationContext extends Context {
  Owner: () => any;
}

// Component properties interface
interface ComponentProps {
  rightToLeft: boolean;
  source: any;
  target: any;
  context: Context;
  origin: any;
  isJointOccurrence: (participant: any) => boolean;
  findContextForReceiver: (participant: any) => Context | null;
}

export default defineComponent({
  props: {
    origin: {
      type: null,
      required: true,
    },
  },

  computed: {
    anchorOrigin: function (): Anchor {
      return new Anchor(this.centerOf(this.origin), this.originOffset);
    },
    anchorSource: function (): Anchor {
      return new Anchor(this.centerOf(this.source), this.sourceOffset);
    },
    anchorTarget: function (): Anchor {
      return new Anchor(this.centerOf(this.target), this.targetOffset);
    },

    interactionWidth: function (): number {
      return (
        Math.abs(this.anchorSource.calculateEdgeOffset(this.anchorTarget)) -
        LIFELINE_WIDTH
      );
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
    originOffset: function (): any {
      const length = this.context.getAncestors((ctx) => {
        if (this.isSync(ctx)) {
          return ctx.Owner() === this.origin;
        }
        return false;
      }).length;
      if (length === 0) return 0;
      return (length - 1) * 7;
    },
    sourceOffset: function (): any {
      const length = this.context.getAncestors((ctx) => {
        if (this.isSync(ctx)) {
          return ctx.Owner() === this.source;
        }
        return false;
      }).length;
      if (length === 0) return 0;
      return (length - 1) * 7;
    },
    targetOffset: function (): any {
      const length = this.context.getAncestors((ctx) => {
        if (this.isSync(ctx)) {
          return ctx.Owner() === this.target;
        }
        return false;
      }).length;
      return length * 7;
    },
    borderWidth(this: ComponentProps): BorderWidthStyle {
      const border: BorderWidthStyle = {
        borderLeftWidth: "7px",
        borderRightWidth: "7px",
      };
      const endSide = this.rightToLeft ? "Left" : "Right";
      const startSide = this.rightToLeft ? "Right" : "Left";

      if (!this.isJointOccurrence(this.source)) {
        border[`border${startSide}Width`] = "0px";
      }
      if (!this.isJointOccurrence(this.target)) {
        border[`border${endSide}Width`] = "0px";
      }
      return border;
    },
  },

  methods: {
    isSync(ctx: any) {
      const isMessageContext = ctx instanceof sequenceParser.MessageContext;
      const isCreationContext = ctx instanceof sequenceParser.CreationContext;
      return isMessageContext || isCreationContext;
    },

    isJointOccurrence(this: ComponentProps, participant: any): boolean {
      const ancestorContextForParticipant =
        this.findContextForReceiver(participant);
      if (!ancestorContextForParticipant) {
        return false;
      }

      return (
        ancestorContextForParticipant instanceof
          sequenceParser.MessageContext ||
        ancestorContextForParticipant instanceof sequenceParser.CreationContext
      );
    },

    findContextForReceiver(
      this: ComponentProps,
      participant: any,
    ): Context | MessageContext | CreationContext | null {
      if (!this.context) {
        return null;
      }
      let currentContext: Context = this.context;

      const messageContext = currentContext.message && currentContext.message();
      if (
        messageContext &&
        (messageContext.Owner() === participant ||
          (!messageContext.Owner() && participant === _STARTER_))
      ) {
        return messageContext;
      }
      const creationContext =
        currentContext.creation && currentContext.creation();
      if (
        creationContext &&
        (creationContext.Owner() === participant ||
          (!creationContext.Owner() && participant === _STARTER_))
      ) {
        return creationContext;
      }
      while (currentContext) {
        if (!currentContext.Owner) {
          currentContext = currentContext.parentCtx!;
          continue;
        }

        if (
          currentContext.Owner() === participant ||
          (!currentContext.Owner() && participant === _STARTER_)
        ) {
          return currentContext;
        }

        currentContext = currentContext.parentCtx!;
      }
      return null;
    },
  },
});
