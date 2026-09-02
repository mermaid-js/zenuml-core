import type { StatementCoordinate } from "../StatementCoordinate";
import { StatementVM } from "./StatementVM";
import type { LayoutRuntime } from "./types";

export class FragmentAltVM extends StatementVM {
  readonly kind = "alt" as const;

  constructor(
    statement: any,
    private readonly alt: any,
    runtime: LayoutRuntime,
  ) {
    super(statement, runtime);
  }

  public measure(top: number, origin: string): StatementCoordinate {
    const leftParticipant =
      this.findLeftParticipant(this.alt, origin) || origin;

    const commentHeight = this.measureComment(this.alt);
    let cursor = top + 1 + this.metrics.fragmentHeaderHeight + commentHeight;

    const ifBlock = this.alt?.ifBlock?.();
    if (ifBlock) {
      cursor += 20; // .text-skin-fragment > label
      cursor = this.layoutBlock(
        ifBlock.braceBlock()?.block(),
        leftParticipant,
        cursor,
      );
    }
    this.alt?.elseIfBlock?.()?.forEach((block: any) => {
      cursor += 20; // .text-skin-fragment > label
      cursor += 8; // .mt-2
      cursor += 1; // .segment.border-t.border-solid
      cursor = this.layoutBlock(
        block?.braceBlock?.()?.block?.(),
        leftParticipant,
        cursor,
      );
    });
    const elseBlock = this.alt?.elseBlock?.()?.braceBlock?.()?.block?.();
    if (elseBlock) {
      cursor += 20; // .text-skin-fragment > label
      cursor += 8; // .mt-2
      cursor += 1; // .segment.border-t.border-solid
      cursor = this.layoutBlock(elseBlock, leftParticipant, cursor);
    }

    cursor += this.metrics.fragmentPaddingBottom + 1; // .zenuml .fragment =>padding-bottom: 10px

    return {
      top,
      height: cursor - top,
      kind: this.kind,
    };
  }
}
