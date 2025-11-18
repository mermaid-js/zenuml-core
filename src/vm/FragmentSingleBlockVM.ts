import { FragmentVM } from "./FragmentVM";
import type { LayoutRuntime } from "./types";

export class FragmentSingleBlockVM extends FragmentVM {
  constructor(
    statement: any,
    private readonly fragment: any,
    runtime: LayoutRuntime,
  ) {
    super(statement, runtime);
  }

  protected fragmentBodyHeight(fragmentOrigin: string): number {
    const nestedBlock = this.fragment?.braceBlock?.()?.block?.();
    return this.blockHeight(nestedBlock, fragmentOrigin);
  }
}
