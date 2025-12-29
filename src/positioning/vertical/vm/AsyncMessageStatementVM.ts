import type { StatementCoordinate } from "../StatementCoordinate";
import { StatementVM } from "./StatementVM";
import type { LayoutRuntime } from "./types";

export class AsyncMessageStatementVM extends StatementVM {
  readonly kind = "async" as const;

  constructor(
    statement: any,
    private readonly asyncMessage: any,
    runtime: LayoutRuntime,
  ) {
    super(statement, runtime);
  }

  public measure(top: number, origin: string): StatementCoordinate {
    const asyncContext = this.asyncMessage;
    const commentHeight = this.measureComment(asyncContext);

    const source =
      asyncContext?.From?.() ||
      asyncContext?.ProvidedFrom?.() ||
      asyncContext?.Origin?.() ||
      origin;

    const target =
      asyncContext?.Owner?.() ||
      asyncContext?.to?.()?.getFormattedText?.() ||
      source;

    const isSelf = source === target;
    const messageHeight = isSelf ? 44 : 16;

    return {
      top,
      height: commentHeight + messageHeight,
      kind: this.kind,
    };
  }
}
