import sequenceParser from "@/generated-parser/sequenceParser";

export default {
  computed: {
    borderWidth: function () {
      const border = {
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
    isJointOccurrence(participant) {
      let ancestorContextForParticipant = this.findOwningContext(participant);

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
    findOwningContext(participant) {
      let currentContext = this.context;

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
