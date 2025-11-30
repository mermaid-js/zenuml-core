/**
 * Represents a single component contributing to the vertical position of a participant's creation top.
 * Used for debugging to visualize where each part of the coordinate calculation comes from.
 */
export interface CreationTopComponent {
  name: string;
  value: number;
  statementKey?: string;
  description?: string;
}
