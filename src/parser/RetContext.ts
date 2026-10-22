import { default as sequenceParser } from "../generated-parser/sequenceParser";
import type { AugmentedContext } from "./AntlrTypes";

/** A node that may expose a `name()` child, as in `from`/`to` rule results. */
interface NamedNode {
  name?(): { getFormattedText(): string } | null;
  getFormattedText(): string;
}

interface AsyncLike {
  content(): { getFormattedText(): string } | null;
  to(): NamedNode | null;
}

interface RetContextInstalled extends AugmentedContext {
  asyncMessage(): AsyncLike | null;
  returnAsyncMessage(): AsyncLike | null;
  expr(): { getFormattedText(): string } | null;
  Signature(): string | undefined;
  ReturnTo(): string | undefined;
}

interface ProgLike extends AugmentedContext {
  Starter(): string | undefined;
}

interface MessageLike extends AugmentedContext {
  messageBody(): {
    fromTo(): { from(): NamedNode | null } | null;
  } | null;
}

const seqParser = sequenceParser;
const RetContext = seqParser.RetContext as any as {
  prototype: RetContextInstalled;
};
const ProgContext = seqParser.ProgContext;
const MessageContext = seqParser.MessageContext;
const CreationContext = seqParser.CreationContext;

RetContext.prototype.Signature = function (this: RetContextInstalled) {
  return (
    this.asyncMessage()?.content()?.getFormattedText() ||
    this.returnAsyncMessage()?.content()?.getFormattedText() ||
    this.expr()?.getFormattedText()
  );
};

RetContext.prototype.ReturnTo = function (this: RetContextInstalled) {
  // Check asyncMessage 'to' first
  const asyncToCtx =
    this.asyncMessage()?.to() || this.returnAsyncMessage()?.to();
  const asyncTo =
    asyncToCtx?.name?.()?.getFormattedText() || asyncToCtx?.getFormattedText();
  if (asyncTo) {
    return asyncTo;
  }

  const stat = this.parentCtx!;
  const block = stat.parentCtx!;
  const blockParent = block.parentCtx;
  if (blockParent instanceof ProgContext) {
    return (blockParent as unknown as ProgLike).Starter();
  } else {
    let ctx = blockParent;
    while (
      ctx &&
      !(ctx instanceof MessageContext) &&
      !(ctx instanceof CreationContext)
    ) {
      if (ctx instanceof ProgContext) {
        return (ctx as unknown as ProgLike).Starter();
      }
      ctx = ctx.parentCtx;
    }
    if (ctx instanceof MessageContext) {
      const messageCtx = ctx as unknown as MessageLike;
      return (
        messageCtx
          .messageBody()
          ?.fromTo()
          ?.from()
          ?.name?.()
          ?.getFormattedText() ||
        messageCtx.messageBody()?.fromTo()?.from()?.getFormattedText() ||
        messageCtx.ClosestAncestorStat()!.Origin()
      );
    }
    return ctx!.ClosestAncestorStat()!.Origin();
  }
};
