import sequenceParser from "@/generated-parser/sequenceParser";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import type { OwnedContext } from "@/parser/AntlrTypes";

// Owner/From are installed on MessageContext/CreationContext's prototypes at
// runtime (see src/parser/Owner.ts, src/parser/From.ts) — TS's inference for
// the ANTLR-generated classes doesn't see prototype patches applied from
// another file (see AntlrTypes.AugmentedContext's doc comment), so narrowed
// context values are cast to this shape at each call site below instead.
export const matchesImplicitStarterSelf = (ctx: any, participant: string) => {
  return (
    participant === _STARTER_ &&
    ctx instanceof sequenceParser.MessageContext &&
    (ctx as unknown as OwnedContext).Owner?.() === undefined &&
    (ctx as unknown as OwnedContext).From?.() === undefined
  );
};

/**
 * Occurrence-bar nesting depth: the number of sync-message / creation
 * ancestors of `context` that are owned by `participant`.
 */
export const depthOnParticipant = (context: any, participant: any): number => {
  return context?.getAncestors((ctx: any) => {
    const isSync = (ctx: any) => {
      const isMessageContext = ctx instanceof sequenceParser.MessageContext;
      const isCreationContext = ctx instanceof sequenceParser.CreationContext;
      return isMessageContext || isCreationContext;
    };
    if (isSync(ctx)) {
      return (
        (ctx as unknown as OwnedContext).Owner?.() === participant ||
        matchesImplicitStarterSelf(ctx, participant)
      );
    }
    return false;
  }).length;
};
