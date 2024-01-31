import { getContextType } from "./Context";

export const blockLength = (block: any): number => {
  if (block && block.stat()) {
    return block.stat().filter((s: any) => getContextType(s) !== "Divider")
      .length;
  }
  return 0;
};

export const increaseNumber = (number: string, value: number) => {
  if (number) {
    const arr: Array<number | string> = number.split(".");
    arr[arr.length - 1] = Number(arr[arr.length - 1]) + value;
    return arr.join(".");
  } else {
    return String(value);
  }
};
