/**
 * Owner is the receiver of the message.
 * For example, in `S -> A.m1 {B.m2 {C.m3}} D->E:m4`,
 *                       |     |     |         |
 * Owner of              m1    m2    m3        m4
 */

import { default as sequenceParser } from "../generated-parser/sequenceParser";

const seqParser = sequenceParser;
const CreationContext = seqParser.CreationContext;
const MessageContext = seqParser.MessageContext;
const AsyncMessageContext = seqParser.AsyncMessageContext;
const ReturnAsyncMessageContext = seqParser.ReturnAsyncMessageContext;
const RetMessageContext = seqParser.RetContext;

CreationContext.prototype.Assignee = function () {
  return this.creationBody()?.assignment()?.assignee()?.getFormattedText();
};

CreationContext.prototype.AssigneePosition = function () {
  const assignee = this.creationBody()?.assignment()?.assignee();
  if (!assignee) {
    return undefined;
  }
  return [assignee.start.start, assignee.stop.stop + 1];
};

CreationContext.prototype.Constructor = function () {
  return this.creationBody()?.construct()?.getFormattedText();
};

CreationContext.prototype.Owner = function () {
  if (!this.Constructor()) {
    return "Missing Constructor";
  }
  const assignee = this.Assignee();
  const type = this.Constructor();
  return assignee ? `${assignee}:${type}` : type;
};

MessageContext.prototype.To = function () {
  const toCtx = this.messageBody()?.fromTo()?.to();
  return toCtx?.name?.()?.getFormattedText() || toCtx?.getFormattedText();
};

function getOwnerFromAncestor(ctx) {
  while (ctx) {
    if (ctx instanceof CreationContext || ctx instanceof MessageContext) {
      return ctx.Owner();
    }
    ctx = ctx.parentCtx;
  }
  return undefined;
}

// MessageContext, AsyncMessageContext, ReturnAsyncMessageContext and
// RetContext all resolve Owner the same way: prefer their own To(), else
// look up the nearest CreationContext/MessageContext ancestor. Assigning
// the same function to each prototype keeps the body single-sourced while
// each context class still gets its own Owner property.
function ownerFromToOrAncestor() {
  return this.To() || getOwnerFromAncestor(this.parentCtx);
}

[
  MessageContext,
  AsyncMessageContext,
  ReturnAsyncMessageContext,
  RetMessageContext,
].forEach((ContextClass) => {
  ContextClass.prototype.Owner = ownerFromToOrAncestor;
});

// AsyncMessageContext and ReturnAsyncMessageContext resolve To() identically
// (unlike MessageContext, which reaches its `to` node through
// messageBody()?.fromTo(), and RetContext, which delegates to ReturnTo()).
function toFromDirectTo() {
  const toCtx = this.to();
  return toCtx?.name?.()?.getFormattedText() || toCtx?.getFormattedText();
}

AsyncMessageContext.prototype.To = toFromDirectTo;
ReturnAsyncMessageContext.prototype.To = toFromDirectTo;

RetMessageContext.prototype.To = function () {
  return this.ReturnTo();
};
