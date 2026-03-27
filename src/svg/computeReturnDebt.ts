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
 */
import type { VerticalCoordinates } from "@/positioning/VerticalCoordinates";
import type { walkStatements } from "./walkStatements";

export function computeReturnDebt(
  statements: ReturnType<typeof walkStatements>,
  verticalCoordinates: VerticalCoordinates,
  returnHeight: number,
): Map<string, number> {
  const result = new Map<string, number>();

  // Stack tracks per-depth cumulative debt. Index = depth.
  const debtByDepth: number[] = [0];
  // Track only direct returns at each depth (excludes child-propagated debt)
  const directDebtByDepth: number[] = [0];
  let maxDepth = 0;

  // Track which sync/creation statements own each depth level
  // so we can assign inner debt when closing their blocks
  const blockOwnerKeys: (string | null)[] = [null]; // depth 0 = root (no owner)
  const blockOwnerKinds: (string | null)[] = [null]; // "sync" | "creation" | null
  // Track whether each block has non-return children (for mixed-content detection)
  const hasNonReturnChild: boolean[] = [false];
  // Non-block assignment shift: tracks +1px CSS height excess per depth.
  // This shifts subsequent statements down but does NOT propagate as inner debt
  // (parent occurrences shouldn't grow for this).
  const nbAssignShift: number[] = [0];
  // Track whether each block owner has an assignment return (+5px compensation).
  // The positioning engine adds +11 for assignment returns, but HTML renders ~16px.
  // This +5 gap must be propagated as debt so subsequent statements shift down.
  const blockHasAssignment: boolean[] = [false];

  for (const info of statements) {
    const depth = info.depth;

    // When depth decreases, close child blocks and propagate debt upward
    while (maxDepth > depth) {
      const closedDebt = debtByDepth[maxDepth] || 0;
      const ownerKey = blockOwnerKeys[maxDepth];
      const ownerKind = blockOwnerKinds[maxDepth];
      const directDebt = directDebtByDepth[maxDepth] || 0;
      // Record inner debt on the block owner (for occurrence height).
      // Two components:
      // 1. nestedDebt: debt propagated from child blocks (closedDebt - directDebt).
      //    The parent occurrence must grow to contain child content that the
      //    positioning engine underestimates.
      // 2. directShift: when 2+ direct returns exist at the same depth, each
      //    return's debt shifts the NEXT return down via the adjust mechanism.
      //    The last return is shifted by (N-1)*returnHeight = directDebt - returnHeight.
      //    The occurrence must grow to contain this shifted last return.
      // A single direct return has directShift=0 (its own debt doesn't shift itself).
      const nestedDebt = closedDebt - directDebt;
      const directShift = Math.max(directDebt - returnHeight, 0);
      const occInnerDebt = nestedDebt + directShift;
      if (ownerKey && occInnerDebt > 0) {
        result.set(`inner:${ownerKey}`, occInnerDebt);
      }
      // Record whether block had mixed content (returns + non-return children).
      // Return-only blocks don't get the CSS border +1px correction.
      const hasMixed = hasNonReturnChild[maxDepth] || false;
      if (ownerKey && hasMixed) {
        result.set(`mixed:${ownerKey}`, 1);
      }
      const hasAssign = blockHasAssignment[maxDepth] || false;
      debtByDepth.pop();
      directDebtByDepth.pop();
      blockOwnerKeys.pop();
      blockOwnerKinds.pop();
      hasNonReturnChild.pop();
      blockHasAssignment.pop();
      nbAssignShift.pop();
      maxDepth--;
      // Propagate the occurrence's actual inner growth to the parent depth,
      // so subsequent statements are shifted down to match HTML CSS layout.
      // Using occInnerDebt (not raw directDebt) prevents over-counting when
      // the positioning engine already allocates height for some returns.
      if (ownerKey && ownerKind === "sync") {
        debtByDepth[maxDepth] += occInnerDebt;
        // Assignment return compensation: the occurrence gets +4 (12→16px gap),
        // but the positioning engine doesn't account for this extra height.
        // Propagate it as debt so subsequent statements shift down to match HTML.
        if (hasAssign) {
          debtByDepth[maxDepth] += 4;
        }
      }
    }

    // When depth increases, start fresh debt tracking for new block
    while (maxDepth < depth) {
      maxDepth++;
      debtByDepth.push(0);
      directDebtByDepth.push(0);
      blockOwnerKeys.push(null);
      blockOwnerKinds.push(null);
      hasNonReturnChild.push(false);
      blockHasAssignment.push(false);
      nbAssignShift.push(0);
    }

    // Fragment section boundary: reset debt at this depth.
    // Each fragment section (if/else, try/catch/finally) is independent in HTML CSS.
    // Without reset, returns in earlier sections inflate Y positions of later sections.
    if (info.sectionReset && depth < debtByDepth.length) {
      debtByDepth[depth] = 0;
      directDebtByDepth[depth] = 0;
    }

    // Total adjustment = sum of all debt across all depths
    // Include nbAssignShift (non-propagating) for Y positioning
    let totalDebt = 0;
    for (let d = 0; d <= depth; d++) {
      totalDebt += (debtByDepth[d] || 0) + (nbAssignShift[d] || 0);
    }
    result.set(info.key, totalDebt);

    // Non-self returns add debt at their depth — but only when the positioning
    // engine gives them height=0. The first return at a depth typically gets
    // coord.height>0 (the engine allocates 16px), so it doesn't need debt.
    // Subsequent returns at the same depth get height=0 and need debt.
    if (info.kind === "return" && !info.isSelf) {
      const returnCoord = verticalCoordinates.getStatementCoordinate(info.key);
      const engineAllocatesHeight = returnCoord && returnCoord.height > 0;
      if (!engineAllocatesHeight) {
        const isFirstAtDepth = (directDebtByDepth[depth] || 0) === 0;
        debtByDepth[depth] += returnHeight;
        directDebtByDepth[depth] += returnHeight;
        // When the first return in a sync block has adjust>0 (from child-block
        // debt), it uses returnOffset=16 instead of 15. This removes the 15→16
        // transition that normally adds +1px to the gap between consecutive
        // returns. Compensate with +1 via nbAssignShift (non-propagating) to
        // avoid inflating inner debt / occurrence height calculations.
        if (isFirstAtDepth && totalDebt !== 0 && info.parentBlockKind === "sync") {
          nbAssignShift[depth] = (nbAssignShift[depth] || 0) + 1;
        }
      }
    } else if (info.kind !== "return") {
      // Track that this block has non-return children
      if (depth < hasNonReturnChild.length) {
        hasNonReturnChild[depth] = true;
      }
    }

    // Non-block sync with assignment: with cursor+=12, the positioning engine's
    // coord.height now matches HTML's CSS container height (both ~50px).
    // No shift needed — the gap was from the old cursor+=11.

    // Sync/creation with blocks: the NEXT statement in the flat list at depth+1
    // belongs to this statement's block. Record owner for debt propagation.
    if ((info.kind === "sync" || info.kind === "creation") && info.hasBlock) {
      // Check if this sync has an assignment return (e.g. `ret = B.method { ... }`)
      const msgCtx = info.statNode?.message?.();
      const hasAssign = !!(msgCtx?.Assignment?.()?.assignee) && !info.isSelf;
      // The next depth level's block belongs to this statement
      if (depth + 1 > maxDepth) {
        maxDepth = depth + 1;
        debtByDepth.push(0);
        directDebtByDepth.push(0);
        blockOwnerKeys.push(info.key);
        blockOwnerKinds.push(info.kind);
        hasNonReturnChild.push(false);
        blockHasAssignment.push(hasAssign);
      } else {
        blockOwnerKeys[depth + 1] = info.key;
        blockOwnerKinds[depth + 1] = info.kind;
        debtByDepth[depth + 1] = 0; // reset for new block
        directDebtByDepth[depth + 1] = 0;
        hasNonReturnChild[depth + 1] = false;
        blockHasAssignment[depth + 1] = hasAssign;
      }
    }
  }

  // Close remaining open blocks (same propagation rules as main loop)
  while (maxDepth > 0) {
    const closedDebt = debtByDepth[maxDepth] || 0;
    const ownerKey = blockOwnerKeys[maxDepth];
    const ownerKind = blockOwnerKinds[maxDepth];
    const directDebtEnd = directDebtByDepth[maxDepth] || 0;
    const nestedDebtEnd = closedDebt - directDebtEnd;
    const directShiftEnd = Math.max(directDebtEnd - returnHeight, 0);
    const occInnerDebtEnd = nestedDebtEnd + directShiftEnd;
    if (ownerKey && occInnerDebtEnd > 0) {
      result.set(`inner:${ownerKey}`, occInnerDebtEnd);
    }
    const hasMixedEnd = hasNonReturnChild[maxDepth] || false;
    if (ownerKey && hasMixedEnd) {
      result.set(`mixed:${ownerKey}`, 1);
    }
    const hasAssignEnd = blockHasAssignment[maxDepth] || false;
    debtByDepth.pop();
    directDebtByDepth.pop();
    blockOwnerKeys.pop();
    blockOwnerKinds.pop();
    hasNonReturnChild.pop();
    blockHasAssignment.pop();
    maxDepth--;
    // Propagate occurrence inner growth — see main loop comment
    if (ownerKey && ownerKind === "sync") {
      debtByDepth[maxDepth] += occInnerDebtEnd;
      if (hasAssignEnd) {
        debtByDepth[maxDepth] += 4;
      }
    }
  }

  // Store total root debt for diagram height adjustment
  result.set("__totalDebt__", debtByDepth[0] || 0);

  return result;
}
