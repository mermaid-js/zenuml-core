/**
 * The one place that answers "which fragment is this statement, and what are
 * its section blocks?" for an ANTLR `stat` node.
 *
 * The grammar gives a `stat` a single alternative, so at most one fragment
 * accessor returns a context and the probe order is not observable.
 */
import { SINGLE_BLOCK_FRAGMENT_KINDS } from "@/positioning/vertical/StatementTypes";
import type { SingleBlockFragmentKind } from "@/positioning/vertical/StatementTypes";
import type { BlockNode, StatNode } from "./AntlrTypes";

export type FragmentKind = SingleBlockFragmentKind | "alt" | "tcf" | "ref";

export interface FragmentSection {
  /** if / else if / else / try / catch / finally; for `loop`, the `while` keyword when written. */
  guardKeyword?: string;
  /** Editable guard text: the condition of if / else if / single-block kinds, the exception of catch. */
  condition?: string;
  /** The ANTLR condition node behind `condition` (if / else if / single-block kinds), for editable labels. */
  conditionContext?: any;
  /** False for sections that follow the first one (else if, else, catch, finally). */
  isLeading: boolean;
  block: BlockNode | undefined;
}

export interface FragmentView {
  kind: FragmentKind;
  /** The fragment's ANTLR context (`stat.loop()`, `stat.alt()`, ...). */
  context: any;
  /** Section blocks in source order. Empty for `ref`. */
  sections: FragmentSection[];
}

const blockOf = (ctx: any): BlockNode | undefined =>
  ctx?.braceBlock?.()?.block?.();

const conditionOf = (ctx: any): any => ctx?.parExpr?.()?.condition?.();

const conditionText = (ctx: any): string =>
  conditionOf(ctx)?.getFormattedText?.() || "";

export function fragmentOf(stat: StatNode): FragmentView | null {
  for (const kind of SINGLE_BLOCK_FRAGMENT_KINDS) {
    const frag: any = stat[kind]?.();
    if (frag) {
      return {
        kind,
        context: frag,
        sections: [
          {
            guardKeyword:
              kind === "loop" ? frag.WHILE?.()?.getText?.() : undefined,
            condition: conditionText(frag),
            conditionContext: conditionOf(frag),
            isLeading: true,
            block: blockOf(frag),
          },
        ],
      };
    }
  }

  const alt: any = stat.alt?.();
  if (alt) {
    const sections: FragmentSection[] = [];
    const ifBlock = alt.ifBlock?.();
    if (ifBlock) {
      sections.push({
        guardKeyword: "if",
        condition: conditionText(ifBlock),
        conditionContext: conditionOf(ifBlock),
        isLeading: true,
        block: blockOf(ifBlock),
      });
    }
    for (const elseIf of alt.elseIfBlock?.() || []) {
      sections.push({
        guardKeyword: "else if",
        condition: conditionText(elseIf),
        conditionContext: conditionOf(elseIf),
        isLeading: false,
        block: blockOf(elseIf),
      });
    }
    const elseBlock = alt.elseBlock?.();
    if (elseBlock) {
      sections.push({
        guardKeyword: "else",
        isLeading: false,
        block: blockOf(elseBlock),
      });
    }
    return { kind: "alt", context: alt, sections };
  }

  const tcf: any = stat.tcf?.();
  if (tcf) {
    const sections: FragmentSection[] = [];
    const tryBlock = tcf.tryBlock?.();
    if (tryBlock) {
      sections.push({
        guardKeyword: "try",
        isLeading: true,
        block: blockOf(tryBlock),
      });
    }
    for (const catchBlock of tcf.catchBlock?.() || []) {
      sections.push({
        guardKeyword: "catch",
        condition:
          catchBlock.invocation?.()?.parameters?.()?.getFormattedText?.() || "",
        isLeading: false,
        block: blockOf(catchBlock),
      });
    }
    const finallyBlock = tcf.finallyBlock?.();
    if (finallyBlock) {
      sections.push({
        guardKeyword: "finally",
        isLeading: false,
        block: blockOf(finallyBlock),
      });
    }
    return { kind: "tcf", context: tcf, sections };
  }

  const ref: any = stat.ref?.();
  if (ref) {
    return { kind: "ref", context: ref, sections: [] };
  }

  return null;
}
