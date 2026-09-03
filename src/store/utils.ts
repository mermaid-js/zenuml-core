import { atom } from "jotai";

export const atomWithLocalStorage = <T>(key: string, initialValue: T) => {
  const getInitialValue = (): T => {
    const item = localStorage.getItem(key);
    if (item !== null) {
      return JSON.parse(item);
    }
    return initialValue;
  };
  const baseAtom = atom(getInitialValue());
  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, update: T) => {
      const nextValue =
        typeof update === "function" ? update(get(baseAtom)) : update;
      set(baseAtom, nextValue);
      localStorage.setItem(key, JSON.stringify(nextValue));
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
