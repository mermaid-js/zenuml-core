import { NodeVM } from "./NodeVM";
import { getCommentHeight } from "./getCommentHeight";
import { resolveFragmentOrigin } from "./resolveFragmentOrigin";
import { STATEMENT_CONTAINER_MARGIN } from "@/positioning/Constants.ts";

export abstract class StatementVM extends NodeVM {
  public height(origin: string): number {
    const commentHeight = getCommentHeight(this.context);
    const statementHeight = STATEMENT_CONTAINER_MARGIN + commentHeight + this.heightAfterComment(origin);
    console.log(this.context.getFormattedText());
    console.log(
      `StatementVM.height(${origin}): ${statementHeight}`,
    );
    return statementHeight;
  }

  protected resolveFragmentOrigin(fallbackOrigin: string): string {
    return resolveFragmentOrigin(this.context, fallbackOrigin);
  }

  protected abstract heightAfterComment(origin: string): number;
}
