import { getLineHead } from "@/utils/StringUtil";

type InsertMessageInput = {
  code: string;
  from: string;
  to: string;
  signature?: string;
  blockContext: any;
  insertIndex: number;
};

const lineTail = (code: string, index: number) => {
  const next = code.indexOf("\n", index);
  return next === -1 ? code.length : next + 1;
};

export const insertMessageInDsl = ({
  code,
  from,
  to,
  signature = "newMessage()",
  blockContext,
  insertIndex,
}: InsertMessageInput) => {
  const statements: any[] = blockContext?.stat() || [];
  const line = `${from}->${to}.${signature}`;

  if (statements.length === 0) {
    const prefix =
      code.endsWith("\n") || code.length === 0 ? code : `${code}\n`;
    const start = prefix.length + `${from}->${to}.`.length;
    const end = start + signature.length - 1;
    return {
      code: `${prefix}${line}`,
      labelPosition: [start, end] as [number, number],
    };
  }

  let insertionOffset: number;

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
  const labelStart = actualLineStart + `${from}->${to}.`.length;
  const labelEnd = labelStart + signature.length - 1;

  return {
    code: newCode,
    labelPosition: [labelStart, labelEnd] as [number, number],
  };
};
