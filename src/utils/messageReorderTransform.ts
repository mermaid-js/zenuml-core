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
  const adjustedTargetStart = sourceBeforeTarget
    ? targetLineStart - sourceText.length
    : targetLineStart;
  const adjustedTargetEnd = sourceBeforeTarget
    ? targetLineEnd - sourceText.length
    : targetLineEnd;
  const insertionPoint = place === "before" ? adjustedTargetStart : adjustedTargetEnd;
  const movedText =
    insertionPoint < withoutSource.length && !sourceText.endsWith("\n")
      ? `${sourceText}\n`
      : sourceText;

  return (
    withoutSource.slice(0, insertionPoint) +
    movedText +
    withoutSource.slice(insertionPoint)
  );
};
