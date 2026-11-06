import { useStore } from "jotai";
import { useEffect, useRef } from "react";
import type { InteractionState } from "./policy";

/**
 * Why the current state exits: a press outside its active surface (click-away
 * or gate B), or Escape.
 */
export type ExitCause =
  | { type: "press"; target: Element | null }
  | { type: "escape" };

export type ExitListener = (state: InteractionState, cause: ExitCause) => void;

type Store = ReturnType<typeof useStore>;
const exitListeners = new WeakMap<Store, Set<ExitListener>>();

/** The exit listeners registered for the diagram that owns `store`. */
export const exitListenersOf = (store: Store): Set<ExitListener> => {
  let set = exitListeners.get(store);
  if (!set) {
    set = new Set();
    exitListeners.set(store, set);
  }
  return set;
};

/**
 * Run `listener` just before the interaction state exits, while the owner
 * still sees the state it is leaving. The model exit itself is central
 * (`exitInteractionAtom`); a listener only adds the owner's side effects.
 */
export const useInteractionExit = (listener: ExitListener) => {
  const store = useStore();
  const ref = useRef(listener);
  ref.current = listener;
  useEffect(() => {
    const call: ExitListener = (state, cause) => ref.current(state, cause);
    const listeners = exitListenersOf(store);
    listeners.add(call);
    return () => {
      listeners.delete(call);
    };
  }, [store]);
};
