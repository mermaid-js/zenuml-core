import { createStatementKey } from "@/positioning/vertical/StatementIdentifier";
import type { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import { _STARTER_, OrderedParticipants } from "@/parser/OrderedParticipants";
import { AllMessages } from "@/parser/MessageCollector";
import type { LayoutRuntime } from "./vertical/vm/types";
import logger from "@/logger/logger";
import { BlockVM } from "./vertical/vm/BlockVM";
import { DEFAULT_LAYOUT_METRICS as metrics } from "./vertical/LayoutMetrics";

export class VerticalCoordinates {
  private readonly statementMap = new Map<string, StatementCoordinate>();
  private readonly creationTops = new Map<string, number>();
  private readonly totalHeight: number;

  constructor(rootContext: any) {
    const rootBlock = rootContext?.block?.() ?? rootContext;

    const participants = OrderedParticipants(rootContext).map((p) => p.name);
    // console.info("participants", participants);

    const messages = AllMessages(rootContext);
    // console.info("messages", JSON.stringify(messages));
    const originParticipant =
      messages.length === 0 ? _STARTER_ : messages[0].from || _STARTER_;

    const runtime: LayoutRuntime = {
      metrics,
      rootBlock,
      participants,
      originParticipant,
      recordCoordinate: (statement: any, coordinate: StatementCoordinate) => {
        const key = createStatementKey(statement);
        this.statementMap.set(key, coordinate);
      },
      updateCreationTop: (participant: string, top: number) => {
        const paddingTop = top - 8; // .life-line-layer, .pt-2
        logger.info(`[VerticalCoordinates] updateCreationTop participant="${participant}" raw=${top} paddingTop=${paddingTop}`);
        this.creationTops.set(participant, paddingTop);
      },
    };

    const rootBlockVM = new BlockVM(rootBlock, runtime);
    this.totalHeight = rootBlockVM.layout(originParticipant, 56); // .message-layer, .pt-14 => 56px
  }

  getCreationTop(participant: string): number | undefined {
    return this.creationTops.get(participant);
  }

  getStatementCoordinate(key: string): StatementCoordinate | undefined {
    return this.statementMap.get(key);
  }

  getStatementCoordinateFor(statement: any): StatementCoordinate | undefined {
    return this.statementMap.get(createStatementKey(statement));
  }

  entries(): Array<[string, StatementCoordinate]> {
    return Array.from(this.statementMap.entries());
  }

  getTotalHeight(): number {
    return this.totalHeight;
  }
}
