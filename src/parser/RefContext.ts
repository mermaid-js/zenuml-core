import { default as sequenceParser } from "../generated-parser/sequenceParser";

const seqParser = sequenceParser;
const RefContext = seqParser.RefContext;

// @ts-expect-error -- ANTLR generated code
RefContext.prototype.Content = function () {
  return this.name()[0];
};

// @ts-expect-error -- ANTLR generated code
RefContext.prototype.Participants = function () {
  return this.name().slice(1) ?? [];
};
