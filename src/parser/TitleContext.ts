import sequenceParser from "../generated-parser/sequenceParser";
import { augment, type TitleContextAugmented } from "./ContextAugmentations";

const seqParser = sequenceParser;
augment<TitleContextAugmented>(seqParser.TitleContext, {
  content() {
    if (this.children.length < 2) {
      return "";
    } else {
      return this.children[1].getText!().trim();
    }
  },
});
