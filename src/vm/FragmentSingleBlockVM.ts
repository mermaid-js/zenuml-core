import { FragmentVM } from "./FragmentVM";

export class FragmentSingleBlockVM extends FragmentVM {
  constructor(statement: any, private readonly fragment: any) {
    super(statement);
  }

  protected fragmentBodyHeight(fragmentOrigin: string): number {
    const nestedBlock = this.fragment?.braceBlock?.()?.block?.();
    return this.blockHeight(nestedBlock, fragmentOrigin);
  }
}
