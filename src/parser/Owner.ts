/**
 * Owner is the receiver of the message.
 * For example, in `S -> A.m1 {B.m2 {C.m3}} D->E:m4`,
 *                       |     |     |         |
 * Owner of              m1    m2    m3        m4
 */

import { default as sequenceParser } from "../generated-parser/sequenceParser";
import {
  augment,
  type AsyncMessageContextAugmented,
  type CreationContextAugmented,
  type MessageContextAugmented,
  type RetContextAugmented,
  type ReturnAsyncMessageContextAugmented,
} from "./ContextAugmentations";
import type { AugmentedContext } from "./AntlrTypes";

/** Any context that carries `To()` once this file has run. */
interface HasTo extends AugmentedContext {
  To(): string | undefined;
}

const seqParser = sequenceParser;
const CreationContext = seqParser.CreationContext;
const MessageContext = seqParser.MessageContext;
const AsyncMessageContext = seqParser.AsyncMessageContext;
const ReturnAsyncMessageContext = seqParser.ReturnAsyncMessageContext;
const RetMessageContext = seqParser.RetContext;

augment<CreationContextAugmented>(CreationContext, {
  Assignee() {
    return this.creationBody()?.assignment()?.assignee()?.getFormattedText();
  },
  AssigneePosition() {
    const assignee = this.creationBody()?.assignment()?.assignee();
    if (!assignee) {
      return undefined;
    }
    return [assignee.start.start, assignee.stop.stop + 1];
  },
  Constructor() {
    return this.creationBody()?.construct()?.getFormattedText();
  },
  Owner() {
    if (!this.Constructor()) {
      return "Missing Constructor";
    }
    const assignee = this.Assignee();
    const type = this.Constructor();
    return assignee ? `${assignee}:${type}` : type;
  },
});

augment<MessageContextAugmented>(MessageContext, {
  To() {
    const toCtx = this.messageBody()?.fromTo()?.to();
    return toCtx?.name?.()?.getFormattedText() || toCtx?.getFormattedText();
  },
});

function getOwnerFromAncestor(
  ctx: AugmentedContext | null,
): string | undefined {
  while (ctx) {
    if (ctx instanceof CreationContext || ctx instanceof MessageContext) {
      return (ctx as unknown as MessageContextAugmented).Owner();
    }
    ctx = ctx.parentCtx;
  }
  return undefined;
}

// MessageContext, AsyncMessageContext, ReturnAsyncMessageContext and
// RetContext all resolve Owner the same way: prefer their own To(), else
// look up the nearest CreationContext/MessageContext ancestor. Installing
// the same function on each prototype keeps the body single-sourced while
// each context class still gets its own Owner property.
function ownerFromToOrAncestor(this: HasTo) {
  return this.To() || getOwnerFromAncestor(this.parentCtx);
}

augment<MessageContextAugmented>(MessageContext, {
  Owner: ownerFromToOrAncestor,
});
augment<AsyncMessageContextAugmented>(AsyncMessageContext, {
  Owner: ownerFromToOrAncestor,
});
augment<ReturnAsyncMessageContextAugmented>(ReturnAsyncMessageContext, {
  Owner: ownerFromToOrAncestor,
});
augment<RetContextAugmented>(RetMessageContext, {
  Owner: ownerFromToOrAncestor,
});

// AsyncMessageContext and ReturnAsyncMessageContext resolve To() identically
// (unlike MessageContext, which reaches its `to` node through
// messageBody()?.fromTo(), and RetContext, which delegates to ReturnTo()).
function toFromDirectTo(this: AsyncMessageContextAugmented) {
  const toCtx = this.to();
  return toCtx?.name?.()?.getFormattedText() || toCtx?.getFormattedText();
}

augment<AsyncMessageContextAugmented>(AsyncMessageContext, {
  To: toFromDirectTo,
});
augment<ReturnAsyncMessageContextAugmented>(ReturnAsyncMessageContext, {
  To: toFromDirectTo,
});

augment<RetContextAugmented>(RetMessageContext, {
  To() {
    return this.ReturnTo();
  },
});
