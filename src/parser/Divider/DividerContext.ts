import sequenceParser from "../../generated-parser/sequenceParser";
import { augment, type DividerContextAugmented } from "../ContextAugmentations";

const seqParser = sequenceParser;
const DividerContext = seqParser.DividerContext;

augment<DividerContextAugmented>(DividerContext, {
  Note() {
    const formattedText = this.dividerNote()?.getFormattedText().trim();
    // throw error if formattedText does not start with '=='
    if (!formattedText!.startsWith("==")) {
      throw new Error("Divider note must start with ==");
    }
    // trim leading and trailing '=' characters
    return formattedText?.replace(/^=+|=+$/g, "") as string;
  },
});
