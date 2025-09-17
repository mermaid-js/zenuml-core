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

// Utilities for a single-pass, semantic parse of surrounding lines
const getLineStarts = (code: string, startOffset: number) => {
  const lineStart = getLineHead(code, startOffset);
  const prevLineStart = getPrevLineHead(code, startOffset);
  const prevLineText = getPrevLine(code, startOffset);
  return { lineStart, prevLineStart, prevLineText };
};

const getIndentAt = (code: string, lineStart: number) =>
  code.slice(lineStart).match(/^\s*/)?.[0] || "";

const parsePrevComment = (
  prevLine: string,
): { exists: boolean; styles: string[]; suffix: string } => {
  const line = prevLine.replace(/[\r\n]+$/, "");
  const m = line.match(/^\s*\/\/\s*(?:\[([^\]]*)\])?\s*(.*)$/);
  if (!m) return { exists: false, styles: [], suffix: "" };
  const styles = (m[1] || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const suffix = (m[2] || "").trim();
  return { exists: true, styles, suffix };
};

// Extracts the free-text part after optional style brackets in a comment line.
// Examples:
//   "// note here"            -> "note here"
//   "  //   [bold]  note"     -> "note"
//   "// [bold,italic]"        -> ""
//   "not a comment line"      -> "not a comment line" (fallback)
const formatCommentLine = (
  leadingSpaces: string,
  styles: string[],
  suffix: string,
) => {
  const styleList = styles.filter(Boolean).join(", ");
  const suffixSegment = suffix ? ` ${suffix}` : "";
  const line = `${leadingSpaces}// [${styleList}]${suffixSegment}`;
  return line.endsWith("\n") ? line : `${line}\n`;
};

export const applyStyleToggle = (
  code: string,
  selection: SelectionContext,
  style: string,
) => {
  const { anchor, comment } = selection;
  const start= comment.exists ? comment.replaceHead : anchor.lineStart;

  const styles = toggleStyle(comment.styles, style);
  const commentLine = formatCommentLine(comment.leading, styles, comment.suffix);
  return code.slice(0, start) +  commentLine + code.slice(anchor.lineStart);
};

export const analyzeStyleSelection = (
  code: string,
  startOffset: number,
) => {
  const { lineStart, prevLineStart, prevLineText } = getLineStarts(code, startOffset);
  const leading = getIndentAt(code, lineStart);
  const exists = prevLineText.trim().startsWith("//");
  const parsed = exists ? parsePrevComment(prevLineText) : { exists: false, styles: [], suffix: "" };
  const { styles, suffix } = parsed;
  const replaceHead = prevLineStart;

  const selection: SelectionContext = {
    anchor: {
      start: startOffset,
      lineStart,
    },
    comment: {
      exists,
      leading,
      styles,
      suffix,
      replaceHead,
    },
  };

  return { selection };
};
