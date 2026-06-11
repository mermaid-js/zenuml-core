/**
 * Golden TEXT/COMMENT parity harness (Stage 0 of the ANTLR4 → Langium migration).
 *
 * Captures, for EVERY ParserRuleContext in a full-tree parse, the three
 * renderer-facing text reconstructions (docs/langium-migration/03-context-api-contract.md,
 * R6; 07-risk-map.md G4):
 *
 *   - getFormattedText(): token-stream text over the source interval (WITH hidden
 *     spacing) passed through formatText (quote stripping, whitespace collapse).
 *   - getText(): concatenated token text WITHOUT hidden-channel content.
 *   - getComment(): contiguous COMMENT_CHANNEL tokens left of the first token
 *     (stop token for BraceBlockContext), '//' stripped per line, joined with '\n',
 *     leading spaces preserved.
 *
 * API contract for the future Langium implementation:
 *   - `collectTextFacets(code)` is the ANTLR reference implementation
 *     (alias: `collectTextFacetsWithAntlr`).
 *   - `collectFacetsFromTree(root)` walks ANY tree that exposes the ANTLR context
 *     shape (children / ruleIndex / constructor.name / the three methods) — the
 *     Langium compatibility facade must be assertable through this same walker:
 *       expect(serializeGoldenCase(id, code, collectFacetsFromTree(langiumRoot)))
 *         .toBe(<committed golden file content>);
 */
// Side-effectful import: installs getFormattedText/getComment (and the
// ParametersContext override) on the generated context prototypes.
import { RootContext } from "../../../src/parser/index";
import antlr4 from "antlr4";
import { default as sequenceParser } from "../../../src/generated-parser/sequenceParser";

export type FacetValue = string | null | { error: string };

export interface TextFacet {
  /** Positional path from the root, e.g. "prog.block.stat[0].message". */
  path: string;
  /** Context class name, e.g. "MessageContext", "AtomExprContext". */
  kind: string;
  getFormattedText: FacetValue;
  getText: FacetValue;
  /** Present only where the method is defined on the node. */
  getComment?: FacetValue;
}

export interface GoldenCase {
  id: string;
  code: string;
  facets: TextFacet[] | null;
}

function call(ctx: any, method: string): FacetValue {
  try {
    const value = ctx[method]();
    if (value === null || value === undefined) return null;
    return String(value);
  } catch (e: any) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

function ruleNameOf(ctx: any): string {
  const name = (sequenceParser as any).ruleNames[ctx.ruleIndex];
  return name ?? `rule#${ctx.ruleIndex}`;
}

function contextChildren(ctx: any): any[] {
  if (!ctx.children) return [];
  return ctx.children.filter(
    (c: any) => c instanceof (antlr4 as any).ParserRuleContext,
  );
}

/**
 * Path segment policy: a child is addressed by its grammar rule name; when two
 * or more siblings share the same rule name they get a 0-based index suffix
 * ("stat[0]", "stat[1]"), otherwise the bare rule name. Deterministic for any
 * tree with the same shape — the Langium facade walked by this same function
 * yields identical paths.
 */
export function collectFacetsFromTree(root: any): TextFacet[] {
  const facets: TextFacet[] = [];

  function visit(ctx: any, path: string): void {
    const facet: TextFacet = {
      path,
      kind: ctx.constructor.name,
      getFormattedText: call(ctx, "getFormattedText"),
      getText: call(ctx, "getText"),
    };
    if (typeof ctx.getComment === "function") {
      facet.getComment = call(ctx, "getComment");
    }
    facets.push(facet);

    const children = contextChildren(ctx);
    const totals = new Map<string, number>();
    for (const child of children) {
      const name = ruleNameOf(child);
      totals.set(name, (totals.get(name) ?? 0) + 1);
    }
    const seen = new Map<string, number>();
    for (const child of children) {
      const name = ruleNameOf(child);
      const i = seen.get(name) ?? 0;
      seen.set(name, i + 1);
      const segment = (totals.get(name) ?? 0) > 1 ? `${name}[${i}]` : name;
      visit(child, `${path}.${segment}`);
    }
  }

  visit(root, ruleNameOf(root));
  return facets;
}

/** Reference implementation: parse `code` with the live ANTLR parser and collect facets. */
export function collectTextFacets(code: string): TextFacet[] | null {
  const root = RootContext(code);
  if (!root) return null;
  return collectFacetsFromTree(root);
}

/** Explicit alias making the engine under test unambiguous in parity specs. */
export const collectTextFacetsWithAntlr = collectTextFacets;

/** Canonical byte-for-byte serialization shared by the regen script and the spec. */
export function serializeGoldenCase(
  id: string,
  code: string,
  facets: TextFacet[] | null,
): string {
  const golden: GoldenCase = { id, code, facets };
  return JSON.stringify(golden, null, 2) + "\n";
}
