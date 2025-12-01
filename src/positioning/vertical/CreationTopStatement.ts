/**
 * Represents a single block contributing to the vertical position of a participant's creation top.
 * Used for debugging to visualize where each part of the coordinate calculation comes from.
 */
export interface CreationTopStatement {
  name: string;
  value: number;
  statementKey?: string;
  description?: string;
}
