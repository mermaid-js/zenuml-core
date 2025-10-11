/**
 * VM Builder Contracts for Tree-Based Architecture
 *
 * These interfaces define the contracts for building view models from the tree IR
 * structure without requiring parser context dependencies.
 */

import { IRStatement, IRBlock, IRFragment, IRProg, StatementKind } from '@/ir/tree-types';
import type { Coordinates } from '@/positioning/Coordinates';
import type { TitleVM } from '@/vm/title';
import { ParticipantVM } from "@/vm/participants";
import { GroupVM } from "@/vm/groups";
import { IRParticipant } from "@/ir/participants";
import { IRGroup } from "@/ir/groups";

// ============================================================================
// Core VM Builder Interface
// ============================================================================

/**
 * Main interface for building VMs from tree structure
 * Replaces the current parser-dependent VM building approach
 */
export interface TreeVMBuilder {
  /**
   * Build program VM from tree IR program
   * @param prog Tree IR program
   * @param coordinates Coordinate system for positioning calculations
   * @returns Program view model with accurate total width calculation
   */
  buildProgVM(prog: IRProg, coordinates: Coordinates): any;

  /**
   * Build statement VM from tree node without parser context
   * @param statement Tree IR statement
   * @param origin Origin participant
   * @param coordinates Positioning coordinates
   * @returns Statement view model
   */
  buildStatementVM(statement: IRStatement, origin: string, coordinates: Coordinates): StatementVM;

  /**
   * Build block VM from tree block
   * @param block Tree IR block
   * @param context Optional rendering context
   * @returns Block view model
   */
  buildBlockVM(block: IRBlock, origin: string, coordinates: Coordinates): BlockVM;


  buildMessageVM(irStatement: IRStatement, origin: string, coordinates: Coordinates): MessageVM;

  /**
   * Build fragment VM from tree fragment data
   * @param fragment Tree IR fragment
   * @param origin Origin participant for positioning
   * @param coordinates Coordinate system for positioning calculations
   * @returns Fragment view model
   */
  buildFragmentVM(fragment: IRFragment, origin: string, coordinates: Coordinates): FragmentVM;

  /**
   * Build title VM from tree title data
   * @param title Title string from tree IR
   * @returns Title view model or undefined if no title
   */
  buildTitleVM(title: string | undefined): TitleVM | undefined;

  /**
   * Build participants VM from tree IR participants
   * @param participants Participants array from tree IR
   * @returns Participants view models array
   */
  buildParticipantsVM(participants: IRParticipant[]): ParticipantVM[];

  /**
   * Build groups VM from tree IR groups
   * @param groups Groups array from tree IR
   * @returns Groups view models array
   */
  buildGroupsVM(groups: IRGroup[]): GroupVM[];
}

// ============================================================================
// View Model Interfaces
// ============================================================================

/**
 * Base interface for all view models
 */
export interface BaseVM {
  /** Unique identifier */
  id?: string;

  /** CSS classes */
  className?: string;

  /** Inline styles */
  style?: Record<string, any>;
}

/**
 * Rendering options for VM building
 */
export interface RenderingOptions {
  /** Whether to enable debug information */
  debug: boolean;

  /** Theme configuration */
  theme: ThemeConfig;
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
  /** Primary color */
  primary: string;

  /** Secondary color */
  secondary: string;

  /** Background color */
  background: string;

  /** Text color */
  text: string;
}

export interface FontConfig {
  /** Font family */
  family: string;

  /** Font size */
  size: number;

  /** Font weight */
  weight: number;
}

export interface SpacingConfig {
  /** Base spacing unit */
  unit: number;

  /** Padding multiplier */
  padding: number;

  /** Margin multiplier */
  margin: number;
}

/**
 * Rendering metadata for performance tracking
 */
export interface RenderingMetadata {
  /** Rendering timestamp */
  timestamp: number;

  /** Rendering duration in milliseconds */
  duration: number;

