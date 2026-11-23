import { Participants } from "@/parser";
import { statementTree, type IdNode } from "@/parser/identity/identityKeys";
import { reconcileList, type Signed } from "@/parser/identity/reconcile";

/** A statement as the loss guard sees it: plain data, no parse context. */
export interface ShownNode extends Signed {
  children: ShownNode[];
}

const plain = (n: IdNode): ShownNode => ({
  kind: n.kind,
  label: n.label,
  children: n.children.map(plain),
});

/** What one committed frame draws, as the loss guard compares it. */
export interface Shown {
  /** Participant names; the gate holds a message to any other name. */
  names: ReadonlySet<string>;
  statements: ShownNode[];
  /** The diagram title; a title alone is a drawn frame, not an empty one. */
  title?: string;
}

export const shownOf = (root: any): Shown => ({
  names: new Set(root ? Participants(root).Names() : []),
  statements: statementTree(root).map(plain),
  title: String(root?.title?.()?.content?.() ?? ""),
});

const countGone = (olds: ShownNode[], news: ShownNode[]): number => {
  const { pairs, gone } = reconcileList(olds, news);
  const size = (n: ShownNode): number =>
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
