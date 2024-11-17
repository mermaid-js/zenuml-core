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

CreationContext.prototype.To = function () {
  return this.Constructor();
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
  return this.messageBody()?.to()?.getFormattedText();
};

MessageContext.prototype.Owner = function () {
  return this.To() || getOwnerFromAncestor(this.parentCtx);
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

AsyncMessageContext.prototype.To = function () {
  return this.to()?.getFormattedText();
};

AsyncMessageContext.prototype.Owner = function () {
  return this.To() || getOwnerFromAncestor(this.parentCtx);
};

RetMessageContext.prototype.To = function () {
  return this.ReturnTo();
};

RetMessageContext.prototype.Owner = function () {
  return this.To() || getOwnerFromAncestor(this.parentCtx);
};
