import { CodeRange } from "@/parser/CodeRange";
export interface ConditionVM {
  labelText: string;
  labelRange: [number, number] | null;
  codeRange: CodeRange | null;
}

export interface AltVM {
  ifConditionVM: ConditionVM | null;
  ifBlockVM: any | null; // BlockVM
  elseIfBlocks: Array<{
    conditionVM: ConditionVM | null;
    blockVM: any | null; // BlockVM
  }>;
  elseBlockVM: any | null; // BlockVM
}

export type FragmentType = 'alt' | 'opt' | 'loop' | 'par' | 'critical' | 'section' | 'tcf' | 'ref';

export interface FragmentData {
  type: FragmentType;
  localParticipantNames: string[];
  frameId: string; // Reference to frame in framesModel
  participantLayers: Record<string, number>; // Pre-computed participant depths
  context?: any; // Temporary: needed for width calculation until we extract message data
  // Additional fragment-specific data as needed
}
// Fragment-specific view models for content rendering (parser-free in components)
export interface LoopVM { conditionVM: ConditionVM | null; blockVM: any | null /* BlockVM */ }
export interface OptVM { blockVM: any | null /* BlockVM */ }
export interface ParVM { blockVM: any | null /* BlockVM */ }
export interface SectionVM { labelText: string; blockVM: any | null /* BlockVM */ }
export interface TcfVM {
  tryBlockVM: any | null /* BlockVM */;
  catchBlocks: Array<{ exceptionText: string; blockVM: any | null /* BlockVM */ }>;
  finallyBlockVM: any | null /* BlockVM */;
}
