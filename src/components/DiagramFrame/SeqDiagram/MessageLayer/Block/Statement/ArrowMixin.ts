import { defineComponent } from "vue";
import sequenceParser from "@/generated-parser/sequenceParser";
import { mapGetters } from "vuex";
import Anchor2 from "@/positioning/Anchor2";

export default defineComponent({
  props: {
    origin: {
      type: null,
      required: true,
    },
    context: {
      type: null,
      required: true,
    },
  },

  computed: {
    ...mapGetters(["centerOf"]),
    isSelf: function (): boolean {
      return this.source === this.target;
    },
    originLayers: function (): number {
      return this.depthOnParticipant(this.context, this.origin);
    },
    sourceLayers: function (): number {
      return this.depthOnParticipant(this.context, this.source);
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
    translateX: function () {
      const destination = !this.rightToLeft
        ? this.anchor2Source
        : this.anchor2Target;
      return this.anchor2Origin.centerToEdge(destination);
    },
  },

  methods: {
    depthOnParticipant(context: any, participant: any): number {
      return context?.getAncestors((ctx) => {
        if (this.isSync(ctx)) {
          return ctx.Owner() === participant;
        }
        return false;
      }).length;
    },
    depthOnParticipant4Stat(participant: any): number {
      if (!(this.context instanceof sequenceParser.StatContext)) {
        return 0;
      }

      const child = this.context?.children?.[0];
      if (!child) {
        return 0;
      }
      return this.depthOnParticipant(child, participant);
    },
    isSync(ctx: any) {
      const isMessageContext = ctx instanceof sequenceParser.MessageContext;
      const isCreationContext = ctx instanceof sequenceParser.CreationContext;
      return isMessageContext || isCreationContext;
    },
  },
});
