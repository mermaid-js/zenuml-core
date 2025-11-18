import { _STARTER_ } from "@/parser/OrderedParticipants";
import {
  MESSAGE_HEIGHT,
  OCCURRENCE_EMPTY_HEIGHT,
  OCCURRENCE_WITH_CHILDREN_HEIGHT,
  SELF_INVOCATION_SYNC_HEIGHT,
} from "@/positioning/Constants";
import { StatementVM } from "./StatementVM";
import type { LayoutRuntime } from "./types";

export class SyncMessageStatementVM extends StatementVM {
  constructor(
    statement: any,
    private readonly message: any,
    runtime: LayoutRuntime,
  ) {
    super(statement, runtime);
  }

  protected heightAfterComment(origin: string): number {
    const source = this.message?.From?.() || _STARTER_;
    const target = this.message?.Owner?.() || origin || _STARTER_;
    const nestedBlock = this.message?.braceBlock?.()?.block?.();
    const hasNestedBlock = Boolean(nestedBlock);
    const isSelf = source === target;

    const baseHeight = isSelf
      ? SELF_INVOCATION_SYNC_HEIGHT
      : MESSAGE_HEIGHT +
          (hasNestedBlock
            ? OCCURRENCE_WITH_CHILDREN_HEIGHT
            // Total height of sync statement without nested block is somehow
            // 41px. MESSAGE_HEIGHT + OCCURRENCE_EMPTY_HEIGHT = 40px.
            // This is a workaround.
            : (OCCURRENCE_EMPTY_HEIGHT + 1));

    const nestedHeight = this.blockHeight(nestedBlock, target);
    return baseHeight + nestedHeight;
  }
}
