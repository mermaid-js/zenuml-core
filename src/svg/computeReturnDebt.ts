/**
 * Compute per-statement Y adjustment to compensate for ReturnStatementVM.height=0.
 *
 * In the positioning engine, non-self return statements have height=0, but in HTML
 * they render as ~16px elements. This function walks the DFS-ordered statement list
 * and computes how much each statement's coord.top should be increased.
 *
 * The debt is scoped per block (identified by depth). When a block ends (depth decreases),
 * its accumulated debt propagates to the parent block — because the parent sync/creation
 * statement's coord.height is underestimated by the same amount.
 *
 * Returns a Map with:
 *   key -> adjustment for coord.top
 *   "inner:key" -> total inner debt for sync/creation statements (for occurrence height)
 *   "__totalDebt__" -> total root debt for diagram height adjustment
 */
import type { StatementInfo } from "./walkStatements";

export function computeReturnDebt(
  statements: StatementInfo[],
  returnHeight: number,
): Map<string, number> {
  const result = new Map<string, number>();

  // Stack tracks per-depth cumulative debt. Index = depth.
  const debtByDepth: number[] = [0];
  let maxDepth = 0;

  // Track which sync/creation statements own each depth level
  // so we can assign inner debt when closing their blocks
  const blockOwnerKeys: (string | null)[] = [null]; // depth 0 = root (no owner)

  for (const info of statements) {
    const depth = info.depth;

    // When depth decreases, close child blocks and propagate debt upward
    while (maxDepth > depth) {
      const closedDebt = debtByDepth[maxDepth] || 0;
      const ownerKey = blockOwnerKeys[maxDepth];
      // Record inner debt on the block owner (for occurrence height adjustment)
      if (ownerKey) {
        result.set(`inner:${ownerKey}`, closedDebt);
      }
      debtByDepth.pop();
      blockOwnerKeys.pop();
      maxDepth--;
      // Propagate: parent block's subsequent statements are affected.
      // Scale by 0.75 — the CSS layout doesn't grow 1:1 with the positioning engine's
      // cursor advancement due to margin collapsing and BFC effects. Full propagation
      // overshoots by ~10px per block depth. 0.75 is empirically calibrated.
      debtByDepth[maxDepth] = (debtByDepth[maxDepth] || 0) + Math.round(closedDebt * 0.75);
    }

    // When depth increases, start fresh debt tracking for new block
    while (maxDepth < depth) {
      maxDepth++;
      debtByDepth.push(0);
      blockOwnerKeys.push(null);
    }

    // Total adjustment = sum of all debt across all depths
    let totalDebt = 0;
    for (let d = 0; d <= depth; d++) {
      totalDebt += debtByDepth[d] || 0;
    }
    result.set(info.key, totalDebt);

    // Non-self returns add debt at their depth
    if (info.kind === "return" && !info.isSelf) {
      debtByDepth[depth] += returnHeight;
    }

    // Sync/creation with blocks: the NEXT statement in the flat list at depth+1
    // belongs to this statement's block. Record owner for debt propagation.
    if ((info.kind === "sync" || info.kind === "creation") && info.hasBlock) {
      // The next depth level's block belongs to this statement
      if (depth + 1 > maxDepth) {
        maxDepth = depth + 1;
        debtByDepth.push(0);
        blockOwnerKeys.push(info.key);
      } else {
        blockOwnerKeys[depth + 1] = info.key;
        debtByDepth[depth + 1] = 0; // reset for new block
      }
    }
  }

  // Close remaining open blocks (same 0.75 propagation factor as main loop)
  while (maxDepth > 0) {
    const closedDebt = debtByDepth[maxDepth] || 0;
    const ownerKey = blockOwnerKeys[maxDepth];
    if (ownerKey) {
      result.set(`inner:${ownerKey}`, closedDebt);
    }
    debtByDepth.pop();
    blockOwnerKeys.pop();
    maxDepth--;
    debtByDepth[maxDepth] = (debtByDepth[maxDepth] || 0) + Math.round(closedDebt * 0.75);
  }

  // Store total root debt for diagram height adjustment
  result.set("__totalDebt__", debtByDepth[0] || 0);

  return result;
}
