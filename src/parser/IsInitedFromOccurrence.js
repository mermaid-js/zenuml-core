import { default as sequenceParser } from "../generated-parser/sequenceParser";
const seqParser = sequenceParser;

const CreationContext = seqParser.CreationContext;
CreationContext.prototype.Body = CreationContext.prototype.creationBody;
CreationContext.prototype.isInitedFromOccurrence = function (from) {
  return isInitedFromOccurrence.bind(this)(from);
};

const MessageContext = seqParser.MessageContext;
MessageContext.prototype.Body = MessageContext.prototype.messageBody;
MessageContext.prototype.isInitedFromOccurrence = function (from) {
  return isInitedFromOccurrence.bind(this)(from);
};

const AsyncMessageContext = seqParser.AsyncMessageContext;
AsyncMessageContext.prototype.isInitedFromOccurrence = function (from) {
  return isInitedFromOccurrence.bind(this)(from);
};

/**
 * if a message is sent from a participant who is also a target of a message, we can
 * say that the message is inited from an occurrence
 **/
function isInitedFromOccurrence(from) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  let current = this;
  while (current != null) {
    if (current instanceof seqParser.StatContext) {
      let participant;
      if (current.message && current.message()) {
        participant = current.message().Owner();
      } else if (current.creation && current.creation()) {
        participant = current.creation().Owner();
      }
      console.log("!!!", participant, from);
      if (participant === from) {
        console.log("!!! true");
        return true;
      }
    }
    current = current.parentCtx;
  }
  return false;
}
