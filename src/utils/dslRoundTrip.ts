import { parse } from "@/parser";

// Shared pieces of the "edit the DSL, re-parse, read it back" check used by
// the participant rename and style transforms.

export const squash = (text: string | undefined | null): string =>
  (text ?? "").replace(/\s+/g, "");

/** Declaration attributes both transforms must preserve. `name` is left out
 * because a rename changes it on purpose; callers that keep the name add it. */
export const DECLARATION_KEYS = [
  "type",
  "stereotype",
  "emoji",
  "width",
  "label",
  "color",
] as const;

type Declaration = Partial<Record<string, string | null | undefined>>;

export const sameDeclaration = <K extends string = (typeof DECLARATION_KEYS)[number]>(
  a: Partial<Record<K, string | null | undefined>>,
  b: Partial<Record<K, string | null | undefined>>,
  keys: readonly K[] = DECLARATION_KEYS as unknown as readonly K[],
): boolean => keys.every((key) => squash(a[key]) === squash(b[key]));

export type ParseSnapshot = {
  pass: boolean;
  errors: number;
  rootContext: any;
};

/** `parse` is the silent, reentrant entry point. Returns null when it throws. */
export const safeParse = (code: string): ParseSnapshot | null => {
  try {
    const parsed = parse(code);
    return {
      pass: !!parsed.pass,
      errors: parsed.errorDetails?.length ?? 0,
      rootContext: parsed.rootContext,
    };
  } catch {
    return null;
  }
};

/**
 * A clean base must stay clean; a broken base may not gain errors. A base that
 * could not be parsed at all (`null`) accepts only an error-free result.
 */
export const parseNotWorse = (
  base: ParseSnapshot | null,
  next: ParseSnapshot,
): boolean => (base?.pass ? next.pass : next.errors <= (base?.errors ?? 0));

export type { Declaration };
