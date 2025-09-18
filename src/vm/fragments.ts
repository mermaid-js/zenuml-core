import { formattedTextOf, labelRangeOfRef, labelRangeOfCondition, codeRangeOf } from "@/parser/helpers";
import { CodeRange } from "@/parser/CodeRange";
import { blockLength } from "@/utils/Numbering";
import { buildBlockVM } from "@/vm/block";

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

export interface AltVM {
  blockLengthAcc: number[];
  ifConditionVM: ConditionVM | null;
  ifBlockVM: any | null; // BlockVM
  elseIfBlocks: Array<{
    conditionVM: ConditionVM | null;
    blockVM: any | null; // BlockVM
  }>;
  elseBlockVM: any | null; // BlockVM
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

/**
 * Build AltVM from alt context
 */
export function buildAltVM(context: any): AltVM | null {
  if (!context) return null;
  
  const alt = context.alt?.();
  if (!alt) return null;
  
  const ifBlock = alt.ifBlock?.();
  const elseIfBlocks = alt.elseIfBlock?.() || [];
  const elseBlock = alt.elseBlock?.()?.braceBlock?.()?.block?.();
  const blockInIfBlock = ifBlock?.braceBlock?.()?.block?.();
  
  // Helper functions
  function conditionFromIfElseBlock(block: any) {
    return block?.parExpr?.()?.condition?.();
  }

  function blockInElseIfBlock(block: any) {
    return block?.braceBlock?.()?.block?.();
  }
  
  // Build block length accumulator
  const blockLengthAcc: number[] = [blockInIfBlock ? blockLength(blockInIfBlock) : 0];
  if (elseIfBlocks.length > 0) {
    elseIfBlocks.forEach((block: any) => {
      const elseIfBlockContent = blockInElseIfBlock(block);
      blockLengthAcc.push(blockLengthAcc[blockLengthAcc.length - 1] + (elseIfBlockContent ? blockLength(elseIfBlockContent) : 0));
    });
  }
  
  // Build if condition and block VMs
  const ifCondition = conditionFromIfElseBlock(ifBlock);
  const ifConditionVM = buildConditionVM(ifCondition);
  const ifBlockVM = blockInIfBlock ? buildBlockVM(blockInIfBlock) : null;
  
  // Build elseIf blocks VMs
  const elseIfBlocksVM = elseIfBlocks.map((elseIfBlock: any) => {
    const condition = conditionFromIfElseBlock(elseIfBlock);
    const conditionVM = buildConditionVM(condition);
    const blockVM = blockInElseIfBlock(elseIfBlock) ? buildBlockVM(blockInElseIfBlock(elseIfBlock)) : null;
    
    return {
      conditionVM,
      blockVM,
    };
  });
  
  // Build else block VM
  const elseBlockVM = elseBlock ? buildBlockVM(elseBlock) : null;
  
  return {
    blockLengthAcc,
    ifConditionVM,
    ifBlockVM,
    elseIfBlocks: elseIfBlocksVM,
    elseBlockVM,
  };
}
