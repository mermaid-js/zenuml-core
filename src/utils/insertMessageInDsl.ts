import { getLineHead } from "@/utils/StringUtil";

type InsertMessageInput = {
  code: string;
  from: string;
  to: string;
  signature?: string;
  blockContext?: any;
  hostContext?: any;
  insertIndex: number;
};

const lineTail = (code: string, index: number) => {
  const next = code.indexOf("\n", index);
  return next === -1 ? code.length : next + 1;
};

const quoteParticipantIfNecessary = (participant: string) => {
  if (participant.includes(" ")) {
    return `"${participant}"`;
  }
  return participant;
};

export const insertMessageInDsl = ({
  code,
  from,
  to,
  signature = "newMessage()",
  blockContext,
  hostContext,
  insertIndex,
}: InsertMessageInput) => {
  const quotedFrom = quoteParticipantIfNecessary(from);
  const quotedTo = quoteParticipantIfNecessary(to);
  const line = `${quotedFrom}->${quotedTo}.${signature}`;
  const resolvedBlockContext =
    blockContext ?? hostContext?.braceBlock?.()?.block?.();
  const statements: any[] = resolvedBlockContext?.stat?.() || [];

  if (!resolvedBlockContext && hostContext) {
    const lineStart = getLineHead(code, hostContext.start.start);
    const lineEnd = lineTail(code, hostContext.stop.stop);
    const originalLine = code.slice(lineStart, lineEnd).replace(/\n$/, "");
    const indent = originalLine.match(/^\s*/)?.[0] ?? "";
    const trimmedLine = originalLine.trimStart();
    const innerIndent = `${indent}  `;
    const trailingNewline =
      lineEnd > 0 && code[lineEnd - 1] === "\n" ? "\n" : "";
    const replacement = `${indent}${trimmedLine} {\n${innerIndent}${line}\n${indent}}${trailingNewline}`;
    const labelStart =
      lineStart +
      `${indent}${trimmedLine} {\n${innerIndent}${quotedFrom}->${quotedTo}.`
        .length;
    const labelEnd = labelStart + signature.length - 1;

    return {
      code: code.slice(0, lineStart) + replacement + code.slice(lineEnd),
      labelPosition: [labelStart, labelEnd] as [number, number],
    };
  }

  if (statements.length === 0) {
    const prefix =
      code.endsWith("\n") || code.length === 0 ? code : `${code}\n`;
    const start = prefix.length + `${quotedFrom}->${quotedTo}.`.length;
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
  const labelStart = actualLineStart + `${quotedFrom}->${quotedTo}.`.length;
  const labelEnd = labelStart + signature.length - 1;

  return {
    code: newCode,
    labelPosition: [labelStart, labelEnd] as [number, number],
  };
};
