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
    let cursor = top + commentHeight;

    const source = this.message.From?.() || _STARTER_;
    const target = this.message.Owner?.() || _STARTER_;
    const block = this.message.braceBlock?.()?.block?.();

    const signature = this.message.SignatureText?.() || "";
    const assignee = this.message.Assignment?.()?.getText?.();
    console.info(
      "syncMessageVM::start",
      target,
      signature,
      assignee,
      top,
      source,
      Boolean(block),
    );

    const isSelf = source === target;
    const messageHeight = isSelf ? 30 : 16;
    cursor += messageHeight;

    if (block) {
      const fragmentOrigin =
        this.findLeftParticipant(this.message, origin) || origin;
      cursor = this.layoutBlock(block, fragmentOrigin, cursor, this.kind);
      cursor += 2; // .occurrence.border-2 for bottom
    } else {
      cursor += 22; // .occurrence, .min-h-6, .mt-[-2px]
    }

    if (assignee && !isSelf) {
      // src/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/Interaction/Interaction.tsx:99
      cursor += 16;
    }

    const height = cursor - top;

    console.info("syncMessageVM::end", height, commentHeight, messageHeight);

    return { top, height, kind: this.kind };
  }
}
