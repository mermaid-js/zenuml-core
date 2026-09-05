import { atom } from "jotai";

/** Not yet read from storage — distinct from a stored `undefined`. */
const UNREAD = Symbol("unread");

/**
 * An atom backed by localStorage.
 *
 * The key is a function and storage is read on first use, not at module load.
 * Reading eagerly made importing this module — and therefore the package entry
 * and its `renderToSvg` export — throw `ReferenceError: location is not
 * defined` in Node, and throw in a browser configured to block site data.
 *
 * The first read is memoized per atom, matching the previous behaviour where
 * the initial value was computed once and shared by every store.
 */
export const atomWithLocalStorage = <T>(key: () => string, initialValue: T) => {
  let cached: { value: T } | undefined;

  const readInitialValue = (): T => {
    if (cached) return cached.value;
    let value = initialValue;
    try {
      const item = localStorage.getItem(key());
      if (item !== null) value = JSON.parse(item);
    } catch {
      // No storage available (Node, private browsing, blocked site data) or
      // an unparsable entry: fall back to the supplied default.
    }
    cached = { value };
    return value;
  };

  const baseAtom = atom<T | typeof UNREAD>(UNREAD);
  const resolve = (stored: T | typeof UNREAD): T =>
    stored === UNREAD ? readInitialValue() : stored;

  const derivedAtom = atom(
    (get) => resolve(get(baseAtom)),
    (get, set, update: T) => {
      const nextValue =
        typeof update === "function" ? update(resolve(get(baseAtom))) : update;
      set(baseAtom, nextValue);
      try {
        localStorage.setItem(key(), JSON.stringify(nextValue));
      } catch {
        // Storage unavailable — keep the in-memory value.
      }
      cached = { value: nextValue };
    },
  );
  return derivedAtom;
};

export const atomWithFunctionValue = <T extends Function>(value: T) => {
  const baseAtom = atom({ fn: value });
  const derivedAtom = atom(
    (get) => get(baseAtom).fn,
    (_, set, update: T) => {
      set(baseAtom, { fn: update });
    },
  );
  return derivedAtom;
};
