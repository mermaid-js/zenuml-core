/**
 * Owner is the receiver of the message.
 * For example, in `S -> A.m1 {B.m2 {C.m3}} D->E:m4`,
 *                       |     |     |         |
 * Owner of              m1    m2    m3        m4
 */

import { default as sequenceParser } from "../generated-parser/sequenceParser";
import type { AugmentedContext } from "./AntlrTypes";

/** A node that may expose a `name()` child, as in `from`/`to` rule results. */
interface NamedNode {
  name?(): { getFormattedText(): string } | null;
  getFormattedText(): string;
}

interface Token {
  start: number;
  stop: number;
}

interface AssigneeNode {
  getFormattedText(): string;
  start: Token;
  stop: Token;
}

interface CreationContextInstalled extends AugmentedContext {
  creationBody(): {
    assignment(): { assignee(): AssigneeNode | null } | null;
    construct(): { getFormattedText(): string } | null;
  } | null;
  Assignee(): string | undefined;
  AssigneePosition(): number[] | undefined;
  Constructor(): string | undefined;
  Owner(): string | undefined;
}

interface MessageContextInstalled extends AugmentedContext {
  messageBody(): {
    fromTo(): { to(): NamedNode | null } | null;
  } | null;
  To(): string | undefined;
  Owner(): string | undefined;
}

interface AsyncMessageContextInstalled extends AugmentedContext {
  to(): NamedNode | null;
  To(): string | undefined;
  Owner(): string | undefined;
}

interface RetContextInstalled extends AugmentedContext {
  ReturnTo(): string | undefined;
  To(): string | undefined;
  Owner(): string | undefined;
}

/** Any context that carries `To()` once this file has run. */
interface HasTo extends AugmentedContext {
  To(): string | undefined;
}

const seqParser = sequenceParser;
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
const RetMessageContext = seqParser.RetContext as any as {
  prototype: RetContextInstalled;
};

CreationContext.prototype.Assignee = function (this: CreationContextInstalled) {
  return this.creationBody()?.assignment()?.assignee()?.getFormattedText();
};

CreationContext.prototype.AssigneePosition = function (
  this: CreationContextInstalled,
) {
  const assignee = this.creationBody()?.assignment()?.assignee();
  if (!assignee) {
    return undefined;
  }
  return [assignee.start.start, assignee.stop.stop + 1];
};

CreationContext.prototype.Constructor = function (
  this: CreationContextInstalled,
) {
  return this.creationBody()?.construct()?.getFormattedText();
};

CreationContext.prototype.Owner = function (this: CreationContextInstalled) {
  if (!this.Constructor()) {
    return "Missing Constructor";
  }
  const assignee = this.Assignee();
  const type = this.Constructor();
  return assignee ? `${assignee}:${type}` : type;
};

MessageContext.prototype.To = function (this: MessageContextInstalled) {
  const toCtx = this.messageBody()?.fromTo()?.to();
  return toCtx?.name?.()?.getFormattedText() || toCtx?.getFormattedText();
};

function getOwnerFromAncestor(
  ctx: AugmentedContext | null,
): string | undefined {
  while (ctx) {
    if (
      ctx instanceof (CreationContext as any) ||
      ctx instanceof (MessageContext as any)
    ) {
      return (ctx as unknown as { Owner(): string | undefined }).Owner();
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
function ownerFromToOrAncestor(this: HasTo) {
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
function toFromDirectTo(this: AsyncMessageContextInstalled) {
  const toCtx = this.to();
  return toCtx?.name?.()?.getFormattedText() || toCtx?.getFormattedText();
}

AsyncMessageContext.prototype.To = toFromDirectTo;
ReturnAsyncMessageContext.prototype.To = toFromDirectTo;

RetMessageContext.prototype.To = function (this: RetContextInstalled) {
  return this.ReturnTo();
};
