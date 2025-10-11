/**
 * Tree Structure IR Type Definitions
 *
 * These interfaces define the contract for the new hierarchical tree structure
 * that will replace the current flat message array approach.
 */

import { IRParticipant } from './participants';
import { IRGroup } from './groups';
import type { CodeRange } from '@/parser/CodeRange';

// ============================================================================
// Core Tree Node Interface
// ============================================================================

/**
 * Core tree node interface representing any statement in the sequence diagram
 */
export interface IRStatement {
  /** Statement type discriminator for type safety */
  kind: StatementKind;

  /** For fragment ref */
  labelText?: string;

  /** Reference to parent statement (undefined for root-level statements) */
  parent?: IRStatement;

  /** Source code position range (optional) */
  range?: [number, number];

  /** Detailed code position information (optional) */
  codeRange?: CodeRange;

  /** Optional comment associated with the statement */
  comment?: string;

  /** Optional nested statements for messages that contain other statements */
  statements: IRStatement[];


  // Message properties (when kind is message/async/creation/return)
  /** Source participant identifier (optional for self-messages) */
  from?: string;

  /** Target participant identifier (optional for creation messages) */
  to?: string;

  /** Message signature/label */
  signature?: string;


  /** Position of message label in source (optional) */
  labelRange?: [number, number];

  /** Explicitly provided source for return messages (optional) */
  providedFrom?: string;

  /** Variable assignment target (optional) */
  assignee?: string;

  /** Number of nested statements */
  statementsCount?: number;

  /** Participants involved in the fragment (for ref fragments) */
  participants?: string[];

  /** Type of fragment */
  fragmentType?: FragmentType;

  /** Fragment condition/guard expression (optional) */
  condition?: string;

  /** Array of blocks for fragment branches (optional - only used in VM layer) */
  blocks?: IRBlock[];

  // Alt fragment specific properties
  /** If block containing statements and condition */
  ifBlock?: {
    kind: StatementKind.If;
    condition?: string;
    parent?: IRStatement;
    statements: IRStatement[];
  };

  /** ElseIf blocks array with their own conditions */
  elseIfBlocks?: Array<{
    kind: StatementKind.ElseIf;
    condition?: string;
    parent?: IRStatement;
    statements: IRStatement[];
  }>;

  /** Else block (optional, no condition) */
  elseBlock?: {
    kind: StatementKind.Else;
    parent?: IRStatement;
    statements: IRStatement[];
  };

  // TCF fragment specific properties
  /** Try block containing statements */
  tryBlock?: {
    kind: StatementKind.Try;
    parent?: IRStatement;
    statements: IRStatement[];
  };

  /** Catch blocks array with their exception text and statements */
  catchBlocks?: Array<{
    kind: StatementKind.Catch;
    parent?: IRStatement;
    exceptionText: string;
    statements: IRStatement[];
  }>;

  /** Finally block (optional) */
  finallyBlock?: {
    kind: StatementKind.Finally;
    parent?: IRStatement;
    statements: IRStatement[];
  };

  // Divider properties (when kind is divider)
  /** Optional divider label */
  label?: string;

}

// ============================================================================
// Specific IR Data Interfaces
// ============================================================================

/**
 * Message-specific data interface focused on what Coordinates actually needs
 * Only includes the 4 properties that Coordinates uses for positioning calculations
 */
export interface IRMessage {
  from?: string;
  to?: string;
  signature: string;
  type: StatementKind;
}

/**
 * Fragment-specific data interface for type safety and compatibility
 */
export interface IRFragment {
  type: FragmentType;
  condition?: string;
  blocks: IRBlock[];
  frameId?: string;
  // Alt fragment specific properties
  ifBlock?: {
    kind: StatementKind.If;
    condition?: string;
    statements: IRStatement[];
  };
  elseIfBlocks?: Array<{
    kind: StatementKind.ElseIf;
    condition?: string;
    statements: IRStatement[];
  }>;
  elseBlock?: {
    kind: StatementKind.Else;
    statements: IRStatement[];
  };
  // TCF fragment specific properties
  tryBlock?: {
    kind: StatementKind.Try;
    statements: IRStatement[];
  };
  catchBlocks?: Array<{
    kind: StatementKind.Catch;
    exceptionText: string;
    statements: IRStatement[];
  }>;
  finallyBlock?: {
    kind: StatementKind.Finally;
    statements: IRStatement[];
  };
}

