import sequenceParser from "@/generated-parser/sequenceParser";

/**
 * Utility functions for counting messages and message-related contexts
 */
export class MessageCountingUtils {
  /**
   * Count message context depth for a specific participant (from useArrow.ts)
   */
  static getParticipantMessageDepth(context: any, participant: string): number {
    return (
      context?.getAncestors((ctx: any) => {
        const isSync =
          ctx instanceof sequenceParser.MessageContext ||
          ctx instanceof sequenceParser.CreationContext;
        // @ts-expect-error Owner() method exists on context but not typed
        return isSync && ctx.Owner() === participant;
      }).length || 0
    );
  }
}
