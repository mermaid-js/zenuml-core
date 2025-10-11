/**
 * Tree Structure IR Type Definitions
 *
 * These interfaces define the contract for the new hierarchical tree structure
 * that will replace the current flat message array approach.
 */

// ============================================================================
// Core Tree Node Interface
// ============================================================================

/**
 * Core tree node interface representing any statement in the sequence diagram
 */
export interface IRStatement {
  /** Statement type discriminator for type safety */
  kind: StatementKind;

  /** Source code position range (optional) */
  range?: [number, number];

  /** Detailed code position information (optional) */
  codeRange?: CodeRange;

  /** Optional comment associated with the statement */
  comment?: string;

  /** Type-specific data based on statement kind */
  data: StatementData;

  /** Optional child block for statements that contain other statements */
  children?: IRBlock;
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
}

// ============================================================================
// Statement Types and Data
// ============================================================================

/**
 * Statement type discriminator
 */
export type StatementKind =
  | 'message'
  | 'async'
  | 'creation'
  | 'return'
  | 'fragment'
  | 'divider';

/**
 * Union type for statement-specific data
 */
export type StatementData =
  | IRMessage
  | IRFragment
  | IRDivider;

// ============================================================================
// Message Data
// ============================================================================

/**
 * Message data without position dependencies
 */
export interface IRMessage {
  /** Source participant identifier (optional for self-messages) */
  from?: string;

  /** Target participant identifier (optional for creation messages) */
  to?: string;

  /** Message signature/label */
  signature: string;

  /** Message type (sync, async, creation, return) */
  type: OwnableMessageType;

  /** Position of message label in source (optional) */
  labelRange?: [number, number];

  /** Explicitly provided source for return messages (optional) */
  providedFrom?: string;

  /** Variable assignment target (optional) */
  assignee?: string;

  /** Number of nested statements */
  statementsCount: number;
}

// ============================================================================
// Fragment Data
// ============================================================================

/**
 * Fragment data with embedded block structure for control flow
 */
export interface IRFragment {
  /** Type of fragment */
  type: FragmentType;

  /** Fragment condition/guard expression (optional) */
  condition?: string;

  /** Array of blocks for fragment branches */
  blocks: IRBlock[];
}

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
// Divider Data
// ============================================================================

/**
 * Section dividers in fragments
 */
export interface IRDivider {
  /** Optional divider label */
  label?: string;

  /** Type of divider */
  type: DividerType;
}

/**
 * Divider type enumeration
 */
export type DividerType =
  | 'else'
  | 'elseif';

// ============================================================================
// Supporting Types (from existing codebase)
// ============================================================================

/**
 * Code range information (reuse existing type)
 */
export interface CodeRange {
  start: Position;
  end: Position;
}

export interface Position {
  line: number;
  column: number;
}

/**
 * Message type enumeration (reuse existing type)
 */
export type OwnableMessageType =
  | 'sync'
  | 'async'
  | 'creation'
  | 'return';

/**
 * Participant information (reuse existing type)
 */
export interface IRParticipant {
  name: string;
  displayName?: string;
  stereotype?: string;
}

/**
 * Participant group information (reuse existing type)
 */
export interface IRGroup {
  name: string;
  participants: string[];
}

// ============================================================================
// Builder Interface
// ============================================================================

/**
 * Interface for building tree structure from parser contexts
 */
export interface TreeBuilder {
  /**
   * Build IRTree from parser context
   * @param context Parser context root
   * @returns Complete IR tree structure
   */
  buildTree(context: any): IRTree;

  /**
   * Build IRStatement from parser context
   * @param context Statement context
   * @returns IR statement node
   */
  buildStatement(context: any): IRStatement;

  /**
   * Build IRBlock from parser context
   * @param context Block context
   * @returns IR block container
   */
  buildBlock(context: any): IRBlock;
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