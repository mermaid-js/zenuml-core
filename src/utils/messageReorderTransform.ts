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
  const withoutSource = code.slice(0, sourceLineStart) + code.slice(sourceLineEnd);
  const sourceBeforeTarget = sourceLineStart < targetLineStart;
  const targetLineStartInWithoutSource = sourceBeforeTarget
    ? targetLineStart - sourceText.length
    : targetLineStart;
  const targetLineEndInWithoutSource = lineTail(
    withoutSource,
    targetLineStartInWithoutSource,
  );
  const insertionPoint = place === "before"
    ? targetLineStartInWithoutSource
    : targetLineEndInWithoutSource;
  const needsLeadingNewline =
    insertionPoint > 0 &&
    withoutSource[insertionPoint - 1] !== "\n" &&
    !sourceText.startsWith("\n");
  const needsTrailingNewline =
    insertionPoint < withoutSource.length &&
    withoutSource[insertionPoint] !== "\n" &&
    !sourceText.endsWith("\n");
  const movedText = `${needsLeadingNewline ? "\n" : ""}${sourceText}${
    needsTrailingNewline ? "\n" : ""
  }`;

  return (
    withoutSource.slice(0, insertionPoint) +
    movedText +
    withoutSource.slice(insertionPoint)
  );
};
