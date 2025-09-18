import { formattedTextOf, labelRangeOfRef, labelRangeOfCondition, codeRangeOf } from "@/parser/helpers";
import { CodeRange } from "@/parser/CodeRange";

export interface RefVM {
  labelText: string;
  labelRange: [number, number] | null;
  codeRange: CodeRange | null;
}

export interface ConditionVM {
  labelText: string;
  labelRange: [number, number] | null;
  codeRange: CodeRange | null;
}

/**
 * Build RefVM from ref context
 */
export function buildRefVM(context: any): RefVM | null {
  if (!context) return null;
  
  const refCtx = context?.ref?.();
  if (!refCtx) return null;
  
  const content = refCtx?.Content?.();
  const labelText = formattedTextOf(content) || "";
  const labelRange = labelRangeOfRef(refCtx);
  const codeRange = codeRangeOf(context);
  
  return {
    labelText,
    labelRange,
    codeRange,
  };
}

/**
 * Build ConditionVM from condition context
 */
export function buildConditionVM(context: any): ConditionVM | null {
  if (!context) return null;
  
  const labelText = formattedTextOf(context) || "";
  const labelRange = labelRangeOfCondition(context);
  const codeRange = codeRangeOf(context);
  
  return {
    labelText,
    labelRange,
    codeRange,
  };
}
