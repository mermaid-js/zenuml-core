import { default as sequenceParser } from "../generated-parser/sequenceParser";

const seqParser = sequenceParser;
const RefContext = seqParser.RefContext;

// @ts-ignore
RefContext.prototype.Content = function () {
  return this.name()[0];
};

// @ts-ignore
RefContext.prototype.Participants = function () {
  return this.name().slice(1) ?? [];
};
