import { specialCharRegex } from "@/functions/useEditLabel";

export const syncMessageNormalizer = (text: string): string => {
  let result = text.replace(/\s+/g, " ");
  if (specialCharRegex.test(result)) {
    result = result.replace(/"/g, "");
    result = `"${result}"`;
    specialCharRegex.lastIndex = 0;
  }
  return result;
};

export const asyncMessageNormalizer = (text: string): string => {
  return text.replace(/\s+/g, " ");
};

