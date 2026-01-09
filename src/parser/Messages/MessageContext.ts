import sequenceParser from "../../generated-parser/sequenceParser";
import "./Assignment";

const seqParser = sequenceParser;
const MessageContext = seqParser.MessageContext;
const CreationContext = seqParser.CreationContext;
const IfBlockContext = seqParser.IfBlockContext;
const LoopContext = seqParser.LoopContext;

// @ts-ignore
MessageContext.prototype.Statements = function () {
  return this.braceBlock()?.block()?.stat() || [];
};

// @ts-ignore
CreationContext.prototype.Statements = function () {
  return this.braceBlock()?.block()?.stat() || [];
};

// @ts-ignore
IfBlockContext.prototype.Statements = function () {
  return this.braceBlock()?.block()?.stat() || [];
};

// @ts-ignore
LoopContext.prototype.Statements = function () {
  return this.braceBlock()?.block()?.stat() || [];
};
