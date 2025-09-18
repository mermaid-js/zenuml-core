import { formattedTextOf, labelRangeOfRef, labelRangeOfCondition, codeRangeOf } from "@/parser/helpers";
import { CodeRange } from "@/parser/CodeRange";

export interface RefVM {
  id: string;
  labelText: string;
  labelRange: [number, number] | null;
  codeRange: CodeRange | null;
}

export interface ConditionVM {
  id: string;
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
  
  // Generate a unique ID for the ref
  const range = labelRange || codeRangeOf(context)?.toRange();
  const id = range ? `ref:${range[0]}:${range[1]}` : `ref:${Math.random()}`;
  
  return {
    id,
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
  
  // Generate a unique ID for the condition
  const range = labelRange || codeRange?.toRange();
  const id = range ? `condition:${range[0]}:${range[1]}` : `condition:${Math.random()}`;
  
  return {
    id,
    labelText,
    labelRange,
    codeRange,
  };
}
