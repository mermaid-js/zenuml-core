import type { LayoutMetrics } from "../LayoutMetrics";
import type { StatementCoordinate } from "../StatementCoordinate";

export interface LayoutRuntime {
  metrics: LayoutMetrics;
  participants: string[];
  recordCoordinate: (statement: any, coordinate: StatementCoordinate) => void;
  updateCreationTop: (participant: string, top: number) => void;
}
