import { MarkdownMeasurer } from "@/positioning/vertical/MarkdownMeasurer";
import {
  getLayoutMetrics,
  LayoutMetrics,
  ThemeName,
} from "@/positioning/vertical/LayoutMetrics";
import { createStatementKey } from "@/positioning/vertical/StatementIdentifier";
import { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import {
  CreationTopBlock,
  // CreationTopRecord,
} from "@/positioning/vertical/CreationTopBlock";
import { _STARTER_, OrderedParticipants } from "@/parser/OrderedParticipants";
import { BlockVM } from "@/vm/BlockVM";
import { LayoutRuntime } from "@/vm/types";
import { AllMessages } from "@/parser/MessageCollector";

export class VerticalCoordinates {
  private readonly metrics: LayoutMetrics;
  private readonly statementMap = new Map<string, StatementCoordinate>();
  private readonly creationTops = new Map<string, number>();
  private readonly creationTopBlocks = new Map<string, CreationTopBlock[]>();
  private readonly rootBlock: any;
  private readonly rootOrigin: string;
  private readonly runtime: LayoutRuntime;
  readonly totalHeight: number;

  constructor(rootContext: any, theme?: ThemeName) {
    this.metrics = getLayoutMetrics(theme);
    this.rootBlock = rootContext?.block?.() ?? rootContext;

    const participants = OrderedParticipants(rootContext).map((p) => p.name);
    console.info("participants", participants);

    const messages = AllMessages(rootContext);
    console.info("messages", JSON.stringify(messages));
    this.rootOrigin =
      messages.length === 0 ? _STARTER_ : messages[0].from || _STARTER_;

    this.runtime = {
      metrics: this.metrics,
      rootBlock: this.rootBlock,
      markdown: new MarkdownMeasurer(this.metrics),
      participants,
      originParticipant: this.rootOrigin,
      recordCoordinate: (statement: any, coordinate: StatementCoordinate) => {
        const key = createStatementKey(statement);
        this.statementMap.set(key, coordinate);
      },
      updateCreationTop: (
        participant: string,
        top: number,
        blocks?: CreationTopBlock[],
      ) => {
        const prev = this.creationTops.get(participant);
        if (prev == null || top < prev) {
          this.creationTops.set(participant, top);
          if (blocks) {
            this.creationTopBlocks.set(participant, blocks);
          }
        }
      },
    };

    const rootBlockVM = new BlockVM(this.rootBlock, this.runtime);
    const end = rootBlockVM.layout(this.rootOrigin, 56); // pt-14 => 56px
    this.totalHeight = end + this.metrics.messageLayerPaddingBottom;
  }

  getCreationTop(participant: string): number | undefined {
    return this.creationTops.get(participant);
  }

  // getCreationTopComponents(participant: string): CreationTopComponent[] {
  //   return this.creationTopComponents.get(participant) || [];
  // }

  // getCreationTopRecords(): CreationTopRecord[] {
  //   const records: CreationTopRecord[] = [];
  //   for (const [participant, finalTop] of this.creationTopByParticipant) {
  //     records.push({
  //       participant,
  //       finalTop,
  //       components: this.creationTopComponents.get(participant) || [],
  //     });
  //   }
  //   return records;
  // }
}
