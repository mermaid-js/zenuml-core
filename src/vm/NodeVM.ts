import { BlockVM } from "./BlockVM";
import type { LayoutRuntime } from "./types";

export abstract class NodeVM {
  constructor(
    protected readonly context: any,
    protected readonly runtime: LayoutRuntime,
  ) {}

  protected layoutBlock(
    blockContext: any,
    origin: string,
    startTop: number,
  ): number {
    if (!blockContext) {
      return startTop;
    }
    return new BlockVM(blockContext, this.runtime).layout(origin, startTop);
  }
}
