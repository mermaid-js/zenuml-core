import { buildBlockVM } from "./block";

export interface OccurrenceVM {
  /** The participant this occurrence belongs to */
  participant: string;
  
  /** Whether this occurrence has any statements (for collapse button) */
  hasStatements: boolean;
  
  /** Whether this occurrence has any statements except return statements */
  hasNonReturnStatements: boolean;
  
  /** The center position for this participant */
  centerPosition: number;
  
  /** Whether the occurrence should be right-to-left */
  rightToLeft: boolean;
  
  /** Pre-built BlockVM for nested rendering */
  blockVM?: import("./block").BlockVM;
}

/**
 * Build OccurrenceVM from occurrence context and participant data
 */
export function buildOccurrenceVM(
  context: any,
  participant: string,
  centerPosition: number,
  rightToLeft: boolean = false,
): OccurrenceVM | undefined {
  if (!context) {
    return undefined;
  }

  // Check if has brace block and statements
  const braceBlock = context.braceBlock?.();
  const stats = braceBlock?.block?.()?.stat?.() || [];
  const hasStatements = stats.length > 0;
  
  // Check if has any statements except return statements
  const hasNonReturnStatements = (() => {
    if (stats.length > 1) return true;
    // When the only one statement is not the RetContext
    return stats.length === 1 && stats[0]["ret"]?.() == null;
  })();

  return {
    participant,
    hasStatements,
    hasNonReturnStatements,
    centerPosition,
    rightToLeft,
    blockVM: braceBlock?.block?.() ? buildBlockVM(braceBlock.block()) : undefined,
  };
}
