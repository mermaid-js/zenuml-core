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
 * Build OccurrenceVM from pre-computed MessageVM occurrence data and participant info
 */
export function buildOccurrenceVM(
  messageVM: import("./messages").MessageVM | null,
  participant: string,
  centerPosition: number,
  rightToLeft: boolean = false,
): OccurrenceVM | undefined {
  if (!messageVM?.occurrence) {
    return undefined;
  }

  return {
    participant,
    hasStatements: messageVM.occurrence.hasStatements,
    hasNonReturnStatements: messageVM.occurrence.hasNonReturnStatements,
    centerPosition,
    rightToLeft,
    blockVM: messageVM.occurrence.blockVM,
  };
}
