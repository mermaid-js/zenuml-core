import { createStore } from "jotai";
import { codeAtom, progVMAtom } from "./store/Store";

const store = createStore();

describe("index (store)", () => {
  it("should have title", () => {
    store.set(codeAtom, "title abcd");
    expect(store.get(codeAtom)).toBe("title abcd");
    const progVM = store.get(progVMAtom);
    const titleVM = progVM.titleVM;
    expect(titleVM?.text).toBe("abcd");
  });

  it("may not have title", () => {
    store.set(codeAtom, "title ");
    expect(store.get(codeAtom)).toBe("title ");
    const progVM1 = store.get(progVMAtom);
    const titleVM1 = progVM1.titleVM;
    expect(titleVM1?.text).toBe("");

    store.set(codeAtom, "A.m");
    expect(store.get(codeAtom)).toBe("A.m");
    const progVM2 = store.get(progVMAtom);
    const titleVM2 = progVM2.titleVM;
    expect(titleVM2).toBeUndefined();

    store.set(codeAtom, "");
    expect(store.get(codeAtom)).toBe("");
    const progVM3 = store.get(progVMAtom);
    const titleVM3 = progVM3.titleVM;
    expect(titleVM3).toBeUndefined();
  });
});
