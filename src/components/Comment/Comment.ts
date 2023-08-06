import { CSSProperties } from "vue";
import { getStyle } from "@/utils/messageStyling";

function splitStringWithBrackets(input: string) {
  const startIndex = input.indexOf("[");
  const endIndex = input.indexOf("]", startIndex);
  if (startIndex !== -1 && endIndex !== -1 && input.trim().indexOf("[") === 0) {
    return [input.slice(startIndex + 1, endIndex), input.slice(endIndex + 1)];
  }
  return ["", input];
}

export default class Comment {
  // define properties color and text
  public text: string;
  public textStyle: CSSProperties = {};
  public classNames: string[] = [];

  // Raw comment contains all spaces and newlines
  constructor(raw: string) {
    const lines = raw.split("\n");

    const styles = lines.reduce((acc, line) => {
      const [style] = splitStringWithBrackets(line);
      if (style) {
        acc = [...acc, ...style.split(",").map((s) => s.trim())];
      }
      return acc;
    }, [] as string[]);
    const { textStyle, classNames } = getStyle(styles);
    this.textStyle = textStyle;
    this.classNames = classNames;

    this.text = lines.reduce((acc, line) => {
      const [, text] = splitStringWithBrackets(line);
      if (acc && text) {
        return `${acc}\n${text}`
      }
      return acc || text;
    }, '').trimEnd()
  }
}
