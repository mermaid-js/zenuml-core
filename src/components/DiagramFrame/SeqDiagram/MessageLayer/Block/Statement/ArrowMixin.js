import sequenceParser from "@/generated-parser/sequenceParser";

export default {
  computed: {
    borderWidth: function () {
      const border = {
        borderLeftWidth: "7px",
        borderRightWidth: "7px",
      };
      // e.g. A->A.method()
      // const isSelfMessage = this.source === this.target;
      // if(isSelfMessage) {
      //   border.borderLeftWidth = "0px";
      //   border.borderRightWidth = "0px";
      //   return border;
      // }
      const endSide = this.rightToLeft ? "Left" : "Right";
      const startSide = this.rightToLeft ? "Right" : "Left";

      // e.g.
      // A.method() {
      //   B.method() <- for this method, source is A, and it has an occurrence
      // }
      const sourceHasOccurrence = this.isJointOccurrence(this.source);
      if (!sourceHasOccurrence) {
        border[`border${startSide}Width`] = "0px";
      }
      // e.g.
      // A.method() {
      //   B.method() <- for this method, target is B, and it has an occurrence
      // }
      if (!this.isJointOccurrence(this.target)) {
        border[`border${endSide}Width`] = "0px";
      }
      return border;
    },
  },
  methods: {
    isJointOccurrence(participant) {
      let ancestorContextForParticipant =
        this.findContextForReceiver(participant);
      console.debug(
        "owning context",
        participant,
        ancestorContextForParticipant,
      );
      // If no owning context found, it means this is a bare connection
      if (!ancestorContextForParticipant) {
        return false;
      }

      // Check if the owning context creates an occurrence point
      return (
        ancestorContextForParticipant instanceof
          sequenceParser.MessageContext ||
        ancestorContextForParticipant instanceof sequenceParser.CreationContext
      );
    },
    // Input `participant` is the receiver. This method
    findContextForReceiver(participant) {
      if (!this.context) {
        return null;
      }
      let currentContext = this.context;
      if (this.source !== this.target) {
        const messageContext = this.context.message && this.context.message();
        if (messageContext && messageContext.Owner() === participant) {
          return messageContext;
        }
        const creationContext =
          this.context.creation && this.context.creation();
        if (creationContext && creationContext.Owner() === participant) {
          return creationContext;
        }
      }
      while (currentContext) {
        if (!currentContext.Owner) {
          currentContext = currentContext.parentCtx;
          continue;
        }

        if (currentContext.Owner() === participant) {
          return currentContext;
        }

        currentContext = currentContext.parentCtx;
      }
      return null;
    },
  },
};
