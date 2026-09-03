/** Union of all supported statement types. */
export type StatementKind =
  | "loop"
  | "alt"
  | "par"
  | "opt"
  | "section"
  | "critical"
  | "tcf"
  | "ref"
  | "creation"
  | "sync"
  | "async"
  | "divider"
  | "return"
  | "empty";

/**
 * The fragment kinds the grammar models as a keyword plus one braced block.
 *
 * `sequenceParser.g4` declares `stat : alt | par | opt | critical | section |
 * ref | loop | creation | message | asyncMessage EVENT_END? | ret | divider |
 * tcf ;` — a single alternative per stat, so at most one of these accessors
 * ever returns a context. Probing them in any order finds the same fragment,
 * which is why the call sites below can share one tuple despite having used
 * three different orders before.
 */
export const SINGLE_BLOCK_FRAGMENT_KINDS = [
  "loop",
  "opt",
  "par",
  "section",
  "critical",
] as const;

export type SingleBlockFragmentKind =
  (typeof SINGLE_BLOCK_FRAGMENT_KINDS)[number];
