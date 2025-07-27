import { createStore } from "jotai";
import { codeAtom, titleAtom } from "./store/Store";

const store = createStore();

describe("index (store)", () => {
  it("should have title", () => {
    store.set(codeAtom, "title abcd");
    expect(store.get(codeAtom)).toBe("title abcd");
    expect(store.get(titleAtom)).toBe("abcd");
  });

  it("may not have title", () => {
    store.set(codeAtom, "title ");
    expect(store.get(codeAtom)).toBe("title ");
    expect(store.get(titleAtom)).toBe("");

    store.set(codeAtom, "A.m");
    expect(store.get(codeAtom)).toBe("A.m");
    expect(store.get(titleAtom)).toBeUndefined();

    store.set(codeAtom, "");
    expect(store.get(codeAtom)).toBe("");
    expect(store.get(titleAtom)).toBeUndefined();
  });
});
