/**
 * VM Builder Contracts for Tree-Based Architecture
 *
 * These interfaces define the contracts for building view models from the tree IR
 * structure without requiring parser context dependencies.
 */

import { IRStatement, IRBlock, IRTree, IRMessage, IRFragment } from './tree-ir-interfaces';

// ============================================================================
// Core VM Builder Interface
// ============================================================================

/**
 * Main interface for building VMs from tree structure
 * Replaces the current parser-dependent VM building approach
 */
export interface TreeVMBuilder {
  /**
   * Build statement VM from tree node without parser context
   * @param statement Tree IR statement
   * @param origin Origin participant for positioning
   * @param coordinates Coordinate system for positioning calculations
   * @returns Statement view model
   */
  buildStatementVM(statement: IRStatement, origin: string, coordinates: Coordinates): StatementVM;

  /**
   * Build block VM from tree block
   * @param block Tree IR block
   * @param origin Origin participant for positioning
   * @param coordinates Coordinate system for positioning calculations
   * @returns Block view model
   */
  buildBlockVM(block: IRBlock, origin: string, coordinates: Coordinates): BlockVM;

  /**
   * Build message VM from tree message data
   * @param message Tree IR message
   * @param origin Origin participant for positioning
   * @param coordinates Coordinate system for positioning calculations
   * @returns Message view model
   */
  buildMessageVM(message: IRMessage, origin: string, coordinates: Coordinates): MessageVM;

  /**
   * Build fragment VM from tree fragment data
   * @param fragment Tree IR fragment
   * @param origin Origin participant for positioning
   * @param coordinates Coordinate system for positioning calculations
   * @returns Fragment view model
   */
  buildFragmentVM(fragment: IRFragment, origin: string, coordinates: Coordinates): FragmentVM;
}

// ============================================================================
// Supporting Types
// ============================================================================

export interface ParticipantInfo {
  name: string;
  displayName?: string;
  stereotype?: string;
  index: number;
}

export interface RenderingOptions {
  /** Whether to enable debug information */
  debug: boolean;

  /** Feature flags for experimental features */
  features: FeatureFlags;

  /** Theme configuration */
  theme: ThemeConfig;
}

export interface FeatureFlags {
  /** Enable tree-based rendering */
  useTreeStructure: boolean;

  /** Enable performance profiling */
  enableProfiling: boolean;

  /** Enable experimental features */
  experimental: boolean;
}

export interface ThemeConfig {
  /** Color scheme */
  colors: ColorScheme;

  /** Font configuration */
  fonts: FontConfig;

  /** Spacing configuration */
  spacing: SpacingConfig;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  border: string;
}

export interface FontConfig {
  family: string;
  size: number;
  weight: string;
}

export interface SpacingConfig {
  padding: number;
  margin: number;
  lineHeight: number;
}

// ============================================================================
// View Model Types
// ============================================================================

/**
 * Base interface for all view models
 */
export interface BaseVM {
  /** Unique identifier for the VM */
  id: string;

  /** Type discriminator */
  type: string;

  /** Position information */
  position: PositionInfo;

  /** Rendering metadata */
  metadata: RenderingMetadata;
}

export interface PositionInfo {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RenderingMetadata {
  /** Whether this VM is visible */
  visible: boolean;

  /** CSS classes to apply */
  cssClasses: string[];

  /** Inline styles */
  styles: Record<string, string>;

  /** Accessibility information */
  accessibility: AccessibilityInfo;
}

export interface AccessibilityInfo {
  /** ARIA label */
  label?: string;

  /** ARIA description */
  description?: string;

  /** ARIA role */
  role?: string;
}

/**
 * Statement view model interface
 */
export interface StatementVM extends BaseVM {
  /** Statement kind */
  kind: string;

  /** Child VMs (if any) */
  children?: BlockVM;

  /** Statement-specific data */
  data: StatementVMData;
}

export type StatementVMData =
  | MessageVM
  | FragmentVM
  | DividerVM;

/**
 * Block view model interface
 */
export interface BlockVM extends BaseVM {
  /** Child statement VMs */
  statements: StatementVM[];

  /** Layout information */
  layout: BlockLayout;
}

export interface BlockLayout {
  /** Layout direction */
  direction: 'vertical' | 'horizontal';

  /** Spacing between statements */
  spacing: number;

  /** Alignment */
  alignment: 'start' | 'center' | 'end';
}

/**
 * Message view model interface
 */
export interface MessageVM extends BaseVM {
  /** Source participant */
  from?: ParticipantVM;

  /** Target participant */
  to?: ParticipantVM;

  /** Message label */
  label: string;

  /** Message type */
  messageType: string;

  /** Arrow information */
  arrow: ArrowVM;

  /** Activation information */
  activation?: ActivationVM;
}

export interface ParticipantVM extends BaseVM {
  /** Participant name */
  name: string;

  /** Display name */
  displayName: string;

  /** Lifeline information */
  lifeline: LifelineVM;
}

export interface LifelineVM extends BaseVM {
  /** Start position */
  start: PositionInfo;

  /** End position */
  end: PositionInfo;

  /** Line style */
  style: LineStyle;
}

export interface LineStyle {
  color: string;
  width: number;
  dashArray?: number[];
}

export interface ArrowVM extends BaseVM {
  /** Arrow path */
  path: string;

