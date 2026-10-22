import sequenceParser from "../generated-parser/sequenceParser";
import type { AntlrNode, AugmentedContext } from "./AntlrTypes";

interface TitleContextInstalled extends AugmentedContext {
  children: AntlrNode[];
  content(): string;
}

const seqParser = sequenceParser;
const TitleContext = seqParser.TitleContext as any as {
  prototype: TitleContextInstalled;
};
TitleContext.prototype.content = function (this: TitleContextInstalled) {
  if (this.children.length < 2) {
    return "";
  } else {
    return this.children[1].getText!().trim();
  }
};
