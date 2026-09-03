import { createStore } from "jotai";
import { codeAtom } from "./store/Store";
import { RootContext } from "@/parser";

const store = createStore();

describe("index (store)", () => {
  it("should have title", () => {
    store.set(codeAtom, "title abcd");
    expect(store.get(codeAtom)).toBe("title abcd");
    expect(RootContext(store.get(codeAtom)).title()?.content()).toBe("abcd");
  });

  it("may not have title", () => {
    store.set(codeAtom, "title ");
    expect(store.get(codeAtom)).toBe("title ");
    expect(RootContext(store.get(codeAtom)).title()?.content()).toBe("");

    store.set(codeAtom, "A.m");
    expect(store.get(codeAtom)).toBe("A.m");
    expect(RootContext(store.get(codeAtom)).title()).toBeNull();

    store.set(codeAtom, "");
    expect(store.get(codeAtom)).toBe("");
    expect(RootContext(store.get(codeAtom)).title()).toBeNull();
  });
});
