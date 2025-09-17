import { getLineHead, getPrevLine, getPrevLineHead } from "@/utils/StringUtil";

// Range semantics:
// - Offsets are absolute indices into the code string
// - anchor.lineStart and comment.replaceHead are start indices (inclusive)
// - Where a range end is needed, we compute it on demand

export type Offset = number;

export type SelectionContext = {
  anchor: {
    // Message start anchor (start of the statement token)
    start: Offset;
    // Line start offset of the message line
    lineStart: Offset;
  };
  comment: {
    // Whether there is a comment line immediately above the message
    exists: boolean;
    // Whether the comment starts with a style bracket list like: // [a, b]
    hasBrackets: boolean;
    // Indentation of the message line to preserve formatting
    leading: string;
    // Parsed styles from the bracket list (empty when no brackets)
    styles: string[];
    // The suffix comment text after the bracket list or after // when no brackets
    suffix: string;
    // Absolute offset of the previous line's head (start of the comment line)
    replaceHead: Offset;
  };
};

const toggleStyle = (styles: string[], style: string) =>
  styles.includes(style)
    ? styles.filter((existingStyle) => existingStyle !== style)
    : [...styles, style];

const extractExistingStyles = (commentBody: string, hasStyleBrackets: boolean) => {
  if (!hasStyleBrackets) return [];

  const styleStart = commentBody.indexOf("[");
  const styleEnd = commentBody.indexOf("]");

  if (styleStart !== 0 || styleEnd <= styleStart) return [];

  return commentBody
    .slice(styleStart + 1, styleEnd)
    .split(",")
    .map((style) => style.trim())
    .filter(Boolean);
};

const extractCommentSuffix = (prevLine: string, hasStyleBrackets: boolean) => {
  if (!prevLine) return "";

  if (hasStyleBrackets) {
    const closingIndex = prevLine.indexOf("]");
    if (closingIndex === -1) return prevLine.trim();
    return prevLine.slice(closingIndex + 1).trim();
  }

  const commentIndex = prevLine.indexOf("//");
  if (commentIndex === -1) return prevLine.trim();
  return prevLine.slice(commentIndex + 2).trim();
};

const formatCommentLine = (
  leadingSpaces: string,
  styles: string[],
  suffix: string,
) => {
  const styleList = styles.filter(Boolean).join(", ");
  const suffixSegment = suffix ? ` ${suffix}` : " ";
  return `${leadingSpaces}// [${styleList}]${suffixSegment}`;
};

const ensureTrailingNewline = (value: string) =>
  value.endsWith("\n") ? value : `${value}\n`;

export const applyStyleToggle = (
  code: string,
  selection: SelectionContext,
  style: string,
) => {
  const { anchor, comment } = selection;
  if (!comment.exists) {
    const commentLine = `${comment.leading}// [${style}]\n`;
    return code.slice(0, anchor.lineStart) + commentLine + code.slice(anchor.lineStart);
  }

  const styles = comment.hasBrackets ? toggleStyle(comment.styles, style) : [style];
  const commentLine = ensureTrailingNewline(
    formatCommentLine(comment.leading, styles, comment.suffix),
  );
  return (
    code.slice(0, comment.replaceHead) +
    commentLine +
    code.slice(anchor.lineStart)
  );
};

export const analyzeStyleSelection = (
  code: string,
  startOffset: number,
) => {
  const lineStart = getLineHead(code, startOffset);
  const prevLine = getPrevLine(code, startOffset);
  const leading = code.slice(lineStart).match(/^\s*/)?.[0] || "";
  const prevLineTrimmed = prevLine.trim();
  const exists = prevLineTrimmed.startsWith("//");
  const trimmedPrevLine = prevLine.trimStart();
  const commentBody = trimmedPrevLine.startsWith("//")
    ? trimmedPrevLine.slice(2).trimStart()
    : "";
  const styleStart = commentBody.indexOf("[");
  const styleEnd = commentBody.indexOf("]");
  const hasBrackets = exists && styleStart === 0 && styleEnd > styleStart;
  const styles = extractExistingStyles(commentBody, hasBrackets);
  const suffix = extractCommentSuffix(prevLine, hasBrackets);
  const replaceHead = getPrevLineHead(code, startOffset);

  const selection: SelectionContext = {
    anchor: {
      start: startOffset,
      lineStart,
    },
    comment: {
      exists,
      hasBrackets,
      leading,
      styles,
      suffix,
      replaceHead,
    },
  };

  return { selection };
};
