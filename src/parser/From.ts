import sequenceParser from "../generated-parser/sequenceParser";
import {
  augment,
  type AsyncMessageContextAugmented,
  type CreationContextAugmented,
  type MessageContextAugmented,
  type RetContextAugmented,
  type ReturnAsyncMessageContextAugmented,
} from "./ContextAugmentations";
import type { AugmentedContext } from "./AntlrTypes";

const seqParser = sequenceParser;
const StatContext = seqParser.StatContext;

augment<CreationContextAugmented>(seqParser.CreationContext, {
  From() {
    if (this.parentCtx instanceof StatContext) {
      return this.ClosestAncestorStat()?.Origin();
    }
    return undefined;
  },
});

/** Shared by MessageContext, AsyncMessageContext and ReturnAsyncMessageContext. */
interface HasProvidedFrom extends AugmentedContext {
  ProvidedFrom(): string | undefined;
}

// MessageContext, AsyncMessageContext and ReturnAsyncMessageContext all
// resolve From identically: prefer their own ProvidedFrom(), else fall back
// to the enclosing statement's Origin(). Installing the same function on each
// prototype keeps the body single-sourced while each context class still
// gets its own From property.
function fromProvidedOrOrigin(this: HasProvidedFrom) {
  return this.ProvidedFrom() || this.ClosestAncestorStat()?.Origin();
}

augment<MessageContextAugmented>(seqParser.MessageContext, {
  ProvidedFrom() {
    const fromCtx = this.messageBody()?.fromTo?.()?.from?.();
    return (
      fromCtx?.name?.()?.getFormattedText?.() || fromCtx?.getFormattedText?.()
    );
  },
  From: fromProvidedOrOrigin,
});

// AsyncMessageContext and ReturnAsyncMessageContext resolve ProvidedFrom
// identically (unlike MessageContext, which reaches its `from` node through
// messageBody()?.fromTo()).
function providedFromDirectFrom(this: AsyncMessageContextAugmented) {
  const fromCtx = this.from();
  return (
    fromCtx?.name?.()?.getFormattedText?.() || fromCtx?.getFormattedText?.()
  );
}

augment<AsyncMessageContextAugmented>(seqParser.AsyncMessageContext, {
  ProvidedFrom: providedFromDirectFrom,
  From: fromProvidedOrOrigin,
});

augment<ReturnAsyncMessageContextAugmented>(
  seqParser.ReturnAsyncMessageContext,
  {
    ProvidedFrom: providedFromDirectFrom,
    From: fromProvidedOrOrigin,
  },
);

augment<RetContextAugmented>(seqParser.RetContext, {
  From() {
    return (
      this.asyncMessage()?.From?.() ||
      this.returnAsyncMessage()?.From?.() ||
      this.ClosestAncestorStat()?.Origin()
    );
  },
});
export {};
