import { LayoutMetrics } from "@/positioning/vertical/LayoutMetrics";
import { MarkdownMeasurer } from "@/positioning/vertical/MarkdownMeasurer";
import { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import { CreationTopBlock } from "@/positioning/vertical/CreationTopBlock";

export interface LayoutRuntime {
  metrics: LayoutMetrics;
  markdown: MarkdownMeasurer;
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
