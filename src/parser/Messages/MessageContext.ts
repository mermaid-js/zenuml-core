import sequenceParser from "../../generated-parser/sequenceParser";
import "./Assignment";

const seqParser = sequenceParser;
const MessageContext = seqParser.MessageContext;
const CreationContext = seqParser.CreationContext;
const IfBlockContext = seqParser.IfBlockContext;
const LoopContext = seqParser.LoopContext;

// @ts-expect-error -- ANTLR generated code
MessageContext.prototype.Statements = function () {
  return this.braceBlock()?.block()?.stat() || [];
};

// @ts-expect-error -- ANTLR generated code
CreationContext.prototype.Statements = function () {
  return this.braceBlock()?.block()?.stat() || [];
};

// @ts-expect-error -- ANTLR generated code
IfBlockContext.prototype.Statements = function () {
  return this.braceBlock()?.block()?.stat() || [];
};

// @ts-expect-error -- ANTLR generated code
LoopContext.prototype.Statements = function () {
  return this.braceBlock()?.block()?.stat() || [];
};
