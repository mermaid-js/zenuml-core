/** Stable key derived from the parser token range so we can map coordinates back to AST nodes. */
export type StatementKey = string;

/**
 * Collapses an ANTLR context into a deterministic key. The start/stop indices
 * stay stable across server and browser runs which guarantees consistent lookups.
 */
export const createStatementKey = (ctx: any): StatementKey => {
  if (!ctx?.start || !ctx?.stop) {
    return "";
  }
  return `${ctx.start.start}-${ctx.stop.stop}`;
};
