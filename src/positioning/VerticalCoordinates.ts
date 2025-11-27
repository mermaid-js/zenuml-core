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
import {
  CreationTopComponent,
  CreationTopRecord,
} from "@/positioning/vertical/CreationTopComponent";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { BlockVM } from "@/vm/BlockVM";
import { LayoutRuntime } from "@/vm/types";

interface VerticalCoordinatesOptions {
  rootContext: any;
  theme?: ThemeName;
  originParticipant: string;
  participantOrder: string[];
}

export class VerticalCoordinates {
  private readonly metrics: LayoutMetrics;
  private readonly statementMap = new Map<StatementKey, StatementCoordinate>();
  private readonly markdownMeasurer: MarkdownMeasurer;
  private readonly creationTopByParticipant = new Map<string, number>();
  private readonly creationTopComponents = new Map<
    string,
    CreationTopComponent[]
  >();
  private readonly rootBlock: any;
  private readonly rootOrigin: string;
  private readonly participantOrder: string[];
  private readonly runtime: LayoutRuntime;
  readonly totalHeight: number;

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
      updateCreationTop: (
        participant: string,
        top: number,
        components?: CreationTopComponent[],
      ) => {
        const prevTop = this.creationTopByParticipant.get(participant);
        if (prevTop == null || top < prevTop) {
          this.creationTopByParticipant.set(participant, top);
          if (components) {
            this.creationTopComponents.set(participant, components);
          }
        }
      },
    };
    const start = this.metrics.messageLayerPaddingTop;
    const rootBlockVM = new BlockVM(this.rootBlock, this.runtime);
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

  getCreationTopComponents(participant: string): CreationTopComponent[] {
    return this.creationTopComponents.get(participant) || [];
  }

  getCreationTopRecords(): CreationTopRecord[] {
    const records: CreationTopRecord[] = [];
    for (const [participant, finalTop] of this.creationTopByParticipant) {
      records.push({
        participant,
        finalTop,
        components: this.creationTopComponents.get(participant) || [],
      });
    }
    return records;
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
