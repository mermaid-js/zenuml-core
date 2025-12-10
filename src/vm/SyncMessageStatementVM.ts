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
    const commentHeight = this.measureComment(this.message);
    // let cursor = top + commentHeight;

    const source = this.message?.From?.() || _STARTER_;
    const target = this.message?.Owner?.() || _STARTER_;
    const isSelf = source === target;
    const hasNestedBlock = Boolean(this.message?.braceBlock?.()?.block?.());
    const insideFragment = this.isInsideFragment(this.context);
    const assignee = this.message?.Assignment?.()?.getText?.();

    const signature = this.message?.SignatureText?.() || "";
    console.info(
      "syncMessageVM::",
      target,
      signature,
      top,
      source,
      hasNestedBlock,
      insideFragment,
      assignee,
    );

    const messageHeight = isSelf || hasNestedBlock ? 31 : 16;
    // cursor += messageHeight;

    let occurrenceHeight = 22; // .occurrence, .min-h-6, .mt-[-2px]
    // let occurrenceHeight = insideFragment && !hasNestedBlock ? 22 : 24;
    // occurrenceHeight = this.measureOccurrence(
    //   this.message,
    //   cursor,
    //   target,
    //   occurrenceHeight,
    // );

    if (hasNestedBlock && commentHeight > 0) {
      occurrenceHeight += Math.min(
        commentHeight / 2,
        this.metrics.statementMarginY,
      );
    }

    let height = commentHeight + messageHeight + occurrenceHeight;

    if (assignee && !isSelf) {
      height += this.metrics.returnMessageHeight;
    }

    console.info(
      "syncMessageVM::height",
      height,
      commentHeight,
      messageHeight,
      occurrenceHeight,
    );

    return { top, height, kind: this.kind };
  }
}
