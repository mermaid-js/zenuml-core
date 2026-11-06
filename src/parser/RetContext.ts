import { default as sequenceParser } from "../generated-parser/sequenceParser";
import {
  augment,
  type MessageContextAugmented,
  type ProgContextAugmented,
  type RetContextAugmented,
} from "./ContextAugmentations";

const seqParser = sequenceParser;
const ProgContext = seqParser.ProgContext;
const MessageContext = seqParser.MessageContext;
const CreationContext = seqParser.CreationContext;

augment<RetContextAugmented>(seqParser.RetContext, {
  Signature() {
    return (
      this.asyncMessage()?.content()?.getFormattedText() ||
      this.returnAsyncMessage()?.content()?.getFormattedText() ||
      this.expr()?.getFormattedText()
    );
  },

  ReturnTo() {
    // Check asyncMessage 'to' first
    const asyncToCtx =
      this.asyncMessage()?.to() || this.returnAsyncMessage()?.to();
    const asyncTo =
      asyncToCtx?.name?.()?.getFormattedText() ||
      asyncToCtx?.getFormattedText();
    if (asyncTo) {
      return asyncTo;
    }

    const stat = this.parentCtx!;
    const block = stat.parentCtx!;
    const blockParent = block.parentCtx;
    if (blockParent instanceof ProgContext) {
      return (blockParent as unknown as ProgContextAugmented).Starter();
    } else {
      let ctx = blockParent;
      while (
        ctx &&
        !(ctx instanceof MessageContext) &&
        !(ctx instanceof CreationContext)
      ) {
        if (ctx instanceof ProgContext) {
          return (ctx as unknown as ProgContextAugmented).Starter();
        }
        ctx = ctx.parentCtx;
      }
      if (ctx instanceof MessageContext) {
        const messageCtx = ctx as unknown as MessageContextAugmented;
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
  },
});
