import type { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
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
    let cursor = top + this.metrics.fragmentHeaderHeight + commentHeight;
    console.info("FragmentAltVM::start", leftParticipant, commentHeight);

    const ifBlock = this.alt?.ifBlock?.();
    if (ifBlock) {
      console.info("FragmentAltVM::ifBlock::start", cursor);
      cursor += 20; // .text-skin-fragment > label
      cursor = this.layoutBlock(
        ifBlock.braceBlock()?.block(),
        leftParticipant,
        cursor,
      );
      console.info("FragmentAltVM::ifBlock::end", cursor);
    }
    this.alt?.elseIfBlock?.()?.forEach((block: any) => {
      console.info("FragmentAltVM::elseIfBlock::start", cursor);
      cursor += 20; // .text-skin-fragment > label
      cursor = this.layoutBlock(
        block?.braceBlock?.()?.block?.(),
        leftParticipant,
        cursor,
      );
      console.info("FragmentAltVM::elseIfBlock::end", cursor);
    });
    const elseBlock = this.alt?.elseBlock?.()?.braceBlock?.()?.block?.();
    if (elseBlock) {
      console.info("FragmentAltVM::elseBlock::start", cursor);
      cursor += 20; // .text-skin-fragment > label
      cursor = this.layoutBlock(elseBlock, leftParticipant, cursor);
      console.info("FragmentAltVM::elseBlock::end", cursor);
    }

    cursor += this.metrics.fragmentPaddingBottom; // .zenuml .fragment =>padding-bottom: 10px
    console.info("FragmentAltVM::end", cursor, cursor - top);

    return {
      top,
      height: cursor - top,
      kind: this.kind,
    };
  }
}
