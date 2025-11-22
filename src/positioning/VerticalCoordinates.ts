/**
 * Server-side layout pass that mirrors the per-pixel measurements the browser would
 * normally perform. The goal is to deterministically derive the vertical positions
 * of every statement (messages, fragments, dividers, etc.) using only parser context
 * and Theme metrics so that Playwright or any other DOM engine is no longer needed
 * in rendering tests.
 */
import { MarkdownMeasurer } from "@/positioning/vertical/MarkdownMeasurer";
import {
  getLayoutMetrics,
  LayoutMetrics,
  ThemeName,
} from "@/positioning/vertical/LayoutMetrics";
import {
  createStatementKey,
  StatementKey,
} from "@/positioning/vertical/StatementIdentifier";
import { StatementAnchor } from "@/positioning/vertical/StatementTypes";
import { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { createBlockVM } from "@/vm/createBlockVM";
import { LayoutRuntime } from "@/vm/types";

/**
 * Constructor parameters required to detach layout from the browser. We feed the
 * parser root context, the theme-driven spacing metrics, and the participant ordering so
 * async fragment traversals can infer their origin.
 */
interface VerticalCoordinatesOptions {
  rootContext: any;
  theme?: ThemeName;
  originParticipant: string;
  participantOrder: string[];
}

/**
 * Walks the parsed AST and deterministically assigns vertical coordinates to every
 * statement. The recursion mirrors how the renderer stacks statements inside blocks
 * and fragments so the resulting heights match what Playwright would capture from
 * the DOM.
 */
export class VerticalCoordinates {
  private readonly metrics: LayoutMetrics;
  private readonly statementMap = new Map<StatementKey, StatementCoordinate>();
  private readonly markdownMeasurer: MarkdownMeasurer;
  private readonly creationTopByParticipant = new Map<string, number>();
  private readonly rootBlock: any;
  private readonly rootOrigin: string;
  private readonly participantOrder: string[];
  private readonly runtime: LayoutRuntime;
  readonly totalHeight: number;

  /**
   * Build the measurement helpers up-front and immediately walk the root block so
   * that `totalHeight` and the internal lookup tables are populated for callers.
   */
  constructor(options: VerticalCoordinatesOptions) {
    this.metrics = getLayoutMetrics(options.theme);
    this.markdownMeasurer = new MarkdownMeasurer(this.metrics);
    this.rootBlock = options.rootContext?.block?.() ?? options.rootContext;
    this.rootOrigin = options.originParticipant || _STARTER_;
    this.participantOrder = options.participantOrder;
    this.runtime = {
      metrics: this.metrics,
      markdown: this.markdownMeasurer,
      participantOrder: this.participantOrder,
      rootBlock: this.rootBlock,
      originParticipant: this.rootOrigin,
      recordCoordinate: (statement: any, coordinate: StatementCoordinate) => {
        const key = createStatementKey(statement);
        this.statementMap.set(key, coordinate);
      },
      updateCreationTop: (participant: string, top: number) => {
        const prevTop = this.creationTopByParticipant.get(participant);
        if (prevTop == null || top < prevTop) {
          this.creationTopByParticipant.set(participant, top);
        }
      },
    };
    const start = this.metrics.messageLayerPaddingTop;
    const rootBlockVM = createBlockVM(this.rootBlock, this.runtime);
    const end = rootBlockVM.layout(this.rootOrigin, start);
    this.totalHeight = end + this.metrics.messageLayerPaddingBottom;
  }

  getStatementTop(keyOrCtx: StatementKey | any): number | undefined {
    const key =
      typeof keyOrCtx === "string" ? keyOrCtx : createStatementKey(keyOrCtx);
    return this.statementMap.get(key)?.top;
  }

  getStatementHeight(keyOrCtx: StatementKey | any): number | undefined {
    const key =
      typeof keyOrCtx === "string" ? keyOrCtx : createStatementKey(keyOrCtx);
    return this.statementMap.get(key)?.height;
  }

  getStatementAnchors(
    keyOrCtx: StatementKey | any,
  ): Partial<Record<StatementAnchor, number>> | undefined {
    const key =
      typeof keyOrCtx === "string" ? keyOrCtx : createStatementKey(keyOrCtx);
    return this.statementMap.get(key)?.anchors;
  }

  getCreationTop(participant: string): number | undefined {
    return this.creationTopByParticipant.get(participant);
  }

  getMessageLayerPaddingTop(): number {
    return this.metrics.messageLayerPaddingTop;
  }

  getStatementMarginTop(): number {
    return this.metrics.statementMarginTop;
  }

  getLifelineLayerPaddingTop(): number {
    return this.metrics.lifelineLayerPaddingTop;
  }

  entries() {
    return Array.from(this.statementMap.entries());
  }
}
