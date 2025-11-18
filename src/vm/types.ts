import { LayoutMetrics } from "@/positioning/vertical/LayoutMetrics";
import { MarkdownMeasurer } from "@/positioning/vertical/MarkdownMeasurer";

export interface LayoutRuntime {
  metrics: LayoutMetrics;
  markdown: MarkdownMeasurer;
}

export type BlockLayout = {
  tops: number[];
  endTop: number;
};
