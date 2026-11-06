import { afterEach, describe, expect, it } from "vitest";
import { createStore } from "jotai";
import { atomWithLocalStorage } from "./utils";

/**
 * The guard here is laziness. Reading storage while the module was being
 * evaluated made `import "@zenuml/core"` throw `ReferenceError: location is
 * not defined` in Node, which also put the package's own `renderToSvg` export
 * out of reach server-side.
 *
 * No spies: the suite runs under both bun:test and vitest, whose spy-restore
 * semantics differ. Failure is simulated through a key function that throws,
 * which enters the same catch that covers an absent or blocked localStorage.
 */
describe("atomWithLocalStorage", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("does not build the key until the atom is read", () => {
    let keyBuilt = 0;
    const anAtom = atomWithLocalStorage(() => {
      keyBuilt++;
      return "lazy-key";
    }, "fallback");

    // Nothing has touched storage yet — this is what lets the module import
    // in an environment that has none.
    expect(keyBuilt).toBe(0);

    const store = createStore();
    expect(store.get(anAtom)).toBe("fallback");
    expect(keyBuilt).toBe(1);
  });

  it("reads storage only once, however often the atom is read", () => {
    let keyBuilt = 0;
    const anAtom = atomWithLocalStorage(() => {
      keyBuilt++;
      return "memo-key";
    }, "fallback");
    const store = createStore();

    store.get(anAtom);
    store.get(anAtom);
    store.get(anAtom);
    expect(keyBuilt).toBe(1);
  });

  it("returns the stored value when one exists", () => {
    localStorage.setItem("stored-key", JSON.stringify("from-storage"));
    const anAtom = atomWithLocalStorage(() => "stored-key", "fallback");
    expect(createStore().get(anAtom)).toBe("from-storage");
  });

  it("writes through to storage on update", () => {
    const anAtom = atomWithLocalStorage(() => "write-key", 1);
    const store = createStore();
    store.set(anAtom, 42);
    expect(store.get(anAtom)).toBe(42);
    expect(localStorage.getItem("write-key")).toBe("42");
  });

  it("falls back to the default when storage is unreachable", () => {
    const anAtom = atomWithLocalStorage(() => {
      throw new Error("no storage here");
    }, "fallback");
    expect(createStore().get(anAtom)).toBe("fallback");
  });

  it("keeps the in-memory value when a write cannot be persisted", () => {
    const anAtom = atomWithLocalStorage<string>(() => {
      throw new Error("no storage here");
    }, "before");
    const store = createStore();
    store.set(anAtom, "after");
    expect(store.get(anAtom)).toBe("after");
  });

  it("ignores an unparsable stored entry", () => {
    localStorage.setItem("corrupt-key", "{not json");
    const anAtom = atomWithLocalStorage(() => "corrupt-key", "fallback");
    expect(createStore().get(anAtom)).toBe("fallback");
  });
});
