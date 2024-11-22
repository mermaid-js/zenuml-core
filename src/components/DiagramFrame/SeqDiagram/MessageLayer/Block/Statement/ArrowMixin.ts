import { defineComponent } from "vue";
import sequenceParser from "@/generated-parser/sequenceParser";
import { OCCURRENCE_BAR_SIDE_WIDTH } from "@/positioning/Constants";
import { mapGetters } from "vuex";
import Anchor2 from "@/positioning/Anchor2";
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
    ...mapGetters(["centerOf"]),
    originLayers: function (): number {
      return this.depthOnParticipant(this.origin);
    },
    sourceLayers: function (): number {
      return this.depthOnParticipant(this.source);
    },
    targetLayers: function (): number {
      return this.depthOnParticipant4Stat(this.target);
    },

    anchor2Origin: function (): Anchor2 {
      return new Anchor2(this.centerOf(this.origin), this.originLayers);
    },
    anchor2Source: function (): Anchor2 {
      return new Anchor2(this.centerOf(this.source), this.sourceLayers);
    },
    anchor2Target: function (): Anchor2 {
      return new Anchor2(this.centerOf(this.target), this.targetLayers);
    },

    interactionWidth: function (): number {
      return Math.abs(this.anchor2Source.edgeOffset(this.anchor2Target));
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
      return this.depthOnParticipant(this.origin) * OCCURRENCE_BAR_SIDE_WIDTH;
    },
    sourceOffset: function (): any {
      return this.depthOnParticipant(this.source) * OCCURRENCE_BAR_SIDE_WIDTH;
    },
    targetOffset: function (): any {
      return this.depthOnParticipant(this.target) * OCCURRENCE_BAR_SIDE_WIDTH;
    },
  },

  methods: {
    depthOnParticipant(participant: any): number {
      const length = this.context?.getAncestors((ctx) => {
        if (this.isSync(ctx)) {
          return ctx.Owner() === participant;
        }
        return false;
      }).length;
      if (length === 0) return 0;
      return length;
    },
    depthOnParticipant4Stat(participant: any): number {
      if (!(this.context instanceof sequenceParser.StatContext)) {
        return 0;
      }

      const child = this.context?.children?.[0];
      if (!child) {
        return 0;
      }
      const length = child.getAncestors((ctx) => {
        if (this.isSync(ctx)) {
          return ctx.Owner() === participant;
        }
        return false;
      }).length;

      return length;
    },
    isSync(ctx: any) {
      const isMessageContext = ctx instanceof sequenceParser.MessageContext;
      const isCreationContext = ctx instanceof sequenceParser.CreationContext;
      return isMessageContext || isCreationContext;
    },

    isJointOccurrence(this: ComponentProps, participant: any): boolean {
      return this.depthOnParticipant4Stat(participant) > 0;
    },
  },
});