  /** Memory usage during rendering */
  memoryUsage: number;

  /** Number of VMs created */
  vmCount: number;
}

// ============================================================================
// Statement VM Types
// ============================================================================

/**
 * Discriminated union for statement view models
 */
export type StatementVM = 
  | MessageStatementVM
  | FragmentStatementVM
  | DividerStatementVM
  | ReturnStatementVM;

export interface MessageStatementVM extends BaseVM {
  kind: StatementKind.Message;
  messageVM: MessageVM;
}

export interface FragmentStatementVM extends BaseVM {
  kind: StatementKind.Fragment;
  fragmentVM: FragmentVM;
}

export interface DividerStatementVM extends BaseVM {
  kind: StatementKind.Divider;
  dividerVM: DividerVM;
}

export interface ReturnStatementVM extends BaseVM {
  kind: StatementKind.Return;
  returnVM: ReturnVM;
}

// ============================================================================
// Core VM Types
// ============================================================================

export interface MessageVM extends BaseVM {
  /** Message signature */
  signature: string;

  /** Source participant */
  from: string;

  /** Target participant */
  to: string;

  /** Arrow geometry */
  arrow: ArrowGeometry;

  /** Message type */
  type: MessageType;

  /** Whether message is self-invocation */
  isSelf: boolean;

  /** Child statements */
  children?: StatementVM[];
}

export interface FragmentVM extends BaseVM {
  /** Fragment type */
  type: FragmentType;

  /** Fragment condition */
  condition?: string;

  /** Fragment blocks */
  blocks: BlockVM[];

  /** Fragment positioning */
  positioning: FragmentPositioning;
}

export interface BlockVM extends BaseVM {
  /** Block statements */
  statements: StatementVM[];

  /** Block origin participant */
  origin: string;
}

export interface DividerVM extends BaseVM {
  /** Divider text */
  text: string;

  /** Divider positioning */
  positioning: DividerPositioning;
}

export interface ReturnVM extends BaseVM {
  /** Return expression */
  expression: string;

  /** Return target */
  target: string;

  /** Return arrow geometry */
  arrow: ArrowGeometry;
}

// ============================================================================
// Geometry Types
// ============================================================================

export interface ArrowGeometry {
  /** Horizontal translation */
  translateX: number;

  /** Arrow width */
  width: number;

  /** Whether arrow points right-to-left */
  rightToLeft: boolean;

  /** Source participant layers */
  sourceLayers: number;

  /** Target participant layers */
  targetLayers: number;
}

export interface FragmentPositioning {
  /** Horizontal offset */
  offsetX: number;

  /** Fragment width */
  width: number;

  /** Left padding */
  paddingLeft: number;

  /** Right padding */
  paddingRight: number;
}

export interface DividerPositioning {
  /** Horizontal offset */
  offsetX: number;

  /** Divider width */
  width: number;
}

// ============================================================================
// Enum Types
// ============================================================================

export enum MessageType {
  Sync = 0,
  Async = 1,
  Creation = 2,
  Return = 3,
}

export enum FragmentType {
  Alt = 'alt',
  Loop = 'loop',
  Opt = 'opt',
  Par = 'par',
  Critical = 'critical',
  Section = 'section',
  Ref = 'ref',
  TryCatchFinally = 'tcf',
}

// ============================================================================
// Style Types
// ============================================================================

export interface LineStyle {
  /** Line color */
  color: string;

  /** Line width */
  width: number;

  /** Line dash pattern */
  dashArray?: number[];
}

export interface Position {
  /** X coordinate */
  x: number;

  /** Y coordinate */
  y: number;
}

export interface LineVM extends BaseVM {
  /** Start position */
  start: Position;

  /** End position */
  end: Position;

  /** Line path */
  path: string;

  /** Line style */
  style: LineStyle;
}

// ============================================================================
// End of TreeVMBuilder Types
// ============================================================================