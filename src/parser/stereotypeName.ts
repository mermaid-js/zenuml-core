import type { NameContext, StereotypeContext } from "./ir/contract";

/**
 * The words of a `<<stereotype>>`, in source order. Empty for a bare `<<`,
 * `<<>>` or a missing stereotype.
 */
export const stereotypeNames = (
  ctx: StereotypeContext | null | undefined,
): NameContext[] => ctx?.name?.() ?? [];

/**
 * The stereotype text as the renderer shows it: each word's formatted text
 * (quotes stripped), joined by single spaces — so `<<a b>>`, `<< a   b >>`
 * and `<<"a b">>` all read `a b`. `undefined` when there is no word.
 */
export const stereotypeName = (
  ctx: StereotypeContext | null | undefined,
): string | undefined => {
  const names = stereotypeNames(ctx);
  if (names.length === 0) return undefined;
  return names.map((name) => name.getFormattedText()).join(" ");
};

/**
 * `[first, last]` word of the stereotype for source-range reads; both
 * `undefined` when there is no word.
 */
export const stereotypeNameRange = (
  ctx: StereotypeContext | null | undefined,
): [NameContext | undefined, NameContext | undefined] => {
  const names = stereotypeNames(ctx);
  return [names[0], names[names.length - 1]];
};
