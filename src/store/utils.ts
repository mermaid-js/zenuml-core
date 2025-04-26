import { SetStateAction, useSetAtom } from "jotai";
import { Setter } from "jotai";
import { atom, Getter } from "jotai";
import { useEffect } from "react";

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

export const atomWithCallback = <T>(
  value: T,
  listener: (get: Getter, value: T) => void,
) => {
  const baseAtom = atom(value);
  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, update: T) => {
      set(baseAtom, update);
      listener(get, update);
    },
  );
  return derivedAtom;
};

type Listener<Value> = (
  get: Getter,
  set: Setter,
  newVal: Value,
  prevVal: Value,
) => void;

export function atomWithListeners<Value>(initialValue: Value) {
  const baseAtom = atom(initialValue);
  const listenersAtom = atom<Listener<Value>[]>([]);
  const anAtom = atom(
    (get) => get(baseAtom),
    (get, set, arg: SetStateAction<Value>) => {
      const prevVal = get(baseAtom);
      set(baseAtom, arg);
      const newVal = get(baseAtom);
      get(listenersAtom).forEach((callback) => {
        callback(get, set, newVal, prevVal);
      });
    },
  );
  const useListener = (callback: Listener<Value>) => {
    const setListeners = useSetAtom(listenersAtom);
    useEffect(() => {
      setListeners((prev) => [...prev, callback]);
      return () =>
        setListeners((prev) => {
          const index = prev.indexOf(callback);
          return [...prev.slice(0, index), ...prev.slice(index + 1)];
        });
    }, [setListeners, callback]);
  };
  return [anAtom, listenersAtom, useListener] as const;
}
