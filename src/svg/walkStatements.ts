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
  /** Nesting depth of active occurrences on the sender (0 = none, 1 = one level, etc.) */
  senderOccurrenceDepth: number;
  /** Whether the target (to) already has an active occurrence (new one will be nested) */
  targetHasOccurrence?: boolean;
  /** Nesting depth of active occurrences on the target (0 = none, 1 = one level, etc.) */
  targetOccurrenceDepth?: number;
  /** Sequence number (e.g. "1", "2.1") computed from block nesting and statement index */
  number?: string;
  /** Nesting depth (0 = root block, 1 = first nested block, etc.) */
  depth: number;
  /** True on first statement of a non-first fragment section (else, catch, finally).
   *  Used by computeReturnDebt to reset debt between independent CSS sections. */
  sectionReset?: boolean;
}

export function walkStatements(rootContext: any): StatementInfo[] {
  const block = rootContext?.block?.();
  if (!block) return [];
  return walkBlock(block, _STARTER_, new Map(), "", 0);
}

function normalizeLabel(label: string): string {
  return label.trim();
}

function walkBlock(block: any, currentOrigin: string, activeOccurrences: Map<string, number>, parentNumber: string, depth: number): StatementInfo[] {
  const statements = block?.stat?.() || [];
  const results: StatementInfo[] = [];
  let index = 0;

  for (const stat of statements) {
    const key = createStatementKey(stat);
    if (!key) continue;

    index++;
    const number = parentNumber ? `${parentNumber}.${index}` : String(index);
    const comment = stat.getComment?.() || "";

    const message = stat.message?.();
    if (message) {
      const from = message.From?.() || currentOrigin;
      const to = message.Owner?.() || _STARTER_;
      const label = normalizeLabel(message.SignatureText?.() || "");
      const nestedBlock = message.braceBlock?.()?.block?.();
      results.push({ key, kind: "sync", from, to, label, isSelf: from === to, hasBlock: !!nestedBlock, comment, statNode: stat, senderOccurrenceDepth: activeOccurrences.get(from) || 0, targetHasOccurrence: activeOccurrences.has(to), targetOccurrenceDepth: activeOccurrences.get(to) || 0, number, depth });

      if (nestedBlock) {
        const innerOccs = new Map(activeOccurrences);
        innerOccs.set(to, (innerOccs.get(to) || 0) + 1);
        results.push(...walkBlock(nestedBlock, to, innerOccs, number, depth + 1));
      }
      continue;
    }

    const asyncMsg = stat.asyncMessage?.();
    if (asyncMsg) {
      const from = asyncMsg.From?.() || asyncMsg.ProvidedFrom?.() || asyncMsg.Origin?.() || currentOrigin;
      const to = asyncMsg.Owner?.() || asyncMsg.to?.()?.getFormattedText?.() || from;
      const label = normalizeLabel(asyncMsg.content?.()?.getText?.() || asyncMsg.SignatureText?.() || "");
      results.push({ key, kind: "async", from, to, label, isSelf: from === to, hasBlock: false, comment, senderOccurrenceDepth: activeOccurrences.get(from) || 0, targetHasOccurrence: activeOccurrences.has(to), number, depth });
      continue;
    }

    const creation = stat.creation?.();
    if (creation) {
      const from = creation.From?.() || currentOrigin;
      const to = creation.Owner?.() || "";
      const label = normalizeLabel(creation.SignatureText?.() || "«create»");
      const creationBlock = creation.braceBlock?.()?.block?.();
      results.push({ key, kind: "creation", from, to, label, isSelf: false, hasBlock: !!creationBlock, comment, statNode: stat, senderOccurrenceDepth: activeOccurrences.get(from) || 0, targetHasOccurrence: activeOccurrences.has(to), number, depth });

      if (creationBlock) {
        const innerOccs = new Map(activeOccurrences);
        innerOccs.set(to, (innerOccs.get(to) || 0) + 1);
        results.push(...walkBlock(creationBlock, to || currentOrigin, innerOccs, number, depth + 1));
      }
      continue;
    }

    const ret = stat.ret?.();
    if (ret) {
      const label = normalizeLabel(ret.SignatureText?.() || "");
      const asyncMessage = ret?.asyncMessage?.();
      const from = asyncMessage?.From?.() || ret?.From?.() || currentOrigin;
      const to = asyncMessage?.to?.()?.getFormattedText?.() || ret?.ReturnTo?.() || _STARTER_;
      results.push({ key, kind: "return", from, to, label, isSelf: from === to, hasBlock: false, comment, senderOccurrenceDepth: activeOccurrences.get(from) || 0, targetOccurrenceDepth: activeOccurrences.get(to) || 0, number, depth });
      continue;
    }

    const divider = stat.divider?.();
    if (divider) {
      const label = normalizeLabel(divider.getFormattedText?.() || divider.getText?.() || "");
      results.push({ key, kind: "divider", from: "", to: "", label, isSelf: false, hasBlock: false, senderOccurrenceDepth: 0, number, depth });
      continue;
    }

    // Fragments — record with enriched metadata and recurse into their blocks
    const fragmentInfo = extractFragmentInfo(stat, currentOrigin);
    results.push({
      key,
      kind: "fragment",
      from: currentOrigin,
      to: "",
      label: fragmentInfo.label,
      isSelf: false,
      hasBlock: false,
      fragmentKind: fragmentInfo.fragmentKind,
      fragmentLabel: fragmentInfo.label,
      fragmentSections: fragmentInfo.sections,
      comment,
      statNode: stat,
      senderOccurrenceDepth: activeOccurrences.get(currentOrigin) || 0,
      number,
      depth,
    });
    walkFragmentBlocks(stat, currentOrigin, results, activeOccurrences, number, depth);
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

    return { fragmentKind: "tcf", label: "", sections };
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
function walkFragmentBlocks(stat: any, origin: string, results: StatementInfo[], activeOccurrences: Map<string, number>, parentNumber: string, depth: number): void {
  // Single-block fragments: loop, opt, par, critical, section
  for (const kind of ["loop", "opt", "par", "critical", "section"] as const) {
    const frag = stat[kind]?.();
    if (frag) {
      const block = frag.braceBlock?.()?.block?.();
      if (block) results.push(...walkBlock(block, origin, activeOccurrences, parentNumber, depth + 1));
      return;
    }
  }

  // Alt (if/else if/else) — multiple blocks
  const alt = stat.alt?.();
  if (alt) {
    const ifBlock = alt.ifBlock?.();
    if (ifBlock) {
      const block = ifBlock.braceBlock?.()?.block?.();
      if (block) results.push(...walkBlock(block, origin, activeOccurrences, parentNumber, depth + 1));
    }
    for (const elseIf of alt.elseIfBlock?.() || []) {
      const block = elseIf.braceBlock?.()?.block?.();
      if (block) {
        const sectionStmts = walkBlock(block, origin, activeOccurrences, parentNumber, depth + 1);
        if (sectionStmts.length > 0) sectionStmts[0].sectionReset = true;
        results.push(...sectionStmts);
      }
    }
    const elseBlock = alt.elseBlock?.();
    if (elseBlock) {
      const block = elseBlock.braceBlock?.()?.block?.();
      if (block) {
        const sectionStmts = walkBlock(block, origin, activeOccurrences, parentNumber, depth + 1);
        if (sectionStmts.length > 0) sectionStmts[0].sectionReset = true;
        results.push(...sectionStmts);
      }
    }
    return;
  }

  // Try/catch/finally — multiple blocks
  const tcf = stat.tcf?.();
  if (tcf) {
    const tryBlock = tcf.tryBlock?.();
    if (tryBlock) {
      const block = tryBlock.braceBlock?.()?.block?.();
      if (block) results.push(...walkBlock(block, origin, activeOccurrences, parentNumber, depth + 1));
    }
    for (const catchBlock of tcf.catchBlock?.() || []) {
      const block = catchBlock.braceBlock?.()?.block?.();
      if (block) {
        const sectionStmts = walkBlock(block, origin, activeOccurrences, parentNumber, depth + 1);
        if (sectionStmts.length > 0) sectionStmts[0].sectionReset = true;
        results.push(...sectionStmts);
      }
    }
    const finallyBlock = tcf.finallyBlock?.();
    if (finallyBlock) {
      const block = finallyBlock.braceBlock?.()?.block?.();
      if (block) {
        const sectionStmts = walkBlock(block, origin, activeOccurrences, parentNumber, depth + 1);
        if (sectionStmts.length > 0) sectionStmts[0].sectionReset = true;
        results.push(...sectionStmts);
      }
    }
    return;
  }
}
