/**
 * Walks the ANTLR parse tree and extracts statement metadata
 * (from, to, label, kind) that the positioning engine doesn't store.
 *
 * Returns one entry per statement, keyed by the same key used in
 * VerticalCoordinates so they can be joined.
 */
import { createStatementKey } from "@/positioning/vertical/StatementIdentifier";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import type { FragmentKind } from "./geometry";

export interface FragmentSectionInfo {
  label: string;
  /** The parse tree block node for this section (used for inner statement key lookups) */
  blockNode: any;
}

export interface StatementInfo {
  key: string;
  kind: "sync" | "async" | "creation" | "return" | "divider" | "fragment" | "empty";
  from: string;
  to: string;
  label: string;
  isSelf: boolean;
  /** Whether this statement has a block body (creates an occurrence on the target) */
  hasBlock: boolean;
  /** For fragments: specific fragment type */
  fragmentKind?: FragmentKind;
  /** For fragments: condition/label text */
  fragmentLabel?: string;
  /** For fragments: section info (for alt/tcf with multiple sections) */
  fragmentSections?: FragmentSectionInfo[];
  /** Inline comment text (e.g. // String line) */
  comment?: string;
  /** The ANTLR parse tree node — needed for local participant extraction */
  statNode?: any;
  /** Whether the sender (from) has an active occurrence at this point */
  senderHasOccurrence?: boolean;
}

export function walkStatements(rootContext: any): StatementInfo[] {
  const block = rootContext?.block?.();
  if (!block) return [];
  return walkBlock(block, _STARTER_, new Set());
}

function walkBlock(block: any, currentOrigin: string, activeOccurrences: Set<string>): StatementInfo[] {
  const statements = block?.stat?.() || [];
  const results: StatementInfo[] = [];

  for (const stat of statements) {
    const key = createStatementKey(stat);
    if (!key) continue;

    const comment = stat.getComment?.() || "";

    const message = stat.message?.();
    if (message) {
      const from = message.From?.() || currentOrigin;
      const to = message.Owner?.() || _STARTER_;
      const label = message.SignatureText?.() || "";
      const nestedBlock = message.braceBlock?.()?.block?.();
      results.push({ key, kind: "sync", from, to, label, isSelf: from === to, hasBlock: !!nestedBlock, comment, statNode: stat, senderHasOccurrence: activeOccurrences.has(from) });

      if (nestedBlock) {
        const innerOccs = new Set(activeOccurrences);
        innerOccs.add(to);
        results.push(...walkBlock(nestedBlock, to, innerOccs));
      }
      continue;
    }

    const asyncMsg = stat.asyncMessage?.();
    if (asyncMsg) {
      const from = asyncMsg.From?.() || asyncMsg.ProvidedFrom?.() || asyncMsg.Origin?.() || currentOrigin;
      const to = asyncMsg.Owner?.() || asyncMsg.to?.()?.getFormattedText?.() || from;
      const label = asyncMsg.content?.()?.getText?.() || asyncMsg.SignatureText?.() || "";
      results.push({ key, kind: "async", from, to, label, isSelf: from === to, hasBlock: false, comment, senderHasOccurrence: activeOccurrences.has(from) });
      continue;
    }

    const creation = stat.creation?.();
    if (creation) {
      const from = creation.From?.() || currentOrigin;
      const to = creation.Owner?.() || "";
      const label = creation.SignatureText?.() || "«create»";
      const creationBlock = creation.braceBlock?.()?.block?.();
      results.push({ key, kind: "creation", from, to, label, isSelf: false, hasBlock: !!creationBlock, comment, statNode: stat, senderHasOccurrence: activeOccurrences.has(from) });

      if (creationBlock) {
        const innerOccs = new Set(activeOccurrences);
        innerOccs.add(to);
        results.push(...walkBlock(creationBlock, to || currentOrigin, innerOccs));
      }
      continue;
    }

    const ret = stat.ret?.();
    if (ret) {
      const label = ret.SignatureText?.() || "";
      const asyncMessage = ret?.asyncMessage?.();
      const from = asyncMessage?.From?.() || ret?.From?.() || currentOrigin;
      const to = asyncMessage?.to?.()?.getFormattedText?.() || ret?.ReturnTo?.() || _STARTER_;
      results.push({ key, kind: "return", from, to, label, isSelf: from === to, hasBlock: false, comment });
      continue;
    }

    const divider = stat.divider?.();
    if (divider) {
      const label = divider.getFormattedText?.() || divider.getText?.() || "";
      results.push({ key, kind: "divider", from: "", to: "", label, isSelf: false, hasBlock: false });
      continue;
    }

    // Fragments — record with enriched metadata and recurse into their blocks
    const fragmentInfo = extractFragmentInfo(stat, currentOrigin);
    results.push({
      key,
      kind: "fragment",
      from: "",
      to: "",
      label: fragmentInfo.label,
      isSelf: false,
      hasBlock: false,
      fragmentKind: fragmentInfo.fragmentKind,
      fragmentLabel: fragmentInfo.label,
      fragmentSections: fragmentInfo.sections,
      statNode: stat,
    });
    walkFragmentBlocks(stat, currentOrigin, results, activeOccurrences);
  }

  return results;
}

