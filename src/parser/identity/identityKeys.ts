/**
 * Identity keys for the DOM renderer (ADR 0009, gate G7).
 *
 * Every parse builds a new ANTLR tree, so a context object lives for one parse
 * only. A tracker keeps the previous parse, pairs its elements with the new
 * ones (`reconcile.ts`), and gives each new context the id of its old
 * counterpart, or a fresh id. Components use the id as their React key in
 * place of the array index.
 *
 * What gets an id:
 * - statements, reconciled per block, then recursively inside paired
 *   statements (a message's brace block, each fragment section);
 * - fragment sections, reconciled per fragment;
 * - the explicit groups and participants of the header (`LifeLineLayer`).
 *
 * Known limits (documented in the unit tests):
 * - The tracker compares with the previous parse only. A statement that
 *   disappears for one parse (parser flicker) and comes back gets a new id.
 * - A statement moved into another block gets a new id.
 *
 * `createStatementKey` (character offsets) stays the position key for
 * editing and geometry; this is not a replacement for it.
 */
import sequenceParser from "@/generated-parser/sequenceParser";
import ToCollector from "@/parser/ToCollector";
import { fragmentOf } from "@/parser/fragmentOf";
import { reconcileByName, reconcileList, type Signed } from "./reconcile";

export interface IdNode extends Signed {
  ctx: object;
  children: IdNode[];
}

export interface IdentityKeys {
  /** The identity key of a statement, section, group or participant context. */
  get(ctx: unknown): string | undefined;
}

/** The `stat` alternatives, probed in grammar order. */
const STAT_KINDS = [
  "alt",
  "par",
  "opt",
  "critical",
  "section",
  "ref",
  "loop",
  "creation",
  "message",
  "asyncMessage",
  "ret",
  "divider",
  "tcf",
] as const;

const statKind = (stat: any): string => {
  for (const kind of STAT_KINDS) {
    if (stat[kind]?.()) return kind;
  }
  return "stat";
};

const firstBraceBlock = (ctx: any): any => {
  for (const child of ctx?.children || []) {
    if (child instanceof sequenceParser.BraceBlockContext) return child;
    const nested = firstBraceBlock(child);
    if (nested) return nested;
  }
  return undefined;
};

/**
 * The statement's source text up to its first brace block, with whitespace
 * collapsed. Nested statements stay out of the label, so an edit inside an
 * `alt` leaves the `alt` itself unchanged.
 */
export const headerLabel = (ctx: any): string => {
  const start = ctx?.start;
  const stop = ctx?.stop;
  if (!start || !stop) return "";
  const brace = firstBraceBlock(ctx);
  const end = brace?.start ? brace.start.start - 1 : stop.stop;
  if (end < start.start) return "";
  const text: string = start.getInputStream?.()?.getText?.(start.start, end);
  return (text ?? "").replace(/\s+/g, " ").trim();
};

const statNodes = (block: any): IdNode[] =>
  ((block?.stat?.() as any[]) || []).map(statNode);

const statNode = (stat: any): IdNode => {
  const kind = statKind(stat);
  const fragment = fragmentOf(stat);
  let children: IdNode[];
  if (fragment) {
    children = fragment.sections
      .filter((section) => section.context)
      .map((section) => ({
        ctx: section.context,
        kind: `section:${section.guardKeyword ?? ""}`,
        label: section.condition ?? "",
        children: statNodes(section.block),
      }));
  } else {
    const inner = stat[kind]?.();
    children = statNodes(inner?.braceBlock?.()?.block?.());
  }
  return { ctx: stat, kind, label: headerLabel(stat), children };
};

const headNodes = (head: any) => {
  const groups: IdNode[] = [];
  const participants: IdNode[] = [];
  for (const child of (head?.children as any[]) || []) {
    if (child instanceof sequenceParser.GroupContext) {
      groups.push({
        ctx: child,
        kind: "group",
        label: (child as any).name?.()?.getText?.() ?? "",
        children: [],
      });
    } else if (child instanceof sequenceParser.ParticipantContext) {
      participants.push({
        ctx: child,
        kind: "participant",
        label: ToCollector.getParticipants(child).First()?.name ?? "",
        children: [],
      });
    }
  }
  return { groups, participants };
};

/** The statement tree of a parse: kind, header label and nested statements. */
export const statementTree = (root: any): IdNode[] =>
  root ? statNodes(root.block?.()) : [];

interface Snapshot {
  root: object;
  statements: IdNode[];
  groups: IdNode[];
  participants: IdNode[];
  ids: WeakMap<object, string>;
  keys: IdentityKeys;
}

const EMPTY: IdentityKeys = { get: () => undefined };

/**
 * One tracker per diagram instance (per Jotai store): two diagrams on one
 * page must not reconcile against each other.
 */
export function createIdentityTracker() {
  let previous: Snapshot | null = null;
  let seq = 0;
  const fresh = () => `k${++seq}`;

  const update = (root: any): IdentityKeys => {
    if (!root) {
      previous = null;
      return EMPTY;
    }
    if (previous && previous.root === root) return previous.keys;

    const statements = statNodes(root.block?.());
    const { groups, participants } = headNodes(root.head?.());
    const ids = new WeakMap<object, string>();
    const oldIds = previous?.ids;

    const assignBorn = (node: IdNode) => {
      ids.set(node.ctx, fresh());
      node.children.forEach(assignBorn);
    };
    const assignList = (
      olds: IdNode[],
      news: IdNode[],
      match: typeof reconcileList,
    ) => {
      const { pairs, born } = match(olds, news);
      for (const [o, n] of pairs) {
        ids.set(n.ctx, oldIds?.get(o.ctx) ?? fresh());
        assignList(o.children, n.children, reconcileList);
      }
      born.forEach(assignBorn);
    };

    assignList(previous?.statements ?? [], statements, reconcileList);
    assignList(previous?.groups ?? [], groups, reconcileList);
    assignList(previous?.participants ?? [], participants, reconcileByName);

    const keys: IdentityKeys = {
      get: (ctx) => (ctx && typeof ctx === "object" ? ids.get(ctx) : undefined),
    };
    previous = { root, statements, groups, participants, ids, keys };
    return keys;
  };

  return { update };
}
