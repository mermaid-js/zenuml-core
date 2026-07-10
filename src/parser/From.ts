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
const ReturnAsyncMessageContext = seqParser.ReturnAsyncMessageContext as any as {
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

MessageContext.prototype.ProvidedFrom = function (
  this: MessageContextInstalled,
) {
  const fromCtx = this.messageBody()?.fromTo?.()?.from?.();
  return fromCtx?.name?.()?.getFormattedText?.() || fromCtx?.getFormattedText?.();
};
MessageContext.prototype.From = function (this: MessageContextInstalled) {
  return this.ProvidedFrom() || this.ClosestAncestorStat()?.Origin();
};

AsyncMessageContext.prototype.ProvidedFrom = function (
  this: AsyncMessageContextInstalled,
) {
  const fromCtx = this.from();
  return fromCtx?.name?.()?.getFormattedText?.() || fromCtx?.getFormattedText?.();
};

AsyncMessageContext.prototype.From = function (
  this: AsyncMessageContextInstalled,
) {
  return this.ProvidedFrom() || this.ClosestAncestorStat()?.Origin();
};

ReturnAsyncMessageContext.prototype.ProvidedFrom = function (
  this: AsyncMessageContextInstalled,
) {
  const fromCtx = this.from();
  return fromCtx?.name?.()?.getFormattedText?.() || fromCtx?.getFormattedText?.();
};

ReturnAsyncMessageContext.prototype.From = function (
  this: AsyncMessageContextInstalled,
) {
  return this.ProvidedFrom() || this.ClosestAncestorStat()?.Origin();
};

RetContext.prototype.From = function (this: RetContextInstalled) {
  return (
    this.asyncMessage()?.From?.() ||
    this.returnAsyncMessage()?.From?.() ||
    this.ClosestAncestorStat()?.Origin()
  );
};
export {};
