import { NodeVM } from "./NodeVM";
import type { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import type { StatementKind } from "@/positioning/vertical/StatementTypes";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";
import { MarkdownMeasurer } from "@/positioning/vertical/MarkdownMeasurer";

export abstract class StatementVM extends NodeVM {
  abstract readonly kind: StatementKind;

  public abstract measure(top: number, origin: string): StatementCoordinate;

  protected get metrics() {
    return this.runtime.metrics;
  }

  protected measureComment(context: any = this.context): number {
    if (!context?.getComment || !context.getComment()) return 0;
    return new MarkdownMeasurer().measure(context.getComment());
  }

  protected findLeftParticipant(
    ctx: any,
    fallbackOrigin: string,
  ): string | undefined {
    if (!ctx) return undefined;
    const local = getLocalParticipantNames(ctx) || [];
    const ordered = this.runtime.participants;
    return (
      ordered.find((name) => local.includes(name)) ||
      local[0] ||
      fallbackOrigin ||
      undefined
    );
  }
}
