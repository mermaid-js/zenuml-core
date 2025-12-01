import { _STARTER_ } from "@/parser/OrderedParticipants";
import type { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
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

  public measure(top: number): StatementCoordinate {
    const messageContext = this.message;
    const commentHeight = this.measureComment(messageContext);
    const messageTop = top + commentHeight;
    const source = messageContext?.From?.() || _STARTER_;
    const target = messageContext?.Owner?.() || _STARTER_;
    const isSelf = source === target;
    const hasNestedBlock = Boolean(messageContext?.braceBlock?.()?.block?.());
    const signature = messageContext?.SignatureText?.() || "";
    const wrapped = signature.length > 20;
    const baseMessageHeight = hasNestedBlock
      ? this.metrics.messageHeight
      : this.metrics.messageInlineHeight;
    const messageHeight = isSelf
      ? this.metrics.selfInvocationHeight
      : baseMessageHeight + (wrapped ? 7 : 0);
    const occurrenceTop = messageTop + messageHeight;
    const insideFragment = this.isInsideFragment(this.context);
    const minOccurrenceHeight =
      insideFragment && !hasNestedBlock
        ? this.metrics.fragmentOccurrenceMinHeight
        : this.metrics.occurrenceMinHeight;
    let occurrenceHeight = this.measureOccurrence(
      messageContext,
      occurrenceTop,
      target,
      minOccurrenceHeight,
    );
    if (hasNestedBlock && commentHeight > 0) {
      occurrenceHeight += Math.min(
        commentHeight / 2,
        this.metrics.statementMarginTop,
      );
    }
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
