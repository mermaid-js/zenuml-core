export type WrapFragmentType = "alt" | "loop" | "opt" | "par";

type WrapMessageInput = {
  code: string;
  line: string;
  lineHead: number;
  type: WrapFragmentType;
};

const wrapHeader = (type: WrapFragmentType) => {
  switch (type) {
    case "alt":
      return "if(condition) {";
    case "loop":
      return "loop(condition) {";
    case "opt":
      return "opt(condition) {";
    case "par":
      return "par(condition) {";
  }
};

const conditionOffset = (type: WrapFragmentType) => {
  switch (type) {
    case "alt":
      return "if(".length;
    case "loop":
    case "opt":
    case "par":
      return `${type}(`.length;
  }
};

export const wrapMessageInFragment = ({
  code,
  line,
  lineHead,
  type,
}: WrapMessageInput) => {
  const indent = line.match(/^\s*/)?.[0] ?? "";
  const trimmed = line.trimStart();
  const header = wrapHeader(type);
  const innerIndent = `${indent}  `;
  const replacement = `${indent}${header}\n${innerIndent}${trimmed}\n${indent}}`;
  const lineTail = lineHead + line.length;
  const nextCode = code.slice(0, lineHead) + replacement + code.slice(lineTail);
  const conditionStart = lineHead + indent.length + conditionOffset(type);
  const conditionEnd = conditionStart + "condition".length - 1;
  return {
    code: nextCode,
    conditionPosition: [conditionStart, conditionEnd] as [number, number],
  };
};
