import { describe, expect, it } from "vitest";
import { createStore } from "jotai";
import { waitForRenderingReady } from "./waitForRenderingReady";
import { codeAtom, lifelineReadyAtom, renderingReadyAtom } from "./Store";

/**
 * Counts subscriptions to renderingReadyAtom on a real store, so a leak is
 * observable without mounting React (ZenUml.doRender cannot be driven to
 * completion outside a browser — see the skipped render test in core.spec.ts).
 */
function trackReadySubscriptions(store: ReturnType<typeof createStore>) {
  const originalSub = store.sub.bind(store);
  const counts = { opened: 0, closed: 0 };
  store.sub = ((atom: unknown, listener: () => void) => {
    const off = originalSub(atom as never, listener);
    if (atom !== renderingReadyAtom) return off;
    counts.opened++;
    return () => {
      counts.closed++;
      off();
    };
  }) as typeof store.sub;
  return counts;
}

/** Drive one render: two participants report ready one after the other. */
async function renderOnce(
  store: ReturnType<typeof createStore>,
  code: string,
  participants: string[],
) {
  store.set(lifelineReadyAtom, []);
  const done = waitForRenderingReady(store, () => store.set(codeAtom, code));
  const ready: string[] = [];
  for (const name of participants) {
    ready.push(name);
    store.set(lifelineReadyAtom, [...ready]);
  }
  await done;
}

describe("waitForRenderingReady", () => {
  it("resolves once every lifeline has reported ready", async () => {
    const store = createStore();
    await renderOnce(store, "A.method() { B.reply() }", ["A", "B"]);
    expect(store.get(renderingReadyAtom)).toBe(true);
  });

  it("does not resolve while lifelines are still missing", async () => {
    const store = createStore();
    store.set(lifelineReadyAtom, []);
    let resolved = false;
    const done = waitForRenderingReady(store, () =>
      store.set(codeAtom, "A.method() { B.reply() }"),
    ).then(() => {
      resolved = true;
    });

    store.set(lifelineReadyAtom, ["A"]); // one of two
    await Promise.resolve();
    expect(resolved).toBe(false);

    store.set(lifelineReadyAtom, ["A", "B"]);
    await done;
    expect(resolved).toBe(true);
  });

  it("resolves when readiness already holds before the wait begins", async () => {
    // A document with no participants is ready the moment lifelineReadyAtom is
    // emptied: 0 lifelines === 0 participants. Rendering a second such
    // document leaves renderingReadyAtom true across the whole wait, so no
    // notification is ever emitted and only an explicit check can end it.
    const store = createStore();
    store.set(lifelineReadyAtom, []);
    store.set(codeAtom, "// a comment, no participants");
    expect(store.get(renderingReadyAtom)).toBe(true);

    store.set(lifelineReadyAtom, []);
    let resolved = false;
    const done = waitForRenderingReady(store, () =>
      store.set(codeAtom, "// another comment, still no participants"),
    ).then(() => {
      resolved = true;
    });

    await Promise.race([done, new Promise((r) => setTimeout(r, 200))]);
    expect(resolved).toBe(true);
  });

  it("leaves no subscription behind across repeated renders", async () => {
    // The defect this guards: store.sub returns an unsubscribe function, and
    // discarding it left one listener per render alive for the lifetime of
    // the ZenUml instance — one per keystroke in a live editor.
    const store = createStore();
    const counts = trackReadySubscriptions(store);

    await renderOnce(store, "A.first() { B.reply() }", ["A", "B"]);
    await renderOnce(store, "A.second() { B.reply() }", ["A", "B"]);
    await renderOnce(store, "A.third() { B.reply() }", ["A", "B"]);

    expect(counts.opened).toBe(3);
    expect(counts.closed).toBe(3);
  });

  it("stops notifying after it has resolved", async () => {
    const store = createStore();
    let notifications = 0;
    const originalSub = store.sub.bind(store);
    store.sub = ((atom: unknown, listener: () => void) =>
      originalSub(atom as never, () => {
        notifications++;
        listener();
      })) as typeof store.sub;

    await renderOnce(store, "A.method() { B.reply() }", ["A", "B"]);
    const afterResolve = notifications;

    // A later write to the same dependency must not reach the listener.
    store.set(lifelineReadyAtom, ["A"]);
    store.set(lifelineReadyAtom, ["A", "B"]);
    expect(notifications).toBe(afterResolve);
  });
});
