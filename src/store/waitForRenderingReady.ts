import type { createStore } from "jotai";
import { renderingReadyAtom } from "./Store";

type Store = ReturnType<typeof createStore>;

/**
 * Resolve once the diagram has finished mounting.
 *
 * `renderingReadyAtom` turns true when every lifeline has reported itself
 * ready, so the wait is: subscribe, kick off the render, and resolve on the
 * first notification that finds the atom true.
 *
 * `store.sub` returns an unsubscribe function (jotai
 * `esm/vanilla/internals.d.mts`: `sub: (atom, listener) => () => void`).
 * Calling it is what keeps a long-lived instance from accumulating one
 * listener per render — the reason this wait lives in its own module with its
 * own test rather than inline in ZenUml.doRender, which cannot be exercised
 * without mounting React.
 *
 * @param store   the instance's jotai store
 * @param beginRender  writes the new code; called after the subscription is in
 *                     place so no readiness notification can be missed
 */
export function waitForRenderingReady(
  store: Store,
  beginRender: () => void,
): Promise<void> {
  return new Promise((resolve) => {
    // Held in an object rather than a `let` the listener closes over, so the
    // unsubscribe is reachable from the listener without depending on jotai
    // never invoking it synchronously from within `sub`.
    const subscription: { off?: () => void } = {};
    const stopWhenReady = () => {
      if (store.get(renderingReadyAtom)) {
        subscription.off?.();
        resolve();
      }
    };
    subscription.off = store.sub(renderingReadyAtom, stopWhenReady);
    beginRender();
    // A notification only arrives when the atom's value CHANGES. Rendering a
    // document with no participants leaves it true throughout (0 lifelines ===
    // 0 participants), so without this check the wait would never end.
    stopWhenReady();
  });
}
