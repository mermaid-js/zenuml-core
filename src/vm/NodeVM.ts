import { createBlockVM } from "./createBlockVM";
import type { LayoutRuntime } from "./types";

export abstract class NodeVM {
  constructor(
    protected readonly context: any,
    protected readonly runtime: LayoutRuntime,
  ) {}

  protected blockHeight(blockContext: any, origin: string): number {
    if (!blockContext) return 0;
    return createBlockVM(blockContext, this.runtime).height(origin);
  }
}
