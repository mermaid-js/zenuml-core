import { getLineHead } from "@/utils/StringUtil";

type ReorderMessageInput = {
  code: string;
  sourceRange: [number, number];
  targetRange: [number, number];
  place: "before" | "after";
};

const lineTail = (code: string, index: number) => {
  const next = code.indexOf("\n", index);
  return next === -1 ? code.length : next + 1;
};

const getIndent = (line: string) => line.match(/^\s*/)?.[0] ?? "";

const getBaseIndent = (text: string) => {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return "";
  }
  return getIndent(lines[0]);
};

const shiftIndent = (text: string, indentDelta: number) =>
  text
    .split("\n")
    .map((line) => {
      if (line.length === 0) {
        return line;
      }
      if (indentDelta > 0) {
        return `${" ".repeat(indentDelta)}${line}`;
      }
      if (indentDelta < 0) {
        const trimCount = Math.min(getIndent(line).length, Math.abs(indentDelta));
        return line.slice(trimCount);
      }
      return line;
    })
    .join("\n");

export const reorderMessageInDsl = ({
  code,
  sourceRange,
  targetRange,
  place,
}: ReorderMessageInput) => {
  const [sourceStart, sourceEnd] = sourceRange;
  const [targetStart, targetEnd] = targetRange;
  const sourceLineStart = getLineHead(code, sourceStart);
  const sourceLineEnd = lineTail(code, sourceEnd);
  const targetLineStart = getLineHead(code, targetStart);
  const targetLineEnd = lineTail(code, targetEnd);

  if (sourceLineStart === targetLineStart) {
    return code;
  }

  const sourceText = code.slice(sourceLineStart, sourceLineEnd);
  const targetText = code.slice(targetLineStart, targetLineEnd);
  const withoutSource = code.slice(0, sourceLineStart) + code.slice(sourceLineEnd);
  const sourceBeforeTarget = sourceLineStart < targetLineStart;
  const targetLineStartInWithoutSource = sourceBeforeTarget
    ? targetLineStart - sourceText.length
    : targetLineStart;
  const targetLineEndInWithoutSource = sourceBeforeTarget
    ? targetLineEnd - sourceText.length
    : targetLineEnd;
  const insertionPoint = place === "before"
    ? targetLineStartInWithoutSource
    : targetLineEndInWithoutSource;
  const sourceIndent = getBaseIndent(sourceText).length;
  const targetIndent = getBaseIndent(targetText).length;
  const movedBlock = shiftIndent(sourceText, targetIndent - sourceIndent);
  const needsLeadingNewline =
    insertionPoint > 0 &&
    withoutSource[insertionPoint - 1] !== "\n" &&
    !movedBlock.startsWith("\n");
  const needsTrailingNewline =
    insertionPoint < withoutSource.length &&
    withoutSource[insertionPoint] !== "\n" &&
    !movedBlock.endsWith("\n");
  const movedText = `${needsLeadingNewline ? "\n" : ""}${movedBlock}${
    needsTrailingNewline ? "\n" : ""
  }`;

  return (
    withoutSource.slice(0, insertionPoint) +
    movedText +
    withoutSource.slice(insertionPoint)
  );
};
