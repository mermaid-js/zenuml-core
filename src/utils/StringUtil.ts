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
export const getPrevLineHead = (code: string, position: number) => {
  const lineHead = getLineHead(code, position);
  if (lineHead === 0) return 0;
  let i = lineHead - 2;
  while (i >= 0) {
    if (code[i] === "\n") return i + 1;
    i--;
  }
  return 0;
};
export const getPrevLine = (code: string, position: number) => {
  const lineHead = getLineHead(code, position);
  if (lineHead === 0) return "";
  const prevLineHead = getPrevLineHead(code, position);
  return code.slice(prevLineHead, lineHead);
};
