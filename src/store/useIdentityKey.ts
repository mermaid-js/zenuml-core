import { useAtomValue } from "jotai";
import { identityKeysAtom } from "./Store";

/**
 * The identity key of a statement (ADR 0009, G7), looked up from the
 * statement context or from the context of its single alternative
 * (`stat.message()`, `stat.creation()`, `stat.alt()`...), whose parent is the
 * statement.
 *
 * Use it in place of the context object wherever state should survive a
 * re-parse: every parse creates new contexts, but a statement keeps its key
 * while the text around it changes. When no key exists (a context from a
 * parse the store has not seen), the context itself is returned, which keeps
 * the old per-parse behaviour.
 */
export const useIdentityKey = (context: any): unknown => {
  const keys = useAtomValue(identityKeysAtom);
  return keys.get(context) ?? keys.get(context?.parentCtx) ?? context;
};
