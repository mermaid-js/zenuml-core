import { _STARTER_ } from "@/parser/OrderedParticipants";
import {
  MESSAGE_HEIGHT,
  SELF_INVOCATION_ASYNC_HEIGHT,
} from "@/positioning/Constants";
import { StatementVM } from "./StatementVM";
import type { LayoutRuntime } from "./types";

export class AsyncMessageStatementVM extends StatementVM {
  constructor(
    statement: any,
    private readonly asyncMessage: any,
    runtime: LayoutRuntime,
  ) {
    super(statement, runtime);
  }

  protected heightAfterComment(origin: string): number {
    const target =
      this.asyncMessage?.to?.()?.getFormattedText?.() || origin || _STARTER_;
    const source = this.asyncMessage?.ProvidedFrom?.() || origin || _STARTER_;
    const isSelf = source === target;

    return isSelf ? SELF_INVOCATION_ASYNC_HEIGHT : MESSAGE_HEIGHT;
  }
}
