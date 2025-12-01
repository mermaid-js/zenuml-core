import {
  getLayoutMetrics,
  type ThemeName,
} from "@/positioning/vertical/LayoutMetrics";
import { createStatementKey } from "@/positioning/vertical/StatementIdentifier";
import type { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import type { CreationTopStatement } from "@/positioning/vertical/CreationTopStatement";
import { _STARTER_, OrderedParticipants } from "@/parser/OrderedParticipants";
import { BlockVM } from "@/vm/BlockVM";
import type { LayoutRuntime } from "@/vm/types";
import { AllMessages } from "@/parser/MessageCollector";

export class VerticalCoordinates {
  private readonly statementMap = new Map<string, StatementCoordinate>();
  private readonly creationTops = new Map<string, number>();
  private readonly creationTopStatements = new Map<
    string,
    CreationTopStatement[]
  >();
  readonly totalHeight: number;

  constructor(rootContext: any, theme?: ThemeName) {
    const rootBlock = rootContext?.block?.() ?? rootContext;

    const participants = OrderedParticipants(rootContext).map((p) => p.name);
    console.info("participants", participants);

    const messages = AllMessages(rootContext);
    console.info("messages", JSON.stringify(messages));
    const originParticipant =
      messages.length === 0 ? _STARTER_ : messages[0].from || _STARTER_;

    const metrics = getLayoutMetrics(theme);
    const runtime: LayoutRuntime = {
      metrics,
      rootBlock,
      participants,
      originParticipant,
      recordCoordinate: (statement: any, coordinate: StatementCoordinate) => {
        const key = createStatementKey(statement);
        this.statementMap.set(key, coordinate);
      },
      updateCreationTop: (
        participant: string,
        top: number,
        blocks?: CreationTopStatement[],
      ) => {
        const prev = this.creationTops.get(participant);
        if (prev == null || top < prev) {
          this.creationTops.set(participant, top);
          if (blocks) {
            this.creationTopStatements.set(participant, blocks);
          }
        }
      },
    };

    const rootBlockVM = new BlockVM(rootBlock, runtime);
    const end = rootBlockVM.layout(originParticipant, 56); // .message-layer.pt-14 => 56px
    this.totalHeight = end + metrics.messageLayerPaddingBottom;
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
