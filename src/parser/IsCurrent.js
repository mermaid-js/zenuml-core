import { default as sequenceParser } from "../generated-parser/sequenceParser";
const seqParser = sequenceParser;

const CreationContext = seqParser.CreationContext;
CreationContext.prototype.Body = CreationContext.prototype.creationBody;
CreationContext.prototype.isCurrent = function (cursor) {
  return isCurrent.bind(this)(cursor);
};

const MessageContext = seqParser.MessageContext;
MessageContext.prototype.Body = MessageContext.prototype.messageBody;
MessageContext.prototype.isCurrent = function (cursor) {
  return isCurrent.bind(this)(cursor);
};

function isCurrent(cursor) {
  try {
    if (cursor === null || cursor === undefined) return false;
    const start = this.start.start;
    const stop = this.Body().stop.stop + 1;

    return cursor >= start && cursor <= stop;
  } catch (e) {
    return false;
  }
}

export function handleScrollAndHighlight({
  ref,
  isCurrent,
  enableCurrentElementScrollIntoView,
  enableCurrentElementHighlight,
}) {
  if (enableCurrentElementScrollIntoView && isCurrent && ref.current) {
    ref.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });

    if (enableCurrentElementHighlight) {
      ref.current.classList.add("flash-highlight");
      const timer = setTimeout(() => {
        ref.current?.classList.remove("flash-highlight");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }
}
