import type { StatementCoordinate } from "../StatementCoordinate";
import { FragmentVM } from "./FragmentVM";
import type { LayoutRuntime } from "./types";

export class FragmentAltVM extends FragmentVM {
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
    // console.info("FragmentAltVM::start", leftParticipant, commentHeight);

    const ifBlock = this.alt?.ifBlock?.();
    if (ifBlock) {
      // console.info("FragmentAltVM::ifBlock::start", cursor);
      const ifCondText = ifBlock?.parExpr?.()?.condition?.()?.getFormattedText?.() ?? "";
      cursor += this.conditionLabelHeight(ifCondText); // .text-skin-fragment > label
      cursor = this.layoutBlock(
        ifBlock.braceBlock()?.block(),
        leftParticipant,
        cursor,
      );
      // console.info("FragmentAltVM::ifBlock::end", cursor);
    }
    this.alt?.elseIfBlock?.()?.forEach((block: any) => {
      // console.info("FragmentAltVM::elseIfBlock::start", cursor);
      const elseIfCondText = block?.parExpr?.()?.condition?.()?.getFormattedText?.() ?? "";
      cursor += this.conditionLabelHeight(elseIfCondText); // .text-skin-fragment > label
      cursor += 8; // .mt-2
      cursor += 1; // .segment.border-t.border-solid
      cursor = this.layoutBlock(
        block?.braceBlock?.()?.block?.(),
        leftParticipant,
        cursor,
      );
      // console.info("FragmentAltVM::elseIfBlock::end", cursor);
    });
    const elseBlock = this.alt?.elseBlock?.()?.braceBlock?.()?.block?.();
    if (elseBlock) {
      // console.info("FragmentAltVM::elseBlock::start", cursor);
      cursor += this.conditionLabelHeight("[else]"); // .text-skin-fragment > label
      cursor += 8; // .mt-2
      cursor += 1; // .segment.border-t.border-solid
      cursor = this.layoutBlock(elseBlock, leftParticipant, cursor);
      // console.info("FragmentAltVM::elseBlock::end", cursor);
    }

    cursor += this.metrics.fragmentPaddingBottom + 1; // .zenuml .fragment =>padding-bottom: 10px
    // console.info("FragmentAltVM::end", cursor, cursor - top);

    return {
      top,
      height: cursor - top,
      kind: this.kind,
    };
  }
}
