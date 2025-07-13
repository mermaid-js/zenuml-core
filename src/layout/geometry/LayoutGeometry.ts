/**
 * Core geometric data models for ZenUML layout system
 * These are pure value objects with no behavior, only data
 */

/**
 * Geometric data for a single participant in the diagram
 */
export interface ParticipantGeometry {
  readonly name: string;
  readonly centerPosition: number;
  readonly width: number;
  readonly labelWidth: number;
  readonly activationStack: ActivationLayer[];
}

/**
 * Represents an activation layer at a specific message index
 */
export interface ActivationLayer {
  readonly messageIndex: number;
  readonly depth: number;
  readonly isActive: boolean;
}

/**
 * Geometric data for a message in the sequence diagram
 */
export interface MessageGeometry {
  readonly index: number;
  readonly id: string;
  readonly type: MessageType;
  readonly source: string;
  readonly target: string;
  readonly isSelfCall: boolean;
  readonly signatureText?: string;
}

export type MessageType = 'sync' | 'async' | 'creation' | 'return';

/**
 * Geometric data for a fragment (alt, opt, loop, etc.)
 */
export interface FragmentGeometry {
  readonly id: string;
  readonly type: FragmentType;
  readonly startMessageIndex: number;
  readonly endMessageIndex: number;
  readonly participants: string[];
  readonly nestedFragments: FragmentGeometry[];
  readonly condition?: string;
  readonly sections?: FragmentSection[];
}

export type FragmentType = 'alt' | 'opt' | 'loop' | 'par' | 'critical' | 'ref' | 'section' | 'tcf';

export interface FragmentSection {
  readonly condition?: string;
  readonly startMessageIndex: number;
  readonly endMessageIndex: number;
}

/**
 * Complete geometric model for the entire diagram
 * This replaces the need to pass context objects around
 */
export interface LayoutGeometry {
  readonly participants: ParticipantGeometry[];
  readonly messages: MessageGeometry[];
  readonly fragments: FragmentGeometry[];
  readonly metadata: DiagramMetadata;
}

/**
 * Metadata about the diagram structure
 */
export interface DiagramMetadata {
  readonly totalMessages: number;
  readonly totalParticipants: number;
  readonly maxActivationDepth: number;
  readonly hasFragments: boolean;
  readonly diagramWidth: number;
  readonly diagramHeight: number;
}

/**
 * Utility type for position mapping
 */
export type PositionMap = Map<string, number>;

/**
 * Utility type for activation depth mapping
 */
export type ActivationMap = Map<string, Map<number, number>>; // participant -> messageIndex -> depth