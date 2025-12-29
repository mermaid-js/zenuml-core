import { BlockVM } from "./BlockVM";
import type { LayoutRuntime } from "./types";
import type { StatementKind } from "../StatementTypes";

export abstract class NodeVM {
  constructor(
    protected readonly context: any,
    protected readonly runtime: LayoutRuntime,
  ) {}

  protected layoutBlock(
    blockContext: any,
    origin: string,
    startTop: number,
    parentKind?: StatementKind,
  ): number {
    if (!blockContext) {
      return startTop;
    }
    return new BlockVM(blockContext, this.runtime).layout(
      origin,
      startTop,
      parentKind,
    );
  }
}
