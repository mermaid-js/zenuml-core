import type { LayoutMetrics } from "@/positioning/vertical/LayoutMetrics";
import type { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import type { CreationTopBlock } from "@/positioning/vertical/CreationTopBlock";

export interface LayoutRuntime {
  metrics: LayoutMetrics;
  participants: string[];
  rootBlock: any;
  originParticipant: string;
  recordCoordinate: (statement: any, coordinate: StatementCoordinate) => void;
  updateCreationTop: (
    participant: string,
    top: number,
    components?: CreationTopBlock[],
  ) => void;
}