interface FragmentExtract {
  fragmentKind: FragmentKind;
  label: string;
  sections: FragmentSectionInfo[];
}

function extractFragmentInfo(stat: any, _origin: string): FragmentExtract {
  // Single-block fragments: loop, opt, par, critical, section
  for (const kind of ["loop", "opt", "par", "critical", "section"] as const) {
    const frag = stat[kind]?.();
    if (frag) {
      const condition = frag.parExpr?.()?.condition?.();
      const label = condition?.getFormattedText?.() || "";
      return {
        fragmentKind: kind,
        label,
        sections: [{ label, blockNode: frag.braceBlock?.()?.block?.() }],
      };
    }
  }

  // Alt (if/else if/else) — multiple sections
  const alt = stat.alt?.();
  if (alt) {
    const sections: FragmentSectionInfo[] = [];
    const ifBlock = alt.ifBlock?.();
    if (ifBlock) {
      const condition = ifBlock.parExpr?.()?.condition?.();
      const label = condition?.getFormattedText?.() || "";
      sections.push({ label, blockNode: ifBlock.braceBlock?.()?.block?.() });
    }
    for (const elseIf of alt.elseIfBlock?.() || []) {
      const condition = elseIf.parExpr?.()?.condition?.();
      const label = condition?.getFormattedText?.() || "";
      sections.push({ label: `else if [${label}]`, blockNode: elseIf.braceBlock?.()?.block?.() });
    }
    const elseBlock = alt.elseBlock?.();
    if (elseBlock) {
      sections.push({ label: "[else]", blockNode: elseBlock.braceBlock?.()?.block?.() });
    }

    const firstLabel = sections.length > 0 ? sections[0].label : "";
    return { fragmentKind: "alt", label: firstLabel, sections };
  }

  // Try/catch/finally — multiple sections
  const tcf = stat.tcf?.();
  if (tcf) {
    const sections: FragmentSectionInfo[] = [];
    const tryBlock = tcf.tryBlock?.();
    if (tryBlock) {
      sections.push({ label: "try", blockNode: tryBlock.braceBlock?.()?.block?.() });
    }
    for (const catchBlock of tcf.catchBlock?.() || []) {
      const exception = catchBlock.invocation?.()?.parameters?.()?.getFormattedText?.() || "";
      sections.push({ label: `catch ${exception}`, blockNode: catchBlock.braceBlock?.()?.block?.() });
    }
    const finallyBlock = tcf.finallyBlock?.();
    if (finallyBlock) {
      sections.push({ label: "finally", blockNode: finallyBlock.braceBlock?.()?.block?.() });
    }

    return { fragmentKind: "tcf", label: "try", sections };
  }

  // Ref fragment
  const ref = stat.ref?.();
  if (ref) {
    const label = ref.getFormattedText?.() || "";
    return { fragmentKind: "ref", label, sections: [] };
  }

  return { fragmentKind: "loop", label: "", sections: [] };
}

/** Recurse into fragment inner blocks (loop, opt, alt, try/catch, etc.) */
function walkFragmentBlocks(stat: any, origin: string, results: StatementInfo[], activeOccurrences: Set<string>): void {
  // Single-block fragments: loop, opt, par, critical, section
  for (const kind of ["loop", "opt", "par", "critical", "section"] as const) {
    const frag = stat[kind]?.();
    if (frag) {
      const block = frag.braceBlock?.()?.block?.();
      if (block) results.push(...walkBlock(block, origin, activeOccurrences));
      return;
    }
  }

  // Alt (if/else if/else) — multiple blocks
  const alt = stat.alt?.();
  if (alt) {
    const ifBlock = alt.ifBlock?.();
    if (ifBlock) {
      const block = ifBlock.braceBlock?.()?.block?.();
      if (block) results.push(...walkBlock(block, origin, activeOccurrences));
    }
    for (const elseIf of alt.elseIfBlock?.() || []) {
      const block = elseIf.braceBlock?.()?.block?.();
      if (block) results.push(...walkBlock(block, origin, activeOccurrences));
    }
    const elseBlock = alt.elseBlock?.();
    if (elseBlock) {
      const block = elseBlock.braceBlock?.()?.block?.();
      if (block) results.push(...walkBlock(block, origin, activeOccurrences));
    }
    return;
  }

  // Try/catch/finally — multiple blocks
  const tcf = stat.tcf?.();
  if (tcf) {
    const tryBlock = tcf.tryBlock?.();
    if (tryBlock) {
      const block = tryBlock.braceBlock?.()?.block?.();
      if (block) results.push(...walkBlock(block, origin, activeOccurrences));
    }
    for (const catchBlock of tcf.catchBlock?.() || []) {
      const block = catchBlock.braceBlock?.()?.block?.();
      if (block) results.push(...walkBlock(block, origin, activeOccurrences));
    }
    const finallyBlock = tcf.finallyBlock?.();
    if (finallyBlock) {
      const block = finallyBlock.braceBlock?.()?.block?.();
      if (block) results.push(...walkBlock(block, origin, activeOccurrences));
    }
    return;
  }
}
