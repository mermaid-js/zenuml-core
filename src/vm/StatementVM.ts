import { NodeVM } from "./NodeVM";
import { getCommentHeight } from "./getCommentHeight";
import { resolveFragmentOrigin } from "./resolveFragmentOrigin";
import { STATEMENT_CONTAINER_MARGIN } from "@/positioning/Constants";
import type { LayoutRuntime } from "./types";

export abstract class StatementVM extends NodeVM {
  constructor(statement: any, runtime: LayoutRuntime) {
    super(statement, runtime);
  }

  public height(origin: string): number {
    const commentHeight = getCommentHeight(this.context, this.runtime.markdown);
    return (
      STATEMENT_CONTAINER_MARGIN +
      commentHeight +
      this.heightAfterComment(origin)
    );
  }

  protected resolveFragmentOrigin(fallbackOrigin: string): string {
    return resolveFragmentOrigin(this.context, fallbackOrigin);
  }

  protected abstract heightAfterComment(origin: string): number;
}
