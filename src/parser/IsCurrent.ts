import { default as sequenceParser } from "../generated-parser/sequenceParser";
import type { AugmentedContext } from "./AntlrTypes";

interface Token {
  start: number;
  stop: number;
}

/** MessageContext / CreationContext once Body and isCurrent are installed. */
interface CurrentableContext extends AugmentedContext {
  start: Token;
  Body(): { stop: Token };
  creationBody?(): { stop: Token };
  messageBody?(): { stop: Token };
  isCurrent(cursor: number | null | undefined): boolean;
}

const seqParser = sequenceParser;

const CreationContext = seqParser.CreationContext as any as {
  prototype: CurrentableContext;
};
CreationContext.prototype.Body = CreationContext.prototype.creationBody!;
CreationContext.prototype.isCurrent = function (
  this: CurrentableContext,
  cursor: number | null | undefined,
) {
  return isCurrent.bind(this)(cursor);
};

const MessageContext = seqParser.MessageContext as any as {
  prototype: CurrentableContext;
};
MessageContext.prototype.Body = MessageContext.prototype.messageBody!;
MessageContext.prototype.isCurrent = function (
  this: CurrentableContext,
  cursor: number | null | undefined,
) {
  return isCurrent.bind(this)(cursor);
};

function isCurrent(
  this: CurrentableContext,
  cursor: number | null | undefined,
): boolean {
  try {
    if (cursor === null || cursor === undefined) return false;
    const start = this.start.start;
    const stop = this.Body().stop.stop + 1;

    return cursor >= start && cursor <= stop;
  } catch {
    return false;
  }
}
