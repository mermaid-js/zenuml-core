import { getLineHead } from "@/utils/StringUtil";

type InsertDividerInput = {
  code: string;
  label?: string;
  blockContext: any;
  insertIndex: number;
};

const lineTail = (code: string, index: number) => {
  const next = code.indexOf("\n", index);
  return next === -1 ? code.length : next + 1;
};

export const insertDividerInDsl = ({
  code,
  label = "Divider",
  blockContext,
  insertIndex,
}: InsertDividerInput) => {
  const statements: any[] = blockContext?.stat() || [];
  const line = `==${label}==`;

  let insertionOffset: number;

  if (statements.length === 0) {
    const prefix =
      code.endsWith("\n") || code.length === 0 ? code : `${code}\n`;
    const start = prefix.length + 2; // after ==
    const end = start + label.length - 1;
    return {
      code: `${prefix}${line}`,
      labelPosition: [start, end] as [number, number],
    };
  }

  if (insertIndex >= statements.length) {
    const lastStat = statements[statements.length - 1];
    insertionOffset = lineTail(code, lastStat.stop.stop);
  } else {
    const targetStat = statements[insertIndex];
    insertionOffset = getLineHead(code, targetStat.start.start);
  }

  const needsLeadingNewline =
    insertionOffset > 0 && code[insertionOffset - 1] !== "\n";
  const needsTrailingNewline =
    insertionOffset < code.length && code[insertionOffset] !== "\n";

  const insertedText = `${needsLeadingNewline ? "\n" : ""}${line}${needsTrailingNewline ? "\n" : ""}`;
  const newCode =
    code.slice(0, insertionOffset) + insertedText + code.slice(insertionOffset);

  const actualLineStart = insertionOffset + (needsLeadingNewline ? 1 : 0);
  const labelStart = actualLineStart + 2; // after ==
  const labelEnd = labelStart + label.length - 1;

  return {
    code: newCode,
    labelPosition: [labelStart, labelEnd] as [number, number],
  };
};
