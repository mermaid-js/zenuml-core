import { LayoutMetrics } from "@/positioning/vertical/LayoutMetrics";
import { MarkdownMeasurer } from "@/positioning/vertical/MarkdownMeasurer";
import { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import { CreationTopComponent } from "@/positioning/vertical/CreationTopComponent";

export interface LayoutRuntime {
  metrics: LayoutMetrics;
  markdown: MarkdownMeasurer;
}

export interface LayoutRuntime {
  metrics: LayoutMetrics;
  markdown: MarkdownMeasurer;
  participantOrder: string[];
  rootBlock: any;
  originParticipant: string;
  recordCoordinate: (statement: any, coordinate: StatementCoordinate) => void;
  updateCreationTop: (
    participant: string,
    top: number,
    components?: CreationTopComponent[],
  ) => void;
}
