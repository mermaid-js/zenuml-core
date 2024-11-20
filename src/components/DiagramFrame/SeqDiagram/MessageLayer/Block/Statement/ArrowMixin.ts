import { defineComponent } from "vue";
import sequenceParser from "@/generated-parser/sequenceParser";
import { _STARTER_ } from "@/parser/OrderedParticipants";

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

      if (this.source !== this.target) {
        const messageContext =
          currentContext.message && currentContext.message();
        if (messageContext && messageContext.Owner() === participant) {
          return messageContext;
        }
        const creationContext =
          currentContext.creation && currentContext.creation();
        if (creationContext && creationContext.Owner() === participant) {
          return creationContext;
        }
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
