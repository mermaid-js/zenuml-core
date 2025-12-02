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
    const { cursor } = this.beginFragment(this.alt, top);
    let _cursor = cursor;

    const leftParticipant =
      this.findLeftParticipant(this.alt, origin) || origin;
    console.info("FragmentAltVM::leftParticipant", leftParticipant);

    const branches = [];
    const ifBlock = this.alt?.ifBlock?.();
    if (ifBlock) {
      console.info("FragmentAltVM::ifBlock");
      branches.push(ifBlock.braceBlock()?.block());
    }
    this.alt?.elseIfBlock?.()?.forEach((block: any) => {
      console.info("FragmentAltVM::elseIfBlock");
      branches.push(block?.braceBlock?.()?.block?.());
    });
    const elseBlock = this.alt?.elseBlock?.()?.braceBlock?.()?.block?.();
    if (elseBlock) {
      console.info("FragmentAltVM::elseBlock");
      branches.push(elseBlock);
    }

    branches.forEach((branch, index) => {
      _cursor += 20; // .text-skin-fragment > label
      _cursor = this.layoutNestedBlock(branch, leftParticipant, _cursor);
      if (index < branches.length - 1) {
        _cursor += 10; // .fragmentBranchGap => padding-bottom: 10px
      }
    });

    const result = this.finalizeFragment(top, _cursor, {
      branchCount: branches.length,
    });

    return {
      top: result.top,
      height: result.height,
      kind: this.kind,
      meta: result.meta,
    };
  }
}