/**
 * Divider-specific data interface for type safety and compatibility
 */
export interface IRDivider {
  label?: string;
}

/**
 * Container for statement collections representing sequential execution blocks
 */
export interface IRBlock {
  /** Array of statements in execution order */
  statements: IRStatement[];
}

/**
 * Root structure containing the complete sequence diagram
 */
export interface IRTree {
  /** Optional diagram title */
  title?: string;

  /** List of diagram participants */
  participants: IRParticipant[];

  /** Participant groupings */
  groups: IRGroup[];

  /** Main statement block containing diagram logic */
  root: IRBlock;

  firstMessageStatement?: IRStatement;
}

/**
 * Complete program structure that includes both tree and additional metadata
 * This is the top-level structure that considers all aspects of the program
 */
export interface IRProg {
  /** The tree structure */
  tree: IRTree;
  
  /** Additional program-level metadata can be added here in the future */
}

// ============================================================================
// Statement Types and Data
// ============================================================================

/**
 * Statement type discriminator - Unified string enum for both IR and VM layers
 */
export enum StatementKind {
  If = 'if',
  ElseIf = 'elseif',
  Else = 'else',
  Message = 'message',
  Async = 'async',
  Creation = 'creation',
  Return = 'return',
  Fragment = 'fragment',
  Divider = 'divider',
  Comment = 'comment',
  Root = 'root',
  // Fragment-specific types (used in VM layer for discriminated unions)
  Alt = 'alt',
  Loop = 'loop',
  Opt = 'opt',
  Par = 'par',
  Critical = 'critical',
  Section = 'section',
  Tcf = 'tcf',
  Ref = 'ref',
  Try = 'try',
  Catch = 'catch',
  Finally = 'finally'
}


// ============================================================================
// Fragment Types
// ============================================================================

/**
 * Fragment type enumeration
 */
export type FragmentType =
  | 'alt'      // Alternative (if-else)
  | 'loop'     // Loop iteration
  | 'opt'      // Optional execution
  | 'par'      // Parallel execution
  | 'critical' // Critical section
  | 'section'  // General section
  | 'tcf'      // Try-catch-finally
  | 'ref';     // Reference to other diagram


// ============================================================================
// Supporting Types
// ============================================================================

export interface Position {
  line: number;
  column: number;
}

// IRGroup is imported from './groups'

// ============================================================================
// Builder Interface
// ============================================================================

/**
 * Interface for building tree structure from parser contexts
 */
export interface TreeBuilder {
  /**
   * Build IRProg from parser context
   * @param context Parser context root
   * @returns Complete IR program structure
   */
  buildProg(context: any): IRProg;

  /**
   * Build IRTree from parser context
   * @param context Parser context root
   * @returns Complete IR tree structure
   */
  buildTree(context: any): IRTree;

}

// ============================================================================
// VM Builder Interfaces
// ============================================================================

/**
 * Interface for building VMs from tree structure
 */
export interface TreeVMBuilder {
  /**
   * Build statement VM from IR tree node
   * @param statement IR statement
   * @returns Statement view model
   */
  buildStatementVM(statement: IRStatement): any;

  /**
   * Build block VM from IR block
   * @param block IR block
   * @returns Block view model
   */
  buildBlockVM(block: IRBlock): any;

  /**
   * Build complete diagram VM from IR tree
   * @param tree IR tree
   * @returns Complete diagram view model
   */
  buildDiagramVM(tree: IRTree): any;
}

// ============================================================================
// Validation Interfaces
// ============================================================================

/**
 * Tree structure validation results
 */
export interface ValidationResult {
  /** Whether the tree structure is valid */
  isValid: boolean;

  /** List of validation errors */
  errors: ValidationError[];

  /** List of validation warnings */
  warnings: ValidationWarning[];
}

export interface ValidationError {
  /** Error message */
  message: string;

  /** Path to the invalid node */
  path: string;

  /** Error code for programmatic handling */
  code: string;
}

export interface ValidationWarning {
  /** Warning message */
  message: string;

  /** Path to the node causing the warning */
  path: string;

  /** Warning code for programmatic handling */
  code: string;
}