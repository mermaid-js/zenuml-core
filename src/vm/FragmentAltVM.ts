import { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import { FragmentVM } from "./FragmentVM";
import type { LayoutRuntime } from "./types";

interface FragmentBranch {
  block?: any;
  conditionHeight?: number;
}

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
    const {
      cursor: startCursor,
      commentHeight,
      headerHeight,
    } = this.beginFragment(this.alt, top);
    let cursor = startCursor;
    const leftParticipant =
      this.findLeftParticipant(this.alt, origin) || origin;

    const branches: FragmentBranch[] = [];
    const ifBlock = this.alt?.ifBlock?.();
    if (ifBlock) {
      branches.push({
        block: ifBlock.braceBlock()?.block(),
        conditionHeight: this.metrics.fragmentConditionHeight,
      });
    }
    this.alt?.elseIfBlock?.()?.forEach((block: any) => {
      branches.push({
        block: block?.braceBlock?.()?.block?.(),
        conditionHeight: this.metrics.fragmentConditionHeight,
      });
    });
    const elseBlock = this.alt?.elseBlock?.()?.braceBlock?.()?.block?.();
    if (elseBlock) {
      branches.push({
        block: elseBlock,
        conditionHeight: this.metrics.fragmentElseLabelHeight,
      });
    }

    let conditionedBranches = 0;
    let totalConditionHeight = 0;
    branches.forEach((branch, index) => {
      if (branch.conditionHeight) {
        cursor += branch.conditionHeight;
        conditionedBranches += 1;
        totalConditionHeight += branch.conditionHeight;
      }
      cursor = this.layoutNestedBlock(branch.block, leftParticipant, cursor);
      if (index < branches.length - 1) {
        cursor += this.metrics.fragmentBranchGap;
      }
    });

    const result = this.finalizeFragment(top, cursor, {
      commentHeight,
      headerHeight,
      branchGap: this.metrics.fragmentBranchGap,
      branchCount: branches.length,
      conditionedBranches,
      conditionHeight: totalConditionHeight,
    });

    return {
      top: result.top,
      height: result.height,
      kind: this.kind,
      meta: result.meta,
    };
  }
}
