/**
 * Walks the ANTLR parse tree and extracts statement metadata
 * (from, to, label, kind) that the positioning engine doesn't store.
 *
 * Returns one entry per statement, keyed by the same key used in
 * VerticalCoordinates so they can be joined.
 */
import { createStatementKey } from "@/positioning/vertical/StatementIdentifier";
import { _STARTER_ } from "@/parser/OrderedParticipants";

export interface StatementInfo {
  key: string;
  kind: "sync" | "async" | "creation" | "return" | "divider" | "fragment" | "empty";
  from: string;
  to: string;
  label: string;
  isSelf: boolean;
}

export function walkStatements(rootContext: any): StatementInfo[] {
  const block = rootContext?.block?.();
  if (!block) return [];
  return walkBlock(block, _STARTER_);
}

function walkBlock(block: any, currentOrigin: string): StatementInfo[] {
  const statements = block?.stat?.() || [];
  const results: StatementInfo[] = [];

  for (const stat of statements) {
    const key = createStatementKey(stat);
    if (!key) continue;

    const message = stat.message?.();
    if (message) {
      const from = message.From?.() || currentOrigin;
      const to = message.Owner?.() || _STARTER_;
      const label = message.SignatureText?.() || "";
      results.push({ key, kind: "sync", from, to, label, isSelf: from === to });
      continue;
    }

    const asyncMsg = stat.asyncMessage?.();
    if (asyncMsg) {
      const from = asyncMsg.From?.() || asyncMsg.ProvidedFrom?.() || asyncMsg.Origin?.() || currentOrigin;
      const to = asyncMsg.Owner?.() || asyncMsg.to?.()?.getFormattedText?.() || from;
      const label = asyncMsg.content?.()?.getText?.() || asyncMsg.SignatureText?.() || "";
      results.push({ key, kind: "async", from, to, label, isSelf: from === to });
      continue;
    }

    const creation = stat.creation?.();
    if (creation) {
      const from = creation.From?.() || currentOrigin;
      const to = creation.Owner?.() || "";
      const label = creation.getFormattedText?.() || "";
      results.push({ key, kind: "creation", from, to, label, isSelf: false });
      continue;
    }

    const ret = stat.ret?.();
    if (ret) {
      const label = ret.getFormattedText?.() || ret.retValue?.()?.getText?.() || "";
      results.push({ key, kind: "return", from: "", to: "", label, isSelf: false });
      continue;
    }

    const divider = stat.divider?.();
    if (divider) {
      const label = divider.getFormattedText?.() || divider.getText?.() || "";
      results.push({ key, kind: "divider", from: "", to: "", label, isSelf: false });
      continue;
    }

    // Fragments — just record their existence, deeper handling later
    results.push({ key, kind: "fragment", from: "", to: "", label: "", isSelf: false });
  }

  return results;
}
