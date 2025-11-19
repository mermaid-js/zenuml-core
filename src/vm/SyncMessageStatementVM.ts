import { _STARTER_ } from "@/parser/OrderedParticipants";
import { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import { StatementVM } from "./StatementVM";
import type { LayoutRuntime } from "./types";

export class SyncMessageStatementVM extends StatementVM {
  readonly kind = "sync" as const;

  constructor(
    statement: any,
    private readonly message: any,
    runtime: LayoutRuntime,
  ) {
    super(statement, runtime);
  }

  public measure(top: number, origin: string): StatementCoordinate {
    const messageContext = this.message;
    const commentHeight = this.measureComment(messageContext);
    const messageTop = top + commentHeight;
    const source = messageContext?.From?.() || _STARTER_;
    const target = messageContext?.Owner?.() || _STARTER_;
    const isSelf = source === target;
    const messageHeight = isSelf
      ? this.metrics.selfInvocationHeight
      : this.metrics.messageHeight;
    const occurrenceTop = messageTop + messageHeight;
    const insideFragment = this.isInsideFragment(this.context);
    const hasNestedBlock = Boolean(messageContext?.braceBlock?.()?.block?.());
    const minOccurrenceHeight =
      insideFragment && !hasNestedBlock
        ? this.metrics.fragmentOccurrenceMinHeight
        : this.metrics.occurrenceMinHeight;
    const occurrenceHeight = this.measureOccurrence(
      messageContext,
      occurrenceTop,
      target,
      minOccurrenceHeight,
    );
    const assignee = messageContext?.Assignment?.()?.getText?.();
    const anchors: StatementCoordinate["anchors"] = {
      message: messageTop,
      occurrence: occurrenceTop,
    };
    if (commentHeight) {
      anchors.comment = top;
    }
    let height = commentHeight + messageHeight + occurrenceHeight;
    if (assignee && !isSelf) {
      anchors.return = occurrenceTop + occurrenceHeight;
      height += this.metrics.returnMessageHeight;
    }
    const meta: StatementCoordinate["meta"] = {
      commentHeight,
      messageHeight,
      occurrenceHeight,
      returnHeight: assignee && !isSelf ? this.metrics.returnMessageHeight : 0,
    };
    return { top, height, kind: this.kind, anchors, meta };
  }
}
