import { getLineHead, getPrevLine, getPrevLineHead } from "@/utils/StringUtil";

const COMMENT_PREFIX = "//";

export type StyleComment = {
  isComment: boolean;
  hasStyleBrackets: boolean;
  styles: string[];
};

/**
 * Parse the line above a message for an existing `// [style, ...] note`
 * annotation.
 *
 * `styleEnd` used to come straight from `indexOf`, whose `-1` "not found"
 * result is truthy — a comment with an unclosed `[` (`// [todo unclosed`)
 * was read as carrying a style list anyway, off a garbage slice.
 */
export const parseStyleComment = (prevLine: string): StyleComment => {
  const trimmed = prevLine.trim();
  if (!trimmed.startsWith(COMMENT_PREFIX)) {
    return { isComment: false, hasStyleBrackets: false, styles: [] };
  }
  const afterMarker = trimmed.slice(COMMENT_PREFIX.length).trimStart();
  const styleStart = afterMarker.indexOf("[");
  const styleEnd = afterMarker.indexOf("]");
  const hasStyleBrackets = styleStart === 0 && styleEnd > 0;
  if (!hasStyleBrackets) {
    return { isComment: true, hasStyleBrackets: false, styles: [] };
  }
  const styles = afterMarker
    .slice(styleStart + 1, styleEnd)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return { isComment: true, hasStyleBrackets: true, styles };
};

/**
 * Toggle `style` on the `// [...]` annotation above the message that starts
 * at `messageStart`, returning the whole document with that annotation line
 * added, updated, or removed.
 */
export const toggleMessageStyle = ({
  code,
  messageStart,
  style,
}: {
  code: string;
  messageStart: number;
  style: string;
}): string => {
  const lineHead = getLineHead(code, messageStart);
  const leadingSpaces = code.slice(lineHead).match(/^\s*/)?.[0] ?? "";
  const prevLine = getPrevLine(code, messageStart);
  const parsed = parseStyleComment(prevLine);

  if (!parsed.isComment) {
    return (
      code.slice(0, lineHead) +
      `${leadingSpaces}${COMMENT_PREFIX} [${style}]\n` +
      code.slice(lineHead)
    );
  }

  const prevLineHead = getPrevLineHead(code, messageStart);
  const prevIndent = prevLine.match(/^\s*/)?.[0] ?? "";

  if (parsed.hasStyleBrackets) {
    const nextStyles = parsed.styles.includes(style)
      ? parsed.styles.filter((s) => s !== style)
      : [...parsed.styles, style];
    // `hasStyleBrackets` already guarantees a "]" exists, so `indexOf` here
    // is unambiguous — no falsy-zero fallback needed.
    const note = prevLine.slice(prevLine.indexOf("]") + 1).trim();

    if (nextStyles.length === 0) {
      // No styles left: drop the annotation line entirely if it carried no
      // other note, otherwise keep the note as a plain comment.
      const newLine = note ? `${prevIndent}${COMMENT_PREFIX} ${note}\n` : "";
      return code.slice(0, prevLineHead) + newLine + code.slice(lineHead);
    }

    const newLine = `${prevIndent}${COMMENT_PREFIX} [${nextStyles.join(", ")}]${
      note ? ` ${note}` : ""
    }\n`;
    return code.slice(0, prevLineHead) + newLine + code.slice(lineHead);
  }

  // A comment exists but carries no style brackets yet — add the first one.
  const note = prevLine.slice(prevLine.indexOf(COMMENT_PREFIX) + 2).trim();
  const newLine = `${prevIndent}${COMMENT_PREFIX} [${style}]${
    note ? ` ${note}` : ""
  }\n`;
  return code.slice(0, prevLineHead) + newLine + code.slice(lineHead);
};
