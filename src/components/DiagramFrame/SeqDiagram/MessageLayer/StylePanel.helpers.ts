import { getLineHead, getPrevLine, getPrevLineHead } from "@/utils/StringUtil";

export type MessageSelection = {
  start: number;
  lineHead: number;
  prevLine: string;
  leadingSpaces: string;
  prevLineIsComment: boolean;
  hasStyleBrackets: boolean;
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
    return prevLine.slice(closingIndex + 1).trimStart();
  }

  const commentIndex = prevLine.indexOf("//");
  if (commentIndex === -1) return prevLine.trim();
  return prevLine.slice(commentIndex + 2).trimStart();
};

const formatCommentLine = (
  leadingSpaces: string,
  styles: string[],
  suffix: string
) => {
  const styleList = styles.filter(Boolean).join(", ");
  const suffixSegment = suffix ? ` ${suffix}` : " ";
  return `${leadingSpaces}// [${styleList}]${suffixSegment}`;
};

const ensureTrailingNewline = (value: string) =>
  value.endsWith("\n") ? value : `${value}\n`;

export const buildUpdatedCode = (
  code: string,
  message: MessageSelection,
  style: string,
  existingStyles: string[]
) => {
  if (!message.prevLineIsComment) {
    const commentLine = `${message.leadingSpaces}// [${style}]\n`;
    return (
      code.slice(0, message.lineHead) + commentLine + code.slice(message.lineHead)
    );
  }

  const styles = message.hasStyleBrackets
    ? toggleStyle(existingStyles, style)
    : [style];

  const commentLine = ensureTrailingNewline(
    formatCommentLine(
      message.leadingSpaces,
      styles,
      extractCommentSuffix(message.prevLine, message.hasStyleBrackets)
    )
  );

  const commentHead = getPrevLineHead(code, message.start);
  return code.slice(0, commentHead) + commentLine + code.slice(message.lineHead);
};

export const analyzeMessageSelection = (
  code: string,
  startOffset: number
) => {
  const lineHead = getLineHead(code, startOffset);
  const prevLine = getPrevLine(code, startOffset);
  const leadingSpaces = code.slice(lineHead).match(/^\s*/)?.[0] || "";
  const prevLineTrimmed = prevLine.trim();
  const prevLineIsComment = prevLineTrimmed.startsWith("//");
  const trimmedPrevLine = prevLine.trimStart();
  const commentBody = trimmedPrevLine.startsWith("//")
    ? trimmedPrevLine.slice(2).trimStart()
    : "";
  const styleStart = commentBody.indexOf("[");
  const styleEnd = commentBody.indexOf("]");
  const hasStyleBrackets = prevLineIsComment && styleStart === 0 && styleEnd > styleStart;

  const existingStyles = extractExistingStyles(commentBody, hasStyleBrackets);

  const selection: MessageSelection = {
    start: startOffset,
    lineHead,
    prevLine,
    leadingSpaces,
    prevLineIsComment,
    hasStyleBrackets,
  };

  return { selection, existingStyles };
};
