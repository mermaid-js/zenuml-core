import { createBlockVM } from "./createBlockVM";

export abstract class NodeVM {
  constructor(protected readonly context: any) {}

  protected blockHeight(blockContext: any, origin: string): number {
    if (!blockContext) return 0;
    return createBlockVM(blockContext).height(origin);
  }
}
