import sequenceParser from "../generated-parser/sequenceParser";

const seqParser = sequenceParser;
const CreationContext = seqParser.CreationContext;
const StatContext = seqParser.StatContext;
const MessageContext = seqParser.MessageContext;
const AsyncMessageContext = seqParser.AsyncMessageContext;
const ReturnAsyncMessageContext = seqParser.ReturnAsyncMessageContext;
const RetContext = seqParser.RetContext;

// @ts-expect-error -- ANTLR generated code
CreationContext.prototype.From = function () {
  // @ts-expect-error -- ANTLR generated code
  if (this.parentCtx instanceof StatContext) {
    // @ts-expect-error -- ANTLR generated code
    return this.ClosestAncestorStat().Origin();
  }
  return undefined;
};

// @ts-expect-error -- ANTLR generated code
MessageContext.prototype.ProvidedFrom = function () {
  // @ts-expect-error -- ANTLR generated code
  const fromCtx = this.messageBody()?.fromTo()?.from();
  return fromCtx?.name?.()?.getFormattedText() || fromCtx?.getFormattedText();
};
// @ts-expect-error -- ANTLR generated code
MessageContext.prototype.From = function () {
  // @ts-expect-error -- ANTLR generated code
  return this.ProvidedFrom() || this.ClosestAncestorStat().Origin();
};

// @ts-expect-error -- ANTLR generated code
AsyncMessageContext.prototype.ProvidedFrom = function () {
  // @ts-expect-error -- ANTLR generated code
  const fromCtx = this.from();
  return fromCtx?.name?.()?.getFormattedText() || fromCtx?.getFormattedText();
};

// @ts-expect-error -- ANTLR generated code
AsyncMessageContext.prototype.From = function () {
  // @ts-expect-error -- ANTLR generated code
  return this.ProvidedFrom() || this.ClosestAncestorStat().Origin();
};

// @ts-expect-error -- ANTLR generated code
ReturnAsyncMessageContext.prototype.ProvidedFrom = function () {
  // @ts-expect-error -- ANTLR generated code
  const fromCtx = this.from();
  return fromCtx?.name?.()?.getFormattedText() || fromCtx?.getFormattedText();
};

// @ts-expect-error -- ANTLR generated code
ReturnAsyncMessageContext.prototype.From = function () {
  // @ts-expect-error -- ANTLR generated code
  return this.ProvidedFrom() || this.ClosestAncestorStat().Origin();
};

// @ts-expect-error -- ANTLR generated code
RetContext.prototype.From = function () {
  // @ts-expect-error -- ANTLR generated code
  return this.asyncMessage()?.From() || this.returnAsyncMessage()?.From() || this.ClosestAncestorStat().Origin();
};
export {};
