/**
 * A `new` with no class name yet (`new`, `new { m }`) declares no participant
 * and draws no arrow (#673). Its statements are still real, so a block lists
 * them in its place: the nameless creation takes no number and is not a
 * sender. The parse tree itself is untouched.
 */

/** True for a creation context whose class name is missing. */
export function isNamelessCreation(ctx: any): boolean {
  return !!ctx && typeof ctx.creationBody === "function" && !ctx.Constructor();
}

/** Replace each nameless creation by the statements of its own body. */
export function hoistNamelessCreations(stats: any[]): any[] {
  const out: any[] = [];
  for (const stat of stats) {
    const creation = stat?.creation?.();
    if (isNamelessCreation(creation)) {
      // The body block's `stat()` is already hoisted.
      out.push(...(creation.braceBlock?.()?.block?.()?.stat?.() ?? []));
    } else {
      out.push(stat);
    }
  }
  return out;
}
