import sequenceParser from "../generated-parser/sequenceParser";
import type { AntlrNode, AugmentedContext } from "./AntlrTypes";

const seqParser = sequenceParser;
const StatContext = seqParser.StatContext;

/** A `from`/`name` rule result: either a name node, or formatted text directly. */
interface FromLikeNode extends AntlrNode {
  name?(): AntlrNode | null;
}

interface CreationContextInstalled extends AugmentedContext {
  From(): string | undefined;
}
interface MessageContextInstalled extends AugmentedContext {
  messageBody(): { fromTo?(): { from?(): FromLikeNode | null } | null } | null;
  ProvidedFrom(): string | undefined;
  From(): string | undefined;
}
interface AsyncMessageContextInstalled extends AugmentedContext {
  from(): FromLikeNode | null;
  ProvidedFrom(): string | undefined;
  From(): string | undefined;
}
interface RetContextInstalled extends AugmentedContext {
  asyncMessage(): { From?(): string | undefined } | null;
  returnAsyncMessage(): { From?(): string | undefined } | null;
  From(): string | undefined;
}

const CreationContext = seqParser.CreationContext as any as {
  prototype: CreationContextInstalled;
};
const MessageContext = seqParser.MessageContext as any as {
  prototype: MessageContextInstalled;
};
const AsyncMessageContext = seqParser.AsyncMessageContext as any as {
  prototype: AsyncMessageContextInstalled;
};
const ReturnAsyncMessageContext =
  seqParser.ReturnAsyncMessageContext as any as {
    prototype: AsyncMessageContextInstalled;
  };
const RetContext = seqParser.RetContext as any as {
  prototype: RetContextInstalled;
};

CreationContext.prototype.From = function (this: CreationContextInstalled) {
  if (this.parentCtx instanceof StatContext) {
    return this.ClosestAncestorStat()?.Origin();
  }
  return undefined;
};

/** Shared by MessageContext, AsyncMessageContext and ReturnAsyncMessageContext. */
interface HasProvidedFrom extends AugmentedContext {
  ProvidedFrom(): string | undefined;
}

// MessageContext, AsyncMessageContext and ReturnAsyncMessageContext all
// resolve From identically: prefer their own ProvidedFrom(), else fall back
// to the enclosing statement's Origin(). Assigning the same function to each
// prototype keeps the body single-sourced while each context class still
// gets its own From property.
function fromProvidedOrOrigin(this: HasProvidedFrom) {
  return this.ProvidedFrom() || this.ClosestAncestorStat()?.Origin();
}

MessageContext.prototype.ProvidedFrom = function (
  this: MessageContextInstalled,
) {
  const fromCtx = this.messageBody()?.fromTo?.()?.from?.();
  return (
    fromCtx?.name?.()?.getFormattedText?.() || fromCtx?.getFormattedText?.()
  );
};
MessageContext.prototype.From = fromProvidedOrOrigin;

// AsyncMessageContext and ReturnAsyncMessageContext resolve ProvidedFrom
// identically (unlike MessageContext, which reaches its `from` node through
// messageBody()?.fromTo()).
function providedFromDirectFrom(this: AsyncMessageContextInstalled) {
  const fromCtx = this.from();
  return (
    fromCtx?.name?.()?.getFormattedText?.() || fromCtx?.getFormattedText?.()
  );
}

AsyncMessageContext.prototype.ProvidedFrom = providedFromDirectFrom;
AsyncMessageContext.prototype.From = fromProvidedOrOrigin;

ReturnAsyncMessageContext.prototype.ProvidedFrom = providedFromDirectFrom;
ReturnAsyncMessageContext.prototype.From = fromProvidedOrOrigin;

RetContext.prototype.From = function (this: RetContextInstalled) {
  return (
    this.asyncMessage()?.From?.() ||
    this.returnAsyncMessage()?.From?.() ||
    this.ClosestAncestorStat()?.Origin()
  );
};
export {};