  /** Arrow style */
  style: ArrowStyle;

  /** Label position */
  labelPosition: PositionInfo;
}

export interface ArrowStyle {
  color: string;
  width: number;
  headType: 'filled' | 'open' | 'diamond' | 'cross';
  bodyType: 'solid' | 'dashed' | 'dotted';
}

export interface ActivationVM extends BaseVM {
  /** Activation rectangle */
  rectangle: RectangleVM;

  /** Nesting level */
  level: number;
}

export interface RectangleVM extends BaseVM {
  /** Fill color */
  fill: string;

  /** Border style */
  border: BorderStyle;
}

export interface BorderStyle {
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
}

/**
 * Fragment view model interface
 */
export interface FragmentVM extends BaseVM {
  /** Fragment type */
  fragmentType: string;

  /** Fragment condition */
  condition?: string;

  /** Fragment blocks */
  blocks: BlockVM[];

  /** Fragment border */
  border: FragmentBorderVM;

  /** Fragment header */
  header: FragmentHeaderVM;
}

export interface FragmentBorderVM extends BaseVM {
  /** Corner radius */
  radius: number;

  /** Border style */
  style: BorderStyle;
}

export interface FragmentHeaderVM extends BaseVM {
  /** Header text */
  text: string;

  /** Header position */
  position: 'top-left' | 'top-center' | 'top-right';

  /** Header style */
  style: HeaderStyle;
}

export interface HeaderStyle {
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontWeight: string;
}

/**
 * Divider view model interface
 */
export interface DividerVM extends BaseVM {
  /** Divider text */
  text: string;

  /** Divider line */
  line: LineVM;
}

export interface LineVM extends BaseVM {
  /** Line path */
  path: string;

  /** Line style */
  style: LineStyle;
}

// ============================================================================
// Builder Factory Interface
// ============================================================================

/**
 * Factory for creating VM builders
 */
export interface VMBuilderFactory {
  /**
   * Create a tree VM builder
   * @param options Builder options
   * @returns Tree VM builder instance
   */
  createTreeVMBuilder(options?: VMBuilderOptions): TreeVMBuilder;

  /**
   * Create a legacy VM builder (for compatibility)
   * @param options Builder options
   * @returns Legacy VM builder instance
   */
  createLegacyVMBuilder(options?: VMBuilderOptions): LegacyVMBuilder;
}

export interface VMBuilderOptions {
  /** Feature flags */
  features: FeatureFlags;

  /** Performance options */
  performance: PerformanceOptions;

  /** Debug options */
  debug: DebugOptions;
}

export interface PerformanceOptions {
  /** Enable caching */
  enableCaching: boolean;

  /** Cache size limit */
  cacheLimit: number;

  /** Enable memoization */
  enableMemoization: boolean;
}

export interface DebugOptions {
  /** Enable verbose logging */
  verbose: boolean;

  /** Enable performance timing */
  timing: boolean;

  /** Enable memory profiling */
  memoryProfiling: boolean;
}

/**
 * Legacy VM builder interface (for compatibility during migration)
 */
export interface LegacyVMBuilder {
  /**
   * Build VM using the old byStart approach (for comparison)
   */
  buildWithByStart(messages: any[], byStart: Map<number, any>): any;
}

// ============================================================================
// Validation Contracts
// ============================================================================

/**
 * VM validation interface
 */
export interface VMValidator {
  /**
   * Validate a view model structure
   * @param vm View model to validate
   * @returns Validation result
   */
  validate(vm: BaseVM): VMValidationResult;

  /**
   * Validate VM compatibility with legacy implementation
   * @param treeVM Tree-based VM
   * @param legacyVM Legacy VM
   * @returns Compatibility result
   */
  validateCompatibility(treeVM: BaseVM, legacyVM: any): CompatibilityResult;
}

export interface VMValidationResult {
  /** Whether the VM is valid */
  isValid: boolean;

  /** Validation errors */
  errors: VMValidationError[];

  /** Validation warnings */
  warnings: VMValidationWarning[];

  /** Performance metrics */
  metrics: VMValidationMetrics;
}

export interface VMValidationError {
  /** Error message */
  message: string;

  /** VM path where error occurred */
  path: string;

  /** Error severity */
  severity: 'error' | 'warning' | 'info';
}

export interface VMValidationWarning {
  /** Warning message */
  message: string;

  /** VM path where warning occurred */
  path: string;

  /** Warning category */
  category: string;
}

export interface VMValidationMetrics {
  /** Validation time in milliseconds */
  validationTime: number;

  /** Memory usage during validation */
  memoryUsage: number;

  /** Number of nodes validated */
  nodeCount: number;
}

export interface CompatibilityResult {
  /** Whether VMs are compatible */
  isCompatible: boolean;

  /** Compatibility issues */
  issues: CompatibilityIssue[];

  /** Compatibility score (0-1) */
  score: number;
}

export interface CompatibilityIssue {
  /** Issue description */
  message: string;

  /** Issue type */
  type: 'structure' | 'data' | 'behavior' | 'performance';

  /** Issue severity */
  severity: 'critical' | 'major' | 'minor';

  /** Suggested fix */
  suggestion?: string;
}