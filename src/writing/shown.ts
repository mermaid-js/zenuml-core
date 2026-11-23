import { Participants } from "@/parser";
import { statementTree, type IdNode } from "@/parser/identity/identityKeys";
import { reconcileList } from "@/parser/identity/reconcile";

/** What one committed frame draws, as the loss guard compares it. */
export interface Shown {
  /** Participant names; the gate holds a message to any other name. */
  names: ReadonlySet<string>;
  statements: IdNode[];
}

export const shownOf = (root: any): Shown => ({
  names: new Set(root ? Participants(root).Names() : []),
  statements: statementTree(root),
});

const countGone = (olds: IdNode[], news: IdNode[]): number => {
  const { pairs, gone } = reconcileList(olds, news);
  const size = (n: IdNode): number =>
    1 + n.children.reduce((sum, c) => sum + size(c), 0);
  return (
    gone.reduce((sum, n) => sum + size(n), 0) +
    pairs.reduce((sum, [o, n]) => sum + countGone(o.children, n.children), 0)
  );
};

/**
 * How many participants and statements on screen a next frame would remove
 * (ADR 0009, the loss guard). The data-level counterpart of the spike's
 * `rootsGone`, which compared the drawn SVG.
 */
export const lostElements = (shown: Shown, next: Shown): number =>
  [...shown.names].filter((name) => !next.names.has(name)).length +
  countGone(shown.statements, next.statements);
