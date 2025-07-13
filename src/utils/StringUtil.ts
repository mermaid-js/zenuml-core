import pipe from "ramda/src/pipe";
import replace from "ramda/src/replace";

const removeChangeLines = replace(/[\n\r]/g, " ");
const removeExtraSpaces = replace(/\s+/g, " ");
const removeSpaceBeforeAndAfterPunctuation = replace(/\s*([,;.])\s*/g, "$1");
const removeSpacesBeforeAndInsideBrackets = replace(
  /\s*(\()\s*|\s*(\))/g,
  "$1$2",
);
const removeTrailingSpace = replace(/\s+$/g, "");
const removeLeadingAndEndingQuotes = replace(/^"(.*)"$/, "$1");
export const formatText = pipe(
  removeChangeLines,
  removeExtraSpaces,
  removeSpaceBeforeAndAfterPunctuation,
  removeSpacesBeforeAndInsideBrackets,
  removeTrailingSpace,
  removeLeadingAndEndingQuotes,
);

export const getLineHead = (code: string, position: number) => {
  let i = position;
  if (code[i] === "\n") i--;
  while (i >= 0) {
    if (code[i] === "\n") return i + 1;
    i--;
  }
  return 0;
};
export const getLineTail = (code: string, position: number) => {
  let i = position;
  while (code[i] && code[i] !== "\n") {
    i++;
  }
  return i;
};
export const getCurrentLine = (code: string, position: number) => {
  const lineHead = getLineHead(code, position);
  const lineTail = getLineTail(code, position);
  return code.slice(lineHead, lineTail + 1);
};
export const getPrevLineHead = (code: string, position: number) => {
  const lineHead = getLineHead(code, position);
  if (lineHead === 0) return 0;
  let i = lineHead - 2;
  while (i >= 0) {
    if (code[i] === "\n") return i + 1;
    i--;
  }
  return null;
};
export const getPrevLine = (code: string, position: number) => {
  const lineHead = getLineHead(code, position);
  if (lineHead === 0) return "";
  const prevLineHead = getPrevLineHead(code, position) || 0;
  return code.slice(prevLineHead, lineHead);
};
export const getLeadingSpaces = (str: string) => {
  return str.match(/^[ ]*/)?.[0] || "";
};
export const getPrevNotCommentLine = (
  code: string,
  position: number,
): string => {
  const prevLine = getPrevLine(code, position);
  if (prevLine.trim().startsWith("//")) {
    return getPrevNotCommentLine(code, getPrevLineHead(code, position) || 0);
  }
  return prevLine;
};
export const getPrevNotCommentLineHead = (
  code: string,
  position: number,
): number => {
  const prevLineHead = getPrevLineHead(code, position) || 0;
  if (prevLineHead === 0) return 0;
  const prevLine = getPrevLine(code, position);
  if (prevLine.trim().startsWith("//")) {
    return getPrevNotCommentLineHead(code, prevLineHead);
  }
  return prevLineHead;
};
export const getPrevNotCommentLineTail = (
  code: string,
  position: number,
): number => {
  const lineHead = getLineHead(code, position);
  const prevLine = getPrevLine(code, position);
  if (prevLine.trim().startsWith("//")) {
    return getPrevNotCommentLineTail(code, lineHead - 1);
  }
  return lineHead - 1;
};
