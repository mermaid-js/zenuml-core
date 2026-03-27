export const formatText = (text: string): string =>
  text
    .replace(/[\n\r]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s*([,;.])\s*/g, "$1")
    .replace(/\s*(\()\s*|\s*(\))/g, "$1$2")
    .replace(/\s+$/g, "")
    .replace(/^"(.*)"$/, "$1");

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
