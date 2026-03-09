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

      // Recurse into nested block (e.g. A.m() { B.n() })
      const nestedBlock = message.braceBlock?.()?.block?.();
      if (nestedBlock) {
        results.push(...walkBlock(nestedBlock, to));
      }
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

      // Recurse into creation block (e.g. new B() { C.method() })
      const creationBlock = creation.braceBlock?.()?.block?.();
      if (creationBlock) {
        results.push(...walkBlock(creationBlock, to || currentOrigin));
      }
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

    // Fragments — record and recurse into their blocks
    results.push({ key, kind: "fragment", from: "", to: "", label: "", isSelf: false });
    walkFragmentBlocks(stat, currentOrigin, results);
  }

  return results;
}

/** Recurse into fragment inner blocks (loop, opt, alt, try/catch, etc.) */
function walkFragmentBlocks(stat: any, origin: string, results: StatementInfo[]): void {
  // Single-block fragments: loop, opt, par, critical, section
  for (const kind of ["loop", "opt", "par", "critical", "section"] as const) {
    const frag = stat[kind]?.();
    if (frag) {
      const block = frag.braceBlock?.()?.block?.();
      if (block) results.push(...walkBlock(block, origin));
      return;
    }
  }

  // Alt (if/else if/else) — multiple blocks
  const alt = stat.alt?.();
  if (alt) {
    const ifBlock = alt.ifBlock?.();
    if (ifBlock) {
      const block = ifBlock.braceBlock?.()?.block?.();
      if (block) results.push(...walkBlock(block, origin));
    }
    for (const elseIf of alt.elseIfBlock?.() || []) {
      const block = elseIf.braceBlock?.()?.block?.();
      if (block) results.push(...walkBlock(block, origin));
    }
    const elseBlock = alt.elseBlock?.();
    if (elseBlock) {
      const block = elseBlock.braceBlock?.()?.block?.();
      if (block) results.push(...walkBlock(block, origin));
    }
    return;
  }

  // Try/catch/finally — multiple blocks
  const tcf = stat.tcf?.();
  if (tcf) {
    const tryBlock = tcf.tryBlock?.();
    if (tryBlock) {
      const block = tryBlock.braceBlock?.()?.block?.();
      if (block) results.push(...walkBlock(block, origin));
    }
    for (const catchBlock of tcf.catchBlock?.() || []) {
      const block = catchBlock.braceBlock?.()?.block?.();
      if (block) results.push(...walkBlock(block, origin));
    }
    const finallyBlock = tcf.finallyBlock?.();
    if (finallyBlock) {
      const block = finallyBlock.braceBlock?.()?.block?.();
      if (block) results.push(...walkBlock(block, origin));
    }
    return;
  }
}
