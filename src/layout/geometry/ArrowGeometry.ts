/**
 * Pure data objects for arrow layout calculations
 * Contains only geometric parameters, no behavior or context dependencies
 */

/**
 * Geometric data for a single participant in arrow calculations
 */
export interface ParticipantArrowData {
  readonly name: string;
  readonly centerPosition: number;
  readonly activationLayers: number;
}

/**
 * Complete geometric data needed for arrow layout calculations
 * This replaces the need to pass context and perform runtime traversals
 */
export interface ArrowGeometry {
  readonly origin: ParticipantArrowData;
  readonly source: ParticipantArrowData;
  readonly target: ParticipantArrowData;
  readonly isSelfCall: boolean;
}

/**
 * Result of pure mathematical arrow layout calculations
 * Contains only the fields actually used by components
 */
export interface ArrowLayoutResult {
  // Core layout fields - used by all components (4/4)
  readonly interactionWidth: number;
  readonly rightToLeft: boolean;
  readonly translateX: number;
  
  // Metadata fields - used by specific components
  readonly isSelf: boolean;          // Used by Return component (1/4)
  readonly originLayers: number;     // Used by Interaction component for data attributes (1/4)
  readonly sourceLayers: number;     // Used by Interaction component for data attributes (1/4)
  readonly targetLayers: number;     // Used by Interaction component for data attributes (1/4)
  
  // Note: Removed unused anchor objects (anchor2Origin, anchor2Source, anchor2Target)
  // They were never used by any component (0/4 usage)
}