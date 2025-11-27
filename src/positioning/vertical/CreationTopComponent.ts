/**
 * Represents a single component contributing to the vertical position of a participant's creation top.
 * Used for debugging to visualize where each part of the coordinate calculation comes from.
 */
export interface CreationTopComponent {
  /** Human-readable name of the component source */
  name: string;
  /** The vertical offset value this component contributes */
  value: number;
  /** Optional statement key this component originated from */
  statementKey?: string;
  /** Optional description of why this component was applied */
  description?: string;
}

/**
 * Tracks the breakdown of how a participant's creation top coordinate was calculated.
 * Each CreationTopRecord contains the final value plus all contributing components.
 */
export interface CreationTopRecord {
  /** The participant name this record is for */
  participant: string;
  /** The final calculated creation top value */
  finalTop: number;
  /** List of components that contributed to the final value */
  components: CreationTopComponent[];
}
