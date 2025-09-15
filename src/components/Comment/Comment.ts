import { CSSProperties } from "react";
import { getStyle } from "@/utils/messageStyling";

function parseLine(input: string): [string[], string[], string[], string] {
  // <red> controls comment only;
  // (red) controls message only;
  // [red] controls both comment and message.
  const result = {
    "<>": new Set<string>(),
    "()": new Set<string>(),
    "[]": new Set<string>(),
  };
  const pattern = /<([^>]*)>|\(([^)]*)\)|\[([^\]]*)\]|([^<>()[\]\s]+)/g;
  let match;
  let lastMatchIndex: number | undefined;
  while ((match = pattern.exec(input))) {
    if (match[4]) {
      if (lastMatchIndex !== undefined) lastMatchIndex = match.index;
      // non-empty character outside brackets is encountered
      break;
    }
    lastMatchIndex = match.index + match[0].length;
    if (match[1]) {
      match[1].split(",").forEach((s) => result["<>"].add(s.trim()));
    }
    if (match[2]) {
      match[2].split(",").forEach((s) => result["()"].add(s.trim()));
    }
    if (match[3]) {
      match[3].split(",").forEach((s) => result["[]"].add(s.trim()));
    }
  }

  return [
    Array.from(result["<>"]),
    Array.from(result["()"]),
    Array.from(result["[]"]),
    input.slice(lastMatchIndex),
  ];
}
export default class CommentClass {
  // define properties color and text
  public text: string = "";
  /** @deprecated use commentStyle or messageStyle instead */
  public classNames: string[] = [];
  /** @deprecated use commentClassNames or messageClassNames instead */
  public textStyle: CSSProperties = {};

  public commentStyle: CSSProperties = {};
  public messageStyle: CSSProperties = {};
  public commentClassNames: string[] = [];
  public messageClassNames: string[] = [];

  // Raw comment contains all spaces and newlines
  constructor(raw: string) {
    // Split by newlines, handling both with and without trailing newline
    const lines = raw.trim().split("\n");
    const lastLine = lines[lines.length - 1];
    const [commentOnlyStyles, messageOnlyStyles, commonStyles, text] =
      parseLine(lastLine);

    const { textStyle: commentStyle, classNames: commentClassNames } =
      getStyle(commentOnlyStyles);
    const { textStyle: messageStyle, classNames: messageClassNames } =
      getStyle(messageOnlyStyles);
    const { textStyle: commonStyle, classNames: commonClassNames } =
      getStyle(commonStyles);

    this.text = (
      lines.slice(0, lines.length - 1).join("\n") +
      "\n" +
      text
    ).trim();
    this.textStyle = { ...commonStyle, ...commentStyle, ...messageStyle };
    this.classNames = [
      ...commonClassNames,
      ...commentClassNames,
      ...messageClassNames,
    ];
    this.commentStyle = { ...commonStyle, ...commentStyle };
    this.messageStyle = { ...commonStyle, ...messageStyle };
    this.commentClassNames = [...commonClassNames, ...commentClassNames];
    this.messageClassNames = [...commonClassNames, ...messageClassNames];
  }
}
